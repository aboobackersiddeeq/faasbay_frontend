// ============================================================================
// FaasBay Commerce OS — Admin catalog store (MongoDB-backed)
// ============================================================================
//
// The admin catalog used to live in localStorage, with the API as a best-effort
// mirror — which capped the catalog at the browser's storage quota and meant two
// staff members saw different products. It now reads and writes MongoDB directly;
// the in-memory cache below exists only so synchronous render paths have something
// to show between refreshes.

import type { AdminProduct } from "./types";
import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/api-client";
import { refreshProducts as refreshStorefrontCatalog } from "@/components/store/data";

const PRODUCTS_UPDATED_EVENT = "faasbay_products_updated";

let cache: AdminProduct[] = [];
let loaded = false;
let inFlight: Promise<AdminProduct[]> | null = null;

function announce() {
  if (typeof window === "undefined") return;
  (window as any).__faasbay_admin_products = cache;
  window.dispatchEvent(new Event(PRODUCTS_UPDATED_EVENT));
}

/** The catalog as last read from the database. Empty until the first load lands. */
export function getCachedAdminProducts(): AdminProduct[] {
  return cache;
}

export function isCatalogLoaded(): boolean {
  return loaded;
}

/** Replaces the cache and notifies listeners, without touching the server. */
export function setCachedAdminProducts(products: AdminProduct[]) {
  cache = products;
  loaded = true;
  announce();
}

/** Re-reads the full admin catalog (all statuses) from MongoDB. */
export function refreshAdminProducts(): Promise<AdminProduct[]> {
  if (inFlight) return inFlight;

  inFlight = api
    .get<AdminProduct[]>(API_ENDPOINTS.products)
    .then((rows) => {
      cache = Array.isArray(rows) ? rows : [];
      loaded = true;
      announce();
      return cache;
    })
    .catch((e) => {
      console.error("Could not load the product catalog:", e);
      return cache;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/** Loads once; later calls resolve from cache. */
export function loadAdminProducts(): Promise<AdminProduct[]> {
  if (loaded) return Promise.resolve(cache);
  return refreshAdminProducts();
}

/** Refreshes both the admin catalog and the public storefront catalog. */
async function refreshEverything(): Promise<AdminProduct[]> {
  const [products] = await Promise.all([refreshAdminProducts(), refreshStorefrontCatalog()]);
  return products;
}

/** Creates a product in MongoDB. */
export async function createProduct(product: AdminProduct): Promise<AdminProduct> {
  const saved = await api.post<AdminProduct>(API_ENDPOINTS.products, product);
  await refreshEverything();
  return saved;
}

/** Updates a product in MongoDB. */
export async function updateProduct(id: string, product: Partial<AdminProduct>): Promise<AdminProduct> {
  const saved = await api.put<AdminProduct>(`${API_ENDPOINTS.products}/${encodeURIComponent(id)}`, product);
  await refreshEverything();
  return saved;
}

/** Deletes one product from MongoDB. */
export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`${API_ENDPOINTS.products}/${encodeURIComponent(id)}`);
  await refreshEverything();
}

/** Deletes several products; failures are collected rather than aborting the rest. */
export async function deleteProducts(ids: string[]): Promise<{ deleted: number; failed: string[] }> {
  const failed: string[] = [];
  let deleted = 0;

  for (const id of ids) {
    try {
      await api.delete(`${API_ENDPOINTS.products}/${encodeURIComponent(id)}`);
      deleted++;
    } catch {
      failed.push(id);
    }
  }

  await refreshEverything();
  return { deleted, failed };
}

/** Upserts many products in one request (import, or a bulk status change). */
export async function bulkSaveProducts(products: AdminProduct[]): Promise<void> {
  await api.post(API_ENDPOINTS.productsBulk, { products });
  await refreshEverything();
}

/**
 * Applies a different partial update to each product (e.g. adding/removing a
 * homepage collection tag across a batch picked in a filter/checklist UI).
 * Failures are collected rather than aborting the rest; the catalog refreshes
 * once at the end instead of after every row.
 */
export async function bulkUpdateProducts(
  updates: { id: string; changes: Partial<AdminProduct> }[]
): Promise<{ updated: number; failed: string[] }> {
  const failed: string[] = [];
  let updated = 0;

  for (const { id, changes } of updates) {
    try {
      await api.put<AdminProduct>(`${API_ENDPOINTS.products}/${encodeURIComponent(id)}`, changes);
      updated++;
    } catch {
      failed.push(id);
    }
  }

  await refreshEverything();
  return { updated, failed };
}
