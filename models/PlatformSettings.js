import mongoose from "mongoose";

const platformSettingsSchema = new mongoose.Schema({
  id: { type: String, default: "global_settings", unique: true },
  superadminUsername: { type: String, default: "superadmin" },
  superadminPassword: { type: String, default: "admin123" },
  trialDurationDays: { type: Number, default: 30 },
  freePlanItemLimit: { type: Number, default: 10 }
}, { timestamps: true });

const PlatformSettings = mongoose.models.PlatformSettings || mongoose.model("PlatformSettings", platformSettingsSchema);

export default PlatformSettings;
