import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    // RBAC role
    role: {
      type: String,
      enum: ['super_admin', 'owner', 'staff'],
      default: 'owner',
    },

    // Linked restaurant (null for super_admin)
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null,
    },

    // For staff: what they're allowed to do
    staffPermissions: {
      type: [String],
      enum: ['view_orders', 'update_order_status', 'view_menu'],
      default: [],
    },

    // Profile
    avatar: { type: String, default: null },          // Cloudinary URL
    country: { type: String, default: null },

    // Account state
    isActive: { type: Boolean, default: true },
    isOnboarded: { type: Boolean, default: false },   // Has completed wizard?
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index for fast email lookup during login
UserSchema.index({ email: 1 });
UserSchema.index({ restaurantId: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
