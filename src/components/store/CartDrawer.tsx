import React, { useState } from "react";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    discountCode,
    appliedCoupon,
    shippingFee,
    total,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    isFreeShippingUnlocked,
    freeShippingProgress,
    isCartOpen,
    closeCart,
    openCheckout,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim() || isApplyingCoupon) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      const success = await applyCoupon(couponInput);
      if (success) {
        setCouponInput("");
      } else {
        setCouponError("Invalid or expired coupon code");
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={closeCart}
      />

      {/* Drawer Container (Slide-over on desktop, full-width on mobile) */}
      <aside
        role="dialog"
        aria-label="Shopping Cart Drawer"
        className="relative z-50 flex h-full w-full max-w-full sm:max-w-md flex-col bg-surface shadow-2xl transition-transform duration-300 animate-in slide-in-from-right rounded-none sm:rounded-l-3xl border-l border-border"
      >
        {/* 1. Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-4 sm:px-5 py-3.5 sm:py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-foreground" />
            <h2 className="font-sans text-base sm:text-lg font-bold text-foreground">
              Your Bag ({itemCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-95 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. FREE SHIPPING PROGRESS BAR */}
        <div className="border-b border-border/60 bg-secondary/30 px-4 sm:px-5 py-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-foreground">
              <Truck className="h-4 w-4 text-foreground shrink-0" />
              {isFreeShippingUnlocked ? (
                <span className="font-bold text-foreground">
                  ✓ You've unlocked FREE Express Delivery!
                </span>
              ) : (
                <span>
                  Add{" "}
                  <strong className="text-foreground font-black">
                    ₹{amountNeededForFreeShipping.toLocaleString("en-IN")}
                  </strong>{" "}
                  for FREE Delivery
                </span>
              )}
            </span>
            <span className="text-[11px] font-bold text-muted-foreground shrink-0">
              ₹{freeShippingThreshold} Goal
            </span>
          </div>

          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isFreeShippingUnlocked
                  ? "bg-neutral-900 dark:bg-white"
                  : "bg-neutral-800 dark:bg-neutral-200"
              }`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* 3. Items List or Empty State */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 sm:space-y-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-secondary/70 text-muted-foreground">
                <ShoppingBag className="h-9 w-9 opacity-50" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">
                Your cart is currently empty
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                Explore our curated precision acoustics, smart wearables, and tech gear.
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-neutral-900 px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:opacity-90 active:scale-95 cursor-pointer"
              >
                Start Exploring
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-2xl border border-border/80 bg-surface p-2.5 sm:p-3 shadow-2xs transition-all"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-18 w-18 sm:h-20 sm:w-20 shrink-0 rounded-xl object-cover bg-secondary/30"
                />

                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-sans text-xs sm:text-sm font-bold text-foreground line-clamp-2 leading-tight">
                      {product.title}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id)}
                      aria-label="Remove item"
                      className="grid h-9 w-9 min-h-[36px] min-w-[36px] place-items-center text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <span className="text-[10.5px] text-muted-foreground font-medium">
                    {product.shop || "FaasBay Direct"}
                  </span>

                  <div className="mt-1.5 flex items-center justify-between">
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

                    {/* Quantity Controls with >=44px tap zone */}
                    <div className="flex items-center rounded-lg border border-border bg-secondary/40">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        aria-label="Decrease quantity"
                        className="grid h-8.5 w-8.5 min-h-[36px] min-w-[36px] place-items-center text-foreground hover:bg-secondary active:scale-90 cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-2 text-xs font-black text-foreground">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        aria-label="Increase quantity"
                        className="grid h-8.5 w-8.5 min-h-[36px] min-w-[36px] place-items-center text-foreground hover:bg-secondary active:scale-90 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 4. Coupon Code & Cost Summary */}
        {items.length > 0 && (
          <div className="border-t border-border bg-surface px-4 sm:px-5 py-3.5 sm:py-4 space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {/* Coupon input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>
                      Coupon <strong>{appliedCoupon}</strong> applied (10% OFF)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Coupon (e.g. FAASBAY10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full rounded-xl border border-input bg-secondary/30 pl-8.5 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-neutral-900"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingCoupon}
                    className="min-h-[38px] rounded-xl bg-neutral-900 text-white px-3.5 text-xs font-bold hover:bg-neutral-800 active:scale-95 transition-transform cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isApplyingCoupon ? "Applying…" : "Apply"}
                  </button>
                </form>
              )}
              {couponError && (
                <p className="mt-1 text-[11px] font-semibold text-rose-500">
                  {couponError}
                </p>
              )}
            </div>

            {/* Price breakdown */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Discount (10%)</span>
                  <span>-₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Charges</span>
                <span className="font-semibold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                      FREE
                    </span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between border-t border-border/80 pt-2 text-base font-black text-foreground">
                <span>Total Amount</span>
                <span className="font-black text-foreground">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Inclusive of all taxes · No surprise charges at checkout
              </p>
            </div>

            {/* Checkout CTA in Thumb-Reach Zone (Unified Near-Black) */}
            <button
              type="button"
              onClick={openCheckout}
              className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 text-sm font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4 stroke-[2]" />
            </button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-3 text-[10.5px] font-medium text-muted-foreground pt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-foreground" /> 100% Safe Payment
              </span>
              <span className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-foreground" /> Cash on Delivery
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-foreground" /> 1-Year Warranty
              </span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
