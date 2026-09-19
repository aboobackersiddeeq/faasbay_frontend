// ============================================================================
// FaasBay Commerce OS — Shared Admin Types
// ============================================================================

// ── Products ────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  sku: string;
  barcode?: string;
  name: string; // e.g. "Black / 256GB"
  price: number;
  mrp?: number;
  stock: number;
  image?: string;
  weight?: string;
  attributes: Record<string, string>; // { color: "Black", storage: "256GB" }
}

export interface AdminProduct {
  id: string;
  title: string;
  sku: string;
  barcode?: string;
  brand: string;
  codAvailable?: boolean;
  codCharge?: number;
  isCodFree?: boolean;
  deliveryType?: "free" | "custom";
  deliveryCharge?: number;
  category: string;
  subcategory?: string;
  collections: string[];
  tags: string[];
  description: string;
  shortDescription?: string;
  specifications?: Record<string, string> | { label: string; value: string }[];
  colors?: { name: string; hex: string }[];
  whatsInBox?: string[];
  warranty?: string;
  shippingInfo?: string;
  // Pricing
  costPrice?: number;
  price: number;
  mrp?: number;
  compareAt?: number;
  salePrice?: number;
  margin?: number;
  gstRate?: string;
  // Inventory
  stock: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  backorderEnabled: boolean;
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
  // Media
  image: string;
  images: string[];
  video?: string;
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  slug: string;
  indexable: boolean;
  // Status
  status: "Published" | "Draft" | "Archived";
  // Variants
  variants: ProductVariant[];
  hasVariants: boolean;
  // Storefront & Social Proof
  rating: number;
  reviewsCount: number;
  customerReviews?: import("@/components/store/data").Review[];
  freeShipping: boolean;
  isFlashDeal: boolean;
  // Stats
  unitsSold: number;
  viewsCount: number;
  addToCartCount: number;
  conversionRate: number;
  createdAt: string;
  updatedAt: string;
}

// ── Categories ──────────────────────────────────────────────────────────────

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  productCount: number;
  visible: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

// ── Collections ─────────────────────────────────────────────────────────────

export interface CollectionRule {
  field: "category" | "price" | "tags" | "stock" | "discount" | "newness";
  operator: "equals" | "contains" | "greater_than" | "less_than" | "between";
  value: string;
}

export interface AdminCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  type: "manual" | "automatic";
  rules?: CollectionRule[];
  productIds: string[];
  productCount: number;
  sortOrder: number;
  status: "Active" | "Draft" | "Scheduled";
  scheduledStart?: string;
  scheduledEnd?: string;
}

// ── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "Pending" | "Confirmed" | "Processing" | "Packed"
  | "Ready to Ship" | "Shipped" | "Out for Delivery" | "Delivered"
  | "Cancelled" | "Return Requested" | "Returned"
  | "Refund Pending" | "Refunded" | "Payment Failed";

export interface OrderLineItem {
  productId: string;
  title: string;
  sku?: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  image?: string;
}

export interface OrderAddress {
  name: string;
  street: string;
  city: string;
  state?: string;
  pincode: string;
  country: string;
  phone?: string;
}

export interface OrderNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  isInternal: boolean;
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  note?: string;
  staff?: string;
}

export interface AdminOrder {
  orderId: string;
  createdAt: string;
  updatedAt?: string;
  customer: {
    id?: string;
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  items: OrderLineItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: "Paid" | "Pending" | "Refunded" | "Partially Refunded" | "Failed" | string;
  orderStatus: OrderStatus;
  advancePaid?: number;
  codAmountDue?: number;
  trackingNumber?: string;
  trackingUrl?: string;
  courier?: string;
  notes: OrderNote[];
  timeline: OrderTimeline[];
  invoiceId?: string;
  tags?: string[];
}

// ── Returns ─────────────────────────────────────────────────────────────────

export type ReturnStatus =
  | "Requested" | "Under Review" | "Approved" | "Rejected"
  | "Pickup Scheduled" | "Received" | "Inspecting" | "Refund Initiated" | "Completed";

export interface AdminReturn {
  id: string;
  orderId: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  productTitle: string;
  productId?: string;
  productImage?: string;
  sku?: string;
  variant?: string;
  quantity: number;
  itemPrice?: number;
  reason: string;
  reasonCategory?: string;
  condition?: string;
  images?: string[];
  requestedDate: string;
  orderDate?: string;
  status: ReturnStatus;
  refundAmount: number;
  refundMethod?: string;
  paymentMethod?: string;
  notes?: string;
  assignedStaff?: string;
  resolvedDate?: string;
  pickupCourier?: string;
  pickupTracking?: string;
  timeline?: { status: string; timestamp: string; note?: string; staff?: string }[];
}

// ── Refunds ─────────────────────────────────────────────────────────────────

export interface AdminRefund {
  id: string;
  orderId: string;
  returnId?: string;
  customerName: string;
  type: "Full" | "Partial" | "Shipping Only" | "Product Only";
  amount: number;
  originalOrderTotal: number;
  reason: string;
  paymentMethod: string;
  status: "Pending" | "Processing" | "Completed" | "Failed";
  requestedDate: string;
  processedDate?: string;
  processedBy?: string;
}

// ── Customers ───────────────────────────────────────────────────────────────

export interface CustomerNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  addresses: OrderAddress[];
  totalSpent: number;
  ordersCount: number;
  aov: number;
  lastOrderDate?: string;
  firstOrderDate?: string;
  couponsUsed: number;
  returnsCount: number;
  refundsCount: number;
  reviewsCount: number;
  status: "Active" | "Inactive" | "Blocked";
  tags: string[];
  notes: CustomerNote[];
  joinedDate: string;
  city?: string;
  state?: string;
  segment?: string;
}

