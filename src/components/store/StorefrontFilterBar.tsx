// ============================================================================
// FaasBay Commerce — Minimal Apple-Style Storefront Sort Filter Strip
// Ultra-clean, lightweight, 100% mobile-friendly with zero clutter or popovers
// ============================================================================
import React from "react";
import { ArrowUpDown, RotateCcw } from "lucide-react";
import type { Product } from "./data";

export interface FilterState {
  sortBy: "featured" | "price-asc" | "price-desc" | "rating";
}

export const initialFilterState: FilterState = {
  sortBy: "featured",
};

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  totalProductsCount?: number;
  filteredProductsCount?: number;
}

export function StorefrontFilterBar({
  filters,
  onChange,
  onReset,
}: FilterBarProps) {
  const isFiltered = filters.sortBy !== "featured";

  return (
    <div className="w-full flex items-center justify-end gap-2.5 py-2 mb-4 select-none">
      {/* ── Sort Dropdown & Reset ── */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
            className="bg-neutral-100/90 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200 text-xs font-semibold rounded-full pl-3 pr-7 py-1.5 appearance-none transition-all cursor-pointer focus:outline-none border-0 shadow-2xs"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-400">
            <ArrowUpDown size={11} />
          </div>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-rose-600 dark:text-rose-400 hover:underline px-1.5 py-1 cursor-pointer transition-colors"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Filter & Sort Helper Function ───────────────────────────────────────────
export function filterAndSortProducts(products: Product[], filters: FilterState): Product[] {
  const getPriceNum = (p: Product) => {
    if (typeof p.price === "number") return p.price;
    return parseInt(String(p.price || "0").replace(/[^0-9]/g, ""), 10) || 0;
  };

  return [...products].sort((a, b) => {
    const priceA = getPriceNum(a);
    const priceB = getPriceNum(b);

    switch (filters.sortBy) {
      case "price-asc":
        return priceA - priceB;
      case "price-desc":
        return priceB - priceA;
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "featured":
      default:
        return 0;
    }
  });
}
