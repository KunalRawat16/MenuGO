"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Utensils, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerAction } from "@/app/actions/auth.actions";

const COUNTRIES = [
  { name: "India", code: "IN", currency: "INR (₹)" },
  { name: "United States", code: "US", currency: "USD ($)" },
  { name: "United Kingdom", code: "GB", currency: "GBP (£)" },
  { name: "United Arab Emirates", code: "AE", currency: "AED (AED)" },
  { name: "Canada", code: "CA", currency: "CAD ($)" },
  { name: "Australia", code: "AU", currency: "AUD ($)" },
  { name: "France", code: "FR", currency: "EUR (€)" },
  { name: "Germany", code: "DE", currency: "EUR (€)" },
  { name: "Other", code: "XX", currency: "USD ($)" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("India");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!agreeTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("country", country);

      const res = await registerAction(formData);

      if (res.error) {
        setError(res.error);
        setIsLoading(false);
      } else if (res.success && res.redirect) {
        router.push(res.redirect);
        router.refresh();
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred during registration.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 select-none">
      {/* Left Panel — Visual Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-900 text-white relative overflow-hidden">
        {/* Subtle Glows */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/40">
            <Utensils size={20} />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight font-heading">
            Menu<span className="text-indigo-400">GO</span>
          </span>
        </Link>

        {/* Hero Copy */}
        <div className="space-y-6 relative z-10 max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Sparkles size={14} className="text-amber-400" />
            <span>14-Day Free Trial • No Credit Card Required</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight leading-tight font-heading">
            Transform your business with instant digital menus.
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Join thousands of restaurants, cafés, spas, hotels, and cloud kitchens offering contactless browsing, real-time kitchen tracking, and instant table QR codes.
          </p>

          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Full features unlocked during 14-day free trial</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Setup takes less than 3 minutes with our Business Wizard</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Cancel anytime, zero lock-in contract</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 border-t border-slate-800/80 pt-6 flex items-center justify-between text-xs text-slate-400">
          <span>MenuGO Digital Platform</span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-indigo-400" /> 256-Bit SSL Encrypted
          </span>
        </div>
      </div>

      {/* Right Panel — Registration Form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 max-w-xl mx-auto w-full">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <Utensils size={18} />
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
            Menu<span className="text-indigo-600">GO</span>
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Start Your Free Trial
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Create your account to configure your digital menu in minutes.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in-50">
              <span>⚠️ {error}</span>
            </div>
          )}

          <Input
            label="Full Name / Owner Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />

          <Input
            label="Business Email Address"
            type="email"
            placeholder="owner@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name} — {c.currency}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Password (min. 8 characters)
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:text-slate-600 text-slate-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 leading-relaxed">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-indigo-600 font-semibold hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-indigo-600 font-semibold hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            className="w-full justify-center shadow-md"
            isLoading={isLoading}
            rightIcon={<ArrowRight size={16} />}
          >
            Create Account & Continue →
          </Button>
        </form>

        {/* Footer Link */}
        <p className="mt-8 text-center text-xs text-slate-500 font-medium">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
