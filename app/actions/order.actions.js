'use server';

import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Business from '@/models/Business';
import { requireRestaurantAccess } from '@/lib/auth';
import mongoose from 'mongoose';

// ─────────────────────────────────────────────────────────────────────
// CREATE ORDER (no auth — customer-facing, public endpoint)
// ─────────────────────────────────────────────────────────────────────

export async function createOrderAction(orderData) {
  const {
    restaurantSlug,
    tableId,
    tableNumber,
    customerName,
    specialInstructions,
    items,
    totalAmount,
    orderSource = 'dine-in',
  } = orderData;

  if (!restaurantSlug || !items?.length || !totalAmount) {
    return { error: 'Restaurant, items, and total are required.' };
  }

  await dbConnect();

  const business = await Business.findOne({ slug: restaurantSlug, isActive: true }).select('_id');
  if (!business) return { error: 'Business not found.' };

  // Verify business is open
  const fullBiz = await Business.findById(business._id).select('settings.isOpen');
  if (fullBiz?.settings?.isOpen === false) {
    return { error: 'This business is currently closed.' };
  }

  // Sanitize items: Ensure menuItemId is a valid ObjectId, otherwise set to null for upsells/extras
  const sanitizedItems = items.map((item) => {
    const rawId = item.menuItemId || item.id;
    const isValidObjectId = rawId && typeof rawId === 'string' && mongoose.Types.ObjectId.isValid(rawId);
    return {
      ...item,
      menuItemId: isValidObjectId ? rawId : null,
    };
  });

  const order = await Order.create({
    restaurantId: business._id,
    restaurantSlug,
    tableId: tableId || null,
    tableNumber: tableNumber || null,
    customerName: customerName?.trim() || 'Guest',
    specialInstructions: specialInstructions?.trim() || '',
    items: sanitizedItems,
    totalAmount,
    orderSource,
    status: 'incoming',
  });

  const orderObj = JSON.parse(JSON.stringify(order));

  // Trigger SSE broadcast (emit to restaurant room)
  try {
    const { orderEmitter } = await import('@/lib/sse');
    orderEmitter.emit(`order:${restaurantSlug}`, { event: 'order_created', order: orderObj });
  } catch {
    // SSE is non-critical — order is saved regardless
  }

  return { success: true, order: orderObj };
}

// ─────────────────────────────────────────────────────────────────────
// UPDATE ORDER STATUS (owner/staff only)
// ─────────────────────────────────────────────────────────────────────

export async function updateOrderStatusAction(restaurantId, orderId, newStatus) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  const validStatuses = ['incoming', 'accepted', 'rejected', 'preparing', 'served', 'completed', 'cancelled'];
  if (!validStatuses.includes(newStatus)) {
    return { error: `Invalid status: ${newStatus}` };
  }

  await dbConnect();

  // Timestamps to record per status
  const timestampField = {
    accepted: { acceptedAt: new Date() },
    preparing: { preparingAt: new Date() },
    served: { servedAt: new Date() },
    completed: { completedAt: new Date() },
  }[newStatus] || {};

  // Tenant isolation: restaurantId must match
  const updated = await Order.findOneAndUpdate(
    { _id: orderId, restaurantId },
    { status: newStatus, ...timestampField },
    { new: true }
  );

  if (!updated) return { error: 'Order not found or access denied.' };

  const orderObj = JSON.parse(JSON.stringify(updated));

  // Broadcast status change to kitchen dashboard & customer live stream
  try {
    const { orderEmitter } = await import('@/lib/sse');
    orderEmitter.emit(`order:${session.restaurantSlug}`, {
      event: 'order_updated',
      order: orderObj,
    });
  } catch {}

  return { success: true, order: orderObj };
}

// ─────────────────────────────────────────────────────────────────────
// GET ORDERS (dashboard — with optional status filter)
// ─────────────────────────────────────────────────────────────────────

