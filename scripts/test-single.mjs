import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const envPath = path.join(rootDir, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const mongoUriMatch = envContent.match(/MONGODB_URI=(.*)/);
const MONGODB_URI = mongoUriMatch ? mongoUriMatch[1].trim() : null;

async function testSingleNode() {
  // Test connection to just ONE shard to isolate network vs config issues
  const singleNodeUri = 'mongodb://kumarkunal8482_db_user:aKIZjAWtzECK0Lu0@ac-whz2klh-shard-00-00.aki2nya.mongodb.net:27017/digital-menu?authSource=admin&ssl=true';
  
  console.log('Testing connection to a SINGLE shard node...');
  try {
    await mongoose.connect(singleNodeUri, { 
        serverSelectionTimeoutMS: 5000,
        family: 4 
    });
    console.log('SUCCESS: Connected to single node!');
    
    const isMaster = await mongoose.connection.db.admin().command({ isMaster: 1 });
    console.log('Replica Set Name:', isMaster.setName);
    console.log('All Hosts:', isMaster.hosts);
  } catch (error) {
    console.error('FAILURE: Could not connect to single node.');
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testSingleNode();
