"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Utensils, Menu as MenuIcon, X, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Live Menus", href: "#demo" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <Utensils size={20} className="stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-slate-900 tracking-tight font-heading leading-tight flex items-center gap-1">
              Menu<span className="text-indigo-600">GO</span>
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
              Digital Menu Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="default" size="sm" rightIcon={<ArrowRight size={14} />}>
              Get Started Free
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Trigger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-700 py-2 border-b border-slate-100 hover:text-indigo-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-2 flex flex-col space-y-2">
            <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">
                Log In
              </Button>
            </Link>
            <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="default" className="w-full justify-center" rightIcon={<ArrowRight size={14} />}>
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
