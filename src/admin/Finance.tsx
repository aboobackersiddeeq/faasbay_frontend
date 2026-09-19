// ============================================================================
// FaasBay Commerce OS — Finance: Transactions, Invoices, Taxes
// ============================================================================
import React, { useState, useEffect } from "react";
import { Download, Printer, CreditCard, Receipt, DollarSign, FileText, Calculator } from "lucide-react";
import { DataTable, StatusBadge, PageHeader, KPICard, Card, Btn, Toggle, TabSwitcher, formatCurrency, DateRangeSelector } from "./shared/components";
import type { AdminTransaction, AdminInvoice } from "./shared/types";
import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

// ── Transactions ────────────────────────────────────────────────────────────

const initTransactions: AdminTransaction[] = [];

export function TransactionsPage() {
  const [dateRange, setDateRange] = useState("This Month");
  const sales = initTransactions.filter(t => t.type === "Sale");
  const refunds = initTransactions.filter(t => t.type === "Refund");
  const grossSales = sales.reduce((s, t) => s + t.amount, 0);
  const totalRefunds = Math.abs(refunds.reduce((s, t) => s + t.amount, 0));

  const columns = [
    { key: "id", label: "ID", render: (t: AdminTransaction) => <span className="text-xs font-mono text-gray-700">{t.id}</span> },
    { key: "date", label: "Date", sortable: true, render: (t: AdminTransaction) => <span className="text-xs text-gray-500">{t.date}</span> },
    { key: "orderId", label: "Order", render: (t: AdminTransaction) => <span className="text-xs text-gray-700">#{t.orderId}</span> },
    { key: "type", label: "Type", render: (t: AdminTransaction) => <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${t.type === "Sale" ? "bg-emerald-50 text-emerald-700" : t.type === "Refund" ? "bg-red-50 text-red-600" : t.type === "Tax" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{t.type}</span> },
    { key: "description", label: "Description", render: (t: AdminTransaction) => <span className="text-xs text-gray-600">{t.description}</span> },
    { key: "amount", label: "Amount", sortable: true, render: (t: AdminTransaction) => <span className={`text-xs font-medium ${t.amount >= 0 ? "text-gray-900" : "text-red-600"}`}>{t.amount >= 0 ? formatCurrency(t.amount) : `-${formatCurrency(Math.abs(t.amount))}`}</span> },
    { key: "paymentMethod", label: "Method", render: (t: AdminTransaction) => <span className="text-xs text-gray-500">{t.paymentMethod || "—"}</span> },
    { key: "status", label: "Status", render: (t: AdminTransaction) => <StatusBadge status={t.status} size="xs" /> },
  ];

  return (
    <div>
      <PageHeader title="Transactions" subtitle="Financial transaction ledger" breadcrumbs={[{ label: "Finance" }, { label: "Transactions" }]} actions={<div className="flex gap-2"><DateRangeSelector value={dateRange} onChange={setDateRange} /><Btn variant="secondary" icon={<Download size={13} />}>Export CSV</Btn></div>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPICard title="Gross Sales" value={formatCurrency(grossSales)} icon={<DollarSign size={14} />} change={12.4} />
        <KPICard title="Refunds" value={formatCurrency(totalRefunds)} icon={<CreditCard size={14} />} />
        <KPICard title="Net Sales" value={formatCurrency(grossSales - totalRefunds)} icon={<DollarSign size={14} />} />
        <KPICard title="Transactions" value={String(initTransactions.length)} />
      </div>
      <DataTable columns={columns} data={initTransactions} keyField="id" searchPlaceholder="Search transactions..." />
    </div>
  );
}

// ── Invoices ────────────────────────────────────────────────────────────────

const initInvoices: AdminInvoice[] = [];

export function InvoicesPage() {
  const columns = [
    { key: "id", label: "Invoice", render: (i: AdminInvoice) => <span className="text-xs font-medium text-gray-900">{i.id}</span> },
    { key: "orderId", label: "Order", render: (i: AdminInvoice) => <span className="text-xs text-gray-700">#{i.orderId}</span> },
    { key: "customerName", label: "Customer", render: (i: AdminInvoice) => <span className="text-xs text-gray-700">{i.customerName}</span> },
    { key: "date", label: "Date", sortable: true, render: (i: AdminInvoice) => <span className="text-xs text-gray-500">{i.date}</span> },
    { key: "subtotal", label: "Subtotal", render: (i: AdminInvoice) => <span className="text-xs text-gray-600">{formatCurrency(i.subtotal)}</span> },
    { key: "tax", label: "Tax", render: (i: AdminInvoice) => <span className="text-xs text-gray-600">{formatCurrency(i.tax)}</span> },
    { key: "total", label: "Total", sortable: true, render: (i: AdminInvoice) => <span className="text-xs font-medium text-gray-900">{formatCurrency(i.total)}</span> },
    { key: "status", label: "Status", render: (i: AdminInvoice) => <StatusBadge status={i.status} size="xs" /> },
  ];
  return (
    <div>
      <PageHeader title="Invoices" subtitle={`${initInvoices.length} invoices`} breadcrumbs={[{ label: "Finance" }, { label: "Invoices" }]} />
      <DataTable columns={columns} data={initInvoices} keyField="id" searchPlaceholder="Search invoices..."
        actions={() => (
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Printer size={13} /></button>
            <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Download size={13} /></button>
          </div>
        )}
      />
    </div>
  );
}

// ── Taxes ────────────────────────────────────────────────────────────────────

export function TaxesPage() {
  // GST configuration is part of store settings in MongoDB, so it applies to every
  // checkout rather than only the browser the switch was flipped in.
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState(18);
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api
      .get<any>(API_ENDPOINTS.settings)
      .then((settings) => {
        if (!settings) return;
        setTaxEnabled(Boolean(settings.taxEnabled));
        setTaxRate(Number(settings.taxRatePercent ?? 18));
        setTaxInclusive(Boolean(settings.taxInclusive));
      })
      .catch((e: any) => toast.error(e?.message || "Could not load tax settings."));
  }, []);

  const persist = async (changes: Record<string, unknown>) => {
    await api.put(API_ENDPOINTS.settings, changes);
  };

  const handleToggleMasterTax = async (nextVal: boolean) => {
    const previous = taxEnabled;
    setTaxEnabled(nextVal);
    try {
      await persist({ taxEnabled: nextVal });
    } catch (e: any) {
      setTaxEnabled(previous);
      toast.error(e?.message || "Could not update the tax switch.");
    }
  };

  const handleSave = async () => {
    try {
      await persist({ taxEnabled, taxRatePercent: taxRate, taxInclusive });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e: any) {
      toast.error(e?.message || "Could not save the tax settings.");
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150 max-w-2xl">
      <PageHeader
        title="Tax & GST Configuration"
        subtitle="Manage tax calculation engine, GST rates, and tax-inclusive pricing rules"
        breadcrumbs={[{ label: "Finance" }, { label: "Taxes" }]}
      />

      <Card className="p-6 space-y-5">
        {/* Master Toggle */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-bold text-slate-900">GST / Tax Calculation Engine</div>
            <div className="text-[11px] text-slate-500">
              Calculate tax automatically during checkout and on invoices
            </div>
          </div>
          <Toggle checked={taxEnabled} onChange={() => handleToggleMasterTax(!taxEnabled)} />
        </div>

        <div className={`space-y-4 transition-opacity ${taxEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Standard GST Rate (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-slate-400 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tax System Mode</label>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-700 font-medium">Prices are tax-inclusive</span>
                <Toggle checked={taxInclusive} onChange={() => setTaxInclusive(!taxInclusive)} />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
            <div className="text-xs font-bold text-slate-700">India GST Slabs & HSN Classes</div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Standard Rate (Gadgets & Electronics)</span>
                <span className="font-bold text-slate-900">{taxRate}%</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Reduced Rate (Cables & Accessories)</span>
                <span className="font-bold text-slate-900">12%</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Zero Rate / Exempted Items</span>
                <span className="font-bold text-slate-900">0%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          {savedSuccess ? (
            <span className="text-xs font-medium text-emerald-600">✓ Tax settings saved successfully</span>
          ) : (
            <span className="text-[11px] text-slate-400">Settings apply across storefront checkout & invoices</span>
          )}
          <Btn onClick={handleSave}>Save Tax Settings</Btn>
        </div>
      </Card>
    </div>
  );
}

// ── Master Finance View with Sub-Navigation ────────────────────────────────

export default function FinanceMasterView({
  initialTab = "transactions",
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
    return initialSubTab || initialTab || "transactions";
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
          { key: "transactions", label: "Transactions Ledger", count: 8 },
          { key: "invoices", label: "Tax Invoices", count: 3 },
          { key: "taxes", label: "GST & Tax Configuration" },
        ]}
        active={tab}
        onChange={handleTabChange}
      />

      {tab === "transactions" && <TransactionsPage />}
      {tab === "invoices" && <InvoicesPage />}
      {tab === "taxes" && <TaxesPage />}
    </div>
  );
}

