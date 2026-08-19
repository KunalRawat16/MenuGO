"use client";

import React from "react";
import Link from "next/link";
import { Utensils, Heart } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Utensils size={18} />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight font-heading">
                Menu<span className="text-indigo-400">GO</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              The next-generation QR menu & ordering platform for restaurants, cafés, spas, salons, and hospitality businesses.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Product</p>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#demo" className="hover:text-white transition-colors">Live Business Menus</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing & Plans</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Supported Businesses */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Solutions For</p>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-400">Restaurants & Cafés</span></li>
              <li><span className="text-slate-400">Hotels & In-Room Service</span></li>
              <li><span className="text-slate-400">Spas & Beauty Salons</span></li>
              <li><span className="text-slate-400">Food Trucks & Cloud Kitchens</span></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Legal & Contact</p>
            <ul className="space-y-2 text-xs">
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="mailto:support@menugo.in" className="hover:text-white transition-colors">support@menugo.in</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} MenuGO SaaS Platform. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Crafted with <Heart size={12} className="text-rose-500 fill-rose-500" /> for modern businesses.
          </p>
        </div>
      </div>
    </footer>
  );
}