// ── Customer Segments ───────────────────────────────────────────────────────

export interface SegmentRule {
  field: string;
  operator: string;
  value: string;
}

export interface AdminSegment {
  id: string;
  name: string;
  description: string;
  type: "dynamic" | "static";
  rules: SegmentRule[];
  customerCount: number;
  createdAt: string;
  updatedAt: string;
}

// ── Reviews ─────────────────────────────────────────────────────────────────

export interface AdminReview {
  id: string;
  productId: string;
  productTitle: string;
  customerId?: string;
  customerName: string;
  rating: number;
  title?: string;
  comment: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected" | "Hidden";
  verified: boolean;
  featured: boolean;
  response?: string;
  responseDate?: string;
  images?: string[];
}

// ── Support Tickets ─────────────────────────────────────────────────────────

export interface AdminTicket {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  orderId?: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Waiting" | "Resolved" | "Closed";
  assignedStaff?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  responses?: { author: string; message: string; date: string }[];
}

// ── Coupons ─────────────────────────────────────────────────────────────────

export interface AdminCoupon {
  code: string;
  description: string;
  discountType: "Percentage" | "Fixed" | "Free Shipping" | "Buy X Get Y";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  perCustomerLimit?: number;
  usedCount: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  excludedProducts?: string[];
  customerSegments?: string[];
  status: "Active" | "Draft" | "Scheduled" | "Expired" | "Disabled";
  // Analytics
  totalRevenue: number;
  totalDiscountGiven: number;
  ordersGenerated: number;
  conversionRate: number;
  createdAt: string;
}

// ── Promotions ──────────────────────────────────────────────────────────────

export interface AdminPromotion {
  id: string;
  name: string;
  type: "Flash Sale" | "Seasonal" | "Product" | "Category" | "Bundle" | "Limited Time" | "First Order";
  description: string;
  discountPercent?: number;
  discountFixed?: number;
  startDate: string;
  endDate: string;
  timezone: string;
  status: "Active" | "Scheduled" | "Ended" | "Draft";
  productIds?: string[];
  categoryIds?: string[];
  priority: number;
  stackable: boolean;
  totalRevenue: number;
  ordersGenerated: number;
}

// ── Flash Deals ─────────────────────────────────────────────────────────────

export interface AdminFlashDeal {
  id: string;
  title: string;
  productId: string;
  productTitle?: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  stockLimit: number;
  soldCount: number;
  startTime: string;
  endTime: string;
  status: "Active" | "Upcoming" | "Expired";
}

// ── Abandoned Carts ─────────────────────────────────────────────────────────

export interface AdminAbandonedCart {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  items: { title: string; quantity: number; price: number; image?: string }[];
  cartValue: number;
  abandonedAt: string;
  lastActivity: string;
  recovered: boolean;
  recoveredAt?: string;
  remindersSent: number;
}

// ── Banners ─────────────────────────────────────────────────────────────────

export interface AdminBanner {
  id: string;
  name: string;
  type: "hero" | "promotional" | "campaign";
  desktopImage: string;
  mobileImage: string;
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  offer?: string;
  price?: string;
  ctaText: string;
  ctaLink: string;
  priority: number;
  startDate?: string;
  endDate?: string;
  status: "Active" | "Draft" | "Scheduled" | "Expired";
}

// ── Homepage Sections ───────────────────────────────────────────────────────

export interface AdminHomepageSection {
  id: string;
  name: string;
  type: string;
  description?: string;
  visible: boolean;
  sortOrder: number;
  badge?: string;
  title?: string;
  subtitle?: string;
  productIds?: string[];
  collectionId?: string;
  merchandisingMode?: "Manual" | "Latest" | "Best Selling" | "Trending" | "Highest Rated" | "Discounted";
  scheduledStart?: string;
  scheduledEnd?: string;
}

