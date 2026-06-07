'use client';

import { useEffect } from 'react';
import { ChefHat, RefreshCw, AlertCircle } from 'lucide-react';

export default function RestaurantMenuError({ error, reset }) {
  useEffect(() => {
    console.error('Restaurant Menu Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-8 space-y-6">
        <div className="mx-auto w-20 h-20 bg-green-50 rounded-[24px] flex items-center justify-center text-green-500 shadow-inner">
          <ChefHat size={40} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Oops! Menu Failed to Load</h1>
          <p className="text-gray-500 font-bold leading-relaxed text-sm">
            We had trouble fetching the dishes for this restaurant. This could be due to a poor network connection.
          </p>
        </div>

        {error?.message && (
          <div className="p-4 bg-red-50/50 rounded-2xl text-left border border-red-100/50">
            <span className="text-xs font-black text-red-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <AlertCircle size={12} /> Error Log
            </span>
            <code className="text-xs font-bold text-red-600 block break-all">{error.message}</code>
          </div>
        )}

        <button
          onClick={() => reset()}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
        >
          <RefreshCw size={18} />
          Retry Loading Menu
        </button>
      </div>
    </div>
  );
}
