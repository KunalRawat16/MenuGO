"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Star,
  Plus,
  Check,
  Clock,
  ShoppingBag,
  SlidersHorizontal,
  Info,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCart } from "./CartContext";
import { ItemQuickViewModal, MenuItemData } from "./ItemQuickViewModal";

export interface CategoryData {
  _id: string;
  name: string;
  sortOrder: number;
}

export interface BusinessData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string | null;
  banner?: string | null;
  type?: string;
  rating?: number;
  ratingCount?: number;
  localization?: {
    language?: string;
    currency?: string;
    currencySymbol?: string;
  };
  settings?: {
    isOpen?: boolean;
    avgServiceTime?: string;
    costPerPerson?: number;
    allowWalkin?: boolean;
    allowTakeaway?: boolean;
  };
}

export interface MenuClientProps {
  business: BusinessData;
  categories: CategoryData[];
  items: MenuItemData[];
}

export function MenuClient({ business, categories, items }: MenuClientProps) {
  const searchParams = useSearchParams();
  const { addItem, setTableNumber, tableNumber, totalCount, totalAmount } = useCart();

  // Read table param from URL (e.g. /menu/my-cafe?table=T1)
  useEffect(() => {
    const tableParam = searchParams.get("table");
    if (tableParam) {
      setTableNumber(tableParam);
    }
  }, [searchParams, setTableNumber]);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dietaryFilter, setDietaryFilter] = useState<"all" | "veg" | "non-veg" | "vegan">("all");
  const [sortBy, setSortBy] = useState<"popular" | "price_asc" | "price_desc">("popular");
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItemData | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const currencySymbol = business.localization?.currencySymbol || "₹";

  // Filtered & Sorted Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Available only
      if (!item.isAvailable) return false;

      // Search match
      const queryMatch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!queryMatch) return false;

      // Category match
      if (selectedCategory && item.categoryId !== selectedCategory) return false;

      // Dietary match
      if (dietaryFilter !== "all" && item.dietary !== dietaryFilter) return false;

      return true;

    }).sort((a, b) => {
      if (sortBy === "popular") {
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      }
      if (sortBy === "price_asc") {
        return a.price - b.price;
      }
      if (sortBy === "price_desc") {
        return b.price - a.price;
      }
      return 0;
    });
  }, [items, searchQuery, selectedCategory, dietaryFilter, sortBy]);

  // Group items by category for rendering
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, MenuItemData[]> = {};
    for (const cat of categories) {
      grouped[cat._id] = filteredItems.filter((i) => (i as any).categoryId === cat._id);
    }
    // Uncategorized
    const uncategorized = filteredItems.filter(
      (i) => !(i as any).categoryId || !categories.some((c) => c._id === (i as any).categoryId)
    );
    if (uncategorized.length > 0) {
      grouped["uncategorized"] = uncategorized;
    }
    return grouped;
  }, [categories, filteredItems]);

  const handleQuickAdd = (e: React.MouseEvent, item: MenuItemData) => {
    e.stopPropagation();
    addItem({
      id: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      dietary: item.dietary,
    });

    // Flash feedback
    setAddedItemIds((prev) => ({ ...prev, [item._id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item._id]: false }));
    }, 1000);
  };

  const isStoreOpen = business.settings?.isOpen !== false;

  return (
    <div className="min-h-screen bg-slate-50 pb-28 select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. BRAND BANNER & HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        {/* Cover Banner */}
        <div className="h-44 sm:h-56 w-full relative bg-slate-800">
          {business.banner ? (
            <Image
              src={business.banner}
              alt={business.name}
              fill
              className="object-cover opacity-80"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 -mt-16 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            {/* Logo + Business Name */}
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white bg-white shadow-xl relative overflow-hidden shrink-0">
                {business.logo ? (
                  <Image
                    src={business.logo}
                    alt={business.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl">
                    {business.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                    {business.name}
                  </h1>
                  {tableNumber && (
                    <Badge variant="accent" size="sm">
                      Table {tableNumber}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
                  {business.rating !== undefined && business.rating > 0 && (
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star size={13} fill="currentColor" /> {business.rating.toFixed(1)}
                    </span>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {business.settings?.avgServiceTime || "20-30 mins"}
                  </span>
                  {business.settings?.costPerPerson ? (
                    <>
                      <span>•</span>
                      <span>
                        {currencySymbol}
                        {business.settings.costPerPerson} per person
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Store Status Badge */}
            <div className="shrink-0">
              <Badge
                variant={isStoreOpen ? "success" : "danger"}
                size="md"
                className="shadow-sm"
              >
                {isStoreOpen ? "🟢 Open Now" : "🔴 Store Closed"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Closed Store Banner Notice */}
      {!isStoreOpen && (
        <div className="bg-rose-500 text-white text-xs font-semibold px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-sm">
          <AlertCircle size={15} />
          <span>
            This establishment is currently closed for orders. You can browse the menu below.
          </span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. SEARCH & FILTER BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 space-y-3">
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search dishes or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-100/80 pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="popular">Popular First</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>

          {/* Dietary Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
            <button
              onClick={() => setDietaryFilter("all")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                dietaryFilter === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setDietaryFilter("veg")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                dietaryFilter === "veg"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
              }`}
            >
              <span>🟢</span> Pure Veg
            </button>
            <button
              onClick={() => setDietaryFilter("non-veg")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                dietaryFilter === "non-veg"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60"
              }`}
            >
              <span>🔴</span> Non-Veg
            </button>
            <button
              onClick={() => setDietaryFilter("vegan")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                dietaryFilter === "vegan"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/60"
              }`}
            >
              <span>🌿</span> Vegan
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CATEGORY SCROLLABLE TABS
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 sticky top-[108px] z-20 shadow-xs overflow-x-auto hide-scrollbar flex items-center gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedCategory === null
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Categories ({filteredItems.length})
        </button>
        {categories.map((cat) => {
          const count = itemsByCategory[cat._id]?.length || 0;
          return (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat._id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MENU ITEMS GRID / CATEGORY SECTIONS
      ───────────────────────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
              🍽️
            </div>
            <p className="text-sm font-bold text-slate-800">No menu items found</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or dietary filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setDietaryFilter("all");
                setSelectedCategory(null);
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          categories.map((cat) => {
            const catItems = itemsByCategory[cat._id] || [];
            if (catItems.length === 0) return null;

            return (
              <section key={cat._id} className="space-y-4">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2 border-b border-slate-200/80 pb-2">
                  <span>{cat.name}</span>
                  <span className="text-xs font-normal text-slate-400">
                    ({catItems.length} items)
                  </span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {catItems.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => setSelectedItemForModal(item)}
                      className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex gap-3 group relative overflow-hidden"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-100 overflow-hidden relative shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl bg-slate-50">
                            🍽️
                          </div>
                        )}

                        {/* Dietary Dot Badge */}
                        <div className="absolute top-1.5 left-1.5">
                          {item.dietary === "veg" && (
                            <span className="w-4 h-4 rounded-md bg-white border border-emerald-600 flex items-center justify-center text-[10px] text-emerald-600 font-bold">
                              🟢
                            </span>
                          )}
                          {item.dietary === "non-veg" && (
                            <span className="w-4 h-4 rounded-md bg-white border border-rose-600 flex items-center justify-center text-[10px] text-rose-600 font-bold">
                              🔴
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors">
                              {item.name}
                            </h3>
                            {item.isPopular && (
                              <span className="text-[10px] font-bold text-amber-500 flex items-center shrink-0">
                                <Star size={11} fill="currentColor" />
                              </span>
                            )}
                          </div>

                          {item.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Price + Quick Add Button */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs sm:text-sm font-extrabold text-indigo-600 tracking-tight font-heading">
                            {currencySymbol}
                            {item.price.toFixed(2)}
                          </span>

                          {isStoreOpen && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickAdd(e, item)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs ${
                                addedItemIds[item._id]
                                  ? "bg-emerald-600 text-white scale-105"
                                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200/60"
                              }`}
                            >
                              {addedItemIds[item._id] ? (
                                <>
                                  <Check size={13} strokeWidth={3} /> Added
                                </>
                              ) : (
                                <>
                                  <Plus size={13} strokeWidth={2.5} /> Add
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────
          5. FLOATING BOTTOM CART BAR
      ───────────────────────────────────────────────────────────── */}
      {totalCount > 0 && isStoreOpen && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom-4 duration-200">
          <Link href={`/${business.slug}/checkout`}>
            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between hover:bg-slate-950 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                  {totalCount}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">Order Subtotal</p>
                  <p className="text-base font-extrabold text-white tracking-tight font-heading">
                    {currencySymbol}
                    {totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                <span>View Cart / Checkout</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. QUICK VIEW MODAL
      ───────────────────────────────────────────────────────────── */}
      <ItemQuickViewModal
        item={selectedItemForModal}
        isOpen={!!selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}
