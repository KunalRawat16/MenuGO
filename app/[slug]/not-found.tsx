"use client";

import React from "react";
import Link from "next/link";
import { UtensilsCrossed, QrCode, Home, ArrowLeft, Store } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function RestaurantNotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-8 text-center space-y-6 shadow-2xl relative z-10">
        {/* Animated Badge */}
        <div className="mx-auto w-22 h-22 bg-amber-500/10 rounded-3xl border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner relative">
          <UtensilsCrossed size={42} />
          <span className="absolute -bottom-2 -right-2 bg-slate-950 p-1.5 rounded-full border border-amber-500/40 text-amber-400 shadow-md">
            <QrCode size={18} />
          </span>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <span className="text-[11px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Menu Not Found
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-heading">
            Digital Menu Unavailable
          </h1>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
            This QR menu link is invalid or the restaurant is currently inactive. Please double-check the scanned code or request a fresh QR code from restaurant staff.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <Link href="/demo-cafe" className="w-full">
            <Button
              variant="default"
              className="w-full justify-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold border-none shadow-md"
              leftIcon={<Store size={16} />}
            >
              Try Demo Cafe Menu
            </Button>
          </Link>

          <Link href="/" className="w-full">
            <Button
              variant="outline"
              className="w-full justify-center border-slate-800 text-slate-300 hover:bg-slate-800"
              leftIcon={<Home size={16} />}
            >
              Go to MenuGO Homepage
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Are you a restaurant owner?{" "}
            <Link href="/auth/login" className="text-indigo-400 font-bold hover:underline">
              Log in to your Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
