"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  ShoppingBag,
  Award,
  ArrowUpRight,
  Download,
  Search,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { getMyBusinessAction } from "@/app/actions/restaurant.actions";
import { getOrdersAction } from "@/app/actions/order.actions";

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

export default function AnalyticsPage() {
  const [business, setBusiness] = useState<any | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("7d");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<OrderData | null>(null);

  // Fetch Business & Orders
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const bizRes = await getMyBusinessAction();
      if (bizRes.success && bizRes.business) {
        setBusiness(bizRes.business);

        const ordersRes = await getOrdersAction(bizRes.business._id, { limit: 500 });
        if (ordersRes.success && ordersRes.orders) {
          setOrders(ordersRes.orders);
        }
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currencySymbol = business?.localization?.currencySymbol || "₹";

  // Filter orders by time range
  const filteredOrdersByPeriod = useMemo(() => {
    const now = Date.now();
    const daysMs = timeRange === "7d" ? 7 * 86400000 : timeRange === "30d" ? 30 * 86400000 : 3650 * 86400000;
    
    return orders.filter((o) => {
      const orderTime = new Date(o.createdAt).getTime();
      return now - orderTime <= daysMs;
    });
  }, [orders, timeRange]);

  // Compute Metrics from real orders
  const completedOrders = useMemo(() => {
    return filteredOrdersByPeriod.filter((o) => o.status === "completed");
  }, [filteredOrdersByPeriod]);

  const totalPeriodRevenue = useMemo(() => {
    return completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [completedOrders]);

  const avgOrderValue = useMemo(() => {
    return completedOrders.length > 0 ? totalPeriodRevenue / completedOrders.length : 0;
  }, [completedOrders, totalPeriodRevenue]);

  // Compute Daily Sales Trend (Mon-Sun or Last 7 Days)
  const revenueChartData = useMemo(() => {
    const daysMap: Record<string, number> = {};

    if (timeRange === "7d") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const last7Days: { key: string; label: string; dateStr: string }[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const dayLabel = days[d.getDay()];
        last7Days.push({ key: dateStr, label: dayLabel, dateStr });
        daysMap[dateStr] = 0;
      }

      for (const order of completedOrders) {
        const orderDateStr = new Date(order.createdAt).toISOString().split("T")[0];
        if (daysMap[orderDateStr] !== undefined) {
          daysMap[orderDateStr] += order.totalAmount || 0;
        }
      }

      return last7Days.map((d) => ({
        label: d.label,
        revenue: daysMap[d.dateStr] || 0,
      }));
    } else {
      // 30 Days grouping by week or day
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const last7Days: { key: string; label: string; dateStr: string }[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i * 4);
        const dateStr = d.toISOString().split("T")[0];
        const dayLabel = days[d.getDay()];
        last7Days.push({ key: dateStr, label: dayLabel, dateStr });
        daysMap[dateStr] = 0;
      }

      for (const order of completedOrders) {
        const orderDateStr = new Date(order.createdAt).toISOString().split("T")[0];
        if (daysMap[orderDateStr] !== undefined) {
          daysMap[orderDateStr] += order.totalAmount || 0;
        }
      }

      return last7Days.map((d) => ({
        label: d.label,
        revenue: daysMap[d.dateStr] || 0,
      }));
    }
  }, [completedOrders, timeRange]);

  const maxRevenueInChart = useMemo(() => {
    const max = Math.max(...revenueChartData.map((d) => d.revenue));
    return max > 0 ? max : 100;
  }, [revenueChartData]);

  // Aggregate Top Selling Dishes
  const topSellingItems = useMemo(() => {
    const itemMap: Record<string, { name: string; sales: number; revenue: number }> = {};

    for (const order of completedOrders) {
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const key = item.name;
          if (!itemMap[key]) {
            itemMap[key] = { name: item.name, sales: 0, revenue: 0 };
          }
          itemMap[key].sales += item.quantity || 1;
          itemMap[key].revenue += (item.price || 0) * (item.quantity || 1);
        }
      }
    }

    const list = Object.values(itemMap).sort((a, b) => b.sales - a.sales);
    const maxSales = list.length > 0 ? list[0].sales : 1;

    return list.slice(0, 5).map((item) => ({
      ...item,
      percentage: Math.min(100, Math.round((item.sales / maxSales) * 100)),
    }));
  }, [completedOrders]);

  // Filter Order History Table
  const filteredHistoryOrders = useMemo(() => {
    return filteredOrdersByPeriod.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = o._id.toLowerCase().includes(q);
        const matchName = o.customerName.toLowerCase().includes(q);
        const matchTable = o.tableNumber && o.tableNumber.toLowerCase().includes(q);
        const matchItem = o.items.some((i) => i.name.toLowerCase().includes(q));
        if (!matchId && !matchName && !matchTable && !matchItem) return false;
      }

      return true;
    });
  }, [filteredOrdersByPeriod, statusFilter, searchQuery]);

  // ─────────────────────────────────────────────────────────────
  // 1-CLICK EXCEL / CSV EXPORT FUNCTION
  // ─────────────────────────────────────────────────────────────
  const exportToExcelCSV = () => {
    if (orders.length === 0) {
      alert("No order history available to export.");
      return;
    }

    const headers = [
      "Order ID",
      "Date & Time",
      "Customer Name",
      "Order Type",
      "Table Number",
      "Itemized Dishes",
      "Total Amount (INR)",
      "Order Status",
    ];

    const csvRows = [headers.join(",")];

    for (const o of filteredHistoryOrders) {
      const dateStr = new Date(o.createdAt).toLocaleString("en-IN").replace(/,/g, "");
      const itemsFormatted = o.items
        .map((i) => `${i.quantity}x ${i.name} (Rs.${i.price})`)
        .join(" | ")
        .replace(/"/g, '""');

      const row = [
        `"#${o._id.slice(-6).toUpperCase()}"`,
        `"${dateStr}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.orderSource || "Dine-in"}"`,
        `"${o.tableNumber || "N/A"}"`,
        `"${itemsFormatted}"`,
        `${o.totalAmount.toFixed(2)}`,
        `"${o.status.toUpperCase()}"`,
      ];
      csvRows.push(row.join(","));
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const filename = `MenuGO_Orders_Report_${business?.slug || "restaurant"}_${new Date().toISOString().split("T")[0]}.csv`;
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & TIME RANGE SELECTOR
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
            <BarChart3 size={22} className="text-indigo-600" /> Analytics & Sales Insights
          </h1>
          <p className="text-xs text-slate-500">
            Real-time performance metrics, sales trends, top-selling dishes & exported receipts for {business?.name || "your business"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === "7d"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === "30d"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === "all"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Time
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            leftIcon={<RefreshCw size={14} className={isLoading ? "animate-spin text-indigo-600" : ""} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. KPI SUMMARY CARDS (Dynamic from MongoDB)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Period Sales Revenue"
          value={`${currencySymbol}${totalPeriodRevenue.toFixed(2)}`}
          change={`${completedOrders.length} completed orders`}
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          title="Orders Completed"
          value={`${completedOrders.length} orders`}
          change={`Out of ${filteredOrdersByPeriod.length} total`}
          trend="up"
          icon={ShoppingBag}
        />
        <StatCard
          title="Average Basket Value"
          value={`${currencySymbol}${avgOrderValue.toFixed(2)}`}
          change="per completed order"
          trend="neutral"
          icon={Award}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CHARTS GRID (Daily Revenue + Top Selling Dishes)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Daily Revenue Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
              <BarChart3 size={16} className="text-indigo-600" /> Revenue Trend ({timeRange.toUpperCase()})
            </h2>
            <Badge variant="success" size="sm">
              Live DB Sync
            </Badge>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
            {revenueChartData.map((item, idx) => {
              const heightPercent = maxRevenueInChart > 0 ? (item.revenue / maxRevenueInChart) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {currencySymbol}{item.revenue.toFixed(0)}
                  </span>
                  <div className="w-full bg-indigo-50/80 rounded-t-xl h-44 flex items-end justify-center p-1">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t-lg transition-all duration-500 group-hover:brightness-110 shadow-xs"
                      style={{ height: `${Math.max(6, heightPercent)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Items Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
              <Award size={16} className="text-amber-500" /> Top Selling Dishes
            </h2>
            <span className="text-xs text-slate-400">By sales volume</span>
          </div>

          {topSellingItems.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-12">
              No completed order data available for this time range yet.
            </p>
          ) : (
            <div className="space-y-3.5">
              {topSellingItems.map((item, idx) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 line-clamp-1">
                      #{idx + 1} {item.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-500">{item.sales} sold</span>
                      <span className="font-extrabold text-indigo-600 font-heading">
                        {currencySymbol}{item.revenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. ORDER HISTORY TABLE & EXCEL / CSV EXPORT
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5 shadow-sm">
        {/* Table Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-emerald-600" /> Order History & Sales Reports
            </h2>
            <p className="text-xs text-slate-500">
              Audit historical completed and active orders with itemized breakdown and 1-click Excel export
            </p>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={exportToExcelCSV}
            leftIcon={<Download size={15} />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold"
          >
            Export to Excel / CSV
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Order ID, Customer, Table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Statuses ({filteredOrdersByPeriod.length})
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === "completed" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              Completed ({filteredOrdersByPeriod.filter((o) => o.status === "completed").length})
            </button>
            <button
              onClick={() => setStatusFilter("cancelled")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === "cancelled" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              Cancelled / Rejected
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Table / Type</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistoryOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 italic">
                    No orders match your active filter.
                  </td>
                </tr>
              ) : (
                filteredHistoryOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {order.tableNumber ? (
                        <span className="font-bold text-indigo-600">Table {order.tableNumber}</span>
                      ) : (
                        <span className="text-slate-500">Takeaway</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-700">
                      {order.items?.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-slate-900 font-heading">
                      {currencySymbol}{order.totalAmount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "success"
                            : order.status === "cancelled" || order.status === "rejected"
                            ? "danger"
                            : "accent"
                        }
                        size="sm"
                      >
                        {order.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrderForModal(order)}
                        leftIcon={<Eye size={13} />}
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. ITEMIZED ORDER RECEIPT MODAL
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!selectedOrderForModal}
        onClose={() => setSelectedOrderForModal(null)}
        title={`Itemized Receipt #${selectedOrderForModal?._id?.slice(-6).toUpperCase()}`}
        maxWidth="md"
      >
        {selectedOrderForModal && (
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">{selectedOrderForModal.customerName}</p>
                <p className="text-[11px] text-slate-500">
                  {new Date(selectedOrderForModal.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <Badge variant={selectedOrderForModal.status === "completed" ? "success" : "accent"}>
                {selectedOrderForModal.status.toUpperCase()}
              </Badge>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl p-3 bg-white">
              {selectedOrderForModal.items?.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{item.quantity}× {item.name}</p>
                    {item.specialRequest && (
                      <p className="text-[10px] text-amber-700 italic">Note: {item.specialRequest}</p>
                    )}
                  </div>
                  <span className="font-bold text-slate-900 font-heading">
                    {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-indigo-50 border border-indigo-100 font-extrabold text-sm">
              <span className="text-slate-900">Total Paid:</span>
              <span className="text-indigo-600 font-heading">
                {currencySymbol}{selectedOrderForModal.totalAmount?.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
