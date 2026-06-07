'use client';

/**
 * HeaderSkeleton — pixel-perfect ghost of components/Header.js
 *
 * Matches:
 *  - Banner: h-[260px] mobile / h-[360px] desktop, gradient overlay
 *  - Title block: position bottom-[20px] md:bottom-[40px], px-6 md:px-8
 *  - Metadata row: star · clock · rupee
 *  - Floating search row: -mt-6, h-[54px] input + 54×54 filter button
 */
export default function HeaderSkeleton() {
  return (
    <div className="relative w-full mb-4">
      {/* ── Banner ── */}
      <div className="relative h-[260px] md:h-[360px] w-full bg-slate-200 overflow-hidden">
        {/* Shimmer sweep */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Gradient overlay identical to real Header */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        {/* Text block — same positioning as Header.js L86-110 */}
        <div className="absolute bottom-[20px] md:bottom-[40px] left-0 right-0 px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Restaurant name — h1 text-[2rem] md:text-[3.75rem] */}
            <div className="h-9 md:h-14 bg-white/25 rounded-xl w-3/5 md:w-2/5 mb-2 md:mb-3" />
            {/* Address — text-[0.95rem] md:text-[1.2rem] */}
            <div className="h-4 md:h-5 bg-white/15 rounded-lg w-2/5 md:w-1/4 mb-4" />

            {/* Metadata pills — flex gap-6 items-center */}
            <div className="flex gap-6 items-center">
              {/* ★ 4.2 */}
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-white/20 rounded-full" />
                <div className="h-3.5 bg-white/15 rounded w-7" />
              </div>
              {/* 🕐 20-30 mins */}
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-white/20 rounded-full" />
                <div className="h-3.5 bg-white/15 rounded w-16" />
              </div>
              {/* ₹ 150 per person */}
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-white/20 rounded-full" />
                <div className="h-3.5 bg-white/15 rounded w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Search & Filter Row ── */}
      {/* Same layout: max-w-4xl mx-auto -mt-6 relative z-10 px-4 md:px-0 */}
      <div className="max-w-4xl mx-auto -mt-6 relative z-[5] px-4 md:px-0">
        <div className="flex gap-3 items-center">
          {/* Search input — h-[54px] rounded-xl */}
          <div className="relative flex-1 h-[54px] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
            {/* Search icon placeholder */}
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
              <div className="w-5 h-5 bg-slate-200 rounded-full" />
            </div>
            {/* Placeholder text lines */}
            <div className="absolute inset-y-0 left-11 flex items-center">
              <div className="h-4 bg-slate-100 rounded w-36 md:w-44" />
            </div>
          </div>
          {/* Filter button — w-[54px] h-[54px] */}
          <div className="flex-shrink-0 w-[54px] h-[54px] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-center">
            <div className="w-5 h-5 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
