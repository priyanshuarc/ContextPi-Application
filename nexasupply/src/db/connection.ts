import { Db, Collection } from "mongodb";
import dotenv from "dotenv";
import * as realMongo from "mongodb";
import * as mockMongo from "./mockDriver";
const mongo = process.env.MOCK_DB === "true" ? mockMongo : realMongo;
const { MongoClient } = mongo;
export const ObjectId = mongo.ObjectId;

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "nexasupply_db";

let client: any;
let db: Db;

export const connectDB = async (): Promise<Db> => {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.log(`Connected to MongoDB: ${dbName}`);
  return db;
};

export const getDb = (): Db => {
  if (!db) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return db;
};

export const getCollection = <T extends import("bson").Document>(name: string): Collection<T> => {
  return getDb().collection<T>(name);
};

export const closeDB = async () => {
  if (client) {
    await client.close();
  }
};
