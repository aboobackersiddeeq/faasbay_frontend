import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sliders, Volume2, Sparkles } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useStoreProducts } from "@/components/store/data";

interface CampaignSlide {
  id: string;
  productId: string;
  badge: string;
  mobileBadge: string;
  title: string;
  mobileTitle: string;
  subtitle: string;
  mobileFeature: string;
  price: string;
  compareAt?: string;
  saveText?: string;
  ctaText: string;
  image: string;
  alt: string;
  watermark: string;
  align: "left" | "right";
  theme: "dark" | "light" | "sapphire";
}

const CAMPAIGN_SLIDES: CampaignSlide[] = [
  {
    id: "campaign-acoustics",
    productId: "p1",
    badge: "★ STUDIO ACOUSTICS DROP · 40% OFF",
    mobileBadge: "40% OFF · Flagship Drop",
    title: "ANC Studio Acoustics Pro",
    mobileTitle: "ANC Studio Acoustics Pro",
    subtitle: "Immersive sound. Zero distractions. Premium noise cancellation for focused listening.",
    mobileFeature: "Custom 40mm Titanium · 40h Battery",
    price: "₹3,499",
    compareAt: "₹4,999",
    saveText: "Save ₹1,500",
    ctaText: "Shop Acoustics",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000&auto=format&fit=crop&q=85",
    alt: "ANC Studio Acoustics Pro Headphones",
    watermark: "ACOUSTICS",
    align: "left",
    theme: "dark",
  },
  {
    id: "campaign-keyboards",
    productId: "p3",
    badge: "★ CREATOR SERIES · HOT-SWAP",
    mobileBadge: "Creator Series · 30% Off",
    title: "Tactile Studio Keyboards",
    mobileTitle: "Tactile Studio Keyboards",
    subtitle: "Built for creators. Precision switches. Minimal design. Maximum control.",
    mobileFeature: "Gateron Yellow · Sound-Damped CNC",
    price: "₹3,890",
    compareAt: "₹5,550",
    saveText: "30% Off",
    ctaText: "Shop Keyboards",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000&auto=format&fit=crop&q=85",
    alt: "Tactile Studio Mechanical Keyboards",
    watermark: "STUDIO",
    align: "right",
    theme: "light",
  },
  {
    id: "campaign-watch",
    productId: "p2",
    badge: "★ AEROSPACE TITANIUM · SAPPHIRE AMOLED",
    mobileBadge: "Titanium · 14-Day Battery",
    title: "Titanium Ultra AMOLED Watch",
    mobileTitle: "Titanium Ultra Watch",
    subtitle: "Sapphire crystal glass. Bio-tracking precision. Engineered for 14-day endurance.",
    mobileFeature: "Sapphire Crystal · ECG Bio-Tracking",
    price: "₹4,299",
    compareAt: "₹6,140",
    saveText: "Direct Drop",
    ctaText: "Discover Watch",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=85",
    alt: "Titanium Ultra AMOLED Smartwatch",
    watermark: "TITANIUM",
    align: "left",
    theme: "sapphire",
  },
];

