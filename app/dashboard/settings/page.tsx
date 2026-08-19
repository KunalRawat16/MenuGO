"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Globe,
  Share2,
  Lock,
  CreditCard,
  Save,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FileUpload } from "@/components/ui/FileUpload";
import { Badge } from "@/components/ui/Badge";
import { getMyBusinessAction, updateRestaurantInfoAction } from "@/app/actions/restaurant.actions";

export default function SettingsPage() {
  const [business, setBusiness] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tripadvisor, setTripadvisor] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    getMyBusinessAction().then((res) => {
      if (res.success && res.business) {
        const b = res.business;
        setBusiness(b);
        setName(b.name || "");
        setDescription(b.description || "");
        setLogo(b.logo || "");
        setBanner(b.banner || "");
        setStreet(b.address?.street || "");
        setCity(b.address?.city || "");
        setPhone(b.address?.phone || "");
        setCurrency(b.localization?.currency || "INR");
        setCurrencySymbol(b.localization?.currencySymbol || "₹");
        setInstagram(b.social?.instagram || "");
        setFacebook(b.social?.facebook || "");
        setTripadvisor(b.social?.tripadvisor || "");
        setWebsite(b.social?.website || "");
      }
      setIsLoading(false);
    });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business?._id) return;

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const payload = {
      name,
      description,
      logo,
      banner,
      address: { street, city, phone },
      localization: { currency, currencySymbol },
      social: { instagram, facebook, tripadvisor, website },
    };

    try {
      const res = await updateRestaurantInfoAction(business._id, payload);

      if (res.error) {
        setError(res.error);
      } else {
        setSuccessMessage("Business settings updated successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error("Save settings error:", err);
      setError("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
            Business Settings & Configuration
          </h1>
          <p className="text-xs text-slate-500">
            Manage branding images, localization, social channels & subscription details
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in-50">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* 1. Core Profile */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Building2 size={16} className="text-indigo-600" /> Business Profile & Images
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Business Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Business Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell customers about your establishment..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <FileUpload
              label="Logo Image"
              currentUrl={logo}
              onUploadSuccess={(url) => setLogo(url)}
              folder="menugo/logos"
              aspectRatio="square"
            />
            <FileUpload
              label="Cover Banner Image"
              currentUrl={banner}
              onUploadSuccess={(url) => setBanner(url)}
              folder="menugo/banners"
              aspectRatio="banner"
            />
          </div>
        </div>

        {/* 2. Social Links */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Share2 size={16} className="text-indigo-600" /> Social Links & Website
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Instagram URL"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/..."
            />
            <Input
              label="Facebook URL"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/..."
            />
            <Input
              label="TripAdvisor Link"
              value={tripadvisor}
              onChange={(e) => setTripadvisor(e.target.value)}
              placeholder="https://tripadvisor.com/..."
            />
            <Input
              label="Official Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourbusiness.com"
            />
          </div>
        </div>

        {/* 3. Subscription Info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-sm">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <CreditCard size={16} className="text-indigo-600" /> Current Subscription Plan
          </h2>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 uppercase">
                  {business?.subscription?.plan || "Trial"} Plan
                </span>
                <Badge variant="success" size="sm">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Billing managed manually by Platform Super Admin
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => alert("Contact support@menugo.in to extend plan.")}
            >
              Extend Plan
            </Button>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="default"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save size={16} />}
          >
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
