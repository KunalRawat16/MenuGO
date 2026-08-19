"use client";

import React, { useEffect } from "react";
import { Globe, DollarSign, Clock, CheckCircle2 } from "lucide-react";

export interface Step2Data {
  language: string;
  currency: string;
  currencySymbol: string;
  avgServiceTime: string;
  allowWalkin: boolean;
  allowTakeaway: boolean;
  allowDelivery: boolean;
  allowBooking: boolean;
}

interface Step2Props {
  data: Step2Data;
  country: string;
  onChange: (field: keyof Step2Data, value: any) => void;
}

const LANGUAGES = [
  { code: "en", label: "English (US/UK)", flag: "🇺🇸" },
  { code: "hi", label: "Hindi (हिंदी)", flag: "🇮🇳" },
  { code: "fr", label: "French (Français)", flag: "🇫🇷" },
  { code: "es", label: "Spanish (Español)", flag: "🇪🇸" },
  { code: "ar", label: "Arabic (العربية)", flag: "🇦🇪" },
  { code: "de", label: "German (Deutsch)", flag: "🇩🇪" },
];

const CURRENCIES = [
  { code: "INR", symbol: "₹", label: "INR — Indian Rupee (₹)" },
  { code: "USD", symbol: "$", label: "USD — US Dollar ($)" },
  { code: "EUR", symbol: "€", label: "EUR — Euro (€)" },
  { code: "GBP", symbol: "£", label: "GBP — British Pound (£)" },
  { code: "AED", symbol: "AED", label: "AED — UAE Dirham" },
  { code: "CAD", symbol: "$", label: "CAD — Canadian Dollar ($)" },
  { code: "AUD", symbol: "$", label: "AUD — Australian Dollar ($)" },
];

export function Step2Localization({ data, country, onChange }: Step2Props) {
  // Auto-suggest currency based on selected country
  useEffect(() => {
    if (country === "India" && data.currency !== "INR") {
      onChange("currency", "INR");
      onChange("currencySymbol", "₹");
    } else if (country === "United Kingdom" && data.currency !== "GBP") {
      onChange("currency", "GBP");
      onChange("currencySymbol", "£");
    } else if (country === "United Arab Emirates" && data.currency !== "AED") {
      onChange("currency", "AED");
      onChange("currencySymbol", "AED");
    } else if ((country === "France" || country === "Germany") && data.currency !== "EUR") {
      onChange("currency", "EUR");
      onChange("currencySymbol", "€");
    }
  }, [country]);

  const handleCurrencyChange = (code: string) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (found) {
      onChange("currency", found.code);
      onChange("currencySymbol", found.symbol);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
          Step 2: Regional & Service Preferences
        </h2>
        <p className="text-xs text-slate-500">
          Configure your display language, currency, and accepted order modes.
        </p>
      </div>

      {/* Language Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
          <Globe size={14} className="text-indigo-600" /> Default Display Language
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => onChange("language", lang.code)}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                data.language === lang.code
                  ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 text-indigo-950 font-bold"
                  : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
              }`}
            >
              <span className="text-xs font-semibold flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label.split(" ")[0]}</span>
              </span>
              {data.language === lang.code && (
                <CheckCircle2 size={16} className="text-indigo-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Currency Dropdown */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
          <DollarSign size={14} className="text-indigo-600" /> Display Currency
        </label>
        <select
          value={data.currency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Service Modes Selection */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
          Supported Service Modes
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
            <span className="text-xs font-semibold text-slate-800">
              Walk-in / Dine-in Orders
            </span>
            <input
              type="checkbox"
              checked={data.allowWalkin}
              onChange={(e) => onChange("allowWalkin", e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>

          <label className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
            <span className="text-xs font-semibold text-slate-800">
              Takeaway / Pickup Orders
            </span>
            <input
              type="checkbox"
              checked={data.allowTakeaway}
              onChange={(e) => onChange("allowTakeaway", e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>

          <label className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
            <span className="text-xs font-semibold text-slate-800">
              Delivery Orders
            </span>
            <input
              type="checkbox"
              checked={data.allowDelivery}
              onChange={(e) => onChange("allowDelivery", e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>

          <label className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
            <span className="text-xs font-semibold text-slate-800">
              Appointment / Table Booking
            </span>
            <input
              type="checkbox"
              checked={data.allowBooking}
              onChange={(e) => onChange("allowBooking", e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
