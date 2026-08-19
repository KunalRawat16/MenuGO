"use client";

import React, { useState } from "react";
import { Bell, Menu, User } from "lucide-react";
import { updateOpenStatusAction } from "@/app/actions/restaurant.actions";

export interface DashboardTopBarProps {
  title?: string;
  businessId?: string;
  initialIsOpen?: boolean;
  userName?: string;
  onMobileMenuClick?: () => void;
}

export function DashboardTopBar({
  title = "Overview",
  businessId,
  initialIsOpen = true,
  userName = "Owner",
  onMobileMenuClick,
}: DashboardTopBarProps) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleOpen = async () => {
    if (!businessId || isUpdating) return;
    const nextState = !isOpen;
    setIsOpen(nextState);
    setIsUpdating(true);

    try {
      const res = await updateOpenStatusAction(businessId, nextState);
      if (res.error) {
        setIsOpen(!nextState); // Rollback on error
      }
    } catch {
      setIsOpen(!nextState);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs select-none">
      {/* Left: Mobile Hamburger + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {onMobileMenuClick && (
          <button
            onClick={onMobileMenuClick}
            className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
            aria-label="Open mobile menu"
          >
            <Menu size={20} />
          </button>
        )}
        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-heading truncate">
          {title}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Quick Open / Closed Business Status Switch */}
        <div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-100 border border-slate-200">
          <span
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full animate-pulse ${
              isOpen ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-700 select-none hidden xs:inline-block">
            {isOpen ? "Open" : "Closed"}
          </span>
          <button
            onClick={handleToggleOpen}
            disabled={isUpdating}
            className={`w-7 sm:w-8 h-3.5 sm:h-4 rounded-full transition-colors relative focus:outline-none ${
              isOpen ? "bg-emerald-500" : "bg-slate-300"
            }`}
            title="Toggle store open/closed status"
            aria-label="Toggle store status"
          >
            <span
              className={`block w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full bg-white shadow-md transform transition-transform ${
                isOpen ? "translate-x-3.5 sm:translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Notifications Icon */}
        <button
          className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600" />
        </button>

        {/* Profile Avatar Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-slate-700 hidden lg:inline-block">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
