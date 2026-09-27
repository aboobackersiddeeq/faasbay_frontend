import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
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

function writeWishlistIds(next: string[]) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("faasbay_wishlist_updated"));
  } catch (e) {
    console.error("Failed writing wishlist:", e);
  }
}

// ---------------------------------------------------------------------------
// Wishlist drawer open state — shared by the header, mobile tab bar and the
// drawer itself (mounted once in __root).
// ---------------------------------------------------------------------------
let wishlistDrawerOpen = false;
const drawerListeners = new Set<() => void>();

function setWishlistDrawerOpen(open: boolean) {
  wishlistDrawerOpen = open;
  drawerListeners.forEach((l) => l());
}

export const openWishlist = () => setWishlistDrawerOpen(true);
export const closeWishlist = () => setWishlistDrawerOpen(false);

export function useWishlistDrawer() {
  const isOpen = useSyncExternalStore(
    (listener) => {
      drawerListeners.add(listener);
      return () => drawerListeners.delete(listener);
    },
    () => wishlistDrawerOpen,
    () => false,
  );
  return { isWishlistOpen: isOpen, openWishlist, closeWishlist };
}

export function useWishlist() {
  // Start empty and read storage after mount so server and client render match.
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      setWishlistIds(getStoredWishlistIds());
    };
    sync();
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

    writeWishlistIds(next);
  }, []);

  /** Removes without a toast — used when moving an item to the bag. */
  const removeFromWishlist = useCallback((productId: string) => {
    writeWishlistIds(getStoredWishlistIds().filter((id) => id !== String(productId)));
  }, []);

  const clearWishlist = useCallback(() => {
    writeWishlistIds([]);
  }, []);

  return {
    wishlistIds,
    wishlistCount: wishlistIds.length,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
  };
}
