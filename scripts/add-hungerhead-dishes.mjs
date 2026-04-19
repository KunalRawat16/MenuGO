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

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', new mongoose.Schema({
  name: String,
  slug: String,
  menuItems: [MenuItemSchema]
}));

const dishes = [
  // Appetizers
  { id: "h_a1", name: "Crispy Paneer Fingers", price: 180, category: "Appetizers & Soups", isVeg: true, isPopular: true, description: "Deep fried cottage cheese sticks with spicy dip.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80" },
  { id: "h_a2", name: "Chicken Tikka", price: 250, category: "Appetizers & Soups", isVeg: false, isPopular: true, description: "Classic tandoori grilled chicken chunks.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80" },
  { id: "h_a3", name: "Tomato Basil Soup", price: 120, category: "Appetizers & Soups", isVeg: true, isPopular: false, description: "Creamy roasted tomato soup with fresh basil.", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80" },
  
  // Salads
  { id: "h_s1", name: "Greek Salad", price: 210, category: "Salads", isVeg: true, isPopular: false, description: "Fresh cucumbers, tomatoes, olives, and feta cheese.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80" },
  { id: "h_s2", name: "Caesar Salad with Grill Chicken", price: 280, category: "Salads", isVeg: false, isPopular: true, description: "Classic Caesar with grilled chicken and parmesan.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80" },

  // Main Courses
  { id: "h_m1", name: "Paneer Butter Masala", price: 320, category: "Main Courses", isVeg: true, isPopular: true, description: "Rich and creamy tomato-based paneer gravy.", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80" },
  { id: "h_m2", name: "Butter Chicken", price: 380, category: "Main Courses", isVeg: false, isPopular: true, description: "Iconic North Indian chicken curry in buttery gravy.", image: "https://images.unsplash.com/photo-1603894584110-33068e4c01d4?w=500&q=80" },
  { id: "h_m3", name: "Dal Makhani", price: 280, category: "Main Courses", isVeg: true, isPopular: true, description: "Slow-cooked black lentils with cream and butter.", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80" },
  { id: "h_m4", name: "Vegetable Biryani", price: 260, category: "Main Courses", isVeg: true, isPopular: false, description: "Fragrant basmati rice cooked with seasonal veggies.", image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?w=500&q=80" },
  { id: "h_m5", name: "Chicken Dum Biryani", price: 340, category: "Main Courses", isVeg: false, isPopular: true, description: "Hyderabadi style slow-cooked chicken biryani.", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc9?w=500&q=80" },
  { id: "h_m6", name: "Pasta Alfredo", price: 290, category: "Main Courses", isVeg: true, isPopular: false, description: "Creamy white sauce pasta with garlic and mushrooms.", image: "https://images.unsplash.com/photo-1645112481355-325565e69e46?w=500&q=80" },
  { id: "h_m7", name: "Pepperoni Pizza", price: 450, category: "Main Courses", isVeg: false, isPopular: true, description: "Classic pizza topped with spicy pepperoni and mozzarella.", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80" },

  // Sides
  { id: "h_si1", name: "Garlic Bread with Cheese", price: 150, category: "Sides", isVeg: true, isPopular: true, description: "Toasted bread with garlic butter and melted cheese.", image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&q=80" },
  { id: "h_si2", name: "Masala Fries", price: 110, category: "Sides", isVeg: true, isPopular: false, description: "Crispy fries tossed in Indian spices.", image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&q=80" },

  // Desserts
  { id: "h_d1", name: "Chocolate Brownie with Ice Cream", price: 220, category: "Desserts", isVeg: true, isPopular: true, description: "Warm brownie served with vanilla ice cream and fudge.", image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=500&q=80" },
  { id: "h_d2", name: "Gulab Jamun (2 pcs)", price: 80, category: "Desserts", isVeg: true, isPopular: false, description: "Traditional sweet dumplings in sugar syrup.", image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=500&q=80" },
  { id: "h_d3", name: "Tiramisu", price: 260, category: "Desserts", isVeg: true, isPopular: true, description: "Classic Italian coffee-flavored dessert.", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&q=80" },

  // Beverages
  { id: "h_b1", name: "Fresh Lime Soda", price: 90, category: "Beverages", isVeg: true, isPopular: false, description: "Refreshing lime drink with soda.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80" },
  { id: "h_b2", name: "Cold Coffee", price: 160, category: "Beverages", isVeg: true, isPopular: true, description: "Chilled coffee blended with milk and sugar.", image: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=500&q=80" },
  { id: "h_b3", name: "Oreo Milkshake", price: 190, category: "Beverages", isVeg: true, isPopular: true, description: "Thick shake with crushed Oreo cookies.", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80" }
];

async function updateHungerhead() {
  try {
    await mongoose.connect(MONGODB_URI, { family: 4 });
    console.log("Connected to MongoDB.");

    const result = await Restaurant.updateOne(
      { name: /Hungerhead/i },
      { $set: { menuItems: dishes } }
    );

    if (result.matchedCount > 0) {
      console.log(`Successfully updated Hungerhead with ${dishes.length} dishes.`);
    } else {
      console.error("Restaurant 'Hungerhead' not found.");
    }

  } catch (error) {
    console.error("Failed to update dishes:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateHungerhead();
