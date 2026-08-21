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
  Trash2,
  Edit3,
  Plus,
  AlertTriangle,
  FileText,
  Star,
  MessageSquare,
  Heart,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { getMyBusinessAction } from "@/app/actions/restaurant.actions";
import {
  getOrdersAction,
  createOrderAction,
  deleteOrderAction,
  deleteOrdersByDateRangeAction,
  updateOrderDetailsAction,
} from "@/app/actions/order.actions";

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
  rating?: number | null;
  feedback?: string;
  feedbackSubmittedAt?: string | null;
}

export default function AnalyticsPage() {
  const [business, setBusiness] = useState<any | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("7d");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  
  // Custom Date Range Filters for Order History
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");

  // Modals state
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<OrderData | null>(null);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<OrderData | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);

  // Edit Form State
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editTableNumber, setEditTableNumber] = useState("");
  const [editStatus, setEditStatus] = useState<any>("completed");
  const [editTotalAmount, setEditTotalAmount] = useState<number>(0);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  // Create Manual Order Form State
  const [createCustomerName, setCreateCustomerName] = useState("Walk-in Guest");
  const [createTableNumber, setCreateTableNumber] = useState("");
  const [createItemName, setCreateItemName] = useState("");
  const [createItemPrice, setCreateItemPrice] = useState<string>("100");
  const [createItemQty, setCreateItemQty] = useState<string>("1");
  const [createStatus, setCreateStatus] = useState<any>("completed");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Purge / Delete Date Range State
  const [purgeStartDate, setPurgeStartDate] = useState<string>("");
  const [purgeEndDate, setPurgeEndDate] = useState<string>("");
  const [purgeStatus, setPurgeStatus] = useState<string>("all");
  const [isPurging, setIsPurging] = useState(false);

  // Fetch Business & Orders
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const bizRes = await getMyBusinessAction();
      if (bizRes.success && bizRes.business) {
        setBusiness(bizRes.business);

        const ordersRes = await getOrdersAction(bizRes.business._id, { limit: 1000 });
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

  // Filter orders by period preset (7d, 30d, all)
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

  const ratedOrders = useMemo(() => {
    return orders.filter((o) => typeof o.rating === "number" && o.rating! > 0);
  }, [orders]);

  const avgCustomerRating = useMemo(() => {
    if (ratedOrders.length === 0) return 0;
    const sum = ratedOrders.reduce((acc, o) => acc + (o.rating || 0), 0);
    return sum / ratedOrders.length;
  }, [ratedOrders]);

  const ordersWithFeedback = useMemo(() => {
    return orders.filter((o) => o.feedback && o.feedback.trim().length > 0);
  }, [orders]);

  // Compute Daily Sales Trend
  const revenueChartData = useMemo(() => {
    const daysMap: Record<string, number> = {};

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const last7Days: { key: string; label: string; dateStr: string }[] = [];

    const numColumns = timeRange === "7d" ? 7 : 7;
    const stepDays = timeRange === "30d" ? 4 : 1;

    for (let i = numColumns - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * stepDays);
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

  // Filter Order History Table (by search, status, and custom start/end date range)
  const filteredHistoryOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Status Filter
      if (statusFilter !== "all" && o.status !== statusFilter) return false;

      // 2. Custom Date Range Filter
      if (startDateFilter) {
        const startMs = new Date(startDateFilter).setHours(0, 0, 0, 0);
        if (new Date(o.createdAt).getTime() < startMs) return false;
      }
      if (endDateFilter) {
        const endMs = new Date(endDateFilter).setHours(23, 59, 59, 999);
        if (new Date(o.createdAt).getTime() > endMs) return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = o._id.toLowerCase().includes(q);
        const matchName = o.customerName.toLowerCase().includes(q);
        const matchTable = o.tableNumber && o.tableNumber.toLowerCase().includes(q);
        const matchItem = o.items.some((i) => i.name.toLowerCase().includes(q));
        if (!matchId && !matchName && !matchTable && !matchItem) return false;
      }

      // 4. Rating Filter
      if (ratingFilter === "rated" && (!o.rating || o.rating === 0)) return false;
      if (ratingFilter === "with_feedback" && (!o.feedback || !o.feedback.trim())) return false;
      if (ratingFilter === "5_star" && o.rating !== 5) return false;
      if (ratingFilter === "1_3_star" && (!o.rating || o.rating > 3)) return false;

      return true;
    });
  }, [orders, statusFilter, ratingFilter, startDateFilter, endDateFilter, searchQuery]);

  // Dynamic preview count of orders to be deleted in Date-Range Purge
  const purgePreviewCount = useMemo(() => {
    if (!purgeStartDate || !purgeEndDate) return 0;
    const startMs = new Date(purgeStartDate).setHours(0, 0, 0, 0);
    const endMs = new Date(purgeEndDate).setHours(23, 59, 59, 999);
    if (isNaN(startMs) || isNaN(endMs)) return 0;

    return orders.filter((o) => {
      const orderTime = new Date(o.createdAt).getTime();
      const matchesDate = orderTime >= startMs && orderTime <= endMs;
      const matchesStatus = purgeStatus === "all" ? true : o.status === purgeStatus;
      return matchesDate && matchesStatus;
    }).length;
  }, [orders, purgeStartDate, purgeEndDate, purgeStatus]);

  // ─────────────────────────────────────────────────────────────
  // CRUD HANDLERS
  // ─────────────────────────────────────────────────────────────

  // 1. Delete Single Order
  const handleDeleteSingleOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to permanently delete this order?")) return;

    try {
      if (!business?._id) return;
      const res = await deleteOrderAction(business._id, orderId);
      if (res.success) {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      } else {
        alert(res.error || "Failed to delete order.");
      }
    } catch (err) {
      console.error("Delete order error:", err);
      alert("An error occurred while deleting order.");
    }
  };

  // 2. Open Edit Order Modal
  const openEditModal = (order: OrderData) => {
    setSelectedOrderForEdit(order);
    setEditCustomerName(order.customerName || "");
    setEditTableNumber(order.tableNumber || "");
    setEditStatus(order.status || "completed");
    setEditTotalAmount(order.totalAmount || 0);
  };

  // 3. Save Order Edit
  const handleSaveEditOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForEdit || !business?._id) return;

    setIsUpdatingOrder(true);
    try {
      const res = await updateOrderDetailsAction(business._id, selectedOrderForEdit._id, {
        customerName: editCustomerName,
        tableNumber: editTableNumber || null,
        status: editStatus,
        totalAmount: Number(editTotalAmount),
      });

      if (res.success && res.order) {
        setOrders((prev) => prev.map((o) => (o._id === res.order._id ? (res.order as any) : o)));
        setSelectedOrderForEdit(null);
      } else {
        alert(res.error || "Failed to update order.");
      }
    } catch (err) {
      console.error("Update order error:", err);
      alert("Failed to update order details.");
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // 4. Save New Manual Order
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?.slug) return;

    if (!createItemName.trim()) {
      alert("Item name is required.");
      return;
    }

    setIsCreatingOrder(true);
    try {
      const qty = parseInt(createItemQty) || 1;
      const price = parseFloat(createItemPrice) || 0;
      const totalAmount = price * qty;

      const res = await createOrderAction({
        restaurantSlug: business.slug,
        customerName: createCustomerName,
        tableNumber: createTableNumber || null,
        items: [{ name: createItemName.trim(), price, quantity: qty }],
        totalAmount,
        orderSource: "manual-entry",
      });

      if (res.success && res.order) {
        // Automatically update status if created as completed/accepted
        if (createStatus !== "incoming" && business?._id) {
          const statusRes = await updateOrderDetailsAction(business._id, res.order._id, {
            status: createStatus,
          });
          if (statusRes.success && statusRes.order) {
            setOrders((prev) => [statusRes.order as any, ...prev]);
          } else {
            setOrders((prev) => [res.order, ...prev]);
          }
        } else {
          setOrders((prev) => [res.order, ...prev]);
        }

        setIsCreateModalOpen(false);
        setCreateItemName("");
        setCreateItemPrice("100");
        setCreateItemQty("1");
      } else {
        alert(res.error || "Failed to create order.");
      }
    } catch (err) {
      console.error("Create order error:", err);
      alert("Failed to create manual order.");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // 5. Bulk Purge / Delete Orders by Date Range
  const handlePurgeDateRange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purgeStartDate || !purgeEndDate) {
      alert("Please select both Start Date and End Date.");
      return;
    }

    if (purgePreviewCount === 0) {
      alert("No orders match the selected date range and status criteria.");
      return;
    }

    const confirmPurge = confirm(
      `⚠️ PERMANENT ACTION: Are you sure you want to permanently delete ${purgePreviewCount} orders between ${purgeStartDate} and ${purgeEndDate}? This cannot be undone.`
    );
    if (!confirmPurge) return;

    setIsPurging(true);
    try {
      const res = await deleteOrdersByDateRangeAction(business._id, {
        startDate: purgeStartDate,
        endDate: purgeEndDate,
        status: purgeStatus,
      });

      if (res.success) {
        alert(`Successfully deleted ${res.deletedCount} orders.`);
        setIsPurgeModalOpen(false);
        setPurgeStartDate("");
        setPurgeEndDate("");
        fetchData();
      } else {
        alert(res.error || "Failed to delete orders.");
      }
    } catch (err) {
      console.error("Purge orders error:", err);
      alert("Failed to delete orders by date range.");
    } finally {
      setIsPurging(false);
    }
  };

  // 6. Export Filtered CSV (respects date range + search + status)
  const exportToExcelCSV = () => {
    if (filteredHistoryOrders.length === 0) {
      alert("No order history matching current criteria to export.");
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
      "Rating (1-5)",
      "Feedback Review",
    ];

    const csvRows = [headers.join(",")];

    for (const o of filteredHistoryOrders) {
      const dateStr = new Date(o.createdAt).toLocaleString("en-IN").replace(/,/g, "");
      const itemsFormatted = o.items
        .map((i) => `${i.quantity}x ${i.name} (Rs.${i.price})`)
        .join(" | ")
        .replace(/"/g, '""');
      const feedbackClean = (o.feedback || "").replace(/"/g, '""');

      const row = [
        `"#${o._id.slice(-6).toUpperCase()}"`,
        `"${dateStr}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.orderSource || "Dine-in"}"`,
        `"${o.tableNumber || "N/A"}"`,
        `"${itemsFormatted}"`,
        `${o.totalAmount.toFixed(2)}`,
        `"${o.status.toUpperCase()}"`,
        `"${o.rating ? `${o.rating}/5` : "N/A"}"`,
        `"${feedbackClean}"`,
      ];
      csvRows.push(row.join(","));
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const filename = `MenuGO_Orders_Report_${business?.slug || "restaurant"}_${startDateFilter || "all"}_to_${endDateFilter || "today"}.csv`;
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & ACTIONS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
            <BarChart3 size={22} className="text-indigo-600" /> Analytics & Order Management
          </h1>
          <p className="text-xs text-slate-500">
            Real-time performance metrics, sales trends, full CRUD order history, date-range purge & CSV reports for {business?.name || "your business"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Create Manual Order Button */}
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus size={14} />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
          >
            Create Order
          </Button>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === "7d" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === "30d" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === "all" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
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
          2. KPI SUMMARY CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <StatCard
          title="Customer Rating History"
          value={avgCustomerRating > 0 ? `⭐ ${avgCustomerRating.toFixed(1)} / 5.0` : "No ratings yet"}
          change={`${ratedOrders.length} rated orders (${ordersWithFeedback.length} with feedback)`}
          trend={avgCustomerRating >= 4 ? "up" : "neutral"}
          icon={Star}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CHARTS GRID (Daily Revenue + Top Selling Dishes + Feedback History)
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

        {/* Customer Reviews & Feedback History Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
              <MessageSquare size={16} className="text-indigo-600" /> Customer Reviews & Rating History
            </h2>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Star size={13} fill="currentColor" /> {avgCustomerRating > 0 ? avgCustomerRating.toFixed(1) : "N/A"} ({ratedOrders.length} rated orders)
            </div>
          </div>

          {ordersWithFeedback.length === 0 && ratedOrders.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-8">
              No customer ratings or feedback reviews submitted yet. Feedback prompt appears when customers view completed order status.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {orders
                .filter((o) => o.rating || o.feedback)
                .slice(0, 8)
                .map((o) => (
                  <div key={o._id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{o.customerName}</span>
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={11}
                            fill={o.rating && o.rating >= s ? "currentColor" : "none"}
                            className={o.rating && o.rating >= s ? "text-amber-400" : "text-slate-300"}
                          />
                        ))}
                      </div>
                    </div>
                    {o.feedback ? (
                      <p className="text-xs text-slate-700 italic font-medium leading-relaxed">
                        "{o.feedback}"
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">No written comment</p>
                    )}
                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5 border-t border-slate-200/60 mt-1">
                      <span>Order #{o._id.slice(-6).toUpperCase()} {o.tableNumber ? `• Table ${o.tableNumber}` : ""}</span>
                      <span>{new Date(o.feedbackSubmittedAt || o.createdAt).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. ORDER HISTORY TABLE with CRUD, DATE-RANGE FILTER & PURGE
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5 shadow-sm">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-emerald-600" /> Order History & Sales Reports
            </h2>
            <p className="text-xs text-slate-500">
              Audit historical orders, filter by custom date ranges, perform CRUD edits, download CSV or purge history
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Delete History by Date Range Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPurgeModalOpen(true)}
              leftIcon={<Trash2 size={14} className="text-rose-600" />}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 font-bold"
            >
              Purge Date Range
            </Button>

            {/* Export CSV Button */}
            <Button
              variant="default"
              size="sm"
              onClick={exportToExcelCSV}
              leftIcon={<Download size={15} />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold"
            >
              Export CSV ({filteredHistoryOrders.length})
            </Button>
          </div>
        </div>

        {/* Filters Row (Search + Date Range Pickers + Status Pills) */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Order ID, Customer, Table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Calendar size={13} className="text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500">From:</span>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Calendar size={13} className="text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500">To:</span>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>
            {(startDateFilter || endDateFilter) && (
              <button
                onClick={() => {
                  setStartDateFilter("");
                  setEndDateFilter("");
                }}
                className="text-[11px] font-bold text-indigo-600 hover:underline px-1"
              >
                Clear Dates
              </button>
            )}
          </div>

          {/* Status & Rating Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Rating Filter</option>
              <option value="rated">Rated Orders ({ratedOrders.length})</option>
              <option value="with_feedback">With Written Reviews ({ordersWithFeedback.length})</option>
              <option value="5_star">⭐⭐⭐⭐⭐ 5 Stars</option>
              <option value="1_3_star">⚠️ 1-3 Stars</option>
            </select>

            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === "all" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              All Status ({orders.length})
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === "completed" ? "bg-emerald-600 text-white" : "bg-white text-emerald-700 border border-slate-200 hover:bg-emerald-50"
              }`}
            >
              Completed ({orders.filter((o) => o.status === "completed").length})
            </button>
            <button
              onClick={() => setStatusFilter("cancelled")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === "cancelled" ? "bg-rose-600 text-white" : "bg-white text-rose-700 border border-slate-200 hover:bg-rose-50"
              }`}
            >
              Cancelled
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
                <th className="px-4 py-3">Rating & Review</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistoryOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 italic">
                    No orders match your active search, rating or date range filters.
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
                        year: "numeric",
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
                    <td className="px-4 py-3">
                      {order.rating ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={12}
                                fill={order.rating && order.rating >= s ? "currentColor" : "none"}
                                className={order.rating && order.rating >= s ? "text-amber-400" : "text-slate-300"}
                              />
                            ))}
                            <span className="text-[11px] font-bold text-slate-700 ml-1">{order.rating}/5</span>
                          </div>
                          {order.feedback && (
                            <p className="text-[10px] text-slate-600 line-clamp-1 italic max-w-xs" title={order.feedback}>
                              "{order.feedback}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No rating</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Receipt Button */}
                        <button
                          onClick={() => setSelectedOrderForModal(order)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Receipt"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(order)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Order Details"
                        >
                          <Edit3 size={14} />
                        </button>

                        {/* Delete Single Order Button */}
                        <button
                          onClick={() => handleDeleteSingleOrder(order._id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. MODAL: ITEMIZED RECEIPT
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
                    {(item as any).addons && (item as any).addons.length > 0 && (
                      <p className="text-[10px] text-indigo-600 font-medium">
                        + Extras: {(item as any).addons.map((a: any) => `${a.name} (+₹${a.price})`).join(", ")}
                      </p>
                    )}
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

            {/* Customer Rating & Review Box on Receipt */}
            {selectedOrderForModal.rating ? (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1 text-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-900 flex items-center gap-1">
                    <Star size={13} fill="currentColor" className="text-amber-500" /> Customer Rating:
                  </span>
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        fill={selectedOrderForModal.rating && selectedOrderForModal.rating >= s ? "currentColor" : "none"}
                        className={selectedOrderForModal.rating && selectedOrderForModal.rating >= s ? "text-amber-400" : "text-slate-300"}
                      />
                    ))}
                    <span className="font-extrabold text-xs ml-1 text-slate-900">{selectedOrderForModal.rating}/5</span>
                  </div>
                </div>
                {selectedOrderForModal.feedback && (
                  <p className="text-xs italic text-slate-700 pt-1">
                    "{selectedOrderForModal.feedback}"
                  </p>
                )}
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 italic text-[11px] text-center">
                No customer review or star rating submitted for this order.
              </div>
            )}

            <div className="flex justify-between items-center p-3 rounded-xl bg-indigo-50 border border-indigo-100 font-extrabold text-sm">
              <span className="text-slate-900">Total Paid:</span>
              <span className="text-indigo-600 font-heading">
                {currencySymbol}{selectedOrderForModal.totalAmount?.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          6. MODAL: EDIT ORDER DETAILS
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!selectedOrderForEdit}
        onClose={() => setSelectedOrderForEdit(null)}
        title={`Edit Order #${selectedOrderForEdit?._id?.slice(-6).toUpperCase()}`}
        maxWidth="sm"
      >
        {selectedOrderForEdit && (
          <form onSubmit={handleSaveEditOrder} className="space-y-4 text-xs">
            <Input
              label="Customer Name"
              value={editCustomerName}
              onChange={(e) => setEditCustomerName(e.target.value)}
              required
            />

            <Input
              label="Table Number (Optional)"
              value={editTableNumber}
              onChange={(e) => setEditTableNumber(e.target.value)}
              placeholder="e.g. 5"
            />

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Order Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="incoming">INCOMING</option>
                <option value="accepted">ACCEPTED</option>
                <option value="preparing">PREPARING</option>
                <option value="served">SERVED</option>
                <option value="completed">COMPLETED</option>
                <option value="cancelled">CANCELLED</option>
                <option value="rejected">REJECTED</option>
              </select>
            </div>

            <Input
              label={`Total Amount (${currencySymbol})`}
              type="number"
              step="0.01"
              value={editTotalAmount}
              onChange={(e) => setEditTotalAmount(parseFloat(e.target.value) || 0)}
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedOrderForEdit(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="default" size="sm" isLoading={isUpdatingOrder}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          7. MODAL: CREATE MANUAL ORDER
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Manual / Offline Order"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateManualOrder} className="space-y-4 text-xs">
          <Input
            label="Customer Name"
            value={createCustomerName}
            onChange={(e) => setCreateCustomerName(e.target.value)}
            placeholder="e.g. Walk-in Guest"
            required
          />

          <Input
            label="Table Number (Optional)"
            value={createTableNumber}
            onChange={(e) => setCreateTableNumber(e.target.value)}
            placeholder="e.g. 12"
          />

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <p className="font-bold text-slate-800">Dish Details</p>
            <Input
              label="Item Name"
              value={createItemName}
              onChange={(e) => setCreateItemName(e.target.value)}
              placeholder="e.g. Butter Chicken"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label={`Price (${currencySymbol})`}
                type="number"
                value={createItemPrice}
                onChange={(e) => setCreateItemPrice(e.target.value)}
                required
              />
              <Input
                label="Quantity"
                type="number"
                value={createItemQty}
                onChange={(e) => setCreateItemQty(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Status</label>
            <select
              value={createStatus}
              onChange={(e) => setCreateStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="completed">COMPLETED (Paid)</option>
              <option value="accepted">ACCEPTED</option>
              <option value="preparing">PREPARING</option>
              <option value="incoming">INCOMING</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="default" size="sm" isLoading={isCreatingOrder}>
              Create Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          8. MODAL: PURGE / DELETE ORDERS BY DATE RANGE
      ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        title="Purge / Delete Order History by Date Range"
        maxWidth="sm"
      >
        <form onSubmit={handlePurgeDateRange} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
            <AlertTriangle size={18} className="shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold">Permanent Deletion Warning</p>
              <p className="text-[11px] text-rose-600">
                This operation permanently deletes all order records within the selected date range from your database.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
              <input
                type="date"
                value={purgeStartDate}
                onChange={(e) => setPurgeStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">End Date</label>
              <input
                type="date"
                value={purgeEndDate}
                onChange={(e) => setPurgeEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Target Status Scope</label>
            <select
              value={purgeStatus}
              onChange={(e) => setPurgeStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Statuses (Completed, Cancelled, Active)</option>
              <option value="completed">Completed Orders Only</option>
              <option value="cancelled">Cancelled / Rejected Orders Only</option>
            </select>
          </div>

          {purgeStartDate && purgeEndDate && (
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex justify-between items-center font-bold">
              <span className="text-slate-700">Orders to be deleted:</span>
              <span className="text-rose-600 text-sm font-heading">{purgePreviewCount} orders</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsPurgeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isPurging}
              disabled={purgePreviewCount === 0}
            >
              Confirm & Delete Orders
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
