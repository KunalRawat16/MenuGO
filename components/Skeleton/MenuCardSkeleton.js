'use client';

/**
 * MenuCardSkeleton — pixel-perfect ghost of components/MenuCard.js
 *
 * Matches:
 *  - Outer: rounded-[20px] border-gray-100 mb-2.5 flex-row overflow-hidden
 *  - Image: w-[110px] md:w-[150px] min-h-[120px]
 *  - Content: p-3 md:p-4, flex-col justify-between
 *  - Title row: h3 + veg indicator (w-4 h-4)
 *  - Description: 2 lines
 *  - Meta: clock + info icons
 *  - Price + Add button: w-9 h-9 rounded-[10px]
 */
export default function MenuCardSkeleton() {
  return (
    <div className="bg-white rounded-[20px] border border-gray-100 mb-2.5 flex flex-row p-0 gap-0 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      {/* ── Left Image ── w-[110px] md:w-[150px] min-h-[120px] */}
      <div className="relative w-[110px] md:w-[150px] min-h-[120px] bg-slate-200 flex-shrink-0 overflow-hidden">
        {/* Shimmer */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        {/* Popular tag placeholder */}
        <div className="absolute top-2 left-2 h-4 w-16 bg-white/80 rounded-md" />
      </div>

      {/* ── Right Content ── p-3 md:p-4, flex-col justify-between */}
      <div className="flex-1 flex flex-col justify-between p-3 md:p-4">
        <div>
          {/* Title row: name + veg indicator */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <div className="h-5 md:h-6 bg-slate-200 rounded-md w-28 md:w-36" />
            </div>
            {/* Veg/Non-veg box — w-4 h-4 rounded-[3px] */}
            <div className="w-4 h-4 border border-slate-200 rounded-[3px] flex items-center justify-center flex-shrink-0 mt-0.5 ml-2">
              <div className="w-2 h-2 rounded-full bg-slate-200" />
            </div>
          </div>

          {/* Description — 2 lines, text-xs md:text-sm */}
          <div className="h-3 md:h-3.5 bg-slate-100 rounded w-full mb-1.5" />
          <div className="h-3 md:h-3.5 bg-slate-100 rounded w-4/5 mb-2" />

          {/* Meta row: clock + info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-slate-100 rounded-full" />
              <div className="h-2.5 bg-slate-100 rounded w-10" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-slate-100 rounded-full" />
              <div className="h-2.5 bg-slate-100 rounded w-10" />
            </div>
          </div>
        </div>

        {/* Price + Add button */}
        <div className="flex items-center justify-between mt-auto pt-2">
          {/* Price — font-black text-base md:text-lg */}
          <div className="h-5 md:h-6 bg-slate-200 rounded-md w-12 md:w-14" />
          {/* Add button — w-9 h-9 rounded-[10px] */}
          <div className="w-9 h-9 bg-slate-200 rounded-[10px]" />
        </div>
      </div>
    </div>
  );
}
