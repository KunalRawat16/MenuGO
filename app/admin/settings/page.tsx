"use client";

import React, { useState, useEffect } from "react";
import { Settings, ShieldCheck, Key, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  getPlatformSettingsAction,
  updatePlatformSettingsAction,
} from "@/app/actions/admin.actions";

export default function AdminSettingsPage() {
  const [trialDurationDays, setTrialDurationDays] = useState(14);
  const [freePlanItemLimit, setFreePlanItemLimit] = useState(10);
  const [monthlyPlanPrice, setMonthlyPlanPrice] = useState(499);
  const [yearlyPlanPrice, setYearlyPlanPrice] = useState(4999);

  // Superadmin credentials form
  const [superadminUsername, setSuperadminUsername] = useState("superadmin@gmail.com");
  const [superadminPassword, setSuperadminPassword] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    getPlatformSettingsAction().then((res) => {
      if (res.success && res.settings) {
        setTrialDurationDays(res.settings.trialDurationDays || 14);
        setFreePlanItemLimit(res.settings.freePlanItemLimit || 10);
        setMonthlyPlanPrice(res.settings.monthlyPlanPrice || 499);
        setYearlyPlanPrice(res.settings.yearlyPlanPrice || 4999);
        setSuperadminUsername(res.settings.superadminUsername || "superadmin@gmail.com");
      }
      setIsLoading(false);
    });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    const payload: any = {
      trialDurationDays: Number(trialDurationDays),
      freePlanItemLimit: Number(freePlanItemLimit),
      monthlyPlanPrice: Number(monthlyPlanPrice),
      yearlyPlanPrice: Number(yearlyPlanPrice),
      superadminUsername: superadminUsername.trim(),
    };

    if (superadminPassword) {
      payload.superadminPassword = superadminPassword;
    }

    try {
      const res = await updatePlatformSettingsAction(payload);
      if (res.success) {
        setSuccessMessage("Global platform settings updated!");
        setSuperadminPassword("");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error("Save platform settings error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-heading">
            Global Platform Settings & Credentials
          </h1>
          <p className="text-xs text-slate-400">
            Configure default trial durations, pricing display & super admin authentication
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. Subscription & Trial Config */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider font-heading flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Settings size={16} className="text-amber-400" /> SaaS Trial & Plan Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Default Trial Duration (Days)"
              type="number"
              value={trialDurationDays}
              onChange={(e) => setTrialDurationDays(parseInt(e.target.value) || 14)}
            />

            <Input
              label="Free Plan Item Limit"
              type="number"
              value={freePlanItemLimit}
              onChange={(e) => setFreePlanItemLimit(parseInt(e.target.value) || 10)}
            />

            <Input
              label="Monthly Plan Price (₹)"
              type="number"
              value={monthlyPlanPrice}
              onChange={(e) => setMonthlyPlanPrice(parseInt(e.target.value) || 499)}
            />

            <Input
              label="Yearly Plan Price (₹)"
              type="number"
              value={yearlyPlanPrice}
              onChange={(e) => setYearlyPlanPrice(parseInt(e.target.value) || 4999)}
            />
          </div>
        </div>

        {/* 2. Superadmin Account Security */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider font-heading flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <ShieldCheck size={16} className="text-amber-400" /> Super Admin Security Credentials
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Super Admin Username"
              value={superadminUsername}
              onChange={(e) => setSuperadminUsername(e.target.value)}
              required
            />

            <Input
              label="Change Password (leave blank to keep current)"
              type="password"
              placeholder="••••••••"
              value={superadminPassword}
              onChange={(e) => setSuperadminPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="accent"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save size={16} />}
          >
            Save Platform Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
