import React from "react";
import { X, Sparkles, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export function ExitIntentReminder() {
  const {
    isExitIntentOpen,
    dismissExitIntent,
    openCart,
    applyCoupon,
    items,
    total,
  } = useCart();

  if (!isExitIntentOpen || items.length === 0) return null;

  const handleClaimDiscount = () => {
    void applyCoupon("FAASBAY10");
    dismissExitIntent();
    openCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={dismissExitIntent}
      />

      {/* Gentle Modal Card */}
      <div
        role="dialog"
        aria-label="Your Cart is Saved"
        className="relative z-50 w-full max-w-sm overflow-hidden rounded-3xl bg-surface p-5 shadow-2xl border border-border animate-in zoom-in-95 duration-200 text-center"
      >
        {/* Close Button (Never traps the user) */}
        <button
          type="button"
          onClick={dismissExitIntent}
          aria-label="Dismiss reminder"
          className="absolute right-3.5 top-3.5 grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-500/15 text-amber-600">
          <Sparkles className="h-7 w-7" />
        </div>

        <h3 className="mt-3 font-sans text-base font-extrabold text-foreground">
          Wait! Your tech picks are saved
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Complete your order today and take an extra <strong>10% OFF</strong> your FaasBay bag.
        </p>

        {/* Coupon Code Pill */}
        <div className="mt-3.5 flex items-center justify-between rounded-2xl bg-secondary/50 border border-border/80 px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Tag className="h-4 w-4 text-primary" />
            <span>Use Code:</span>
          </div>
          <span className="font-mono text-xs font-black tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md">
            FAASBAY10
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleClaimDiscount}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-black text-white shadow-md shadow-primary/25 hover:opacity-90 active:scale-95 transition-all"
          >
            <span>Apply 10% & View Cart</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={dismissExitIntent}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground py-1"
          >
            No thanks, I'll continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}
