import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useStoreCategories, type StoreCategory } from "@/components/store/data";
import { CategoryIcon } from "@/lib/category-icons";

const ICON_CLASS = "h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-200 group-hover:scale-110";

export function CategoryNav() {
  const { selectedCategory, setSelectedCategory, recordCategoryView } = useCart();
  const storeCategories = useStoreCategories();
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
  }, [storeCategories.length]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 280;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleSelect = (category: StoreCategory) => {
    setSelectedCategory(category.id);
    if (!category.isAll) {
      recordCategoryView(category.id);
    }
    // Selecting a category swaps the whole page layout (homepage sections vs.
    // the filtered catalog view), which remounts this nav in a different spot
    // on the page. Always snapping to the top keeps it in view regardless of
    // where the user had scrolled to when they clicked — a conditional
    // scroll-if-near-top left it stranded off-screen after the layout swap.
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
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
                      <CategoryIcon icon={cat.icon} slug={cat.id} className={ICON_CLASS} />
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
                    <CategoryIcon icon={cat.icon} slug={cat.id} className={ICON_CLASS} />
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
