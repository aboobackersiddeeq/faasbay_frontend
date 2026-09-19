import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ArrowRight,
  Headphones,
  Watch,
  Keyboard,
  BatteryCharging,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useStorefrontCms } from "@/lib/storefront-cms";

export interface BannerItem {
  id: string;
  title: string;
  brand: string;
  tag: string;
  Icon: LucideIcon;
  price: string;
  subtitle: string;
  cta: string;
  bgGradient: string;
  textColor: string;
  tagClass: string;
  brandClass: string;
  btnClass: string;
  circleColor: string;
  image: string;
  imageAlt: string;
}

export function DualHeroBanner() {
  const { heroPairs } = useStorefrontCms();
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [mobileSlide, setMobileSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { recordCategoryView } = useCart();
  const touchStartX = useRef<number | null>(null);

  // Fallback icon map
  const getBannerIcon = (tag?: string) => {
    if (tag?.toLowerCase().includes("audio") || tag?.toLowerCase().includes("flagship")) return Headphones;
    if (tag?.toLowerCase().includes("watch") || tag?.toLowerCase().includes("launch")) return Watch;
    if (tag?.toLowerCase().includes("key") || tag?.toLowerCase().includes("desk")) return Keyboard;
    return BatteryCharging;
  };

  // Safe pairs array
  const safePairs = heroPairs && heroPairs.length > 0 ? heroPairs : [];

  const allBanners: BannerItem[] = safePairs.flatMap((p) => [
    {
      id: p.left.id,
      title: p.left.title,
      brand: p.left.brand,
      tag: p.left.tag || "Featured",
      Icon: getBannerIcon(p.left.tag),
      price: p.left.price,
      subtitle: p.left.subtitle,
      cta: p.left.cta || "Shop Now",
      bgGradient: "bg-gradient-to-br from-[#f1f5f9] via-[#f8fafc] to-[#e8eef5] dark:bg-[#151922]",
      textColor: "text-neutral-900 dark:text-white",
      tagClass: "bg-slate-200/80 text-slate-800 dark:bg-white/10 dark:text-slate-200 border border-slate-300/60 dark:border-white/10",
      brandClass: "text-slate-600 dark:text-slate-400",
      btnClass: "bg-[#1e293b] text-white hover:bg-slate-800 dark:bg-white dark:text-[#1e293b]",
      circleColor: "bg-slate-200/70 dark:bg-white/10",
      image: p.left.image,
      imageAlt: p.left.title,
    },
    {
      id: p.right.id,
      title: p.right.title,
      brand: p.right.brand,
      tag: p.right.tag || "Featured",
      Icon: getBannerIcon(p.right.tag),
      price: p.right.price,
      subtitle: p.right.subtitle,
      cta: p.right.cta || "Shop Now",
      bgGradient: "bg-gradient-to-br from-[#f3f4f6] via-[#f9fafb] to-[#e5e7eb] dark:bg-[#151922]",
      textColor: "text-neutral-900 dark:text-white",
      tagClass: "bg-slate-200/80 text-slate-800 dark:bg-white/10 dark:text-slate-200 border border-slate-300/60 dark:border-white/10",
      brandClass: "text-slate-600 dark:text-slate-400",
      btnClass: "bg-[#1e293b] text-white hover:bg-slate-800 dark:bg-white dark:text-[#1e293b]",
      circleColor: "bg-slate-200/70 dark:bg-white/10",
      image: p.right.image,
      imageAlt: p.right.title,
    },
  ]);

  // Auto slide desktop every 3 seconds (3000ms)
  useEffect(() => {
    if (isHovered || safePairs.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPairIndex((prev) => (prev + 1) % safePairs.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, safePairs.length]);

  // Auto slide mobile every 3 seconds (3000ms)
  useEffect(() => {
    if (isHovered || allBanners.length <= 1) return;
    const interval = setInterval(() => {
      setMobileSlide((prev) => (prev + 1) % allBanners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, allBanners.length]);

  const handleNext = () => setCurrentPairIndex((prev) => (prev + 1) % (safePairs.length || 1));
  const handlePrev = () => setCurrentPairIndex((prev) => (prev - 1 + (safePairs.length || 1)) % (safePairs.length || 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || allBanners.length === 0) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 40) {
      setMobileSlide((prev) => (prev + 1) % allBanners.length);
    } else if (delta < -40) {
      setMobileSlide((prev) => (prev - 1 + allBanners.length) % allBanners.length);
    }
    touchStartX.current = null;
  };

  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-3 select-none">
      {/* 1. DESKTOP DUAL BANNER SLIDER (Light Minimal Theme — Auto-sliding every 3s — LOCKED & UNTOUCHED) */}
      <div
        className="hidden md:block relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentPairIndex * 100}%)` }}
          >
            {safePairs.map((pair, pIdx) => {
              const leftIcon = getBannerIcon(pair.left.tag);
              const rightIcon = getBannerIcon(pair.right.tag);

              return (
                <div key={pair.id || pIdx} className="w-full shrink-0 grid grid-cols-2 gap-3.5 lg:gap-4.5 px-0.5">
                  {/* Left Banner */}
                  <div className="relative overflow-hidden rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-[#f1f5f9] via-[#f8fafc] to-[#e8eef5] dark:bg-[#151922] text-neutral-900 dark:text-white border border-slate-200/90 dark:border-white/10">
                    <a
                      href="#catalog-section"
                      className="block p-5 lg:p-7 min-h-[220px] lg:min-h-[250px] flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex-1 pr-4 space-y-2.5 z-10">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-slate-200/80 text-slate-800 dark:bg-white/10 dark:text-slate-200 border border-slate-300/60 dark:border-white/10">
                            {React.createElement(leftIcon, { className: "h-3 w-3" })}
                            <span>{pair.left.tag || "Flagship"}</span>
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                            {pair.left.brand}
                          </span>
                        </div>

                        <div>
                          <h2 className="font-display text-xl lg:text-2xl font-black tracking-tight leading-tight text-neutral-900 dark:text-white">
                            {pair.left.title}
                          </h2>
                          <p className="text-xs lg:text-sm text-neutral-600 dark:text-slate-300 font-medium line-clamp-1 mt-1">
                            {pair.left.subtitle}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center gap-3">
                          <span className="font-display text-lg lg:text-xl font-black text-neutral-900 dark:text-white">
                            {pair.left.price}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm bg-[#1e293b] text-white hover:bg-slate-800 dark:bg-white dark:text-[#1e293b]">
                            <span>{pair.left.cta || "Shop Now"}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>

                      <div className="relative shrink-0 w-36 h-36 lg:w-44 lg:h-44 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full scale-90 group-hover:scale-100 transition-transform duration-500 bg-slate-200/70 dark:bg-white/10" />
                        <img
                          src={pair.left.image}
                          alt={pair.left.title}
                          className="relative z-10 w-full h-full object-contain p-1.5 drop-shadow-md group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </div>
                    </a>
                  </div>

                  {/* Right Banner */}
                  <div className="relative overflow-hidden rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-[#f3f4f6] via-[#f9fafb] to-[#e5e7eb] dark:bg-[#151922] text-neutral-900 dark:text-white border border-slate-200/90 dark:border-white/10">
                    <a
                      href="#catalog-section"
                      className="block p-5 lg:p-7 min-h-[220px] lg:min-h-[250px] flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex-1 pr-4 space-y-2.5 z-10">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-slate-200/80 text-slate-800 dark:bg-white/10 dark:text-slate-200 border border-slate-300/60 dark:border-white/10">
                            {React.createElement(rightIcon, { className: "h-3 w-3" })}
                            <span>{pair.right.tag || "Top Rated"}</span>
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                            {pair.right.brand}
                          </span>
                        </div>

                        <div>
                          <h2 className="font-display text-xl lg:text-2xl font-black tracking-tight leading-tight text-neutral-900 dark:text-white">
                            {pair.right.title}
                          </h2>
                          <p className="text-xs lg:text-sm text-neutral-600 dark:text-slate-300 font-medium line-clamp-1 mt-1">
                            {pair.right.subtitle}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center gap-3">
                          <span className="font-display text-lg lg:text-xl font-black text-neutral-900 dark:text-white">
                            {pair.right.price}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm bg-[#1e293b] text-white hover:bg-slate-800 dark:bg-white dark:text-[#1e293b]">
                            <span>{pair.right.cta || "Explore"}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>

                      <div className="relative shrink-0 w-36 h-36 lg:w-44 lg:h-44 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full scale-90 group-hover:scale-100 transition-transform duration-500 bg-slate-200/70 dark:bg-white/10" />
                        <img
                          src={pair.right.image}
                          alt={pair.right.title}
                          className="relative z-10 w-full h-full object-contain p-1.5 drop-shadow-md group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      </div>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Carousel Navigation Arrows */}
        {safePairs.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous banner pair"
              className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 hidden md:grid h-8 w-8 place-items-center rounded-full bg-white/95 dark:bg-[#1e293b]/95 text-neutral-800 dark:text-white shadow-md hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 border border-slate-200 dark:border-white/10 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next banner pair"
              className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 hidden md:grid h-8 w-8 place-items-center rounded-full bg-white/95 dark:bg-[#1e293b]/95 text-neutral-800 dark:text-white shadow-md hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 border border-slate-200 dark:border-white/10 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Desktop Pagination Dots */}
            <div className="mt-2.5 flex items-center justify-center gap-1.5">
              {safePairs.map((_, dotIdx) => {
                const isActive = currentPairIndex === dotIdx;
                return (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setCurrentPairIndex(dotIdx)}
                    aria-label={`Go to slide pair ${dotIdx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      isActive ? "w-6 bg-neutral-900 dark:bg-white shadow-xs" : "w-1.5 bg-neutral-300 dark:bg-white/20 hover:bg-neutral-400"
                    }`}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 2. MOBILE HERO PRESENTATION (iPhone App-Style Promotional Banner) */}
      <div
        className="md:hidden relative space-y-2"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Full-width Banner with ~1.7:1 Aspect Ratio */}
        <div className="relative overflow-hidden rounded-2xl shadow-xs">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${mobileSlide * 100}%)` }}
          >
            {allBanners.map((banner, bIdx) => {
              const Icon = banner.Icon;
              return (
                <div key={banner.id || bIdx} className="w-full shrink-0">
                  <div
                    className={`relative overflow-hidden rounded-2xl border ${banner.bgGradient} border-slate-200/90 dark:border-white/10 ${banner.textColor}`}
                  >
                    <a
                      href="#catalog-section"
                      className="block p-4.5 min-h-[195px] flex items-center justify-between cursor-pointer"
                    >
                      {/* Left Side: Tag, Title, Subtitle, Price, Button */}
                      <div className="flex-1 pr-3 space-y-2 z-10">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${banner.tagClass}`}
                          >
                            <Icon className="h-3 w-3" />
                            <span>{banner.tag}</span>
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${banner.brandClass}`}>
                            {banner.brand}
                          </span>
                        </div>

                        <div>
                          <h2 className="font-display text-lg font-black tracking-tight leading-tight text-neutral-950 dark:text-white line-clamp-1">
                            {banner.title}
                          </h2>
                          <p className="text-[11.5px] text-neutral-600 dark:text-neutral-300 font-medium line-clamp-2 mt-0.5 leading-snug">
                            {banner.subtitle}
                          </p>
                        </div>

                        <div className="pt-1 flex items-center gap-2.5">
                          <span className="font-display text-base font-black text-neutral-950 dark:text-white tracking-tight">
                            {banner.price}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[11px] font-bold shadow-xs active:scale-95 transition-all ${banner.btnClass}`}
                          >
                            <span>{banner.cta || "Shop Now"}</span>
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>

                      {/* Right Side: Large Product Image with Soft Backdrop */}
                      <div className="relative shrink-0 w-32 h-32 flex items-center justify-center">
                        <div className={`absolute inset-0 rounded-full scale-95 ${banner.circleColor}`} />
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="relative z-10 w-full h-full object-contain p-1 drop-shadow-md transition-transform duration-500"
                        />
                      </div>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Progress Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {allBanners.map((_, dotIdx) => {
            const isActive = mobileSlide === dotIdx;
            return (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setMobileSlide(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive ? "w-6 bg-neutral-950 dark:bg-white shadow-xs" : "w-1.5 bg-neutral-300 dark:bg-neutral-700"
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
