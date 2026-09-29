import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Zap,
  Flame,
  Tag,
  Percent,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useCart } from "@/hooks/use-cart";
import { scrollToSection } from "@/lib/scroll-to-section";

export interface QuickNavItem {
  id: string;
  label: string;
  Icon?: LucideIcon;
  badge?: {
    text: string;
    variant: "hot" | "new" | "discount";
  };
  href?: string;
}

export const quickNavItems: QuickNavItem[] = [
  {
    id: "for-you",
    label: "For You",
    Icon: Sparkles,
  },
  {
    id: "new-arrivals",
    label: "New Arrivals",
    Icon: Sparkles,
  },
  {
    id: "best-sellers",
    label: "Best Sellers",
    Icon: Award,
  },
  {
    id: "todays-deals",
    label: "Today's Deals",
    Icon: Flame,
    badge: { text: "Hot", variant: "hot" },
  },
  {
    id: "offers",
    label: "Offers & Coupons",
    Icon: Zap,
    badge: { text: "% OFF", variant: "discount" },
  },
];

/** Applies a quick-nav filter and brings the user to the filtered catalog. */
function useQuickNavSelect() {
  const { setSelectedCategory, setSearchQuery, setQuickNavFilter } = useCart();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return async (item: QuickNavItem) => {
    const filter = item.id === "for-you" ? null : item.id;
    setSelectedCategory("all");
    setSearchQuery("");
    setQuickNavFilter(filter);

    // The filtered catalog only exists on the home page — from any other page
    // (product, cart, policy…) go there first, then scroll to it.
    if (pathname !== "/") {
      await navigate({ to: "/" });
      if (!filter) return; // navigation already lands at the top
    }

    if (filter) {
      scrollToSection("catalog-section");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
}

/** "More ⌄" header trigger that reveals the quick-nav links on hover. */
export function HeaderMoreMenu() {
  const [open, setOpen] = useState(false);
  const { quickNavFilter } = useCart();
  const selectItem = useQuickNavSelect();
  const items = quickNavItems.filter((item) => item.id !== "for-you");

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1 px-3 text-sm font-medium text-foreground cursor-pointer"
      >
        More
        <ChevronDown
          className={`h-4 w-4 stroke-[2.2] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        // pt-2 bridges the gap so the pointer can travel into the panel without closing it.
        <div className="absolute right-0 top-full z-50 pt-2">
          <div
            role="menu"
            className="w-64 rounded-2xl border border-border bg-surface py-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] animate-in fade-in-0 slide-in-from-top-1 duration-150"
          >
            <p className="px-5 pb-1.5 text-sm font-bold text-foreground">More</p>
            {items.map((item) => {
              const Icon = item.Icon;
              const isActive = quickNavFilter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    selectItem(item);
                  }}
                  className={`flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors hover:bg-secondary cursor-pointer ${
                    isActive
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0 stroke-[1.8]" />}
                  <span className="flex-1 whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full border border-border/80 px-1.5 py-0.5 text-[8.5px] font-bold uppercase leading-none tracking-wider text-foreground">
                      {item.badge.text}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function HeaderQuickNav() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const { quickNavFilter } = useCart();

  const activeId = quickNavFilter || "for-you";
  const handleNavClick = useQuickNavSelect();
  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 240;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative border-t border-border/70 bg-surface/95 backdrop-blur-md">
      <div className="mx-auto max-w-[1220px] px-2 sm:px-4 relative">
        {/* Left Scroll Arrow */}
        {showLeftArrow && (
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
            className="absolute left-1 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/95 p-1 text-foreground shadow-sm backdrop-blur-sm transition-transform hover:scale-110 hover:bg-secondary md:flex cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Quick Nav Pills List with edge-fade mask on mobile
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-2 justify-start md:justify-center px-1"
        >
          {quickNavItems.map((item) => {
            const isActive = activeId === item.id;
            const Icon = item.Icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`group relative flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] sm:text-xs font-semibold transition-all duration-200 cursor-pointer select-none ${
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                    : "text-muted-foreground bg-secondary/40 hover:bg-secondary hover:text-foreground"
                }`}
              >
                {Icon && (
                  <Icon
                    className={`h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive
                        ? "text-white dark:text-neutral-900"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                )}

                <span className="whitespace-nowrap tracking-tight">{item.label}</span>

                {item.badge && (
                  <span
                    className={`inline-flex items-center rounded-full px-1.5 py-0.2 text-[8.5px] font-bold uppercase tracking-wider leading-none ${
                      isActive
                        ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                        : "bg-surface text-foreground border border-border/80"
                    }`}
                  >
                    {item.badge.text}
                  </span>
                )}
              </button>
            );
          })}
        </div> */}

        {/* Right Scroll Arrow */}
        {showRightArrow && (
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
            className="absolute right-1 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/95 p-1 text-foreground shadow-sm backdrop-blur-sm transition-transform hover:scale-110 hover:bg-secondary md:flex cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
