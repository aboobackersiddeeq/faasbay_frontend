/**
 * Global API Configuration for FaasBay Frontend
 * Reads backend URL from environment variables in production,
 * and falls back to local development server (port 5001).
 */

export const API_BASE_URL: string =
  (import.meta.env["VITE_API_URL"] as string)?.replace(/\/$/, "") || "http://localhost:5001";

export const RAZORPAY_KEY_ID: string =
  (import.meta.env["VITE_RAZORPAY_KEY_ID"] as string) ;

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/api/health`,

  // Auth
  adminLogin: `${API_BASE_URL}/api/auth/admin/login`,
  adminMe: `${API_BASE_URL}/api/auth/admin/me`,

  // Catalog
  products: `${API_BASE_URL}/api/products`,
  productsBulk: `${API_BASE_URL}/api/products/bulk`,
  categories: `${API_BASE_URL}/api/categories`,
  collections: `${API_BASE_URL}/api/collections`,

  // Media
  upload: `${API_BASE_URL}/api/upload`,

  // Orders & payments
  orders: `${API_BASE_URL}/api/orders`,
  myOrders: `${API_BASE_URL}/api/orders/mine`,
  razorpayCreateOrder: `${API_BASE_URL}/api/orders/razorpay/create-order`,
  razorpayVerify: `${API_BASE_URL}/api/orders/razorpay/verify-payment`,

  // Marketing
  coupons: `${API_BASE_URL}/api/coupons`,
  couponsApply: `${API_BASE_URL}/api/coupons/apply`,
  banners: `${API_BASE_URL}/api/banners`,
  homepageSections: `${API_BASE_URL}/api/homepage-sections`,

  // Storefront CMS & switches
  storefront: `${API_BASE_URL}/api/storefront`,
  featureFlags: `${API_BASE_URL}/api/feature-flags`,

  // People
  customers: `${API_BASE_URL}/api/customers`,
  customerLookup: `${API_BASE_URL}/api/customers/lookup`,
  customerAddresses: `${API_BASE_URL}/api/customers/lookup/addresses`,
  reviews: `${API_BASE_URL}/api/reviews`,
  inquiries: `${API_BASE_URL}/api/inquiries`,
  supportTickets: `${API_BASE_URL}/api/support-tickets`,

  // Post-purchase
  returns: `${API_BASE_URL}/api/returns`,
  refunds: `${API_BASE_URL}/api/refunds`,

  // Admin
  staff: `${API_BASE_URL}/api/admin/staff`,
  auditLogs: `${API_BASE_URL}/api/admin/audit-logs`,
  transactions: `${API_BASE_URL}/api/admin/transactions`,
  settings: `${API_BASE_URL}/api/settings`,
} as const;
