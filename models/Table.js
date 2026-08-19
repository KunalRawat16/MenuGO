import mongoose from 'mongoose';

const TableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    tableNumber: { type: String, required: true, trim: true },  // "T1", "T2", "VIP-1"
    label: { type: String, default: '' },                        // "Window Seat", "Rooftop"
    capacity: { type: Number, default: 4 },
    qrCodeUrl: { type: String, default: null },                 // Stored QR image URL (Cloudinary)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Each restaurant's table numbers must be unique
TableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });
TableSchema.index({ restaurantId: 1, isActive: 1 });

export default mongoose.models.Table || mongoose.model('Table', TableSchema);
