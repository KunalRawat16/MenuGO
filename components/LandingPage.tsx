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
  Star,
  Sun,
  Moon,
  Soup,
  Coffee,
  Pizza,
  Salad,
  Beef,
  Cake,
  GlassWater,
  IndianRupee,
  Search as SearchIcon,
  SlidersHorizontal,
  X
} from "lucide-react";
import MenuGoIcon from "./MenuGoIcon";

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
    address?: string;
    menuItems: MenuItem[];
    categories?: string[];
  } | null;
}

const defaultMockMenu: MenuItem[] = [
  {
    id: "m1",
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
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [nonVegOnly, setNonVegOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [cart, setCart] = useState<Record<string, number>>({});

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Drag-to-scroll touch-like simulation state for desktop
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startY, setStartY] = useState<number>(0);
  const [scrollTop, setScrollTop] = useState<number>(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a')) {
      return;
    }
    setIsDragging(true);
    setStartY(e.pageY - e.currentTarget.offsetTop);
    setScrollTop(e.currentTarget.scrollTop);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const y = e.pageY - e.currentTarget.offsetTop;
    const walkY = (y - startY) * 1.6; // multiplier for drag speed
    e.currentTarget.scrollTop = scrollTop - walkY;
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(menuItems.map(item => item.category));
    return ["All", ...Array.from(cats)];
  }, [menuItems]);

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

  // Helper for category icons in mobile preview matching MenuClient
  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('appetizer') || c.includes('starter')) return <Soup size={18} className="text-green-500" />;
    if (c.includes('main')) return <Utensils size={18} className="text-green-500" />;
    if (c.includes('pizza') || c.includes('bread')) return <Pizza size={18} className="text-green-500" />;
    if (c.includes('salad')) return <Salad size={18} className="text-green-500" />;
    if (c.includes('meat') || c.includes('non')) return <Beef size={18} className="text-green-500" />;
    if (c.includes('dessert') || c.includes('sweet')) return <Cake size={18} className="text-green-500" />;
    if (c.includes('beverage') || c.includes('drink')) return <GlassWater size={18} className="text-green-500" />;
    if (c.includes('coffee')) return <Coffee size={18} className="text-green-500" />;
    return <Pizza size={18} className="text-green-500" />;
  };

  // Grouped and filtered items for category grouping inside the mock mobile device
  const groupedCategories = useMemo(() => {
    const activeCats = selectedCategory === "All"
      ? Array.from(new Set(menuItems.map(item => item.category)))
      : [selectedCategory];

    return activeCats.map(cat => {
      const items = menuItems.filter(item => {
        if (item.category !== cat) return false;
        if (vegOnly && !item.isVeg) return false;
        if (nonVegOnly && item.isVeg) return false;
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          if (!item.name.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) {
            return false;
          }
        }
        return true;
      });

      // Sort items based on selected sort criteria
      const sortedItems = [...items].sort((a, b) => {
        if (sortBy === "price_low") return a.price - b.price;
        if (sortBy === "price_high") return b.price - a.price;
        if (sortBy === "popular") return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
        return 0;
      });

      return { category: cat, items: sortedItems };
    }).filter(group => group.items.length > 0);
  }, [menuItems, selectedCategory, vegOnly, nonVegOnly, searchQuery, sortBy]);

  return (
    <div className={`landing-page relative transition-colors duration-300 font-sans min-h-screen w-full max-w-[100vw] selection:bg-green-500 selection:text-white overflow-x-hidden ${isDarkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
      }`}>
      {/* Background decoration */}
      <div className={`absolute top-0 left-1/4 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 rounded-full blur-[120px] pointer-events-none z-0 transition-opacity duration-300 ${isDarkMode ? "bg-green-500/10 opacity-100" : "bg-green-500/5 opacity-50"
        }`} />
      <div className={`absolute top-1/3 right-1/4 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 rounded-full blur-[120px] pointer-events-none z-0 transition-opacity duration-300 ${isDarkMode ? "bg-emerald-500/10 opacity-100" : "bg-emerald-500/5 opacity-50"
        }`} />

      {/* Navigation */}
      <header className={`relative z-50 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between border-b transition-all duration-300 sticky top-0 backdrop-blur-md ${isDarkMode ? "border-white/5 bg-slate-950/70" : "border-slate-200/80 bg-white/70"
        }`}>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <MenuGoIcon size={20} className="text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className={`font-extrabold text-xl sm:text-2xl leading-none tracking-tight ${isDarkMode ? "bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent" : "text-slate-900"
              }`}>
              Menu<span className="text-green-500">Go</span>
            </span>
            <span className="text-[8px] sm:text-[9px] font-black text-green-500 tracking-[0.18em] uppercase leading-none mt-1 select-none">
              green
            </span>
          </div>
        </div>

        <nav className={`hidden md:flex items-center gap-8 text-sm font-semibold transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"
          }`}>
          <a href="#features" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Features</a>
          <a href="#demo" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Interactive Demo</a>
          <a href="#pricing" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>Pricing</a>
          <a href="#about" className={`transition-colors ${isDarkMode ? "hover:text-white" : "hover:text-slate-900"}`}>About</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Light/Dark Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle dark/light mode"
            className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center ${isDarkMode
                ? "bg-white/5 border-white/10 text-green-400 hover:bg-white/10"
                : "bg-slate-100 border-slate-200 text-green-600 hover:bg-slate-200 shadow-sm"
              }`}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link
            href="/login"
            className={`text-xs sm:text-sm font-bold transition-colors ${isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-green-500 hover:bg-green-600 active:scale-95 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all shadow-lg shadow-green-500/25 flex items-center gap-1 sm:gap-1.5"
          >
            Get Started <ArrowRight size={14} className="hidden xs:block" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 min-[576px]:px-6 md:px-8 lg:px-6 pt-10 sm:pt-14 md:pt-16 pb-14 sm:pb-20 md:pb-24 grid md:grid-cols-12 gap-8 md:gap-12 items-center">
        <div className="md:col-span-7 space-y-6 sm:space-y-8 text-left">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] sm:text-xs font-black tracking-wider uppercase transition-colors duration-300 ${isDarkMode ? "bg-white/5 border-white/10 text-green-400" : "bg-green-500/10 border-green-500/20 text-green-600"
            }`}>
            <Sparkles size={12} /> The Next-Gen Digital Dining Experience
          </div>

          <h1 className={`text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] sm:leading-[1.05] transition-colors duration-300 ${isDarkMode
              ? "bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent"
              : "text-slate-900"
            }`}>
            Convert Tables Into <span className="bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">Instant Sales.</span>
          </h1>

          <p className={`text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl font-medium transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"
            }`}>
            MenuGO brings frictionless tableside ordering to your guests. No app downloads, no registrations. A simple QR scan loads a premium interactive menu instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
            <Link
              href="/register"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-black text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl shadow-green-500/20 text-center transition-all active:scale-98 flex items-center justify-center gap-2 group"
            >
              Register Your Restaurant <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#demo"
              className={`font-extrabold text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-center transition-all active:scale-98 flex items-center justify-center gap-2 border ${isDarkMode
                  ? "bg-white/5 hover:bg-white/10 border-white/10 text-red-500"
                  : "bg-white hover:bg-slate-100 border-slate-200 text-slate-800 shadow-sm"
                }`}
            >
              <Smartphone size={18} /> View Live Demo
            </a>
          </div>

          {/* Social Proof */}
          <div className={`pt-6 sm:pt-8 border-t grid grid-cols-3 gap-4 sm:gap-6 max-w-lg transition-colors duration-300 ${isDarkMode ? "border-white/5" : "border-slate-200"
            }`}>
            <div>
              <p className={`text-xl sm:text-2xl md:text-3xl font-black transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>100%</p>
              <p className="text-slate-500 text-[9px] sm:text-xs font-bold uppercase tracking-wider mt-1">Self-Managed</p>
            </div>
            <div>
              <p className={`text-xl sm:text-2xl md:text-3xl font-black transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>₹199/mo</p>
              <p className="text-slate-500 text-[9px] sm:text-xs font-bold uppercase tracking-wider mt-1">Starting Price</p>
            </div>
            <div>
              <p className={`text-xl sm:text-2xl md:text-3xl font-black transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>&lt; 5m</p>
              <p className="text-slate-500 text-[9px] sm:text-xs font-bold uppercase tracking-wider mt-1">Setup Time</p>
            </div>
          </div>
        </div>

        {/* Hero Banner Mockup / Image */}
        <div className="md:col-span-5 relative flex justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-emerald-500/20 rounded-full filter blur-[80px] pointer-events-none opacity-60" />
          <div className={`relative border rounded-3xl p-4 sm:p-6 shadow-2xl max-w-sm w-full transition-all duration-300 ${isDarkMode
              ? "bg-slate-900/60 border-white/10"
              : "bg-white border-slate-200/80"
            }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <span className="text-xs font-black text-slate-500 tracking-widest uppercase">Admin Panel Live</span>
            </div>

            <div className="space-y-4">
              <div className={`rounded-2xl p-4 border transition-colors duration-300 ${isDarkMode ? "bg-slate-950/80 border-white/5" : "bg-slate-50 border-slate-200/50"
                }`}>
                <p className="text-slate-400 text-xs font-bold">Total Revenue Today</p>
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-2xl font-black transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>₹14,250</p>
                  <span className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <TrendingUp size={12} /> +18.5%
                  </span>
                </div>
              </div>

              <div className={`rounded-2xl p-4 border transition-colors duration-300 ${isDarkMode ? "bg-slate-950/80 border-white/5" : "bg-slate-50 border-slate-200/50"
                } space-y-3`}>
                <p className="text-slate-400 text-xs font-bold">Menu Performance</p>
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-extrabold transition-colors duration-300 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>1. Shahi Paneer</span>
                  <span className="text-green-500 font-black">42 sold</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-extrabold transition-colors duration-300 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>2. Butter Naan</span>
                  <span className="text-green-500 font-black">89 sold</span>
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
      <section id="demo" className={`relative z-10 max-w-7xl mx-auto px-4 min-[576px]:px-6 md:px-8 lg:px-6 py-12 sm:py-16 md:py-20 border-t transition-colors duration-300 ${isDarkMode ? "border-white/5" : "border-slate-200/80 bg-white"
        }`}>
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <h2 className={`text-2xl sm:text-4xl md:text-5xl font-black tracking-tight transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
            See the Customer Experience in <span className="bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">Real-Time.</span>
          </h2>
          <p className={`text-sm sm:text-base md:text-lg font-medium transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            This is exactly what your customers see when they scan your QR code. Below is the digital menu of our mock client <strong className={`transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>{restaurantName}</strong>. Try searching, filtering, and adding items to the cart.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left instructions */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8 text-left">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-500/10 border border-green-500/20 flex-shrink-0 flex items-center justify-center text-green-500">
                  <ScanLine size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Frictionless Browsing</h3>
                  <p className={`text-xs sm:text-sm mt-1 transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Customers simply scan the table QR code and the menu loads instantly on their native browser. No installation needed.</p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-500/10 border border-green-500/20 flex-shrink-0 flex items-center justify-center text-green-500">
                  <Utensils size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Rich Visual Layouts</h3>
                  <p className={`text-xs sm:text-sm mt-1 transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>High-quality dish images, automatic vegetarian indicators, spicy ratings, and descriptions entice guests to order more.</p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-500/10 border border-green-500/20 flex-shrink-0 flex items-center justify-center text-green-500">
                  <ShoppingBag size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>One-Tap Cart & Orders</h3>
                  <p className={`text-xs sm:text-sm mt-1 transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Guests select their dishes, specify quantities, and place orders directly to the kitchen with table routing.</p>
                </div>
              </div>
            </div>

            <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-colors duration-300 ${isDarkMode ? "bg-slate-900/40 border-white/5" : "bg-slate-100 border-slate-200"
              } space-y-4`}>
              <h4 className={`font-extrabold text-base sm:text-lg flex items-center gap-2 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                <Sparkles className="text-green-500" size={16} /> Mock Menu loaded:
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-800 rounded-xl flex items-center justify-center text-green-500 font-black text-base sm:text-lg shadow-inner">
                  YC
                </div>
                <div>
                  <p className={`font-black text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>{restaurantName}</p>
                  <p className="text-slate-500 text-[10px] sm:text-xs font-semibold">Meerut, Uttar Pradesh</p>
                </div>
              </div>

              <div className="pt-1">
                <Link
                  href={`/${restaurant?.slug || 'yellow-chilli-meerut'}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-black text-[11px] sm:text-xs px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all shadow-md hover:shadow-lg shadow-green-500/15"
                >
                  Open Live Customer Menu <ArrowRight size={12} className="rotate-[-45deg]" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Mobile Phone Mockup */}
          <div className="lg:col-span-7 flex justify-center w-full overflow-hidden">
            {/* Outer high-fidelity phone frame container */}
            <div className="relative mx-auto select-none p-4 sm:p-0">
              {/* Left Side Buttons (Volume) - hidden on mobile/tablet to avoid overflow */}
              <div className={`absolute left-[-12px] top-[120px] w-[3px] h-[50px] rounded-l transition-colors duration-300 hidden sm:block ${isDarkMode ? "bg-slate-800" : "bg-slate-300"
                }`} />
              <div className={`absolute left-[-12px] top-[180px] w-[3px] h-[50px] rounded-l transition-colors duration-300 hidden sm:block ${isDarkMode ? "bg-slate-800" : "bg-slate-300"
                }`} />

              {/* Right Side Button (Power) - hidden on mobile/tablet to avoid overflow */}
              <div className={`absolute right-[-12px] top-[140px] w-[3px] h-[75px] rounded-r transition-colors duration-300 hidden sm:block ${isDarkMode ? "bg-slate-800" : "bg-slate-300"
                }`} />

              {/* Phone body - responsive width/height and border scale */}
              <div className={`relative w-[280px] min-[375px]:w-[320px] sm:w-[360px] h-[560px] min-[375px]:h-[640px] sm:h-[720px] rounded-[32px] sm:rounded-[50px] border-[8px] sm:border-[12px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col z-10 transition-all duration-300 ${isDarkMode ? "border-slate-800 bg-slate-950" : "border-slate-300 bg-white"
                }`}>

                {/* 1. Android Status Bar (Fixed at top - prevents overlapping Notch) */}
                <div className="bg-black text-white h-7 px-4 sm:px-6 flex items-center justify-between text-[10px] font-bold z-50 select-none relative flex-shrink-0">
                  {/* Integrated camera speaker Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-4 bg-black rounded-b-xl flex items-center justify-center">
                    <div className="w-5 sm:w-6 h-1 bg-slate-900 rounded-full mb-1" />
                  </div>

                  <span>11:06</span>
                  <div className="flex items-center gap-1.5">
                    <span>5G</span>
                    <div className="flex items-end gap-0.5 h-2 w-3">
                      <div className="w-[1.5px] h-[20%] bg-white rounded-2xs" />
                      <div className="w-[1.5px] h-[40%] bg-white rounded-2xs" />
                      <div className="w-[1.5px] h-[60%] bg-white rounded-2xs" />
                      <div className="w-[1.5px] h-[80%] bg-white rounded-2xs" />
                      <div className="w-[1.5px] h-[100%] bg-white rounded-2xs" />
                    </div>
                    <span className="text-[9px]">📶</span>
                    <div className="border border-white/70 rounded-[3px] p-[1px] flex items-center h-2.5 w-5">
                      <div className="bg-white h-full w-[85%] rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Mobile Viewport Area (Scrollable below status bar with touch-like grab scroll) */}
                <div
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeaveOrUp}
                  onMouseUp={handleMouseLeaveOrUp}
                  onMouseMove={handleMouseMove}
                  className={`flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-white pb-20 relative text-slate-900 font-sans select-none scrollbar-none ${isDragging ? "cursor-grabbing" : "cursor-grab"
                    }`}
                >

                  {/* Immersive Banner Section matching Header.js */}
                  <div className="relative h-36 sm:h-44 w-full bg-slate-800 flex-shrink-0">
                    <Image
                      src={restaurant?.banner || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070"}
                      alt="banner"
                      fill
                      priority
                      className="object-cover opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                    {/* Rating / Address overlays matching Header.js */}
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h5 className="font-extrabold text-white text-base sm:text-lg leading-tight drop-shadow-md">{restaurantName}</h5>
                      <p className="text-gray-300 text-[8px] sm:text-[9px] opacity-90 truncate leading-none mt-1">
                        {restaurant?.address || "Victoria Park, Meerut"}
                      </p>

                      <div className="flex gap-2 sm:gap-3 items-center mt-2 opacity-90 text-[8px] sm:text-[9px] font-bold">
                        <div className="flex items-center gap-1">
                          <Star size={8} fill="#f97316" className="text-green-500 sm:w-2.5 sm:h-2.5" />
                          <span>4.2</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={8} className="sm:w-2.5 sm:h-2.5" />
                          <span>20-30 mins</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <IndianRupee size={8} className="sm:w-2.5 sm:h-2.5" />
                          <span>150 per person</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Search Bar & Preference filters matching Header.js */}
                  <div className="bg-white px-2.5 sm:px-3 -mt-3 relative z-10 flex-shrink-0">
                    <div className="flex gap-1.5 sm:gap-2 items-center">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                          <SearchIcon size={12} className="text-gray-400 sm:w-3.5 sm:h-3.5" />
                        </div>
                        <input
                          type="search"
                          placeholder="Search menu..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white rounded-xl h-8 sm:h-9 pl-8 sm:pl-9 pr-2.5 sm:pr-3 text-[11px] sm:text-xs text-gray-900 font-medium placeholder-gray-400 shadow-[0_4px_12px_rgba(0,0,0,0.06)] focus:outline-none border border-gray-100"
                        />
                      </div>
                      <button
                        onClick={() => setIsFilterDrawerOpen(true)}
                        className={`flex-shrink-0 w-8 sm:w-9 h-8 sm:h-9 bg-white rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100 transition-colors ${isFilterDrawerOpen || sortBy !== "default" ? 'text-green-500' : 'text-gray-800'
                          }`}
                      >
                        <SlidersHorizontal size={12} strokeWidth={2.5} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>

                    {/* Veg / Non-Veg Toggle Pills */}
                    <div className="flex gap-1.5 sm:gap-2 mt-1.5 pb-1 border-b border-gray-50">
                      <button
                        onClick={() => {
                          setVegOnly(!vegOnly);
                          if (!vegOnly) setNonVegOnly(false);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border text-[8px] sm:text-[9px] font-bold transition-all ${vegOnly
                            ? "border-green-400 bg-green-50 text-green-600 shadow-[0_2px_8px_rgba(34,197,94,0.1)]"
                            : "border-gray-100 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 border border-green-500 rounded-[2px] flex items-center justify-center flex-shrink-0">
                          <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-green-500" />
                        </div>
                        Veg Only
                      </button>

                      <button
                        onClick={() => {
                          setNonVegOnly(!nonVegOnly);
                          if (!nonVegOnly) setVegOnly(false);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border text-[8px] sm:text-[9px] font-bold transition-all ${nonVegOnly
                            ? "border-red-400 bg-red-50 text-red-600 shadow-[0_2px_8px_rgba(239,68,68,0.1)]"
                            : "border-gray-100 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 border border-red-500 rounded-[2px] flex items-center justify-center flex-shrink-0">
                          <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-red-500" />
                        </div>
                        Non-veg Only
                      </button>
                    </div>
                  </div>

                  {/* Category Tabs Switcher (Exactly matches CategoryTabs.js) */}
                  <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 flex-shrink-0" suppressHydrationWarning>
                    <div className="flex overflow-x-auto scrollbar-none space-x-4 sm:space-x-6 px-3 sm:px-4" role="tablist">
                      {categories.map((category) => {
                        const isActive = selectedCategory === category;
                        return (
                          <button
                            key={category}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setSelectedCategory(category)}
                            className={`whitespace-nowrap py-2 sm:py-3 px-0.5 text-[11px] sm:text-xs font-extrabold tracking-tight transition-all relative focus:outline-none rounded-lg ${isActive
                                ? "text-gray-900"
                                : "text-gray-400 hover:text-gray-900"
                              }`}
                          >
                            {category}
                            {isActive && (
                              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-t-md" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Menu Items List grouped by Category matching MenuClient.js */}
                  <div className="flex-1 bg-gray-50 p-2.5 sm:p-3 space-y-4 sm:space-y-5">
                    {/* Brand Story Quote matching MenuClient.js */}
                    <div className="text-center px-1 py-0.5">
                      <p className="text-gray-500 font-medium italic text-[9px] sm:text-[10px] leading-relaxed">
                        &quot;Our Chefs traveled the globe to bring the best flavours for you. Make sure you taste a bit from every course.&quot;
                      </p>
                    </div>

                    {groupedCategories.map(group => (
                      <div key={group.category} className="space-y-2">
                        <div className="flex items-center gap-1.5 mt-3 sm:mt-4">
                          {getCategoryIcon(group.category)}
                          <h4 className="font-black text-gray-900 text-[10px] sm:text-xs tracking-tight uppercase">
                            {group.category}
                          </h4>
                        </div>

                        <div className="space-y-2">
                          {group.items.map(item => {
                            const quantity = cart[item.id] || 0;
                            const isSpicy = item.description?.toLowerCase().includes('spicy') || item.description?.toLowerCase().includes('chili');

                            return (
                              <div
                                key={item.id}
                                className="bg-white rounded-xl sm:rounded-[20px] border border-gray-100 flex flex-row p-0 gap-0 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                              >
                                {/* Image Section (Left) */}
                                <div className="relative w-[90px] min-[375px]:w-[100px] sm:w-[110px] min-h-[100px] sm:min-h-[120px] flex-shrink-0">
                                  <Image
                                    src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"}
                                    alt={item.name}
                                    fill
                                    sizes="(max-width: 640px) 100px, 110px"
                                    className="object-cover"
                                  />

                                  {/* Popular Tag Overlay */}
                                  {item.isPopular && (
                                    <div className="absolute top-1.5 left-1.5 bg-white/95 text-green-500 px-1 py-0.5 rounded text-[8px] sm:text-[0.6rem] font-black shadow-sm flex items-center gap-0.5 z-10">
                                      <Star size={8} fill="currentColor" /> POPULAR
                                    </div>
                                  )}
                                </div>

                                {/* Content Section (Right) */}
                                <div className="flex-1 flex flex-col justify-between p-2.5 sm:p-3">
                                  <div>
                                    <div className="flex items-start justify-between mb-0.5 sm:mb-1">
                                      <div className="flex items-center gap-1 sm:gap-1.5">
                                        <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 leading-tight">
                                          {item.name}
                                        </h3>
                                        {isSpicy && <Flame size={10} color="#ef4444" fill="#ef4444" className="flex-shrink-0 sm:w-3 sm:h-3" />}
                                      </div>

                                      {/* Veg/Non-veg Indicator */}
                                      <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 border rounded-[3px] flex items-center justify-center flex-shrink-0 mt-0.5 ml-1.5 sm:ml-2 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                                      </div>
                                    </div>

                                    <p className="text-gray-500 text-[9px] sm:text-[10px] leading-snug line-clamp-2 mb-1.5 sm:mb-2">
                                      {item.description}
                                    </p>

                                    <div className="flex items-center gap-2 sm:gap-3 opacity-70 text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <Clock size={8} className="sm:w-2.5 sm:h-2.5" />
                                        <span className="text-[8px] sm:text-[9px] font-bold">15-20m</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Info size={8} className="sm:w-2.5 sm:h-2.5" />
                                        <span className="text-[8px] sm:text-[9px] font-bold">Details</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between mt-auto pt-1.5 sm:pt-2">
                                    <span className="font-black text-gray-900 text-xs sm:text-sm">
                                      ₹{item.price}
                                    </span>

                                    <div>
                                      {quantity > 0 ? (
                                        <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 border border-gray-100 rounded-lg sm:rounded-xl p-0.5">
                                          <button
                                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-white text-green-500 rounded-md sm:rounded-lg shadow-sm hover:bg-green-55 focus-visible:outline-none transition-colors"
                                            onClick={() => updateCart(item.id, -1)}
                                          >
                                            <Minus size={12} strokeWidth={4} />
                                          </button>
                                          <span className="font-black text-gray-900 text-[10px] sm:text-xs min-w-[14px] sm:min-w-[16px] text-center">
                                            {quantity}
                                          </span>
                                          <button
                                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-green-500 text-white rounded-md sm:rounded-lg shadow-sm hover:bg-green-600 focus-visible:outline-none transition-colors"
                                            onClick={() => updateCart(item.id, 1)}
                                          >
                                            <Plus size={12} strokeWidth={4} />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => updateCart(item.id, 1)}
                                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-green-500 text-white rounded-lg sm:rounded-[10px] hover:bg-green-600 focus-visible:outline-none transition-colors"
                                        >
                                          <Plus size={18} strokeWidth={3} className="sm:w-[22px] sm:h-[22px]" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>


                </div>

                {/* Floating Cart Button (Mock Mobile - Sticky Overlay at the bottom of the Android frame) */}
                {totalCartCount > 0 && (
                  <div className="absolute bottom-4 left-3 right-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.12)] flex items-center justify-between z-50 animate-fade-in-up">
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
                      onClick={() => alert("This is a demo.")}
                      className="bg-green-500 hover:bg-green-600 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1 active:scale-95 transition-transform"
                    >
                      Place Order <ArrowRight size={12} />
                    </button>
                  </div>
                )}
                {/* Mock Filter & Sort Drawer Overlay inside Phone Body */}
                {isFilterDrawerOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      onClick={() => setIsFilterDrawerOpen(false)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
                    />
                    {/* Drawer */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-50 rounded-t-[20px] z-50 p-5 shadow-2xl transition-all duration-300 max-h-[80%] overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <h6 className="text-sm font-black text-gray-900">Filters & sorting</h6>
                        <button
                          onClick={() => setIsFilterDrawerOpen(false)}
                          className="p-1 bg-white rounded-full shadow text-gray-500 hover:text-gray-900 focus:outline-none"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Preference */}
                        <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-gray-100/50">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Preference</span>
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => {
                                setVegOnly(!vegOnly);
                                if (!vegOnly) setNonVegOnly(false);
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[9px] font-bold transition-all ${vegOnly
                                  ? "border-green-400 bg-green-50 text-green-600 shadow-[0_2px_8px_rgba(34,197,94,0.1)]"
                                  : "border-gray-100 bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                              <div className="w-2.5 h-2.5 border border-green-500 rounded-[2px] flex items-center justify-center flex-shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              </div>
                              Veg Only
                            </button>

                            <button
                              onClick={() => {
                                setNonVegOnly(!nonVegOnly);
                                if (!nonVegOnly) setVegOnly(false);
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[9px] font-bold transition-all ${nonVegOnly
                                  ? "border-red-400 bg-red-50 text-red-600 shadow-[0_2px_8px_rgba(239,68,68,0.1)]"
                                  : "border-gray-100 bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                              <div className="w-2.5 h-2.5 border border-red-500 rounded-[2px] flex items-center justify-center flex-shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              </div>
                              Non-veg Only
                            </button>
                          </div>
                        </div>

                        {/* Sorting */}
                        <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-gray-100/50">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Sorting by</span>
                          <div className="flex flex-col gap-1.5">
                            {[
                              { id: 'default', label: 'Default' },
                              { id: 'popular', label: 'Bestseller' },
                              { id: 'price_low', label: 'Price: Low to High' },
                              { id: 'price_high', label: 'Price: High to Low' }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => setSortBy(opt.id)}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold text-left border transition-all ${sortBy === opt.id
                                    ? "border-green-400 bg-green-50 text-green-600"
                                    : "border-gray-50 bg-white text-gray-700 hover:bg-gray-50"
                                  }`}
                              >
                                <span>{opt.label}</span>
                                {sortBy === opt.id && <Check size={12} className="text-green-500" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsFilterDrawerOpen(false)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-2.5 rounded-xl text-xs mt-4 transition-colors shadow-sm"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section id="features" className={`relative z-10 max-w-7xl mx-auto px-4 min-[576px]:px-6 md:px-8 lg:px-6 py-12 sm:py-16 md:py-20 lg:py-24 border-t rounded-t-[24px] sm:rounded-t-[36px] lg:rounded-t-[50px] transition-all duration-300 ${isDarkMode ? "border-white/5 bg-slate-900/20" : "border-slate-200/80 bg-slate-100/50"
        }`}>
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 lg:mb-20 space-y-3 sm:space-y-4">
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Features Built to Boost Margins.</h2>
          <p className={`text-sm sm:text-base lg:text-lg transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Everything you need to modernize tableside dining, drive average order value, and reduce operational workload.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 group ${isDarkMode
              ? "bg-slate-900/40 border-white/5 hover:border-green-500/30 text-white"
              : "bg-white border-slate-200/80 hover:border-green-500/30 text-slate-800 shadow-sm"
            }`}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
              <QrCode size={20} className="sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mt-4">Quick QR Table Mapping</h3>
            <p className={`text-xs sm:text-sm leading-relaxed mt-2 transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Generate uniquely routed QR codes for each table. When scanned, orders automatically flag the correct table number on the kitchen dashboard.</p>
          </div>

          <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 group ${isDarkMode
              ? "bg-slate-900/40 border-white/5 hover:border-green-500/30 text-white"
              : "bg-white border-slate-200/80 hover:border-green-500/30 text-slate-800 shadow-sm"
            }`}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
              <UploadCloud size={20} className="sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mt-4">Dynamic Info Uploads</h3>
            <p className={`text-xs sm:text-sm leading-relaxed mt-2 transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Update menus, toggle item availabilities, upload custom banner artwork, and tweak descriptions in real-time. Paid clients get full media controls.</p>
          </div>

          <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 group ${isDarkMode
              ? "bg-slate-900/40 border-white/5 hover:border-green-500/30 text-white"
              : "bg-white border-slate-200/80 hover:border-green-500/30 text-slate-800 shadow-sm"
            }`}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
              <TrendingUp size={20} className="sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mt-4">Analytics & Excel Export</h3>
            <p className={`text-xs sm:text-sm leading-relaxed mt-2 transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Track popular dishes, peak order hours, daily revenue trends, and download formatted order logs for external accounting software with one-click exports.</p>
          </div>
        </div>
      </section>

      {/* About the Founder Section */}
      <section id="about" className={`relative z-10 max-w-7xl mx-auto px-4 min-[576px]:px-6 md:px-8 lg:px-6 py-16 sm:py-20 lg:py-24 border-t transition-colors duration-300 ${isDarkMode ? "border-white/5" : "border-slate-200/80 bg-white"
        }`}>
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Column: Image Card */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative group w-full max-w-[320px]">
              {/* Glowing decorative background elements */}
              <div className="absolute inset-0 bg-gradient-to-tr from-green-500/25 to-emerald-500/25 rounded-3xl filter blur-xl group-hover:scale-105 transition-transform duration-500 opacity-70" />

              {/* Main image container */}
              <div className={`relative rounded-3xl p-3 border transition-all duration-300 w-full ${isDarkMode ? "bg-slate-900/80 border-white/10" : "bg-white border-slate-200 shadow-sm"
                }`}>
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-inner">
                  <Image
                    src="/kunal.jpg"
                    alt="Kunal Rawat - Founder of MenuGO"
                    fill
                    className="object-cover object-top filter contrast-[1.02] brightness-[1.02] transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4 text-center">
                  <h3 className={`text-lg font-black transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    Kunal Rawat
                  </h3>
                  <p className="text-green-500 text-xs font-bold uppercase tracking-wider mt-0.5">
                    Founder
                  </p>

                  <div className="flex justify-center gap-2 mt-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isDarkMode ? "bg-white/5 text-slate-300" : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                      MCA Graduate
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isDarkMode ? "bg-white/5 text-slate-300" : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                      Problem Solver
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Bio / Pitch */}
          <div className="md:col-span-7 space-y-6 text-left">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] sm:text-xs font-black tracking-wider uppercase transition-colors duration-300 ${isDarkMode ? "bg-white/5 border-white/10 text-green-400" : "bg-green-50/50 border-green-500/20 text-green-600"
              }`}>
              <Info size={12} /> From the Founder
            </div>

            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"
              }`}>
              Solving Real-World Problems for <span className="bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">Modern Restaurants.</span>
            </h2>

            <div className={`space-y-4 text-sm sm:text-base leading-relaxed font-medium transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"
              }`}>
              <p>
                As an MCA graduate with a deep passion for technology and solving real-world challenges, I saw a major friction point in how traditional restaurants operate. Paper menus are static, expensive to update, and create unnecessary bottlenecks for both the serving staff and guests.
              </p>
              <p>
                I built <strong className={isDarkMode ? "text-white" : "text-slate-900"}>MenuGO</strong> to completely eliminate this friction. By converting tables into interactive digital ordering hubs, we help owners reduce human errors, speed up service, and lift sales—while guests enjoy a modern, seamless dining experience with no app downloads needed.
              </p>
              <p>
                Our vision is to partner with more and more restaurants, providing them with affordable, developer-crafted tools that boost their margins and make tableside ordering completely stress-free.
              </p>
            </div>

            <div className={`pt-4 border-t border-dashed flex items-center gap-4 ${isDarkMode ? "border-slate-800" : "border-slate-200"
              }`}>
              <div className="flex flex-col">
                <span className={`font-black text-base leading-none ${isDarkMode ? "text-white" : "text-slate-900"}`}>Kunal Rawat</span>
                <span className="text-slate-500 text-xs mt-1 font-semibold">Founder, MenuGO</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`relative z-10 max-w-7xl mx-auto px-4 min-[576px]:px-6 md:px-8 lg:px-6 py-12 sm:py-16 md:py-20 lg:py-24 border-t transition-colors duration-300 ${isDarkMode ? "border-white/5" : "border-slate-200/80 bg-white"
        }`}>
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 lg:mb-16 space-y-3 sm:space-y-4">
          <span className="text-green-500 font-black text-xs tracking-wider uppercase bg-green-500/10 px-3 py-1 rounded-full">Pricing Plans</span>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Flexible Plans for Growing Brands.</h2>
          <p className={`text-sm sm:text-base lg:text-lg transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Start free, validate your menu, and upgrade to paid plans to lift item caps and unlock premium dashboard controls.</p>
        </div>

        <div className="grid grid-cols-1 min-[576px]:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${isDarkMode ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200/80 shadow-sm"
            }`}>
            <div>
              <h3 className={`text-base sm:text-lg font-black transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Free Plan</h3>
              <p className="text-slate-500 text-xs mt-1">Perfect to test core layout</p>

              <div className="my-6">
                <span className={`text-4xl sm:text-5xl font-black transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>₹0</span>
                <span className="text-slate-500 text-xs sm:text-sm ml-2">/ forever</span>
              </div>

              <ul className={`space-y-3 sm:space-y-3.5 text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-500 flex-shrink-0" />
                  <span>Maximum of <strong>10 menu items</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-500 flex-shrink-0" />
                  <span>Interactive digital menu</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-500 flex-shrink-0" />
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

            <div className="pt-6 sm:pt-8">
              <Link
                href="/register"
                className={`block text-center w-full border font-bold py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm transition-all duration-300 ${isDarkMode
                    ? "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
                  }`}
              >
                Sign Up Free
              </Link>
            </div>
          </div>

          {/* Monthly Growth Plan - Double Line Border / Separators */}
          <div className={`p-6 sm:p-8 rounded-3xl border-4 border-double border-green-500 flex flex-col justify-between relative shadow-xl shadow-green-500/5 transition-all duration-300 ${isDarkMode ? "bg-slate-900/80" : "bg-white"
            }`}>
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-green-500 text-white text-[9px] sm:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>

            <div>
              <h3 className={`text-base sm:text-lg font-black transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"} flex items-center gap-2`}>
                Monthly Growth <Sparkles size={14} className="text-green-400 animate-spin-slow" />
              </h3>

              <div className="my-6">
                <span className={`text-4xl sm:text-5xl font-black transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>₹199</span>
                <span className={`${isDarkMode ? "text-slate-400" : "text-slate-50"} text-xs sm:text-sm ml-2`}>/ month</span>

                {/* Double green separator lines */}
                <div className="flex flex-col gap-0.5 mt-3">
                  <div className="h-[2px] bg-green-500 w-full rounded-full" />
                  <div className="h-[2px] bg-green-500 w-full rounded-full" />
                </div>
              </div>

              <ul className={`space-y-3 sm:space-y-3.5 text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-500 flex-shrink-0" />
                  <span><strong>Unlimited</strong> menu items (&gt; 10)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-500 flex-shrink-0" />
                  <span>Upload & update restaurant details</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-500 flex-shrink-0" />
                  <span>Upload custom banner images</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-500 flex-shrink-0" />
                  <span>Toggle "Popular" and "Veg" tags</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-green-500 flex-shrink-0" />
                  <span>Standard analytics dashboard</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 sm:pt-8">
              <Link
                href="/register"
                className="block text-center w-full bg-green-500 hover:bg-green-600 active:scale-98 text-white font-black py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-green-500/20"
              >
                Go Growth (Monthly)
              </Link>
            </div>
          </div>

          {/* Annual Premium Plan - Triple Line Border / Separators */}
          <div className="relative group rounded-3xl p-[3px] bg-gradient-to-b from-green-500 via-emerald-400 to-green-600">
            <div className={`p-6 sm:p-8 rounded-[22px] flex flex-col justify-between relative overflow-hidden transition-all duration-300 h-full ${isDarkMode ? "bg-slate-950" : "bg-white"
              }`}>
              <div>
                <h3 className={`text-base sm:text-lg font-black transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Annual Premium</h3>
                <p className="text-slate-500 text-xs mt-1">Best Value Guarantee</p>

                <div className="my-6">
                  <span className={`text-4xl sm:text-5xl font-black transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>₹1999</span>
                  <span className="text-slate-500 text-xs sm:text-sm ml-2">/ year</span>

                  {/* Triple green separator lines */}
                  <div className="flex flex-col gap-0.5 mt-3">
                    <div className="h-[1.5px] bg-green-500 w-full rounded-full" />
                    <div className="h-[1.5px] bg-green-500 w-full rounded-full" />
                    <div className="h-[1.5px] bg-green-500 w-full rounded-full" />
                  </div>
                </div>

                <ul className={`space-y-3 sm:space-y-3.5 text-xs sm:text-sm transition-colors duration-300 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500 flex-shrink-0" />
                    <span><strong>Unlimited</strong> menu items</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500 flex-shrink-0" />
                    <span>Upload & update restaurant details</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500 flex-shrink-0" />
                    <span><strong>Full Analytics & CSV Exports</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500 flex-shrink-0" />
                    <span>Custom theme & design matching</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500 flex-shrink-0" />
                    <span>Priority 24/7 client support</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 sm:pt-8">
                <Link
                  href="/register"
                  className={`block text-center w-full border font-bold py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm transition-all duration-300 ${isDarkMode
                      ? "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                      : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
                    }`}
                >
                  Go Premium (Annual)
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 w-full max-w-7xl mx-auto px-4 min-[576px]:px-6 py-8 sm:py-12 border-t text-center text-slate-500 text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300 ${isDarkMode ? "border-white/5" : "border-slate-200/80"
        }`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-lg flex items-center justify-center text-white shadow-md shadow-green-500/10">
            <MenuGoIcon size={16} />
          </div>
          <div className="flex flex-col text-left">
            <span className={`font-extrabold text-sm leading-none transition-colors duration-300 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>Menu<span className="text-green-500">Go</span></span>
            <span className="text-[7.5px] font-black text-green-500 tracking-[0.18em] uppercase leading-none mt-0.5 select-none">green</span>
          </div>
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
