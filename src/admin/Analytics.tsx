// ============================================================================
// FaasBay Commerce OS — Analytics & Reports
// ============================================================================
import React, { useState } from "react";
import { Download, TrendingUp, ShoppingCart, Users, Tag, Package, BarChart3 } from "lucide-react";
import { PageHeader, KPICard, Card, Btn, DateRangeSelector, TabSwitcher, formatCurrency, formatNumber } from "./shared/components";

// Simple SVG bar chart
function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[9px] text-gray-500">{formatNumber(v)}</span>
          <div className="w-full bg-gray-800 rounded-t" style={{ height: `${(v / max) * 100}%`, minHeight: 2 }} />
          <span className="text-[9px] text-gray-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Sales Analytics ─────────────────────────────────────────────────────────

export function SalesAnalyticsPage() {
  const [dateRange, setDateRange] = useState("This Month");
  const revenueData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const ordersData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div>
      <PageHeader title="Sales Analytics" subtitle="Revenue, orders, and growth metrics" breadcrumbs={[{ label: "Analytics" }, { label: "Sales" }]} actions={<div className="flex gap-2"><DateRangeSelector value={dateRange} onChange={setDateRange} /><Btn variant="secondary" icon={<Download size={13} />}>Export</Btn></div>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPICard title="Revenue" value={formatCurrency(0)} change={0} icon={<TrendingUp size={14} />} />
        <KPICard title="Orders" value="0" change={0} icon={<ShoppingCart size={14} />} />
        <KPICard title="AOV" value={formatCurrency(0)} change={0} />
        <KPICard title="Units Sold" value="0" change={0} icon={<Package size={14} />} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <Card className="p-4"><h3 className="text-sm font-semibold text-gray-900 mb-3">Revenue Trend</h3><BarChart data={revenueData} labels={labels} /></Card>
        <Card className="p-4"><h3 className="text-sm font-semibold text-gray-900 mb-3">Orders Trend</h3><BarChart data={ordersData} labels={labels} /></Card>
      </div>
    </div>
  );
}

// ── Product Analytics ────────────────────────────────────────────────────────

