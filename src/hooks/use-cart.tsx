import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Product } from "@/components/store/data";
import { API_ENDPOINTS } from "@/config/api";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string | undefined;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  pincode?: string;
  state?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  discountCode: string;
  appliedCoupon: string | null;
  shippingFee: number;
  total: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  isFreeShippingUnlocked: boolean;
  freeShippingProgress: number; // 0 to 100
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isAuthOpen: boolean;
  userProfile: UserProfile | null;
  selectedProductForDetail: Product | null;
  isExitIntentOpen: boolean;
  recentCategoryViews: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  quickNavFilter: string | null;
  setQuickNavFilter: (filter: string | null) => void;
  addToCart: (product: Product, quantity?: number, variant?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  buyNow: (product: Product, quantity?: number, variant?: string) => void;
  buyNowItem: CartItem | null;
  clearBuyNow: () => void;
  isBuyNow: boolean;
  checkoutItems: CartItem[];
  checkoutSubtotal: number;
  checkoutShippingFee: number;
  checkoutDiscount: number;
  checkoutCouponCode: string | null;
  checkoutTotal: number;
  checkoutItemCount: number;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginUser: (profile: UserProfile) => void;
  logoutUser: () => void;
  openProductDetail: (product: Product) => void;
  closeProductDetail: () => void;
  dismissExitIntent: () => void;
  recordCategoryView: (category: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 999;
const BASE_SHIPPING_FEE = 49;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("faasbay_cart");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load cart from storage", e);
      }
    }
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState<string>("");
  const [discountAmountState, setDiscountAmountState] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("faasbay_user");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load user profile", e);
      }
    }
    return null;
  });
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isExitIntentOpen, setIsExitIntentOpen] = useState(false);
  const [hasTriggeredExitIntent, setHasTriggeredExitIntent] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [quickNavFilter, setQuickNavFilter] = useState<string | null>(null);
  const [recentCategoryViews, setRecentCategoryViews] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("faasbay_recent_categories");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load recent categories", e);
      }
    }
    return ["ceramics", "baskets", "candles"];
  });

  const loginUser = (profile: UserProfile) => {
    setUserProfile(profile);
    if (typeof window !== "undefined") {
      localStorage.setItem("faasbay_user", JSON.stringify(profile));
    }
  };

  const logoutUser = () => {
    setUserProfile(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("faasbay_user");
    }
  };

  const openAuthModal = () => setIsAuthOpen(true);
  const closeAuthModal = () => setIsAuthOpen(false);

  // Persist cart to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("faasbay_cart", JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save cart", e);
      }
    }
  }, [items]);

  // Persist recent categories
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("faasbay_recent_categories", JSON.stringify(recentCategoryViews));
      } catch (e) {
        console.error("Failed to save categories", e);
      }
    }
  }, [recentCategoryViews]);

  // Re-validate the applied coupon whenever the cart total changes. A discount
  // amount computed for an earlier subtotal (before an item was added, removed,
  // or its quantity changed) goes stale immediately — a percentage discount no
  // longer matches the new subtotal, and a coupon's minimum-order rule may no
  // longer be met. Re-checking keeps what's displayed matching what checkout
  // will actually charge.
  useEffect(() => {
    if (!appliedCoupon || typeof window === "undefined") return;
    const currentSubtotal = items.reduce((sum, item) => sum + parsePrice(item.product.price) * item.quantity, 0);

    let cancelled = false;
    fetch(API_ENDPOINTS.couponsApply, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: appliedCoupon, cartSubtotal: currentSubtotal }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setDiscountAmountState(data.success && data.data ? data.data.discountAmount || 0 : 0);
      })
      .catch(() => {
        if (!cancelled) setDiscountAmountState(0);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedCoupon, items]);

  // Calculations safely
  const parsePrice = (priceStr: string | number) => {
    if (typeof priceStr === "number") return priceStr;
    const num = parseInt(String(priceStr || "0").replace(/[^\d]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  };

  const subtotal = items.reduce((sum, item) => {
    return sum + parsePrice(item.product.price) * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // The discount is always whatever the backend most recently validated for this
  // coupon against the current subtotal (see the re-validation effect below) —
  // never guessed client-side, so a deleted/expired/unknown code can never show
  // a discount that checkout won't actually honor.
  const calculatedDiscount = appliedCoupon ? discountAmountState : 0;

  const isFreeShippingUnlocked = subtotal >= FREE_SHIPPING_THRESHOLD && subtotal > 0;
  const shippingFee = subtotal === 0 || isFreeShippingUnlocked ? 0 : BASE_SHIPPING_FEE;
  const total = Math.max(0, subtotal - calculatedDiscount + shippingFee);

  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const addToCart = (product: Product, quantity = 1, variant?: string) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1 && prev[existingIdx]) {
        const updated = [...prev];
        const item = updated[existingIdx]!;
        updated[existingIdx] = { ...item, quantity: item.quantity + quantity };
        return updated;
      }
      return [...prev, { product, quantity, selectedVariant: variant }];
    });
    recordCategoryView(product.category || "ceramics");
    // Open cart drawer when item is added
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setDiscountAmountState(0);
  };

  // A coupon is only ever "applied" once the backend has confirmed it's real,
  // active, and meets its own rules (min order amount, etc.) against the
  // current subtotal — nothing here is decided client-side.
  const applyCoupon = async (code: string): Promise<boolean> => {
    const clean = code.trim().toUpperCase();
    if (!clean) return false;

    try {
      const res = await fetch(API_ENDPOINTS.couponsApply, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: clean, cartSubtotal: subtotal }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        setAppliedCoupon(clean);
        setDiscountCode(clean);
        setDiscountAmountState(data.data.discountAmount || 0);
        return true;
      }
    } catch (e) {
      console.error("Could not validate coupon:", e);
    }

    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountCode("");
    setDiscountAmountState(0);
  };

  // Active Checkout computations (support both cart checkout and single-item direct Buy Now)
  const isBuyNow = Boolean(buyNowItem);
  const checkoutItems = buyNowItem ? [buyNowItem] : items;
  const checkoutSubtotal = buyNowItem
    ? parsePrice(buyNowItem.product.price) * buyNowItem.quantity
    : subtotal;
  const checkoutItemCount = buyNowItem ? buyNowItem.quantity : itemCount;
  
  const isBuyNowFreeShipping = Boolean(
    buyNowItem &&
    (buyNowItem.product.freeShipping ||
      buyNowItem.product.deliveryType === "free" ||
      checkoutSubtotal >= FREE_SHIPPING_THRESHOLD)
  );

  const checkoutShippingFee = buyNowItem
    ? (isBuyNowFreeShipping || checkoutSubtotal === 0
      ? 0
      : (typeof buyNowItem.product.deliveryCharge === "number"
        ? buyNowItem.product.deliveryCharge
        : BASE_SHIPPING_FEE))
    : shippingFee;

  // A cart-level coupon was validated against the cart's own subtotal, which
  // "Buy Now" (a separate, single-item purchase) doesn't share — carrying it
  // over would show/charge a discount the coupon was never actually checked
  // against. Buy Now simply doesn't apply a coupon.
  const checkoutDiscount = buyNowItem ? 0 : calculatedDiscount;
  // The coupon code checkout actually sends the backend for validation —
  // never populated for Buy Now, matching the discount above.
  const checkoutCouponCode = buyNowItem ? null : appliedCoupon;

  const checkoutTotal = Math.max(0, checkoutSubtotal - checkoutDiscount + checkoutShippingFee);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const buyNow = (product: Product, quantity = 1, variant?: string) => {
    setBuyNowItem({ product, quantity, selectedVariant: variant });
    recordCategoryView(product.category || "ceramics");
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const clearBuyNow = () => {
    setBuyNowItem(null);
  };

  const openCheckout = () => {
    setBuyNowItem(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setBuyNowItem(null);
  };

  const openProductDetail = (product: Product) => {
    setSelectedProductForDetail(product);
    recordCategoryView(product.category || "ceramics");
  };
  const closeProductDetail = () => setSelectedProductForDetail(null);

  const dismissExitIntent = () => {
    setIsExitIntentOpen(false);
    setHasTriggeredExitIntent(true);
  };

  const recordCategoryView = (category: string) => {
    if (!category) return;
    setRecentCategoryViews((prev) => {
      const filtered = prev.filter((c) => c !== category);
      return [category, ...filtered].slice(0, 5);
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount: calculatedDiscount,
        discountCode,
        appliedCoupon,
        shippingFee,
        total,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountNeededForFreeShipping,
        isFreeShippingUnlocked,
        freeShippingProgress,
        isCartOpen,
        isCheckoutOpen,
        buyNowItem,
        isBuyNow,
        checkoutItems,
        checkoutSubtotal,
        checkoutShippingFee,
        checkoutDiscount,
        checkoutCouponCode,
        checkoutTotal,
        checkoutItemCount,
        isAuthOpen,
        userProfile,
        selectedProductForDetail,
        isExitIntentOpen,
        recentCategoryViews,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        quickNavFilter,
        setQuickNavFilter,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        buyNow,
        clearBuyNow,
        applyCoupon,
        removeCoupon,
        openCart,
        closeCart,
        openCheckout,
        closeCheckout,
        openAuthModal,
        closeAuthModal,
        loginUser,
        logoutUser,
        openProductDetail,
        closeProductDetail,
        dismissExitIntent,
        recordCategoryView,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
