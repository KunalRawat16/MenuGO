"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Minus, X, Star, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCart } from "./CartContext";

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

  if (!item) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: item._id,
        name: item.name,
        price: item.price,
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
                {item.price.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {item.description}
            </p>
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
                    item.price * quantity
                  ).toFixed(2)}`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
