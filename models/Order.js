import mongoose from 'mongoose';

// Snapshot of item at time of order (price may change later)
const OrderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: null },
    dietary: { type: String, default: null },
    specialRequest: { type: String, default: '' },   // Per-item note
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    // Restaurant context
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    restaurantSlug: { type: String, required: true }, // Denormalized for SSE room key

    // Table context (null if takeaway)
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      default: null,
    },
    tableNumber: { type: String, default: null },

    // Customer info (no login required)
    customerName: { type: String, required: true, default: 'Guest' },
    specialInstructions: { type: String, default: '' }, // Global order note

    // Order contents
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },

    // Kanban pipeline status
    status: {
      type: String,
      enum: [
        'incoming',    // Just placed by customer
        'accepted',    // Owner accepted
        'rejected',    // Owner rejected
        'preparing',   // Kitchen working on it
        'served',      // Brought to table
        'completed',   // Paid & done
        'cancelled',   // Cancelled after acceptance
      ],
      default: 'incoming',
    },

    orderSource: {
      type: String,
      enum: ['dine-in', 'takeaway'],
      default: 'dine-in',
    },

    // Timestamps for each status transition (analytics)
    acceptedAt: { type: Date, default: null },
    preparingAt: { type: Date, default: null },
    servedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes for dashboard queries
OrderSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ restaurantSlug: 1, status: 1, createdAt: -1 });
OrderSchema.index({ restaurantId: 1, createdAt: -1 });

// TTL: Auto-delete completed/rejected orders after 90 days
OrderSchema.index(
  { completedAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60, partialFilterExpression: { completedAt: { $ne: null } } }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
