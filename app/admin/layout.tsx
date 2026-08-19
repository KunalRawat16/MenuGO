import React from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "super_admin") {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Super Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Platform Master Console
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Role: SUPER_ADMIN
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-slate-900/40">{children}</main>
      </div>
    </div>
  );
}
