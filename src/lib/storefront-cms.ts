// ============================================================================
// FaasBay Commerce OS — Storefront CMS (MongoDB-backed)
// ============================================================================
//
// Every block below is stored in MongoDB and served by GET /api/storefront.
// The `default*` exports are *first-paint fallbacks only* — they render while the
// first request is in flight and if the API is unreachable. They are never written
// to, and the database is the single source of truth.

import { useCallback } from "react";
import { API_ENDPOINTS } from "@/config/api";
import { api } from "./api-client";
import { createRemoteStore, useRemoteStore } from "./remote-store";

export interface FeaturedCouponConfig {
  code: string;
  headline: string;
  subtitle: string;
  discountValue: string;
  badgeText: string;
  buttonText: string;
  active: boolean;
}

export interface DualHeroSlidePair {
  id: string;
  left: {
    id: string;
    title: string;
    brand: string;
    tag: string;
    price: string;
    subtitle: string;
    cta: string;
    image: string;
    link?: string;
  };
  right: {
    id: string;
    title: string;
    brand: string;
    tag: string;
    price: string;
    subtitle: string;
    cta: string;
    image: string;
    link?: string;
  };
}

export interface SpotlightSlideItem {
  id: string;
  columnId: "col-1" | "col-2" | "col-3";
  columnTitle: string;
  badgeTitle: string;
  subtitle: string;
  price: string;
  tagRibbon: string;
  image: string;
  link?: string;
}

export interface EditorialCampaignItem {
  id: string;
  tierTitle: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  accentBg?: string;
}

export interface HomepageSectionConfig {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  sortOrder: number;
  badge?: string;
  merchandisingMode?: "Manual" | "Latest" | "Best Selling" | "Trending" | "Highest Rated" | "Discounted" | string;
}

export interface FooterColumnItem {
  id: string;
  title: string;
  links: { label: string; url: string }[];
}

export interface StorefrontFooterConfig {
  description: string;
  columns: FooterColumnItem[];
  legalLinks: { label: string; url: string }[];
  socialLinks: Record<string, string>;
  contactEmail: string;
  contactPhone: string;
  copyright: string;
}

export interface StorefrontNavLink {
  id: string;
  label: string;
  url: string;
  type: "header" | "secondary" | "category" | "footer";
  sortOrder: number;
  visible: boolean;
  parentId?: string;
  icon?: string;
}

export interface StorefrontPageItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: "page" | "legal" | "faq" | "blog";
  status: "Published" | "Draft" | "Scheduled";
  publishDate?: string;
  metaTitle?: string;
  metaDescription?: string;
  lastUpdated: string;
  updatedBy?: string;
}
export const defaultHomepageSections: HomepageSectionConfig[] = [
  { id: "sec-hero", name: "Dual Hero Carousel Banners", type: "banner_carousel", visible: true, sortOrder: 1, badge: "Top Showcase" },
  { id: "sec-catnav", name: "Category Navigation Bar", type: "category_pills", visible: true, sortOrder: 2, badge: "Duotone Icons" },
  { id: "sec-curated", name: "Curated For You (Personalised)", type: "product_slider", visible: true, sortOrder: 3, badge: "Smart Recs", merchandisingMode: "Latest" },
  { id: "sec-trending", name: "Trending Now", type: "product_slider", visible: true, sortOrder: 4, badge: "Best Finds", merchandisingMode: "Trending" },
  { id: "sec-bestsellers", name: "Best Sellers", type: "product_slider", visible: true, sortOrder: 5, badge: "Top Rated", merchandisingMode: "Popular" },
  { id: "sec-spotlight", name: "Auto-Sliding Promo Banners", type: "commercial_banners", visible: true, sortOrder: 6, badge: "High-Impact" },
  { id: "sec-flash", name: "Today's Flash Deals", type: "product_slider", visible: true, sortOrder: 7, badge: "Timer", merchandisingMode: "Discounted" },
  { id: "sec-promo2", name: "Editorial Campaign Banners", type: "split_banners", visible: true, sortOrder: 8, badge: "Artisan" },
  { id: "sec-desk", name: "Desk & Workspace Essentials", type: "product_slider", visible: true, sortOrder: 9, badge: "Creator Setup", merchandisingMode: "Manual" },
  { id: "sec-footer", name: "Footer & Newsletter", type: "footer", visible: true, sortOrder: 10, badge: "Fixed" },
];

