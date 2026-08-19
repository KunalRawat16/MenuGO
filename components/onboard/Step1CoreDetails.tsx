"use client";

import React from "react";
import { Input } from "@/components/ui/Input";
import { Building2, Phone, MapPin, Globe } from "lucide-react";

export interface Step1Data {
  name: string;
  businessType: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  phone: string;
}

interface Step1Props {
  data: Step1Data;
  onChange: (field: keyof Step1Data, value: string) => void;
}

const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant & Fine Dining" },
  { value: "cafe", label: "Café & Coffee Shop" },
  { value: "bar", label: "Bar, Pub & Lounge" },
  { value: "hotel", label: "Hotel (In-Room & Lobby Service)" },
  { value: "spa", label: "Spa & Wellness Center" },
  { value: "salon", label: "Beauty & Hair Salon" },
  { value: "bakery", label: "Bakery & Confectionery" },
  { value: "food_truck", label: "Food Truck & Street Vendor" },
  { value: "cloud_kitchen", label: "Cloud Kitchen / Ghost Kitchen" },
  { value: "clinic", label: "Clinic / Medical Services" },
  { value: "other", label: "Other Business" },
];

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Canada",
  "Australia",
  "France",
  "Germany",
  "Singapore",
  "Other",
];

export function Step1CoreDetails({ data, onChange }: Step1Props) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
          Step 1: Core Business Profile
        </h2>
        <p className="text-xs text-slate-500">
          Tell us about your establishment so we can tailor your experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Name */}
        <Input
          label="Business Name *"
          placeholder="e.g., The Artisanal Bistro or Velvet Spa"
          value={data.name}
          onChange={(e) => onChange("name", e.target.value)}
          leftIcon={<Building2 size={16} />}
          required
        />

        {/* Business Type */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
            Business Category *
          </label>
          <select
            value={data.businessType}
            onChange={(e) => onChange("businessType", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {BUSINESS_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contact Phone */}
      <Input
        label="Business Phone Number *"
        type="tel"
        placeholder="+91 98765 43210"
        value={data.phone}
        onChange={(e) => onChange("phone", e.target.value)}
        leftIcon={<Phone size={16} />}
        required
      />

      {/* Address Section */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin size={14} className="text-indigo-600" /> Location & Address
        </p>

        <Input
          label="Street Address"
          placeholder="123 Victoria Park Road"
          value={data.street}
          onChange={(e) => onChange("street", e.target.value)}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Input
            label="City"
            placeholder="Meerut"
            value={data.city}
            onChange={(e) => onChange("city", e.target.value)}
          />
          <Input
            label="State / Province"
            placeholder="Uttar Pradesh"
            value={data.state}
            onChange={(e) => onChange("state", e.target.value)}
          />
          <Input
            label="Zip Code"
            placeholder="250001"
            value={data.zip}
            onChange={(e) => onChange("zip", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
            Country
          </label>
          <select
            value={data.country}
            onChange={(e) => onChange("country", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
