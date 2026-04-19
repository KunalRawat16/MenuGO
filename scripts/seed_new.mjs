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

const newRestaurants = [
  {
    id: "r_burger_" + Date.now(),
    name: "Burger Joint",
    slug: "burger-joint",
    logo: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&q=80",
    banner: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1000&q=80",
    address: "789 Burger Ave, Meatville",
    adminPassword: "password123",
    categories: ["Burgers", "Sides", "Beverages"],
    subscription: { plan: "paid", validUntil: new Date("2028-01-01") },
    menuItems: [
      {
        id: "m_b1", name: "Classic Cheeseburger", price: 150, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
        category: "Burgers", isVeg: false, isAvailable: true, isPopular: true, description: "Beef patty with cheddar cheese."
      },
      {
        id: "m_b2", name: "French Fries", price: 80, image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&q=80",
        category: "Sides", isVeg: true, isAvailable: true, isPopular: true, description: "Crispy golden fries."
      }
    ]
  },
  {
    id: "r_sushi_" + Date.now(),
    name: "Sushi Master",
    slug: "sushi-master",
    logo: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&q=80",
    banner: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1000&q=80",
    address: "101 Ocean Blvd, Seaside",
    adminPassword: "password123",
    categories: ["Sushi Rolls", "Appetizers", "Beverages"],
    subscription: { plan: "paid", validUntil: new Date("2028-01-01") },
    menuItems: [
      {
        id: "m_s1", name: "Spicy Tuna Roll", price: 300, image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&q=80",
        category: "Sushi Rolls", isVeg: false, isAvailable: true, isPopular: true, description: "Fresh tuna with spicy mayo."
      },
      {
        id: "m_s2", name: "Miso Soup", price: 100, image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80",
        category: "Appetizers", isVeg: true, isAvailable: true, isPopular: false, description: "Traditional Japanese soup."
      }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    await Restaurant.insertMany(newRestaurants);
    console.log("Successfully added 2 new restaurants!");

  } catch (error) {
    console.error("Failed to add restaurants:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

seed();
