import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const envPath = path.join(rootDir, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const mongoUriMatch = envFile.match(/MONGODB_URI=(.*)/);
const MONGODB_URI = mongoUriMatch ? mongoUriMatch[1].trim() : null;

if (!MONGODB_URI) {
  console.error("No MONGODB_URI found in .env.local");
  process.exit(1);
}

const dataPath = path.join(rootDir, 'data', 'data.json');
const dataStr = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(dataStr);

const MenuItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: String, required: true },
  isVeg: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  description: { type: String }
});

const SubscriptionSchema = new mongoose.Schema({
  plan: { type: String, enum: ['free', 'trial', 'paid'], default: 'trial' },
  validUntil: { type: Date }
});

const RestaurantSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String },
  banner: { type: String },
  address: { type: String },
  categories: [{ type: String }],
  adminPassword: { type: String, required: true },
  subscription: SubscriptionSchema,
  menuItems: [MenuItemSchema]
}, { timestamps: true });

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    await Restaurant.deleteMany({});
    console.log("Cleared any existing data to prevent duplicates.");

    const restaurants = data.restaurants || [];
    
    if (restaurants.length > 0) {
      await Restaurant.insertMany(restaurants);
      console.log(`Successfully migrated ${restaurants.length} restaurants (including all nested menu items) to MongoDB!`);
    } else {
      console.log("No restaurants found in data.json.");
    }

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

migrate();
