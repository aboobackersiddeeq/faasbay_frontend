import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Product } from "@/components/store/data";

const WISHLIST_STORAGE_KEY = "faasbay_wishlist_ids";

export function getStoredWishlistIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Error reading wishlist storage:", e);
  }
  return [];
}

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => getStoredWishlistIds());

  useEffect(() => {
    const sync = () => {
      setWishlistIds(getStoredWishlistIds());
    };
    window.addEventListener("faasbay_wishlist_updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("faasbay_wishlist_updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(String(productId)),
    [wishlistIds]
  );

  const toggleWishlist = useCallback((product: Product | { id: string; title?: string }) => {
    if (!product || !product.id) return;
    const prodId = String(product.id);
    const current = getStoredWishlistIds();
    const exists = current.includes(prodId);

    let next: string[];
    if (exists) {
      next = current.filter((id) => id !== prodId);
      toast.info(`Removed "${product.title || "item"}" from wishlist`);
    } else {
      next = [prodId, ...current];
      toast.success(`Added "${product.title || "item"}" to wishlist ❤️`);
    }

    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("faasbay_wishlist_updated"));
    } catch (e) {
      console.error("Failed writing wishlist:", e);
    }
  }, []);

  return {
    wishlistIds,
    wishlistCount: wishlistIds.length,
    isWishlisted,
    toggleWishlist,
  };
}
