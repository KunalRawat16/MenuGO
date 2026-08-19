"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans select-none">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 space-y-6">
        <div className="mx-auto w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner">
          <AlertTriangle size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            Something Went Wrong
          </h1>
          <p className="text-slate-500 font-normal leading-relaxed text-xs">
            An unexpected runtime error occurred. You can try refreshing the page or navigating back home.
          </p>
        </div>

        {error?.message && (
          <div className="p-3.5 bg-slate-50 rounded-xl text-left border border-slate-200">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
              Error Trace
            </span>
            <code className="text-xs font-mono text-rose-600 block break-all">
              {error.message}
            </code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => reset()}
            variant="default"
            className="flex-1 justify-center shadow-md"
            leftIcon={<RefreshCw size={16} />}
          >
            Try Again
          </Button>

          <Link href="/" className="flex-1">
            <Button
              variant="outline"
              className="w-full justify-center"
              leftIcon={<Home size={16} />}
            >
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
