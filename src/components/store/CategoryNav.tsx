import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export interface CategoryItem {
  id: string;
  label: string;
  isAll?: boolean;
  mobileImage: string;
  renderDesktopIcon: (isActive: boolean) => React.ReactNode;
}

export const storeCategories: CategoryItem[] = [
  {
    id: "all",
    label: "All Products",
    isAll: true,
    mobileImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <path d="M12 2.5L14.4 9.6L21.5 12L14.4 14.4L12 21.5L9.6 14.4L2.5 12L9.6 9.6L12 2.5Z" fill="#FDE68A" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <circle cx="18.5" cy="5.5" r="1.5" fill="#B0CB1F" />
        <circle cx="5.5" cy="18.5" r="1.5" fill="#B0CB1F" />
      </svg>
    ),
  },
  {
    id: "mobile-electronics",
    label: "Mobile & Electronics",
    mobileImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.75" />
        <path d="M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="5" r="1" fill="#FDE68A" />
        <path d="M8 8h8" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "audio-speakers",
    label: "Audio & Speakers",
    mobileImage: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 14v4a1 1 0 0 0 1 1h2v-5H4a1 1 0 0 0-1 1Z" fill="#FDE68A" />
        <path d="M19 14v4a1 1 0 0 1-1 1h-2v-5h2a1 1 0 0 1 1 1Z" fill="#FDE68A" />
      </svg>
    ),
  },
  {
    id: "car-accessories",
    label: "Car Accessories",
    mobileImage: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <path d="M5 17h14M4 14l2-6h12l2 6v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7.5" cy="14.5" r="1.5" fill="#FDE68A" stroke="currentColor" strokeWidth="1" />
        <circle cx="16.5" cy="14.5" r="1.5" fill="#FDE68A" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: "home-cleaning",
    label: "Home Cleaning",
    mobileImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v4M8 5l2 2M16 5l-2 2" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 10h12l-1.5 9a2 2 0 0 1-2 1.7h-5a2 2 0 0 1-2-1.7L6 10Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M9 14h6" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "health-wellness",
    label: "Health & Massage",
    mobileImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <path d="M19.5 12.572l-7.5 7.428-7.5-7.428a5 5 0 1 1 7.5-6.566 5 5 0 1 1 7.5 6.566Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 12h2.5l1.5-3 2 6 1.5-3h2.5" stroke="#FDE68A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "beauty-personal-care",
    label: "Beauty & Care",
    mobileImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <rect x="7" y="8" width="10" height="13" rx="3" stroke="currentColor" strokeWidth="1.75" />
        <path d="M10 8V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 2v2" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="14" r="2.5" fill="#FDE68A" />
      </svg>
    ),
  },
  {
    id: "kitchen-dining",
    label: "Kitchen & Dining",
    mobileImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <path d="M3 11h14a1 1 0 0 1 1 1v1a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-1a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.75" />
        <path d="M18 14h3a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-3" stroke="currentColor" strokeWidth="1.75" />
        <path d="M7 6v2M10 5v3M13 6v2" stroke="#FDE68A" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "lighting",
    label: "Home Lighting",
    mobileImage: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <path d="M9 18h6M10 21h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M12 3a7 7 0 0 0-4.5 12.3c.6.5 1 1.2 1.2 1.7h6.6c.2-.5.6-1.2 1.2-1.7A7 7 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="12" cy="9" r="3" fill="#FDE68A" stroke="#B0CB1F" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: "kids-toys",
    label: "Kids & Toys",
    mobileImage: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="13" r="6" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="7" cy="7" r="2.5" fill="#FDE68A" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17" cy="7" r="2.5" fill="#FDE68A" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="12" r="1" fill="currentColor" />
        <circle cx="14" cy="12" r="1" fill="currentColor" />
        <path d="M11 15c.5.5 1.5.5 2 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "watches-fashion",
    label: "Watches & Fashion",
    mobileImage: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <rect x="6" y="5" width="12" height="14" rx="4" stroke="currentColor" strokeWidth="1.75" />
        <path d="M9 5V2h6v3M9 19v3h6v-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" fill="#FDE68A" stroke="#B0CB1F" strokeWidth="1.2" />
        <path d="M12 10.5v1.5l1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "storage-organizers",
    label: "Storage & Organizers",
    mobileImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="6" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <rect x="3" y="14" width="18" height="6" rx="2" stroke="currentColor" strokeWidth="1.75" />
        <path d="M10 7h4M10 17h4" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "travel-products",
    label: "Travel Products",
    mobileImage: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <rect x="6" y="7" width="12" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
        <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="21" r="1" fill="#FDE68A" />
        <circle cx="15.5" cy="21" r="1" fill="#FDE68A" />
        <path d="M6 11h12M6 16h12" stroke="#FDE68A" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "home-lifestyle",
    label: "Home & Lifestyle",
    mobileImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M10 15h4v6h-4v-6Z" fill="#FDE68A" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "pest-control",
    label: "Pest Control",
    mobileImage: "https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <path d="M12 3a9 9 0 0 0-9 9c0 5 4 8 9 9s9-4 9-9a9 9 0 0 0-9-9Z" stroke="currentColor" strokeWidth="1.75" />
        <path d="M13 7l-3 5h4l-2 5" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "stationery-office",
    label: "Stationery & Office",
    mobileImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" stroke="currentColor" strokeWidth="1.75" />
        <path d="M9 6h6M9 10h4" stroke="#FDE68A" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "utility-tools",
    label: "Utility & Tools",
    mobileImage: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=200&auto=format&fit=crop&q=80",
    renderDesktopIcon: () => (
      <svg className="h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="1" fill="#FDE68A" />
      </svg>
    ),
  },
];

