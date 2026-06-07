'use client';

import HeaderSkeleton from '@/components/Skeleton/HeaderSkeleton';
import MenuCardSkeleton from '@/components/Skeleton/MenuCardSkeleton';

/**
 * Customer Menu Page Loading Skeleton
 * Mirrors: app/[slug]/MenuClient.js
 *
 * Layout hierarchy:
 *  1. Header (banner + search)
 *  2. Sticky CategoryTabs
 *  3. Brand story quote
 *  4. Category sections → MenuCards
 */
export default function Loading() {
  return (
    <div className="bg-white min-h-screen pb-40 font-sans">
      {/* ═══ 1. Header Skeleton ═══ */}
      <HeaderSkeleton />

      {/* ═══ 2. CategoryTabs Skeleton ═══ */}
      {/* Real: bg-white border-b border-gray-100, max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 */}
      {/* Tabs: flex overflow-x-auto space-x-6 md:space-x-8, each tab py-4 px-1 */}
      <div className="bg-white border-b border-gray-100 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-6 md:space-x-8 py-4">
            {/* First tab active — has green underline */}
            <div className="relative flex-shrink-0">
              <div className="h-4 md:h-5 bg-slate-300 rounded w-8" />
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 rounded-t-md -mb-4" />
            </div>
            {/* Remaining inactive tabs */}
            {[14, 10, 16, 18].map((w, i) => (
              <div key={i} className="flex-shrink-0">
                <div className={`h-4 md:h-5 bg-slate-200 rounded`} style={{ width: `${w * 4}px` }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ 3. Brand Story Quote ═══ */}
      {/* Real: max-w-4xl mx-auto px-4 mt-8 → mb-10 text-center px-4 */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="mb-10 text-center px-4">
          <div className="max-w-2xl mx-auto space-y-2">
            <div className="h-4 bg-slate-100 rounded w-full mx-auto" />
            <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto" />
          </div>
        </div>

        {/* ═══ 4. Category Sections + MenuCards ═══ */}
        <div className="flex flex-col">
          {/* Category 1 */}
          <div className="scroll-mt-[100px] mb-8">
            {/* Category header: icon + title */}
            <div className="flex items-center gap-2.5 mb-4 mt-6">
              <div className="w-5 h-5 bg-slate-200 rounded" />
              <div className="h-5 md:h-7 bg-slate-200 rounded w-24 md:w-32" />
            </div>
            {/* Menu items */}
            <div className="flex flex-col">
              <MenuCardSkeleton />
              <MenuCardSkeleton />
              <MenuCardSkeleton />
            </div>
          </div>

          {/* Category 2 */}
          <div className="scroll-mt-[100px] mb-8">
            <div className="flex items-center gap-2.5 mb-4 mt-6">
              <div className="w-5 h-5 bg-slate-200 rounded" />
              <div className="h-5 md:h-7 bg-slate-200 rounded w-20 md:w-28" />
            </div>
            <div className="flex flex-col">
              <MenuCardSkeleton />
              <MenuCardSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
