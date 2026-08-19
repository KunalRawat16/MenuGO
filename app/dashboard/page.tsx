"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  X,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getOrdersAction, updateOrderStatusAction } from "@/app/actions/order.actions";
import { getMyBusinessAction } from "@/app/actions/restaurant.actions";

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  specialRequest?: string;
}

export interface OrderData {
  _id: string;
  tableNumber?: string | null;
  customerName: string;
  specialInstructions?: string;
  items: OrderItem[];
  totalAmount: number;
  status: "incoming" | "accepted" | "rejected" | "preparing" | "served" | "completed" | "cancelled";
  orderSource?: string;
  createdAt: string;
}

export default function OwnerDashboardPage() {
  const [business, setBusiness] = useState<any | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(3);
  const [isSyncing, setIsSyncing] = useState(false);
  const [mobileColumn, setMobileColumn] = useState<"all" | "incoming" | "preparing" | "served" | "completed">("all");

  // Fetch Business & Initial Orders
  const fetchData = async () => {
    setIsSyncing(true);
    try {
      const bizRes = await getMyBusinessAction();
      if (bizRes.success && bizRes.business) {
        setBusiness(bizRes.business);

        const ordersRes = await getOrdersAction(bizRes.business._id, { limit: 100 });
        if (ordersRes.success && ordersRes.orders) {
          setOrders(ordersRes.orders);
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Web Audio chime helper for incoming order alerts
  const playNewOrderChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio autoplay restrictions ignored
    }
  };

  // Real-Time Listener (SSE Push + Configurable Auto Polling Fallback)
  useEffect(() => {
    if (!business?.slug || !business?._id || refreshIntervalSec <= 0) return;

    // 1. SSE Stream listener (Instant Push)
    const eventSource = new EventSource(`/api/orders/stream?slug=${business.slug}`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.event === "order_created" && payload.order) {
          setOrders((prev) => {
            const exists = prev.some((o) => o._id === payload.order._id);
            if (!exists) playNewOrderChime();
            return [payload.order, ...prev.filter((o) => o._id !== payload.order._id)];
          });
        } else if (payload.event === "order_updated" && payload.order) {
          setOrders((prev) =>
            prev.map((o) => (o._id === payload.order._id ? payload.order : o))
          );
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    // 2. Auto-polling fallback with configurable frequency
    const interval = setInterval(async () => {
      try {
        setIsSyncing(true);
        const ordersRes = await getOrdersAction(business._id, { limit: 100 });
        if (ordersRes.success && ordersRes.orders) {
          setOrders((prev) => {
            const newOrderArrived = ordersRes.orders.some(
              (newO: any) => !prev.some((oldO) => oldO._id === newO._id)
            );
            if (newOrderArrived && prev.length > 0) {
              playNewOrderChime();
            }
            return ordersRes.orders;
          });
        }
      } catch (err) {
        console.error("Orders auto-poll error:", err);
      } finally {
        setTimeout(() => setIsSyncing(false), 500);
      }
    }, refreshIntervalSec * 1000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, [business?.slug, business?._id, refreshIntervalSec]);

  // Handle status updates
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!business?._id) return;

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as any } : o))
    );

    try {
      await updateOrderStatusAction(business._id, orderId, newStatus);
    } catch (err) {
      console.error("Status update error:", err);
      fetchData(); // Rollback on error
    }
  };

  // Metric Computations
  const completedToday = orders.filter((o) => o.status === "completed");
  const todayRevenue = completedToday.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const activeOrdersCount = orders.filter((o) =>
    ["incoming", "accepted", "preparing", "served"].includes(o.status)
  ).length;
  const avgOrderValue =
    completedToday.length > 0 ? todayRevenue / completedToday.length : 0;

  // Pipeline Columns
  const incomingOrders = orders.filter((o) => o.status === "incoming");
  const preparingOrders = orders.filter((o) =>
    ["accepted", "preparing"].includes(o.status)
  );
  const servedOrders = orders.filter((o) => o.status === "served");
  const doneOrders = orders.filter((o) => o.status === "completed");

  const currencySymbol = business?.localization?.currencySymbol || "₹";

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
            Live Kitchen & Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Real-time incoming orders, status pipeline & revenue metrics
          </p>
        </div>

        {/* Auto Sync Control Pill */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-xs text-xs font-semibold">
            <span className={`w-2 h-2 rounded-full ${refreshIntervalSec > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
            <span className="text-slate-500">Auto Sync:</span>
            <select
              value={refreshIntervalSec}
              onChange={(e) => setRefreshIntervalSec(Number(e.target.value))}
              className="bg-transparent font-bold text-indigo-600 focus:outline-none cursor-pointer"
            >
              <option value={3}>3s (Fastest)</option>
              <option value={5}>5s</option>
              <option value={10}>10s (Standard)</option>
              <option value={30}>30s</option>
              <option value={0}>Paused</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            leftIcon={<RefreshCw size={14} className={isSyncing ? "animate-spin text-indigo-600" : ""} />}
          >
            Refresh Now
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`${currencySymbol}${todayRevenue.toFixed(2)}`}
          change="+14.2%"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          title="Active Kitchen Queue"
          value={activeOrdersCount}
          change={`${incomingOrders.length} incoming`}
          trend={incomingOrders.length > 0 ? "warning" as any : "neutral"}
          icon={Clock}
        />
        <StatCard
          title="Completed Today"
          value={completedToday.length}
          change="+8 orders"
          trend="up"
          icon={CheckCircle2}
        />
        <StatCard
          title="Avg Order Value"
          value={`${currencySymbol}${avgOrderValue.toFixed(2)}`}
          change="per order"
          trend="neutral"
          icon={ShoppingBag}
        />
      </div>

      {/* Real-time Order Pipeline (Kanban Column View) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight uppercase font-heading flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-600" /> Live Order Pipeline
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Auto-updates via WebSockets / SSE
          </span>
        </div>

        {/* Mobile Filter Tabs for Android Phones */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
          <button
            onClick={() => setMobileColumn("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              mobileColumn === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Queues ({orders.length})
          </button>
          <button
            onClick={() => setMobileColumn("incoming")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              mobileColumn === "incoming"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            🟡 Incoming ({incomingOrders.length})
          </button>
          <button
            onClick={() => setMobileColumn("preparing")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              mobileColumn === "preparing"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-indigo-50 text-indigo-800 border border-indigo-200"
            }`}
          >
            🔵 Cooking ({preparingOrders.length})
          </button>
          <button
            onClick={() => setMobileColumn("served")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              mobileColumn === "served"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-sky-50 text-sky-800 border border-sky-200"
            }`}
          >
            🌐 Served ({servedOrders.length})
          </button>
          <button
            onClick={() => setMobileColumn("completed")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              mobileColumn === "completed"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}
          >
            🟢 Done ({doneOrders.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {/* Column 1: Incoming Orders */}
          <div
            className={`bg-amber-50/50 rounded-2xl border border-amber-200/80 p-4 space-y-3 min-h-[300px] md:min-h-[450px] ${
              mobileColumn !== "all" && mobileColumn !== "incoming" ? "hidden md:block" : ""
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-amber-200/80">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                🟡 Incoming ({incomingOrders.length})
              </span>
            </div>

            {incomingOrders.length === 0 ? (
              <p className="text-xs text-amber-700/60 italic text-center py-10">
                No new incoming orders
              </p>
            ) : (
              incomingOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-xl border border-amber-200 p-3.5 shadow-sm space-y-3 animate-in fade-in-50"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    {order.tableNumber ? (
                      <Badge variant="accent" size="sm">
                        Table {order.tableNumber}
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="sm">
                        Takeaway
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs font-bold text-slate-800">{order.customerName}</p>

                  <div className="space-y-1 text-xs text-slate-600">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {item.quantity}× {item.name}
                        </span>
                        <span className="font-semibold">
                          {currencySymbol}
                          {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.specialInstructions && (
                    <p className="text-[11px] text-amber-800 italic bg-amber-50 p-1.5 rounded-md">
                      "{order.specialInstructions}"
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">
                      Total: {currencySymbol}
                      {order.totalAmount?.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStatusChange(order._id, "rejected")}
                      >
                        <X size={14} />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleStatusChange(order._id, "preparing")}
                        leftIcon={<Play size={12} />}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 2: Preparing Orders */}
          <div
            className={`bg-indigo-50/50 rounded-2xl border border-indigo-200/80 p-4 space-y-3 min-h-[300px] md:min-h-[450px] ${
              mobileColumn !== "all" && mobileColumn !== "preparing" ? "hidden md:block" : ""
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-indigo-200/80">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                🔵 Preparing ({preparingOrders.length})
              </span>
            </div>

            {preparingOrders.length === 0 ? (
              <p className="text-xs text-indigo-700/60 italic text-center py-10">
                Kitchen queue empty
              </p>
            ) : (
              preparingOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-xl border border-indigo-200 p-3.5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    {order.tableNumber ? (
                      <Badge variant="accent" size="sm">
                        Table {order.tableNumber}
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="sm">
                        Takeaway
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs font-bold text-slate-800">{order.customerName}</p>

                  <div className="space-y-1 text-xs text-slate-600">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {item.quantity}× {item.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">
                      {currencySymbol}
                      {order.totalAmount?.toFixed(2)}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStatusChange(order._id, "served")}
                    >
                      Mark Served →
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 3: Served Orders */}
          <div
            className={`bg-sky-50/50 rounded-2xl border border-sky-200/80 p-4 space-y-3 min-h-[300px] md:min-h-[450px] ${
              mobileColumn !== "all" && mobileColumn !== "served" ? "hidden md:block" : ""
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-sky-200/80">
              <span className="text-xs font-extrabold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                🌐 Served ({servedOrders.length})
              </span>
            </div>

            {servedOrders.length === 0 ? (
              <p className="text-xs text-sky-700/60 italic text-center py-10">
                No orders waiting for payment
              </p>
            ) : (
              servedOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-xl border border-sky-200 p-3.5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <Badge variant="success" size="sm">
                      Served
                    </Badge>
                  </div>

                  <p className="text-xs font-bold text-slate-800">{order.customerName}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">
                      {currencySymbol}
                      {order.totalAmount?.toFixed(2)}
                    </span>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleStatusChange(order._id, "completed")}
                      leftIcon={<Check size={14} />}
                    >
                      Complete & Paid
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 4: Completed Orders */}
          <div
            className={`bg-emerald-50/50 rounded-2xl border border-emerald-200/80 p-4 space-y-3 min-h-[300px] md:min-h-[450px] ${
              mobileColumn !== "all" && mobileColumn !== "completed" ? "hidden md:block" : ""
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                🟢 Completed Today ({doneOrders.length})
              </span>
            </div>

            {doneOrders.length === 0 ? (
              <p className="text-xs text-emerald-700/60 italic text-center py-10">
                No completed orders yet
              </p>
            ) : (
              doneOrders.slice(0, 5).map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-xl border border-emerald-200 p-3 shadow-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-700">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600">
                      {currencySymbol}
                      {order.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {order.customerName} • {order.items?.length} items
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
