import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useStoreProducts } from "./data";

export interface BentoCollection {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  ctaText: string;
  image: string;
  categoryFilter: string;
  size: "large" | "small";
}

const BENTO_COLLECTIONS: BentoCollection[] = [
  {
    id: "desk-sanctuary",
    title: "Desk Sanctuary",
    subtitle: "Tactile keyboards, precision audio & ergonomic tools for deep focus.",
    badge: "Curated Setup",
    ctaText: "EXPLORE NOW",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1000&auto=format&fit=crop&q=85",
    categoryFilter: "keyboards",
    size: "large",
  },
  {
    id: "spatial-audio",
    title: "Spatial Audio & ANC",
    subtitle: "360° Studio Soundstage",
    ctaText: "SHOP NOW",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=85",
    categoryFilter: "audio",
    size: "small",
  },
  {
    id: "titanium-wearables",
    title: "Titanium Wearables",
    subtitle: "Built for bio-tracking & endurance",
    ctaText: "SHOP NOW",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=85",
    categoryFilter: "wearables",
    size: "small",
  },
  {
    id: "magsafe-power",
    title: "Fast MagSafe Power",
    subtitle: "3-in-1 CNC charging stations",
    ctaText: "SHOP NOW",
    image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=85",
    categoryFilter: "chargers",
    size: "small",
  },
  {
    id: "ambient-smart",
    title: "Ambient Desk Tech",
    subtitle: "Studio lamps & acoustic docks",
    ctaText: "SHOP NOW",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=85",
    categoryFilter: "home",
    size: "small",
  },
];

export function BentoCategoryShowcase() {
  const { openProductDetail } = useCart();
  const storeProducts = useStoreProducts();

  const handleCollectionClick = (category: string) => {
    const matched = storeProducts.find((p) => p.category === category) || storeProducts[0];
    if (matched) openProductDetail(matched);
  };

  const largeCard = BENTO_COLLECTIONS[0]!;
  const smallCards = BENTO_COLLECTIONS.slice(1);

  return (
    <section className="mx-auto max-w-[1280px] px-3 sm:px-6 py-2 sm:py-4 select-none">
      {/* ========================================================= */}
      {/* 1. DESKTOP BENTO GRID (Inspired by Luxora Luxury Layout)  */}
      {/* ========================================================= */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 lg:gap-5">
        
        {/* Large Feature Banner Card (Left 5 Cols) */}
        <div
          onClick={() => handleCollectionClick(largeCard.categoryFilter)}
          className="group relative md:col-span-5 rounded-2xl lg:rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-black/[0.06] dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-500 cursor-pointer min-h-[440px] flex flex-col justify-between p-6 lg:p-8"
        >
          {/* Background Hero Image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={largeCard.image}
              alt={largeCard.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Subtle Gradient Overlay for Typography Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 dark:from-black/90 dark:via-black/40 dark:to-transparent" />
          </div>

          {/* Top Badge */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-900 shadow-xs">
              <Sparkles className="h-3 w-3 text-[#15803d]" />
              <span>{largeCard.badge}</span>
            </span>
          </div>

          {/* Bottom Content */}
          <div className="relative z-10 space-y-3">
            <h3 className="font-display text-2xl lg:text-3.5xl font-black text-white tracking-tight leading-tight">
              {largeCard.title}
            </h3>
            <p className="text-xs lg:text-sm font-medium text-white/80 leading-relaxed max-w-xs">
              {largeCard.subtitle}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 text-xs lg:text-sm font-bold text-white uppercase tracking-wider group-hover:gap-3 transition-all duration-200 underline underline-offset-4 decoration-white/50 group-hover:decoration-white">
                <span>{largeCard.ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Right 4 Grid Cards (Right 7 Cols: 2x2 Grid) */}
        <div className="md:col-span-7 grid grid-cols-2 gap-4 lg:gap-5">
          {smallCards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCollectionClick(card.categoryFilter)}
              className="group relative rounded-2xl lg:rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-black/[0.06] dark:border-white/10 shadow-xs hover:shadow-lg transition-all duration-500 cursor-pointer min-h-[210px] flex flex-col justify-between p-5"
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 dark:from-black/90 dark:via-black/40 dark:to-transparent" />
              </div>

              {/* Top Space Placeholder */}
              <div className="relative z-10" />

              {/* Bottom Content */}
              <div className="relative z-10 space-y-1">
                <h4 className="font-display text-base lg:text-lg font-black text-white tracking-tight leading-snug">
                  {card.title}
                </h4>
                <p className="text-[11px] lg:text-xs font-medium text-white/80 line-clamp-1">
                  {card.subtitle}
                </p>
                <div className="pt-1.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white uppercase tracking-wider group-hover:gap-2.5 transition-all duration-200">
                    <span>{card.ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ========================================================= */}
      {/* 2. DEDICATED MOBILE LAYOUT (< 768px: Clean Swipeable)     */}
      {/* ========================================================= */}
      <div className="flex md:hidden flex-col space-y-3">
        {/* Mobile Main Hero Card */}
        <div
          onClick={() => handleCollectionClick(largeCard.categoryFilter)}
          className="group relative rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-black/[0.06] dark:border-white/10 shadow-xs p-5 min-h-[220px] flex flex-col justify-between cursor-pointer"
        >
          <div className="absolute inset-0 z-0">
            <img
              src={largeCard.image}
              alt={largeCard.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          </div>

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-900">
              <Sparkles className="h-2.5 w-2.5 text-[#15803d]" />
              <span>{largeCard.badge}</span>
            </span>
          </div>

          <div className="relative z-10 space-y-1">
            <h3 className="font-display text-xl font-black text-white tracking-tight">
              {largeCard.title}
            </h3>
            <p className="text-xs text-white/80 line-clamp-1">
              {largeCard.subtitle}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                <span>{largeCard.ctaText}</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Mobile 2-Column Grid for Secondary Collections */}
        <div className="grid grid-cols-2 gap-2.5">
          {smallCards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCollectionClick(card.categoryFilter)}
              className="group relative rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-black/[0.06] dark:border-white/10 shadow-xs p-3.5 min-h-[140px] flex flex-col justify-end cursor-pointer"
            >
              <div className="absolute inset-0 z-0">
                <img
                  src={card.image}
                  alt={card.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              </div>

              <div className="relative z-10 space-y-0.5">
                <h4 className="font-display text-xs font-black text-white tracking-tight leading-tight line-clamp-1">
                  {card.title}
                </h4>
                <p className="text-[10px] text-white/70 line-clamp-1">
                  {card.subtitle}
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white uppercase tracking-wider">
                    <span>SHOP</span>
                    <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
