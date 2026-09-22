import React, { useMemo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useStoreProducts } from "./data";
import { useCart } from "@/hooks/use-cart";

export function FeaturedCollectionSection({ title = "New Arrivals" }: { title?: string }) {
  const { setQuickNavFilter } = useCart();
  // All available catalog products from live state
  const allProducts = useStoreProducts();

  // Admin-tagged "new-arrivals" products lead the row; the rest of the catalog
  // fills any remaining slots instead of the row being all-or-nothing.
  const displayProducts = useMemo(() => {
    const tagged = allProducts.filter((p) => Array.isArray(p.collections) && p.collections.includes("new-arrivals"));
    if (tagged.length >= 10) return tagged;
    const taggedIds = new Set(tagged.map((p) => p.id));
    const fillers = allProducts.filter((p) => !taggedIds.has(p.id));
    return [...tagged, ...fillers];
  }, [allProducts]);

  // Gracefully hide section if catalog is empty
  if (displayProducts.length === 0) {
    return null;
  }

  // Show up to 10 products (2 full rows of 5 on desktop, 5 rows of 2 on mobile)
  const visibleProducts = displayProducts.slice(0, 10);

  const handleViewAll = () => {
    setQuickNavFilter("new-arrivals");
    const catalog = document.getElementById("catalog-section") || document.querySelector("main");
    if (catalog) catalog.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 py-4 sm:py-6 select-none">
      {/* Section Header with View All */}
      <div className="flex items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-black/[0.06] dark:border-white/10 mb-4 sm:mb-6">
        {/* Title */}
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl sm:text-2xl lg:text-[26px] font-black text-neutral-900 dark:text-white tracking-tight leading-none">
            {title}
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-[4px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10.5px] font-bold text-slate-700 dark:text-slate-300">
            <Sparkles className="h-3 w-3" />
            <span>2026 Collection</span>
          </span>
        </div>

        {/* Right View All Link */}
        <div>
          <button
            type="button"
            onClick={handleViewAll}
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 hover:text-neutral-500 dark:hover:text-slate-400 transition-colors cursor-pointer group"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Product Grid (2 full rows of 5 on desktop when 10 items) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
