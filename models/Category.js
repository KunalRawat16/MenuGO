import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index: fast fetch of all categories for a restaurant, sorted
CategorySchema.index({ restaurantId: 1, sortOrder: 1 });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
