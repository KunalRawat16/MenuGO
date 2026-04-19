import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Manually parse .env.local
const envPath = path.join(rootDir, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const mongoUriMatch = envContent.match(/MONGODB_URI=(.*)/);
const MONGODB_URI = mongoUriMatch ? mongoUriMatch[1].trim() : null;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function testConnection() {
  try {
    const hostPart = MONGODB_URI.includes('@') ? MONGODB_URI.split('@')[1].split('/')[0] : 'local';
    console.log('Attempting to connect to:', hostPart);
    
    await mongoose.connect(MONGODB_URI, { family: 4 });
    console.log('SUCCESS: Database connected successfully!');
    
    // Check if we can list collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('FAILURE: Could not connect to database.');
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testConnection();
