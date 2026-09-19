import React from "react";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
  Leaf,
  Hammer,
  Sun,
  Layers,
  Wrench,
} from "lucide-react";
import { useStorefrontCms, defaultEditorialCampaigns } from "@/lib/storefront-cms";

export function StudioCampaignBanner() {
  const { editorialBanners } = useStorefrontCms();

  const bannersToRender = editorialBanners && editorialBanners.length > 0 ? editorialBanners : defaultEditorialCampaigns;

  const handleScroll = (link?: string) => {
    if (link && link.startsWith("/")) {
      window.location.href = link;
      return;
    }
    const el = document.getElementById("catalog-section") || document.querySelector("main");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Color theme presets for alternating banners
  const themePresets = [
    {
      bg: "bg-gradient-to-r from-[#eef2f6] via-[#f3f6fa] to-[#eef2f6] dark:bg-[#151921]",
      border: "border-slate-200/90 dark:border-white/10",
      eyebrowColor: "text-slate-500 dark:text-slate-400",
      subColor: "text-slate-700 dark:text-slate-200",
      btnBg: "bg-[#1e293b] hover:bg-slate-800 dark:bg-white text-white dark:text-[#1e293b]",
      iconBg: "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200",
      borderDivide: "border-slate-300/70 dark:border-white/10",
    },
    {
      bg: "bg-gradient-to-r from-[#eff6ef] via-[#f4f9f4] to-[#eff6ef] dark:bg-[#141b16]",
      border: "border-emerald-200/70 dark:border-white/10",
      eyebrowColor: "text-emerald-700 dark:text-emerald-400",
      subColor: "text-emerald-800 dark:text-emerald-300",
      btnBg: "bg-emerald-800 hover:bg-emerald-900 dark:bg-white text-white dark:text-emerald-900",
      iconBg: "bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
      borderDivide: "border-emerald-200/80 dark:border-white/10",
    },
    {
      bg: "bg-gradient-to-r from-[#fbf5ed] via-[#fdf8f2] to-[#fbf5ed] dark:bg-[#1a1713]",
      border: "border-amber-200/80 dark:border-white/10",
      eyebrowColor: "text-amber-800 dark:text-amber-400",
      subColor: "text-amber-900 dark:text-amber-200",
      btnBg: "bg-amber-900 hover:bg-amber-950 dark:bg-white text-white dark:text-amber-950",
      iconBg: "bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300",
      borderDivide: "border-amber-200/80 dark:border-white/10",
    },
  ];

  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6 space-y-4 sm:space-y-4.5 lg:space-y-5 select-none">
      {bannersToRender.map((banner, index) => {
        const isEven = index % 2 === 0; // Even: Image on Left, Text on Right | Odd: Text on Left, Image on Right
        const theme = themePresets[index % themePresets.length];

        return (
          <div
            key={banner.id || index}
            className="relative z-10 group cursor-pointer"
            onClick={() => handleScroll(banner.ctaLink)}
          >
            {/* Pop-Out Image (Overlaps Border & Floats) */}
            <div
              className={`absolute -top-4 xs:-top-5 sm:-top-10 lg:-top-12 -bottom-2 sm:-bottom-5 z-30 w-36 xs:w-44 sm:w-56 md:w-68 lg:w-80 flex items-center justify-center pointer-events-none transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-105 ${
                isEven
                  ? "left-1 xs:left-2 sm:left-6 lg:left-10"
                  : "right-1 xs:right-2 sm:right-6 lg:right-10"
              }`}
            >
              <img
                src={banner.image || "/assets/banners/modern_chair.png"}
                alt={banner.title}
                className="w-full h-full object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.16)] dark:drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)]"
              />
            </div>

            {/* Banner Container (~180–220px on Mobile) */}
            <div
              className={`relative rounded-2xl sm:rounded-3xl ${theme.bg} ${theme.border} text-neutral-900 dark:text-white shadow-xs hover:shadow-lg transition-all duration-300 min-h-[175px] xs:min-h-[190px] sm:min-h-[195px] lg:min-h-[220px] p-4 xs:p-4.5 sm:p-6 lg:p-8 flex items-center ${
                isEven ? "justify-end" : "justify-between"
              } border overflow-visible`}
            >
              {/* If isEven: Left Spacer */}
              {isEven && (
                <div className="w-[36%] xs:w-[40%] sm:w-[44%] lg:w-[46%] shrink-0" />
              )}

              {/* Main Content & Feature Chips */}
              <div
                className={`flex-1 min-w-0 z-20 flex items-center ${
                  isEven
                    ? "justify-end gap-3 sm:gap-8 lg:gap-12 pl-1.5 sm:pl-4"
                    : "gap-3 sm:gap-8 pr-1.5 sm:pr-4"
                }`}
              >
                {/* Odd: Left Features on Desktop */}
                {!isEven && (
                  <div
                    className={`hidden lg:flex flex-col justify-center space-y-2.5 pr-6 border-r ${theme.borderDivide} shrink-0`}
                  >
                    {banner.features?.slice(0, 3).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2.5">
                        <div className={`grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full ${theme.iconBg}`}>
                          <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2]" />
                        </div>
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Text Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1 sm:space-y-1.5 max-w-sm">
                  <span className={`text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-widest ${theme.eyebrowColor}`}>
                    {banner.eyebrow || "FEATURED COLLECTION —"}
                  </span>

                  <div>
                    <h2 className="font-display text-sm xs:text-base sm:text-2xl lg:text-3xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
                      {banner.title}
                    </h2>
                    <p className={`font-display text-[11px] xs:text-xs sm:text-base lg:text-xl font-bold ${theme.subColor} tracking-tight leading-tight mt-0.5`}>
                      {banner.subtitle}
                    </p>
                  </div>

                  <p className="text-[10px] xs:text-[11px] sm:text-xs text-slate-600 dark:text-neutral-300 font-medium max-w-sm leading-relaxed line-clamp-1 sm:line-clamp-2">
                    {banner.description}
                  </p>

                  <div className="pt-0.5 sm:pt-1">
                    <span className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full ${theme.btnBg} px-3 py-1.5 xs:px-4 xs:py-1.5 sm:px-5 sm:py-2 text-[10px] xs:text-[11px] sm:text-xs font-bold shadow-xs active:scale-95 transition-all`}>
                      <span>{banner.ctaText || "Explore more"}</span>
                      <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[2.5]" />
                    </span>
                  </div>
                </div>

                {/* Even: Right Features on Desktop */}
                {isEven && (
                  <div
                    className={`hidden lg:flex flex-col justify-center space-y-2.5 pl-6 border-l ${theme.borderDivide} shrink-0`}
                  >
                    {banner.features?.slice(0, 3).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2.5">
                        <div className={`grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full ${theme.iconBg}`}>
                          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2]" />
                        </div>
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* If !isEven: Right Spacer */}
              {!isEven && (
                <div className="w-[34%] xs:w-[38%] sm:w-[44%] lg:w-[46%] shrink-0" />
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

