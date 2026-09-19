import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useStoreProducts } from "./data";

export function DualPromoCampaignBanners() {
  const { openProductDetail } = useCart();
  const storeProducts = useStoreProducts();

  const handleBannerClick = (productId: string) => {
    const product = storeProducts.find((p) => p.id === productId) || storeProducts[0];
    if (product) openProductDetail(product);
  };

  return (
    <section className="mx-auto max-w-[1280px] px-3 sm:px-6 py-2 sm:py-3 select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        
        {/* Banner 1: Studio Acoustics */}
        <div
          onClick={() => handleBannerClick("p1")}
          className="group relative overflow-hidden rounded-[4px] border border-black/[0.06] dark:border-white/10 bg-[#f6f8fa] dark:bg-[#15181e] p-5 lg:p-7 flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all duration-300 min-h-[180px] sm:min-h-[210px]"
        >
          {/* Left Text Content */}
          <div className="relative z-10 flex flex-col justify-center space-y-1.5 max-w-[58%]">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#15803d] dark:text-[#4ade80]">
              <Sparkles className="h-3 w-3" />
              <span>Studio ANC Acoustics</span>
            </span>

            <h3 className="font-display text-lg sm:text-xl lg:text-[22px] font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
              Precision Sound. <br />
              <span className="text-neutral-500 dark:text-neutral-400 font-bold">Zero Distraction.</span>
            </h3>

            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-sm sm:text-base font-black text-neutral-900 dark:text-white">
                From ₹3,499
              </span>
              <span className="text-xs text-neutral-400 line-through">₹4,999</span>
            </div>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#15803d] dark:text-[#4ade80] group-hover:gap-2.5 transition-all">
                <span>SHOP AUDIO</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>

          {/* Right Product Image */}
          <div className="relative z-10 w-[38%] sm:w-[42%] aspect-square max-w-[170px] rounded-[3px] overflow-hidden shadow-xs bg-white dark:bg-stone-900 border border-black/[0.04] dark:border-white/10 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
              alt="Studio ANC Wireless Headphones"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Banner 2: Precision Desk Sanctuary */}
        <div
          onClick={() => handleBannerClick("p3")}
          className="group relative overflow-hidden rounded-[4px] border border-black/[0.06] dark:border-white/10 bg-[#f6f8fa] dark:bg-[#15181e] p-5 lg:p-7 flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all duration-300 min-h-[180px] sm:min-h-[210px]"
        >
          {/* Left Text Content */}
          <div className="relative z-10 flex flex-col justify-center space-y-1.5 max-w-[58%]">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Tactile Workspace</span>
            </span>

            <h3 className="font-display text-lg sm:text-xl lg:text-[22px] font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
              Type Faster. <br />
              <span className="text-neutral-500 dark:text-neutral-400 font-bold">Create Cleaner.</span>
            </h3>

            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-sm sm:text-base font-black text-neutral-900 dark:text-white">
                From ₹3,890
              </span>
              <span className="text-xs text-neutral-400 line-through">₹5,499</span>
            </div>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white group-hover:gap-2.5 transition-all">
                <span>EXPLORE SETUP</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>

          {/* Right Product Image */}
          <div className="relative z-10 w-[38%] sm:w-[42%] aspect-square max-w-[170px] rounded-[3px] overflow-hidden shadow-xs bg-white dark:bg-stone-900 border border-black/[0.04] dark:border-white/10 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=85"
              alt="Aviation Aluminium Mechanical Keyboard"
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
