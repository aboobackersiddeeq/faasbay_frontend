import faasbayLogo from "@/assets/faasbay-logo.png";
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Lock } from "lucide-react";
import { useStorefrontCms } from "@/lib/storefront-cms";

export function Footer() {
  const { footerData } = useStorefrontCms();

  return (
    <footer className="mt-8 sm:mt-12 border-t border-border bg-surface text-foreground pb-20 sm:pb-10">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-8 sm:pt-10">
        {/* Top Newsletter & Brand Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 pb-8 sm:pb-10 border-b border-border">
          <div className="lg:col-span-5 space-y-3">
            <a href="/" className="inline-block">
              <img src={faasbayLogo} alt="FaasBay" className="h-8 w-auto object-contain" />
            </a>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              {footerData?.description ||
                "Direct-to-consumer precision gadgets, studio acoustics, and smart lifestyle tech. Designed with care, warehoused directly, and backed by our 1-year guarantee."}
            </p>
          </div>

          {/* <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="rounded-2xl bg-secondary/50 p-4 sm:p-5 border border-border">
              <h4 className="font-display font-bold text-sm text-foreground">
                Join the FaasBay Dispatch
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                Be the first to access limited batch drops, studio stories, and seasonal releases.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 rounded-xl border border-input bg-surface px-3.5 py-2.5 sm:py-2 text-xs text-foreground outline-none focus:border-neutral-900 placeholder:text-muted-foreground font-medium"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 sm:py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div> */}
        </div>

        {/* 1. DESKTOP Navigation Columns (100% Intact & Untouched) */}
        <div className="hidden md:grid py-6 sm:py-8 grid-cols-4 gap-8">
          {(footerData?.columns || []).map((col) => (
            <div key={col.id || col.title} className="min-w-0">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
                {col.title}
              </h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((l, li) => {
                  const label = typeof l === "string" ? l : l.label;
                  const url = typeof l === "string" ? "#" : l.url;
                  return (
                    <li key={li}>
                      <a
                        href={url}
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground font-medium"
                      >
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* 2. MOBILE Compact Navigation Accordions */}
        <div className="block md:hidden py-4 divide-y divide-border">
          {(footerData?.columns || []).map((col, idx) => (
            <details key={col.id || col.title || idx} className="group py-2.5">
              <summary className="flex items-center justify-between text-xs font-bold text-foreground cursor-pointer list-none select-none">
                <span>{col.title}</span>
                <span className="text-muted-foreground transition-transform duration-200 group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <ul className="pt-2.5 pb-1 space-y-2 pl-1 animate-in fade-in duration-200">
                {col.links.map((l, li) => {
                  const label = typeof l === "string" ? l : l.label;
                  const url = typeof l === "string" ? "#" : l.url;
                  return (
                    <li key={li}>
                      <a
                        href={url}
                        className="text-[12px] text-muted-foreground transition-colors hover:text-foreground font-medium block py-0.5"
                      >
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
        </div>

        {/* Bottom Bar: Copyright, Trust Badges, Currency */}
        <div className="pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-[11px] sm:text-xs text-muted-foreground text-center sm:text-left">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" /> 100%
              Authentic Products
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Lock className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" /> 256-Bit SSL
              Checkout
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-end">
            <span>
              {footerData?.copyright || "© 2026 FaasBay Direct Store. All rights reserved."}
            </span>
            <span className="font-bold text-foreground">India (INR ₹)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
