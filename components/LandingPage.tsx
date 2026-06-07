"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Utensils, 
  ScanLine, 
  Smartphone, 
  Sparkles, 
  Check, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  TrendingUp, 
  UploadCloud, 
  QrCode,
  Flame,
  Clock,
  Info,
  Star
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  isPopular: boolean;
  description: string;
  image?: string;
}

interface LandingPageProps {
  restaurant: {
    name: string;
    slug: string;
    logo?: string;
    banner?: string;
    menuItems: MenuItem[];
  } | null;
}

const defaultMockMenu: MenuItem[] = [
  {
    id: "m1",
    name: "Butter Naan",
    price: 65,
    category: "Breads",
    isVeg: true,
    isAvailable: true,
    isPopular: false,
    description: "Soft Indian flatbread baked in a tandoor and brushed with generous amounts of butter.",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&q=80"
  },
  {
    id: "m2",
    name: "Shahi Paneer",
    price: 320,
    category: "Mains",
    isVeg: true,
    isAvailable: true,
    isPopular: true,
    description: "Cottage cheese cubes cooked in a rich, creamy tomato and cashew nut gravy.",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80"
  },
  {
    id: "m3",
    name: "Tandoori Paneer Tikka",
    price: 280,
    category: "Starters",
    isVeg: true,
    isAvailable: true,
    isPopular: true,
    description: "Spiced cottage cheese cubes marinated in yogurt and grilled to perfection.",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80"
  },
  {
    id: "m4",
    name: "Gulab Jamun",
    price: 90,
    category: "Desserts",
    isVeg: true,
    isAvailable: true,
    isPopular: false,
    description: "Warm golden-brown milk dumplings soaked in a cardamom flavored sugar syrup.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80"
  }
];

