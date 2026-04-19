"use server";

import dbConnect from "@/lib/db";
import Restaurant from "@/models/Restaurant";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

export async function uploadImageAction(formData) {
  // CLOUDINARY INTEGRATION:
  // Once you add Cloudinary keys to .env, I will update this to send to the cloud.
  // For now, we return an error to prevent local filesystem issues in production.
  return { error: "Cloud storage not configured. Please use Image URLs for now." };
}

export async function saveMenuItemAction(slug, item) {
  await dbConnect();
  const restaurant = await Restaurant.findOne({ slug });
  if (!restaurant) return { error: "Restaurant not found" };

  if (!item.id) {
    item.id = "m" + Date.now();
    restaurant.menuItems.push(item);
  } else {
    const itemIndex = restaurant.menuItems.findIndex(m => m.id === item.id);
    if (itemIndex !== -1) {
      restaurant.menuItems[itemIndex] = { ...restaurant.menuItems[itemIndex].toObject(), ...item };
    } else {
      return { error: "Item not found" };
    }
  }

  await restaurant.save();
  revalidatePath(`/${slug}`);
  revalidatePath(`/admin/${slug}`);
  return { success: true };
}

export async function deleteMenuItemAction(slug, itemId) {
  await dbConnect();
  const restaurant = await Restaurant.findOne({ slug });
  if (!restaurant) return { error: "Restaurant not found" };

  restaurant.menuItems = restaurant.menuItems.filter(m => m.id !== itemId);
  await restaurant.save();
  
  revalidatePath(`/${slug}`);
  revalidatePath(`/admin/${slug}`);
  return { success: true };
}

export async function updateRestaurantInfoAction(slug, updatedInfo) {
  await dbConnect();
  const restaurant = await Restaurant.findOne({ slug });
  if (!restaurant) return { error: "Restaurant not found" };

  restaurant.name = updatedInfo.name;
  restaurant.address = updatedInfo.address;
  restaurant.logo = updatedInfo.logo;
  restaurant.banner = updatedInfo.banner || restaurant.banner;
  restaurant.rating = updatedInfo.rating;
  restaurant.avgTime = updatedInfo.avgTime;
  restaurant.costForOne = updatedInfo.costForOne;
  
  await restaurant.save();
  
  revalidatePath(`/${slug}`);
  revalidatePath(`/admin/${slug}`);
  return { success: true };
}

export async function updateRestaurantCategoriesAction(slug, categories) {
  await dbConnect();
  const restaurant = await Restaurant.findOne({ slug });
  if (!restaurant) return { error: "Restaurant not found" };

  restaurant.categories = categories;
  await restaurant.save();
  
  revalidatePath(`/${slug}`);
  revalidatePath(`/admin/${slug}`);
  return { success: true };
}

export async function createRestaurantAction(restaurantData) {
  await dbConnect();
  
  let baseSlug = restaurantData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  let slug = baseSlug;
  let counter = 1;
  
  while (await Restaurant.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  const newRestaurant = new Restaurant({
    id: "r" + Date.now(),
    name: restaurantData.name,
    slug: slug,
    logo: restaurantData.logo || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80",
    banner: restaurantData.banner || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000",
    adminPassword: restaurantData.adminPassword || "password123",
    address: restaurantData.address,
    categories: ["Appetizers & Soups", "Salads", "Main Courses", "Sides", "Desserts", "Beverages"],
    menuItems: [],
    rating: 4.2,
    ratingCount: 100,
    avgTime: "20-30 mins",
    costForOne: 200,
    subscription: {
      plan: 'trial',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });
  
  await newRestaurant.save();
  revalidatePath("/admin");
  return { success: true, slug: slug };
}


export async function loginAction(username, password) {
  console.log(`Login attempt for: ${username}`);
  const MASTER_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  let role = null;
  let slug = null;

  if (username === "superadmin" && password === MASTER_PASSWORD) {
    role = "superadmin";
    console.log("Superadmin login successful");
  } else {
    try {
      await dbConnect();
      const restaurant = await Restaurant.findOne({ slug: username });
      if (restaurant && restaurant.adminPassword === password) {
        role = "admin";
        slug = restaurant.slug;
        console.log(`Admin login successful for ${slug}`);
      } else {
        console.log(`Login failed for ${username}`);
      }
    } catch (err) {
      console.error("Database error during login:", err);
      return { error: "Database connection failed" };
    }
  }

  if (role) {
    const cookieStore = await cookies();
    const sessionData = JSON.stringify({ role, slug });
    
    cookieStore.set("admin_session", sessionData, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24, 
      path: "/",
      sameSite: 'lax'
    });
    return { success: true, role, slug };
  }
  return { error: "Invalid username or password" };
}

export async function logoutAction() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}

export async function upgradeSubscriptionAction(slug) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("admin_session")?.value;
  
  if (!sessionData) return { error: "Unauthorized" };
  const session = JSON.parse(sessionData);
  if (session.role !== "superadmin") return { error: "Forbidden: Only superadmin can manage subscriptions" };

  await dbConnect();
  const restaurant = await Restaurant.findOne({ slug });
  if (!restaurant) return { error: "Restaurant not found" };

  restaurant.subscription = {
    plan: "paid",
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  };
  
  await restaurant.save();
  
  revalidatePath(`/${slug}`);
  revalidatePath(`/admin/${slug}`);
  revalidatePath(`/admin`);
  return { success: true };
}

export async function updateSubscriptionPlanAction(slug, plan) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("admin_session")?.value;
  
  if (!sessionData) return { error: "Unauthorized" };
  const session = JSON.parse(sessionData);
  if (session.role !== "superadmin") return { error: "Forbidden: Only superadmin can manage subscriptions" };

  await dbConnect();
  const restaurant = await Restaurant.findOne({ slug });
  if (!restaurant) return { error: "Restaurant not found" };

  const validUntil = plan === 'trial' 
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : plan === 'paid' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : null;

  restaurant.subscription = { plan, validUntil };
  await restaurant.save();
  
  revalidatePath(`/${slug}`);
  revalidatePath(`/admin/${slug}`);
  revalidatePath(`/admin`);
  return { success: true };
}

export async function deleteRestaurantAction(slug) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionData = cookieStore.get("admin_session")?.value;
  
  if (!sessionData) return { error: "Unauthorized" };
  const session = JSON.parse(sessionData);
  if (session.role !== "superadmin") return { error: "Forbidden: Only superadmin can delete restaurants" };

  await dbConnect();
  const result = await Restaurant.deleteOne({ slug });
  
  if (result.deletedCount === 1) {
    revalidatePath("/admin");
    return { success: true };
  } else {
    return { error: "Restaurant not found or could not be deleted" };
  }
}
