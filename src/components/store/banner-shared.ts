import type React from "react";
import { useCart } from "@/hooks/use-cart";
import { useStoreProducts } from "@/components/store/data";

// Shared look & click behaviour for the storefront promo banners
// (DualHeroBanner, AutoSlidingSpotlight)

export interface BannerTheme {
  bg: string;
  title: string;
  body: string;
  cta: string;
}

// Soft pastel palettes rotated across cards (alternating cool/warm so side-by-side
// cards contrast); every card shares one dark-mode look. Cycles after the last one.
export const BANNER_THEMES: BannerTheme[] = [
  {
    bg: "from-[#e4f3fc] via-[#d3ebf8] to-[#bcdff3]",
    title: "text-[#0f2d5c]",
    body: "text-[#2b5a8a]",
    cta: "text-[#0f2d5c] shadow-[0_10px_30px_-10px_rgba(15,45,92,0.45)]",
  },
  {
    bg: "from-[#fbf0ec] via-[#f7e3dc] to-[#f0d2c7]",
    title: "text-[#5a261a]",
    body: "text-[#8a4a3a]",
    cta: "text-[#5a261a] shadow-[0_10px_30px_-10px_rgba(90,38,26,0.4)]",
  },
  {
    bg: "from-[#e9f6f0] via-[#d7eee4] to-[#c2e4d5]",
    title: "text-[#113e31]",
    body: "text-[#2f6b58]",
    cta: "text-[#113e31] shadow-[0_10px_30px_-10px_rgba(17,62,49,0.4)]",
  },
  {
    bg: "from-[#f0ecfb] via-[#e4ddf7] to-[#d3c9f1]",
    title: "text-[#2b2160]",
    body: "text-[#554a93]",
    cta: "text-[#2b2160] shadow-[0_10px_30px_-10px_rgba(43,33,96,0.4)]",
  },
  // Amber
  {
    bg: "from-[#fdf5e6] via-[#fbebcf] to-[#f6dcae]",
    title: "text-[#5c3a0a]",
    body: "text-[#8a5f22]",
    cta: "text-[#5c3a0a] shadow-[0_10px_30px_-10px_rgba(92,58,10,0.4)]",
  },
  // Teal
  {
    bg: "from-[#e5f6f6] via-[#d0eeee] to-[#b6e2e3]",
    title: "text-[#0d4144]",
    body: "text-[#2a6c70]",
    cta: "text-[#0d4144] shadow-[0_10px_30px_-10px_rgba(13,65,68,0.4)]",
  },
  // Rose
  {
    bg: "from-[#fdeef3] via-[#fadde8] to-[#f4c8d8]",
    title: "text-[#5e1934]",
    body: "text-[#8e3f5c]",
    cta: "text-[#5e1934] shadow-[0_10px_30px_-10px_rgba(94,25,52,0.4)]",
  },
  // Slate
  {
    bg: "from-[#eef1f5] via-[#e1e6ed] to-[#cfd7e2]",
    title: "text-[#1e293b]",
    body: "text-[#475569]",
    cta: "text-[#1e293b] shadow-[0_10px_30px_-10px_rgba(30,41,59,0.4)]",
  },
  // Butter
  {
    bg: "from-[#fdfae8] via-[#faf2c9] to-[#f3e6a4]",
    title: "text-[#4d4208]",
    body: "text-[#7a6a1f]",
    cta: "text-[#4d4208] shadow-[0_10px_30px_-10px_rgba(77,66,8,0.4)]",
  },
  // Periwinkle
  {
    bg: "from-[#ebeffd] via-[#dae2fa] to-[#c3d0f5]",
    title: "text-[#1c2a6b]",
    body: "text-[#43539a]",
    cta: "text-[#1c2a6b] shadow-[0_10px_30px_-10px_rgba(28,42,107,0.4)]",
  },
  // Coral
  {
    bg: "from-[#fef0ec] via-[#fcdcd3] to-[#f7c3b5]",
    title: "text-[#651f10]",
    body: "text-[#94452f]",
    cta: "text-[#651f10] shadow-[0_10px_30px_-10px_rgba(101,31,16,0.4)]",
  },
  // Sage
  {
    bg: "from-[#f0f4ea] via-[#e2ebd6] to-[#cfddbd]",
    title: "text-[#2c3d17]",
    body: "text-[#56693c]",
    cta: "text-[#2c3d17] shadow-[0_10px_30px_-10px_rgba(44,61,23,0.4)]",
  },
  // Orchid
  {
    bg: "from-[#f8edf9] via-[#f0dcf2] to-[#e4c5e8]",
    title: "text-[#4a1a52]",
    body: "text-[#774180]",
    cta: "text-[#4a1a52] shadow-[0_10px_30px_-10px_rgba(74,26,82,0.4)]",
  },
  // Aqua
  {
    bg: "from-[#e6f8fb] via-[#cff0f6] to-[#b2e5ee]",
    title: "text-[#083f4d]",
    body: "text-[#256a7b]",
    cta: "text-[#083f4d] shadow-[0_10px_30px_-10px_rgba(8,63,77,0.4)]",
  },
  // Sand
  {
    bg: "from-[#f8f3ec] via-[#efe5d7] to-[#e3d4be]",
    title: "text-[#45351f]",
    body: "text-[#735f43]",
    cta: "text-[#45351f] shadow-[0_10px_30px_-10px_rgba(69,53,31,0.4)]",
  },
  // Ice
  {
    bg: "from-[#f1f6fa] via-[#e4edf4] to-[#d2e0eb]",
    title: "text-[#12324a]",
    body: "text-[#3c5d77]",
    cta: "text-[#12324a] shadow-[0_10px_30px_-10px_rgba(18,50,74,0.4)]",
  },
];

export const BANNER_DARK_BG = "dark:from-[#131a27] dark:via-[#172033] dark:to-[#1d2a42]";
export const DEFAULT_BANNER_LINK = "/#catalog-section";

export function scrollToHash(link: string) {
  const id = link.slice(link.indexOf("#") + 1);
  const target = id ? document.getElementById(id) : null;
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  else window.location.href = link;
}

/**
 * Returns an onClick factory that follows a banner's CMS link. Product links open the
 * quick-view like the other carousels; hash links scroll smoothly; anything else
 * navigates normally.
 */
export function useBannerClick() {
  const { openProductDetail } = useCart();
  const storeProducts = useStoreProducts();

  return (link: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let "open in new tab" work

    const productMatch = link.match(/^\/product\/([^/?#]+)/);
    if (productMatch) {
      const product = storeProducts.find((p) => p.id === decodeURIComponent(productMatch[1]!));
      e.preventDefault();
      if (product) openProductDetail(product);
      // Stale product link (e.g. the product was deleted) — fall back to the catalog.
      else scrollToHash(DEFAULT_BANNER_LINK);
      return;
    }

    const onThisPage =
      link.startsWith("#") || (link.startsWith("/#") && window.location.pathname === "/");
    if (onThisPage) {
      e.preventDefault();
      scrollToHash(link);
    }
  };
}
