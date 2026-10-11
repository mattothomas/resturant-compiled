import { MongoClient } from "mongodb";

// cached across hot reloads / warm serverless invocations
const g = globalThis;

export async function getDb() {
  g._mongo ??= new MongoClient(process.env.MONGODB_URI).connect();
  return (await g._mongo).db();
}
