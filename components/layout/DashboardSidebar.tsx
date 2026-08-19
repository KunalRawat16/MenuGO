"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  QrCode,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  ExternalLink,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth.actions";

export interface DashboardSidebarProps {
  businessName?: string;
  businessSlug?: string;
  mobileIsOpen?: boolean;
  onMobileClose?: () => void;
}

export function DashboardSidebar({
  businessName = "My Business",
  businessSlug,
  mobileIsOpen = false,
  onMobileClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Menu Editor", href: "/dashboard/menu", icon: UtensilsCrossed },
    { label: "Tables & QR", href: "/dashboard/tables", icon: QrCode },
    { label: "Staff Management", href: "/dashboard/staff", icon: Users },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = "/auth/login";
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 select-none">
      {/* Business Branding Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30 shrink-0">
            {businessName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-white tracking-tight truncate font-heading">
              {businessName}
            </h2>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              {businessSlug ? `/${businessSlug}` : "Dashboard"}
            </p>
          </div>
        </div>

        {/* Close Button for Mobile Drawer */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Live Menu Quick Preview Link */}
      {businessSlug && (
        <div className="px-4 py-3 border-b border-slate-800">
          <a
            href={`/${businessSlug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/20 text-indigo-300 text-xs font-semibold transition-all group"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <span>Live Menu Preview</span>
            </div>
            <ExternalLink size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors min-h-[44px]"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-64 h-screen sticky top-0 border-r border-slate-800 shrink-0">
        {SidebarContent}
      </aside>

      {/* Android / Mobile Drawer Overlay */}
      {mobileIsOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in-0 duration-200"
            onClick={onMobileClose}
          />
          {/* Slide-in Drawer */}
          <aside className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {SidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
