import mongoose from 'mongoose';

/**
 * Business Model — Generic for ANY menu-based business.
 * Not limited to restaurants. Supports: cafes, spas, salons, hotels,
 * bars, cloud kitchens, food trucks, bakeries, and more.
 */

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
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
  },
  { _id: false }
);

const SocialSchema = new mongoose.Schema(
  {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    tripadvisor: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  { _id: false }
);

const BusinessSettingsSchema = new mongoose.Schema(
  {
    isOpen: { type: Boolean, default: true },

    // Generic label for "prep/wait time" — "delivery", "service time", etc.
    avgServiceTime: { type: String, default: '20-30 mins' },

    // Generic label for per-person cost (e.g., per meal, per session)
    costPerPerson: { type: Number, default: 0 },

    // Ordering modes — relevant across all business types
    allowWalkin: { type: Boolean, default: true },   // dine-in / walk-in
    allowTakeaway: { type: Boolean, default: false },
    allowDelivery: { type: Boolean, default: false },
    allowBooking: { type: Boolean, default: false },  // spa/salon appointments
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

const BusinessSchema = new mongoose.Schema(
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

    /**
     * Business type — drives UI labels and feature visibility.
     * e.g., "salon" hides table management; "hotel" shows "room service" option.
     */
    type: {
      type: String,
      enum: [
        'restaurant',    // Full-service dining
        'cafe',          // Coffee shop, casual dining
        'bar',           // Pub, lounge, cocktail bar
        'hotel',         // Hotel in-room / lobby service
        'bakery',        // Bakery, patisserie
        'food_truck',    // Mobile vendor
        'cloud_kitchen', // Delivery-only kitchen
        'spa',           // Wellness center
        'salon',         // Beauty / hair salon
        'clinic',        // Medical / dental (service menu)
        'other',         // Anything else
      ],
      default: 'restaurant',
    },

    // Branding
    logo: { type: String, default: null },
    banner: { type: String, default: null },

    // Details
    address: { type: AddressSchema, default: () => ({}) },
    localization: { type: LocalizationSchema, default: () => ({}) },

    /**
     * Tags representing business specialties — flexible for all types.
     * Restaurant: ['Indian', 'Italian']
     * Salon: ['Hair', 'Nail Art', 'Bridal']
     * Spa: ['Ayurvedic', 'Swedish Massage']
     */
    tags: { type: [String], default: [] },

    social: { type: SocialSchema, default: () => ({}) },
    settings: { type: BusinessSettingsSchema, default: () => ({}) },
    subscription: { type: SubscriptionSchema, default: () => ({}) },

    // Metrics
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    // Platform control
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
BusinessSchema.index({ slug: 1 });
BusinessSchema.index({ ownerId: 1 });
BusinessSchema.index({ type: 1 });
BusinessSchema.index({ 'subscription.plan': 1 });

export default mongoose.models.Business || mongoose.model('Business', BusinessSchema);
