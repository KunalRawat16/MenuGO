"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Info,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Flame,
  UtensilsCrossed,
  Filter,
  CheckCircle2,
  MapPin,
  ChevronRight,
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
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    phone?: string;
  };
  tags?: string[];
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
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});

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

  // Robust category ID helper
  const getCatIdStr = (item: any): string => {
    if (!item?.categoryId) return "";
    if (typeof item.categoryId === "string") return item.categoryId;
    if (typeof item.categoryId === "object" && item.categoryId._id) return item.categoryId._id.toString();
    return String(item.categoryId);
  };

  // Filtered & Sorted Items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Available only
        if (item.isAvailable === false) return false;

        // Search match
        const queryMatch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
        if (!queryMatch) return false;

        // Category match
        if (selectedCategory) {
          const itemCatId = getCatIdStr(item);
          if (itemCatId !== selectedCategory.toString()) return false;
        }

        // Dietary match
        if (dietaryFilter !== "all" && item.dietary !== dietaryFilter) return false;

        return true;
      })
      .sort((a, b) => {
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
      const catIdStr = cat._id.toString();
      grouped[catIdStr] = filteredItems.filter((i) => getCatIdStr(i) === catIdStr);
    }
    // Uncategorized items
    const uncategorized = filteredItems.filter((i) => {
      const cId = getCatIdStr(i);
      return !cId || !categories.some((c) => c._id.toString() === cId);
    });
    if (uncategorized.length > 0) {
      grouped["uncategorized"] = uncategorized;
    }
    return grouped;
  }, [categories, filteredItems]);

  // Smooth scroll to category section
  const handleCategoryTabClick = (catId: string | null) => {
    setSelectedCategory(catId);
    if (catId && categoryRefs.current[catId]) {
      categoryRefs.current[catId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 220, behavior: "smooth" });
    }
  };

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
  const addressText = [business.address?.street, business.address?.city, business.address?.state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-slate-50/80 pb-32 select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. BRAND BANNER & HEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="relative bg-slate-950 text-white overflow-hidden shadow-md">
        {/* Cover Banner */}
        <div className="h-44 sm:h-60 w-full relative bg-slate-900">
          {business.banner ? (
            <Image
              src={business.banner}
              alt={business.name}
              fill
              className="object-cover opacity-75 transition-opacity duration-300"
              unoptimized
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 -mt-16 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            {/* Logo + Business Info */}
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-slate-950 bg-white shadow-2xl relative overflow-hidden shrink-0">
                {business.logo ? (
                  <Image
                    src={business.logo}
                    alt={business.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl">
                    {business.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                    {business.name}
                  </h1>
                  {tableNumber && (
                    <Badge variant="accent" size="sm" className="shadow-sm">
                      Table {tableNumber}
                    </Badge>
                  )}
                </div>

                {business.description && (
                  <p className="text-xs text-slate-300 line-clamp-1 max-w-lg">
                    {business.description}
                  </p>
                )}

                {/* Badges & Address Info */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium pt-1">
                  {business.rating !== undefined && business.rating > 0 && (
                    <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      <Star size={13} fill="currentColor" /> {business.rating.toFixed(1)} ({business.ratingCount || 50}+)
                    </span>
                  )}

                  <span className="flex items-center gap-1 text-slate-300">
                    <Clock size={13} className="text-indigo-400" /> {business.settings?.avgServiceTime || "20-30 mins"}
                  </span>

                  {addressText && (
                    <span className="hidden md:flex items-center gap-1 text-slate-400">
                      <MapPin size={13} className="text-rose-400" /> {addressText}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Store Status Badge */}
            <div className="shrink-0 self-start sm:self-auto">
              <Badge
                variant={isStoreOpen ? "success" : "danger"}
                size="md"
                className="shadow-sm"
              >
                {isStoreOpen ? "🟢 Open Now" : "🔴 Store Closed"}
              </Badge>
            </div>
          </div>

          {/* Tags Chips */}
          {business.tags && business.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
              {business.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800/90 text-slate-300 border border-slate-700/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Closed Store Banner Notice */}
      {!isStoreOpen && (
        <div className="bg-rose-600 text-white text-xs font-bold px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-sm">
          <AlertCircle size={15} />
          <span>
            This establishment is currently closed for orders. You can browse the menu below.
          </span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. SEARCH & DIETARY FILTER BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
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
                placeholder="Search dishes, ingredients or tags..."
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

          {/* Dietary Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-0.5">
            <button
              onClick={() => setDietaryFilter("all")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                dietaryFilter === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Dishes
            </button>
            <button
              onClick={() => setDietaryFilter("veg")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                dietaryFilter === "veg"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Pure Veg
            </button>
            <button
              onClick={() => setDietaryFilter("non-veg")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                dietaryFilter === "non-veg"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Non-Veg
            </button>
            <button
              onClick={() => setDietaryFilter("vegan")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                dietaryFilter === "vegan"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/60"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-500" /> Vegan
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CATEGORY SCROLLABLE TABS BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200/80 sticky top-[108px] z-20 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => handleCategoryTabClick(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedCategory === null
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <UtensilsCrossed size={13} />
            <span>All Categories</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === null ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {filteredItems.length}
            </span>
          </button>

          {categories.map((cat) => {
            const catIdStr = cat._id.toString();
            const count = itemsByCategory[catIdStr]?.length || 0;
            const isSelected = selectedCategory === catIdStr;

            return (
              <button
                key={catIdStr}
                onClick={() => handleCategoryTabClick(catIdStr)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. DYNAMIC MENU ITEMS SECTIONS
      ───────────────────────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
              🍽️
            </div>
            <p className="text-base font-bold text-slate-800">No matching menu items</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find any dishes matching your search or active filters. Try clearing your filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setDietaryFilter("all");
                setSelectedCategory(null);
              }}
              className="mt-2"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          categories.map((cat) => {
            const catIdStr = cat._id.toString();
            const catItems = itemsByCategory[catIdStr] || [];
            if (catItems.length === 0 && selectedCategory !== catIdStr) return null;

            return (
              <section
                key={catIdStr}
                ref={(el) => { categoryRefs.current[catIdStr] = el; }}
                className="space-y-5 scroll-mt-36"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight font-heading">
                      {cat.name}
                    </h2>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                      {catItems.length} items
                    </span>
                  </div>
                </div>

                {/* Items Grid */}
                {catItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">No items available in this category for selected filters.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {catItems.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => setSelectedItemForModal(item)}
                        className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer flex gap-4 group relative overflow-hidden"
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
                            <div className="w-full h-full flex items-center justify-center text-3xl bg-slate-50">
                              🍽️
                            </div>
                          )}

                          {/* Dietary Dot Badge */}
                          <div className="absolute top-2 left-2 z-10">
                            {item.dietary === "veg" && (
                              <span className="w-4 h-4 rounded-md bg-white border border-emerald-600 flex items-center justify-center text-[9px] font-bold text-emerald-600 shadow-xs">
                                🟢
                              </span>
                            )}
                            {item.dietary === "non-veg" && (
                              <span className="w-4 h-4 rounded-md bg-white border border-rose-600 flex items-center justify-center text-[9px] font-bold text-rose-600 shadow-xs">
                                🔴
                              </span>
                            )}
                            {item.dietary === "vegan" && (
                              <span className="w-4 h-4 rounded-md bg-white border border-sky-600 flex items-center justify-center text-[9px] font-bold text-sky-600 shadow-xs">
                                🌿
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-1">
                              <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors font-heading">
                                {item.name}
                              </h3>
                              {item.isPopular && (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 flex items-center gap-0.5 shrink-0">
                                  <Flame size={10} fill="currentColor" /> Popular
                                </span>
                              )}
                            </div>

                            {item.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            {/* Item Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                {item.tags.slice(0, 2).map((t, tidx) => (
                                  <span key={tidx} className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Price & Add Button */}
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-sm font-extrabold text-slate-900 tracking-tight font-heading">
                              {currencySymbol}
                              {item.price.toFixed(2)}
                            </span>

                            {isStoreOpen && (
                              <button
                                type="button"
                                onClick={(e) => handleQuickAdd(e, item)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs ${
                                  addedItemIds[item._id]
                                    ? "bg-emerald-600 text-white scale-105"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
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
                )}
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
            <div className="bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between hover:bg-slate-900 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md">
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

              <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                <span>View Cart & Checkout</span>
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