// ── Navigation ──────────────────────────────────────────────────────────────

export interface AdminNavLink {
  id: string;
  label: string;
  url: string;
  type: "header" | "secondary" | "category" | "footer";
  sortOrder: number;
  visible: boolean;
  parentId?: string;
  icon?: string;
}

// ── Pages / CMS ─────────────────────────────────────────────────────────────

export interface AdminPage {
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
  versions?: { content: string; updatedAt: string; updatedBy: string }[];
}

// ── Footer ──────────────────────────────────────────────────────────────────

export interface FooterColumn {
  id: string;
  title: string;
  links: { label: string; url: string }[];
}

export interface AdminFooter {
  description: string;
  columns: FooterColumn[];
  legalLinks: { label: string; url: string }[];
  socialLinks: Record<string, string>;
  contactEmail: string;
  contactPhone: string;
  copyright: string;
}

// ── Staff ───────────────────────────────────────────────────────────────────

export interface AdminStaff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: "Active" | "Inactive" | "Suspended";
  password?: string;
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
}

// ── Roles ───────────────────────────────────────────────────────────────────

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, string[]>; // e.g. { products: ["view", "create", "edit", "delete"] }
  staffCount: number;
  isSystem: boolean;
}

// ── Audit Logs ──────────────────────────────────────────────────────────────

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: string;
  entityType?: string;
  entityId?: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  ip?: string;
}

// ── Transactions ────────────────────────────────────────────────────────────

export interface AdminTransaction {
  id: string;
  date: string;
  orderId: string;
  type: "Sale" | "Refund" | "Shipping" | "Tax" | "Discount" | "Fee";
  description: string;
  amount: number;
  status: "Completed" | "Pending" | "Failed";
  paymentMethod?: string;
}

// ── Invoices ────────────────────────────────────────────────────────────────

export interface AdminInvoice {
  id: string;
  orderId: string;
  customerName: string;
  date: string;
  dueDate?: string;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  status: "Paid" | "Pending" | "Overdue" | "Cancelled";
  items: OrderLineItem[];
}

// ── Shipping ────────────────────────────────────────────────────────────────

export interface ShippingZone {
  id: string;
  name: string;
  regions: string[];
  methods: ShippingMethod[];
}

export interface ShippingMethod {
  id: string;
  name: string;
  rate: number;
  freeAbove?: number;
  estimatedDays: string;
  enabled: boolean;
}

// ── Webhooks ────────────────────────────────────────────────────────────────

export interface AdminWebhook {
  id: string;
  event: string;
  endpoint: string;
  secret?: string;
  status: "Active" | "Inactive" | "Failed";
  lastTriggered?: string;
  failCount: number;
}

// ── Automation ──────────────────────────────────────────────────────────────

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
  lastRun?: string;
  runCount: number;
}

// ── Notifications ───────────────────────────────────────────────────────────

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;
  icon?: string;
}

// ── Store Settings ──────────────────────────────────────────────────────────

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logo?: string;
  favicon?: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  country: string;
  language: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  taxRatePercent: number;
  taxInclusive: boolean;
  orderAutoConfirm: boolean;
  lowStockAlertThreshold: number;
  socialLinks: Record<string, string>;
  paymentMethods: Record<string, boolean>;
  seo: {
    title: string;
    description: string;
    ogImage?: string;
    canonical?: string;
    robots: string;
  };
}

// ── Admin Navigation ────────────────────────────────────────────────────────

export type AdminTab =
  // Overview
  | "dashboard"
  // Catalog
  | "products" | "categories" | "collections" | "inventory"
  // Orders
  | "orders" | "fulfillment" | "returns" | "refunds"
  // Customers
  | "customers" | "segments" | "reviews" | "support"
  // Marketing
  | "coupons" | "promotions" | "flash_deals" | "abandoned_carts"
  // Storefront
  | "homepage" | "banners" | "sections" | "navigation" | "pages" | "legal" | "footer_cms"
  // Finance
  | "transactions" | "invoices" | "taxes"
  // Analytics
  | "analytics_sales" | "analytics_products" | "analytics_customers" | "analytics_marketing" | "reports"
  // Staff & Security
  | "staff" | "roles" | "audit_logs" | "security"
  // Settings
  | "settings_store" | "settings_shipping" | "settings_payments" | "settings_notifications" | "settings_seo" | "settings_integrations";

export interface SidebarGroup {
  label: string;
  items: { key: AdminTab; label: string; icon: string; badge?: number }[];
}
