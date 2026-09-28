import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useStorefrontCms } from "@/lib/storefront-cms";
import { useStoreProducts } from "@/components/store/data";
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

interface BannerTheme {
  bg: string;
  title: string;
  body: string;
  cta: string;
}

// Soft pastel palettes rotated across cards (alternating cool/warm so side-by-side
// cards contrast); every card shares one dark-mode look. Cycles after the last one.
const THEMES: BannerTheme[] = [
  {
    bg: "from-[#e4f3fc] via-[#d3ebf8] to-[#bcdff3]",
    title: "text-[#0f2d5c]",
    body: "text-[#2b5a8a]",
    cta: "text-[#0f2d5c] shadow-[0_10px_30px_-10px_rgba(15,45,92,0.45)]",
  },
  {
    bg: "from-[#fbf0ec] via-[#f7e3dc] to-[#f0d2c7]",
    title: "text-[#5a261a]",
    body: "text-[#8a4a3a]",
    cta: "text-[#5a261a] shadow-[0_10px_30px_-10px_rgba(90,38,26,0.4)]",
  },
  {
    bg: "from-[#e9f6f0] via-[#d7eee4] to-[#c2e4d5]",
    title: "text-[#113e31]",
    body: "text-[#2f6b58]",
    cta: "text-[#113e31] shadow-[0_10px_30px_-10px_rgba(17,62,49,0.4)]",
  },
  {
    bg: "from-[#f0ecfb] via-[#e4ddf7] to-[#d3c9f1]",
    title: "text-[#2b2160]",
    body: "text-[#554a93]",
    cta: "text-[#2b2160] shadow-[0_10px_30px_-10px_rgba(43,33,96,0.4)]",
  },
  // Amber
  {
    bg: "from-[#fdf5e6] via-[#fbebcf] to-[#f6dcae]",
    title: "text-[#5c3a0a]",
    body: "text-[#8a5f22]",
    cta: "text-[#5c3a0a] shadow-[0_10px_30px_-10px_rgba(92,58,10,0.4)]",
  },
  // Teal
  {
    bg: "from-[#e5f6f6] via-[#d0eeee] to-[#b6e2e3]",
    title: "text-[#0d4144]",
    body: "text-[#2a6c70]",
    cta: "text-[#0d4144] shadow-[0_10px_30px_-10px_rgba(13,65,68,0.4)]",
  },
  // Rose
  {
    bg: "from-[#fdeef3] via-[#fadde8] to-[#f4c8d8]",
    title: "text-[#5e1934]",
    body: "text-[#8e3f5c]",
    cta: "text-[#5e1934] shadow-[0_10px_30px_-10px_rgba(94,25,52,0.4)]",
  },
  // Slate
  {
    bg: "from-[#eef1f5] via-[#e1e6ed] to-[#cfd7e2]",
    title: "text-[#1e293b]",
    body: "text-[#475569]",
    cta: "text-[#1e293b] shadow-[0_10px_30px_-10px_rgba(30,41,59,0.4)]",
  },
  // Butter
  {
    bg: "from-[#fdfae8] via-[#faf2c9] to-[#f3e6a4]",
    title: "text-[#4d4208]",
    body: "text-[#7a6a1f]",
    cta: "text-[#4d4208] shadow-[0_10px_30px_-10px_rgba(77,66,8,0.4)]",
  },
  // Periwinkle
  {
    bg: "from-[#ebeffd] via-[#dae2fa] to-[#c3d0f5]",
    title: "text-[#1c2a6b]",
    body: "text-[#43539a]",
    cta: "text-[#1c2a6b] shadow-[0_10px_30px_-10px_rgba(28,42,107,0.4)]",
  },
  // Coral
  {
    bg: "from-[#fef0ec] via-[#fcdcd3] to-[#f7c3b5]",
    title: "text-[#651f10]",
    body: "text-[#94452f]",
    cta: "text-[#651f10] shadow-[0_10px_30px_-10px_rgba(101,31,16,0.4)]",
  },
  // Sage
  {
    bg: "from-[#f0f4ea] via-[#e2ebd6] to-[#cfddbd]",
    title: "text-[#2c3d17]",
    body: "text-[#56693c]",
    cta: "text-[#2c3d17] shadow-[0_10px_30px_-10px_rgba(44,61,23,0.4)]",
  },
  // Orchid
  {
    bg: "from-[#f8edf9] via-[#f0dcf2] to-[#e4c5e8]",
    title: "text-[#4a1a52]",
    body: "text-[#774180]",
    cta: "text-[#4a1a52] shadow-[0_10px_30px_-10px_rgba(74,26,82,0.4)]",
  },
  // Aqua
  {
    bg: "from-[#e6f8fb] via-[#cff0f6] to-[#b2e5ee]",
    title: "text-[#083f4d]",
    body: "text-[#256a7b]",
    cta: "text-[#083f4d] shadow-[0_10px_30px_-10px_rgba(8,63,77,0.4)]",
  },
  // Sand
  {
    bg: "from-[#f8f3ec] via-[#efe5d7] to-[#e3d4be]",
    title: "text-[#45351f]",
    body: "text-[#735f43]",
    cta: "text-[#45351f] shadow-[0_10px_30px_-10px_rgba(69,53,31,0.4)]",
  },
  // Ice
  {
    bg: "from-[#f1f6fa] via-[#e4edf4] to-[#d2e0eb]",
    title: "text-[#12324a]",
    body: "text-[#3c5d77]",
    cta: "text-[#12324a] shadow-[0_10px_30px_-10px_rgba(18,50,74,0.4)]",
  },
];

