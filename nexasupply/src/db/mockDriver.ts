import { randomBytes } from "crypto";

export class ObjectId {
  private id: string;
  constructor(id?: any) {
    if (id && typeof id === "object" && typeof id.toString === "function") {
      this.id = id.toString();
    } else if (typeof id === "string" && id.length > 0) {
      this.id = id;
    } else {
      this.id = randomBytes(12).toString("hex");
    }
  }
  toString() {
    return this.id;
  }
  toHexString() {
    return this.id;
  }
  static isValid(id: any): boolean {
    if (!id) return false;
    if (typeof id === "string") return /^[0-9a-fA-F]{24}$/.test(id) || id.length > 0;
    return id instanceof ObjectId;
  }
}

function isObjectIdLike(val: any): boolean {
  if (!val) return false;
  if (val instanceof ObjectId) return true;
  if (typeof val === "object" && typeof val.toHexString === "function") return true;
  if (typeof val === "object" && val._bsontype === "ObjectID") return true;
  return false;
}

function matchesDoc(doc: any, query: any): boolean {
  if (!query || Object.keys(query).length === 0) return true;

  for (const key in query) {
    const val = query[key];
    const docVal = doc[key];

    // If query value is an operator object like { $ne: true } or { $in: [...] }
    if (val && typeof val === "object" && !isObjectIdLike(val) && !(val instanceof Date)) {
      if ("$ne" in val) {
        const target = val.$ne;
        if (docVal !== undefined && docVal !== null) {
          if (docVal.toString() === target?.toString()) return false;
        } else if (target === false || target === null) {
          // if querying { isDeleted: { $ne: true } }, undefined docVal does NOT equal true, so it passes.
        }
      }
      if ("$in" in val) {
        const arr = val.$in as any[];
        const docValStr = docVal?.toString();
        const found = arr.some(item => item?.toString() === docValStr);
        if (!found) return false;
      }
      if ("$gte" in val) {
        if (!(docVal >= val.$gte)) return false;
      }
      if ("$lte" in val) {
        if (!(docVal <= val.$lte)) return false;
      }
      if ("$gt" in val) {
        if (!(docVal > val.$gt)) return false;
      }
      if ("$lt" in val) {
        if (!(docVal < val.$lt)) return false;
      }
    } else {
      // Direct equality check (strings, numbers, ObjectIds, etc)
      if (val === undefined || val === null) {
        if (docVal !== undefined && docVal !== null) return false;
      } else {
        if (docVal === undefined || docVal === null) return false;
        if (docVal.toString() !== val.toString()) return false;
      }
    }
  }
  return true;
}

class MockCollection {
  private data: Map<string, any> = new Map();

  async insertOne(doc: any) {
    const id = doc._id ? new ObjectId(doc._id) : new ObjectId();
    const newDoc = { ...doc, _id: id };
    this.data.set(id.toString(), newDoc);
    return { insertedId: id, acknowledged: true };
  }

  async insertMany(docs: any[]) {
    const ids: { [key: number]: ObjectId } = {};
    docs.forEach((doc, i) => {
      const id = doc._id ? new ObjectId(doc._id) : new ObjectId();
      const newDoc = { ...doc, _id: id };
      this.data.set(id.toString(), newDoc);
      ids[i] = id;
    });
    return { insertedIds: ids, insertedCount: docs.length, acknowledged: true };
  }

  async createIndex(keys: any, options?: any) {
    return "mock_index";
  }

  async findOne(query: any) {
    for (const doc of this.data.values()) {
      if (matchesDoc(doc, query)) return doc;
    }
    return null;
  }

  find(query: any = {}) {
    const getMatchingResults = () => {
      const results: any[] = [];
      for (const doc of this.data.values()) {
        if (matchesDoc(doc, query)) results.push(doc);
      }
      return results;
    };

    return {
      limit: (lim: number) => ({
        toArray: async () => getMatchingResults().slice(0, lim)
      }),
      toArray: async () => getMatchingResults()
    };
  }

  async findOneAndUpdate(query: any, update: any, options: any = {}) {
    const doc = await this.findOne(query);
    if (!doc) return null;
    if (update.$set) {
      for (const k in update.$set) {
        doc[k] = update.$set[k];
      }
    }
    this.data.set(doc._id.toString(), doc);
    return doc;
  }

  async deleteMany(query: any) {
    if (!query || Object.keys(query).length === 0) {
      const count = this.data.size;
      this.data.clear();
      return { deletedCount: count };
    }
    let count = 0;
    for (const [id, doc] of this.data.entries()) {
      if (matchesDoc(doc, query)) {
        this.data.delete(id);
        count++;
      }
    }
    return { deletedCount: count };
  }

  async updateOne(query: any, update: any) {
    const doc = await this.findOne(query);
    if (!doc) return { matchedCount: 0 };
    if (update.$set) {
      for (const k in update.$set) {
        doc[k] = update.$set[k];
      }
    }
    this.data.set(doc._id.toString(), doc);
    return { matchedCount: 1 };
  }
}

const globalCollections = new Map<string, MockCollection>();

class MockDb {
  collection(name: string) {
    if (!globalCollections.has(name)) {
      globalCollections.set(name, new MockCollection());
    }
    return globalCollections.get(name)!;
  }
}

export class MongoClient {
  private _db = new MockDb();
  constructor(uri: string) {}
  async connect() {
    return this;
  }
  db(name?: string) {
    return this._db;
  }
  async close() {}
}
