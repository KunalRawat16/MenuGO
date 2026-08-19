"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Utensils, Mail, ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requestPasswordResetAction } from "@/app/actions/auth.actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);

      const res = await requestPasswordResetAction(formData);

      if (res.error) {
        setError(res.error);
      } else {
        setIsSubmitted(true);
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 select-none">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl p-8 space-y-6">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
              <Utensils size={20} />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              Menu<span className="text-indigo-600">GO</span>
            </span>
          </Link>
        </div>

        {isSubmitted ? (
          /* Confirmation Screen */
          <div className="text-center space-y-5 animate-in fade-in-50 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/60 shadow-sm">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
                Check Your Email
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                We have sent password recovery instructions to{" "}
                <span className="font-bold text-slate-700">{email}</span>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-700">Didn't receive the email?</p>
              <p className="text-slate-500">Check your spam folder or try requesting again.</p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => setIsSubmitted(false)}
              >
                Resend Reset Link
              </Button>
              <Link href="/auth/login">
                <Button variant="ghost" className="w-full justify-center gap-1.5 text-xs">
                  <ArrowLeft size={14} /> Back to Login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Reset Form Screen */
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
                Reset Your Password
              </h2>
              <p className="text-xs text-slate-500">
                Enter your registered business email and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  ⚠️ {error}
                </div>
              )}

              <Input
                label="Registered Email Address"
                type="email"
                placeholder="owner@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={16} />}
                required
                disabled={isLoading}
              />

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full justify-center shadow-md"
                isLoading={isLoading}
                rightIcon={<ArrowRight size={16} />}
              >
                Send Recovery Link
              </Button>
            </form>

            <div className="text-center pt-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
