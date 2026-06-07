'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shadow-inner">
          <AlertTriangle size={32} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Something Went Wrong</h1>
          <p className="text-gray-500 font-bold leading-relaxed text-sm">
            An unexpected error occurred. We have logged this issue and our team is looking into it.
          </p>
        </div>

        {error?.message && (
          <div className="p-4 bg-gray-50 rounded-xl text-left border border-gray-100">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider block mb-1">Details</span>
            <code className="text-xs font-bold text-red-600 block break-all">{error.message}</code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          
          <Link
            href="/"
            className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-black py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Home size={18} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
