'use server';

import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import MenuItem from '@/models/MenuItem';
import Business from '@/models/Business';
import { requireRestaurantAccess, getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// ─────────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────────

export async function getCategoriesAction(restaurantId) {
  await dbConnect();
  const categories = await Category.find({ restaurantId, isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();
  return { success: true, categories: JSON.parse(JSON.stringify(categories)) };
}

export async function createCategoryAction(restaurantId, name) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  if (!name?.trim()) return { error: 'Category name is required.' };

  await dbConnect();

  // Sort order = last position
  const count = await Category.countDocuments({ restaurantId });
  const category = await Category.create({
    restaurantId,
    name: name.trim(),
    sortOrder: count,
  });

  revalidatePath('/dashboard/menu');
  revalidatePath(`/${session.restaurantSlug}`);
  return { success: true, category: JSON.parse(JSON.stringify(category)) };
}

export async function updateCategoryAction(restaurantId, categoryId, name) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  if (!name?.trim()) return { error: 'Category name is required.' };

  await dbConnect();

  // Tenant isolation: ensure category belongs to this restaurant
  const updated = await Category.findOneAndUpdate(
    { _id: categoryId, restaurantId },
    { name: name.trim() },
    { new: true }
  );

  if (!updated) return { error: 'Category not found or access denied.' };

  revalidatePath('/dashboard/menu');
  revalidatePath(`/${session.restaurantSlug}`);
  return { success: true };
}

export async function deleteCategoryAction(restaurantId, categoryId) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  await dbConnect();

  // Tenant isolation check
  const cat = await Category.findOne({ _id: categoryId, restaurantId });
  if (!cat) return { error: 'Category not found or access denied.' };

  // Move all items in this category to "Uncategorized" or delete them
  // Strategy: mark items as uncategorized (soft delete category)
  await MenuItem.updateMany({ categoryId }, { categoryId: null });
  await Category.findByIdAndDelete(categoryId);

  revalidatePath('/dashboard/menu');
  revalidatePath(`/${session.restaurantSlug}`);
  return { success: true };
}

export async function reorderCategoriesAction(restaurantId, orderedIds) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  await dbConnect();

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id, restaurantId }, // Tenant isolation
      update: { sortOrder: index },
    },
  }));

  await Category.bulkWrite(bulkOps);
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────
// MENU ITEMS
// ─────────────────────────────────────────────────────────────────────

export async function getMenuItemsAction(restaurantId, categoryId = null) {
  await dbConnect();
  const filter = { restaurantId };
  if (categoryId) filter.categoryId = categoryId;

  const items = await MenuItem.find(filter)
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  return { success: true, items: JSON.parse(JSON.stringify(items)) };
}

export async function saveMenuItemAction(restaurantId, itemData) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  await dbConnect();

  const { _id, ...fields } = itemData;

  // Process variants if variation is enabled
  if (fields.hasVariants) {
    if (!Array.isArray(fields.variants) || fields.variants.length === 0) {
      return { error: 'Please add at least one price variant.' };
    }
    fields.variants = fields.variants.map((v) => ({
      name: String(v.name || '').trim(),
      price: Number(v.price) || 0,
    })).filter((v) => v.name);

    if (fields.variants.length === 0) {
      return { error: 'Price variants must have valid names and prices.' };
    }

    // Set fallback base price to the first/lowest variant price
    if (fields.price === undefined || fields.price === null || isNaN(fields.price)) {
      fields.price = fields.variants[0].price;
    }
  } else {
    fields.hasVariants = false;
    fields.variants = [];
  }

  // Process Add-ons if enabled
  if (fields.hasAddons) {
    if (Array.isArray(fields.addons)) {
      fields.addons = fields.addons
        .map((a) => ({
          name: String(a.name || '').trim(),
          price: Number(a.price) || 0,
        }))
        .filter((a) => a.name);
    } else {
      fields.addons = [];
    }
  } else {
    fields.hasAddons = false;
    fields.addons = [];
  }

  if (_id) {
    // UPDATE — double-check tenant ownership
    const updated = await MenuItem.findOneAndUpdate(
      { _id, restaurantId }, // ← Critical tenant isolation
      { $set: fields },
      { new: true }
    );
    if (!updated) return { error: 'Item not found or access denied.' };

    revalidatePath('/dashboard/menu');
    revalidatePath(`/${session.restaurantSlug}`);
    return { success: true, item: JSON.parse(JSON.stringify(updated)) };
  } else {
    // CREATE
    if (!fields.name || fields.price === undefined || !fields.categoryId) {
      return { error: 'Name, price, and category are required.' };
    }

    const count = await MenuItem.countDocuments({ restaurantId, categoryId: fields.categoryId });
    const item = await MenuItem.create({
      ...fields,
      restaurantId,
      sortOrder: count,
    });

    revalidatePath('/dashboard/menu');
    revalidatePath(`/${session.restaurantSlug}`);
    return { success: true, item: JSON.parse(JSON.stringify(item)) };
  }
}

export async function deleteMenuItemAction(restaurantId, itemId) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  await dbConnect();

  // Tenant isolation: filter by both _id AND restaurantId
  const result = await MenuItem.deleteOne({ _id: itemId, restaurantId });
  if (result.deletedCount === 0) return { error: 'Item not found or access denied.' };

  revalidatePath('/dashboard/menu');
  revalidatePath(`/${session.restaurantSlug}`);
  return { success: true };
}

export async function toggleItemAvailabilityAction(restaurantId, itemId, isAvailable) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  await dbConnect();

  const updated = await MenuItem.findOneAndUpdate(
    { _id: itemId, restaurantId }, // ← Tenant isolation
    { isAvailable },
    { new: true }
  );

  if (!updated) return { error: 'Item not found or access denied.' };

  revalidatePath(`/${session.restaurantSlug}`);
  return { success: true };
}

