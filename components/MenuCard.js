import { Star, Plus, Minus, Clock, Flame, Info } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function MenuCard({ item, quantity = 0, onAdd, onUpdateQuantity, hidePopular = false }) {
  const [imgSrc, setImgSrc] = useState(item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80");
  const isSpicy = item.description?.toLowerCase().includes('spicy') || item.description?.toLowerCase().includes('chili');

  return (
    <div 
      suppressHydrationWarning
      className={`bg-white rounded-[20px] border border-gray-100 mb-2.5 flex flex-row p-0 gap-0 overflow-hidden transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${!item.isAvailable ? 'opacity-60 grayscale' : ''}`}
    >
      {/* Image Section (Left) - Flush with borders */}
      <div className="relative w-[110px] md:w-[150px] min-h-[120px] flex-shrink-0" suppressHydrationWarning>
        <Image
          src={imgSrc}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 110px, 150px"
          quality={75}
          className="object-cover"
          onError={() => setImgSrc("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80")}
        />

        {/* Popular Tag (Overlay) */}
        {item.isPopular && !hidePopular && (
          <div className="absolute top-2 left-2 bg-white/95 text-green-500 px-1.5 py-0.5 rounded-md text-[0.6rem] font-black shadow-sm flex items-center gap-0.5 z-[2]">
            <Star size={10} fill="currentColor" /> POPULAR
          </div>
        )}
      </div>

      {/* Content Section (Right) */}
      <div className="flex-1 flex flex-col justify-between p-3 md:p-4" suppressHydrationWarning>
        <div>
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-base md:text-lg text-gray-900 leading-tight">
                {item.name}
              </h3>
              {isSpicy && <Flame size={14} color="#ef4444" fill="#ef4444" className="flex-shrink-0" />}
            </div>

            {/* Veg/Non-veg Indicator */}
            <div className={`w-4 h-4 border rounded-[3px] flex items-center justify-center flex-shrink-0 mt-0.5 ml-2 ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
              <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </div>

          <p className="text-gray-500 text-xs md:text-sm leading-snug line-clamp-2 mb-2">
            {item.description}
          </p>

          <div className="flex items-center gap-3 opacity-70 text-gray-500">
             <div className="flex items-center gap-1">
                <Clock size={12} />
                <span className="text-[10px] md:text-xs font-bold">15-20m</span>
             </div>
             <div className="flex items-center gap-1">
                <Info size={12} />
                <span className="text-[10px] md:text-xs font-bold">Details</span>
             </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-black text-gray-900 text-base md:text-lg">
            {item.hasVariants && item.variants?.length
              ? `From ₹${Math.min(...item.variants.map((v) => v.price))}`
              : `₹${item.price}`}
          </span>

          <div>
            {item.isAvailable ? (
              quantity > 0 ? (
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl p-0.5">
                  <button
                    aria-label={`Decrease quantity of ${item.name}`}
                    className="w-7 h-7 flex items-center justify-center bg-white text-green-500 rounded-lg shadow-sm hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors"
                    onClick={() => onUpdateQuantity(item.id, quantity - 1)}
                  >
                    <Minus size={14} strokeWidth={4} />
                  </button>
                  <span 
                    aria-live="polite" 
                    className="font-black text-gray-900 text-sm min-w-[16px] text-center"
                  >
                    {quantity}
                  </span>
                  <button
                    aria-label={`Increase quantity of ${item.name}`}
                    className="w-7 h-7 flex items-center justify-center bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors"
                    onClick={() => onUpdateQuantity(item.id, quantity + 1)}
                  >
                    <Plus size={14} strokeWidth={4} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onAdd(item)}
                  aria-label={`Add ${item.name} to cart`}
                  className="w-9 h-9 flex items-center justify-center bg-green-500 text-white rounded-[10px] hover:bg-green-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 transition-colors shadow-[0_4px_10px_rgba(249,115,22,0.2)]"
                >
                  <Plus size={22} strokeWidth={3} />
                </button>
              )
            ) : (
              <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">
                SOLD OUT
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
