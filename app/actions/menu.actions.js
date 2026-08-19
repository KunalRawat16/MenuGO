'use server';

import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import MenuItem from '@/models/MenuItem';
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