export const defaultFooterData: StorefrontFooterConfig = {
  description: "FaasBay — Precision hardware for modern creators. Direct-to-consumer studio acoustics, mechanical keyboards, titanium wearables, and fast chargers.",
  columns: [
    { id: "c1", title: "Shop & Discover", links: [{ label: "Audio & Acoustics", url: "/#catalog-section" }, { label: "Studio Keyboards", url: "/#catalog-section" }, { label: "Smart Wearables", url: "/#catalog-section" }, { label: "Fast Chargers", url: "/#catalog-section" }, { label: "Desk Tech", url: "/#catalog-section" }] },
    { id: "c2", title: "Our Story", links: [{ label: "About FaasBay", url: "/about" }, { label: "Design Philosophy", url: "/about" }, { label: "Direct Fulfillment", url: "/about" }, { label: "Quality Assurance", url: "/about" }, { label: "Careers", url: "/about" }] },
    { id: "c3", title: "Client Support", links: [{ label: "Track Your Order", url: "/admin/orders" }, { label: "Shipping & Delivery", url: "/shipping-policy" }, { label: "7-Day Returns", url: "/refund-policy" }, { label: "Warranty Claim", url: "/terms-of-service" }, { label: "Contact Support", url: "/contact" }] },
    { id: "c4", title: "Legal & Privacy", links: [{ label: "Terms of Service", url: "/terms-of-service" }, { label: "Privacy Policy", url: "/privacy-policy" }, { label: "Refund Policy", url: "/refund-policy" }, { label: "Shipping Policy", url: "/shipping-policy" }] },
  ],
  legalLinks: [
    { label: "Privacy Policy", url: "/privacy-policy" },
    { label: "Terms of Service", url: "/terms-of-service" },
    { label: "Refund Policy", url: "/refund-policy" },
  ],
  socialLinks: {
    instagram: "https://instagram.com/faasbay",
    facebook: "https://facebook.com/faasbay",
    twitter: "https://twitter.com/faasbay",
  },
  contactEmail: "support@faasbay.com",
  contactPhone: "+91 98765 00000",
  copyright: "© 2026 FaasBay Direct Store. All rights reserved.",
};

export const defaultNavLinksList: StorefrontNavLink[] = [
  { id: "nav-1", label: "All Products", url: "/#catalog-section", type: "header", sortOrder: 1, visible: true },
  { id: "nav-2", label: "Audio & ANC", url: "/#catalog-section", type: "header", sortOrder: 2, visible: true },
  { id: "nav-3", label: "Wearables", url: "/#catalog-section", type: "header", sortOrder: 3, visible: true },
  { id: "nav-4", label: "Mechanical Keyboards", url: "/#catalog-section", type: "header", sortOrder: 4, visible: true },
  { id: "nav-5", label: "Flash Deals", url: "/#flash-deals", type: "header", sortOrder: 5, visible: true },
  { id: "nav-f1", label: "About Us", url: "/about", type: "footer", sortOrder: 1, visible: true },
  { id: "nav-f2", label: "Privacy Policy", url: "/privacy", type: "footer", sortOrder: 2, visible: true },
  { id: "nav-f3", label: "Terms of Service", url: "/terms", type: "footer", sortOrder: 3, visible: true },
  { id: "nav-f4", label: "Refund Policy", url: "/refund", type: "footer", sortOrder: 4, visible: true },
];

