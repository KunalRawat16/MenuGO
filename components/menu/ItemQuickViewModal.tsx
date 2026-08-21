"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Minus, X, Star, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "./CartContext";

export interface MenuItemVariant {
  name: string;
  price: number;
}

export interface MenuItemAddon {
  name: string;
  price: number;
}

export interface MenuItemData {
  _id: string;
  categoryId?: string;
  category?: string;
  name: string;
  description?: string;
  price: number;
  image?: string | null;
  dietary?: "veg" | "non-veg" | "vegan";
  isAvailable?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  allergens?: string[];
  hasVariants?: boolean;
  variants?: MenuItemVariant[];
  hasAddons?: boolean;
  addons?: MenuItemAddon[];
}

export interface ItemQuickViewModalProps {
  item: MenuItemData | null;
  isOpen: boolean;
  onClose: () => void;
  currencySymbol?: string;
}

export function ItemQuickViewModal({
  item,
  isOpen,
  onClose,
  currencySymbol = "₹",
}: ItemQuickViewModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [specialRequest, setSpecialRequest] = useState("");
  const [addedToast, setAddedToast] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedAddonIndexes, setSelectedAddonIndexes] = useState<number[]>([]);

  // Reset state when item changes
  React.useEffect(() => {
    setSelectedVariantIndex(0);
    setSelectedAddonIndexes([]);
    setQuantity(1);
    setSpecialRequest("");
  }, [item?._id]);

  if (!item) return null;

  const hasVariants = !!(item.hasVariants && item.variants && item.variants.length > 0);
  const currentVariant = hasVariants && item.variants ? item.variants[selectedVariantIndex] || item.variants[0] : null;
  const baseUnitPrice = currentVariant ? currentVariant.price : item.price;

  const hasAddons = !!(item.hasAddons && item.addons && item.addons.length > 0);

  const selectedAddonsTotal = hasAddons && item.addons
    ? selectedAddonIndexes.reduce((sum, idx) => sum + (item.addons![idx]?.price || 0), 0)
    : 0;

  const unitPrice = baseUnitPrice + selectedAddonsTotal;

  const toggleAddonIndex = (index: number) => {
    setSelectedAddonIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleAddToCart = () => {
    const chosenAddons = hasAddons && item.addons
      ? selectedAddonIndexes.map((idx) => item.addons![idx]).filter(Boolean)
      : undefined;

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: item._id,
        name: item.name,
        price: unitPrice,
        variantName: currentVariant ? currentVariant.name : undefined,
        selectedAddons: chosenAddons,
        image: item.image,
        dietary: item.dietary,
        specialRequest: specialRequest.trim() || undefined,
      });
    }
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
      setQuantity(1);
      setSpecialRequest("");
      setSelectedAddonIndexes([]);
    }, 600);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-4 -mx-6 -mt-6">
        {/* High-Resolution Header Image */}
        <div className="relative w-full aspect-[16/9] bg-slate-100 overflow-hidden">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-100">
              🍽️
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {item.isPopular && (
              <Badge variant="accent" size="sm">
                ⭐ Popular Choice
              </Badge>
            )}
            {item.dietary === "veg" && (
              <Badge variant="success" size="sm">
                🟢 Pure Veg
              </Badge>
            )}
            {item.dietary === "non-veg" && (
              <Badge variant="danger" size="sm">
                🔴 Non-Veg
              </Badge>
            )}
            {item.dietary === "vegan" && (
              <Badge variant="info" size="sm">
                🌿 Vegan
              </Badge>
            )}
          </div>
        </div>

        {/* Item Details Content */}
        <div className="px-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
                {item.name}
              </h2>
              <p className="text-lg font-extrabold text-indigo-600 mt-0.5">
                {currencySymbol}
                {unitPrice.toFixed(2)}
                {currentVariant && (
                  <span className="text-xs font-semibold text-slate-500 ml-1.5 font-sans">
                    ({currentVariant.name})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {item.description}
            </p>
          )}

          {/* Price Variant Selector */}
          {hasVariants && item.variants && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                Select Size / Option *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {item.variants.map((v, idx) => {
                  const isSelected = selectedVariantIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs font-bold truncate">{v.name}</span>
                      <span className="text-xs font-extrabold text-indigo-600 font-heading mt-1">
                        {currencySymbol}{v.price.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Smart Add-ons / Extras Checkbox Selection */}
          {hasAddons && item.addons && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                Select Add-ons / Extras (Optional)
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {item.addons.map((a, idx) => {
                  const isChecked = selectedAddonIndexes.includes(idx);
                  return (
                    <label
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? "border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-2xs font-semibold"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAddonIndex(idx)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-xs">{a.name}</span>
                      </div>
                      <span className="text-xs font-extrabold text-indigo-600 font-heading">
                        +{currencySymbol}{a.price.toFixed(2)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Allergens & Tags */}
          {(item.tags?.length || item.allergens?.length) && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {item.allergens && item.allergens.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                  <AlertTriangle size={13} className="text-amber-500" />
                  <span>Contains allergens: {item.allergens.join(", ")}</span>
                </div>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Customization Note */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              Special Kitchen Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. less spicy, no onions, extra sauce"
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Action: Quantity Selector + Add CTA */}
          <div className="pt-4 flex items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center font-extrabold text-slate-900 text-sm">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Add to Cart CTA */}
            <Button
              variant="default"
              size="lg"
              className="flex-1 justify-center shadow-md"
              onClick={handleAddToCart}
              leftIcon={
                addedToast ? (
                  <CheckCircle2 size={18} className="text-emerald-300" />
                ) : (
                  <Plus size={18} />
                )
              }
            >
              {addedToast
                ? "Added to Order!"
                : `Add to Order • ${currencySymbol}${(
                    unitPrice * quantity
                  ).toFixed(2)}`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
