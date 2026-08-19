'use server';

import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import Category from '@/models/Category';
import User from '@/models/User';
import { requireRole, requireRestaurantAccess, getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { createSession } from '@/lib/auth';

// ─────────────────────────────────────────────────────────────────────
// COMPLETE ONBOARDING WIZARD (Step 1–5 combined save)
// ─────────────────────────────────────────────────────────────────────

export async function completeOnboardingAction(wizardData) {
  const session = await requireRole(['owner']);
  if (session.error) return { error: session.error };

  await dbConnect();

  const {
    // Step 1
    name, businessType, address,
    // Step 2
    language, currency, currencySymbol,
    // Step 3
    logo, banner,
    // Step 4
    cuisineTypes, categories,
    // Step 5
    social,
  } = wizardData;

  // Generate a clean slug from business name
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  let slug = baseSlug;
  let counter = 1;
  // Ensure slug uniqueness (skip current business's slug)
  while (await Business.findOne({ slug, _id: { $ne: session.restaurantId } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  // Update business
  await Business.findByIdAndUpdate(session.restaurantId, {
    name,
    slug,
    type: businessType || 'restaurant',
    logo: logo || null,
    banner: banner || null,
    address: address || {},
    localization: { language, currency, currencySymbol },
    tags: cuisineTypes || [],
    social: social || {},
    isActive: true,
  });

  // Create default categories (if any)
  if (categories && categories.length > 0) {
    const docs = categories.map((catName, i) => ({
      restaurantId: session.restaurantId,
      name: catName,
      sortOrder: i,
      isActive: true,
    }));
    await Category.insertMany(docs, { ordered: false });
  }

  // Mark user as onboarded + update slug in session
  await User.findByIdAndUpdate(session.userId, { isOnboarded: true });

  // Refresh session cookie with updated slug + isOnboarded
  await createSession({
    ...session,
    restaurantSlug: slug,
    isOnboarded: true,
  });

  revalidatePath('/dashboard');
  return { success: true, redirect: '/dashboard' };
}

// ─────────────────────────────────────────────────────────────────────
// UPDATE RESTAURANT INFO
// ─────────────────────────────────────────────────────────────────────

export async function updateRestaurantInfoAction(restaurantId, data) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  await dbConnect();

  const allowedFields = [
    'name', 'description', 'type', 'logo', 'banner',
    'address', 'localization', 'tags', 'social', 'settings',
  ];

  const update = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) update[key] = data[key];
  }

  await Business.findByIdAndUpdate(restaurantId, { $set: update });

  revalidatePath('/dashboard/settings');
  revalidatePath(`/${session.restaurantSlug}`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────
// TOGGLE OPEN / CLOSED STATUS
// ─────────────────────────────────────────────────────────────────────

export async function updateOpenStatusAction(restaurantId, isOpen) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  await dbConnect();
  await Business.findByIdAndUpdate(restaurantId, { 'settings.isOpen': isOpen });

  revalidatePath(`/${session.restaurantSlug}`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────
// GET RESTAURANT DATA (for dashboard server components)
// ─────────────────────────────────────────────────────────────────────

export async function getMyBusinessAction() {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  await dbConnect();

  let business = null;
  if (session.restaurantId) {
    business = await Business.findById(session.restaurantId).lean();
  }
  if (!business && session.userId) {
    business = await Business.findOne({ ownerId: session.userId }).lean();
  }
  if (!business) return { error: 'Business not found' };

  return { success: true, business: JSON.parse(JSON.stringify(business)) };
}

// ─────────────────────────────────────────────────────────────────────
// GET RESTAURANT BY SLUG (for public menu page — no auth)
// ─────────────────────────────────────────────────────────────────────

export async function getBusinessBySlugAction(slug) {
  await dbConnect();
  const business = await Business.findOne({ slug, isActive: true }).lean();
  if (!business) return { error: 'Business not found' };
  return { success: true, business: JSON.parse(JSON.stringify(business)) };
}
