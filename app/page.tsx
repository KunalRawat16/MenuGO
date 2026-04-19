"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Utensils, ScanLine, ShoppingBag, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 1,
    title: "Scan Menu",
    description: "Scan the QR code on your table",
    image: "/uploads/slider1.jpeg",
    icon: <ScanLine size={24} />,
    bgColor: "bg-white",
  },
  {
    id: 2,
    title: "View Menu",
    description: "Browse the full menu anytime",
    image: "/uploads/slider2.jpeg",
    icon: <Utensils size={24} />,
    bgColor: "bg-white",
  },
  {
    id: 3,
    title: "Order Menu",
    description: "Place your order in seconds",
    image: "/uploads/slider3.jpeg",
    icon: <ShoppingBag size={24} />,
    bgColor: "bg-white",
  },
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push("/login");
    }
  };

  const handleSkip = () => {
    router.push("/login");
  };

  // Swipe logic for real "Slider" feel
  const onTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    if (distance > 50) handleNext();
    if (distance < -50 && currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  if (!mounted) return <div className="min-h-screen bg-white" suppressHydrationWarning />;

  return (
    <div
      className="min-h-screen bg-white flex flex-col font-sans overflow-hidden select-none"
      suppressHydrationWarning
    >
      {/* Top Section */}
      <div className="p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-100">
            <Utensils size={18} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tight text-gray-900">Menu<span className="text-green-500">Go</span></span>
        </div>
        <button
          onClick={handleSkip}
          className="text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Center Section (Carousel) */}
      <div
        className="flex-1 relative flex flex-col"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex flex-1 transition-transform duration-500 ease-[cubic-bezier(0.23, 1, 0.32, 1)] h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                "min-w-full flex flex-col items-center justify-center px-8 text-center transition-opacity duration-500",
                currentSlide === index ? "opacity-100" : "opacity-0"
              )}
            >
              <div className={cn(
                "w-72 h-72 rounded-full flex items-center justify-center mb-10 relative overflow-hidden transition-all duration-700 shadow-[0_20px_50px_rgba(34,197,94,0.15)] border border-gray-100",
                slide.bgColor,
                currentSlide === index ? "scale-100 rotate-0" : "scale-90 rotate-6"
              )}>
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-contain p-8 animate-bounce-subtle"
                />
              </div>

              <div className={cn(
                "transition-all duration-700 delay-200 flex flex-col items-center",
                currentSlide === index ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}>
                <div className="text-green-500 mb-2 bg-white p-2 rounded-xl shadow-sm border border-gray-50">
                  {slide.icon}
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
                  {slide.title}
                </h2>
                <p className="text-gray-500 font-bold text-lg max-w-xs leading-relaxed">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-8 pb-12 flex flex-col items-center gap-10 bg-white z-20">
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500 cursor-pointer",
                currentSlide === index ? "w-12 bg-green-500" : "w-4 bg-gray-200"
              )}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-green-500 hover:bg-green-600 active:scale-95 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-2 group"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

