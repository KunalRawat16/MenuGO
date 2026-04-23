import mongoose from 'mongoose';

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
  billingCycle: { type: String, enum: ['monthly', 'yearly', 'none'], default: 'none' },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
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
  rating: { type: Number, default: 4.2 },
  ratingCount: { type: Number, default: 100 },
  avgTime: { type: String, default: "20-30 mins" },
  costForOne: { type: Number, default: 200 },
  subscription: SubscriptionSchema,
  menuItems: [MenuItemSchema]
}, { timestamps: true });

// Prevent mongoose from recompiling the model upon hot reloading in Next.js
export default mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);
