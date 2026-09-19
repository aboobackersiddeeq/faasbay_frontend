import React, { useState } from "react";
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  ShoppingBag,
  ShoppingCart,
  TicketPercent,
  Check,
  ArrowRight,
} from "lucide-react";
import { useStorefrontCms, defaultFeaturedCoupon } from "@/lib/storefront-cms";

export function TrustFeatures() {
  const [claimed, setClaimed] = useState(false);
  const { featuredCoupon = defaultFeaturedCoupon } = useStorefrontCms();

  const handleClaimOffer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const codeToCopy = featuredCoupon?.code || "FAASBAY15";
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(codeToCopy).catch(() => {});
      }
    } catch {
      // clipboard fallback
    }
    setClaimed(true);
    setTimeout(() => setClaimed(false), 2400);
  };

  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 py-3 sm:py-4 select-none">
      {/* ========================================================= */}
      {/* 1. SPECIAL OFFER / FIRST ORDER COUPON BANNER               */}
      {/* (Styled with FaasBay brand green & charcoal color palette) */}
      {/* ========================================================= */}
      {featuredCoupon.active !== false && (
        <div className="relative overflow-hidden rounded-3xl border border-[#dceadd] dark:border-white/10 bg-gradient-to-r from-[#f4f9f4] via-[#fbfdfb] to-[#f4f9f4] dark:from-[#111612] dark:via-[#161f18] dark:to-[#111612] p-4 sm:p-6 lg:px-8 shadow-xs">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
            
            {/* LEFT: Offer Headline, Icon Badge & Claim Button */}
            <div className="flex items-center gap-3.5 sm:gap-4.5 w-full lg:w-auto justify-between sm:justify-start">
              {/* FaasBay Brand Circular Icon Badge */}
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-[#15803d] text-white shadow-sm ring-4 ring-[#15803d]/15">
                <TicketPercent className="h-7 w-7 sm:h-8 sm:w-8 stroke-[1.8]" />
              </div>

              {/* Offer Copy & CTA */}
              <div className="space-y-1 sm:space-y-1.5 min-w-0">
                <span className="block text-xs sm:text-[13px] font-extrabold text-[#15803d] dark:text-[#4ade80] tracking-tight">
                  {featuredCoupon.badgeText || "Special Offer"}
                </span>

                <h3 className="font-display text-lg sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight leading-none">
                  {featuredCoupon.headline || "Get 15% Off"}
                </h3>

                <p className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  {featuredCoupon.subtitle || "On Your First Order!"}
                </p>

                <div className="pt-1">
                  <button
                    id="claim-offer-btn"
                    type="button"
                    onClick={handleClaimOffer}
                    aria-label={claimed ? `Coupon ${featuredCoupon.code} copied` : `Claim ${featuredCoupon.code} coupon`}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer shadow-xs ${
                      claimed
                        ? "bg-[#15803d] text-white ring-2 ring-[#4ade80]/50 shadow-emerald-500/20"
                        : "bg-[#15803d] hover:bg-[#166534] text-white hover:gap-2"
                    }`}
                  >
                    {claimed ? (
                      <>
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>COPIED {featuredCoupon.code}</span>
                      </>
                    ) : (
                      <>
                        <span>{featuredCoupon.buttonText || "CLAIM OFFER"}</span>
                        <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Scalloped Brand Badge on Mobile (Visible only on mobile screen) */}
              <div className="flex lg:hidden shrink-0 items-center justify-center">
                <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center">
                  {/* Scalloped 12-point Star Background */}
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 h-full w-full fill-[#15803d] drop-shadow-xs"
                  >
                    <path d="M50 0 C53 10 60 14 70 12 C77 20 83 26 88 35 C90 45 96 50 96 56 C93 66 90 73 83 80 C74 84 69 91 59 93 C49 96 43 96 36 91 C27 88 20 83 15 74 C11 65 6 60 5 50 C5 40 10 33 15 25 C23 20 28 12 38 10 C44 5 47 1 50 0 Z" />
                  </svg>
                  <div className="relative z-10 flex flex-col items-center justify-center text-white leading-none">
                    <span className="font-black text-xs sm:text-sm tracking-tight">
                      {featuredCoupon.discountValue?.replace("%", "") || "15"}%
                    </span>
                    <span className="font-extrabold text-[9px] sm:text-[10px] uppercase">OFF</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE: 3-Step Guided Process (Shop -> Add to Cart -> Get Discount) */}
            <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 lg:gap-6 w-full lg:w-auto py-2.5 lg:py-0 border-t border-b lg:border-0 border-[#dceadd]/80 dark:border-white/10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center space-y-1">
                <div className="text-[#15803d] dark:text-[#4ade80]">
                  <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8]" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] sm:text-xs font-bold text-neutral-900 dark:text-white leading-tight">
                    Shop
                  </span>
                  <span className="block text-[9.5px] sm:text-[10.5px] text-neutral-500 dark:text-neutral-400 leading-tight">
                    Your Favorites
                  </span>
                </div>
              </div>

              {/* Step Arrow */}
              <span className="text-[#15803d]/50 dark:text-[#4ade80]/50 text-xs sm:text-sm font-bold">→</span>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center space-y-1">
                <div className="text-[#15803d] dark:text-[#4ade80]">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8]" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] sm:text-xs font-bold text-neutral-900 dark:text-white leading-tight">
                    Add to Cart
                  </span>
                  <span className="block text-[9.5px] sm:text-[10.5px] text-neutral-500 dark:text-neutral-400 leading-tight">
                    Easily
                  </span>
                </div>
              </div>

              {/* Step Arrow */}
              <span className="text-[#15803d]/50 dark:text-[#4ade80]/50 text-xs sm:text-sm font-bold">→</span>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center space-y-1">
                <div className="text-[#15803d] dark:text-[#4ade80]">
                  <TicketPercent className="h-5 w-5 sm:h-6 sm:w-6 stroke-[1.8]" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] sm:text-xs font-bold text-neutral-900 dark:text-white leading-tight">
                    Get Discount
                  </span>
                  <span className="block text-[9.5px] sm:text-[10.5px] text-neutral-500 dark:text-neutral-400 leading-tight">
                    On Checkout
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT: Scalloped Brand Starburst Badge (Desktop) */}
            <div className="hidden lg:flex shrink-0 items-center justify-center">
              <div className="relative flex h-20 w-20 xl:h-22 xl:w-22 items-center justify-center transform hover:scale-105 transition-transform duration-300">
                {/* Scalloped Starburst Shape */}
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 h-full w-full fill-[#15803d] drop-shadow-md"
                >
                  <path d="M50 0 C54 11 63 15 74 13 C81 22 87 28 92 38 C94 48 100 53 100 60 C97 70 94 77 86 85 C77 89 72 96 61 98 C51 100 45 100 37 95 C28 92 21 86 16 77 C12 67 6 62 5 52 C5 41 10 34 16 26 C24 21 29 13 40 10 C46 5 48 1 50 0 Z" />
                </svg>
                <div className="relative z-10 flex flex-col items-center justify-center text-white leading-none">
                  <span className="font-display font-black text-xl xl:text-2xl tracking-tight">
                    {featuredCoupon.discountValue?.replace("%", "") || "15"}%
                  </span>
                  <span className="font-sans font-extrabold text-xs xl:text-sm uppercase tracking-wider pt-0.5">
                    OFF
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. BOTTOM HORIZONTAL TRUST STRIP (UNTOUCHED / PRESERVED)   */}
      {/* ========================================================= */}
      <div className="mt-3.5 sm:mt-5 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5 lg:divide-x lg:divide-border">
        {/* Item 1: Free Shipping */}
        <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 lg:px-6 rounded-xl bg-surface border border-border/80 lg:border-0 shadow-2xs">
          <div className="flex h-8.5 w-8.5 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
            <Truck className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2px]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[11.5px] sm:text-sm font-bold text-foreground truncate">
              Express Delivery
            </h3>
            <p className="text-[9.5px] sm:text-[11px] text-muted-foreground font-medium truncate">
              Free on orders ₹999+
            </p>
          </div>
        </div>

        {/* Item 2: Easy Returns */}
        <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 lg:px-6 rounded-xl bg-surface border border-border/80 lg:border-0 shadow-2xs">
          <div className="flex h-8.5 w-8.5 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2px]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[11.5px] sm:text-sm font-bold text-foreground truncate">
              7-Day Returns
            </h3>
            <p className="text-[9.5px] sm:text-[11px] text-muted-foreground font-medium truncate">
              Doorstep swap & pickup
            </p>
          </div>
        </div>

        {/* Item 3: Secure Payments */}
        <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 lg:px-6 rounded-xl bg-surface border border-border/80 lg:border-0 shadow-2xs">
          <div className="flex h-8.5 w-8.5 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
            <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2px]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[11.5px] sm:text-sm font-bold text-foreground truncate">
              1-Year Brand Warranty
            </h3>
            <p className="text-[9.5px] sm:text-[11px] text-muted-foreground font-medium truncate">
              Official FaasBay Direct
            </p>
          </div>
        </div>

        {/* Item 4: 24/7 Support */}
        <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 lg:px-6 rounded-xl bg-surface border border-border/80 lg:border-0 shadow-2xs">
          <div className="flex h-8.5 w-8.5 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
            <Headphones className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2px]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[11.5px] sm:text-sm font-bold text-foreground truncate">
              Direct Support
            </h3>
            <p className="text-[9.5px] sm:text-[11px] text-muted-foreground font-medium truncate">
              24/7 Dedicated assistance
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