export const defaultPagesList: StorefrontPageItem[] = [
  { id: "privacy-policy", title: "Privacy & Data Protection Policy", slug: "privacy-policy", type: "legal", content: "FaasBay Studio is dedicated to safeguarding user privacy. We process personal and payment information securely using 256-bit encryption. No user data is shared with third parties without express consent.", status: "Published", lastUpdated: "Sep 01, 2026", updatedBy: "Kamisato Aya" },
  { id: "terms-of-service", title: "Terms of Service & Warranty", slug: "terms-of-service", type: "legal", content: "All hardware sold via FaasBay Studio is protected by a 1-year official brand warranty. Orders are dispatched within 24 hours. Replacement is available for transit-damaged goods.", status: "Published", lastUpdated: "Aug 28, 2026", updatedBy: "Kamisato Aya" },
  { id: "refund-policy", title: "7-Day Easy Returns & Refund Policy", slug: "refund-policy", type: "legal", content: "Customers may initiate a return within 7 days of delivery. Full refunds are processed to the original payment method within 48 business hours.", status: "Published", lastUpdated: "Aug 20, 2026", updatedBy: "Dev Sharma" },
  { id: "shipping-policy", title: "Shipping & Delivery Policy", slug: "shipping-policy", type: "legal", content: "Free shipping on all orders above ₹999. Standard delivery within 3-5 business days. Express delivery available in metro cities.", status: "Published", lastUpdated: "Aug 15, 2026", updatedBy: "Kamisato Aya" },
  { id: "about-us", title: "About FaasBay Studio", slug: "about-us", type: "page", content: "FaasBay is a boutique technology studio dedicated to crafting tactile, minimalist, and acoustically rich hardware for modern creators, engineers, and everyday enthusiasts.", status: "Published", lastUpdated: "Aug 15, 2026", updatedBy: "Kamisato Aya" },
  { id: "contact-us", title: "Contact Us", slug: "contact-us", type: "page", content: "Email: support@faasbay.com | Phone: +91 98765 00000 | Hours: Mon-Sat, 9 AM - 6 PM IST", status: "Published", lastUpdated: "Aug 10, 2026", updatedBy: "Dev Sharma" },
  { id: "faq", title: "Frequently Asked Questions", slug: "faq", type: "faq", content: "Q: What is the warranty period? A: All products come with a 1-year official warranty.\nQ: How long does shipping take? A: 3-5 business days for standard delivery.\nQ: Can I return a product? A: Yes, within 7 days of delivery.", status: "Published", lastUpdated: "Aug 05, 2026", updatedBy: "Meera Nambiar" },
];

export const defaultHeroPairs: DualHeroSlidePair[] = [
  {
    id: "pair-1",
    left: {
      id: "h1",
      title: "Titanium Ultra Watch",
      brand: "FaasBay Bio",
      tag: "Flagship",
      price: "₹4,299",
      subtitle: "Sapphire Crystal AMOLED · 14-Day Battery",
      cta: "Shop Now",
      image: "/assets/banners/watch.png",
      link: "/product/p2",
    },
    right: {
      id: "h2",
      title: "MagSafe 3-in-1 Dock",
      brand: "FaasBay Power",
      tag: "Top Rated",
      price: "₹1,890",
      subtitle: "Fast Wireless Charging Stand for Phone & Watch",
      cta: "Explore",
      image: "/assets/banners/dock.png",
      link: "/product/p4",
    },
  },
  {
    id: "pair-2",
    left: {
      id: "h3",
      title: "ANC Studio Acoustics",
      brand: "FaasBay Audio",
      tag: "Trending",
      price: "₹3,499",
      subtitle: "Custom 40mm Titanium Drivers · 60h Battery",
      cta: "Shop Acoustics",
      image: "/assets/banners/headphones.png",
      link: "/product/p1",
    },
    right: {
      id: "h4",
      title: "Hot-Swap Mechanical",
      brand: "FaasBay Desk",
      tag: "Best Seller",
      price: "₹3,890",
      subtitle: "CNC Aluminum Frame · Gateron Yellow Switches",
      cta: "Order Now",
      image: "/assets/banners/keyboard.png",
      link: "/product/p3",
    },
  },
];

