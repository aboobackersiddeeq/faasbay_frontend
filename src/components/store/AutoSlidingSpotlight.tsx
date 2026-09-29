// ============================================================================
// FaasBay Commerce — Spotlight Banner Strip (Premium Minimal)
// One horizontal strip of pastel cards: the next card peeks in from the edge,
// it auto-advances one card at a time, and is swipe/trackpad scrollable.
// ============================================================================
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useStorefrontCms } from "@/lib/storefront-cms";
import {
  BANNER_THEMES,
  BANNER_DARK_BG,
  DEFAULT_BANNER_LINK,
  useBannerClick,
} from "@/components/store/banner-shared";

export interface SpotlightCard {
  id: string;
  badgeTitle: string;
  subtitle: string;
  price: string;
  image: string;
  tagRibbon?: string;
  link: string;
}

const AUTOPLAY_MS = 3500;
// Start further along the palette than the hero so the two sections don't open on the same colours
const THEME_OFFSET = 4;

const DEFAULT_CARDS: SpotlightCard[] = [
  {
    id: "d1",
    badgeTitle: "Any Day Offers",
    subtitle: "Studio acoustics 40mm titanium",
    price: "₹3,499",
    image: "/assets/banners/headphones.png",
    tagRibbon: "New",
    link: "/product/p1",
  },
  {
    id: "d2",
    badgeTitle: "Titanium Pro",
    subtitle: "Sapphire crystal AMOLED watch",
    price: "₹4,299",
    image: "/assets/banners/watch.png",
    tagRibbon: "Pro",
    link: "/product/p2",
  },
  {
    id: "d3",
    badgeTitle: "Studio Keyboard",
    subtitle: "CNC hot-swap 75% Gateron yellow",
    price: "₹3,890",
    image: "/assets/banners/keyboard.png",
    tagRibbon: "Hot",
    link: "/product/p3",
  },
  {
    id: "d4",
    badgeTitle: "Spatial Audio",
    subtitle: "Lossless LDAC wireless earbuds",
    price: "₹2,299",
    image: "/assets/banners/earbuds.png",
    tagRibbon: "30% Off",
    link: "/product/p5",
  },
  {
    id: "d5",
    badgeTitle: "MagSafe Dock",
    subtitle: "15W fast wireless 3-in-1",
    price: "₹1,890",
    image: "/assets/banners/dock.png",
    tagRibbon: "Popular",
    link: "/product/p4",
  },
  {
    id: "d6",
    badgeTitle: "Ergonomic Desk",
    subtitle: "Precision silent wireless mouse",
    price: "₹1,499",
    image: "/assets/banners/mouse.png",
    tagRibbon: "New",
    link: "/product/p9",
  },
  {
    id: "d7",
    badgeTitle: "Boom Sound",
    subtitle: "Portable bass 360 speaker",
    price: "₹2,890",
    image: "/assets/banners/speaker.png",
    tagRibbon: "Hot",
    link: "/product/p6",
  },
  {
    id: "d8",
    badgeTitle: "Smart Track",
    subtitle: "Titanium bio-metric smart ring",
    price: "₹3,190",
    image: "/assets/banners/watch.png",
    tagRibbon: "New",
    link: "/product/p7",
  },
  {
    id: "d9",
    badgeTitle: "FaasBay Direct",
    subtitle: "Express warehouse air dispatch",
    price: "Free Shipping",
    image: "/assets/banners/earbuds.png",
    tagRibbon: "24H",
    link: DEFAULT_BANNER_LINK,
  },
];

const COLUMN_IDS = ["col-1", "col-2", "col-3"] as const;

