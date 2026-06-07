'use client';

import { Utensils } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing Logo */}
        <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-100 animate-pulse">
          <Utensils size={32} className="text-white" />
        </div>
        
        {/* Loading text with dynamic dots */}
        <div className="flex items-center gap-1 mt-2">
          <span className="font-black text-xl tracking-tight text-gray-900">Menu</span>
          <span className="font-black text-xl tracking-tight text-green-500">Go</span>
          <span className="flex gap-1 ml-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-100" />
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-200" />
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-300" />
          </span>
        </div>
      </div>
    </div>
  );
}
