"use client";

import React from "react";
import { Utensils } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans select-none">
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing Brand Logo */}
        <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/30 animate-pulse">
          <Utensils size={32} />
        </div>

        {/* Loading text with animated dots */}
        <div className="flex items-center gap-1 mt-2">
          <span className="font-extrabold text-xl tracking-tight text-slate-900 font-heading">
            Menu<span className="text-indigo-600">GO</span>
          </span>
          <span className="flex gap-1 ml-2">
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
          </span>
        </div>
      </div>
    </div>
  );
}
