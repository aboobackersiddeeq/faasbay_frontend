// ============================================================================
// FaasBay — Storefront catalog (MongoDB-backed)
// ============================================================================
//
// The catalog is served by GET /api/products. Nothing is cached in localStorage:
// every visitor sees the same inventory, prices and stock as the admin.

import { API_ENDPOINTS } from "@/config/api";
import { api, queryString } from "@/lib/api-client";
import { createRemoteStore, useRemoteStore, useRemoteStoreState } from "@/lib/remote-store";
import { resolveCategoryIcon } from "@/lib/category-icons";

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  userPhoto?: string;
  images?: string[];
  helpfulCount?: number;
  /** Missing on reviews saved before moderation existed — those count as Approved. */
  status?: ReviewStatus;
  source?: "customer" | "admin";
  submittedAt?: string;
}

export type ReviewStatus = "Pending" | "Approved" | "Rejected";

/** Only approved reviews are shown to shoppers or counted in the rating. */
export function isApprovedReview(review: Pick<Review, "status"> | undefined): boolean {
  return !review?.status || review.status === "Approved";
}

export function reviewStatusOf(review: Pick<Review, "status">): ReviewStatus {
  return review.status || "Approved";
}

/** "2026-09-12" → "12 Sep 2026"; free text from older reviews ("2 days ago") is shown as-is. */
export function formatReviewDate(value: string | undefined): string {
  const s = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return s;
  const d = new Date(`${s.slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? s
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Today as YYYY-MM-DD in the viewer's timezone (the value a date input expects). */
export function todayIsoDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Shopper review submissions ──────────────────────────────────────────────

/** The signed-in shopper a review is attributed to (from their registered profile). */
export interface Reviewer {
  name: string;
  phone?: string | undefined;
  email?: string | undefined;
}

export interface ReviewEligibility {
  canReview: boolean;
  code?: "LOGIN_REQUIRED" | "NOT_PURCHASED" | "ALREADY_REVIEWED";
  message?: string;
  reviewStatus?: ReviewStatus;
}

/** Asks the server whether this shopper has ordered the product and not yet reviewed it. */
export async function checkReviewEligibility(productId: string, reviewer: Reviewer): Promise<ReviewEligibility> {
  const result = await api.get<ReviewEligibility>(
    `${API_ENDPOINTS.products}/${encodeURIComponent(productId)}/reviews/eligibility${queryString({
      phone: reviewer.phone,
      email: reviewer.email,
    })}`
  );
  return result || { canReview: false };
}

/**
 * Submits a review as the signed-in shopper — the name comes from their account,
 * not a form field. It stays hidden from other shoppers until staff approve it.
 */
export async function submitProductReview(
  productId: string,
  reviewer: Reviewer,
  review: { rating: number; comment: string }
): Promise<Review> {
  return api.post<Review>(`${API_ENDPOINTS.products}/${encodeURIComponent(productId)}/reviews`, {
    ...review,
    author: reviewer.name,
    phone: reviewer.phone,
    email: reviewer.email,
  });
}

export interface ReviewSummary {
  /** Average star rating, one decimal place; 0 when there are no reviews. */
  average: number;
  count: number;
  /** Star breakdown, 5★ first: how many reviews gave that many stars, and their share (0-100). */
  breakdown: { stars: number; count: number; percent: number }[];
}

/** Clamps one review's rating to a whole 1-5 star value. */
export function reviewStars(review: Pick<Review, "rating">): number {
  const n = Math.round(Number(review?.rating));
  return Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : 5;
}

/** Average, count and per-star breakdown of the approved reviews in a list. */
export function summarizeReviews(reviews: Review[] | undefined): ReviewSummary {
  const list = (Array.isArray(reviews) ? reviews : []).filter(isApprovedReview);
  const count = list.length;
  const tally = new Map<number, number>();
  let total = 0;
  for (const r of list) {
    const raw = Number(r?.rating);
    total += Number.isFinite(raw) ? Math.min(5, Math.max(1, raw)) : 5;
    const stars = reviewStars(r);
    tally.set(stars, (tally.get(stars) ?? 0) + 1);
  }

  return {
    average: count > 0 ? Math.round((total / count) * 10) / 10 : 0,
    count,
    breakdown: [5, 4, 3, 2, 1].map((stars) => {
      const n = tally.get(stars) ?? 0;
      return { stars, count: n, percent: count > 0 ? Math.round((n / count) * 100) : 0 };
    }),
  };
}

export type Product = {
  id: string;
  title: string;
  category: string;
  shop: string;
  price: string;
  compareAt?: string;
  stock?: number;
  boughtLast24h?: number;
  viewersNow?: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  freeShipping?: boolean;
  isFlashDeal?: boolean;
  dealExpiresAt?: string;
  description?: string;
  materials?: string[];
  features?: string[];
  customerReviews?: Review[];
  collections?: string[];
  tags?: string[];
  specifications?: { label: string; value: string }[];
  colors?: { name: string; hex: string }[];
  variants?: any[];
  hasVariants?: boolean;
  warranty?: string;
  codAvailable?: boolean;
  codCharge?: number;
  isCodFree?: boolean;
  deliveryType?: "free" | "custom";
  deliveryCharge?: number;
};

/**
 * Maps an API product document onto the shape storefront components render
 * (prices as display strings, gallery normalised, sensible defaults filled in).
 */
export function formatProductForStorefront(p: any): Product {
  const priceVal = typeof p.price === "number" ? `₹${p.price.toLocaleString("en-IN")}` : String(p.price || "₹0");
  const compareVal = p.mrp || p.compareAt
    ? typeof (p.mrp || p.compareAt) === "number"
      ? `₹${Number(p.mrp || p.compareAt).toLocaleString("en-IN")}`
      : String(p.mrp || p.compareAt)
    : undefined;

  const gallery = Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image ? [p.image] : [];

  // The review list is the source of truth — the stored rating/reviewsCount can
  // lag behind it (older documents, partial updates), so derive both from it.
  // The API already hides unapproved reviews from the storefront; filter again so
  // an admin-catalog document passed through here can never leak one.
  const customerReviews: Review[] = (Array.isArray(p.customerReviews) ? p.customerReviews : []).filter(isApprovedReview);
  const reviewSummary = summarizeReviews(customerReviews);

  // Parse specifications into structured array
  let parsedSpecs: { label: string; value: string }[] = [];
  if (Array.isArray(p.specifications)) {
    parsedSpecs = p.specifications.filter((s: any) => s && (s.label || s.key) && s.value).map((s: any) => ({
      label: s.label || s.key,
      value: s.value,
    }));
  } else if (p.specifications && typeof p.specifications === "object") {
    parsedSpecs = Object.entries(p.specifications).map(([key, val]) => ({
      label: key,
      value: String(val),
    }));
  }

  // Parse custom colors
  let parsedColors: { name: string; hex: string }[] = [];
  if (Array.isArray(p.colors) && p.colors.length > 0) {
    parsedColors = p.colors.filter((c: any) => c && c.name && c.name !== "None");
  } else if (Array.isArray(p.variants) && p.variants.length > 0 && p.hasVariants) {
    parsedColors = p.variants
      .filter((v: any) => v && v.name && v.name !== "Default" && v.name !== "None")
      .map((v: any) => ({
        name: v.name,
        hex: v.hex || "#1e293b",
      }));
  }

  return {
    id: String(p.id),
    title: p.title || "Untitled Product",
    category: p.category || "General",
    shop: p.brand || p.shop || "FaasBay Collection",
    price: priceVal.startsWith("₹") ? priceVal : `₹${priceVal}`,
    compareAt: compareVal ? (compareVal.startsWith("₹") ? compareVal : `₹${compareVal}`) : undefined,
    stock: p.stock !== undefined ? Number(p.stock) : 10,
    boughtLast24h: p.boughtLast24h || 0,
    viewersNow: p.viewersNow || 1,
    rating: reviewSummary.count > 0 ? reviewSummary.average : typeof p.rating === "number" ? p.rating : 5.0,
    reviews: reviewSummary.count,
    image: p.image || gallery[0] || "",
    images: gallery,
    description: p.description || "",
    materials: Array.isArray(p.materials) ? p.materials : [],
    customerReviews,
    freeShipping: p.freeShipping ?? true,
    isFlashDeal: p.isFlashDeal ?? false,
    dealExpiresAt: p.dealExpiresAt || undefined,
    collections:
      Array.isArray(p.collections) && p.collections.length > 0
        ? p.collections
        : ["trending", "new-arrivals", "best-sellers"],
    tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
    specifications: parsedSpecs,
    colors: parsedColors,
    variants: Array.isArray(p.variants) ? p.variants : [],
    hasVariants: Boolean(p.hasVariants && parsedColors.length > 0),
    warranty: p.warranty || "3 Days Checking Warranty / Replacement",
    features: Array.isArray(p.features) ? p.features : (Array.isArray(p.materials) ? p.materials : []),
    codAvailable: p.codAvailable !== undefined ? Boolean(p.codAvailable) : true,
    codCharge: p.deliveryCharge !== undefined ? Number(p.deliveryCharge) : (p.codCharge !== undefined ? Number(p.codCharge) : 100),
    isCodFree: p.isCodFree ?? false,
    deliveryType: p.deliveryType || "free",
    deliveryCharge: p.deliveryCharge !== undefined ? Number(p.deliveryCharge) : (p.codCharge !== undefined ? Number(p.codCharge) : 100),
  };
}

/** Filters out the legacy p1..p21 demo rows that predate the live catalog. */
export function filterOutDemoProducts<T extends { id?: string | number }>(list: T[]): T[] {
  if (!Array.isArray(list)) return [];
  const demoIds = new Set([
    "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10",
    "p11", "p12", "p13", "p14", "p15", "p16", "p17", "p18", "p19", "p20", "p21"
  ]);
  return list.filter((p) => p && p.id && !demoIds.has(String(p.id)));
}

// ── Live catalog store ──────────────────────────────────────────────────────

/** Storefront shoppers only ever see Published products. */
const storefrontStore = createRemoteStore<Product[]>([], async () => {
  const rows = await api.get<any[]>(`${API_ENDPOINTS.products}${queryString({ status: "Published" })}`);
  return filterOutDemoProducts(Array.isArray(rows) ? rows : []).map(formatProductForStorefront);
});

/** The admin catalog, which also includes Draft and Archived products. */
const adminCatalogStore = createRemoteStore<any[]>([], async () => {
  const rows = await api.get<any[]>(`${API_ENDPOINTS.products}${queryString({ includePending: 1 })}`);
  return Array.isArray(rows) ? rows : [];
});

/** Live storefront catalog. Shares one request across every component that calls it. */
export function useStoreProducts(): Product[] {
  return useRemoteStore(storefrontStore);
}

/** Same catalog plus load state, for showing skeletons and retry banners. */
export function useStoreProductsState() {
  return useRemoteStoreState(storefrontStore);
}

/** Raw admin catalog documents (all statuses), for the admin modules. */
export function useAdminProducts() {
  return useRemoteStoreState(adminCatalogStore);
}

// ── Live collections (admin-managed homepage rows) ──────────────────────────

export interface StoreCollection {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  status: string;
}

/** The admin's Collections list (name/order/status) — drives the storefront's
 * "Trending Now"/"Best Sellers"/etc. row titles and visibility. */
const collectionsStore = createRemoteStore<StoreCollection[]>([], async () => {
  const rows = await api.get<StoreCollection[]>(API_ENDPOINTS.collections);
  return Array.isArray(rows) ? rows : [];
});

export function useStoreCollections(): StoreCollection[] {
  return useRemoteStore(collectionsStore);
}

/** Re-reads collections from the database after an admin edit. */
export function refreshCollections(): Promise<StoreCollection[]> {
  return collectionsStore.refresh();
}

/** Current catalog without subscribing — for non-React call sites. */
export function getStoreProducts(): Product[] {
  void storefrontStore.load();
  return storefrontStore.get();
}

/** Re-reads both catalogs from the database after an admin write. */
export async function refreshProducts(): Promise<void> {
  await Promise.all([storefrontStore.refresh(), adminCatalogStore.refresh()]);
}

/** Fetches a single product straight from the API, bypassing the list cache. */
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const row = await api.get<any>(`${API_ENDPOINTS.products}/${encodeURIComponent(id)}`);
    return row ? formatProductForStorefront(row) : null;
  } catch {
    return null;
  }
}

/** Recommendation rail, derived from the live catalog rather than a static list. */
export function getPersonalizedRecommendations(
  products: Product[],
  recentCategories: string[] = []
): { title: string; subtitle: string; products: Product[] } {
  if (!products || products.length === 0) {
    return {
      title: "Curated For You",
      subtitle: "Explore our latest store products",
      products: [],
    };
  }

  if (!recentCategories || recentCategories.length === 0 || !recentCategories[0]) {
    return {
      title: "Curated For You",
      subtitle: "Handpicked premium tech & gadget essentials",
      products: products.slice(0, 5),
    };
  }

  const primaryCategory = recentCategories[0];
  const matched = products.filter((p) => p.category === primaryCategory);
  const others = products.filter((p) => p.category !== primaryCategory);
  const finalProducts = [...matched, ...others].slice(0, 5);

  const categoryNames: Record<string, string> = {
    "mobile-electronics": "Mobile & Electronics",
    "audio-speakers": "Audio & Speakers",
    "car-accessories": "Car Accessories",
    "home-cleaning": "Home Cleaning & Appliances",
    "health-wellness": "Health, Wellness & Massage",
    "beauty-personal-care": "Beauty & Personal Care",
    "kitchen-dining": "Kitchen & Dining",
    "lighting": "Lights & Home Lighting",
    "kids-toys": "Kids & Toys",
    "watches-fashion": "Watches & Fashion Accessories",
    "storage-organizers": "Storage & Organizers",
    "travel-products": "Travel Products",
    "home-lifestyle": "Home & Lifestyle",
    "pest-control": "Pest Control",
    "stationery-office": "Stationery & Office",
    "utility-tools": "Utility & Tools",
  };

  return {
    title: "Curated For You",
    subtitle: `Based on your recent interest in ${categoryNames[primaryCategory] || "curated finds"}`,
    products: finalProducts,
  };
}

// ── Live categories (admin-managed category rail) ───────────────────────────

/** A storefront category. `id` is the slug, which is what `Product.category` holds. */
export interface StoreCategory {
  id: string;
  label: string;
  description: string;
  /** Icon key from `@/lib/category-icons`. */
  icon: string;
  isAll?: boolean;
}

interface CategoryRow {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  visible?: boolean;
}

const ALL_CATEGORY: StoreCategory = {
  id: "all",
  label: "For You",
  description: "Explore the entire product catalog",
  icon: "for-you",
  isAll: true,
};

/** Shown until /api/categories answers, and kept if the API is unreachable. */
const FALLBACK_CATEGORIES: StoreCategory[] = [
  ALL_CATEGORY,
  { id: "mobile-electronics", label: "Mobile & Electronics", description: "Smartphones, chargers & accessories", icon: "phone" },
  { id: "audio-speakers", label: "Audio & Speakers", description: "Studio acoustics & wireless audio", icon: "headphones" },
  { id: "car-accessories", label: "Car Accessories", description: "Dashboard mounts, chargers & tech", icon: "car" },
  { id: "home-cleaning", label: "Home Cleaning & Appliances", description: "Vacuum, sprays & smart cleaners", icon: "cleaning" },
  { id: "health-wellness", label: "Health, Wellness & Massage", description: "Massagers & relaxation essentials", icon: "health" },
  { id: "beauty-personal-care", label: "Beauty & Personal Care", description: "Grooming, skincare & haircare", icon: "beauty" },
  { id: "kitchen-dining", label: "Kitchen & Dining", description: "Cookware, organizers & dinnerware", icon: "cookware" },
  { id: "lighting", label: "Home Lighting", description: "Ambient LEDs & modern lamps", icon: "bulb" },
  { id: "kids-toys", label: "Kids & Toys", description: "Educational toys & play sets", icon: "teddy" },
  { id: "watches-fashion", label: "Watches & Fashion", description: "Luxury watches, bands & accessories", icon: "watch" },
  { id: "storage-organizers", label: "Storage & Organizers", description: "Modular drawer & closet bins", icon: "storage" },
  { id: "travel-products", label: "Travel Products", description: "Suitcases, backpacks & travel gear", icon: "luggage" },
  { id: "home-lifestyle", label: "Home & Lifestyle", description: "Modern home decor & living essentials", icon: "home" },
  { id: "pest-control", label: "Pest Control", description: "Ultrasonic repellers & safe pest solutions", icon: "shield" },
  { id: "stationery-office", label: "Stationery & Office", description: "Desk journals, organizers & pens", icon: "notebook" },
  { id: "utility-tools", label: "Utility & Tools", description: "Multi-tools, hardware & DIY gear", icon: "tools" },
];

/** Visible categories in admin sort order, always led by "All Products". */
const categoriesStore = createRemoteStore<StoreCategory[]>(FALLBACK_CATEGORIES, async () => {
  const rows = await api.get<CategoryRow[]>(API_ENDPOINTS.categories);
  if (!Array.isArray(rows)) return FALLBACK_CATEGORIES;

  const sorted = [...rows].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const allRow = sorted.find((r) => r.slug === "all");
  // The "All Products" row can be renamed or re-iconed but never hidden —
  // it's how shoppers clear a category filter.
  const all: StoreCategory = allRow
    ? {
        ...ALL_CATEGORY,
        // The seeded "All Products" / sparkle values are old defaults, not admin choices.
        label: (allRow.name !== "All Products" && allRow.name) || ALL_CATEGORY.label,
        description: allRow.description || ALL_CATEGORY.description,
        icon: allRow.icon === "sparkle" ? ALL_CATEGORY.icon : resolveCategoryIcon(allRow.icon, "all"),
      }
    : ALL_CATEGORY;

  const rest = sorted
    .filter((r) => r.slug !== "all" && r.visible !== false)
    .map((r) => ({
      id: r.slug,
      label: r.name,
      description: r.description || "",
      icon: resolveCategoryIcon(r.icon, r.slug),
    }));

  return [all, ...rest];
});

export function useStoreCategories(): StoreCategory[] {
  return useRemoteStore(categoriesStore);
}

/** Re-reads categories from the database after an admin edit. */
export function refreshCategories(): Promise<StoreCategory[]> {
  return categoriesStore.refresh();
}

export const shortcuts = [
  "Noise Cancelling Headphones",
  "Titanium Smartwatches",
  "Mechanical Keyboards",
  "MagSafe Wireless Docks",
  "True Wireless Earbuds",
  "GaN Fast Chargers",
];