export function ProductAnalyticsPage() {
  const products: Array<{ name: string; units: number; revenue: number; views: number; addToCart: number; conversion: number }> = [];
  return (
    <div>
      <PageHeader title="Product Analytics" subtitle="Product performance metrics" breadcrumbs={[{ label: "Analytics" }, { label: "Products" }]} />
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-100 text-[11px] text-gray-500 uppercase tracking-wider"><th className="text-left px-4 py-2.5 font-medium">Product</th><th className="text-right px-3 py-2.5 font-medium">Units</th><th className="text-right px-3 py-2.5 font-medium">Revenue</th><th className="text-right px-3 py-2.5 font-medium">Views</th><th className="text-right px-3 py-2.5 font-medium">Add to Cart</th><th className="text-right px-3 py-2.5 font-medium">Conversion</th></tr></thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-gray-500">
                  No product analytics data available yet.
                </td>
              </tr>
            ) : (
              products.map((p, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="px-4 py-2.5 text-xs text-gray-900">{p.name}</td><td className="px-3 py-2.5 text-xs text-gray-700 text-right">{p.units}</td><td className="px-3 py-2.5 text-xs font-medium text-gray-900 text-right">{formatCurrency(p.revenue)}</td><td className="px-3 py-2.5 text-xs text-gray-600 text-right">{formatNumber(p.views)}</td><td className="px-3 py-2.5 text-xs text-gray-600 text-right">{p.addToCart}</td><td className="px-3 py-2.5 text-xs font-medium text-emerald-700 text-right">{p.conversion}%</td></tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ── Customer Analytics ──────────────────────────────────────────────────────

export function CustomerAnalyticsPage() {
  return (
    <div>
      <PageHeader title="Customer Analytics" subtitle="Customer acquisition and retention" breadcrumbs={[{ label: "Analytics" }, { label: "Customers" }]} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPICard title="New Customers" value="0" change={0} icon={<Users size={14} />} />
        <KPICard title="Returning" value="0%" change={0} />
        <KPICard title="Repeat Purchase" value="0x" change={0} />
        <KPICard title="Avg CLV" value={formatCurrency(0)} change={0} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Cities</h3>
          <div className="py-6 text-center text-xs text-gray-500">No regional order data yet</div>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Segments</h3>
          <div className="py-6 text-center text-xs text-gray-500">No customer segmentation data yet</div>
        </Card>
      </div>
    </div>
  );
}

// ── Marketing Analytics ──────────────────────────────────────────────────────

export function MarketingAnalyticsPage() {
  return (
    <div>
      <PageHeader title="Marketing Analytics" subtitle="Coupon, promotion, and campaign performance" breadcrumbs={[{ label: "Analytics" }, { label: "Marketing" }]} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPICard title="Coupon Revenue" value={formatCurrency(0)} change={0} icon={<Tag size={14} />} />
        <KPICard title="Total Discount" value={formatCurrency(0)} change={0} />
        <KPICard title="Coupon Orders" value="0" change={0} />
        <KPICard title="Coupon Conversion" value="0.0%" change={0} />
      </div>
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Performing Coupons</h3>
        <div className="py-6 text-center text-xs text-gray-500">No coupon usage recorded yet</div>
      </Card>
    </div>
  );
}

// ── Reports ─────────────────────────────────────────────────────────────────

export function ReportsPage() {
  const reports = [
    { name: "Orders Report", description: "All orders with customer and payment details", icon: <ShoppingCart size={16} />, type: "CSV" },
    { name: "Products Report", description: "Product catalog with stock and pricing", icon: <Package size={16} />, type: "CSV" },
    { name: "Customers Report", description: "Customer list with order history", icon: <Users size={16} />, type: "CSV" },
    { name: "Inventory Report", description: "Current stock levels and movements", icon: <Package size={16} />, type: "CSV" },
    { name: "Sales Summary", description: "Revenue, orders, and AOV summary", icon: <TrendingUp size={16} />, type: "CSV" },
    { name: "Coupon Performance", description: "Coupon usage and revenue impact", icon: <Tag size={16} />, type: "CSV" },
    { name: "Refunds Report", description: "All refund transactions", icon: <BarChart3 size={16} />, type: "CSV" },
  ];

  const downloadCSV = (name: string) => {
    alert(`Downloading ${name}...`);
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and export business reports" breadcrumbs={[{ label: "Analytics" }, { label: "Reports" }]} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {reports.map(r => (
          <Card key={r.name} className="p-4 flex items-start gap-3 hover:shadow-sm transition-shadow">
            <div className="p-2 rounded-md bg-gray-50 text-gray-500">{r.icon}</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{r.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{r.description}</div>
              <button onClick={() => downloadCSV(r.name)} className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 hover:text-gray-900 transition-colors"><Download size={11} /> Download {r.type}</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Master Analytics View with Sub-Navigation ──────────────────────────────

export default function AnalyticsMasterView({
  initialTab = "sales",
  initialSubTab,
  onSubTabChange,
}: {
  initialTab?: string;
  initialSubTab?: string;
  onSubTabChange?: (sub: string) => void;
}) {
  const [tab, setTab] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get("subTab");
      if (sub) return sub;
    }
    return initialSubTab || initialTab || "sales";
  });

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    onSubTabChange?.(newTab);
    if (typeof window !== "undefined") {
      localStorage.setItem("faasbay_admin_sub_tab", newTab);
      const url = new URL(window.location.href);
      url.searchParams.set("subTab", newTab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div className="space-y-4">
      <TabSwitcher
        tabs={[
          { key: "sales", label: "Sales & Revenue" },
          { key: "products", label: "Product Performance" },
          { key: "customers", label: "Customer Growth" },
          { key: "reports", label: "Data Reports & Exports" },
        ]}
        active={tab}
        onChange={handleTabChange}
      />

      {tab === "sales" && <SalesAnalyticsPage />}
      {tab === "products" && <ProductAnalyticsPage />}
      {tab === "customers" && <CustomerAnalyticsPage />}
      {tab === "reports" && <ReportsPage />}
    </div>
  );
}

