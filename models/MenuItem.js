import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    // Core fields
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: null },  // Cloudinary URL

    // Dietary
    dietary: {
      type: String,
      enum: ['veg', 'non-veg', 'vegan'],
      default: 'veg',
    },

    // Status & badges
    isAvailable: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    // Extra metadata
    tags: { type: [String], default: [] },          // ['spicy', 'gluten-free']
    allergens: { type: [String], default: [] },      // ['nuts', 'dairy']

    // For drag-to-reorder within a category
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes
MenuItemSchema.index({ restaurantId: 1, categoryId: 1, sortOrder: 1 });
MenuItemSchema.index({ restaurantId: 1, isAvailable: 1 });
MenuItemSchema.index({ restaurantId: 1, isPopular: 1 });

export default mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