export async function reorderMenuItemsAction(restaurantId, orderedIds) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  await dbConnect();

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id, restaurantId }, // Tenant isolation
      update: { sortOrder: index },
    },
  }));

  await MenuItem.bulkWrite(bulkOps);
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────
// GLOBAL ADD-ONS MASTER LIBRARY
// ─────────────────────────────────────────────────────────────────────

export async function getGlobalAddonsAction(restaurantId) {
  await dbConnect();
  const business = await Business.findById(restaurantId).select('globalAddons').lean();
  if (!business) return { error: 'Business not found.' };
  const addonsList = business.globalAddons || [];
  return { success: true, globalAddons: JSON.parse(JSON.stringify(addonsList)) };
}

export async function saveGlobalAddonsAction(restaurantId, globalAddons) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  await dbConnect();

  if (!Array.isArray(globalAddons)) {
    return { error: 'Invalid global add-ons data format.' };
  }

  const sanitized = globalAddons
    .map((a) => ({
      name: String(a.name || '').trim(),
      price: Number(a.price) || 0,
      groupName: String(a.groupName || 'General').trim(),
    }))
    .filter((a) => a.name);

  const updated = await Business.findByIdAndUpdate(
    restaurantId,
    { $set: { globalAddons: sanitized } },
    { new: true }
  ).lean();

  if (!updated) return { error: 'Failed to update global add-ons.' };

  const savedList = updated.globalAddons || sanitized;

  revalidatePath('/dashboard/menu');
  return { success: true, globalAddons: JSON.parse(JSON.stringify(savedList)) };
}

export async function applyAddonsToCategoryAction(restaurantId, categoryId, addons) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  await dbConnect();

  if (!categoryId) return { error: 'Category ID is required.' };
  if (!Array.isArray(addons)) return { error: 'Invalid add-ons data.' };

  const targetCatId = typeof categoryId === 'object' && categoryId?._id ? String(categoryId._id) : String(categoryId);
  const targetRestId = session.restaurantId || restaurantId;

  const sanitizedAddons = addons
    .map((a) => ({
      name: String(a.name || '').trim(),
      price: Number(a.price) || 0,
    }))
    .filter((a) => a.name);

  const hasAddons = sanitizedAddons.length > 0;

  // Apply atomic $set update to all menu items in this category (Tenant isolation)
  const result = await MenuItem.updateMany(
    { restaurantId: targetRestId, categoryId: targetCatId },
    { $set: { hasAddons, addons: sanitizedAddons } }
  );

  revalidatePath('/dashboard/menu');
  revalidatePath(`/${session.restaurantSlug}`);
  return { success: true, count: result.modifiedCount ?? result.matchedCount ?? 0 };
}

// ─────────────────────────────────────────────────────────────────────
// GLOBAL PRICE VARIATIONS MASTER LIBRARY
// ─────────────────────────────────────────────────────────────────────

export async function getGlobalVariantsAction(restaurantId) {
  await dbConnect();
  const business = await Business.findById(restaurantId).select('globalVariants').lean();
  if (!business) return { error: 'Business not found.' };
  const variantTemplates = business.globalVariants || [];
  return { success: true, globalVariants: JSON.parse(JSON.stringify(variantTemplates)) };
}

export async function saveGlobalVariantsAction(restaurantId, globalVariants) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  await dbConnect();

  if (!Array.isArray(globalVariants)) {
    return { error: 'Invalid global variants data format.' };
  }

  const sanitized = globalVariants
    .map((t) => ({
      templateName: String(t.templateName || '').trim(),
      variants: Array.isArray(t.variants)
        ? t.variants
            .map((v) => ({
              name: String(v.name || '').trim(),
              price: Number(v.price) || 0,
            }))
            .filter((v) => v.name)
        : [],
    }))
    .filter((t) => t.templateName && t.variants.length > 0);

  const updated = await Business.findByIdAndUpdate(
    restaurantId,
    { $set: { globalVariants: sanitized } },
    { new: true }
  ).lean();

  if (!updated) return { error: 'Failed to update global variant templates.' };

  const savedList = updated.globalVariants || sanitized;

  revalidatePath('/dashboard/menu');
  return { success: true, globalVariants: JSON.parse(JSON.stringify(savedList)) };
}

export async function applyVariantsToCategoryAction(restaurantId, categoryId, variants) {
  const session = await requireRestaurantAccess(restaurantId);
  if (session.error) return { error: session.error };

  await dbConnect();

  if (!categoryId) return { error: 'Category ID is required.' };
  if (!Array.isArray(variants)) return { error: 'Invalid variants data.' };

  const targetCatId = typeof categoryId === 'object' && categoryId?._id ? String(categoryId._id) : String(categoryId);
  const targetRestId = session.restaurantId || restaurantId;

  const sanitizedVariants = variants
    .map((v) => ({
      name: String(v.name || '').trim(),
      price: Number(v.price) || 0,
    }))
    .filter((v) => v.name);

  const hasVariants = sanitizedVariants.length > 0;
  const basePrice = hasVariants ? sanitizedVariants[0].price : 0;

  const updateFields = {
    hasVariants,
    variants: sanitizedVariants,
  };
  if (hasVariants) {
    updateFields.price = basePrice;
  }

  // Apply atomic $set update to all menu items in this category (Tenant isolation)
  const result = await MenuItem.updateMany(
    { restaurantId: targetRestId, categoryId: targetCatId },
    { $set: updateFields }
  );

  revalidatePath('/dashboard/menu');
  revalidatePath(`/${session.restaurantSlug}`);
  return { success: true, count: result.modifiedCount ?? result.matchedCount ?? 0 };
}
