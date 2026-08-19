"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Utensils, Eye, EyeOff, ArrowRight, ShieldCheck, Zap, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginAction } from "@/app/actions/auth.actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const res = await loginAction(formData);

      if (res.error) {
        setError(res.error);
        setIsLoading(false);
      } else if (res.success && res.redirect) {
        router.push(res.redirect);
        router.refresh();
      }
    } catch (err) {
      console.error("Login submission error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 select-none">
      {/* Left Panel — Visual Branding & Social Proof (Desktop Only) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/40">
            <Utensils size={20} />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight font-heading">
            Menu<span className="text-indigo-400">GO</span>
          </span>
        </Link>

        {/* Center Graphic & Value Proposition */}
        <div className="space-y-8 relative z-10 max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Sparkles size={14} className="text-amber-400" />
            <span>Powering 1,000+ Modern Establishments</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight leading-tight font-heading">
            Manage your digital menu & live orders with total control.
          </h1>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Instant Table QR Generation</p>
                <p className="text-xs text-slate-400">Print-ready SVG & PNG assets generated in seconds.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Real-Time Kitchen Pipeline</p>
                <p className="text-xs text-slate-400">Zero latency order streams directly to your kitchen dashboard.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Multi-Format Business Support</p>
                <p className="text-xs text-slate-400">Built for restaurants, cafés, spas, salons, hotels & cloud kitchens.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="relative z-10 border-t border-slate-800/80 pt-6">
          <p className="text-xs text-slate-400">
            "MenuGO reduced our table wait times by 35% within the first week of installation."
          </p>
          <p className="text-xs font-semibold text-indigo-300 mt-1">
            — Owner, The Artisanal Bistro
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
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
            Welcome back
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter your credentials to access your business portal.
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
            label="Email Address"
            type="email"
            placeholder="owner@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
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

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Remember me for 30 days</span>
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
            Sign In to Dashboard
          </Button>

          {/* Social Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-50 px-3 text-slate-400 font-semibold">Or continue with</span>
            </div>
          </div>

          {/* Social Google Login Button (Placeholder) */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-2"
            onClick={() => alert("Google OAuth login will be available soon.")}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </Button>
        </form>

        {/* Footer Link */}
        <p className="mt-8 text-center text-xs text-slate-500 font-medium">
          Don't have a business account yet?{" "}
          <Link
            href="/auth/register"
            className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Create Your Free Account
          </Link>
        </p>
      </div>
    </div>
  );
}