export const defaultSpotlightSlides: SpotlightSlideItem[] = [
  // ── Column 1 (Audio & Acoustics)
  {
    id: "sp-1",
    columnId: "col-1",
    columnTitle: "Col 1 — Audio & Earbuds",
    badgeTitle: "ANY DAY OFFERS",
    subtitle: "STUDIO ACOUSTICS 40MM TITANIUM",
    price: "₹3,499",
    tagRibbon: "NEW",
    image: "/assets/banners/headphones.png",
    link: "/product/p1",
  },
  {
    id: "sp-2",
    columnId: "col-1",
    columnTitle: "Col 1 — Audio & Earbuds",
    badgeTitle: "SPATIAL AUDIO",
    subtitle: "LOSSLESS LDAC WIRELESS EARBUDS",
    price: "₹2,299",
    tagRibbon: "30% OFF",
    image: "/assets/banners/earbuds.png",
    link: "/product/p5",
  },
  {
    id: "sp-3",
    columnId: "col-1",
    columnTitle: "Col 1 — Audio & Earbuds",
    badgeTitle: "BOOM SOUND",
    subtitle: "PORTABLE BASS 360 SPEAKER",
    price: "₹2,890",
    tagRibbon: "HOT",
    image: "/assets/banners/speaker.png",
    link: "/product/p6",
  },

  // ── Column 2 (Smartwatches & Docks)
  {
    id: "sp-4",
    columnId: "col-2",
    columnTitle: "Col 2 — Docks & Wearables",
    badgeTitle: "TITANIUM PRO",
    subtitle: "SAPPHIRE CRYSTAL AMOLED WATCH",
    price: "₹4,299",
    tagRibbon: "PRO",
    image: "/assets/banners/watch.png",
    link: "/product/p2",
  },
  {
    id: "sp-5",
    columnId: "col-2",
    columnTitle: "Col 2 — Docks & Wearables",
    badgeTitle: "MAGSAFE DOCK",
    subtitle: "15W FAST WIRELESS 3-IN-1",
    price: "₹1,890",
    tagRibbon: "POPULAR",
    image: "/assets/banners/dock.png",
    link: "/product/p4",
  },
  {
    id: "sp-6",
    columnId: "col-2",
    columnTitle: "Col 2 — Docks & Wearables",
    badgeTitle: "SMART TRACK",
    subtitle: "TITANIUM BIO-METRIC RING",
    price: "₹3,190",
    tagRibbon: "NEW",
    image: "/assets/banners/watch.png",
    link: "/product/p7",
  },

  // ── Column 3 (Keyboards & Workspace)
  {
    id: "sp-7",
    columnId: "col-3",
    columnTitle: "Col 3 — Precision Gear",
    badgeTitle: "STUDIO KEYBOARD",
    subtitle: "CNC HOT-SWAP 75% GATERON YELLOW",
    price: "₹3,890",
    tagRibbon: "HOT",
    image: "/assets/banners/keyboard.png",
    link: "/product/p3",
  },
  {
    id: "sp-8",
    columnId: "col-3",
    columnTitle: "Col 3 — Precision Gear",
    badgeTitle: "ERGONOMIC DESK",
    subtitle: "PRECISION SILENT WIRELESS MOUSE",
    price: "₹1,499",
    tagRibbon: "NEW",
    image: "/assets/banners/mouse.png",
    link: "/product/p9",
  },
  {
    id: "sp-9",
    columnId: "col-3",
    columnTitle: "Col 3 — Precision Gear",
    badgeTitle: "FAASBAY DIRECT",
    subtitle: "EXPRESS WAREHOUSE AIR DISPATCH",
    price: "FREE SHIPPING",
    tagRibbon: "24H",
    image: "/assets/banners/earbuds.png",
    link: "/product/p1",
  },
];

