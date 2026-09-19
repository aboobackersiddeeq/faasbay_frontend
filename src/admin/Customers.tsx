// ============================================================================
// FaasBay Commerce OS — Customers, Segments, Reviews, Support
// ============================================================================
import React, { useState } from "react";
import { Plus, Edit2, Trash2, Eye, Users, Star, MessageSquare, Tag, Mail, Filter } from "lucide-react";
import { DataTable, StatusBadge, PageHeader, SlideOver, ConfirmDialog, Btn, FormField, Input, Textarea, Select, Toggle, Card, KPICard, TabSwitcher, formatCurrency, formatNumber } from "./shared/components";
import type { AdminCustomer, AdminSegment, AdminReview, AdminTicket } from "./shared/types";
import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { useStoreProducts } from "@/components/store/data";

// ── Customers ───────────────────────────────────────────────────────────────

const initCustomers: AdminCustomer[] = [];

export function CustomersPage() {
  // Customer profiles are created server-side when an order is placed, so every
  // admin session sees the same list regardless of where the order came from.
  const [customers, setCustomers] = useState<AdminCustomer[]>(initCustomers);
  const [loading, setLoading] = useState(true);

  const loadCustomers = React.useCallback(async () => {
    try {
      const rows = await api.get<AdminCustomer[]>(API_ENDPOINTS.customers);
      setCustomers(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      toast.error(e?.message || "Could not load customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);
  const [selected, setSelected] = useState<AdminCustomer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);

  const handleDeleteCustomer = async (id: string) => {
    setDeleteId(null);
    try {
      await api.delete(`${API_ENDPOINTS.customers}/${encodeURIComponent(id)}`);
      await loadCustomers();
      toast.success("Customer deleted.");
    } catch (e: any) {
      toast.error(e?.message || "Could not delete the customer.");
    }
  };

  const handleClearAllCustomers = async () => {
    setClearAllConfirm(false);
    try {
      await api.delete(API_ENDPOINTS.customers);
      await loadCustomers();
      toast.success("All customers deleted.");
    } catch (e: any) {
      toast.error(e?.message || "Could not clear the customer list.");
    }
  };

  const columns = [
    { key: "name", label: "Customer", render: (c: AdminCustomer) => (<div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">{c.avatar && <img src={c.avatar} alt="" className="w-full h-full object-cover" />}</div><div><div className="text-xs font-medium text-gray-900">{c.name}</div><div className="text-[10px] text-gray-400">{c.email}</div></div></div>) },
    { key: "ordersCount", label: "Orders", sortable: true, render: (c: AdminCustomer) => <span className="text-xs text-gray-700">{c.ordersCount}</span> },
    { key: "totalSpent", label: "Total Spent", sortable: true, render: (c: AdminCustomer) => <span className="text-xs font-medium text-gray-900">{formatCurrency(c.totalSpent)}</span> },
    { key: "aov", label: "AOV", sortable: true, render: (c: AdminCustomer) => <span className="text-xs text-gray-600">{formatCurrency(c.aov)}</span> },
    { key: "city", label: "Location", render: (c: AdminCustomer) => <span className="text-xs text-gray-500">{c.city ? `${c.city}, ${c.state}` : "—"}</span> },
    { key: "tags", label: "Tags", render: (c: AdminCustomer) => (<div className="flex gap-1 flex-wrap">{c.tags.map(t => <span key={t} className="text-[10px] px-1 py-0.5 rounded bg-gray-100 text-gray-600">{t}</span>)}</div>) },
    { key: "status", label: "Status", render: (c: AdminCustomer) => <StatusBadge status={c.status} size="xs" /> },
  ];

  const avgClv = customers.length > 0 ? Math.round(customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length) : 0;

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={loading ? "Loading…" : `${customers.length} customers`}
        breadcrumbs={[{ label: "Customers" }, { label: "All Customers" }]}
        actions={
          <div className="flex items-center gap-2">
            {customers.length > 0 && (
              <Btn variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => setClearAllConfirm(true)}>
                Delete All Customers
              </Btn>
            )}
            <Btn variant="secondary" icon={<Mail size={13} />}>Export</Btn>
          </div>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPICard title="Total Customers" value={String(customers.length)} icon={<Users size={14} />} />
        <KPICard title="Active" value={String(customers.filter(c => c.status === "Active").length)} />
        <KPICard title="Avg. Lifetime Value" value={formatCurrency(avgClv)} />
        <KPICard title="Repeat Rate" value={customers.length > 0 ? `${Math.round((customers.filter(c => c.ordersCount > 1).length / customers.length) * 100)}%` : "0%"} />
      </div>
      <DataTable columns={columns} data={customers} keyField="id" searchPlaceholder="Search customers..." selectable
        actions={(c: AdminCustomer) => (
          <div className="flex items-center gap-1">
            <button onClick={() => { setSelected(c); setDrawerOpen(true); }} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="View Details">
              <Eye size={13} />
            </button>
            <button onClick={() => setDeleteId(c.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600" title="Delete Customer">
              <Trash2 size={13} />
            </button>
          </div>
        )}
      />
      <SlideOver open={drawerOpen} onClose={() => { setDrawerOpen(false); setSelected(null); }} title={selected?.name || ""} subtitle={selected?.email}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">{selected.avatar && <img src={selected.avatar} alt="" className="w-full h-full object-cover" />}</div>
              <div><div className="text-sm font-semibold text-gray-900">{selected.name}</div><div className="text-xs text-gray-500">{selected.phone}</div><div className="flex gap-1 mt-1">{selected.tags.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{t}</span>)}</div></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-2.5 text-center"><div className="text-[10px] text-gray-400">Orders</div><div className="text-sm font-semibold text-gray-900">{selected.ordersCount}</div></Card>
              <Card className="p-2.5 text-center"><div className="text-[10px] text-gray-400">Spent</div><div className="text-sm font-semibold text-gray-900">{formatCurrency(selected.totalSpent)}</div></Card>
              <Card className="p-2.5 text-center"><div className="text-[10px] text-gray-400">AOV</div><div className="text-sm font-semibold text-gray-900">{formatCurrency(selected.aov)}</div></Card>
            </div>
            <Card className="p-3">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Details</div>
              <div className="space-y-1.5 text-xs text-gray-700">
                <div>First Order: {selected.firstOrderDate}</div>
                <div>Last Order: {selected.lastOrderDate}</div>
                <div>Coupons Used: {selected.couponsUsed}</div>
                <div>Returns: {selected.returnsCount}</div>
                <div>Reviews: {selected.reviewsCount}</div>
                <div>Joined: {selected.joinedDate}</div>
              </div>
            </Card>
            {selected.addresses.length > 0 && (
              <Card className="p-3">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Address</div>
                <div className="text-xs text-gray-700">{selected.addresses[0].street}<br />{selected.addresses[0].city}, {selected.addresses[0].state} {selected.addresses[0].pincode}</div>
              </Card>
            )}
            {selected.notes.length > 0 && (
              <Card className="p-3">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Internal Notes</div>
                {selected.notes.map(n => (<div key={n.id} className="text-xs text-gray-600 mb-1"><span className="font-medium text-gray-800">{n.author}:</span> {n.text} <span className="text-gray-400">({n.createdAt})</span></div>))}
              </Card>
            )}
            <div className="pt-2">
              <Btn variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => { const id = selected.id; setDrawerOpen(false); setSelected(null); handleDeleteCustomer(id); }}>
                Delete This Customer
              </Btn>
            </div>
          </div>
        )}
      </SlideOver>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Customer"
        message="Are you sure you want to permanently delete this customer record?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { if (deleteId) handleDeleteCustomer(deleteId); }}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={clearAllConfirm}
        title="Delete All Customers"
        message="Are you sure you want to permanently delete all customer records?"
        confirmLabel="Delete All"
        variant="danger"
        onConfirm={handleClearAllCustomers}
        onCancel={() => setClearAllConfirm(false)}
      />
    </div>
  );
}

// ── Segments ────────────────────────────────────────────────────────────────

const initSegments: AdminSegment[] = [];

export function SegmentsPage() {
  const [segments] = useState<AdminSegment[]>(initSegments);
  const columns = [
    { key: "name", label: "Segment", render: (s: AdminSegment) => (<div><div className="text-xs font-medium text-gray-900">{s.name}</div><div className="text-[10px] text-gray-400">{s.description}</div></div>) },
    { key: "type", label: "Type", render: (s: AdminSegment) => <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${s.type === "dynamic" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{s.type}</span> },
    { key: "customerCount", label: "Customers", sortable: true, render: (s: AdminSegment) => <span className="text-xs font-medium text-gray-900">{s.customerCount}</span> },
    { key: "rules", label: "Rules", render: (s: AdminSegment) => <span className="text-xs text-gray-500">{s.rules.length} rule{s.rules.length > 1 ? "s" : ""}</span> },
    { key: "updatedAt", label: "Last Updated", render: (s: AdminSegment) => <span className="text-xs text-gray-500">{s.updatedAt}</span> },
  ];
  return (
    <div>
      <PageHeader title="Customer Segments" subtitle={`${segments.length} segments`} breadcrumbs={[{ label: "Customers" }, { label: "Segments" }]} actions={<Btn icon={<Plus size={13} />}>Create Segment</Btn>} />
      <DataTable columns={columns} data={segments} keyField="id" searchPlaceholder="Search segments..." />
    </div>
  );
}

// ── Reviews ─────────────────────────────────────────────────────────────────

const initReviews: AdminReview[] = [];

/** Flattens the per-product review arrays in the catalog into admin review rows. */
function collectReviews(products: any[]): AdminReview[] {
  const rows: AdminReview[] = [];
  products.forEach((p: any) => {
    if (!Array.isArray(p.customerReviews)) return;
    p.customerReviews.forEach((r: any) => {
      rows.push({
        id: r.id || `rev-${Math.random().toString(36).substring(2, 7)}`,
        productId: p.id,
        productTitle: p.title,
        customerName: r.author || "Verified Buyer",
        rating: r.rating || 5,
        title: r.comment ? r.comment.slice(0, 30) : "Customer Review",
        comment: r.comment || "",
        date: r.date || "Recent",
        status: "Approved",
        verified: r.verified ?? true,
        featured: false,
      } as AdminReview);
    });
  });
  return rows;
}

export function ReviewsPage() {
  // Product reviews live on the product documents in MongoDB.
  const storeProducts = useStoreProducts();
  const [reviews, setReviews] = useState<AdminReview[]>(initReviews);

  React.useEffect(() => {
    setReviews(collectReviews(storeProducts));
  }, [storeProducts]);

  const [tab, setTab] = useState("all");

  const filtered = tab === "all" ? reviews : reviews.filter(r => r.status === tab);

  const updateStatus = (id: string, status: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: status as any } : r));
  };

  const columns = [
    { key: "rating", label: "Rating", width: "60px", render: (r: AdminReview) => (<div className="flex items-center gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={10} className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />)}</div>) },
    { key: "productTitle", label: "Product", render: (r: AdminReview) => <span className="text-xs text-gray-700 truncate max-w-[140px] block">{r.productTitle}</span> },
    { key: "customerName", label: "Customer", render: (r: AdminReview) => (<div><div className="text-xs text-gray-900">{r.customerName}</div>{r.verified && <span className="text-[10px] text-emerald-600">✓ Verified</span>}</div>) },
    { key: "comment", label: "Review", width: "30%", render: (r: AdminReview) => (<div><div className="text-xs font-medium text-gray-900">{r.title}</div><div className="text-[11px] text-gray-500 truncate max-w-[220px]">{r.comment}</div></div>) },
    { key: "status", label: "Status", render: (r: AdminReview) => <StatusBadge status={r.status} size="xs" /> },
    { key: "date", label: "Date", render: (r: AdminReview) => <span className="text-xs text-gray-500">{r.date}</span> },
  ];

  return (
    <div>
      <PageHeader title="Reviews" subtitle={`${reviews.length} product reviews`} breadcrumbs={[{ label: "Customers" }, { label: "Reviews" }]} />
      <TabSwitcher tabs={[{ key: "all", label: "All", count: reviews.length }, { key: "Pending", label: "Pending", count: reviews.filter(r => r.status === "Pending").length }, { key: "Approved", label: "Approved", count: reviews.filter(r => r.status === "Approved").length }]} active={tab} onChange={setTab} />
      <DataTable columns={columns} data={filtered} keyField="id" searchPlaceholder="Search reviews..."
        actions={(r: AdminReview) => (
          <div className="flex items-center gap-1">
            {r.status !== "Approved" && <button onClick={() => updateStatus(r.id, "Approved")} className="px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 rounded hover:bg-emerald-100">Approve</button>}
            {r.status !== "Rejected" && <button onClick={() => updateStatus(r.id, "Rejected")} className="px-1.5 py-0.5 text-[10px] font-medium text-red-600 bg-red-50 rounded hover:bg-red-100">Reject</button>}
          </div>
        )}
      />
    </div>
  );
}

// ── Support ─────────────────────────────────────────────────────────────────

const initTickets: AdminTicket[] = [];

export function SupportPage() {
  const [tickets] = useState<AdminTicket[]>(initTickets);
  const columns = [
    { key: "id", label: "Ticket", render: (t: AdminTicket) => <span className="text-xs font-medium text-gray-900">{t.id}</span> },
    { key: "customerName", label: "Customer", render: (t: AdminTicket) => (<div><div className="text-xs text-gray-900">{t.customerName}</div><div className="text-[10px] text-gray-400">{t.customerEmail}</div></div>) },
    { key: "subject", label: "Subject", width: "30%", render: (t: AdminTicket) => <span className="text-xs text-gray-700">{t.subject}</span> },
    { key: "orderId", label: "Order", render: (t: AdminTicket) => <span className="text-xs text-gray-500">{t.orderId ? `#${t.orderId}` : "—"}</span> },
    { key: "priority", label: "Priority", render: (t: AdminTicket) => <StatusBadge status={t.priority} size="xs" /> },
    { key: "status", label: "Status", render: (t: AdminTicket) => <StatusBadge status={t.status} size="xs" /> },
    { key: "assignedStaff", label: "Assigned", render: (t: AdminTicket) => <span className="text-xs text-gray-500">{t.assignedStaff || "Unassigned"}</span> },
    { key: "createdAt", label: "Created", render: (t: AdminTicket) => <span className="text-xs text-gray-500">{t.createdAt}</span> },
  ];
  return (
    <div>
      <PageHeader title="Support Tickets" subtitle={`${tickets.length} tickets`} breadcrumbs={[{ label: "Customers" }, { label: "Support" }]} actions={<Btn icon={<Plus size={13} />}>New Ticket</Btn>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPICard title="Open" value={String(tickets.filter(t => t.status === "Open").length)} icon={<MessageSquare size={14} />} />
        <KPICard title="In Progress" value={String(tickets.filter(t => t.status === "In Progress").length)} />
        <KPICard title="Resolved" value={String(tickets.filter(t => t.status === "Resolved").length)} />
        <KPICard title="Avg Response" value="0.0 hrs" />
      </div>
      <DataTable columns={columns} data={tickets} keyField="id" searchPlaceholder="Search tickets..." />
    </div>
  );
}

export const SupportTicketsPage = SupportPage;

// ── Master Customers View with Sub-Navigation ──────────────────────────────

export default function CustomersMasterView({
  initialTab = "customers",
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
    return initialSubTab || initialTab || "customers";
  });
  const [customerCount, setCustomerCount] = useState(0);

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

  React.useEffect(() => {
    api
      .get<AdminCustomer[]>(API_ENDPOINTS.customers)
      .then((rows) => setCustomerCount(Array.isArray(rows) ? rows.length : 0))
      .catch(() => setCustomerCount(0));
  }, []);

  return (
    <div className="space-y-4">
      <TabSwitcher
        tabs={[
          { key: "customers", label: "All Customers", count: customerCount },
          { key: "segments", label: "Segments", count: initSegments.length },
          { key: "support", label: "Support Inquiries", count: initTickets.length },
        ]}
        active={tab}
        onChange={handleTabChange}
      />

      {tab === "customers" && <CustomersPage />}
      {tab === "segments" && <SegmentsPage />}
      {tab === "support" && <SupportPage />}
    </div>
  );
}

