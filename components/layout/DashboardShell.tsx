"use client";

import React, { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopBar } from "./DashboardTopBar";

export interface DashboardShellProps {
  children: React.ReactNode;
  business: any;
  isImpersonating?: boolean;
}

export function DashboardShell({ children, business, isImpersonating }: DashboardShellProps) {
  const [mobileIsOpen, setMobileIsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden select-none">
      {/* Sidebar (Desktop Fixed + Mobile Overlay Drawer) */}
      <DashboardSidebar
        businessName={business.name}
        businessSlug={business.slug}
        mobileIsOpen={mobileIsOpen}
        onMobileClose={() => setMobileIsOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar Header with Store Open/Closed Toggle & Mobile Hamburger */}
        <DashboardTopBar
          businessId={business._id}
          initialIsOpen={business.settings?.isOpen !== false}
          userName={business.name}
          isImpersonating={isImpersonating}
          onMobileMenuClick={() => setMobileIsOpen(true)}
        />

        {/* Dynamic Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
