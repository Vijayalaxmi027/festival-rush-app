
import { MongoClient } from "mongodb";

const MONGO_URI = "mongodb://127.0.0.1:27017";
const DATABASE_NAME = "festival_rush";

const client = new MongoClient(MONGO_URI);

let database;

export async function connectDB() {
  if (database) return database;

  try {
    await client.connect();
    database = client.db(DATABASE_NAME);

    await database.command({ ping: 1 });

    console.log("✅ Connected to MongoDB: festival_rush");

    return database;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }
}

export function getDB() {
  if (!database) {
    throw new Error("Database not connected. Call connectDB() first.");
  }

  return database;
}
