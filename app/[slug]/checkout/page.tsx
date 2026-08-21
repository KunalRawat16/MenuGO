"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Utensils,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCart, CartProvider } from "@/components/menu/CartContext";
import { createOrderAction } from "@/app/actions/order.actions";
import { getBusinessBySlugAction } from "@/app/actions/restaurant.actions";

interface CheckoutPageProps {
  params: Promise<{ slug: string }>;
}

function CheckoutContent({ slug }: { slug: string }) {
  const router = useRouter();
  const {
    items,
    tableNumber,
    setTableNumber,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalAmount,
    totalCount,
    isLoaded,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [orderSource, setOrderSource] = useState<"dine-in" | "takeaway">("dine-in");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  const [upsells, setUpsells] = useState<{ name: string; price: number; isEnabled: boolean }[]>([
    { name: "Mineral Water Bottle (1L)", price: 20, isEnabled: true },
  ]);

  useEffect(() => {
    getBusinessBySlugAction(slug).then((res) => {
      if (res.success && res.business) {
        const customUpsells = res.business.settings?.cartUpsells;
        if (Array.isArray(customUpsells) && customUpsells.length > 0) {
          setUpsells(
            customUpsells.map((u: any) => ({
              name: u.name,
              price: Number(u.price) || 0,
              isEnabled: u.isEnabled !== false,
            }))
          );
        }
      }
    });
  }, [slug]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!customerName.trim()) {
      setError("Please enter your name.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const orderPayload = {
        restaurantSlug: slug,
        tableNumber: orderSource === "dine-in" ? tableNumber || "T1" : null,
        customerName: customerName.trim(),
        specialInstructions: specialInstructions.trim(),
        items: items.map((item) => ({
          menuItemId: item.menuItemId || item.id,
          name: item.variantName ? `${item.name} (${item.variantName})` : item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || null,
          dietary: item.dietary || null,
          variantName: item.variantName || null,
          addons: item.selectedAddons || [],
          specialRequest: item.specialRequest || null,
        })),
        totalAmount,
        orderSource,
      };

      const res = await createOrderAction(orderPayload);

      if (res.error) {
        setError(res.error);
        setIsLoading(false);
      } else if (res.success && res.order) {
        setPlacedOrder(res.order);
        clearCart();
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Order error:", err);
      setError("Failed to place order. Please try again.");
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // ORDER PLACED CONFIRMATION SCREEN
  // ─────────────────────────────────────────────────────────────
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 select-none">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-2xl p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              Order Sent to Kitchen
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              Thank You, {placedOrder.customerName}!
            </h1>
            <p className="text-xs text-slate-500">
              Your order has been received and is now in the kitchen pipeline.
            </p>
          </div>

          {/* Order Ticket Info */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-500">Order ID:</span>
              <span className="font-mono font-bold text-slate-900">
                #{placedOrder._id?.slice(-6).toUpperCase()}
              </span>
            </div>

            {placedOrder.tableNumber && (
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-500">Table:</span>
                <span className="font-bold text-indigo-600">Table {placedOrder.tableNumber}</span>
              </div>
            )}

            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-500">Items Ordered:</span>
              <span className="font-bold text-slate-900">{placedOrder.items?.length} items</span>
            </div>

            <div className="flex justify-between items-center pt-1 font-extrabold text-sm">
              <span className="text-slate-900">Total Paid/Due:</span>
              <span className="text-indigo-600">₹{placedOrder.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link href={`/${slug}/orders/${placedOrder._id}`}>
              <Button variant="default" className="w-full justify-center shadow-md font-bold">
                🚀 Track Live Order Status →
              </Button>
            </Link>

            <Link href={`/${slug}`}>
              <Button variant="ghost" className="w-full justify-center text-xs">
                Back to Digital Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // CHECKOUT FORM SCREEN
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 pb-16 select-none">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <Link
          href={`/${slug}`}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Menu
        </Link>
        <h1 className="text-sm font-extrabold text-slate-900 tracking-tight font-heading">
          Checkout & Confirmation
        </h1>
        <div className="w-16" />
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {!isLoaded ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Restoring your cart...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag size={28} />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Your cart is empty
              </h2>
              <p className="text-xs text-slate-500">
                Browse our digital menu and add your favorite dishes.
              </p>
            </div>
            <Link href={`/${slug}`}>
              <Button variant="default" size="md">
                Browse Menu
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Cart Quick Upsells Banner (Water Bottle & Extras) */}
            {upsells.filter((u) => u.isEnabled !== false && u.name).length > 0 && (
              <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-2xl p-4 shadow-md space-y-3 relative overflow-hidden border border-indigo-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5 font-heading">
                    <Sparkles size={14} className="text-amber-400 animate-bounce" />
                    Frequently Added Extras & Drinks
                  </span>
                  <span className="text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full font-bold text-slate-200 border border-white/10">
                    1-Tap Add
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {upsells
                    .filter((u) => u.isEnabled !== false && u.name)
                    .map((upsell, idx) => {
                      const upsellId = `upsell-${upsell.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
                      const existingItem = items.find((i) => i.id === upsellId);

                      return (
                        <div
                          key={idx}
                          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 flex items-center gap-3 transition-all hover:bg-white/15"
                        >
                          <div className="text-left">
                            <p className="text-xs font-bold text-white leading-tight">
                              {upsell.name}
                            </p>
                            <p className="text-[11px] text-amber-300 font-extrabold">
                              ₹{upsell.price.toFixed(2)}
                            </p>
                          </div>

                          {existingItem ? (
                            <div className="flex items-center gap-1 bg-white text-slate-900 rounded-lg p-0.5 font-bold text-xs shadow-xs">
                              <button
                                type="button"
                                onClick={() => updateQuantity(existingItem.id, -1)}
                                className="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
                              >
                                <Minus size={11} />
                              </button>
                              <span className="w-5 text-center font-bold">{existingItem.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(existingItem.id, 1)}
                                className="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                addItem({
                                  id: upsellId,
                                  menuItemId: upsellId,
                                  name: upsell.name,
                                  price: upsell.price,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Plus size={13} /> Add
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 1. Itemized Order Summary */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase font-heading flex items-center gap-2">
                <ShoppingBag size={16} className="text-indigo-600" /> Itemized Order Summary ({totalCount})
              </h2>

              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                        {item.variantName && (
                          <span className="ml-1 text-[11px] text-indigo-600 font-semibold">
                            ({item.variantName})
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 font-semibold">
                        ₹{item.price.toFixed(2)} × {item.quantity} = ₹
                        {(item.price * item.quantity).toFixed(2)}
                      </p>
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <p className="text-[10px] text-indigo-700 font-medium">
                          + Extras: {item.selectedAddons.map((a) => `${a.name} (+₹${a.price})`).join(", ")}
                        </p>
                      )}
                      {item.specialRequest && (
                        <p className="text-[10px] text-amber-700 italic">
                          Note: {item.specialRequest}
                        </p>
                      )}
                    </div>

                    {/* Quantity Adjustment Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-slate-600 hover:bg-slate-100"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center font-bold text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-slate-600 hover:bg-slate-100"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Customer & Dining Details */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase font-heading flex items-center gap-2">
                <Utensils size={16} className="text-indigo-600" /> Customer & Service Info
              </h2>

              {/* Order Source Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOrderSource("dine-in")}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    orderSource === "dine-in"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  🍽️ Dine-in / Table Order
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSource("takeaway")}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    orderSource === "takeaway"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  🛍️ Takeaway / Pickup
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name *"
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />

                {orderSource === "dine-in" && (
                  <Input
                    label="Table Number"
                    placeholder="e.g. T1, T2, T5"
                    value={tableNumber || "T1"}
                    onChange={(e) => setTableNumber(e.target.value)}
                    helperText="Pre-filled from QR code scan"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  Kitchen Notes / Special Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please bring water first, less spicy..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* 3. Totals & Submit */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Subtotal ({totalCount} items):</span>
                <span className="font-bold text-slate-900">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Taxes & Service Charge:</span>
                <span className="font-bold text-emerald-600">Included</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm font-extrabold text-slate-900 font-heading">
                  Grand Total:
                </span>
                <span className="text-xl font-black text-indigo-600 font-heading">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full justify-center shadow-md mt-4"
                isLoading={isLoading}
              >
                Send Order to Kitchen • ₹{totalAmount.toFixed(2)}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = use(params);

  return (
    <CartProvider slug={slug}>
      <CheckoutContent slug={slug} />
    </CartProvider>
  );
}