export default function LandingPage({ restaurant }: LandingPageProps) {
  // Use DB restaurant items if available, else use default mock items
  const menuItems = restaurant?.menuItems && restaurant.menuItems.length > 0 
    ? restaurant.menuItems 
    : defaultMockMenu;

  const restaurantName = restaurant?.name || "The Yellow Chilli Meerut";

  // Dynamic interactive state for the mobile menu demo
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  
  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(menuItems.map(item => item.category));
    return ["All", ...Array.from(cats)];
  }, [menuItems]);

  // Filtered items for demo phone
  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return menuItems.slice(0, 6);
    return menuItems.filter(item => item.category === selectedCategory).slice(0, 6);
  }, [menuItems, selectedCategory]);

  const updateCart = (itemId: string, delta: number) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const totalCartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);

  return (
    <div className="bg-slate-950 text-white font-sans min-h-screen selection:bg-green-500 selection:text-white">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Navigation */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <Utensils size={22} className="text-white animate-pulse" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Menu<span className="text-green-500">Go</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/onboarding" 
            className="bg-green-500 hover:bg-green-600 active:scale-95 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg shadow-green-500/25 flex items-center gap-1.5"
          >
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-green-400 text-xs font-black tracking-wider uppercase">
            <Sparkles size={14} /> The Next-Gen Digital Dining Experience
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Convert Tables Into <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">Instant Sales.</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl font-medium">
            MenuGO brings frictionless tableside ordering to your guests. No app downloads, no registrations. A simple QR scan loads a premium interactive menu instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link 
              href="/onboarding" 
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-xl shadow-green-500/20 text-center transition-all active:scale-98 flex items-center justify-center gap-2 group"
            >
              Onboard Your Restaurant <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#demo" 
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-lg px-8 py-4 rounded-2xl text-center transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <Smartphone size={20} /> View Live Demo
            </a>
          </div>

          {/* Social Proof */}
          <div className="pt-8 border-t border-white/5 grid grid-cols-3 gap-6 max-w-lg">
            <div>
              <p className="text-3xl font-black text-white">100%</p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Self-Managed</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">₹99/mo</p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Starting Price</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">&lt; 5m</p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Setup Time</p>
            </div>
          </div>
        </div>

        {/* Hero Banner Mockup / Image */}
        <div className="md:col-span-5 relative flex justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-emerald-500/20 rounded-full filter blur-[80px] pointer-events-none opacity-60" />
          <div className="relative border border-white/10 bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl max-w-sm w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <span className="text-xs font-black text-slate-500 tracking-widest uppercase">Admin Panel Live</span>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-white/5">
                <p className="text-slate-400 text-xs font-bold">Total Revenue Today</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-2xl font-black text-white">₹14,250</p>
                  <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <TrendingUp size={12} /> +18.5%
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-2xl p-4 border border-white/5 space-y-3">
                <p className="text-slate-400 text-xs font-bold">Menu Performance</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-extrabold">1. Shahi Paneer</span>
                  <span className="text-green-400 font-black">42 sold</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-extrabold">2. Butter Naan</span>
                  <span className="text-green-400 font-black">89 sold</span>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <div className="p-4 bg-white rounded-2xl inline-block shadow-lg shadow-white/5 border border-slate-200">
                  <QrCode size={120} className="text-slate-900" />
                </div>
              </div>
              <p className="text-slate-500 text-[10px] text-center font-bold tracking-widest uppercase mt-2">Print & Place QR on Tables</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Mobile Menu Preview Section */}
      <section id="demo" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            See the Customer Experience in <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">Real-Time.</span>
          </h2>
          <p className="text-slate-400 text-lg font-medium">
            This is exactly what your customers see when they scan your QR code. Below is the digital menu of our mock client <strong className="text-white">{restaurantName}</strong>. Try clicking categories and adding items to the cart.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left instructions */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex-shrink-0 flex items-center justify-center text-green-400">
                  <ScanLine size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Frictionless Browsing</h3>
                  <p className="text-slate-400 text-sm mt-1">Customers simply scan the table QR code and the menu loads instantly on their native browser. No installation needed.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex-shrink-0 flex items-center justify-center text-green-400">
                  <Utensils size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Rich Visual Layouts</h3>
                  <p className="text-slate-400 text-sm mt-1">High-quality dish images, automatic vegetarian indicators, spicy ratings, and descriptions entice guests to order more.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex-shrink-0 flex items-center justify-center text-green-400">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">One-Tap Cart & Orders</h3>
                  <p className="text-slate-400 text-sm mt-1">Guests select their dishes, specify quantities, and place orders directly to the kitchen with table routing.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-900/40 rounded-3xl border border-white/5 space-y-4">
              <h4 className="font-extrabold text-lg text-white flex items-center gap-2">
                <Sparkles className="text-green-400" size={18} /> Mock Menu loaded:
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-green-400 font-black text-lg shadow-inner">
                  YC
                </div>
                <div>
                  <p className="font-black text-white text-sm">{restaurantName}</p>
                  <p className="text-slate-500 text-xs font-semibold">Meerut, Uttar Pradesh</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Mobile Phone Mockup */}
          <div className="lg:col-span-7 flex justify-center">
            {/* Phone outer wrapper */}
            <div className="relative w-[360px] h-[720px] rounded-[50px] border-[12px] border-slate-800 bg-slate-950 shadow-2xl overflow-hidden flex flex-col z-10">
              
              {/* Speaker / Camera Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-slate-800 rounded-b-2xl z-30 flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-900 rounded-full mb-1" />
              </div>

              {/* Mobile Screen Area */}
              <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden pt-6 bg-slate-950 pb-20 relative text-slate-900 font-sans select-none scrollbar-none">
                
                {/* Mobile App Header */}
                <div className="bg-white p-4 pt-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center font-black text-sm">
                      {restaurantName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-gray-900 leading-none">{restaurantName}</h4>
                      <span className="text-[10px] text-green-500 font-bold">● Table 04</span>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="p-2 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100">
                      <ShoppingBag size={18} />
                    </button>
                    {totalCartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
                        {totalCartCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Banner Image */}
                <div className="relative h-28 w-full bg-slate-800 flex-shrink-0">
                  <Image 
                    src={restaurant?.banner || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80"} 
                    alt="banner" 
                    fill 
                    className="object-cover opacity-80" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                  <div className="absolute bottom-2 left-4">
                    <h5 className="font-black text-white text-base leading-none drop-shadow-sm">{restaurantName}</h5>
                    <p className="text-gray-300 text-[10px] font-bold mt-1">Authentic Fine Dining</p>
                  </div>
                </div>

                {/* Category Slider */}
                <div className="bg-white py-3 px-3 flex gap-2 overflow-x-auto scrollbar-none border-b border-gray-50 flex-shrink-0">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                        selectedCategory === cat 
                          ? "bg-green-500 text-white shadow-sm" 
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Menu Item Cards in Mobile - STYLED EXACTLY LIKE MenuCard.js */}
                <div className="flex-1 bg-gray-55 p-3 space-y-3">
                  {filteredItems.map(item => {
                    const quantity = cart[item.id] || 0;
                    const isSpicy = item.description?.toLowerCase().includes('spicy') || item.description?.toLowerCase().includes('chili');

                    return (
                      <div 
                        key={item.id}
                        className={`bg-white rounded-[20px] border border-gray-100 mb-2.5 flex flex-row p-0 gap-0 overflow-hidden transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]`}
                      >
                        {/* Image Section (Left) - Flush with borders */}
                        <div className="relative w-[110px] min-h-[120px] flex-shrink-0">
                          <Image
                            src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"}
                            alt={item.name}
                            fill
                            sizes="110px"
                            className="object-cover"
                          />

                          {/* Popular Tag (Overlay) */}
                          {item.isPopular && (
                            <div className="absolute top-2 left-2 bg-white/95 text-green-500 px-1.5 py-0.5 rounded-md text-[0.6rem] font-black shadow-sm flex items-center gap-0.5 z-10">
                              <Star size={10} fill="currentColor" /> POPULAR
                            </div>
                          )}
                        </div>

                        {/* Content Section (Right) */}
                        <div className="flex-1 flex flex-col justify-between p-3">
                          <div>
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-extrabold text-sm text-gray-900 leading-tight">
                                  {item.name}
                                </h3>
                                {isSpicy && <Flame size={12} color="#ef4444" fill="#ef4444" className="flex-shrink-0" />}
                              </div>

                              {/* Veg/Non-veg Indicator */}
                              <div className={`w-4 h-4 border rounded-[3px] flex items-center justify-center flex-shrink-0 mt-0.5 ml-2 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                                <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                              </div>
                            </div>

                            <p className="text-gray-500 text-[10px] leading-snug line-clamp-2 mb-2">
                              {item.description}
                            </p>

                            <div className="flex items-center gap-3 opacity-70 text-gray-500">
                               <div className="flex items-center gap-1">
                                  <Clock size={10} />
                                  <span className="text-[9px] font-bold">15-20m</span>
                               </div>
                               <div className="flex items-center gap-1">
                                  <Info size={10} />
                                  <span className="text-[9px] font-bold">Details</span>
                               </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-2">
                            <span className="font-black text-gray-900 text-sm">
                              ₹{item.price}
                            </span>

                            <div>
                              {quantity > 0 ? (
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-0.5">
                                  <button
                                    className="w-7 h-7 flex items-center justify-center bg-white text-green-500 rounded-lg shadow-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors"
                                    onClick={() => updateCart(item.id, -1)}
                                  >
                                    <Minus size={14} strokeWidth={4} />
                                  </button>
                                  <span className="font-black text-gray-900 text-xs min-w-[16px] text-center">
                                    {quantity}
                                  </span>
                                  <button
                                    className="w-7 h-7 flex items-center justify-center bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors"
                                    onClick={() => updateCart(item.id, 1)}
                                  >
                                    <Plus size={14} strokeWidth={4} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => updateCart(item.id, 1)}
                                  className="w-9 h-9 flex items-center justify-center bg-green-500 text-white rounded-[10px] hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 transition-colors shadow-sm"
                                >
                                  <Plus size={22} strokeWidth={3} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Floating Cart Button (Mock Mobile) */}
                {totalCartCount > 0 && (
                  <div className="absolute bottom-4 left-3 right-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-lg shadow-black/10 flex items-center justify-between z-20 animate-fade-in-up">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <p className="font-black text-xs text-gray-900">{totalCartCount} Items Added</p>
                        <p className="text-[10px] text-gray-400 font-bold">Table 04</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert("This is a live mock preview. The kitchen dashboard would receive this order in production!")}
                      className="bg-green-500 hover:bg-green-600 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1"
                    >
                      Place Order <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5 bg-slate-900/20 rounded-t-[50px]">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl font-black tracking-tight">Features Built to Boost Margins.</h2>
          <p className="text-slate-400 text-lg">Everything you need to modernize tableside dining, drive average order value, and reduce operational workload.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 space-y-4 hover:border-green-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
              <QrCode size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Quick QR Table Mapping</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Generate uniquely routed QR codes for each table. When scanned, orders automatically flag the correct table number on the kitchen dashboard.</p>
          </div>

          <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 space-y-4 hover:border-green-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
              <UploadCloud size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Dynamic Info Uploads</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Update menus, toggle item availabilities, upload custom banner artwork, and tweak descriptions in real-time. Paid clients get full media controls.</p>
          </div>

          <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 space-y-4 hover:border-green-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Analytics & Excel Export</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Track popular dishes, peak order hours, daily revenue trends, and download formatted order logs for external accounting software with one-click exports.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-green-500 font-black text-xs tracking-wider uppercase bg-green-500/10 px-3 py-1 rounded-full">Pricing Plans</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Flexible Plans for Growing Brands.</h2>
          <p className="text-slate-400 text-lg">Start free, validate your menu, and upgrade to paid plans to lift item caps and unlock premium dashboard controls.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
            <div>
              <h3 className="text-lg font-black text-white">Free Plan</h3>
              <p className="text-slate-500 text-xs mt-1">Perfect to test core layout</p>
              
              <div className="my-6">
                <span className="text-5xl font-black text-white">₹0</span>
                <span className="text-slate-500 text-sm ml-2">/ forever</span>
              </div>

              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span>Maximum of <strong>10 menu items</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span>Interactive digital menu</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span>Standard table QR codes</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500 line-through">
                  <span>Custom banner uploads</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500 line-through">
                  <span>Advanced Analytics & CSV exports</span>
                </li>
              </ul>
            </div>
            
            <div className="pt-8">
              <Link 
                href="/onboarding"
                className="block text-center w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
              >
                Sign Up Free
              </Link>
            </div>
          </div>

          {/* Monthly Growth Plan */}
          <div className="bg-slate-900/80 p-8 rounded-3xl border-2 border-green-500 flex flex-col justify-between relative shadow-xl shadow-green-500/5">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>

            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Monthly Growth <Sparkles size={16} className="text-green-400 animate-spin-slow" />
              </h3>
              <p className="text-green-400 text-xs mt-1 font-extrabold uppercase tracking-wide">Double line value</p>
              
              <div className="my-6">
                <span className="text-5xl font-black text-white">₹99</span>
                <span className="text-slate-400 text-sm ml-2">/ month</span>
              </div>

              <ul className="space-y-3.5 text-sm text-slate-200">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span><strong>Unlimited</strong> menu items (&gt; 10)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span>Upload & update restaurant details</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span>Upload custom banner images</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span>Toggle "Popular" and "Veg" tags</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span>Standard analytics dashboard</span>
                </li>
              </ul>
            </div>
            
            <div className="pt-8">
              <Link 
                href="/onboarding"
                className="block text-center w-full bg-green-500 hover:bg-green-600 active:scale-98 text-white font-black py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-green-500/20"
              >
                Go Growth (Monthly)
              </Link>
            </div>
          </div>

          {/* Annual Premium Plan */}
          <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
            <div>
              <h3 className="text-lg font-black text-white">Annual Premium</h3>
              <p className="text-slate-500 text-xs mt-1">Triple line value</p>
              
              <div className="my-6">
                <span className="text-5xl font-black text-white">₹999</span>
                <span className="text-slate-500 text-sm ml-2">/ year</span>
              </div>

              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span><strong>Unlimited</strong> menu items</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span>Upload & update restaurant details</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span><strong>Full Analytics & CSV Exports</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span>Custom theme & design matching</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span>Priority 24/7 client support</span>
                </li>
              </ul>
            </div>
            
            <div className="pt-8">
              <Link 
                href="/onboarding"
                className="block text-center w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
              >
                Go Premium (Annual)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-white/5 text-center text-slate-500 text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center text-white text-[10px] font-black">
            MG
          </div>
          <span className="font-extrabold text-sm text-slate-300">Menu<span className="text-green-500">Go</span></span>
        </div>
        <p>© 2026 MenuGO Technologies. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