export const defaultEditorialCampaigns: EditorialCampaignItem[] = [
  {
    id: "banner-top",
    tierTitle: "1. Top Hero Showcase (Modern Chair / Lifestyle)",
    eyebrow: "NEW ARRIVAL —",
    title: "Modern Chair",
    subtitle: "Comfort. Redefined.",
    description: "Sleek architectural design that fits every modern workspace and studio beautifully.",
    image: "/assets/banners/modern_chair.png",
    features: ["Premium Linen", "Ergonomic Curve", "Solid Oak Base"],
    ctaText: "Explore Living",
    ctaLink: "#catalog-section",
    accentBg: "from-[#eef2f6] via-[#f3f6fa] to-[#eef2f6]",
  },
  {
    id: "banner-middle",
    tierTitle: "2. Middle Showcase (Bamboo Swing / Relaxation)",
    eyebrow: "FAASBAY HOME SPECIAL",
    title: "Bamboo Swing Chairs",
    subtitle: "Swinging Into Relaxation",
    description: "Handcrafted weather-resistant rattan weave with heavy-duty powder-coated steel frame.",
    image: "/assets/banners/bamboo_swing.png",
    features: ["Weather Resistant", "150kg Load", "Plush Cushion Included"],
    ctaText: "Shop Collection",
    ctaLink: "#catalog-section",
    accentBg: "from-[#f0f9f3] via-[#f5fbf7] to-[#ebf7f0]",
  },
  {
    id: "banner-bottom",
    tierTitle: "3. Bottom Showcase (Hanging Light / Ambiance)",
    eyebrow: "WARM AMBIENCE LIGHTING",
    title: "Hanging Light",
    subtitle: "Light That Transforms",
    description: "Hand-turned natural timber acoustic shade with soft dimmable LED ambiance.",
    image: "/assets/banners/hanging_light.png",
    features: ["Natural Timber", "Dimmable LED", "E27 Standard"],
    ctaText: "Discover Lighting",
    ctaLink: "#catalog-section",
    accentBg: "from-[#fbf5ee] via-[#fdf9f4] to-[#f8eee3]",
  },
];

export const defaultFeaturedCoupon: FeaturedCouponConfig = {
  code: "FAASBAY15",
  headline: "Get 15% Off",
  subtitle: "On Your First Order!",
  discountValue: "15%",
  badgeText: "Special Offer",
  buttonText: "CLAIM OFFER",
  active: true,
};
// ── Backend-backed CMS store ────────────────────────────────────────────────

export interface StorefrontCmsData {
  sections: HomepageSectionConfig[];
  heroPairs: DualHeroSlidePair[];
  spotlightSlides: SpotlightSlideItem[];
  editorialBanners: EditorialCampaignItem[];
  featuredCoupon: FeaturedCouponConfig;
  footer: StorefrontFooterConfig;
  navLinks: StorefrontNavLink[];
  pages: StorefrontPageItem[];
}

/** Rendered until the first GET /api/storefront resolves. */
const fallbackCms: StorefrontCmsData = {
  sections: defaultHomepageSections,
  heroPairs: defaultHeroPairs,
  spotlightSlides: defaultSpotlightSlides,
  editorialBanners: defaultEditorialCampaigns,
  featuredCoupon: defaultFeaturedCoupon,
  footer: defaultFooterData,
  navLinks: defaultNavLinksList,
  pages: defaultPagesList,
};

/** A block the API has not been given content for yet falls back to the default. */
function mergeWithFallback(remote: Partial<StorefrontCmsData> | null): StorefrontCmsData {
  if (!remote) return fallbackCms;
  const merged = { ...fallbackCms };
  (Object.keys(fallbackCms) as (keyof StorefrontCmsData)[]).forEach((key) => {
    const value = remote[key];
    const isEmptyList = Array.isArray(value) && value.length === 0;
    if (value !== undefined && value !== null && !isEmptyList) {
      (merged as Record<string, unknown>)[key] = value;
    }
  });
  return merged;
}

