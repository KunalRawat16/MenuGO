import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBusinessBySlugAction } from "@/app/actions/restaurant.actions";
import { getCategoriesAction, getMenuItemsAction } from "@/app/actions/menu.actions";
import { MenuClient } from "@/components/menu/MenuClient";
import { CartProvider } from "@/components/menu/CartContext";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getBusinessBySlugAction(slug);

  if (!res.success || !res.business) {
    return {
      title: "Business Not Found | MenuGO",
      description: "The requested business menu could not be found.",
    };
  }

  const { business } = res;

  return {
    title: `${business.name} — Digital Menu & Ordering`,
    description: business.description || `Browse digital menu and place orders online for ${business.name}.`,
    openGraph: {
      title: `${business.name} — Digital Menu`,
      description: business.description || `Browse menu and place orders online.`,
      images: business.banner ? [business.banner] : business.logo ? [business.logo] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${business.name} — Digital Menu`,
      description: business.description || `Browse menu and place orders online.`,
      images: business.banner ? [business.banner] : business.logo ? [business.logo] : [],
    },
  };
}

export default async function CustomerMenuPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch business, categories, and items concurrently
  const bizRes = await getBusinessBySlugAction(slug);

  if (!bizRes.success || !bizRes.business) {
    notFound();
  }

  const business = bizRes.business;

  const [catRes, itemsRes] = await Promise.all([
    getCategoriesAction(business._id),
    getMenuItemsAction(business._id),
  ]);

  const categories = catRes.categories || [];
  const items = itemsRes.items || [];

  return (
    <CartProvider slug={slug}>
      <MenuClient business={business} categories={categories} items={items} />
    </CartProvider>
  );
}
