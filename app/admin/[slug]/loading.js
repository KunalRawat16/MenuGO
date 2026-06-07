'use client';

/**
 * Restaurant Admin Dashboard Loading Skeleton
 * Mirrors: app/admin/[slug]/AdminClient.js
 *
 * Layout hierarchy:
 *  1. Top Nav bar (sticky, h-16, white, border-b)
 *  2. Subscription Banner (indigo gradient card)
 *  3. Dashboard header + action buttons
 *  4. Tab bar (5 tabs with icons)
 *  5. Content area: list of menu items (default "orders" tab view)
 */
export default function RestaurantAdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      {/* ═══ 1. Top Nav ═══ */}
      {/* Real: bg-white border-b border-gray-200 sticky top-0 z-40 */}
      {/* Inner: max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Restaurant name — font-bold text-xl */}
          <div className="h-6 w-32 sm:w-40 bg-slate-200 rounded-md" />
          {/* Buttons: Preview Menu + Logout */}
          <div className="flex items-center gap-3">
            {/* Preview Menu — px-4 py-2 bg-gray-100 rounded-xl, icon hidden on mobile */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
              <div className="w-4 h-4 bg-slate-200 rounded" />
              <div className="hidden sm:block h-3.5 bg-slate-200 rounded w-20" />
            </div>
            {/* Logout — text only on desktop, icon on mobile */}
            <div className="h-9 w-16 sm:w-20 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ═══ 2. Subscription Banner ═══ */}
        {/* Real: p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100 */}
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div className="space-y-2 flex-1">
            {/* Plan badge — px-2 py-0.5 bg-indigo-100 rounded text-xs */}
            <div className="h-5 w-20 bg-indigo-200/60 rounded" />
            {/* Subscription text */}
            <div className="h-4 bg-indigo-100/50 rounded w-full sm:w-72" />
          </div>
          {/* Upgrade CTA */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="h-2.5 bg-slate-200 rounded w-20" />
            <div className="h-8 bg-white border border-indigo-100 rounded-lg w-40 shadow-sm" />
            <div className="h-2.5 bg-slate-100 rounded w-24" />
          </div>
        </div>

        {/* ═══ 3. Dashboard Header + Actions ═══ */}
        {/* Real: flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="space-y-2">
            {/* "Dashboard" — text-3xl font-extrabold */}
            <div className="h-9 bg-slate-300 rounded-lg w-44" />
            {/* Subtitle */}
            <div className="h-4 bg-slate-200 rounded w-64" />
          </div>
          {/* Action buttons: Download QR + Add Item */}
          <div className="flex gap-3 w-full md:w-auto">
            {/* Download QR — bg-white border rounded-xl */}
            <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="w-4.5 h-4.5 bg-slate-200 rounded" />
              <div className="h-3.5 bg-slate-200 rounded w-20" />
            </div>
            {/* Add Item — bg-green-500 rounded-xl */}
            <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-green-200 rounded-xl">
              <div className="w-4.5 h-4.5 bg-green-300 rounded" />
              <div className="h-3.5 bg-green-300 rounded w-16" />
            </div>
          </div>
        </div>

        {/* ═══ 4. Tabs Bar ═══ */}
        {/* Real: flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto */}
        {/* Each tab: px-5 py-3 border-b-2, icon + text */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto hide-scrollbar">
          {/* Tab 1 — active (green underline) */}
          <div className="flex items-center gap-2 px-5 py-3 border-b-2 border-green-500">
            <div className="w-4.5 h-4.5 bg-green-200 rounded" />
            <div className="h-3.5 bg-green-200 rounded w-16 sm:w-20" />
          </div>
          {/* Tab 2-5 — inactive */}
          {[18, 22, 24, 14].map((w, i) => (
            <div key={i} className="flex items-center gap-2 px-5 py-3 border-b-2 border-transparent">
              <div className="w-4.5 h-4.5 bg-slate-200 rounded" />
              <div className="h-3.5 bg-slate-200 rounded" style={{ width: `${w * 4}px` }} />
            </div>
          ))}
        </div>

        {/* ═══ 5. Content Area — Orders/Menu list ═══ */}
        {/* Real: bg-white rounded-2xl shadow-sm border-gray-200 divide-y */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
          {/* Desktop header row (hidden on mobile) */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50/50 border-b border-gray-200">
            <div className="col-span-5 h-3 bg-slate-200 rounded w-10" />
            <div className="col-span-2 h-3 bg-slate-200 rounded w-12" />
            <div className="col-span-2 h-3 bg-slate-200 rounded w-8" />
            <div className="col-span-1 h-3 bg-slate-200 rounded w-10" />
            <div className="col-span-2 h-3 bg-slate-200 rounded w-14" />
          </div>

          {/* Item rows */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              {/* Thumbnail — w-12 h-12 rounded-xl */}
              <div className="w-12 h-12 bg-slate-200 rounded-xl flex-shrink-0 overflow-hidden relative">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </div>
              {/* Item name + price */}
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-2/5 sm:w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/4 sm:w-1/6" />
              </div>
              {/* Availability toggle */}
              <div className="w-10 h-5 bg-slate-100 rounded-full hidden sm:block" />
              {/* Action buttons */}
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-lg" />
                <div className="w-8 h-8 bg-slate-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
