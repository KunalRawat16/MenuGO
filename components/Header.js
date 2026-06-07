'use client';

import {
  Star,
  Clock,
  IndianRupee,
  Search as SearchIcon,
  X,
  Trophy,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  SlidersHorizontal
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

const FilterTag = ({ label, icon: Icon, active, onClick, isVegTag = false, isNonVegTag = false }) => {
  let activeBorderColor = "border-green-500";
  let activeBgColor = "bg-green-50";
  let activeTextColor = "text-green-500";
  
  if (isVegTag) {
    activeBorderColor = "border-green-400";
    activeBgColor = "bg-green-50";
    activeTextColor = "text-green-600";
  } else if (isNonVegTag) {
    activeBorderColor = "border-red-400";
    activeBgColor = "bg-red-50";
    activeTextColor = "text-red-600";
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[14px] border cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 ${
        active 
          ? `${activeBorderColor} ${activeBgColor} shadow-[0_4px_12px_rgba(249,115,22,0.15)]` 
          : 'border-gray-100 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:bg-gray-50'
      }`}
    >
      {Icon && <Icon size={16} className={active ? activeTextColor : "text-gray-500"} />}
      <span className={`text-[0.85rem] font-bold ${active ? activeTextColor : "text-gray-800"}`}>
        {label}
      </span>
      {active && <X size={14} className={activeTextColor} />}
    </button>
  );
};

export default function Header({
  restaurant,
  searchQuery,
  setSearchQuery,
  vegOnly,
  setVegOnly,
  nonVegOnly,
  setNonVegOnly,
  sortBy,
  setSortBy
}) {
  const [bannerSrc, setBannerSrc] = useState(restaurant.banner || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  return (
    <div className="relative w-full mb-4" suppressHydrationWarning>
      {/* Immersive Banner Section */}
      <div className="relative h-[260px] md:h-[360px] w-full overflow-hidden">
        <Image
          src={bannerSrc}
          alt="Restaurant Banner"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          onError={() => setBannerSrc("https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        <div className="absolute bottom-[20px] md:bottom-[40px] left-0 right-0 px-6 md:px-8 text-white" suppressHydrationWarning>
          <div className="max-w-4xl mx-auto">
            <h1 className="font-medium text-[2rem] md:text-[3.75rem] tracking-tight leading-tight mb-1 md:mb-2 drop-shadow-md">
              {restaurant.name}
            </h1>
            <p className="font-light opacity-85 text-[0.95rem] md:text-[1.2rem] tracking-wide mb-4">
              {restaurant.address}
            </p>

            <div className="flex gap-6 items-center opacity-90">
              <div className="flex items-center gap-1.5">
                <Star size={16} fill="#f97316" className="text-green-500" />
                <span className="font-bold text-sm md:text-base">{restaurant.rating || "4.2"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={16} />
                <span className="font-bold text-sm md:text-base">{restaurant.avgTime || "20-30 mins"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IndianRupee size={16} />
                <span className="font-bold text-sm md:text-base">150 per person</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Search & Filter Row */}
      <div className="max-w-4xl mx-auto -mt-6 relative z-[5] px-4 md:px-0">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon size={20} className="text-gray-400" />
            </div>
            <input
              type="search"
              aria-label="Search dishes"
              placeholder="Start typing to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-xl h-[54px] pl-11 pr-4 text-gray-900 font-medium placeholder-gray-400 shadow-[0_8px_30px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-green-500 transition-all border border-transparent"
            />
          </div>
          <button
            onClick={toggleDrawer(true)}
            aria-label="Open filters and sorting"
            aria-expanded={drawerOpen}
            className={`flex-shrink-0 w-[54px] h-[54px] bg-white rounded-xl flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 ${drawerOpen ? 'text-green-500' : 'text-gray-800'} hover:bg-gray-50`}
          >
            <SlidersHorizontal size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Filter Drawer — rendered OUTSIDE the z-[5] search row so it's not trapped in that stacking context */}
      {mounted && (
        <>
          <div 
            aria-hidden="true"
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={toggleDrawer(false)}
          />
          <div 
            role="dialog"
            aria-modal="true"
            aria-label="Filters and sorting drawer"
            className={`fixed bottom-0 left-0 right-0 bg-gray-50 rounded-t-[28px] z-[1010] transform transition-transform duration-300 ease-out max-h-[90vh] overflow-y-auto ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}`}
          >
            <div className="p-8 pb-10 max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-gray-900">Filters and sorting</h2>
                <button 
                  onClick={toggleDrawer(false)} 
                  aria-label="Close filters"
                  className="p-2 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-gray-600 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Preference Section */}
                <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  <h3 className="text-sm font-extrabold mb-4 text-gray-800 uppercase tracking-wider">Preference</h3>
                  <div className="flex gap-3 flex-wrap">
                    <FilterTag
                      label="Veg Only"
                      active={vegOnly}
                      isVegTag={true}
                      onClick={() => { setVegOnly(!vegOnly); if (!vegOnly) setNonVegOnly(false); }}
                      icon={() => (
                        <div className="w-3.5 h-3.5 border border-green-500 rounded-[2px] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        </div>
                      )}
                    />
                    <FilterTag
                      label="Non-veg Only"
                      active={nonVegOnly}
                      isNonVegTag={true}
                      onClick={() => { setNonVegOnly(!nonVegOnly); if (!nonVegOnly) setVegOnly(false); }}
                      icon={() => (
                        <div className="w-3.5 h-3.5 border border-red-500 rounded-[2px] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        </div>
                      )}
                    />
                  </div>
                </div>

                {/* Sorting Options */}
                <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  <h3 className="text-sm font-extrabold mb-4 text-gray-800 uppercase tracking-wider">Sorting by</h3>
                  <div className="flex gap-3 flex-wrap">
                    <FilterTag
                      label="Bestseller"
                      icon={Trophy}
                      active={sortBy === "popular"}
                      onClick={() => setSortBy(sortBy === "popular" ? "default" : "popular")}
                    />
                    <FilterTag
                      label="Price: Low to High"
                      icon={ArrowUpNarrowWide}
                      active={sortBy === "price_low"}
                      onClick={() => setSortBy(sortBy === "price_low" ? "default" : "price_low")}
                    />
                    <FilterTag
                      label="Price: High to Low"
                      icon={ArrowDownWideNarrow}
                      active={sortBy === "price_high"}
                      onClick={() => setSortBy(sortBy === "price_high" ? "default" : "price_high")}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={toggleDrawer(false)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-[16px] text-lg transition-colors shadow-[0_8px_20px_-4px_rgba(249,115,22,0.4)]"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

