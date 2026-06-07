'use client';

export default function CategoryTabs({ categories, activeCategory, setActiveCategory }) {
  const allCategories = ["All", ...categories];

  return (
    <div className="bg-white border-b border-gray-100 w-full" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div 
          role="tablist"
          aria-label="Menu categories"
          className="flex overflow-x-auto hide-scrollbar space-x-6 md:space-x-8" 
          suppressHydrationWarning
        >
          {allCategories.map((category) => {
            const tabId = `tab-${category.replace(/\s+/g, '-').toLowerCase()}`;
            return (
              <button
                key={category}
                id={tabId}
                role="tab"
                aria-selected={activeCategory === category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap py-4 px-1 text-sm md:text-base font-extrabold tracking-tight transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded-lg ${
                  activeCategory === category 
                    ? "text-gray-900" 
                    : "text-gray-400 hover:text-gray-900 hover:opacity-80"
                }`}
                suppressHydrationWarning
              >
                {category}
                {activeCategory === category && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 rounded-t-md" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
