import mongoose from 'mongoose';

const PlatformSettingsSchema = new mongoose.Schema(
  {
    // Singleton identifier
    id: { type: String, default: 'global_settings', unique: true },

    // Super admin credentials
    superadminUsername: { type: String, default: 'superadmin@gmail.com' },
    superadminPassword: { type: String, default: null }, // bcrypt hash

    // Subscription config
    trialDurationDays: { type: Number, default: 14 },
    freePlanItemLimit: { type: Number, default: 10 },

    // Pricing (display only — no payment gateway yet)
    monthlyPlanPrice: { type: Number, default: 499 },
    yearlyPlanPrice: { type: Number, default: 4999 },

    // Platform meta
    platformName: { type: String, default: 'MenuGO' },
    supportEmail: { type: String, default: 'support@menugo.in' },
  },
  { timestamps: true }
);

export default mongoose.models.PlatformSettings ||
  mongoose.model('PlatformSettings', PlatformSettingsSchema);
