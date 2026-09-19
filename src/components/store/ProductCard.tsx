import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Heart, Star, Plus, Check } from "lucide-react";
import type { Product } from "./data";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";

export function ProductCard({ product }: { product: Product }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const liked = isWishlisted(product.id);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const handleCardClick = () => {
    navigate({
      to: "/product/$productId",
      params: { productId: product.id },
    });
  };

  // Calculate discount percentage safely
  let discountPercent: number | null = null;
  if (product.compareAt) {
    const current = typeof product.price === "number"
      ? product.price
      : parseInt(String(product.price || "0").replace(/[^\d]/g, ""), 10) || 0;
    const original = typeof product.compareAt === "number"
      ? product.compareAt
      : parseInt(String(product.compareAt || "0").replace(/[^\d]/g, ""), 10) || 0;
    if (original > current && original > 0) {
      discountPercent = Math.round(((original - current) / original) * 100);
    }
  }

  // Format reviews count safely
  const revCount = Number(product.reviews || 0);
  const formattedReviews =
    revCount >= 1000
      ? `${(revCount / 1000).toFixed(1)}k`
      : revCount.toLocaleString();

  return (
    <>
      {/* ── 1. ORIGINAL DESKTOP DESIGN (100% Preserved & Untouched) ── */}
      <article
        onClick={handleCardClick}
        className="hidden md:flex group flex-col w-full select-none cursor-pointer transition-all duration-300"
      >
        {/* Desktop Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-[10px] bg-[#faf9f6]/90 dark:bg-[#16191f]/90 backdrop-blur-xs border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)] transition-all duration-300 group-hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] group-hover:border-black/15 dark:group-hover:border-white/20">
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            width={600}
            height={600}
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset["tried"]) {
                target.dataset["tried"] = "true";
                target.src =
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
              }
            }}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />

          {/* Desktop Badges (Flash Deal & Discount) */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {product.isFlashDeal ? (
              <span className="rounded-md bg-neutral-900 text-white px-2 py-0.5 text-[10px] font-bold tracking-tight shadow-sm backdrop-blur-xs">
                Flash Deal
              </span>
            ) : discountPercent ? (
              <span className="rounded-md bg-neutral-900 text-white px-2 py-0.5 text-[10px] font-bold tracking-tight shadow-sm backdrop-blur-xs">
                {discountPercent}% OFF
              </span>
            ) : null}
          </div>

          {/* Desktop Wishlist Button */}
          <button
            type="button"
            onClick={handleLike}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-white/95 dark:bg-stone-800/90 backdrop-blur-xs text-stone-600 dark:text-stone-300 transition-all hover:scale-110 active:scale-90 shadow-xs border border-stone-200/60 dark:border-stone-700 cursor-pointer"
          >
            <Heart
              className={`h-3.5 w-3.5 stroke-[2] transition-colors ${
                liked ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
          </button>

          {/* Desktop Hover-Reveal Quick Add Button */}
          <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-center opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label="Quick add to bag"
              className="w-full py-2 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-[12px] font-bold tracking-tight shadow-md backdrop-blur-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              {added ? (
                <>
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 stroke-[2]" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Typography & Price Presentation */}
        <div className="mt-2.5 flex flex-col space-y-1">
          <div className="flex items-center justify-between gap-1 text-[11px] text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider truncate">
              {product.shop}
            </span>
            <div className="flex items-center gap-1 shrink-0 font-medium text-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{Number(product.rating || 5).toFixed(1)}</span>
              <span className="text-[10px] text-muted-foreground font-normal">({formattedReviews})</span>
            </div>
          </div>

          <h3 className="font-medium text-[13.5px] text-foreground leading-snug line-clamp-1 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
            {product.title}
          </h3>

          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="font-bold text-[14.5px] text-foreground">
              {product.price}
            </span>
            {product.compareAt && (
              <span className="text-[12px] text-muted-foreground line-through font-normal">
                {product.compareAt}
              </span>
            )}
          </div>
        </div>
      </article>

      {/* ── 2. NATIVE APP DTC MOBILE CARD (FaasBay iPhone Design System) ── */}
      <article
        onClick={handleCardClick}
        className="flex md:hidden flex-col w-full select-none cursor-pointer transition-all duration-200 active:scale-[0.98] group"
      >
        {/* Product Image Container (~1:1 ratio, full cover matching desktop) */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#faf9f6]/90 dark:bg-[#16191f]/90 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)]">
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset["tried"]) {
                target.dataset["tried"] = "true";
                target.src =
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
              }
            }}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Top-Left Badge: Flash Deal / Discount */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.isFlashDeal ? (
              <span className="rounded-md bg-neutral-900 text-white px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-tight shadow-2xs">
                Flash Deal
              </span>
            ) : discountPercent ? (
              <span className="rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-tight shadow-2xs">
                {discountPercent}% OFF
              </span>
            ) : null}
          </div>

          {/* Top-Right Wishlist Heart Icon */}
          <button
            type="button"
            onClick={handleLike}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-white/95 dark:bg-neutral-900/90 shadow-xs text-neutral-600 dark:text-neutral-300 active:scale-90 transition-transform cursor-pointer border border-black/[0.06] dark:border-white/[0.08]"
          >
            <Heart
              className={`h-3.5 w-3.5 stroke-[2] transition-colors ${
                liked ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
          </button>
        </div>

        {/* Product Information: CATEGORY -> TITLE -> RATING -> PRICE + QUICK ADD */}
        <div className="mt-2 flex flex-col space-y-0.5 px-0.5">
          {/* Category / Shop */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground truncate">
              {product.shop || product.category}
            </span>
          </div>

          {/* Product Title (Max 2 lines) */}
          <h3 className="font-semibold text-[13px] text-neutral-900 dark:text-neutral-100 leading-snug line-clamp-2">
            {product.title}
          </h3>

          {/* Star Rating & Review Count */}
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 pt-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-neutral-900 dark:text-white">{Number(product.rating || 5).toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">({formattedReviews})</span>
          </div>

          {/* Price & Quick Add Button Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-display font-black text-[15px] text-neutral-950 dark:text-white leading-none">
                {product.price}
              </span>
              {product.compareAt && (
                <span className="text-[11.5px] text-neutral-400 dark:text-neutral-500 line-through font-normal leading-none">
                  {product.compareAt}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label="Quick add to bag"
              className={`grid h-7 w-7 place-items-center rounded-full shadow-xs active:scale-90 transition-all cursor-pointer shrink-0 ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
              }`}
            >
              {added ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : <Plus className="h-3.5 w-3.5 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </article>
    </>
  );
}