export async function getOrdersAction(restaurantId, filters = {}) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  await dbConnect();

  const query = { restaurantId };
  if (filters.status) query.status = filters.status;
  if (filters.statuses) query.status = { $in: filters.statuses };
  if (filters.date) {
    const d = new Date(filters.date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    query.createdAt = { $gte: d, $lt: next };
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit || 100)
    .lean();

  return { success: true, orders: JSON.parse(JSON.stringify(orders)) };
}

// ─────────────────────────────────────────────────────────────────────
// GET SINGLE ORDER (owner dashboard)
// ─────────────────────────────────────────────────────────────────────

export async function getOrderAction(restaurantId, orderId) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  await dbConnect();
  const order = await Order.findOne({ _id: orderId, restaurantId }).lean();
  if (!order) return { error: 'Order not found.' };

  return { success: true, order: JSON.parse(JSON.stringify(order)) };
}

// ─────────────────────────────────────────────────────────────────────
// GET SINGLE ORDER PUBLIC (Customer-facing — no owner session required)
// ─────────────────────────────────────────────────────────────────────

export async function getOrderByIdPublicAction(orderId) {
  if (!orderId) return { error: 'Order ID is required.' };

  await dbConnect();
  const order = await Order.findById(orderId).lean();
  if (!order) return { error: 'Order not found.' };

  return { success: true, order: JSON.parse(JSON.stringify(order)) };
}

// ─────────────────────────────────────────────────────────────────────
// DELETE SINGLE ORDER (owner dashboard)
// ─────────────────────────────────────────────────────────────────────

export async function deleteOrderAction(restaurantId, orderId) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  await dbConnect();
  const deleted = await Order.findOneAndDelete({ _id: orderId, restaurantId });
  if (!deleted) return { error: 'Order not found or permission denied.' };

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────
// DELETE ORDERS BY DATE RANGE (bulk purge / cleanup)
// ─────────────────────────────────────────────────────────────────────

export async function deleteOrdersByDateRangeAction(restaurantId, { startDate, endDate, status = 'all' }) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  if (!startDate || !endDate) {
    return { error: 'Start date and end date are required.' };
  }

  await dbConnect();

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { error: 'Invalid date range provided.' };
  }

  const query = {
    restaurantId,
    createdAt: { $gte: start, $lte: end },
  };

  if (status && status !== 'all') {
    query.status = status;
  }

  const res = await Order.deleteMany(query);

  return { success: true, deletedCount: res.deletedCount || 0 };
}

// ─────────────────────────────────────────────────────────────────────
// UPDATE ORDER DETAILS (owner edit)
// ─────────────────────────────────────────────────────────────────────

export async function updateOrderDetailsAction(restaurantId, orderId, updateData) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  await dbConnect();

  const allowedFields = ['customerName', 'tableNumber', 'status', 'specialInstructions', 'items', 'totalAmount'];
  const update = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      update[field] = updateData[field];
    }
  }

  const updated = await Order.findOneAndUpdate(
    { _id: orderId, restaurantId },
    { $set: update },
    { new: true }
  );

  if (!updated) return { error: 'Order not found or permission denied.' };

  return { success: true, order: JSON.parse(JSON.stringify(updated)) };
}

// ─────────────────────────────────────────────────────────────────────
// SUBMIT ORDER FEEDBACK & RATING (Public - customer facing)
// ─────────────────────────────────────────────────────────────────────

export async function submitOrderFeedbackAction(orderId, rating, feedback = '') {
  if (!orderId) return { error: 'Order ID is required.' };
  if (!rating || rating < 1 || rating > 5) {
    return { error: 'Please select a rating between 1 and 5 stars.' };
  }

  await dbConnect();

  const updated = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        rating: Number(rating),
        feedback: String(feedback || '').trim(),
        feedbackSubmittedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!updated) return { error: 'Order not found.' };

  const orderObj = JSON.parse(JSON.stringify(updated));

  // SSE broadcast feedback update to dashboard
  try {
    const { orderEmitter } = await import('@/lib/sse');
    orderEmitter.emit(`order:${updated.restaurantSlug}`, {
      event: 'order_updated',
      order: orderObj,
    });
  } catch {}

  return { success: true, order: orderObj };
}
