import React from "react";
import { Truck, RotateCcw, ShieldCheck, Headphones } from "lucide-react";

export function TrustGuaranteeStrip() {
  const guarantees = [
    {
      icon: Truck,
      title: "Free Shipping",
      desc: "On orders over ₹999",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      desc: "Within 7 days",
    },
    {
      icon: ShieldCheck,
      title: "Secure Payments",
      desc: "100% protected",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      desc: "We're here to help",
    },
  ];

  return (
    <section className="mx-auto max-w-[1280px] px-3 sm:px-6 py-2 select-none">
      <div className="rounded-2xl sm:rounded-3xl border border-black/[0.06] dark:border-white/10 bg-white/70 dark:bg-stone-900/60 backdrop-blur-md px-4 py-3.5 sm:py-4 shadow-2xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:divide-x md:divide-neutral-200/80 dark:md:divide-white/10">
          {guarantees.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-3 ${idx !== 0 ? "md:pl-4 lg:pl-6" : ""}`}
              >
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 border border-black/[0.04] dark:border-white/10">
                  <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5 stroke-[1.75]" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-[13px] font-bold text-neutral-900 dark:text-white leading-tight truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-tight truncate mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
