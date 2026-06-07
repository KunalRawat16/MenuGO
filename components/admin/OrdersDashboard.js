"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, RefreshCw, CheckCircle, Clock, XCircle, Play, Loader2 } from "lucide-react";

export default function OrdersDashboard({ restaurantId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders?restaurantId=${restaurantId}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // 15 seconds
    return () => clearInterval(interval);
  }, [restaurantId, fetchOrders]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order? It will be moved to History.")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Served': return 'bg-green-100 text-green-800 border-green-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={14} className="mr-1 inline" />;
      case 'Preparing': return <Play size={14} className="mr-1 inline" />;
      case 'Served': return <CheckCircle size={14} className="mr-1 inline" />;
      case 'Completed': return <CheckCircle size={14} className="mr-1 inline" />;
      case 'Cancelled': return <XCircle size={14} className="mr-1 inline" />;
      default: return null;
    }
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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Live Orders</h2>
        <button 
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-colors shadow-sm text-sm"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4"></th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Table</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center text-gray-500 font-medium">
                    No active orders at the moment.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          {expandedOrder === order._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-600">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">{order.customerName}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-full text-xs font-bold whitespace-nowrap">
                          Table {order.tableNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">
                        {(order.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0)} items
                      </td>
                      <td className="px-6 py-4 font-black text-gray-900">₹{order.totalPrice}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)} whitespace-nowrap`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {order.status === 'Pending' && (
                            <button 
                              onClick={() => updateStatus(order._id, 'Preparing')}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                            >
                              Accept
                            </button>
                          )}
                          {order.status === 'Preparing' && (
                            <button 
                              onClick={() => updateStatus(order._id, 'Served')}
                              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                            >
                              Ready
                            </button>
                          )}
                          {order.status === 'Served' && (
                            <button 
                              onClick={() => updateStatus(order._id, 'Completed')}
                              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                            >
                              Done (Paid)
                            </button>
                          )}
                          {order.status !== 'Served' && order.status !== 'Cancelled' && (
                            <button 
                              onClick={() => cancelOrder(order._id)}
                              className="px-4 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors shadow-sm"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedOrder === order._id && (
                      <tr className="bg-green-50/30 border-t-0">
                        <td colSpan="8" className="px-8 py-6">
                          <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-[0_8px_30px_rgba(249,115,22,0.06)] w-full">
                            <h4 className="font-black text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                              <span className="w-2 h-5 bg-green-500 rounded-full"></span> Order Summary
                            </h4>
                            <div className="space-y-4 mb-6">
                              {(order.items || []).map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-xl border border-gray-100">
                                  <div>
                                    <p className="font-extrabold text-gray-800 text-base">{item.name} <span className="text-green-500 bg-green-50 px-2 py-0.5 rounded-md font-bold text-xs ml-2">x {item.quantity}</span></p>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{item.category}</p>
                                  </div>
                                  <div className="font-black text-gray-900 text-base">₹{item.price * item.quantity}</div>
                                </div>
                              ))}
                            </div>
                            <div className="pt-4 border-t-2 border-dashed border-gray-200 flex justify-between items-center">
                              <span className="font-black text-gray-400 uppercase tracking-widest text-sm">Grand Total</span>
                              <span className="text-2xl font-black text-green-600 bg-green-50 px-4 py-1.5 rounded-xl border border-green-100">₹{order.totalPrice}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
            <p className="text-gray-500 font-medium">No active orders at the moment.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-mono text-xs font-bold text-gray-500 mb-1">#{order._id.slice(-6).toUpperCase()}</div>
                  <h3 className="font-extrabold text-lg text-gray-900">{order.customerName}</h3>
                  <div className="mt-1.5 inline-block px-2.5 py-1 bg-gray-100 text-gray-800 border border-gray-200 rounded-md text-xs font-bold">
                    Table {order.tableNumber}
                  </div>
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${getStatusColor(order.status)}`}>
                  {order.status}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 mb-5 border border-green-100 shadow-[0_4px_20px_rgba(249,115,22,0.04)]">
                <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <span className="w-1.5 h-4 bg-green-500 rounded-full"></span> Summary
                </h4>
                <div className="space-y-3 mb-4">
                  {(order.items || []).map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <span className="font-extrabold text-gray-800 block">{item.name}</span>
                        <span className="text-green-500 bg-green-50 px-1.5 py-0.5 rounded text-[10px] font-bold mt-1 inline-block">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-black text-gray-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t-2 border-dashed border-gray-200 flex justify-between items-center">
                  <span className="font-black text-gray-400 uppercase tracking-widest text-xs">Total</span>
                  <span className="font-black text-green-600 text-xl bg-green-50 px-3 py-1 rounded-lg border border-green-100">₹{order.totalPrice}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {order.status === 'Pending' && (
                  <button 
                    onClick={() => updateStatus(order._id, 'Preparing')}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm text-center"
                  >
                    Accept Order
                  </button>
                )}
                {order.status === 'Preparing' && (
                  <button 
                    onClick={() => updateStatus(order._id, 'Served')}
                    className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm text-center"
                  >
                    Ready / Served
                  </button>
                )}
                {order.status === 'Served' && (
                  <button 
                    onClick={() => updateStatus(order._id, 'Completed')}
                    className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm text-center"
                  >
                    Done (Paid & Clear)
                  </button>
                )}
                {order.status !== 'Served' && order.status !== 'Cancelled' && (
                  <button 
                    onClick={() => cancelOrder(order._id)}
                    className="flex-none px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold rounded-xl transition-colors shadow-sm text-center"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
