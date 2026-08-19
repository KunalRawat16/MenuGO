'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import Business from '@/models/Business';
import Order from '@/models/Order';
import PlatformSettings from '@/models/PlatformSettings';
import { requireRole } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ─────────────────────────────────────────────────────────────────────
// GET ALL RESTAURANTS (super admin)
// ─────────────────────────────────────────────────────────────────────

export async function getAllRestaurantsAction(filters = {}) {
  const session = await requireRole(['super_admin']);
  if (session.error) return { error: session.error };

  await dbConnect();

  const query = {};
  if (filters.plan) query['subscription.plan'] = filters.plan;
  if (filters.status) query['subscription.status'] = filters.status;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { slug: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const restaurants = await Business.find(query)
    .populate('ownerId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  return { success: true, restaurants: JSON.parse(JSON.stringify(restaurants)) };
}

// ─────────────────────────────────────────────────────────────────────
// PLATFORM-WIDE STATS
// ─────────────────────────────────────────────────────────────────────

export async function getPlatformStatsAction() {
  const session = await requireRole(['super_admin']);
  if (session.error) return { error: session.error };

  await dbConnect();

  const [totalBusinesses, activeBusinesses, trialBusinesses, totalOwners] = await Promise.all([
    Business.countDocuments(),
    Business.countDocuments({ 'subscription.plan': { $in: ['monthly', 'yearly', 'paid'] } }),
    Business.countDocuments({ 'subscription.plan': 'trial' }),
    User.countDocuments({ role: 'owner' }),
  ]);

  // Signups in current month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const newSignups = await User.countDocuments({ role: 'owner', createdAt: { $gte: monthStart } });

  // Expiring trials (next 7 days)
  const in7days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const expiringTrials = await Business.countDocuments({
    'subscription.plan': 'trial',
    'subscription.trialEndsAt': { $lte: in7days, $gte: new Date() },
  });

  return {
    success: true,
    stats: {
      totalBusinesses,
      totalRestaurants: totalBusinesses,
      activeBusinesses,
      activeRestaurants: activeBusinesses,
      trialBusinesses,
      trialRestaurants: trialBusinesses,
      totalOwners,
      newSignups,
      expiringTrials,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────
// UPDATE SUBSCRIPTION (super admin only)
// ─────────────────────────────────────────────────────────────────────

export async function updateSubscriptionAction(restaurantId, subscriptionData) {
  const session = await requireRole(['super_admin']);
  if (session.error) return { error: session.error };

  await dbConnect();

  const { plan, billingCycle = 'none', customValidUntil } = subscriptionData;

  let paidUntil = null;
  let trialEndsAt = null;

  if (plan === 'trial') {
    const settings = await PlatformSettings.findOne({ id: 'global_settings' });
    const trialDays = settings?.trialDurationDays || 14;
    trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
  } else if (plan === 'monthly') {
    paidUntil = customValidUntil ? new Date(customValidUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  } else if (plan === 'yearly') {
    paidUntil = customValidUntil ? new Date(customValidUntil) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }

  await Business.findByIdAndUpdate(restaurantId, {
    subscription: {
      plan,
      billingCycle,
      status: 'active',
      trialEndsAt,
      paidUntil,
    },
  });

  revalidatePath('/admin');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────
// TOGGLE RESTAURANT ACTIVE/SUSPENDED (super admin)
// ─────────────────────────────────────────────────────────────────────

export async function toggleBusinessStatusAction(restaurantId, suspend) {
  const session = await requireRole(['super_admin']);
  if (session.error) return { error: session.error };

  await dbConnect();
  await Business.findByIdAndUpdate(restaurantId, {
    isSuspended: suspend,
    isActive: !suspend,
    ...(suspend ? { 'subscription.status': 'suspended' } : {}),
  });

  revalidatePath('/admin');
  return { success: true };
}

export const toggleRestaurantStatusAction = toggleBusinessStatusAction;

// ─────────────────────────────────────────────────────────────────────
// DELETE RESTAURANT (super admin — hard delete)
// ─────────────────────────────────────────────────────────────────────

export async function deleteBusinessAction(restaurantId) {
  const session = await requireRole(['super_admin']);
  if (session.error) return { error: session.error };

  await dbConnect();

  const business = await Business.findById(restaurantId);
  if (!business) return { error: 'Business not found.' };

  await Promise.all([
    Business.findByIdAndDelete(restaurantId),
    User.deleteMany({ restaurantId }),
    Order.deleteMany({ restaurantId }),
  ]);

  revalidatePath('/admin');
  return { success: true };
}

export const deleteRestaurantAction = deleteBusinessAction;

// ─────────────────────────────────────────────────────────────────────
// RESET RESTAURANT CREDENTIALS (super admin)
// ─────────────────────────────────────────────────────────────────────

export async function resetRestaurantCredentialsAction(restaurantId, { email, password }) {
  const session = await requireRole(['super_admin']);
  if (session.error) return { error: session.error };

  await dbConnect();

  const update = {};
  if (email) {
    const taken = await User.findOne({ email, restaurantId: { $ne: restaurantId } });
    if (taken) return { error: 'Email already in use by another account.' };
    update.email = email.toLowerCase().trim();
  }
  if (password) {
    if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
    update.passwordHash = await hashPassword(password);
  }

  await User.findOneAndUpdate({ restaurantId }, { $set: update });

  revalidatePath('/admin');
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────
// PLATFORM SETTINGS
// ─────────────────────────────────────────────────────────────────────

export async function getPlatformSettingsAction() {
  const session = await requireRole(['super_admin']);
  if (session.error) return { error: session.error };

  await dbConnect();
  let settings = await PlatformSettings.findOne({ id: 'global_settings' }).lean();
  if (!settings) {
    settings = await PlatformSettings.create({ id: 'global_settings' });
  }

  // Never expose the password hash to the client
  const { superadminPassword, ...safe } = JSON.parse(JSON.stringify(settings));
  return { success: true, settings: safe };
}

export async function updatePlatformSettingsAction(data) {
  const session = await requireRole(['super_admin']);
  if (session.error) return { error: session.error };

  await dbConnect();

  const update = { ...data };

  // Hash password if being changed
  if (data.superadminPassword) {
    update.superadminPassword = await hashPassword(data.superadminPassword);
  } else {
    delete update.superadminPassword;
  }

  await PlatformSettings.findOneAndUpdate({ id: 'global_settings' }, { $set: update }, { upsert: true });

  revalidatePath('/admin');
  return { success: true };
}