export function PromoBanners() {
  const storeProducts = useStoreProducts();
  const { openProductDetail } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto-slide every 6 seconds on desktop/mobile unless user hovers
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAMPAIGN_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleProductClick = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const p = storeProducts.find((item) => item.id === productId) || storeProducts[0];
    if (p) openProductDetail(p);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartX.current - touchEndX;
    if (deltaX > 35) {
      // Swiped left -> next slide
      setCurrentSlide((prev) => (prev + 1) % CAMPAIGN_SLIDES.length);
    } else if (deltaX < -35) {
      // Swiped right -> prev slide
      setCurrentSlide((prev) => (prev - 1 + CAMPAIGN_SLIDES.length) % CAMPAIGN_SLIDES.length);
    }
    touchStartX.current = null;
  };

  const slide = CAMPAIGN_SLIDES[currentSlide];

  return (
    <section className="mx-auto max-w-[1280px] px-3 sm:px-6 py-2.5 sm:py-5 select-none">
      {/* 
        Full-Width Campaign Banner Container:
        Seamlessly hosts dedicated mobile and desktop presentations.
      */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-500 shadow-md hover:shadow-xl"
        style={{
          borderColor:
            slide.theme === "light"
              ? "rgba(0,0,0,0.12)"
              : "rgba(255,255,255,0.12)",
        }}
      >
        {/* ========================================================= */}
        {/* ART-DIRECTED BACKGROUNDS PER CAMPAIGN THEME               */}
        {/* ========================================================= */}
        {slide.theme === "dark" && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#090a0d] via-[#14161f] to-[#0a0b0e] transition-colors duration-700">
            <div className="absolute -top-24 -left-24 h-64 w-64 md:h-80 md:w-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 h-64 w-64 md:h-80 md:w-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          </div>
        )}

        {slide.theme === "light" && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-neutral-900 transition-colors duration-700">
            <div className="absolute -top-24 -right-24 h-64 w-64 md:h-80 md:w-80 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 md:h-80 md:w-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          </div>
        )}

        {slide.theme === "sapphire" && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#080b12] via-[#0f172a] to-[#07090e] transition-colors duration-700">
            <div className="absolute -top-24 -right-24 h-64 w-64 md:h-80 md:w-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 md:h-80 md:w-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
          </div>
        )}

        {/* Typographic Watermark (Cinematic Depth) */}
        <div
          className={`pointer-events-none absolute select-none opacity-[0.035] font-black text-6xl sm:text-8xl lg:text-9xl uppercase font-display tracking-tight leading-none ${
            slide.align === "left" ? "right-4 bottom-2 md:right-6 md:bottom-4" : "left-4 bottom-2 md:left-6 md:bottom-4"
          } ${slide.theme === "light" ? "text-neutral-900" : "text-white"}`}
        >
          {slide.watermark}
        </div>

        {/* ========================================================= */}
        {/* 1. PURPOSE-BUILT MOBILE DESIGN (COMPACT, SLEEK, APP-LIKE)  */}
        {/* ========================================================= */}
        <div
          onClick={(e) => handleProductClick(slide.productId, e)}
          className={`relative z-10 cursor-pointer flex md:hidden items-center justify-between p-4 sm:p-5 gap-3.5 min-h-[195px] max-h-[220px] ${
            slide.theme === "light" ? "text-neutral-900" : "text-white"
          }`}
        >
          {/* Left: Punchy Mobile Content (58% width) */}
          <div className="flex flex-col justify-between h-full space-y-2 max-w-[58%]">
            <div className="space-y-1">
              {/* Micro Eyebrow */}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider ${
                  slide.theme === "light"
                    ? "bg-neutral-900/10 text-neutral-800 border border-neutral-300"
                    : slide.theme === "sapphire"
                    ? "bg-cyan-400/15 text-cyan-300 border border-cyan-400/30"
                    : "bg-white/10 text-emerald-300 border border-white/15"
                }`}
              >
                <span>{slide.mobileBadge}</span>
              </span>

              {/* Headline */}
              <h3
                className={`font-display text-[15.5px] font-black leading-tight tracking-tight line-clamp-2 ${
                  slide.theme === "light" ? "text-neutral-950" : "text-white"
                }`}
              >
                {slide.mobileTitle}
              </h3>

              {/* 1-Line Technical Feature Highlight */}
              <p
                className={`text-[10px] font-medium truncate ${
                  slide.theme === "light" ? "text-neutral-600" : "text-neutral-300"
                }`}
              >
                {slide.mobileFeature}
              </p>
            </div>

            {/* Price & Compact CTA */}
            <div className="pt-0.5 space-y-1.5">
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-base font-black tracking-tight ${
                    slide.theme === "light" ? "text-neutral-950" : "text-white"
                  }`}
                >
                  {slide.price}
                </span>
                {slide.compareAt && (
                  <span className="text-[10.5px] text-neutral-400 line-through">
                    {slide.compareAt}
                  </span>
                )}
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-black shadow-xs transition-all active:scale-95 ${
                    slide.theme === "light"
                      ? "bg-neutral-950 text-white"
                      : "bg-white text-neutral-950"
                  }`}
                >
                  <span>Shop Now</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>

          {/* Right: Framed Hero Product Visual (42% width) */}
          <div className="relative flex-1 flex items-center justify-center h-[145px]">
            {/* Ambient Backlight Halo */}
            <div
              className={`pointer-events-none absolute h-28 w-28 rounded-full blur-xl opacity-60 ${
                slide.theme === "light"
                  ? "bg-amber-300/30"
                  : slide.theme === "sapphire"
                  ? "bg-cyan-500/25"
                  : "bg-emerald-500/25"
              }`}
            />

            <div className="relative h-full w-full max-w-[155px] rounded-xl overflow-hidden shadow-md">
              <img
                src={slide.image}
                alt={slide.alt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div
                className={`absolute inset-0 ring-1 ring-inset rounded-xl pointer-events-none ${
                  slide.theme === "light" ? "ring-black/10" : "ring-white/15"
                }`}
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CINEMATIC DESKTOP DESIGN (FULL-WIDTH 16:6 CAMPAIGN)     */}
        {/* ========================================================= */}
        <div
          onClick={(e) => handleProductClick(slide.productId, e)}
          className={`relative z-10 cursor-pointer hidden md:flex items-center justify-between p-6 lg:p-10 min-h-[300px] lg:min-h-[330px] gap-8 lg:gap-12 ${
            slide.align === "right" ? "flex-row-reverse" : ""
          }`}
        >
          {/* Content Column */}
          <div
            className={`flex flex-col justify-center space-y-3.5 lg:space-y-4 max-w-[55%] lg:max-w-[52%] text-left ${
              slide.theme === "light" ? "text-neutral-900" : "text-white"
            }`}
          >
            {/* Eyebrow Badge */}
            <div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                  slide.theme === "light"
                    ? "bg-neutral-900/10 text-neutral-800 border border-neutral-300"
                    : slide.theme === "sapphire"
                    ? "bg-cyan-400/15 text-cyan-300 border border-cyan-400/30"
                    : "bg-white/10 text-emerald-300 border border-white/15"
                }`}
              >
                <span>{slide.badge}</span>
              </span>
            </div>

            {/* Headline */}
            <h2
              className={`font-display text-2xl lg:text-4xl font-black tracking-tight leading-tight ${
                slide.theme === "light" ? "text-neutral-950" : "text-white"
              }`}
            >
              {slide.title}
            </h2>

            {/* Short Supporting Line */}
            <p
              className={`text-xs sm:text-sm lg:text-base font-medium leading-relaxed max-w-xl ${
                slide.theme === "light" ? "text-neutral-600" : "text-neutral-300"
              }`}
            >
              {slide.subtitle}
            </p>

            {/* Price & CTA Button */}
            <div className="flex flex-wrap items-center gap-4 pt-1 sm:pt-2">
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl lg:text-3xl font-black tracking-tight ${
                    slide.theme === "light" ? "text-neutral-950" : "text-white"
                  }`}
                >
                  {slide.price}
                </span>
                {slide.compareAt && (
                  <span
                    className={`text-xs sm:text-sm line-through ${
                      slide.theme === "light" ? "text-neutral-400" : "text-neutral-400"
                    }`}
                  >
                    {slide.compareAt}
                  </span>
                )}
                {slide.saveText && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      slide.theme === "light"
                        ? "bg-neutral-900/10 text-neutral-800"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {slide.saveText}
                  </span>
                )}
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 lg:px-6 lg:py-3 text-xs sm:text-sm font-black shadow-md transition-all duration-200 active:scale-95 ${
                    slide.theme === "light"
                      ? "bg-neutral-950 text-white hover:bg-neutral-800 hover:gap-3"
                      : "bg-white text-neutral-950 hover:bg-neutral-100 hover:gap-3"
                  }`}
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200" />
                </span>
              </div>
            </div>
          </div>

          {/* Hero Product Visual Column */}
          <div className="relative flex-1 flex items-center justify-center">
            {/* Ambient Halo */}
            <div
              className={`pointer-events-none absolute h-56 w-56 lg:h-64 lg:w-64 rounded-full blur-2xl opacity-60 ${
                slide.theme === "light"
                  ? "bg-amber-300/30"
                  : slide.theme === "sapphire"
                  ? "bg-cyan-500/20"
                  : "bg-emerald-500/20"
              }`}
            />

            {/* Hero Visual Card */}
            <div className="relative h-56 lg:h-72 w-full max-w-[380px] lg:max-w-[460px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transform group-hover:scale-[1.03] transition-transform duration-500 ease-out">
              <img
                src={slide.image}
                alt={slide.alt}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div
                className={`absolute inset-0 ring-1 ring-inset rounded-2xl sm:rounded-3xl pointer-events-none ${
                  slide.theme === "light" ? "ring-black/10" : "ring-white/15"
                }`}
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CAROUSEL NAVIGATION CONTROLS                               */}
        {/* ========================================================= */}
        {/* Prev / Next Discreet Arrows on Desktop */}
        <button
          type="button"
          aria-label="Previous campaign banner"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentSlide((prev) => (prev - 1 + CAMPAIGN_SLIDES.length) % CAMPAIGN_SLIDES.length);
          }}
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          aria-label="Next campaign banner"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentSlide((prev) => (prev + 1) % CAMPAIGN_SLIDES.length);
          }}
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Minimal Bottom Pagination Dots (Mobile & Desktop) */}
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
          {CAMPAIGN_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Slide ${idx + 1}: ${s.title}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx
                  ? slide.theme === "light"
                    ? "w-5 sm:w-7 bg-neutral-950"
                    : "w-5 sm:w-7 bg-white"
                  : slide.theme === "light"
                  ? "w-1.5 sm:w-2 bg-neutral-400/50 hover:bg-neutral-500"
                  : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
