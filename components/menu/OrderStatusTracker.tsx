"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Utensils,
  ArrowLeft,
  Flame,
  ShoppingBag,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getOrderByIdPublicAction } from "@/app/actions/order.actions";

export interface OrderStatusTrackerProps {
  initialOrder: any;
  slug: string;
}

const STEPS = [
  { key: "incoming", label: "Order Received", desc: "Sent to kitchen" },
  { key: "preparing", label: "Preparing", desc: "Chef is cooking" },
  { key: "served", label: "Served / Ready", desc: "Delivered to table" },
  { key: "completed", label: "Completed & Paid", desc: "Order finished" },
];

export function OrderStatusTracker({ initialOrder, slug }: OrderStatusTrackerProps) {
  const [order, setOrder] = useState(initialOrder);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLatestOrder = async () => {
    if (!order?._id) return;
    setIsRefreshing(true);
    try {
      const res = await getOrderByIdPublicAction(order._id);
      if (res.success && res.order) {
        setOrder(res.order);
      }
    } catch (err) {
      console.error("Order refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Real-time SSE listener for instant status updates from the kitchen
  useEffect(() => {
    if (!slug || !order?._id) return;

    const eventSource = new EventSource(`/api/orders/stream?slug=${slug}`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === "order_updated" && payload.order?._id === order._id) {
          setOrder(payload.order);
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [slug, order?._id]);

  const currentStatus = order?.status || "incoming";
  const isRejected = currentStatus === "rejected" || currentStatus === "cancelled";

  // Calculate current active step index (0 to 3)
  const getStepIndex = (status: string) => {
    if (status === "incoming") return 0;
    if (status === "accepted" || status === "preparing") return 1;
    if (status === "served") return 2;
    if (status === "completed") return 3;
    return 0;
  };

  const activeStep = getStepIndex(currentStatus);

  return (
    <div className="min-h-screen bg-slate-50 pb-16 select-none">
      {/* Top Navigation */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <Link
          href={`/${slug}`}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} /> Digital Menu
        </Link>
        <h1 className="text-sm font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-1.5">
          <Sparkles size={15} className="text-amber-500" /> Live Order Tracking
        </h1>
        <button
          onClick={fetchLatestOrder}
          className="p-2 text-slate-400 hover:text-slate-700 transition-colors"
          title="Refresh Order Status"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin text-indigo-600" : ""} />
        </button>
      </header>

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Rejection Alert Box */}
        {isRejected ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3 shadow-sm animate-in fade-in-50">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-rose-900 font-heading">
                Order Cancelled / Rejected
              </h2>
              <p className="text-xs text-rose-700">
                We're sorry, the kitchen was unable to process this order. Please speak with your server or front desk.
              </p>
            </div>
          </div>
        ) : (
          /* Live Progress Tracker Card */
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xl space-y-6 animate-in zoom-in-95">
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Ticket #{order._id?.slice(-6).toUpperCase()}
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 font-heading">
                  Hello, {order.customerName}!
                </h2>
              </div>
              <Badge
                variant={
                  currentStatus === "completed"
                    ? "success"
                    : currentStatus === "served"
                    ? "info"
                    : currentStatus === "preparing"
                    ? "accent"
                    : "warning"
                }
                size="md"
                className="shadow-xs"
              >
                {currentStatus === "incoming" && "🟡 Order Received"}
                {(currentStatus === "accepted" || currentStatus === "preparing") && "🔵 Cooking in Kitchen"}
                {currentStatus === "served" && "🌐 Served to Table"}
                {currentStatus === "completed" && "🟢 Order Finished"}
              </Badge>
            </div>

            {/* 4-Step Animated Progress Bar */}
            <div className="space-y-6 pt-2">
              <div className="relative flex items-center justify-between">
                {/* Background Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 -z-0" />
                {/* Active Progress Line */}
                <div
                  className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 transition-all duration-500 -z-0"
                  style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((step, idx) => {
                  const isDone = activeStep > idx;
                  const isCurrent = activeStep === idx;

                  return (
                    <div
                      key={step.key}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                        isDone
                          ? "bg-emerald-500 text-white shadow-sm"
                          : isCurrent
                          ? "bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110 shadow-md animate-pulse"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {isDone ? <CheckCircle2 size={18} /> : idx + 1}
                    </div>
                  );
                })}
              </div>

              {/* Status Step Descriptions Grid */}
              <div className="grid grid-cols-4 text-center gap-1">
                {STEPS.map((step, idx) => {
                  const isCurrent = activeStep === idx;
                  const isDone = activeStep > idx;

                  return (
                    <div key={step.key} className="space-y-0.5">
                      <p
                        className={`text-[11px] font-bold tracking-tight ${
                          isCurrent
                            ? "text-indigo-600 font-extrabold"
                            : isDone
                            ? "text-emerald-700 font-semibold"
                            : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-tight hidden sm:block">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Order Details & Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <ShoppingBag size={15} className="text-indigo-600" /> Itemized Order Details
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">
                    {item.quantity}× {item.name}
                  </p>
                  {item.specialRequest && (
                    <p className="text-[10px] text-amber-700 italic">
                      Note: {item.specialRequest}
                    </p>
                  )}
                </div>
                <span className="font-extrabold text-slate-900 font-heading">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-extrabold">
            <span className="text-slate-900 font-heading">Total Amount:</span>
            <span className="text-indigo-600 text-sm font-heading">
              ₹{order.totalAmount?.toFixed(2)}
            </span>
          </div>

          {order.tableNumber && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Assigned Table:</span>
              <span className="font-bold text-indigo-600">Table {order.tableNumber}</span>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link href={`/${slug}`}>
            <Button variant="outline" className="w-full justify-center">
              ← Back to Digital Menu
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
