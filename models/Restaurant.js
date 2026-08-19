import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema(
  {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    zip: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  { _id: false }
);

const LocalizationSchema = new mongoose.Schema(
  {
    language: { type: String, default: 'en' },         // 'en', 'hi', 'fr', 'ar', 'es'
    currency: { type: String, default: 'INR' },        // 'INR', 'USD', 'EUR'
    currencySymbol: { type: String, default: '₹' },    // '₹', '$', '€'
  },
  { _id: false }
);

const SocialSchema = new mongoose.Schema(
  {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    tripadvisor: { type: String, default: '' },
  },
  { _id: false }
);

const RestaurantSettingsSchema = new mongoose.Schema(
  {
    isOpen: { type: Boolean, default: true },
    avgPrepTime: { type: String, default: '20-30 mins' },
    costForTwo: { type: Number, default: 400 },
    allowTakeaway: { type: Boolean, default: false },
    allowDineIn: { type: Boolean, default: true },
  },
  { _id: false }
);

const SubscriptionSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ['trial', 'free', 'monthly', 'yearly'],
      default: 'trial',
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'suspended'],
      default: 'active',
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly', 'none'],
      default: 'none',
    },
    trialEndsAt: { type: Date, default: null },
    paidUntil: { type: Date, default: null },
  },
  { _id: false }
);

const RestaurantSchema = new mongoose.Schema(
  {
    // Ownership
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Identity
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },

    // Business type
    type: {
      type: String,
      enum: ['restaurant', 'cafe', 'hotel', 'salon', 'bar', 'other'],
      default: 'restaurant',
    },

    // Branding
    logo: { type: String, default: null },    // Cloudinary URL
    banner: { type: String, default: null },   // Cloudinary URL

    // Details
    address: { type: AddressSchema, default: () => ({}) },
    localization: { type: LocalizationSchema, default: () => ({}) },
    cuisineTypes: { type: [String], default: [] },
    social: { type: SocialSchema, default: () => ({}) },

    // Operational settings
    settings: { type: RestaurantSettingsSchema, default: () => ({}) },

    // Subscription
    subscription: { type: SubscriptionSchema, default: () => ({}) },

    // Metrics (denormalized for fast display)
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    // Platform control
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
RestaurantSchema.index({ slug: 1 });             // Public menu lookup
RestaurantSchema.index({ ownerId: 1 });           // Owner dashboard lookup
RestaurantSchema.index({ 'subscription.plan': 1 }); // Admin filtering

export default mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);
