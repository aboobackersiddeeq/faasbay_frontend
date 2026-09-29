import React, { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { useStorefrontCms } from "@/lib/storefront-cms";
import {
  BANNER_THEMES,
  BANNER_DARK_BG,
  DEFAULT_BANNER_LINK,
  useBannerClick,
} from "@/components/store/banner-shared";
import { useIsMobile } from "@/hooks/use-mobile";

export interface BannerItem {
  id: string;
  title: string;
  brand: string;
  tag: string;
  price: string;
  subtitle: string;
  cta: string;
  image: string;
  link: string;
}

const AUTOPLAY_MS = 3000;

export function DualHeroBanner() {
  const { heroPairs } = useStorefrontCms();
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const mouseDrag = useRef<{ x: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [dragPx, setDragPx] = useState(0);
  const isMobile = useIsMobile();

  // Admin manages banners in pairs: desktop shows a pair per slide, mobile one banner per slide
  const banners: BannerItem[] = (heroPairs || []).flatMap((p) =>
    [p.left, p.right].map((b) => ({
      id: b.id,
      title: b.title,
      brand: b.brand,
      tag: b.tag || "Featured",
      price: b.price,
      subtitle: b.subtitle,
      cta: b.cta || "Shop Now",
      image: b.image,
      link: b.link || DEFAULT_BANNER_LINK,
    })),
  );
  const perPage = isMobile ? 1 : 2;
  const pages: { banner: BannerItem; idx: number }[][] = [];
  banners.forEach((banner, idx) => {
    if (idx % perPage === 0) pages.push([]);
    pages[pages.length - 1]!.push({ banner, idx });
  });
  const count = pages.length;

  useEffect(() => {
    if (isHovered || count <= 1) return;
    const interval = setInterval(() => setActive((prev) => (prev + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [isHovered, count]);

  useEffect(() => {
    if (active >= count && count > 0) setActive(0);
  }, [active, count]);

  const handleBannerClick = useBannerClick();

  const go = (dir: 1 | -1) => setActive((prev) => (prev + dir + count) % count);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]!.clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || count === 0) return;
    const delta = touchStartX.current - e.changedTouches[0]!.clientX;
    if (delta > 40) go(1);
    else if (delta < -40) go(-1);
    touchStartX.current = null;
  };

  // Mouse click-and-drag: the slides follow the cursor, then settle on the next/previous pair
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || count <= 1) return;
    suppressClick.current = false;
    mouseDrag.current = { x: e.clientX, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = mouseDrag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (d.moved) setDragPx(dx);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = mouseDrag.current;
    mouseDrag.current = null;
    if (!d?.moved) return;
    suppressClick.current = true; // the release shouldn't open the banner under the cursor
    const dx = e.clientX - d.x;
    setDragPx(0);
    if (dx < -60) go(1);
    else if (dx > 60) go(-1);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  if (count === 0) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-3 select-none">
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`overflow-hidden rounded-2xl md:rounded-3xl ${dragPx !== 0 ? "cursor-grabbing [&_*]:!cursor-grabbing" : ""}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
        >
          <div
            className={`flex ${dragPx !== 0 ? "" : "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"}`}
            style={{ transform: `translateX(calc(-${active * 100}% + ${dragPx}px))` }}
          >
            {pages.map((page, pageIdx) => (
              <div
                key={pageIdx}
                className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3.5 lg:gap-4.5"
              >
                {page.map(({ banner, idx }) => {
                  const theme = BANNER_THEMES[idx % BANNER_THEMES.length]!;
                  const isActive = pageIdx === active;
                  return (
                    <a
                      key={banner.id || idx}
                      href={banner.link}
                      onClick={handleBannerClick(banner.link)}
                      draggable={false}
                      aria-hidden={!isActive}
                      tabIndex={isActive ? 0 : -1}
                      className={`relative block overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br ${theme.bg} ${BANNER_DARK_BG} aspect-[1.75/1] min-h-[200px] md:aspect-[1.9/1] lg:aspect-[2.15/1] cursor-pointer`}
                    >
                      {/* Ambient light */}
                      <div className="pointer-events-none absolute -top-1/3 right-[8%] h-[120%] aspect-square rounded-full bg-white/45 dark:bg-white/[0.04] blur-3xl" />
                      <div className="pointer-events-none absolute -bottom-1/2 -left-[10%] h-full aspect-square rounded-full bg-white/30 dark:bg-white/[0.03] blur-3xl" />

                      <div className="absolute inset-0 grid grid-cols-[1.15fr_1fr] md:grid-cols-2 items-center gap-2 px-5 md:px-6 lg:px-9 py-4 md:py-6">
                        {/* Copy */}
                        <div
                          key={isActive ? `on-${active}` : "off"}
                          className={`z-10 min-w-0 space-y-1.5 md:space-y-2 lg:space-y-3 ${isActive ? "animate-in fade-in slide-in-from-bottom-3 duration-700" : ""}`}
                        >
                          <p
                            className={`text-[9px] md:text-[10px] lg:text-[11px] font-semibold uppercase tracking-[0.3em] ${theme.body} dark:text-slate-400 truncate`}
                          >
                            {[banner.brand, banner.tag].filter(Boolean).join("  ·  ")}
                          </p>
                          <h2
                            className={`font-display uppercase font-extrabold tracking-[0.06em] leading-[1.05] text-lg sm:text-2xl md:text-xl lg:text-2xl xl:text-[1.9rem] line-clamp-2 ${theme.title} dark:text-white`}
                          >
                            {banner.title}
                          </h2>
                          <p
                            className={`text-[11px] sm:text-sm md:text-xs lg:text-sm leading-snug line-clamp-2 max-w-md ${theme.body} dark:text-slate-300`}
                          >
                            {banner.subtitle}
                          </p>
                          <div className="pt-1 lg:pt-2 flex items-center gap-3 lg:gap-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 lg:px-6 lg:py-2.5 text-[10px] lg:text-xs font-bold uppercase tracking-[0.18em] transition-transform duration-300 group-hover:-translate-y-0.5 ${theme.cta} dark:text-neutral-900`}
                            >
                              {banner.cta}
                              <ArrowRight className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                            </span>
                            {banner.price && (
                              <span
                                className={`hidden sm:inline font-display text-sm lg:text-lg font-bold ${theme.title} dark:text-white`}
                              >
                                {banner.price}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Product on podium */}
                        <div className="relative h-full min-h-0 flex items-end justify-center">
                          <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-[78%] max-w-[380px]">
                            <div className="relative h-8 lg:h-12">
                              <div className="absolute inset-x-0 top-1/2 bottom-0 rounded-b-[50%] bg-gradient-to-b from-white/70 to-white/25 dark:from-white/15 dark:to-white/5" />
                              <div className="absolute inset-x-0 top-0 h-1/2 rounded-[50%] bg-white/90 dark:bg-white/20 shadow-[inset_0_-4px_10px_rgba(0,0,0,0.06)]" />
                            </div>
                          </div>
                          <img
                            src={banner.image}
                            alt={banner.title}
                            draggable={false}
                            className="relative z-10 mb-[8%] h-[82%] w-auto max-w-full object-contain mix-blend-multiply dark:mix-blend-normal drop-shadow-[0_18px_22px_rgba(15,45,92,0.18)] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                          />
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {count > 1 && (
          <>
            <div className="mt-1.5 flex items-center justify-center gap-1 md:gap-1.5">
              {pages.map((_, dotIdx) => {
                const isActive = active === dotIdx;
                return (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setActive(dotIdx)}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                    aria-current={isActive}
                    className="py-2 px-0.5 cursor-pointer"
                  >
                    <span
                      className={`block h-1 md:h-1.5 rounded-full transition-all duration-500 ${
                        isActive
                          ? "w-5 md:w-7 bg-neutral-900/80 dark:bg-white"
                          : "w-1 md:w-1.5 bg-neutral-900/20 dark:bg-white/25"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