export function CategoryNav() {
  const { selectedCategory, setSelectedCategory, recordCategoryView } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 12);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 12);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 280;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleSelect = (category: CategoryItem) => {
    setSelectedCategory(category.id);
    if (!category.isAll) {
      recordCategoryView(category.id);
    }
    const catalogEl = document.getElementById("catalog-section") || document.getElementById("categories");
    if (catalogEl && window.scrollY < 200) {
      catalogEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="categories" className="relative mx-auto max-w-[1280px] px-3 sm:px-4 py-1 sm:py-2 select-none">
      
      {/* ── 1. ORIGINAL DESKTOP DESIGN (100% Intact & Untouched) ── */}
      <div className="hidden md:block">
        <div className="relative border-y border-border/80 py-2.5">
          {showLeftArrow && (
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Scroll categories left"
              className="absolute -left-2 top-1/2 z-30 flex -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/95 p-1.5 text-foreground shadow-md backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-secondary cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 stroke-[2]" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex items-center gap-6 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden justify-start px-3 py-0.5"
          >
            {storeCategories.map((cat) => {
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelect(cat)}
                  className="group relative flex flex-col items-center justify-center min-w-[66px] shrink-0 transition-all duration-200 select-none cursor-pointer focus:outline-none py-0.5"
                >
                  <div
                    className={`relative flex h-13 w-13 items-center justify-center rounded-2xl transition-all duration-200 ${
                      isActive
                        ? "bg-neutral-900 text-white shadow-xs scale-105"
                        : "bg-secondary/60 text-foreground group-hover:bg-neutral-900 group-hover:text-white group-hover:-translate-y-0.5"
                    }`}
                  >
                    <div className={isActive ? "brightness-125" : ""}>
                      {cat.renderDesktopIcon(isActive)}
                    </div>
                  </div>

                  <span
                    className={`mt-1.5 text-[11.5px] tracking-tight text-center leading-tight truncate max-w-[72px] transition-colors duration-200 ${
                      isActive
                        ? "font-bold text-foreground"
                        : "font-medium text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </span>

                  <span
                    className={`mt-1 h-[2px] rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-4 bg-foreground opacity-100"
                        : "w-0 bg-transparent opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {showRightArrow && (
            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Scroll categories right"
              className="absolute -right-2 top-1/2 z-30 flex -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/95 p-1.5 text-foreground shadow-md backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-secondary cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 stroke-[2]" />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. MOBILE HORIZONTAL CATEGORY RAIL (Tactile iPhone App Style) ── */}
      <div className="block md:hidden py-2 px-1">
        <div
          ref={mobileScrollRef}
          className="flex items-center gap-3 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 px-1 -mx-1"
        >
          {storeCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelect(cat)}
                className="group flex flex-col items-center shrink-0 min-w-[62px] cursor-pointer focus:outline-none select-none transition-all duration-200 active:scale-90"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 shadow-2xs ${
                    isActive
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 ring-2 ring-neutral-950/20 shadow-xs scale-105"
                      : "bg-secondary/70 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 border border-black/[0.04] dark:border-white/[0.06] group-hover:bg-secondary"
                  }`}
                >
                  <div className={`transition-transform ${isActive ? "scale-90" : "scale-85 opacity-85"}`}>
                    {cat.renderDesktopIcon(isActive)}
                  </div>
                </div>

                <span
                  className={`mt-1.5 text-[11px] text-center tracking-tight truncate max-w-[64px] transition-colors leading-tight ${
                    isActive
                      ? "font-extrabold text-neutral-950 dark:text-white"
                      : "font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </section>
  );
}
