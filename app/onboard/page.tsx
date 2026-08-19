"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Utensils, ArrowRight, ArrowLeft, Rocket, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { completeOnboardingAction } from "@/app/actions/restaurant.actions";

// Steps
import { Step1CoreDetails, Step1Data } from "@/components/onboard/Step1CoreDetails";
import { Step2Localization, Step2Data } from "@/components/onboard/Step2Localization";
import { Step3Branding, Step3Data } from "@/components/onboard/Step3Branding";
import { Step4Categories, Step4Data } from "@/components/onboard/Step4Categories";
import { Step5SocialLaunch, Step5Data } from "@/components/onboard/Step5SocialLaunch";

const STEPS = [
  { id: 1, name: "Profile", label: "1. Profile" },
  { id: 2, name: "Regional", label: "2. Regional" },
  { id: 3, name: "Branding", label: "3. Branding" },
  { id: 4, name: "Categories", label: "4. Categories" },
  { id: 5, name: "Launch", label: "5. Launch" },
];

export default function OnboardWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [step1, setStep1] = useState<Step1Data>({
    name: "",
    businessType: "restaurant",
    street: "",
    city: "",
    state: "",
    country: "India",
    zip: "",
    phone: "",
  });

  const [step2, setStep2] = useState<Step2Data>({
    language: "en",
    currency: "INR",
    currencySymbol: "₹",
    avgServiceTime: "20-30 mins",
    allowWalkin: true,
    allowTakeaway: true,
    allowDelivery: false,
    allowBooking: false,
  });

  const [step3, setStep3] = useState<Step3Data>({
    logo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80",
    banner: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000",
  });

  const [step4, setStep4] = useState<Step4Data>({
    cuisineTypes: ["Indian", "Continental"],
    categories: ["Starters & Appetizers", "Main Courses", "Desserts", "Beverages"],
  });

  const [step5, setStep5] = useState<Step5Data>({
    facebook: "",
    instagram: "",
    tripadvisor: "",
    website: "",
  });

  const handleNext = () => {
    setError(null);
    if (currentStep === 1) {
      if (!step1.name.trim()) {
        setError("Please enter your Business Name.");
        return;
      }
      if (!step1.phone.trim()) {
        setError("Please enter your Business Phone Number.");
        return;
      }
    }
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFinalSubmit = async () => {
    setError(null);
    setIsLoading(true);

    const wizardData = {
      name: step1.name,
      businessType: step1.businessType,
      address: {
        street: step1.street,
        city: step1.city,
        state: step1.state,
        country: step1.country,
        zip: step1.zip,
        phone: step1.phone,
      },
      language: step2.language,
      currency: step2.currency,
      currencySymbol: step2.currencySymbol,
      logo: step3.logo,
      banner: step3.banner,
      cuisineTypes: step4.cuisineTypes,
      categories: step4.categories,
      social: {
        facebook: step5.facebook,
        instagram: step5.instagram,
        tripadvisor: step5.tripadvisor,
        website: step5.website,
      },
    };

    try {
      const res = await completeOnboardingAction(wizardData);

      if (res.error) {
        setError(res.error);
        setIsLoading(false);
      } else if (res.success && res.redirect) {
        router.push(res.redirect);
        router.refresh();
      }
    } catch (err) {
      console.error("Onboarding submission error:", err);
      setError("Failed to save wizard details. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between select-none">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Utensils size={18} />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
              Menu<span className="text-indigo-600">GO</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200/60">
            <Sparkles size={13} /> Business Setup Wizard
          </div>
        </div>
      </header>

      {/* Main Wizard Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl p-6 sm:p-10 space-y-8">
          {/* Multi-Step Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
              {STEPS.map((s) => (
                <span
                  key={s.id}
                  className={
                    currentStep === s.id
                      ? "text-indigo-600 font-extrabold"
                      : currentStep > s.id
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }
                >
                  {s.label}
                </span>
              ))}
            </div>

            {/* Visual Step Circles & Bar */}
            <div className="relative flex items-center justify-between">
              {/* Background Connecting Line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 -z-0" />
              {/* Progress Active Line */}
              <div
                className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 transition-all duration-300 -z-0"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />

              {STEPS.map((s) => {
                const isDone = currentStep > s.id;
                const isCurrent = currentStep === s.id;

                return (
                  <div
                    key={s.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                      isDone
                        ? "bg-emerald-500 text-white shadow-sm"
                        : isCurrent
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110 shadow-md"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isDone ? <Check size={16} strokeWidth={3} /> : s.id}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inline Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in-50">
              ⚠️ {error}
            </div>
          )}

          {/* Current Step Component */}
          <div className="min-h-[350px]">
            {currentStep === 1 && (
              <Step1CoreDetails
                data={step1}
                onChange={(f, v) => setStep1((prev) => ({ ...prev, [f]: v }))}
              />
            )}
            {currentStep === 2 && (
              <Step2Localization
                data={step2}
                country={step1.country}
                onChange={(f, v) => setStep2((prev) => ({ ...prev, [f]: v }))}
              />
            )}
            {currentStep === 3 && (
              <Step3Branding
                data={step3}
                businessName={step1.name}
                onChange={(f, v) => setStep3((prev) => ({ ...prev, [f]: v }))}
              />
            )}
            {currentStep === 4 && (
              <Step4Categories
                data={step4}
                businessType={step1.businessType}
                onChange={(f, v) => setStep4((prev) => ({ ...prev, [f]: v }))}
              />
            )}
            {currentStep === 5 && (
              <Step5SocialLaunch
                data={step5}
                businessName={step1.name}
                onChange={(f, v) => setStep5((prev) => ({ ...prev, [f]: v }))}
              />
            )}
          </div>

          {/* Bottom Navigation Control Buttons */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={isLoading}
                leftIcon={<ArrowLeft size={16} />}
              >
                Back
              </Button>
            ) : (
              <div /> // Spacer
            )}

            {currentStep < STEPS.length ? (
              <Button
                variant="default"
                onClick={handleNext}
                rightIcon={<ArrowRight size={16} />}
              >
                Save & Continue
              </Button>
            ) : (
              <Button
                variant="accent"
                size="lg"
                onClick={handleFinalSubmit}
                isLoading={isLoading}
                rightIcon={<Rocket size={18} />}
              >
                🚀 Launch My Dashboard
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        Need help setting up? Contact support@menugo.in
      </footer>
    </div>
  );
}
