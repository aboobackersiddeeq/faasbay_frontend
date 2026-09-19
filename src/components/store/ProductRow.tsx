import React, { useState, useEffect } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "./data";
import { useCart } from "@/hooks/use-cart";

export function ProductRow({
  title,
  subtitle,
  products,
  isDealsSection = false,
  badgeText,
  collectionKey,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  isDealsSection?: boolean;
  badgeText?: string;
  collectionKey?: string;
}) {
  const { setQuickNavFilter } = useCart();
  const isDealRow = isDealsSection || title.toLowerCase().includes("deal");

  // Real Urgency Live Countdown Timer (HH:MM:SS)
  const [timeLeft, setTimeLeft] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: "03",
    minutes: "45",
    seconds: "12",
  });

  useEffect(() => {
    if (!isDealRow) return;

    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const updateCountdown = () => {
      const current = new Date().getTime();
      const difference = endOfDay.getTime() - current;

      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({
          hours: String(hours).padStart(2, "0"),
          minutes: String(minutes).padStart(2, "0"),
          seconds: String(seconds).padStart(2, "0"),
        });
      } else {
        setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isDealRow]);

  const handleViewAll = () => {
    if (collectionKey) {
      setQuickNavFilter(collectionKey);
    } else if (title.toLowerCase().includes("trend")) {
      setQuickNavFilter("trending");
    } else if (title.toLowerCase().includes("best")) {
      setQuickNavFilter("best-sellers");
    } else if (title.toLowerCase().includes("deal") || isDealsSection) {
      setQuickNavFilter("todays-deals");
    } else if (title.toLowerCase().includes("desk") || title.toLowerCase().includes("work")) {
      setQuickNavFilter("offers");
    } else {
      setQuickNavFilter(null);
    }
    const catalog = document.getElementById("catalog-section") || document.querySelector("main");
    if (catalog) catalog.scrollIntoView({ behavior: "smooth" });
  };

  // Show up to 10 items on homepage (2 full rows of 5 on desktop)
  const visibleProducts = products.slice(0, 10);

  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 py-4 sm:py-6 select-none">
      {/* Section Header — Clean App Layout */}
      <div className="flex items-end justify-between gap-2 pb-2.5 sm:pb-4 border-b border-black/[0.05] dark:border-white/10 mb-3 sm:mb-6">
        <div className="min-w-0 flex-1">
          {badgeText && (
            <div className="flex items-center gap-1 text-[10px] sm:text-[10.5px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-0.5">
              <span>{badgeText}</span>
            </div>
          )}

          <h2 className="font-display text-lg sm:text-2xl lg:text-[26px] font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 text-[11.5px] sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Action: Live Urgency Timer & "VIEW ALL" Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isDealRow && (
            <div className="flex items-center gap-1 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-bold shadow-xs">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[2.2px] opacity-80" />
              <span className="hidden sm:inline font-medium opacity-80">Ends in</span>
              <span className="font-mono tracking-wider">
                {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleViewAll}
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 hover:text-neutral-500 dark:hover:text-slate-400 transition-colors py-1 cursor-pointer select-none group"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Clean Responsive Product Grid (2 cols on mobile, 3 on sm, 4 on md, 5 on lg - up to 2 full rows) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {visibleProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
