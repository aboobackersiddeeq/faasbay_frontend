// ============================================================================
// FaasBay Commerce OS — Settings: Store, Shipping, Payments, SEO, Integrations
// ============================================================================
import React, { useState } from "react";
import {
  Save,
  Globe,
  Truck,
  CreditCard,
  Bell,
  Search,
  Link2,
  Webhook,
  Zap,
  Mail,
  Shield,
  Settings as SettingsIcon,
  Plus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Activity,
  Check,
  Layers,
} from "lucide-react";
import {
  PageHeader,
  Card,
  Btn,
  FormField,
  Input,
  Textarea,
  Select,
  Toggle,
} from "./shared/components";
import { useFeatureFlags } from "@/lib/feature-flags";

// ── Tabbed Settings Master View ──────────────────────────────────────────────

export function StoreSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "store" | "features" | "seo" | "payments" | "shipping" | "notifications" | "integrations"
  >("store");

  // Store General Settings State
  const [settings, setSettings] = useState({
    storeName: "FaasBay",
    tagline: "to cart... to life...",
    contactEmail: "support@faasbay.com",
    contactPhone: "+91 9746598889",
    address: "Faasbay Trading LLP, 37G&H, Treasury Road, Malappuram, Kerala — 676101",
    currency: "INR (₹)",
    currencySymbol: "₹",
    timezone: "Asia/Kolkata (IST +5:30)",
    country: "India",
    language: "English",
    freeShippingThreshold: 999,
    standardShippingFee: 49,
    lowStockAlertThreshold: 5,
    socialLinks: {
      instagram: "https://instagram.com/faasbay",
      facebook: "https://facebook.com/faasbay",
      twitter: "https://twitter.com/faasbay",
      youtube: "",
    },
  });

  const u = (field: string, value: any) => setSettings({ ...settings, [field]: value });

  // SEO Settings State
  const [seo, setSeo] = useState({
    title: "FaasBay — to cart... to life...",
    description: "Official FaasBay Direct Store — Premium wireless audio, smart gadgets, and precision tech gear.",
    ogImage: "",
    canonical: "https://faasbay.com",
    robots: "index, follow",
  });

  // Payment Methods
  const [methods, setMethods] = useState([
    { id: "upi", name: "UPI (Google Pay, PhonePe, Paytm)", enabled: true, mode: "Live" },
    { id: "cards", name: "Credit / Debit Cards (Visa, Mastercard, RuPay)", enabled: true, mode: "Live" },
    { id: "netbanking", name: "Net Banking (All Indian Banks)", enabled: true, mode: "Live" },
    { id: "cod", name: "Cash on Delivery (COD)", enabled: true, mode: "Live" },
    { id: "razorpay", name: "Razorpay Payment Gateway", enabled: true, mode: "Live" },
  ]);

  const toggleMethod = (id: string) =>
    setMethods(methods.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));

  // Notifications
  const [notifs, setNotifs] = useState([
    { id: "new_order", label: "New Order Placed", email: true, push: true },
    { id: "low_stock", label: "Low Stock Alert", email: true, push: true },
    { id: "out_of_stock", label: "Out of Stock", email: true, push: false },
    { id: "refund_request", label: "Refund Requested", email: true, push: true },
    { id: "new_review", label: "New Customer Review", email: false, push: true },
  ]);

  const toggleNotif = (id: string, field: "email" | "push") =>
    setNotifs(notifs.map((n) => (n.id === id ? { ...n, [field]: !n[field] } : n)));

  // Master Feature Control & System Flags State (persisted via useFeatureFlags)
  const { flags: featureFlags, toggleFlag: toggleFeatureFlag } = useFeatureFlags();

  const tabs = [
    { key: "store", label: "Store & Brand", icon: <SettingsIcon size={14} /> },
    { key: "features", label: "Feature Control", icon: <Layers size={14} />, badge: "Full Control" },
    { key: "seo", label: "SEO & Search Engines", icon: <Globe size={14} /> },
    { key: "payments", label: "Payments & Gateways", icon: <CreditCard size={14} /> },
    { key: "shipping", label: "Shipping & Rates", icon: <Truck size={14} /> },
    { key: "notifications", label: "Notifications", icon: <Bell size={14} /> },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Settings & Integrations"
        subtitle="Manage store configurations, feature controls, SEO directives, and payment systems"
        breadcrumbs={[{ label: "Settings" }]}
      />

      {/* Apple-style Segmented Tab Navigation */}
      <div className="p-1 bg-slate-200/60 backdrop-blur-md rounded-2xl border border-slate-200/80 inline-flex items-center gap-1 overflow-x-auto max-w-full shadow-2xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: STORE & BRAND ─────────────────────────────────────────── */}
      {activeTab === "store" && (
        <div className="max-w-3xl space-y-5 animate-in fade-in duration-150">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SettingsIcon size={16} className="text-emerald-600" />
              <span>Store Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Store Name" required>
                <Input value={settings.storeName} onChange={(e) => u("storeName", e.target.value)} />
              </FormField>
              <FormField label="Tagline">
                <Input value={settings.tagline} onChange={(e) => u("tagline", e.target.value)} />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Contact Email">
                <Input type="email" value={settings.contactEmail} onChange={(e) => u("contactEmail", e.target.value)} />
              </FormField>
              <FormField label="Contact Phone">
                <Input value={settings.contactPhone} onChange={(e) => u("contactPhone", e.target.value)} />
              </FormField>
            </div>
            <FormField label="Official Operating Address">
              <Textarea rows={2} value={settings.address} onChange={(e) => u("address", e.target.value)} />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Currency">
                <Input value={settings.currency} onChange={(e) => u("currency", e.target.value)} />
              </FormField>
              <FormField label="Timezone">
                <Input value={settings.timezone} onChange={(e) => u("timezone", e.target.value)} />
              </FormField>
              <FormField label="Country">
                <Input value={settings.country} onChange={(e) => u("country", e.target.value)} />
              </FormField>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Commerce Shipping Rules</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Free Shipping Above (₹)">
                <Input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => u("freeShippingThreshold", Number(e.target.value))}
                />
              </FormField>
              <FormField label="Standard Shipping Fee (₹)">
                <Input
                  type="number"
                  value={settings.standardShippingFee}
                  onChange={(e) => u("standardShippingFee", Number(e.target.value))}
                />
              </FormField>
              <FormField label="Low Stock Warning">
                <Input
                  type="number"
                  value={settings.lowStockAlertThreshold}
                  onChange={(e) => u("lowStockAlertThreshold", Number(e.target.value))}
                />
              </FormField>
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB: FEATURE CONTROL & FLAGS ─────────────────────────────────── */}
      {activeTab === "features" && (
        <div className="max-w-4xl space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Layers size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Master Feature Switchboard</h4>
                <p className="text-[11px] text-slate-500">
                  Toggle storefront banners, taxes, AI engines, and checkout features on or off in real-time.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
              Live Control Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Storefront Banners & Merchandising */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Globe size={14} className="text-emerald-600" />
                  <span>Storefront Banners & Layout</span>
                </h3>
                <span className="text-[10px] text-slate-400">Homepage</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Dual Hero Carousel Banners</div>
                    <div className="text-[11px] text-slate-400">Top showcase sliding hero banners</div>
                  </div>
                  <Toggle
                    checked={featureFlags.heroBanners}
                    onChange={() => toggleFeatureFlag("heroBanners")}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Spotlight Promo Banners</div>
                    <div className="text-[11px] text-slate-400">Auto-sliding middle promotional banners</div>
                  </div>
                  <Toggle
                    checked={featureFlags.spotlightBanners}
                    onChange={() => toggleFeatureFlag("spotlightBanners")}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Editorial Campaign Banners</div>
                    <div className="text-[11px] text-slate-400">Split marketing campaign cards</div>
                  </div>
                  <Toggle
                    checked={featureFlags.editorialBanners}
                    onChange={() => toggleFeatureFlag("editorialBanners")}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Trust & Benefits Marquee</div>
                    <div className="text-[11px] text-slate-400">Scrolling warranty, COD & fast delivery ticker</div>
                  </div>
                  <Toggle
                    checked={featureFlags.trustMarquee}
                    onChange={() => toggleFeatureFlag("trustMarquee")}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Today's Flash Deals & Timer</div>
                    <div className="text-[11px] text-slate-400">Discounted products slider with countdown</div>
                  </div>
                  <Toggle
                    checked={featureFlags.flashDealsTimer}
                    onChange={() => toggleFeatureFlag("flashDealsTimer")}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Storefront Price & Product Filters</div>
                    <div className="text-[11px] text-slate-400">Customer price range filter, category pills, and sorting toolbar</div>
                  </div>
                  <Toggle
                    checked={featureFlags.storefrontFilters}
                    onChange={() => toggleFeatureFlag("storefrontFilters")}
                  />
                </div>
              </div>
            </Card>

            {/* 2. Finance, Taxes & Invoicing */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <CreditCard size={14} className="text-amber-500" />
                  <span>Finance & Tax Rules</span>
                </h3>
                <span className="text-[10px] text-slate-400">GST / Invoices</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">GST / Tax Calculation</div>
                    <div className="text-[11px] text-slate-400">Enable automatic GST calculation on checkout</div>
                  </div>
                  <Toggle
                    checked={featureFlags.taxCalculation}
                    onChange={() => toggleFeatureFlag("taxCalculation")}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Tax-Inclusive Pricing Mode</div>
                    <div className="text-[11px] text-slate-400">Store prices already include GST taxes</div>
                  </div>
                  <Toggle
                    checked={featureFlags.taxInclusivePrices}
                    onChange={() => toggleFeatureFlag("taxInclusivePrices")}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">GST Tax Invoices & Labels</div>
                    <div className="text-[11px] text-slate-400">Generate printable GST invoice & shipping slips</div>
                  </div>
                  <Toggle
                    checked={featureFlags.taxInvoicing}
                    onChange={() => toggleFeatureFlag("taxInvoicing")}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">MRP Discount & Promo Badges</div>
                    <div className="text-[11px] text-slate-400">Show percentage savings on product listings</div>
                  </div>
                  <Toggle
                    checked={featureFlags.mrpDiscountBadges}
                    onChange={() => toggleFeatureFlag("mrpDiscountBadges")}
                  />
                </div>
              </div>
            </Card>

            {/* 3. Search & SEO Automation Tools */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Globe size={14} className="text-emerald-600" />
                  <span>Search & SEO Automation</span>
                </h3>
                <span className="text-[10px] text-slate-400">Storefront</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Real-Time SEO Auto-Sync</div>
                    <div className="text-[11px] text-slate-400">Sync meta title, description & slug as you type</div>
                  </div>
                  <Toggle
                    checked={featureFlags.aiSeoSync}
                    onChange={() => toggleFeatureFlag("aiSeoSync")}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Smart Search & Autocomplete</div>
                    <div className="text-[11px] text-slate-400">Instant query suggestions on navigation bar</div>
                  </div>
                  <Toggle
                    checked={featureFlags.smartSearch}
                    onChange={() => toggleFeatureFlag("smartSearch")}
                  />
                </div>
              </div>
            </Card>

            {/* 4. Checkout & Storefront Experience */}
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Truck size={14} className="text-blue-500" />
                  <span>Orders & Storefront Experience</span>
                </h3>
                <span className="text-[10px] text-slate-400">Checkout</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Free Express Delivery Rules</div>
                    <div className="text-[11px] text-slate-400">Free shipping trigger over ₹999</div>
                  </div>
                  <Toggle
                    checked={featureFlags.freeExpressDelivery}
                    onChange={() => toggleFeatureFlag("freeExpressDelivery")}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Cash on Delivery (COD)</div>
                    <div className="text-[11px] text-slate-400">Allow customers to pay upon delivery</div>
                  </div>
                  <Toggle
                    checked={featureFlags.cashOnDelivery}
                    onChange={() => toggleFeatureFlag("cashOnDelivery")}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Low Stock Indicators</div>
                    <div className="text-[11px] text-slate-400">Display low inventory urgency warnings</div>
                  </div>
                  <Toggle
                    checked={featureFlags.lowStockAlerts}
                    onChange={() => toggleFeatureFlag("lowStockAlerts")}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Customer Star Reviews</div>
                    <div className="text-[11px] text-slate-400">Enable Google Rich review snippets and ratings</div>
                  </div>
                  <Toggle
                    checked={featureFlags.productReviews}
                    onChange={() => toggleFeatureFlag("productReviews")}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB 3: SEO & SEARCH ENGINES ─────────────────────────────────── */}
      {activeTab === "seo" && (
        <div className="max-w-2xl space-y-5 animate-in fade-in duration-150">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe size={16} className="text-emerald-600" />
              <span>Storefront SEO & Global Search Tags</span>
            </h3>
            <FormField label="Homepage Meta Title">
              <Input value={seo.title} onChange={(e) => setSeo({ ...seo, title: e.target.value })} />
            </FormField>
            <FormField label="Global Meta Description">
              <Textarea rows={3} value={seo.description} onChange={(e) => setSeo({ ...seo, description: e.target.value })} />
            </FormField>
            <FormField label="Canonical Domain">
              <Input value={seo.canonical} onChange={(e) => setSeo({ ...seo, canonical: e.target.value })} />
            </FormField>
            <FormField label="Robots.txt Directives">
              <Input value={seo.robots} onChange={(e) => setSeo({ ...seo, robots: e.target.value })} />
            </FormField>
          </Card>
        </div>
      )}

      {/* ── TAB 4: PAYMENTS & GATEWAYS ───────────────────────────────────── */}
      {activeTab === "payments" && (
        <div className="max-w-2xl space-y-3 animate-in fade-in duration-150">
          {methods.map((m) => (
            <Card key={m.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3.5">
                <CreditCard size={18} className="text-slate-500" />
                <div>
                  <div className="text-xs font-bold text-slate-900">{m.name}</div>
                  <div className="text-[10px] text-slate-400">Mode: {m.mode}</div>
                </div>
              </div>
              <Toggle checked={m.enabled} onChange={() => toggleMethod(m.id)} />
            </Card>
          ))}
        </div>
      )}

      {/* ── TAB 5: SHIPPING & RATES ──────────────────────────────────────── */}
      {activeTab === "shipping" && (
        <div className="max-w-2xl space-y-3 animate-in fade-in duration-150">
          <Card className="p-4.5 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">All India Express Shipping</h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                DTDC / BlueDart
              </span>
            </div>
            <div className="text-xs text-slate-500">Free Doorstep delivery on all orders above ₹999. Flat ₹49 below.</div>
          </Card>
        </div>
      )}

      {/* ── TAB 6: NOTIFICATIONS ─────────────────────────────────────────── */}
      {activeTab === "notifications" && (
        <div className="max-w-lg animate-in fade-in duration-150">
          <Card className="overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Event</th>
                  <th className="text-center px-3 py-3 font-semibold">Email</th>
                  <th className="text-center px-3 py-3 font-semibold">Push</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notifs.map((n) => (
                  <tr key={n.id}>
                    <td className="px-4 py-3 text-slate-700 font-medium">{n.label}</td>
                    <td className="px-3 py-3 text-center">
                      <Toggle checked={n.email} onChange={() => toggleNotif(n.id, "email")} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Toggle checked={n.push} onChange={() => toggleNotif(n.id, "push")} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Standalone Legacy Exports for compatibility ───────────────────────────────
export function ShippingSettingsPage() {
  return <StoreSettingsPage />;
}
export function PaymentSettingsPage() {
  return <StoreSettingsPage />;
}
export function NotificationSettingsPage() {
  return <StoreSettingsPage />;
}
export function SEOSettingsPage() {
  return <StoreSettingsPage />;
}
export function IntegrationsPage() {
  return <StoreSettingsPage />;
}
