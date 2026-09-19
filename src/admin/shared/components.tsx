// ============================================================================
// FaasBay Commerce OS — Shared Admin UI Components
// ============================================================================
import React, { useState, useMemo } from "react";
import {
  Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  X, AlertTriangle, ArrowUpRight, ArrowDownRight, Minus,
  Filter, Download, Plus, MoreHorizontal, Check
} from "lucide-react";

// ── Status Badge ────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  // Order statuses
  "Pending": "bg-amber-50 text-amber-700 border-amber-200",
  "Confirmed": "bg-blue-50 text-blue-700 border-blue-200",
  "Processing": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Packed": "bg-violet-50 text-violet-700 border-violet-200",
  "Ready to Ship": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Shipped": "bg-sky-50 text-sky-700 border-sky-200",
  "Out for Delivery": "bg-teal-50 text-teal-700 border-teal-200",
  "Delivered": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Cancelled": "bg-red-50 text-red-700 border-red-200",
  "Return Requested": "bg-orange-50 text-orange-700 border-orange-200",
  "Returned": "bg-slate-50 text-slate-600 border-slate-200",
  "Refund Pending": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Refunded": "bg-gray-50 text-gray-600 border-gray-200",
  "Payment Failed": "bg-red-50 text-red-700 border-red-200",
  // Generic
  "Active": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Inactive": "bg-gray-50 text-gray-500 border-gray-200",
  "Draft": "bg-slate-50 text-slate-600 border-slate-200",
  "Published": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Archived": "bg-gray-50 text-gray-500 border-gray-200",
  "Scheduled": "bg-blue-50 text-blue-700 border-blue-200",
  "Expired": "bg-gray-50 text-gray-500 border-gray-200",
  "Disabled": "bg-gray-50 text-gray-400 border-gray-200",
  "Blocked": "bg-red-50 text-red-700 border-red-200",
  "Suspended": "bg-red-50 text-red-600 border-red-200",
  // Stock
  "In Stock": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Low Stock": "bg-amber-50 text-amber-700 border-amber-200",
  "Out of Stock": "bg-red-50 text-red-700 border-red-200",
  // Payment
  "Paid": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Failed": "bg-red-50 text-red-700 border-red-200",
  "Partially Refunded": "bg-yellow-50 text-yellow-700 border-yellow-200",
  // Ticket
  "Open": "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Waiting": "bg-amber-50 text-amber-700 border-amber-200",
  "Resolved": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Closed": "bg-gray-50 text-gray-500 border-gray-200",
  // Priority
  "Low": "bg-slate-50 text-slate-600 border-slate-200",
  "Medium": "bg-blue-50 text-blue-700 border-blue-200",
  "High": "bg-orange-50 text-orange-700 border-orange-200",
  "Urgent": "bg-red-50 text-red-700 border-red-200",
  // Review
  "Approved": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Rejected": "bg-red-50 text-red-600 border-red-200",
  "Hidden": "bg-gray-50 text-gray-500 border-gray-200",
  // Return
  "Requested": "bg-amber-50 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
  "Pickup Scheduled": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Received": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Inspecting": "bg-violet-50 text-violet-700 border-violet-200",
  "Refund Initiated": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Completed": "bg-emerald-50 text-emerald-700 border-emerald-200",
  // Bool
  "Yes": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "No": "bg-gray-50 text-gray-500 border-gray-200",
  "Ended": "bg-gray-50 text-gray-500 border-gray-200",
  "Upcoming": "bg-blue-50 text-blue-700 border-blue-200",
  "New": "bg-blue-50 text-blue-700 border-blue-200",
  "Overdue": "bg-red-50 text-red-700 border-red-200",
};

export function StatusBadge({ status, size = "sm" }: { status: string; size?: "xs" | "sm" }) {
  const colors = statusColors[status] || "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center border font-medium rounded-full whitespace-nowrap ${colors} ${size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]"}`}>
      {status}
    </span>
  );
}

// ── KPI Card ────────────────────────────────────────────────────────────────

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  prefix?: string;
}

export function KPICard({ title, value, change, changeLabel, icon, prefix }: KPICardProps) {
  const isPositive = change !== undefined && change >= 0;
  return (
    <div className="bg-white/75 backdrop-blur-xl border border-white/90 rounded-2xl p-5 hover:bg-white/90 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        {icon && <span className="text-emerald-600">{icon}</span>}
      </div>
      <div className="text-xl font-bold text-slate-900 tracking-tight">{prefix}{value}</div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-bold ${isPositive ? "text-emerald-700" : "text-rose-600"}`}>
          {isPositive ? <ArrowUpRight size={13} strokeWidth={2.5} /> : <ArrowDownRight size={13} strokeWidth={2.5} />}
          <span>{Math.abs(change)}% {changeLabel || "vs last period"}</span>
        </div>
      )}
    </div>
  );
}

