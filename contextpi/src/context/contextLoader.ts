/**
 * Dynamic MongoDB Context Loader
 * Connects to MongoDB, queries metadata collections, and ingests
 * dynamic application context for a given projectName.
 * Credentials are never logged. Path and collection strategies are configurable.
 */

import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import { ProjectContext, SchemaContext, FunctionContext } from '../types/context.js';
import { validateProjectContext } from '../types/validation.js';
import { normalizeSchema, normalizeFunctionContext, normalizeSampleRecord } from './contextNormalizer.js';

export class ContextLoaderError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(`[ContextLoaderError] ${message}`);
    this.name = 'ContextLoaderError';
  }
}

export interface MongoContextLoaderOptions {
  mongodbUri?: string;
  databaseName?: string;
  timeoutMs?: number;
  schemasCollection?: string;
  functionsCollection?: string;
  client?: MongoClient;
}

/**
 * Sanitizes MongoDB URI to ensure credentials are never logged or exposed.
 */
export function sanitizeMongoUri(uri: string): string {
  try {
    return uri.replace(/\/\/(.*?)@/, '//****:****@');
  } catch {
    return 'mongodb://****:****@masked';
  }
}

export class MongoContextLoader {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private readonly uri: string;
  private readonly dbName: string;
  private readonly timeoutMs: number;
  private schemasCollName: string;
  private functionsCollName: string;

  constructor(options: MongoContextLoaderOptions = {}) {
    this.uri = options.mongodbUri || process.env.MONGODB_URI || 'mongodb://localhost:27017';
    this.dbName = options.databaseName || process.env.MONGODB_DATABASE || 'nexasupply_db';
    this.timeoutMs = options.timeoutMs || 5000;
    this.schemasCollName = options.schemasCollection || process.env.SCHEMA_METADATA_COLLECTION || 'schemas';
    this.functionsCollName = options.functionsCollection || process.env.FUNCTION_METADATA_COLLECTION || 'functions';

    if (options.client) {
      this.client = options.client;
      this.db = this.client.db(this.dbName);
    }
  }

