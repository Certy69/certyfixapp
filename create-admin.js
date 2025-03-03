import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

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

async function createAdminUser() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const users = db.collection('users');

    // Check if admin user already exists
    const existingAdmin = await users.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('An admin user already exists.');
      return;
    }

    // Admin user details
    const adminUser = {
      fullName: 'Admin User',
      email: 'ale412@live.nl',
      password: await bcrypt.hash('adminpassword', 10), // Replace 'adminpassword' with a secure password
      role: 'admin',
      customerId: 'admin',
      isVerified: true,
      isApproved: true,
      isActive: true,
      createdAt: new Date()
    };

    // Insert admin user
    const result = await users.insertOne(adminUser);
    console.log(`Admin user created with ID: ${result.insertedId} and customerId: ${adminUser.customerId}`);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.close();
  }
}

createAdminUser();

