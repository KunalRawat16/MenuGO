"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center font-sans select-none">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 p-8 space-y-4 shadow-sm">
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading">Error</h1>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-800 font-heading">Something went wrong</h2>
          <p className="text-xs text-slate-500">
            An unexpected error occurred while processing your request.
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => reset()}
            variant="outline"
            className="flex-1 justify-center font-bold text-xs"
            leftIcon={<RefreshCw size={14} />}
          >
            Try Again
          </Button>
          <Link href="/" className="flex-1">
            <Button
              variant="default"
              className="w-full justify-center font-bold text-xs"
              leftIcon={<Home size={14} />}
            >
              Go to Home Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
