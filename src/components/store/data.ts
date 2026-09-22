// ============================================================================
// FaasBay — Storefront catalog (MongoDB-backed)
// ============================================================================
//
// The catalog is served by GET /api/products. Nothing is cached in localStorage:
// every visitor sees the same inventory, prices and stock as the admin.

import { API_ENDPOINTS } from "@/config/api";
import { api, queryString } from "@/lib/api-client";
import { createRemoteStore, useRemoteStore, useRemoteStoreState } from "@/lib/remote-store";

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
    rating: typeof p.rating === "number" ? p.rating : 5.0,
    reviews: p.reviewsCount || (Array.isArray(p.customerReviews) ? p.customerReviews.length : p.reviews || 0),
    image: p.image || gallery[0] || "",
    images: gallery,
    description: p.description || "",
    materials: Array.isArray(p.materials) ? p.materials : [],
    customerReviews: Array.isArray(p.customerReviews) ? p.customerReviews : [],
    freeShipping: p.freeShipping ?? true,
    isFlashDeal: p.isFlashDeal ?? false,
    dealExpiresAt: p.dealExpiresAt || undefined,
    collections:
      Array.isArray(p.collections) && p.collections.length > 0
        ? p.collections
        : ["trending", "new-arrivals", "best-sellers"],
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
  const rows = await api.get<any[]>(API_ENDPOINTS.products);
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

/** Category pills shown above the catalog. The authoritative list is /api/categories. */
export const categories = [
  { id: "all", label: "All Products" },
  { id: "mobile-electronics", label: "Mobile & Electronics" },
  { id: "audio-speakers", label: "Audio & Speakers" },
  { id: "car-accessories", label: "Car Accessories" },
  { id: "home-cleaning", label: "Home Cleaning" },
  { id: "health-wellness", label: "Health & Massage" },
  { id: "beauty-personal-care", label: "Beauty & Care" },
  { id: "kitchen-dining", label: "Kitchen & Dining" },
  { id: "lighting", label: "Home Lighting" },
  { id: "kids-toys", label: "Kids & Toys" },
  { id: "watches-fashion", label: "Watches & Fashion" },
  { id: "storage-organizers", label: "Storage & Organizers" },
  { id: "travel-products", label: "Travel Products" },
  { id: "home-lifestyle", label: "Home & Lifestyle" },
  { id: "pest-control", label: "Pest Control" },
  { id: "stationery-office", label: "Stationery & Office" },
  { id: "utility-tools", label: "Utility & Tools" },
];

export const shortcuts = [
  "Noise Cancelling Headphones",
  "Titanium Smartwatches",
  "Mechanical Keyboards",
  "MagSafe Wireless Docks",
  "True Wireless Earbuds",
  "GaN Fast Chargers",
];