const cmsStore = createRemoteStore<StorefrontCmsData>(fallbackCms, async () => {
  const data = await api.get<Partial<StorefrontCmsData>>(API_ENDPOINTS.storefront);
  return mergeWithFallback(data);
});

/** Re-reads the CMS from the database, for use after an external change. */
export const refreshStorefrontCms = () => cmsStore.refresh();

type BlockKey = keyof StorefrontCmsData;

/**
 * Writes one block to MongoDB. The local copy updates immediately so the editor
 * stays responsive, and is rolled back if the server rejects the change.
 */
async function saveBlock<K extends BlockKey>(key: K, value: StorefrontCmsData[K]): Promise<void> {
  const previous = cmsStore.get();
  cmsStore.set({ ...previous, [key]: value });

  try {
    await api.put(`${API_ENDPOINTS.storefront}/${key}`, value);
  } catch (error) {
    cmsStore.set(previous);
    throw error;
  }
}

/**
 * Live storefront CMS content. Reads come from MongoDB via a single shared
 * request; every update writes straight back to the database.
 */
export function useStorefrontCms() {
  const data = useRemoteStore(cmsStore);

  const updateHomepageSections = useCallback(
    (newSections: HomepageSectionConfig[]) => saveBlock("sections", newSections),
    []
  );

  const toggleSection = useCallback(
    (id: string) => {
      const updated = cmsStore.get().sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s));
      return saveBlock("sections", updated);
    },
    []
  );

  const moveSection = useCallback((idx: number, direction: "up" | "down") => {
    const current = cmsStore.get().sections;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= current.length) return Promise.resolve();

    const next = [...current];
    const [moved] = next.splice(idx, 1);
    if (!moved) return Promise.resolve();
    next.splice(targetIdx, 0, moved);
    // Re-assign sortOrder
    return saveBlock("sections", next.map((item, i) => ({ ...item, sortOrder: i + 1 })));
  }, []);

  const resetHomepageSections = useCallback(() => saveBlock("sections", defaultHomepageSections), []);

  const isSectionVisible = useCallback(
    (id: string): boolean => {
      const found = data.sections.find((s) => s.id === id);
      return found ? found.visible : true;
    },
    [data.sections]
  );

  const updateHeroPairs = useCallback((v: DualHeroSlidePair[]) => saveBlock("heroPairs", v), []);
  const updateSpotlightSlides = useCallback((v: SpotlightSlideItem[]) => saveBlock("spotlightSlides", v), []);
  const updateEditorialBanners = useCallback((v: EditorialCampaignItem[]) => saveBlock("editorialBanners", v), []);
  const updateFeaturedCoupon = useCallback((v: FeaturedCouponConfig) => saveBlock("featuredCoupon", v), []);
  const updateFooterData = useCallback((v: StorefrontFooterConfig) => saveBlock("footer", v), []);
  const updateNavLinks = useCallback((v: StorefrontNavLink[]) => saveBlock("navLinks", v), []);
  const updatePagesList = useCallback((v: StorefrontPageItem[]) => saveBlock("pages", v), []);

  return {
    sections: data.sections,
    updateHomepageSections,
    toggleSection,
    moveSection,
    resetHomepageSections,
    isSectionVisible,
    heroPairs: data.heroPairs,
    updateHeroPairs,
    spotlightSlides: data.spotlightSlides,
    updateSpotlightSlides,
    editorialBanners: data.editorialBanners,
    updateEditorialBanners,
    featuredCoupon: data.featuredCoupon,
    updateFeaturedCoupon,
    footerData: data.footer,
    updateFooterData,
    navLinks: data.navLinks,
    updateNavLinks,
    pagesList: data.pages,
    updatePagesList,
    isLoaded: cmsStore.isLoaded(),
    refresh: cmsStore.refresh,
  };
}