// ── CSV Export Helper ───────────────────────────────────────────────────────

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string = "export.csv",
  columns?: { key: string; label: string }[]
) {
  if (!data || data.length === 0) return;

  const cols = columns || Object.keys(data[0]).map((k) => ({ key: k, label: k }));
  const headers = cols.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(",");
  const rows = data.map((item) =>
    cols
      .map((c) => {
        const val = item[c.key];
        if (val === null || val === undefined) return '""';
        if (typeof val === "object") return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ── Data Table ──────────────────────────────────────────────────────────────

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  headerActions?: React.ReactNode;
  filters?: React.ReactNode;
  bulkActions?: React.ReactNode;
  exportable?: boolean;
  exportFilename?: string;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns, data, keyField, searchable = true, searchPlaceholder = "Search...",
  onSearch, pageSize = 10, selectable, onSelectionChange, actions,
  emptyMessage = "No data found", headerActions, filters, bulkActions,
  exportable = false, exportFilename = "export.csv", loading = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = data;
    if (search && !onSearch) {
      const q = search.toLowerCase();
      result = result.filter(item =>
        Object.values(item).some(v =>
          String(v ?? "").toLowerCase().includes(q)
        )
      );
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, sortKey, sortDir, onSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allSelectedOnPage = paged.length > 0 && paged.every(i => selected.has(i[keyField]));

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelectedOnPage) paged.forEach(i => next.delete(i[keyField]));
    else paged.forEach(i => next.add(i[keyField]));
    setSelected(next);
    onSelectionChange?.(data.filter(i => next.has(i[keyField])));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
    onSelectionChange?.(data.filter(i => next.has(i[keyField])));
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
    onSearch?.(val);
  };

  const handleExport = () => {
    const cols = columns.map((c) => ({ key: c.key, label: c.label || c.key }));
    exportToCSV(filtered, exportFilename, cols);
  };

  return (
    <div className="bg-white/75 backdrop-blur-xl border border-white/90 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] overflow-hidden">
      {/* Toolbar */}
      {(searchable || headerActions || filters || exportable) && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-slate-100/80 bg-white/40">
          {searchable && (
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-7 py-2 text-xs border border-slate-200/80 rounded-xl bg-white/60 focus:bg-white focus:border-slate-400 focus:outline-none transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => handleSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}
          {filters}
          <div className="flex-1" />
          {selected.size > 0 && bulkActions}
          {exportable && (
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              title="Export CSV"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          )}
          {headerActions}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {selectable && (
                <th className="pl-4 pr-2 py-2.5 w-8">
                  <input type="checkbox" checked={allSelectedOnPage} onChange={toggleAll} className="rounded border-gray-300" />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider ${col.sortable ? "cursor-pointer select-none hover:text-gray-700" : ""}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-3 py-2.5 w-16" />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="px-4 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin" />
                    <span className="text-xs">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="px-4 py-12 text-center text-gray-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : paged.map((item, idx) => (
              <tr key={item[keyField] || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                {selectable && (
                  <td className="pl-4 pr-2 py-2.5">
                    <input type="checkbox" checked={selected.has(item[keyField])} onChange={() => toggleOne(item[keyField])} className="rounded border-gray-300" />
                  </td>
                )}
                {columns.map(col => (
                  <td key={col.key} className="px-3 py-2.5 text-gray-700">
                    {col.render ? col.render(item, idx) : (item[col.key] ?? "—")}
                  </td>
                ))}
                {actions && <td className="px-3 py-2.5 text-right">{actions(item)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/40 text-xs text-gray-500">
          <span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return (
                <button key={p} onClick={() => setPage(p)} className={`w-6 h-6 rounded text-xs font-medium ${p === page ? "bg-gray-900 text-white" : "hover:bg-gray-200 text-gray-600"}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Slide-Over / Drawer ─────────────────────────────────────────────────────

// ── Apple Minimalist Center Modal ───────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "max-w-2xl",
}: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Frosted Apple Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative ${width} w-full my-auto bg-white/95 dark:bg-[#181a20]/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/80 dark:border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.04)] flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Apple Minimal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-4.5 border-b border-slate-100 dark:border-white/10 shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
          {children}
        </div>

        {/* Minimal Footer */}
        {footer && (
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-black/20 rounded-b-2xl sm:rounded-b-3xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// SlideOver is now aliased to Modal so all legacy slide-overs render as Apple centered modals
export const SlideOver = Modal;

// ── Confirm Dialog ──────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", destructive }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-5">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${destructive ? "bg-red-50" : "bg-amber-50"}`}>
            <AlertTriangle size={16} className={destructive ? "text-red-500" : "text-amber-500"} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-3 py-1.5 text-sm font-medium text-white rounded-md transition-colors ${destructive ? "bg-red-600 hover:bg-red-700" : "bg-gray-900 hover:bg-gray-800"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page Header ─────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; onClick?: () => void }[];
}

export function PageHeader({ title, subtitle, actions, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-5">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-gray-400 mb-2">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>/</span>}
              {b.onClick ? (
                <button onClick={b.onClick} className="hover:text-gray-600 transition-colors">{b.label}</button>
              ) : (
                <span className="text-gray-600">{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

// ── Tab Switcher ────────────────────────────────────────────────────────────

interface TabSwitcherProps {
  tabs: { key: string; label: string; count?: number }[];
  active: string;
  onChange: (key: string) => void;
}

export function TabSwitcher({ tabs, active, onChange }: TabSwitcherProps) {
  return (
    <div className="flex items-center gap-0 border-b border-gray-200 mb-4 -mx-1">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            active === t.key
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${active === t.key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"}`}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Form Field ──────────────────────────────────────────────────────────────

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, required, hint, error, children }: FormFieldProps) {
  return (
    <div className="mb-3.5">
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

// ── Input ───────────────────────────────────────────────────────────────────

export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { fullWidth?: boolean }) {
  const { fullWidth = true, className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors ${fullWidth ? "w-full" : ""} ${className}`}
    />
  );
}

// ── Textarea ────────────────────────────────────────────────────────────────

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors resize-none ${className}`}
    />
  );
}

// ── Select ──────────────────────────────────────────────────────────────────

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  const { options, className = "", ...rest } = props;
  return (
    <select {...rest} className={`w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:border-gray-400 focus:outline-none transition-colors ${className}`}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Toggle ──────────────────────────────────────────────────────────────────

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2"
    >
      <div className={`relative w-8 h-[18px] rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-gray-300"}`}>
        <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[14px]" : "translate-x-0.5"}`} />
      </div>
      {label && <span className="text-xs text-gray-600">{label}</span>}
    </button>
  );
}

// ── Empty State ─────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, message, action }: { icon?: React.ReactNode; title: string; message?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-3 text-gray-300">{icon}</div>}
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      {message && <p className="text-xs text-gray-400 mt-1 max-w-xs">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Button ──────────────────────────────────────────────────────────────────

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

export function Btn({ variant = "primary", size = "sm", icon, children, className = "", ...rest }: BtnProps) {
  const base = "inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all focus:outline-none active:scale-95 cursor-pointer";
  const sizeClasses = size === "sm" ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm";
  const variants = {
    primary: "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs hover:shadow-xs",
    secondary: "bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-md",
    ghost: "text-slate-600 hover:bg-white/60 hover:text-slate-900 backdrop-blur-xs",
    danger: "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 shadow-2xs",
  };
  return (
    <button className={`${base} ${sizeClasses} ${variants[variant]} ${className}`} {...rest}>
      {icon}
      {children}
    </button>
  );
}

// ── Card ────────────────────────────────────────────────────────────────────

export function Card({ children, className = "", ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-white/75 backdrop-blur-xl border border-white/90 rounded-2xl shadow-[0_4px_24px_-2px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] ${className}`} {...rest}>
      {children}
    </div>
  );
}

// ── Date Range Selector ─────────────────────────────────────────────────────

const dateRanges = ["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "This Month", "Last Month", "This Year"] as const;

export function DateRangeSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
      >
        {value}
        <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
            {dateRanges.map(r => (
              <button
                key={r}
                onClick={() => { onChange(r); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${r === value ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Section Divider ─────────────────────────────────────────────────────────

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-5 first:mt-0">{children}</h3>;
}

// ── Formatters ──────────────────────────────────────────────────────────────

export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return "₹0";
  }
  const val = Number(amount);
  return `₹${val.toLocaleString("en-IN")}`;
}

export function formatNumber(n?: number | null): string {
  if (n === undefined || n === null || isNaN(Number(n))) {
    return "0";
  }
  const val = Number(n);
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toLocaleString("en-IN");
}

export function formatPercent(n?: number | null): string {
  if (n === undefined || n === null || isNaN(Number(n))) {
    return "0%";
  }
  const val = Number(n);
  return `${val.toFixed(1)}%`;
}

// ── Stat Mini ───────────────────────────────────────────────────────────────

export function StatMini({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-sm font-semibold text-gray-900">{value}</div>
      {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
    </div>
  );
}
