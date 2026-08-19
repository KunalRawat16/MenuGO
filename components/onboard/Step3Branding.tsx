"use client";

import React from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { ImageIcon, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export interface Step3Data {
  logo: string;
  banner: string;
}

interface Step3Props {
  data: Step3Data;
  businessName: string;
  onChange: (field: keyof Step3Data, value: string) => void;
}

const DEFAULT_LOGOS = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80",
];

const DEFAULT_BANNERS = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000",
];

export function Step3Branding({ data, businessName, onChange }: Step3Props) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
          Step 3: Visual Branding & Images
        </h2>
        <p className="text-xs text-slate-500">
          Upload your business logo and cover banner image, or choose from defaults.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo Upload Section */}
        <div className="space-y-3">
          <FileUpload
            label="Business Logo"
            currentUrl={data.logo}
            onUploadSuccess={(url) => onChange("logo", url)}
            folder="menugo/logos"
            aspectRatio="square"
            helperText="Square image up to 5MB"
          />

          {/* Default Logo Placeholders */}
          <div className="space-y-1.5 pt-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Or pick a default logo
            </p>
            <div className="flex items-center gap-2">
              {DEFAULT_LOGOS.map((logoUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChange("logo", logoUrl)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 relative transition-all ${
                    data.logo === logoUrl
                      ? "border-indigo-600 ring-2 ring-indigo-500/20 scale-105"
                      : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={logoUrl} alt={`Default ${i}`} fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Banner Upload Section */}
        <div className="space-y-3">
          <FileUpload
            label="Cover Banner Image"
            currentUrl={data.banner}
            onUploadSuccess={(url) => onChange("banner", url)}
            folder="menugo/banners"
            aspectRatio="banner"
            helperText="Wide cover photo up to 5MB"
          />

          {/* Default Banner Placeholders */}
          <div className="space-y-1.5 pt-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Or pick a default banner
            </p>
            <div className="flex items-center gap-2">
              {DEFAULT_BANNERS.map((bannerUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChange("banner", bannerUrl)}
                  className={`h-12 w-20 rounded-xl overflow-hidden border-2 relative transition-all ${
                    data.banner === bannerUrl
                      ? "border-indigo-600 ring-2 ring-indigo-500/20 scale-105"
                      : "border-slate-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={bannerUrl} alt={`Default Banner ${i}`} fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Mockup Card */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Live Customer Header Preview
        </p>
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm relative">
          {/* Banner */}
          <div className="h-28 bg-slate-200 relative overflow-hidden">
            {data.banner ? (
              <Image src={data.banner} alt="Banner Preview" fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-900 to-slate-900 flex items-center justify-center text-xs text-slate-400">
                No Banner Selected
              </div>
            )}
          </div>

          {/* Logo & Info */}
          <div className="p-4 flex items-end justify-between -mt-8 relative z-10">
            <div className="flex items-end gap-3">
              <div className="w-16 h-16 rounded-2xl border-4 border-white bg-white shadow-md relative overflow-hidden shrink-0">
                {data.logo ? (
                  <Image src={data.logo} alt="Logo Preview" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
                    {businessName ? businessName.charAt(0).toUpperCase() : "B"}
                  </div>
                )}
              </div>
              <div className="mb-1">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight font-heading">
                  {businessName || "Your Business Name"}
                </h3>
                <p className="text-[11px] text-slate-500">⭐ 4.8 (120+ ratings) • 20-30 mins</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
