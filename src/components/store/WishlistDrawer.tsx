import React, { useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { useWishlist, useWishlistDrawer } from "@/hooks/use-wishlist";
import { useStoreProducts, type Product } from "@/components/store/data";

export function WishlistDrawer() {
  const { isWishlistOpen, closeWishlist } = useWishlistDrawer();
  const { wishlistIds, removeFromWishlist, clearWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const products = useStoreProducts();
  const navigate = useNavigate();

  // Keep the saved order (newest first); skip products no longer in the catalog.
  const items = useMemo(() => {
    const byId = new Map(products.map((p) => [String(p.id), p]));
    return wishlistIds.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
  }, [products, wishlistIds]);

  useEffect(() => {
    if (!isWishlistOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeWishlist();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isWishlistOpen, closeWishlist]);

  if (!isWishlistOpen) return null;

  const isOutOfStock = (p: Product) => p.stock !== undefined && p.stock <= 0;

  const openProduct = (p: Product) => {
    closeWishlist();
    navigate({ to: "/product/$productId", params: { productId: p.id } });
  };

  // Products with colour/variant options need a choice on the product page first.
  const moveToBag = (p: Product) => {
    if (p.hasVariants) {
      openProduct(p);
      return;
    }
    removeFromWishlist(p.id);
    closeWishlist();
    addToCart(p); // opens the cart drawer
  };

  const moveAllToBag = () => {
    const movable = items.filter((p) => !p.hasVariants && !isOutOfStock(p));
    if (!movable.length) return;
    movable.forEach((p) => {
      removeFromWishlist(p.id);
      addToCart(p);
    });
    closeWishlist();
    const skipped = items.length - movable.length;
    if (skipped > 0) {
      toast.info(
        `${skipped} item${skipped > 1 ? "s" : ""} need an option or are out of stock — kept in wishlist`,
      );
    }
  };

  const canMoveAll = items.some((p) => !p.hasVariants && !isOutOfStock(p));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={closeWishlist}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist"
        className="relative z-50 flex h-full w-full max-w-full sm:max-w-md flex-col bg-surface shadow-2xl transition-transform duration-300 animate-in slide-in-from-right rounded-none sm:rounded-l-3xl border-l border-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-4 sm:px-5 py-3.5 sm:py-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-foreground" />
            <h2 className="font-sans text-base sm:text-lg font-bold text-foreground">
              Your Wishlist ({items.length})
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearWishlist}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={closeWishlist}
              aria-label="Close wishlist"
              className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-95 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Items or Empty State */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 sm:space-y-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-secondary/70 text-muted-foreground">
                <Heart className="h-9 w-9 opacity-50" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">Your wishlist is empty</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                Tap the heart on any product to save it here for later.
              </p>
              <button
                type="button"
                onClick={closeWishlist}
                className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-neutral-900 px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:opacity-90 active:scale-95 cursor-pointer"
              >
                Start Exploring
              </button>
            </div>
          ) : (
            items.map((product) => {
              const outOfStock = isOutOfStock(product);
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-2xl border border-border/80 bg-surface p-2.5 sm:p-3 shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => openProduct(product)}
                    aria-label={`View ${product.title}`}
                    className="shrink-0 cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className={`h-18 w-18 sm:h-20 sm:w-20 rounded-xl object-cover bg-secondary/30 ${outOfStock ? "opacity-50" : ""}`}
                    />
                  </button>

                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => openProduct(product)}
                        className="text-left font-sans text-xs sm:text-sm font-bold text-foreground line-clamp-2 leading-tight hover:underline cursor-pointer"
                      >
                        {product.title}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product)}
                        aria-label="Remove from wishlist"
                        className="grid h-9 w-9 min-h-[36px] min-w-[36px] shrink-0 place-items-center text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <span className="text-[10.5px] text-muted-foreground font-medium">
                      {product.shop || "FaasBay Direct"}
                    </span>

                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-sans text-sm sm:text-base font-black text-foreground">
                          {product.price}
                        </span>
                        {product.compareAt && (
                          <span className="text-[10.5px] text-muted-foreground line-through">
                            {product.compareAt}
                          </span>
                        )}
                      </div>

                      {outOfStock ? (
                        <span className="rounded-lg bg-secondary px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground">
                          Out of stock
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => moveToBag(product)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 dark:bg-white px-2.5 py-1.5 text-[11px] font-bold text-white dark:text-neutral-900 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                        >
                          {product.hasVariants ? (
                            <>
                              Choose options
                              <ArrowRight className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="h-3 w-3" />
                              Move to bag
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border/80 p-4 sm:p-5 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={moveAllToBag}
              disabled={!canMoveAll}
              className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-neutral-900 dark:bg-white text-sm font-bold text-white dark:text-neutral-900 shadow-xs hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingBag className="h-4 w-4" />
              Move all to bag
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
