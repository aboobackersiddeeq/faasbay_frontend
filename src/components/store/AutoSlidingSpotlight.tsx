// ============================================================================
// FaasBay Commerce — Auto-Sliding 3-Column Spotlight Banners (Apple Minimal)
// Ultra-smooth synchronized & staggered carousel across all 3 banner cards
// ============================================================================
import React, { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { useStoreProducts } from "./data";
import { useStorefrontCms } from "@/lib/storefront-cms";

export interface PromoCardSlide {
  id: string;
  productId?: string;
  badgeTitle: string;
  subtitle: string;
  price: string;
  image: string;
  imageAlt: string;
  tagRibbon?: string;
  circleColor: string;
  cardBg: string;
  textColor: string;
  priceColor: string;
  activeDotColor: string;
}

export interface PromoColumn {
  id: string;
  slides: PromoCardSlide[];
}

const DEFAULT_COLUMNS: PromoColumn[] = [
  // ── Column 1: Audio & Earbuds
  {
    id: "col-1",
    slides: [
      {
        id: "c1-s1",
        productId: "p1",
        badgeTitle: "ANY DAY OFFERS",
        subtitle: "STUDIO ACOUSTICS 40MM TITANIUM",
        price: "₹3,499",
        image: "/assets/banners/headphones.png",
        imageAlt: "Studio ANC Wireless Headphones",
        tagRibbon: "NEW",
        circleColor: "bg-amber-100 dark:bg-amber-950/40",
        cardBg: "bg-white dark:bg-[#161822] border border-black/[0.07] dark:border-white/10",
        textColor: "text-neutral-900 dark:text-white",
        priceColor: "text-[#1e293b] dark:text-amber-400",
        activeDotColor: "bg-amber-500",
      },
      {
        id: "c1-s2",
        productId: "p5",
        badgeTitle: "SPATIAL AUDIO",
        subtitle: "LOSSLESS LDAC WIRELESS EARBUDS",
        price: "₹2,299",
        image: "/assets/banners/earbuds.png",
        imageAlt: "Spatial Audio True Wireless ANC Earbuds",
        tagRibbon: "30% OFF",
        circleColor: "bg-emerald-100 dark:bg-emerald-950/40",
        cardBg: "bg-white dark:bg-[#161822] border border-black/[0.07] dark:border-white/10",
        textColor: "text-neutral-900 dark:text-white",
        priceColor: "text-[#1e293b] dark:text-emerald-400",
        activeDotColor: "bg-emerald-500",
      },
      {
        id: "c1-s3",
        productId: "p6",
        badgeTitle: "BOOM SOUND",
        subtitle: "PORTABLE BASS 360 SPEAKER",
        price: "₹2,890",
        image: "/assets/banners/speaker.png",
        imageAlt: "Rugged Studio Bluetooth Speaker",
        tagRibbon: "HOT",
        circleColor: "bg-slate-200/80 dark:bg-slate-800",
        cardBg: "bg-white dark:bg-[#161822] border border-black/[0.07] dark:border-white/10",
        textColor: "text-neutral-900 dark:text-white",
        priceColor: "text-[#1e293b] dark:text-slate-300",
        activeDotColor: "bg-slate-700 dark:bg-white",
      },
    ],
  },

  // ── Column 2: Titanium Wearables & Docks
  {
    id: "col-2",
    slides: [
      {
        id: "c2-s1",
        productId: "p2",
        badgeTitle: "TITANIUM PRO",
        subtitle: "SAPPHIRE CRYSTAL AMOLED WATCH",
        price: "₹4,299",
        image: "/assets/banners/watch.png",
        imageAlt: "Titanium Ultra Smartwatch",
        tagRibbon: "PRO",
        circleColor: "bg-white/20",
        cardBg: "bg-gradient-to-br from-[#1e293b] via-[#243347] to-[#0f172a] text-white border border-white/10",
        textColor: "text-white",
        priceColor: "text-amber-300",
        activeDotColor: "bg-amber-400",
      },
      {
        id: "c2-s2",
        productId: "p4",
        badgeTitle: "MAGSAFE DOCK",
        subtitle: "15W FAST WIRELESS 3-IN-1",
        price: "₹1,890",
        image: "/assets/banners/dock.png",
        imageAlt: "MagSafe 3-in-1 Fast Wireless Stand",
        tagRibbon: "POPULAR",
        circleColor: "bg-white/20",
        cardBg: "bg-gradient-to-br from-[#1e293b] via-[#243347] to-[#0f172a] text-white border border-white/10",
        textColor: "text-white",
        priceColor: "text-emerald-300",
        activeDotColor: "bg-emerald-400",
      },
      {
        id: "c2-s3",
        productId: "p7",
        badgeTitle: "SMART TRACK",
        subtitle: "TITANIUM BIO-METRIC SMART RING",
        price: "₹3,190",
        image: "/assets/banners/watch.png",
        imageAlt: "Titanium Smart Bio-Tracker",
        tagRibbon: "NEW",
        circleColor: "bg-white/20",
        cardBg: "bg-gradient-to-br from-[#1e293b] via-[#243347] to-[#0f172a] text-white border border-white/10",
        textColor: "text-white",
        priceColor: "text-white",
        activeDotColor: "bg-white",
      },
    ],
  },

  // ── Column 3: Studio Keyboard & Workspace
  {
    id: "col-3",
    slides: [
      {
        id: "c3-s1",
        productId: "p3",
        badgeTitle: "STUDIO KEYBOARD",
        subtitle: "CNC HOT-SWAP 75% GATERON YELLOW",
        price: "₹3,890",
        image: "/assets/banners/keyboard.png",
        imageAlt: "Wireless Mechanical Keyboard",
        tagRibbon: "HOT",
        circleColor: "bg-slate-100 dark:bg-slate-800",
        cardBg: "bg-white dark:bg-[#161822] border border-black/[0.07] dark:border-white/10",
        textColor: "text-neutral-900 dark:text-white",
        priceColor: "text-[#1e293b] dark:text-white",
        activeDotColor: "bg-neutral-900 dark:bg-white",
      },
      {
        id: "c3-s2",
        productId: "p9",
        badgeTitle: "ERGONOMIC DESK",
        subtitle: "PRECISION SILENT WIRELESS MOUSE",
        price: "₹1,499",
        image: "/assets/banners/mouse.png",
        imageAlt: "Precision Ergonomic Studio Mouse",
        tagRibbon: "NEW",
        circleColor: "bg-indigo-50 dark:bg-indigo-950/40",
        cardBg: "bg-white dark:bg-[#161822] border border-black/[0.07] dark:border-white/10",
        textColor: "text-neutral-900 dark:text-white",
        priceColor: "text-[#1e293b] dark:text-indigo-400",
        activeDotColor: "bg-indigo-600",
      },
      {
        id: "c3-s3",
        badgeTitle: "FAASBAY DIRECT",
        subtitle: "EXPRESS WAREHOUSE AIR DISPATCH",
        price: "FREE SHIPPING",
        image: "/assets/banners/earbuds.png",
        imageAlt: "FaasBay Official Direct Store",
        tagRibbon: "24H",
        circleColor: "bg-emerald-50 dark:bg-emerald-950/40",
        cardBg: "bg-white dark:bg-[#161822] border border-black/[0.07] dark:border-white/10",
        textColor: "text-neutral-900 dark:text-white",
        priceColor: "text-[#15803d] dark:text-emerald-400",
        activeDotColor: "bg-emerald-600",
      },
    ],
  },
];

export function AutoSlidingSpotlight() {
  const { spotlightSlides } = useStorefrontCms();
  const storeProducts = useStoreProducts();
  const { openProductDetail } = useCart();
  const [activeIndices, setActiveIndices] = useState<number[]>([0, 0, 0]);
  const [isPaused, setIsPaused] = useState(false);

  // Group dynamic CMS slides by column with reliable multi-slide fallback
  const promoColumns: PromoColumn[] = React.useMemo(() => {
    return ["col-1", "col-2", "col-3"].map((colId, colIdx) => {
      const cmsSlides = (spotlightSlides || []).filter((s) => s.columnId === colId);

      if (cmsSlides.length > 0) {
        const mappedSlides = cmsSlides.map((s, sIdx) => ({
          id: s.id || `cms-${colId}-${sIdx}`,
          badgeTitle: s.badgeTitle,
          subtitle: s.subtitle,
          price: s.price,
          image: s.image || DEFAULT_COLUMNS[colIdx].slides[0].image,
          imageAlt: s.subtitle,
          tagRibbon: s.tagRibbon || "FEATURED",
          circleColor: DEFAULT_COLUMNS[colIdx].slides[sIdx % DEFAULT_COLUMNS[colIdx].slides.length].circleColor,
          cardBg: DEFAULT_COLUMNS[colIdx].slides[sIdx % DEFAULT_COLUMNS[colIdx].slides.length].cardBg,
          textColor: DEFAULT_COLUMNS[colIdx].slides[sIdx % DEFAULT_COLUMNS[colIdx].slides.length].textColor,
          priceColor: DEFAULT_COLUMNS[colIdx].slides[sIdx % DEFAULT_COLUMNS[colIdx].slides.length].priceColor,
          activeDotColor: DEFAULT_COLUMNS[colIdx].slides[sIdx % DEFAULT_COLUMNS[colIdx].slides.length].activeDotColor,
        }));

        // If only 1 slide in this column, merge with defaults so it can auto-scroll
        if (mappedSlides.length === 1) {
          return {
            id: colId,
            slides: [...mappedSlides, ...DEFAULT_COLUMNS[colIdx].slides.slice(1)],
          };
        }

        return {
          id: colId,
          slides: mappedSlides,
        };
      }

      return DEFAULT_COLUMNS[colIdx];
    });
  }, [spotlightSlides]);

  // Auto-slide every 3.5 seconds across all 3 columns simultaneously
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveIndices((prev) =>
        prev.map((currIdx, colIdx) => {
          const colSlides = promoColumns[colIdx]?.slides;
          const total = colSlides?.length || 1;
          return (currIdx + 1) % total;
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused, promoColumns]);

  const handleCardClick = (productId?: string) => {
    const liveProducts = storeProducts;
    if (productId) {
      const prod = liveProducts.find((p) => p.id === productId);
      if (prod) {
        openProductDetail(prod);
        return;
      }
    }
    if (liveProducts.length > 0 && liveProducts[0]) {
      openProductDetail(liveProducts[0]);
      return;
    }
    const catalog = document.getElementById("catalog-section") || document.querySelector("main");
    if (catalog) catalog.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="mx-auto max-w-[1280px] px-4 sm:px-6 py-3 sm:py-5 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 
        Single Horizontal Row on Mobile (Smooth swipeable row with snap & 16px margins)
        3-Column Grid on Desktop (md:grid md:grid-cols-3 — LOCKED & UNTOUCHED)
      */}
      <div className="flex md:grid md:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
        {promoColumns.map((column, colIdx) => {
          const activeIndex = (activeIndices[colIdx] || 0) % (column.slides.length || 1);
          const currentSlide = column.slides[activeIndex] || column.slides[0];

          return (
            <div
              key={column.id}
              onClick={() => handleCardClick(currentSlide.productId)}
              className={`group relative overflow-hidden rounded-2xl shadow-xs hover:shadow-lg transition-all duration-500 w-[84vw] xs:w-[78vw] sm:w-auto shrink-0 snap-center md:shrink min-h-[165px] sm:min-h-[185px] lg:min-h-[195px] p-4 sm:p-5 flex items-center justify-between cursor-pointer ${currentSlide.cardBg}`}
            >
              {/* LEFT SIDE: Title, Subtitle, Price & Pagination Dots */}
              <div className="flex-1 min-w-0 z-10 flex flex-col justify-between h-full pr-2 space-y-2">
                <div className="space-y-1">
                  {/* Badge Title */}
                  <h3
                    key={`title-${currentSlide.id}-${activeIndex}`}
                    className={`font-display text-sm sm:text-base lg:text-[17px] font-black uppercase tracking-tight leading-tight transition-all duration-500 animate-in fade-in slide-in-from-bottom-1 ${currentSlide.textColor}`}
                  >
                    {currentSlide.badgeTitle}
                  </h3>

                  {/* Subtitle */}
                  <p
                    key={`sub-${currentSlide.id}-${activeIndex}`}
                    className="text-[10.5px] sm:text-[11.5px] font-bold uppercase tracking-wide opacity-80 line-clamp-2 leading-snug transition-all duration-500 animate-in fade-in"
                  >
                    {currentSlide.subtitle}
                  </p>
                </div>

                {/* Price */}
                <div
                  key={`price-${currentSlide.id}-${activeIndex}`}
                  className="pt-0.5 sm:pt-1 transition-all duration-500 animate-in fade-in"
                >
                  <span
                    className={`font-display text-base sm:text-lg lg:text-xl font-black tracking-tight ${currentSlide.priceColor}`}
                  >
                    {currentSlide.price}
                  </span>
                </div>

                {/* Pagination Indicator Dots */}
                <div
                  className="flex items-center gap-1.5 pt-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {column.slides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      aria-label={`Slide ${dotIdx + 1}`}
                      onClick={() => {
                        setActiveIndices((prev) => {
                          const updated = [...prev];
                          updated[colIdx] = dotIdx;
                          return updated;
                        });
                      }}
                      className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                        dotIdx === activeIndex
                          ? `w-5 ${currentSlide.activeDotColor}`
                          : "w-1.5 bg-neutral-300 dark:bg-white/30 hover:bg-neutral-400"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* RIGHT SIDE: Circular Backdrop Accent + Product Cutout + Ribbon Badge */}
              <div className="relative shrink-0 w-28 h-28 xs:w-32 xs:h-32 sm:w-36 sm:h-36 flex items-center justify-center">
                {/* Circular Backdrop Disc */}
                <div
                  className={`absolute inset-1 rounded-full transition-all duration-500 scale-95 group-hover:scale-105 ${currentSlide.circleColor}`}
                />

                {/* Tag Ribbon Badge */}
                {currentSlide.tagRibbon && (
                  <span
                    key={`ribbon-${currentSlide.id}-${activeIndex}`}
                    className="absolute -top-1 -right-1 z-20 rounded-md bg-rose-600 text-white font-black text-[9.5px] sm:text-[10.5px] px-2 py-0.5 uppercase tracking-wider shadow-sm rotate-2 animate-in zoom-in-90 duration-300"
                  >
                    {currentSlide.tagRibbon}
                  </span>
                )}

                {/* Product Image (Clean Transparent PNG Cutout) */}
                <img
                  key={`img-${currentSlide.id}-${activeIndex}`}
                  src={currentSlide.image}
                  alt={currentSlide.imageAlt}
                  className="relative z-10 w-full h-full object-contain p-2 drop-shadow-md group-hover:scale-110 transition-all duration-500 ease-out animate-in fade-in zoom-in-95"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