  public async connect(): Promise<void> {
    if (this.client && this.db) {
      return;
    }

    try {
      const clientOpts: MongoClientOptions = {
        serverSelectionTimeoutMS: this.timeoutMs,
        connectTimeoutMS: this.timeoutMs
      };
      this.client = new MongoClient(this.uri, clientOpts);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
    } catch (err: unknown) {
      const sanitized = sanitizeMongoUri(this.uri);
      this.logSanitizedDiagnostic(err);
      throw new ContextLoaderError(
        `Failed to connect to MongoDB at '${sanitized}' (DB: '${this.dbName}')`,
        err
      );
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
      } finally {
        this.client = null;
        this.db = null;
      }
    }
  }

  public async isConnected(): Promise<boolean> {
    if (!this.db) return false;
    try {
      await this.db.command({ ping: 1 });
      return true;
    } catch {
      return false;
    }
  }

  private logSanitizedDiagnostic(err: unknown): void {
    let host = 'localhost';
    let port = '27017';
    try {
      const parsed = new URL(this.uri);
      host = parsed.hostname || 'localhost';
      port = parsed.port || '27017';
    } catch {
      // ignore URL parse failure
    }

    const errObj = err as any;
    const errName = errObj?.name || 'Error';
    const errMsg = errObj?.message || String(err);
    const errCode = errObj?.code || 'UNKNOWN';

    console.error(`[Contextπ MongoDB Diagnostic Log]
URI Host: ${host}
URI Port: ${port}
Database Name: ${this.dbName}
Error Name: ${errName}
Error Message: ${errMsg}
Error Code: ${errCode}
Connected to Server: ${this.db ? 'true' : 'false'}`);
  }

  /**
   * Dynamically resolves existing schema and function collections from MongoDB database
   */
  private async resolveCollectionNames(): Promise<{ schemaColl: string; fnColl: string }> {
    if (!this.db) return { schemaColl: this.schemasCollName, fnColl: this.functionsCollName };

    try {
      const collections = await this.db.listCollections().toArray();
      const colNames = collections.map(c => c.name.toLowerCase());

      let schemaColl = this.schemasCollName;
      if (!colNames.includes(schemaColl.toLowerCase())) {
        const candidateSchemas = ['formschemas', 'schemas', 'form_schemas', 'entities'];
        const matched = candidateSchemas.find(c => colNames.includes(c));
        if (matched) {
          const actualCol = collections.find(c => c.name.toLowerCase() === matched);
          if (actualCol) schemaColl = actualCol.name;
        }
      }

      let fnColl = this.functionsCollName;
      if (!colNames.includes(fnColl.toLowerCase())) {
        const candidateFns = ['functionregistries', 'functions', 'customfunctions', 'function_registries'];
        const matched = candidateFns.find(c => colNames.includes(c));
        if (matched) {
          const actualCol = collections.find(c => c.name.toLowerCase() === matched);
          if (actualCol) fnColl = actualCol.name;
        }
      }

      return { schemaColl, fnColl };
    } catch {
      return { schemaColl: this.schemasCollName, fnColl: this.functionsCollName };
    }
  }

  /**
   * Dynamically loads ProjectContext from MongoDB for a given projectName.
   */
  public async loadProjectContext(
    projectName: string,
    requirement?: string
  ): Promise<ProjectContext> {
    if (!projectName || projectName.trim() === '') {
      throw new ContextLoaderError('projectName is required to load context');
    }

    const cleanProjectName = projectName.trim();

    // Ensure connection is established
    if (!this.db) {
      await this.connect();
    }

    if (!this.db) {
      throw new ContextLoaderError('Database connection uninitialized');
    }

    try {
      const { schemaColl, fnColl } = await this.resolveCollectionNames();
      this.schemasCollName = schemaColl;
      this.functionsCollName = fnColl;

      // 1. Fetch Schemas
      const schemasCollection = this.db.collection(this.schemasCollName);
      let rawSchemas = await schemasCollection.find({
        $or: [
          { projectName: cleanProjectName },
          { project: cleanProjectName },
          { projectName: { $regex: new RegExp(`^${cleanProjectName}$`, 'i') } }
        ]
      }).toArray();

      // Fallback: If no match by exact projectName, load active schemas from collection
      if (rawSchemas.length === 0) {
        rawSchemas = await schemasCollection.find({ active: true }).toArray();
      }

      if (rawSchemas.length === 0) {
        rawSchemas = await schemasCollection.find({}).toArray();
      }

      const activeSchemas: SchemaContext[] = [];
      for (const rawSchema of rawSchemas) {
        const { result: schema } = normalizeSchema(rawSchema);
        if (schema && (schema.active !== false)) {
          // Attempt sample record fetch from corresponding collection
          const sampleRecord = await this.fetchSampleRecordForSchema(schema.schemaName);
          if (sampleRecord) {
            schema.sampleRecord = sampleRecord;
          }
          activeSchemas.push(schema);
        }
      }

      if (activeSchemas.length === 0) {
        throw new ContextLoaderError(
          `No active schemas found for projectName '${cleanProjectName}' in database '${this.dbName}' (Collection: '${this.schemasCollName}')`
        );
      }

      // 2. Fetch Custom Functions
      const functionsCollection = this.db.collection(this.functionsCollName);
      let rawFunctions = await functionsCollection.find({
        $or: [
          { projectName: cleanProjectName },
          { project: cleanProjectName },
          { projectName: { $exists: false } }
        ]
      }).toArray();

      if (rawFunctions.length === 0) {
        rawFunctions = await functionsCollection.find({}).toArray();
      }

      const activeFunctions: FunctionContext[] = [];
      for (const rawFn of rawFunctions) {
        const { result: fn } = normalizeFunctionContext(rawFn);
        if (fn && (fn.isActive !== false)) {
          activeFunctions.push(fn);
        }
      }

      // Assemble final ProjectContext model
      const rawContext: ProjectContext = {
        projectName: cleanProjectName,
        schemas: activeSchemas,
        functions: activeFunctions,
        useMock: false,
        isAdapterMode: false,
        requirement
      };

      // Runtime validation before returning
      return validateProjectContext(rawContext);
    } catch (err: unknown) {
      this.logSanitizedDiagnostic(err);
      if (err instanceof ContextLoaderError) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : String(err);
      throw new ContextLoaderError(
        `Failed to load context for project '${cleanProjectName}': ${msg}`,
        err
      );
    }
  }

  /**
   * Safely fetches a single sample record for an entity collection if present.
   */
  private async fetchSampleRecordForSchema(schemaName: string) {
    if (!this.db || !schemaName) return undefined;
    try {
      const col = this.db.collection(schemaName);
      const doc = await col.findOne({});
      return doc ? normalizeSampleRecord(doc) : undefined;
    } catch {
      return undefined;
    }
  }
}
