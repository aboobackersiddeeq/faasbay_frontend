import React from "react";
import { Sparkles, Truck, ShieldCheck, Zap, RotateCcw, Award } from "lucide-react";

export interface MarqueeItem {
  icon: React.ReactNode;
  text: string;
  highlight?: string;
}

const marqueeItems: MarqueeItem[] = [
  {
    icon: <Truck className="h-3.5 w-3.5 text-neutral-300" />,
    text: "Free Express Delivery on Orders Above ₹999",
    highlight: "Free Shipping",
  },
  {
    icon: <Zap className="h-3.5 w-3.5 text-neutral-300" />,
    text: "Same-Day Dispatch from Bengaluru Hub for Orders Before 4 PM",
    highlight: "Fast Dispatch",
  },
  {
    icon: <Award className="h-3.5 w-3.5 text-neutral-300" />,
    text: "1-Year Official FaasBay Direct Brand Warranty",
    highlight: "1-Year Warranty",
  },
  {
    icon: <ShieldCheck className="h-3.5 w-3.5 text-neutral-300" />,
    text: "100% Safe Encrypted UPI, Cards & Instant NetBanking",
    highlight: "Secure Checkout",
  },
  {
    icon: <RotateCcw className="h-3.5 w-3.5 text-neutral-300" />,
    text: "7-Day Hassle-Free Doorstep Replacement Guarantee",
    highlight: "Easy Returns",
  },
  {
    icon: <Sparkles className="h-3.5 w-3.5 text-neutral-300" />,
    text: "50,000+ Verified Buyers · 4.9/5 Average Rating",
    highlight: "Top Rated",
  },
];

export function InfiniteMarqueeBanner() {
  // Duplicate array twice to ensure seamless continuous loop
  const displayItems = [...marqueeItems, ...marqueeItems];

  return (
    <div className="relative w-full overflow-hidden border-y border-stone-200/80 bg-stone-900 text-stone-100 py-2 dark:border-stone-800 dark:bg-stone-950 select-none">
      <div className="animate-marquee items-center gap-8 sm:gap-12">
        {displayItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-xs sm:text-[13px] font-medium tracking-tight whitespace-nowrap text-stone-200"
          >
            <span className="flex items-center justify-center">{item.icon}</span>
            <span>{item.text}</span>
            <span className="ml-4 sm:ml-6 text-stone-600 dark:text-stone-700">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
