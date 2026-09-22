// ============================================================================
// FaasBay Commerce OS — Master Admin Portal Shell (/llp)
// Apple-inspired Minimal Frosted Glass Interface with Persistent State
// ============================================================================
import React, { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Image as ImageIcon,
  Tag,
  Settings,
  FolderTree,
  Archive,
  Users,
  ExternalLink,
  Search,
  Bell,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  LogOut,
  Store,
  ChevronDown,
  Layers,
  CreditCard,
  FileText,
  BarChart3,
  ShieldCheck,
  Zap,
  Globe,
  MessageSquare,
  Sparkles,
  DollarSign,
  TrendingUp,
  Star,
} from "lucide-react";

import faasbayLogo from "@/assets/faasbay-logo.png";

// Master Grouped Admin Module Components
import Dashboard from "@/admin/Dashboard";
import CatalogMasterView from "@/admin/Products";
import OrdersMasterView from "@/admin/Orders";
import CustomersMasterView from "@/admin/Customers";
import MarketingMasterView from "@/admin/Marketing";
import StorefrontMasterView from "@/admin/Storefront";
import FinanceMasterView from "@/admin/Finance";
import AnalyticsMasterView from "@/admin/Analytics";
import StaffSecurityMasterView from "@/admin/StaffSecurity";
import { StoreSettingsPage } from "@/admin/Settings";
import { AdminLoginGate } from "@/admin/AdminLoginGate";
import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/api-client";
import {
  getAdminUser,
  getAdminToken,
  clearAdminSession,
  SESSION_EVENT,
  type AdminUser,
} from "@/lib/admin-session";

export const Route = createFileRoute("/llp")({
  head: () => ({
    meta: [{ title: "FaasBay — Admin Portal" }],
  }),
  component: AdminManagementPortal,
});

type PrimaryTab =
  | "dashboard"
  | "orders"
  | "catalog"
  | "customers"
  | "marketing"
  | "storefront"
  | "finance"
  | "analytics"
  | "staff"
  | "settings";

