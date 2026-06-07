"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { RefreshCw, CheckCircle, XCircle, Loader2, IndianRupee, TrendingUp, Calendar, Download, Trash2, Award, AlertTriangle } from "lucide-react";

export default function HistoryDashboard({ restaurantId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("all");
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?restaurantId=${restaurantId}&history=true`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchHistory();
  }, [restaurantId, fetchHistory]);

  const clearHistory = async () => {
    if (deleteInput !== "DELETE") return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/orders?restaurantId=${restaurantId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setOrders([]);
        setShowDeleteConfirm(false);
        setDeleteInput("");
      }
    } catch (error) {
      console.error("Error clearing history:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle size={14} className="mr-1 inline" />;
      case 'Cancelled': return <XCircle size={14} className="mr-1 inline" />;
      default: return null;
    }
  };

  // Filtration Logic
  const filteredOrders = useMemo(() => {
    if (dateFilter === "all") return orders;
    
    const now = new Date();
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      if (dateFilter === "today") {
        return orderDate.toDateString() === now.toDateString();
      }
      if (dateFilter === "week") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return orderDate >= startOfWeek;
      }
      if (dateFilter === "month") {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
      if (dateFilter === "year") {
        return orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [orders, dateFilter]);

  // Analytics
  const completedOrders = filteredOrders.filter(o => o.status === 'Completed');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalPrice, 0);

  // Top Selling Items Logic
  const topSellingItems = useMemo(() => {
    const itemCounts = {};
    completedOrders.forEach(order => {
      (order.items || []).forEach(item => {
        if (itemCounts[item.name]) {
          itemCounts[item.name].quantity += item.quantity || 1;
          itemCounts[item.name].revenue += (item.price || 0) * (item.quantity || 1);
        } else {
          itemCounts[item.name] = { quantity: item.quantity || 1, revenue: (item.price || 0) * (item.quantity || 1) };
        }
      });
    });
    return Object.entries(itemCounts)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);
  }, [completedOrders]);

  // CSV Export
  const downloadCSV = () => {
    const headers = ["Date", "Order ID", "Customer Name", "Total Items", "Total Price", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map(order => [
        new Date(order.createdAt).toLocaleDateString(),
        order._id,
        `"${order.customerName}"`,
        (order.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0),
        order.totalPrice,
        order.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `history_${dateFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="animate-spin text-green-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-100">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-bold text-gray-900">Clear All History?</h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              This action is permanent and cannot be undone. All historical data, including revenue and order analytics, will be completely wiped. To confirm, type <strong className="text-red-600 font-mono bg-red-50 px-1 py-0.5 rounded">DELETE</strong> below.
            </p>
            <input 
              type="text" 
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={clearHistory}
                disabled={deleteInput !== "DELETE" || isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} 
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">History & Analytics</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Filter, analyze, and export your past orders.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-green-500 cursor-pointer shadow-sm"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          
          <button 
            onClick={downloadCSV}
            disabled={filteredOrders.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-colors shadow-sm text-sm disabled:opacity-50"
          >
            <Download size={16} /> Export CSV
          </button>

          <button 
            onClick={fetchHistory}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-colors shadow-sm text-sm"
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 hover:bg-red-100 text-red-700 font-bold rounded-xl transition-colors shadow-sm text-sm"
          >
            <Trash2 size={16} /> Clear History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Analytics Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <IndianRupee size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Revenue</p>
              <h3 className="text-2xl font-black text-gray-900">₹{totalRevenue}</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Completed Orders</p>
              <h3 className="text-2xl font-black text-gray-900">{completedOrders.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <XCircle size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Cancelled Orders</p>
              <h3 className="text-2xl font-black text-gray-900">{filteredOrders.filter(o => o.status === 'Cancelled').length}</h3>
            </div>
          </div>
        </div>

        {/* Top Selling Items (Bonus Feature) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-yellow-100 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-yellow-600">
            <Award size={18} />
            <h3 className="font-bold text-sm uppercase tracking-wider">Top Selling Items</h3>
          </div>
          {topSellingItems.length === 0 ? (
            <p className="text-xs text-gray-500 font-medium my-auto text-center">No sales data for this period.</p>
          ) : (
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              {topSellingItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-800 truncate max-w-[120px]" title={item.name}>{item.name}</span>
                  <span className="font-medium text-gray-500 bg-gray-100 px-2 rounded-full">{item.quantity}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-gray-500 font-medium">
                    No historical orders found for the selected period.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-600">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{order.customerName}</td>
                    <td className="px-6 py-4 font-medium text-gray-600">
                      {(order.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0)} items
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900">₹{order.totalPrice}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)} whitespace-nowrap`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
            <p className="text-gray-500 font-medium">No historical orders found for the selected period.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-mono text-xs font-bold text-gray-500 mb-1 flex items-center gap-1.5">
                    <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <h3 className="font-extrabold text-base text-gray-900">{order.customerName} <span className="text-gray-400 font-medium text-sm">#{order._id.slice(-6).toUpperCase()}</span></h3>
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold border ${getStatusColor(order.status)} uppercase tracking-wider`}>
                  {order.status}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-sm font-bold text-gray-500">{(order.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0)} items</span>
                <span className="font-black text-gray-900 text-lg">₹{order.totalPrice}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