const DARK_BG = "dark:from-[#131a27] dark:via-[#172033] dark:to-[#1d2a42]";
const DEFAULT_LINK = "/#catalog-section";
const AUTOPLAY_MS = 3000;

function scrollToHash(link: string) {
  const id = link.slice(link.indexOf("#") + 1);
  const target = id ? document.getElementById(id) : null;
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  else window.location.href = link;
}

export function DualHeroBanner() {
  const { heroPairs } = useStorefrontCms();
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { openProductDetail } = useCart();
  const storeProducts = useStoreProducts();
  const touchStartX = useRef<number | null>(null);
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
      link: b.link || DEFAULT_LINK,
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

  /**
   * Follows the banner's CMS link. Product links open the quick-view like the
   * other carousels; hash links scroll smoothly; anything else navigates normally.
   */
  const handleBannerClick = (link: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let "open in new tab" work

    const productMatch = link.match(/^\/product\/([^/?#]+)/);
    if (productMatch) {
      const product = storeProducts.find((p) => p.id === decodeURIComponent(productMatch[1]!));
      e.preventDefault();
      if (product) openProductDetail(product);
      // Stale product link (e.g. the product was deleted) — fall back to the catalog.
      else scrollToHash(DEFAULT_LINK);
      return;
    }

    const onThisPage =
      link.startsWith("#") || (link.startsWith("/#") && window.location.pathname === "/");
    if (onThisPage) {
      e.preventDefault();
      scrollToHash(link);
    }
  };

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
        <div className="overflow-hidden rounded-2xl md:rounded-3xl">
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {pages.map((page, pageIdx) => (
              <div
                key={pageIdx}
                className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-3.5 lg:gap-4.5"
              >
                {page.map(({ banner, idx }) => {
                  const theme = THEMES[idx % THEMES.length]!;
                  const isActive = pageIdx === active;
                  return (
                    <a
                      key={banner.id || idx}
                      href={banner.link}
                      onClick={handleBannerClick(banner.link)}
                      aria-hidden={!isActive}
                      tabIndex={isActive ? 0 : -1}
                      className={`relative block overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br ${theme.bg} ${DARK_BG} aspect-[1.75/1] min-h-[200px] md:aspect-[1.9/1] lg:aspect-[2.15/1] cursor-pointer`}
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
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous banner"
              className="absolute -left-4 top-[calc(50%-14px)] -translate-y-1/2 z-20 hidden md:grid h-9 w-9 place-items-center rounded-full border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-white/10 text-neutral-800 dark:text-white backdrop-blur-md shadow-sm hover:bg-white dark:hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next banner"
              className="absolute -right-4 top-[calc(50%-14px)] -translate-y-1/2 z-20 hidden md:grid h-9 w-9 place-items-center rounded-full border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-white/10 text-neutral-800 dark:text-white backdrop-blur-md shadow-sm hover:bg-white dark:hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

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
