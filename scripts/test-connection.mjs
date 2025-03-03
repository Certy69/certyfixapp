import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('MONGODB_DB:', process.env.MONGODB_DB);

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
console.error('MONGODB_URI is not defined in .env.local');
process.exit(1);
}

if (!dbName) {
console.error('MONGODB_DB is not defined in .env.local');
process.exit(1);
}

async function testConnection() {
const client = new MongoClient(uri);

try {
  await client.connect();
  console.log('Successfully connected to MongoDB');

  const db = client.db(dbName);
  console.log('Using database:', dbName);
  const collections = await db.listCollections().toArray();
  console.log('Collections in the database:');
  collections.forEach(collection => {
    console.log(` - ${collection.name}`);
  });

} catch (error) {
  console.error('Error connecting to MongoDB:', error);
} finally {
  await client.close();
}
}

testConnection();