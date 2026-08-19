"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  CreditCard,
  Settings,
  LogOut,
  BarChart2,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth.actions";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/admin", icon: BarChart2 },
    { label: "Business Management", href: "/admin/businesses", icon: Building2 },
    { label: "Subscriptions & Billing", href: "/admin/subscriptions", icon: CreditCard },
    { label: "Platform Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await logoutAction();
    window.location.href = "/auth/login";
  };

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0 select-none">
      {/* Super Admin Shield Branding */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
          <ShieldCheck size={22} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight font-heading">
            Super Admin
          </h2>
          <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest">
            Platform Control
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Icon size={18} className={isActive ? "text-slate-950" : "text-slate-400"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