interface NavItem {
  key: PrimaryTab;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  subSummary?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

function AdminManagementPortal() {
  const [mounted, setMounted] = useState(false);
  const [adminSession, setAdminSession] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = getAdminUser();
    if (!stored || !getAdminToken()) {
      setMounted(true);
      return;
    }

    // Show the portal straight away, then confirm the token is still valid
    // server-side — it may have expired or the account may have been disabled.
    setAdminSession(stored);
    setMounted(true);

    api
      .get<AdminUser>(API_ENDPOINTS.adminMe)
      .then((user) => setAdminSession(user || stored))
      .catch(() => {
        clearAdminSession();
        setAdminSession(null);
      });
  }, []);

  // Another tab signing in or out should move this one too.
  useEffect(() => {
    const sync = () => setAdminSession(getAdminToken() ? getAdminUser() : null);
    window.addEventListener(SESSION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SESSION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    setAdminSession(null);
  };

  // Persistent Tab & SubTab on Page Refresh
  const [activeTab, setActiveTab] = useState<PrimaryTab>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as PrimaryTab;
      if (tabParam) return tabParam;
      const saved = localStorage.getItem("faasbay_admin_active_tab") as PrimaryTab;
      if (saved) return saved;
    }
    return "dashboard";
  });

  const [initialSubTab, setInitialSubTab] = useState<string | undefined>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const subTabParam = params.get("subTab");
      if (subTabParam) return subTabParam;
      return localStorage.getItem("faasbay_admin_sub_tab") || undefined;
    }
    return undefined;
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      title: "Low Stock Alert",
      desc: "ANC Studio Headphones is down to 3 units.",
      time: "10m ago",
      type: "alert",
      read: false,
      tab: "catalog",
      subTab: "inventory",
    },
    {
      id: "n2",
      title: "New Order Placed",
      desc: "Order #FB-10024 placed by Priya Varma (₹3,499)",
      time: "1h ago",
      type: "order",
      read: false,
      tab: "orders",
      subTab: "orders",
    },
    {
      id: "n3",
      title: "Customer Return Requested",
      desc: "Return requested for Order #FB-10023.",
      time: "3h ago",
      type: "return",
      read: false,
      tab: "orders",
      subTab: "returns",
    },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const performNavigation = (tab: PrimaryTab, subTab?: string) => {
    setActiveTab(tab);
    setInitialSubTab(subTab);
    setMobileMenuOpen(false);

    if (typeof window !== "undefined") {
      localStorage.setItem("faasbay_admin_active_tab", tab);
      if (subTab) {
        localStorage.setItem("faasbay_admin_sub_tab", subTab);
      } else {
        localStorage.removeItem("faasbay_admin_sub_tab");
      }
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      if (subTab) {
        url.searchParams.set("subTab", subTab);
      } else {
        url.searchParams.delete("subTab");
      }
      url.searchParams.delete("action");
      url.searchParams.delete("productId");
      window.history.replaceState({}, "", url.toString());
      window.dispatchEvent(new CustomEvent("faasbay_admin_navigated", { detail: { tab, subTab } }));
    }
  };

  const navigateTo = (tab: PrimaryTab, subTab?: string) => {
    if (typeof window !== "undefined" && (window as any).__faasbay_is_form_open) {
      const allowed = window.dispatchEvent(
        new CustomEvent("faasbay_request_navigate", {
          cancelable: true,
          detail: { tab, subTab },
        })
      );
      if (!allowed) {
        return;
      }
    }
    performNavigation(tab, subTab);
  };

  useEffect(() => {
    const handleForceNav = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.tab) {
        performNavigation(detail.tab, detail.subTab);
      }
    };
    window.addEventListener("faasbay_force_navigate", handleForceNav);
    return () => window.removeEventListener("faasbay_force_navigate", handleForceNav);
  }, []);

  // Sync state to URL & localStorage on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const currentTab = url.searchParams.get("tab");
      const currentSubTab = url.searchParams.get("subTab");
      if (currentTab !== activeTab || currentSubTab !== (initialSubTab || null)) {
        url.searchParams.set("tab", activeTab);
        if (initialSubTab) {
          url.searchParams.set("subTab", initialSubTab);
        } else {
          url.searchParams.delete("subTab");
        }
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [activeTab, initialSubTab]);

  // Ultra-Clean Minimal Apple-Style Navigation
  const navGroups: NavGroup[] = [
    {
      title: "Operations",
      items: [
        { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} /> },
        {
          key: "orders",
          label: "Orders",
          icon: <ShoppingCart size={15} />,
          subSummary: "Orders, Shipments, Invoices, Returns, Refunds",
        },
        {
          key: "catalog",
          label: "Products",
          icon: <Package size={15} />,
          subSummary: "Products, Categories, Collections, Inventory, Stock",
        },
        {
          key: "customers",
          label: "Customers",
          icon: <Users size={15} />,
          subSummary: "Directory, Segments, Support Tickets, Inquiries",
        },
      ],
    },
    {
      title: "Marketing & Sales",
      items: [
        {
          key: "marketing",
          label: "Marketing",
          icon: <Tag size={15} />,
          subSummary: "Coupons, Promotions, Flash Deals, Abandoned Carts",
        },
        {
          key: "storefront",
          label: "Storefront CMS",
          icon: <ImageIcon size={15} />,
          subSummary: "Hero Banners, Homepage Sections, CMS Pages, Footer",
        },
        {
          key: "finance",
          label: "Finance",
          icon: <DollarSign size={15} />,
          subSummary: "Transactions, Tax Invoices, GST Config",
        },
        {
          key: "analytics",
          label: "Analytics",
          icon: <BarChart3 size={15} />,
          subSummary: "Sales Reports, Product Performance, Customer Cohorts",
        },
      ],
    },
    {
      title: "Control Center",
      items: [
        {
          key: "staff",
          label: "Staff & Security",
          icon: <ShieldCheck size={15} />,
          subSummary: "Staff Management, Roles & Permissions, Audit Logs",
        },
        {
          key: "settings",
          label: "Settings",
          icon: <Settings size={15} />,
          subSummary: "General Store Info, Currency, SEO, Payments",
        },
      ],
    },
  ];

  // Quick Jump Search Index across all modules & sub-modules
  const searchIndex = [
    { label: "Dashboard Overview", tab: "dashboard" as PrimaryTab, category: "Operations" },
    { label: "All Orders List", tab: "orders" as PrimaryTab, subTab: "orders", category: "Orders" },
    { label: "All Products Catalog", tab: "catalog" as PrimaryTab, subTab: "products", category: "Catalog" },
    { label: "Categories Management", tab: "catalog" as PrimaryTab, subTab: "categories", category: "Catalog" },
    { label: "Collections & Curations", tab: "catalog" as PrimaryTab, subTab: "collections", category: "Catalog" },
    { label: "Inventory & Stock Levels", tab: "catalog" as PrimaryTab, subTab: "inventory", category: "Catalog" },
    { label: "Customer Directory", tab: "customers" as PrimaryTab, subTab: "customers", category: "Customers" },
    { label: "Customer Segments", tab: "customers" as PrimaryTab, subTab: "segments", category: "Customers" },
    { label: "Support Tickets & Inquiries", tab: "customers" as PrimaryTab, subTab: "support", category: "Customers" },
    { label: "Discounts & Promo Coupons", tab: "marketing" as PrimaryTab, subTab: "coupons", category: "Marketing" },
    { label: "Promotional Campaigns", tab: "marketing" as PrimaryTab, subTab: "promotions", category: "Marketing" },
    { label: "Today's Flash Deals", tab: "marketing" as PrimaryTab, subTab: "flash_deals", category: "Marketing" },
    { label: "Abandoned Carts Recovery", tab: "marketing" as PrimaryTab, subTab: "abandoned_carts", category: "Marketing" },
    { label: "Hero Banners & Spotlight", tab: "storefront" as PrimaryTab, subTab: "banners", category: "Storefront" },
    { label: "Homepage Sections Layout", tab: "storefront" as PrimaryTab, subTab: "homepage", category: "Storefront" },
    { label: "Pages & Legal CMS Policies", tab: "storefront" as PrimaryTab, subTab: "pages", category: "Storefront" },
    { label: "Footer Links & Info", tab: "storefront" as PrimaryTab, subTab: "footer", category: "Storefront" },
    { label: "Transactions Ledger", tab: "finance" as PrimaryTab, subTab: "transactions", category: "Finance" },
    { label: "Tax Invoices Generator", tab: "finance" as PrimaryTab, subTab: "invoices", category: "Finance" },
    { label: "GST & Tax Configuration", tab: "finance" as PrimaryTab, subTab: "taxes", category: "Finance" },
    { label: "Sales & Growth Analytics", tab: "analytics" as PrimaryTab, subTab: "sales", category: "Analytics" },
    { label: "Product Performance Metrics", tab: "analytics" as PrimaryTab, subTab: "products", category: "Analytics" },
    { label: "Customer Retention Analytics", tab: "analytics" as PrimaryTab, subTab: "customers", category: "Analytics" },
    { label: "Business Data Export Reports", tab: "analytics" as PrimaryTab, subTab: "reports", category: "Analytics" },
    { label: "Staff Members Management", tab: "staff" as PrimaryTab, subTab: "staff", category: "Staff & Security" },
    { label: "Roles & Granular Permissions", tab: "staff" as PrimaryTab, subTab: "roles", category: "Staff & Security" },
    { label: "Activity Audit Logs Trail", tab: "staff" as PrimaryTab, subTab: "audit_logs", category: "Staff & Security" },
    { label: "General Store Settings", tab: "settings" as PrimaryTab, category: "Settings" },
  ];

  const renderActiveModule = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            onNavigate={(dest: string) => {
              if (dest === "orders") navigateTo("orders", "orders");
              else if (dest === "inventory") navigateTo("catalog", "inventory");
              else if (dest === "reviews") navigateTo("catalog", "products");
              else navigateTo(dest as PrimaryTab);
            }}
          />
        );
      case "catalog":
        return <CatalogMasterView initialSubTab={initialSubTab} onSubTabChange={(s) => setInitialSubTab(s)} />;
      case "orders":
        return <OrdersMasterView initialSubTab={initialSubTab} onSubTabChange={(s) => setInitialSubTab(s)} />;
      case "customers":
        return <CustomersMasterView initialSubTab={initialSubTab} onSubTabChange={(s) => setInitialSubTab(s)} />;
      case "marketing":
        return <MarketingMasterView initialSubTab={initialSubTab} onSubTabChange={(s) => setInitialSubTab(s)} />;
      case "storefront":
        return <StorefrontMasterView initialSubTab={initialSubTab} onSubTabChange={(s) => setInitialSubTab(s)} />;
      case "finance":
        return <FinanceMasterView initialSubTab={initialSubTab} onSubTabChange={(s) => setInitialSubTab(s)} />;
      case "analytics":
        return <AnalyticsMasterView initialSubTab={initialSubTab} onSubTabChange={(s) => setInitialSubTab(s)} />;
      case "staff":
        return <StaffSecurityMasterView initialSubTab={initialSubTab} onSubTabChange={(s) => setInitialSubTab(s)} />;
      case "settings":
        return <StoreSettingsPage />;
      default:
        return <Dashboard onNavigate={(t: string) => navigateTo(t as PrimaryTab)} />;
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!adminSession) {
    return <AdminLoginGate onLoginSuccess={(user) => setAdminSession(user)} />;
  }

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex text-slate-900 font-sans antialiased overflow-hidden relative">
      {/* ── Apple Ambient Mesh Background Glows ─────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-emerald-100/30 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-slate-200/40 blur-3xl" />
      </div>

      {/* ── Left Sidebar (Apple Minimal Frosted Glass) ──────────────── */}
      <aside className="hidden lg:flex flex-col w-60 h-screen bg-white/70 backdrop-blur-2xl border-r border-white/80 text-slate-700 shrink-0 select-none shadow-[0_8px_32px_rgba(0,0,0,0.03)] z-10">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/60 bg-white/40 shrink-0">
          <Link to="/llp" className="flex items-center gap-2.5">
            <img
              src={faasbayLogo}
              alt="FaasBay"
              className="h-6 w-auto object-contain"
            />
          </Link>
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200/60 shadow-2xs">
            {adminSession.role?.split(" ")[0] ?? "Staff"}
          </span>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-0.5">
              <div className="text-[10px] font-bold text-slate-400/90 px-2.5 py-1 uppercase tracking-wider">
                {group.title}
              </div>
              {group.items.map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => navigateTo(item.key)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={isActive ? "text-emerald-600 font-bold" : "text-slate-400"}>
                        {item.icon}
                      </span>
                      <span className="truncate text-xs font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          item.badgeColor ||
                          (isActive
                            ? "bg-slate-100 text-slate-800 border border-slate-200"
                            : "bg-white/80 backdrop-blur-md text-slate-600 border border-white/90")
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Staff Profile Bar */}
        <div className="p-3 border-t border-white/60 bg-white/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
              {adminSession.name?.charAt(0) ?? "?"}
            </div>
            <div className="min-w-0 truncate">
              <div className="text-xs font-bold text-slate-800 truncate">{adminSession.name}</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">{adminSession.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Lock & Logout Admin Portal"
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ── Mobile Drawer ───────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white/90 backdrop-blur-2xl text-slate-800 flex flex-col h-full shadow-2xl z-10">
            <div className="h-16 flex items-center justify-between px-4 border-b border-white/60">
              <img
                src={faasbayLogo}
                alt="FaasBay"
                className="h-6 w-auto object-contain"
              />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                    {group.title}
                  </div>
                  {group.items.map((item) => {
                    const isActive = activeTab === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => navigateTo(item.key)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80"
                            : "text-slate-600 hover:bg-white/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isActive ? "text-emerald-600" : "text-slate-400"}>
                            {item.icon}
                          </span>
                          <span className="text-xs font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/80 text-slate-700 font-bold border border-white/90">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout Body ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden z-10">
        {/* Top Navbar */}
        <header className="h-16 bg-white/65 backdrop-blur-2xl border-b border-white/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-[0_1px_15px_rgba(0,0,0,0.02)]">
          {/* Left: Mobile trigger & Page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/80 text-slate-600 cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900 tracking-tight capitalize">
                {activeTab === "storefront" ? "Storefront CMS" : activeTab === "catalog" ? "Products & Inventory" : activeTab}
              </span>
              <span className="text-slate-300 font-light">/</span>
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                {navGroups.flatMap((g) => g.items).find((i) => i.key === activeTab)?.label || "Overview"}
              </span>
            </div>
          </div>

          {/* Right: Search, Notifications & Store Link */}
          <div className="flex items-center gap-3">
            {/* Quick Feature Jump Search with Instant Dropdown */}
            <div className="relative w-full max-w-xs hidden md:block" role="presentation" data-form-type="other">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="search"
                role="searchbox"
                id="faasbay-admin-nav-search"
                name={`nav_srch_${Date.now()}`}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-1p-ignore="true"
                data-lpignore="true"
                data-protonpass-ignore="true"
                data-form-type="other"
                aria-label="Search store modules"
                enterKeyHint="search"
                placeholder="Search tools & features (e.g. coupons, returns)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/60 backdrop-blur-md border border-white/90 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 transition-all font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}

              {/* Instant Search Dropdown Popover */}
              {searchQuery.trim() && (() => {
                const q = searchQuery.toLowerCase();
                const matched = searchIndex.filter(
                  (item) => item.label.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
                );
                return (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] border border-white/90 z-50 p-2 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95">
                    <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                      Matching Modules ({matched.length})
                    </div>
                    {matched.length === 0 && (
                      <div className="text-xs text-slate-500 px-3 py-3 text-center">
                        No features match "{searchQuery}"
                      </div>
                    )}
                    {matched.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          navigateTo(item.tab, item.subTab);
                          setSearchQuery("");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50/80 transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                          <span className="font-semibold text-slate-800">{item.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-600">
                          {item.category}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Interactive Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl hover:bg-white/80 text-slate-600 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] border border-white/90 z-40 p-4 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100/80">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <button
                        onClick={markAllRead}
                        className="text-[11px] text-emerald-600 font-semibold cursor-pointer hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="space-y-2 mt-2 max-h-72 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            navigateTo(n.tab as PrimaryTab, n.subTab);
                            setShowNotifications(false);
                          }}
                          className="py-2.5 flex items-start gap-2.5 cursor-pointer hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors"
                        >
                          <div
                            className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                              n.type === "alert"
                                ? "bg-amber-50 text-amber-600"
                                : n.type === "order"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {n.type === "alert" ? (
                              <AlertCircle size={14} />
                            ) : n.type === "order" ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <RotateCcw size={14} />
                            )}
                          </div>
                          <div className="text-xs min-w-0 flex-1">
                            <p className="font-bold text-slate-800 truncate">{n.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">{n.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* View Storefront Link */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 border border-white/90 rounded-xl px-3 py-1.5 bg-white/70 backdrop-blur-md hover:bg-white transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)]"
            >
              <Store size={14} className="text-slate-800" />
              <span className="hidden sm:inline">Storefront</span>
              <ExternalLink size={11} className="text-slate-400" />
            </a>

            {/* FaasBay Admin Profile Badge */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200/80 shrink-0 select-none">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center text-xs font-bold shadow-2xs shrink-0">
                {adminSession.name?.charAt(0) ?? "?"}
              </div>
              <div className="hidden md:flex flex-col text-left shrink-0 whitespace-nowrap">
                <span className="text-xs font-bold text-slate-900 leading-tight">{adminSession.name}</span>
                <span className="text-[10px] text-emerald-600 font-semibold leading-none mt-0.5">{adminSession.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Content Viewport ────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <div className="max-w-7xl mx-auto">{renderActiveModule()}</div>
        </main>
      </div>
    </div>
  );
}