export function AutoSlidingSpotlight() {
  const { spotlightSlides } = useStorefrontCms();
  const handleBannerClick = useBannerClick();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const offsetsRef = useRef<number[]>([]);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchingRef = useRef(false);
  const dragRef = useRef<{ x: number; left: number; startItem: number; moved: boolean } | null>(
    null,
  );
  const suppressClick = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeRef = useRef(0);
  activeRef.current = active;

  // Admin still groups slides into 3 columns; interleave them (1st of each column, then 2nd…)
  // so the strip opens with the same variety the old 3-column layout showed.
  const cards: SpotlightCard[] = useMemo(() => {
    const columns = COLUMN_IDS.map((colId) =>
      (spotlightSlides || []).filter((s) => s.columnId === colId),
    );
    const longest = Math.max(0, ...columns.map((c) => c.length));
    const interleaved: SpotlightCard[] = [];
    for (let i = 0; i < longest; i++) {
      columns.forEach((col) => {
        const s = col[i];
        if (!s) return;
        interleaved.push({
          id: s.id,
          badgeTitle: s.badgeTitle,
          subtitle: s.subtitle,
          price: s.price,
          image: s.image,
          tagRibbon: s.tagRibbon,
          link: s.link || DEFAULT_BANNER_LINK,
        });
      });
    }
    return interleaved.length > 0 ? interleaved : DEFAULT_CARDS;
  }, [spotlightSlides]);

  // Endless loop: render the cards three times and keep the view in the middle copy.
  // Whenever scrolling settles in the first/last copy, jump by one copy's width —
  // the content there is identical, so the jump is invisible and the strip never rewinds.
  const n = cards.length;
  const loop = n > 1;
  const items = loop ? [...cards, ...cards, ...cards] : cards;

  const nearestItem = () => {
    const el = scrollerRef.current;
    const offsets = offsetsRef.current;
    if (!el || offsets.length === 0) return 0;
    let nearest = 0;
    offsets.forEach((o, i) => {
      if (Math.abs(o - el.scrollLeft) < Math.abs(offsets[nearest]! - el.scrollLeft)) nearest = i;
    });
    return nearest;
  };

  const recenter = useCallback(() => {
    const el = scrollerRef.current;
    const setWidth = offsetsRef.current[n];
    if (!el || touchingRef.current) return;
    el.style.scrollSnapType = ""; // re-enable snapping switched off by a mouse drag
    if (!loop || setWidth === undefined) return;
    const i = nearestItem();
    if (i < n) el.scrollLeft += setWidth;
    else if (i >= 2 * n) el.scrollLeft -= setWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, loop]);

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    const base = children[0]?.offsetLeft ?? 0;
    offsetsRef.current = children.map((c) => c.offsetLeft - base);
    // Keep showing the same card (in the middle copy) after a resize or data change
    if (loop) el.scrollLeft = offsetsRef.current[n + activeRef.current] ?? 0;
  }, [n, loop]);

  useEffect(() => {
    measure();
    const el = scrollerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const scrollToItem = (i: number) => {
    const el = scrollerRef.current;
    const offsets = offsetsRef.current;
    if (!el || offsets.length === 0) return;
    const target = Math.max(0, Math.min(offsets.length - 1, i));
    el.scrollTo({ left: offsets[target] ?? 0, behavior: "smooth" });
  };

  const step = (dir: 1 | -1) => scrollToItem(nearestItem() + dir);

  // Mouse click-and-drag scrolling (touch devices already swipe natively)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (e.pointerType !== "mouse" || e.button !== 0 || !el) return;
    suppressClick.current = false;
    dragRef.current = { x: e.clientX, left: el.scrollLeft, startItem: nearestItem(), moved: false };
    touchingRef.current = true;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const el = scrollerRef.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      el.style.scrollSnapType = "none"; // snapping would fight the drag
      el.setPointerCapture(e.pointerId);
      setIsDragging(true);
    }
    if (d.moved) el.scrollLeft = d.left - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    touchingRef.current = false;
    if (!d?.moved) return;
    suppressClick.current = true; // the release shouldn't open the card under the cursor
    setIsDragging(false);
    // Settle on the nearest card; a short flick still moves at least one card
    const dx = e.clientX - d.x;
    let target = nearestItem();
    if (target === d.startItem && Math.abs(dx) > 40) target += dx < 0 ? 1 : -1;
    scrollToItem(target);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    e.preventDefault();
    e.stopPropagation();
  };

  // Dots jump to whichever copy of that card is closest, so the strip takes the short way
  const goToCard = (cardIdx: number) => {
    const current = nearestItem();
    const copies = loop ? [cardIdx, cardIdx + n, cardIdx + 2 * n] : [cardIdx];
    scrollToItem(copies.reduce((a, b) => (Math.abs(b - current) < Math.abs(a - current) ? b : a)));
  };

  const handleScroll = () => {
    const i = nearestItem() % (n || 1);
    if (i !== activeRef.current) setActive(i);
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(recenter, 150);
  };

  useEffect(
    () => () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (isPaused || !loop) return;
    const interval = setInterval(() => step(1), AUTOPLAY_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, loop]);

  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 select-none">
      <div
        className="relative group/strip"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => {
          touchingRef.current = true;
          setIsPaused(true);
        }}
        onTouchEnd={() => {
          touchingRef.current = false;
          setIsPaused(false);
          handleScroll(); // settle even if the swipe had no momentum
        }}
      >
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={(e) => {
            if (dragRef.current && !dragRef.current.moved) dragRef.current = null;
            if (!dragRef.current) touchingRef.current = false;
            else endDrag(e);
          }}
          onClickCapture={onClickCapture}
          className={`relative flex gap-4 md:gap-3 lg:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 scroll-px-4 sm:mx-0 sm:px-0 sm:scroll-px-0 md:cursor-grab ${isDragging ? "md:cursor-grabbing [&_*]:!cursor-grabbing" : ""}`}
        >
          {items.map((card, itemIdx) => {
            const idx = itemIdx % n;
            const isClone = loop && (itemIdx < n || itemIdx >= 2 * n);
            const theme = BANNER_THEMES[(idx + THEME_OFFSET) % BANNER_THEMES.length]!;
            return (
              <a
                key={`${card.id || idx}-${itemIdx}`}
                href={card.link}
                onClick={handleBannerClick(card.link)}
                draggable={false}
                aria-hidden={isClone || undefined}
                tabIndex={isClone ? -1 : undefined}
                className={`group relative block shrink-0 snap-start overflow-hidden rounded-2xl basis-[86%] sm:basis-[62%] md:basis-[calc((100%_-_0.75rem)/2)] lg:basis-[calc((100%_-_2rem)/3)] aspect-[1.9/1] md:aspect-[2.15/1] lg:aspect-[2.05/1] xl:aspect-[2.15/1] bg-gradient-to-br ${theme.bg} ${BANNER_DARK_BG} cursor-pointer`}
              >
                {/* Ambient light */}
                <div className="pointer-events-none absolute -top-1/2 right-[5%] h-[140%] aspect-square rounded-full bg-white/45 dark:bg-white/[0.04] blur-3xl" />

                <div className="absolute inset-0 flex items-stretch gap-3 px-5 py-4 lg:px-6 lg:py-5">
                  {/* Copy — one compact stack, vertically centred */}
                  <div className="z-10 flex min-w-0 flex-1 flex-col justify-center">
                    <div className="space-y-1.5 lg:space-y-2">
                      {card.tagRibbon && (
                        <div>
                          <span
                            className={`inline-flex h-[18px] lg:h-5 items-center rounded-full bg-white/75 dark:bg-white/10 backdrop-blur-sm px-2.5 text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] ${theme.title} dark:text-white`}
                          >
                            {card.tagRibbon}
                          </span>
                        </div>
                      )}
                      <h3
                        className={`font-display uppercase font-extrabold tracking-[0.04em] leading-[1.08] text-[15px] sm:text-lg lg:text-base xl:text-lg line-clamp-2 ${theme.title} dark:text-white`}
                      >
                        {card.badgeTitle}
                      </h3>
                      <p
                        className={`line-clamp-2 leading-snug text-[10px] lg:text-[11px] uppercase tracking-[0.12em] ${theme.body} dark:text-slate-400`}
                      >
                        {card.subtitle}
                      </p>
                      <div className="pt-1 lg:pt-2 flex items-center gap-3">
                        <span
                          className={`font-display text-sm sm:text-base xl:text-lg font-bold ${theme.title} dark:text-white`}
                        >
                          {card.price}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.16em] ${theme.body} dark:text-slate-300`}
                        >
                          Shop
                          <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Product — same fixed box on every card */}
                  <div className="relative w-[40%] shrink-0 flex items-center justify-center">
                    <div className="absolute bottom-[6%] h-[7%] w-[60%] rounded-[50%] bg-black/10 dark:bg-black/30 blur-md" />
                    <div className="relative h-[82%] w-full">
                      <img
                        src={card.image}
                        alt={card.subtitle}
                        draggable={false}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal drop-shadow-[0_12px_14px_rgba(15,23,42,0.16)] transition-transform duration-700 ease-out group-hover:scale-[1.06] group-hover:-rotate-2"
                      />
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {loop && (
        <div className="mt-1 flex items-center justify-center gap-1 md:gap-1.5">
          {cards.map((_, dotIdx) => {
            const isActive = active === dotIdx;
            return (
              <button
                key={dotIdx}
                type="button"
                onClick={() => goToCard(dotIdx)}
                aria-label={`Go to offer ${dotIdx + 1}`}
                aria-current={isActive}
                className="py-1.5 px-0.5 cursor-pointer"
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
      )}
    </section>
  );
}
