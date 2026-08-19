"use client";

import React, { useState } from "react";
import { BarChart3, TrendingUp, Calendar, ShoppingBag, Award, ArrowUpRight } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");

  const revenueData7d = [
    { day: "Mon", revenue: 1450 },
    { day: "Tue", revenue: 2100 },
    { day: "Wed", revenue: 1890 },
    { day: "Thu", revenue: 2800 },
    { day: "Fri", revenue: 3900 },
    { day: "Sat", revenue: 4850 },
    { day: "Sun", revenue: 4200 },
  ];

  const maxRevenue = Math.max(...revenueData7d.map((d) => d.revenue));

  const topItems = [
    { name: "Tandoori Paneer Tikka", sales: 142, revenue: "₹42,458", percentage: 85 },
    { name: "Butter Garlic Naan", sales: 310, revenue: "₹24,800", percentage: 70 },
    { name: "Cold Brew Coffee", sales: 98, revenue: "₹18,620", percentage: 55 },
    { name: "Dal Makhani Handi", sales: 84, revenue: "₹29,400", percentage: 50 },
    { name: "Sizzling Brownie", sales: 65, revenue: "₹14,950", percentage: 40 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
            Analytics & Sales Insights
          </h1>
          <p className="text-xs text-slate-500">
            Performance metrics, daily sales totals, peak hours & top-selling items
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl">
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
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Period Revenue"
          value="₹21,190.00"
          change="+18.4%"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          title="Total Orders Served"
          value="182 orders"
          change="+12 orders"
          trend="up"
          icon={ShoppingBag}
        />
        <StatCard
          title="Avg Basket Value"
          value="₹315.50"
          change="+4.2%"
          trend="up"
          icon={Award}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Daily Revenue Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
              <BarChart3 size={16} className="text-indigo-600" /> Revenue Trend (Last 7 Days)
            </h2>
            <Badge variant="success" size="sm">
              Peak: Sat (₹4,850)
            </Badge>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
            {revenueData7d.map((item) => {
              const heightPercent = (item.revenue / maxRevenue) * 100;
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{item.revenue}
                  </span>
                  <div className="w-full bg-indigo-50 rounded-t-xl h-44 flex items-end justify-center p-1">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t-lg transition-all duration-500 group-hover:brightness-110 shadow-xs"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Items Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-1.5">
              <Award size={16} className="text-amber-500" /> Top Selling Items
            </h2>
            <span className="text-xs text-slate-400">By sales volume</span>
          </div>

          <div className="space-y-3.5">
            {topItems.map((item, idx) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">
                    #{idx + 1} {item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{item.sales} orders</span>
                    <span className="font-extrabold text-indigo-600 font-heading">
                      {item.revenue}
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
        </div>
      </div>
    </div>
  );
}
