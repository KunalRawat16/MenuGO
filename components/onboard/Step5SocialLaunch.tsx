"use client";

import React from "react";
import { Input } from "@/components/ui/Input";
import { Share2, Globe, Camera, Award, Rocket, CheckCircle2 } from "lucide-react";

export interface Step5Data {
  facebook: string;
  instagram: string;
  tripadvisor: string;
  website: string;
}

interface Step5Props {
  data: Step5Data;
  businessName: string;
  onChange: (field: keyof Step5Data, value: string) => void;
}

export function Step5SocialLaunch({ data, businessName, onChange }: Step5Props) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
          Step 5: Social Profiles & Final Launch
        </h2>
        <p className="text-xs text-slate-500">
          Connect your social channels so customers can find and review your business online.
        </p>
      </div>

      {/* Social Links Form */}
      <div className="space-y-4">
        <Input
          label="Instagram Profile URL"
          placeholder="https://instagram.com/yourbusiness"
          value={data.instagram}
          onChange={(e) => onChange("instagram", e.target.value)}
          leftIcon={<Camera size={16} />}
        />

        <Input
          label="Facebook Page URL"
          placeholder="https://facebook.com/yourbusiness"
          value={data.facebook}
          onChange={(e) => onChange("facebook", e.target.value)}
          leftIcon={<Share2 size={16} />}
        />

        <Input
          label="TripAdvisor / Google Review Link"
          placeholder="https://tripadvisor.com/..."
          value={data.tripadvisor}
          onChange={(e) => onChange("tripadvisor", e.target.value)}
          leftIcon={<Award size={16} />}
        />

        <Input
          label="Official Website URL (Optional)"
          placeholder="https://yourbusiness.com"
          value={data.website}
          onChange={(e) => onChange("website", e.target.value)}
          leftIcon={<Globe size={16} />}
        />
      </div>

      {/* Ready Banner Summary */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-3 shadow-md relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
            <Rocket size={18} />
          </div>
          <p className="text-sm font-bold tracking-tight font-heading text-white">
            Your Digital Menu is Ready to Launch!
          </p>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          Clicking <span className="font-bold text-amber-400">Launch My Dashboard</span> will save your configuration, set up your default menu categories, and take you directly to your business management portal.
        </p>

        <div className="pt-2 flex items-center gap-4 text-xs text-indigo-200">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={14} className="text-emerald-400" /> Free Trial Active
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={14} className="text-emerald-400" /> QR Generator Ready
          </span>
        </div>
      </div>
    </div>
  );
}
