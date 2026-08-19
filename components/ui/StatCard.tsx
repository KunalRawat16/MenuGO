"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
  description?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend = "up",
  icon: Icon,
  description = "vs previous period",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            {value}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/60 shadow-xs">
          <Icon size={20} />
        </div>
      </div>

      {change && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={`font-bold flex items-center gap-0.5 ${
              trend === "up"
                ? "text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md"
                : trend === "down"
                ? "text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md"
                : "text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md"
            }`}
          >
            {trend === "up" && <TrendingUp size={13} />}
            {trend === "down" && <TrendingDown size={13} />}
            {trend === "neutral" && <Minus size={13} />}
            {change}
          </span>
          <span className="text-slate-400 font-normal">{description}</span>
        </div>
      )}
    </div>
  );
}
