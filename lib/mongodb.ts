import { MongoClient, type Db, type Collection } from "mongodb"
import { resolve } from "path"
import dotenv from "dotenv"

dotenv.config({ path: resolve(process.cwd(), ".env.local") })

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}
const dbName = process.env.MONGODB_DB

let client: MongoClient
let clientPromise: Promise<MongoClient>
let db: Db | null = null

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function getMongoClient(): Promise<MongoClient> {
  return await clientPromise
}

export async function getDb(): Promise<Db> {
  if (!db) {
    try {
      const client = await getMongoClient()
      db = client.db(dbName)
      console.log("Successfully connected to the database")
    } catch (error) {
      console.error("Error connecting to the database:", error)
      throw error
    }
  }
  return db
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const client = await getMongoClient()
    const db = client.db(dbName)
    console.log("Successfully connected to the database")
    return { client, db }
  } catch (error) {
    console.error("Error connecting to the database:", error)
    throw error
  }
}

export async function getCollection(name: string): Promise<Collection> {
  const db = await getDb()
  return db.collection(name)
}

export default clientPromise

