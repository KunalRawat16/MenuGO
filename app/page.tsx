"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Utensils,
  ArrowRight,
  Sparkles,
  QrCode,
  Zap,
  Globe,
  DollarSign,
  CheckCircle2,
  ChevronDown,
  Play,
  ShieldCheck,
  Building2,
  Coffee,
  Scissors,
  Hotel,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function MarketingLandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const realBusinesses = [
    {
      title: "La Bella Italia",
      type: "Italian Restaurant & Fine Dining",
      icon: Utensils,
      slug: "la-bella-italia",
      location: "Bengaluru, Karnataka",
      rating: 4.9,
      itemCount: 11,
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600",
      description: "Authentic Italian pizzeria & trattoria serving handmade pasta, wood-fired pizzas, and classic desserts.",
      tags: ["Italian", "Pizza", "Pasta"],
    },
    {
      title: "Dragon Fly Bistro",
      type: "Pan-Asian Bistro & Dim Sum",
      icon: Utensils,
      slug: "dragon-fly-bistro",
      location: "Noida, Uttar Pradesh",
      rating: 4.8,
      itemCount: 8,
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600",
      description: "Contemporary Pan-Asian bistro & dim sum parlor offering gourmet sushi rolls, rich ramen, and handmade bao buns.",
      tags: ["Pan-Asian", "Sushi", "Ramen"],
    },
    {
      title: "The Copper Handi",
      type: "Heritage Mughlai & North Indian",
      icon: Utensils,
      slug: "copper-handi",
      location: "New Delhi",
      rating: 4.7,
      itemCount: 7,
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=600",
      description: "Royal Mughlai & North Indian heritage dining featuring slow-cooked biryanis, tandoori kebabs, and rich gravies.",
      tags: ["North Indian", "Biryani", "Kebabs"],
    },
    {
      title: "Brew & Bean Roastery",
      type: "Artisanal Café & Bakery",
      icon: Coffee,
      slug: "brew-and-bean",
      location: "Mumbai, Maharashtra",
      rating: 4.9,
      itemCount: 7,
      image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600",
      description: "Artisanal specialty coffee house, sourdough bakery, and all-day brunch lounge with fresh roasted single-origin beans.",
      tags: ["Cafe", "Coffee", "Brunch"],
    },
  ];

  const faqs = [
    {
      q: "Do I need special hardware or POS machines to use MenuGO?",
      a: "No hardware is required! MenuGO works on any smartphone, tablet, laptop, or existing iPad. Your staff can view incoming orders directly from any browser.",
    },
    {
      q: "How do table QR codes work?",
      a: "MenuGO automatically generates unique, print-ready SVG and high-resolution PNG QR code assets for all your tables. Customers scan the QR code using their phone camera to instantly view your menu without downloading any app.",
    },
    {
      q: "Can I use MenuGO for businesses other than restaurants?",
      a: "Yes! MenuGO is built for any menu-based establishment including cafés, bars, spas, salons, hotels (in-room dining), bakeries, food trucks, and cloud kitchens.",
    },
    {
      q: "Is there a free trial period?",
      a: "Yes! Every new account gets a 14-day full-access free trial. No credit card or upfront payment is required to get started.",
    },
    {
      q: "How does real-time order tracking work?",
      a: "When a customer submits an order, it instantly streams to your owner dashboard using Server-Sent Events (SSE) technology, updating your kitchen Kanban queue with zero page reloads.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none overflow-x-hidden">
      {/* 1. Global Navigation Header */}
      <PublicHeader />

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-900 text-white overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 animate-in fade-in-50">
            <Sparkles size={14} className="text-amber-400" />
            <span>Next-Generation Digital Menu & Order Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto font-heading">
            Create Your Digital Menu —{" "}
            <span className="gradient-brand-text">Free in 60 Seconds</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Replace paper menus with contactless QR codes, instant customer ordering, and a real-time kitchen tracking pipeline for any business.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/auth/register">
              <Button
                variant="accent"
                size="lg"
                className="w-full sm:w-auto px-8 shadow-xl shadow-amber-500/20"
                rightIcon={<ArrowRight size={18} />}
              >
                Create Your Digital Menu Free
              </Button>
            </Link>
            <a href="#demo">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-slate-700 text-slate-900 hover:bg-slate-800 hover:text-slate-300"
                leftIcon={<Play size={16} />}
              >
                See Live Demo
              </Button>
            </a>
          </div>

          {/* Social Proof Strip */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" /> 14-Day Free Trial
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" /> Zero Hardware Needed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-400" /> Print-Ready QR Codes
            </span>
          </div>
        </div>
      </section>

      {/* 3. Real Business Owner Menus Section */}
      <section id="demo" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="default" size="md">
              Real Business Owner Menus
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
              Explore Live Business Digital Menus
            </h2>
            <p className="text-sm text-slate-500">
              Click any active business below to experience their live digital menu, browse itemized categories, and test customer ordering.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {realBusinesses.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.slug}
                  className="bg-slate-50 rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="h-36 rounded-xl bg-slate-200 relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-400 text-[11px] font-bold flex items-center gap-1 shadow-xs">
                        ★ {item.rating}
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-indigo-600/90 backdrop-blur-xs text-white text-[10px] font-bold">
                        {item.itemCount} Menu Items
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                        <Icon size={13} /> {item.type}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-heading mt-0.5">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        📍 {item.location}
                      </p>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                    <Link href={`/${item.slug}`} className="block">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full justify-center shadow-xs group-hover:bg-indigo-700"
                        rightIcon={<ArrowRight size={14} />}
                      >
                        View Live Menu
                      </Button>
                    </Link>
                    <Link href={`/${item.slug}?table=T1`} className="block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center text-[11px] h-7 border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200"
                        leftIcon={<QrCode size={12} />}
                      >
                        Test Table QR Code
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Feature Highlights Grid */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="accent" size="md">
              Core Platform Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
              Everything You Need to Run Modern Operations
            </h2>
            <p className="text-sm text-slate-500">
              Designed from the ground up to eliminate order friction, reduce staff overhead, and delight customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm space-y-4 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
                Multi-Language & Multi-Currency Support
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Serve international guests seamlessly. Display menus in English, Hindi, French, Spanish, Arabic, or German with localized currency symbols (₹, $, €, £, AED).
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm space-y-4 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <QrCode size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
                Print-Ready QR Code Asset Generator
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Register tables or service points and download high-resolution SVG and PNG QR cards ready for display on table stands, counters, or room cards.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm space-y-4 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
                Real-Time Kitchen Order Pipeline (SSE)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Orders stream instantly to your kitchen Kanban queue with zero delay, organizing items into Incoming, Preparing, Served, and Paid status columns.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm space-y-4 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Building2 size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading">
                Built for All Menu-Based Businesses
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tailored service modes for restaurants, cafés, bars, spas, beauty salons, hotels, food trucks, and cloud kitchens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing & Plans Section */}
      <section id="pricing" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <Badge variant="success" size="md">
              Transparent Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
              Simple, Predictable Plans for Every Scale
            </h2>
            <p className="text-sm text-slate-500">
              Start with a 14-day free trial. Upgrade only when you are satisfied.
            </p>

            {/* Monthly / Annual Billing Toggle */}
            <div className="inline-flex items-center gap-3 p-1.5 bg-slate-100 rounded-full border border-slate-200">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${billingCycle === "monthly"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600"
                  }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${billingCycle === "yearly"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600"
                  }`}
              >
                Annual Billing <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-md uppercase">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Trial Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">14-Day Free Trial</h3>
                  <p className="text-xs text-slate-500">Test all features with zero commitment</p>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 font-heading">₹0</div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">✓ Up to 10 Menu Items</li>
                  <li className="flex items-center gap-2">✓ 2 Table QR Codes</li>
                  <li className="flex items-center gap-2">✓ Live Kitchen Pipeline</li>
                </ul>
              </div>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full justify-center">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Monthly / Yearly Plan Card */}
            <div className="bg-gradient-to-b from-indigo-950 to-slate-950 text-white rounded-2xl border-2 border-indigo-500 p-8 space-y-6 flex flex-col justify-between relative shadow-xl">
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                Most Popular
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">Pro Business Plan</h3>
                  <p className="text-xs text-slate-400">Unlimited items & complete control</p>
                </div>
                <div className="text-3xl font-extrabold text-white font-heading">
                  {billingCycle === "monthly" ? "₹499" : "₹399"}{" "}
                  <span className="text-xs font-normal text-slate-400">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">✓ Unlimited Menu Items</li>
                  <li className="flex items-center gap-2">✓ Unlimited Table QR Codes</li>
                  <li className="flex items-center gap-2">✓ Real-time SSE Order Stream</li>
                  <li className="flex items-center gap-2">✓ Analytics & Sales Insights</li>
                  <li className="flex items-center gap-2">✓ Multi-Language & Multi-Currency</li>
                </ul>
              </div>
              <Link href="/auth/register">
                <Button variant="accent" className="w-full justify-center shadow-lg">
                  Get Pro Plan →
                </Button>
              </Link>
            </div>

            {/* Enterprise Plan Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">Multi-Chain / Custom</h3>
                  <p className="text-xs text-slate-500">For multi-location brands & franchises</p>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 font-heading">Custom</div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">✓ Multi-Location Management</li>
                  <li className="flex items-center gap-2">✓ Custom Domain Mapping</li>
                  <li className="flex items-center gap-2">✓ Priority 24/7 Dedicated Support</li>
                </ul>
              </div>
              <a href="mailto:support@menugo.in">
                <Button variant="outline" className="w-full justify-center">
                  Contact Sales
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Accordion FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="default" size="md">
              Got Questions?
            </Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${isOpen ? "rotate-180 text-indigo-600" : "text-slate-400"}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Global Footer */}
      <PublicFooter />
    </div>
  );
}
