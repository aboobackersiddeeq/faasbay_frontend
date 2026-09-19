// ============================================================================
// FaasBay Commerce OS — Master Feature Flags & System Switches (MongoDB-backed)
// ============================================================================
//
// Flags live in MongoDB and are served by GET /api/feature-flags, so a switch
// flipped in the admin takes effect for every visitor rather than only the browser
// that toggled it. `defaultFeatureFlags` is a first-paint fallback only.

import { API_ENDPOINTS } from "@/config/api";
import { api } from "./api-client";
import { createRemoteStore, useRemoteStore } from "./remote-store";

export interface FeatureFlags {
  // Storefront & Filtering Controls
  storefrontFilters: boolean;
  heroBanners: boolean;
  spotlightBanners: boolean;
  editorialBanners: boolean;
  categoryNavPills: boolean;
  trustMarquee: boolean;
  flashDealsTimer: boolean;

  // Pricing & Taxes
  taxCalculation: boolean;
  taxInclusivePrices: boolean;
  taxInvoicing: boolean;
  mrpDiscountBadges: boolean;

  // AI & Intelligence
  aiProductGenerator: boolean;
  aiSeoSync: boolean;
  smartSearch: boolean;

  // Orders & Storefront Features
  freeExpressDelivery: boolean;
  cashOnDelivery: boolean;
  lowStockAlerts: boolean;
  productReviews: boolean;
}

export const defaultFeatureFlags: FeatureFlags = {
  storefrontFilters: true,
  heroBanners: true,
  spotlightBanners: true,
  editorialBanners: true,
  categoryNavPills: true,
  trustMarquee: true,
  flashDealsTimer: true,
  taxCalculation: true,
  taxInclusivePrices: false,
  taxInvoicing: true,
  mrpDiscountBadges: true,
  aiProductGenerator: true,
  aiSeoSync: true,
  smartSearch: true,
  freeExpressDelivery: true,
  cashOnDelivery: true,
  lowStockAlerts: true,
  productReviews: true,
};

const flagsStore = createRemoteStore<FeatureFlags>(defaultFeatureFlags, async () => {
  const data = await api.get<Partial<FeatureFlags>>(API_ENDPOINTS.featureFlags);
  return { ...defaultFeatureFlags, ...(data || {}) };
});

/** Current flags without subscribing — for non-React call sites. */
export function getFeatureFlags(): FeatureFlags {
  void flagsStore.load();
  return flagsStore.get();
}

export const refreshFeatureFlags = () => flagsStore.refresh();

/** Persists a partial set of flags to MongoDB, rolling back on failure. */
export async function saveFeatureFlags(flags: Partial<FeatureFlags>): Promise<FeatureFlags> {
  const previous = flagsStore.get();
  const optimistic = { ...previous, ...flags };
  flagsStore.set(optimistic);

  try {
    const saved = await api.put<Partial<FeatureFlags>>(API_ENDPOINTS.featureFlags, flags);
    const merged = { ...defaultFeatureFlags, ...(saved || optimistic) };
    flagsStore.set(merged);
    return merged;
  } catch (error) {
    flagsStore.set(previous);
    throw error;
  }
}

export function useFeatureFlags() {
  const flags = useRemoteStore(flagsStore);

  const toggleFlag = (key: keyof FeatureFlags) => saveFeatureFlags({ [key]: !flags[key] } as Partial<FeatureFlags>);

  const updateFlags = (newFlags: Partial<FeatureFlags>) => saveFeatureFlags(newFlags);

  return { flags, toggleFlag, updateFlags, isLoaded: flagsStore.isLoaded(), refresh: flagsStore.refresh };
}
