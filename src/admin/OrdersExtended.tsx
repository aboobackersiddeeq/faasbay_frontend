// ============================================================================
// FaasBay Commerce OS — Returns & Claims Suite, Refunds Ledger & Fulfillment
// ============================================================================
import React, { useState } from "react";
import {
  RotateCcw,
  CreditCard,
  Truck,
  Eye,
  FileText,
  Search,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X as XIcon,
  Package,
  Layers,
  ExternalLink,
  ChevronRight,
  Image as ImageIcon,
  DollarSign,
  ArrowRight,
  Box,
} from "lucide-react";
import {
  StatusBadge,
  PageHeader,
  Btn,
  FormField,
  Textarea,
  Select,
  Input,
  Modal,
  formatCurrency,
  DataTable,
  KPICard,
  Card,
  TabSwitcher,
} from "./shared/components";
import type { AdminReturn, AdminRefund, ReturnStatus, AdminOrder } from "./shared/types";
import { mockOrdersData, InvoiceModal, getStatusPill, isCodOrder } from "./Orders";
import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/api-client";

// ── Initial Mock Returns ─────────────────────────────────────────────────────

const initReturns: AdminReturn[] = [];

const returnStatuses: ReturnStatus[] = [
  "Requested",
  "Under Review",
  "Approved",
  "Pickup Scheduled",
  "Received",
  "Inspecting",
  "Refund Initiated",
  "Completed",
  "Rejected",
];

function getReasonBadge(reason: string) {
  switch (reason) {
    case "Defective":
      return "bg-rose-50 text-rose-700 border-rose-200/80";
    case "Wrong Size":
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    case "Wrong Variant":
      return "bg-blue-50 text-blue-700 border-blue-200/80";
    case "Damaged in Transit":
      return "bg-purple-50 text-purple-700 border-purple-200/80";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

// ── Returns Page Component ──────────────────────────────────────────────────

export function ReturnsPage() {
  const [returns, setReturns] = useState<AdminReturn[]>(initReturns);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedReturn, setSelectedReturn] = useState<AdminReturn | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<AdminOrder | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const getOrderForReturn = (orderId: string): AdminOrder | undefined => {
    return mockOrdersData.find((o) => o.orderId === orderId || o.orderId === orderId.replace("#", ""));
  };

  const handleUpdateStatus = (retId: string, status: ReturnStatus, noteText?: string) => {
    setReturns((prev) =>
      prev.map((r) => {
        if (r.id === retId) {
          const nowFormatted = new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
          const updatedTimeline = [
            ...(r.timeline || []),
            {
              status,
              timestamp: nowFormatted,
              note: noteText || `Status updated to ${status}`,
              staff: "FaasBay Admin",
            },
          ];
          return {
            ...r,
            status,
            timeline: updatedTimeline,
            resolvedDate: status === "Completed" ? new Date().toISOString().slice(0, 10) : r.resolvedDate,
          };
        }
        return r;
      })
    );

    if (selectedReturn && selectedReturn.id === retId) {
      setSelectedReturn((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const filterTabs = [
    { key: "all", label: "All Returns", count: returns.length },
    {
      key: "pending",
      label: "Pending Review",
      count: returns.filter((r) => ["Under Review", "Requested"].includes(r.status)).length,
    },
    {
      key: "approved",
      label: "Approved & Pickup",
      count: returns.filter((r) => ["Approved", "Pickup Scheduled"].includes(r.status)).length,
    },
    {
      key: "completed",
      label: "Completed",
      count: returns.filter((r) => r.status === "Completed").length,
    },
  ];

  const filteredReturns = returns.filter((r) => {
    if (activeFilter === "pending" && !["Under Review", "Requested"].includes(r.status)) return false;
    if (activeFilter === "approved" && !["Approved", "Pickup Scheduled"].includes(r.status)) return false;
    if (activeFilter === "completed" && r.status !== "Completed") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = r.id.toLowerCase().includes(q);
      const matchOrder = r.orderId.toLowerCase().includes(q);
      const matchCust = r.customerName.toLowerCase().includes(q);
      const matchProduct = r.productTitle.toLowerCase().includes(q);
      const matchReason = (r.reasonCategory || r.reason).toLowerCase().includes(q);
      if (!matchId && !matchOrder && !matchCust && !matchProduct && !matchReason) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Header & Search (Matching Orders Page Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            Returns & Claims
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100/90 text-slate-700 border border-slate-200/80 shadow-2xs">
              {returns.length} total
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Review return claims, verify customer inspection proofs, track reverse pickups & issue refunds
          </p>
        </div>

        {/* Quick Search Bar (Apple Frosted Glass) */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search return ID, order, customer, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md focus:outline-hidden focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all placeholder:text-slate-400 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs w-5 h-5 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Segment Tabs (Apple iOS Style Pill Segmented Bar) */}
      <div className="p-1 bg-slate-200/60 backdrop-blur-md rounded-2xl border border-slate-200/80 inline-flex items-center gap-1 overflow-x-auto max-w-full shadow-2xs">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                  isActive ? "bg-slate-100 text-slate-800" : "bg-slate-300/60 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Clean Apple Glass Returns Table */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/70">
                <th className="py-3.5 px-4">Claim ID</th>
                <th className="py-3.5 px-3">Order</th>
                <th className="py-3.5 px-3">Product</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Reason</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-right">Refund</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    <RotateCcw size={28} className="mx-auto mb-2 opacity-40" />
                    No returns match your current filter.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => {
                  const matchingOrder = getOrderForReturn(ret.orderId);
                  return (
                    <tr
                      key={ret.id}
                      onClick={() => setSelectedReturn(ret)}
                      className="hover:bg-slate-50/70 transition-all duration-150 cursor-pointer group"
                    >
                      {/* Claim ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 group-hover:text-[#10b981] transition-colors whitespace-nowrap">
                        #{ret.id.toUpperCase()}
                      </td>

                      {/* Order Number & Date */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-700 block">#{ret.orderId}</span>
                        <span className="text-[10px] text-slate-400">{ret.requestedDate}</span>
                      </td>

                      {/* Product Thumbnail & Clean Title */}
                      <td className="py-3 px-3 min-w-[220px] max-w-[280px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0">
                            {ret.productImage ? (
                              <img
                                src={ret.productImage}
                                alt={ret.productTitle}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Package size={14} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-slate-900 truncate block text-xs group-hover:text-blue-600 transition-colors">
                              {ret.productTitle}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Qty: {ret.quantity} • {ret.sku || `ID: ${ret.productId}`}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{ret.customerName}</div>
                        <div className="text-[10px] text-slate-400">{ret.customerPhone || ret.customerEmail}</div>
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getReasonBadge(
                            ret.reasonCategory || "Other"
                          )}`}
                        >
                          {ret.reasonCategory || "Claim"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={ret.status} size="xs" />
                      </td>

                      {/* Refund Amount */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-900">{formatCurrency(ret.refundAmount)}</div>
                        <div className="text-[10px] text-slate-400">{ret.refundMethod?.split("(")[0].trim() || "Prepaid"}</div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReturn(ret)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                          >
                            Inspect
                          </button>
                          {matchingOrder && (
                            <button
                              type="button"
                              onClick={() => setInvoiceOrder(matchingOrder)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="View Order Tax Invoice"
                            >
                              <FileText size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Apple-Glass Return & Claim Inspector Modal ──────────────────────── */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-2xs">
                  <RotateCcw size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      Return Claim #{selectedReturn.id.toUpperCase()}
                    </h2>
                    <StatusBadge status={selectedReturn.status} size="xs" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Order #{selectedReturn.orderId} • Claimed {selectedReturn.requestedDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const ord = getOrderForReturn(selectedReturn.orderId);
                    if (ord) setInvoiceOrder(ord);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <FileText size={13} />
                  <span>Tax Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReturn(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <XIcon size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5">
              {/* Product Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-4">
                <div
                  className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 cursor-pointer group"
                  onClick={() => {
                    if (selectedReturn.productImage) setLightboxImage(selectedReturn.productImage);
                  }}
                >
                  {selectedReturn.productImage ? (
                    <img
                      src={selectedReturn.productImage}
                      alt={selectedReturn.productTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Package size={20} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 leading-snug">{selectedReturn.productTitle}</div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span>SKU: <strong className="text-slate-700 font-mono">{selectedReturn.sku || "N/A"}</strong></span>
                    {selectedReturn.variant && <span>• {selectedReturn.variant}</span>}
                    <span>• Qty: <strong className="text-slate-700">{selectedReturn.quantity}</strong></span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-400">Refund Value</div>
                  <div className="text-sm font-black text-emerald-600">{formatCurrency(selectedReturn.refundAmount)}</div>
                </div>
              </div>

              {/* 2-Column Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left: Reason & Evidence */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Return Reason</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getReasonBadge(
                        selectedReturn.reasonCategory || "Other"
                      )}`}
                    >
                      {selectedReturn.reasonCategory || "Claim"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                    "{selectedReturn.reason}"
                  </p>

                  {selectedReturn.images && selectedReturn.images.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 block mb-1.5">
                        Customer Photo Proofs ({selectedReturn.images.length})
                      </span>
                      <div className="flex gap-2">
                        {selectedReturn.images.map((img, i) => (
                          <div
                            key={i}
                            onClick={() => setLightboxImage(img)}
                            className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <img src={img} alt="Proof" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Customer & Pickup Info */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2.5 text-xs">
                  <div className="font-bold text-slate-800">Customer & Pickup Address</div>

                  <div>
                    <div className="font-semibold text-slate-900">{selectedReturn.customerName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{selectedReturn.customerAddress}</div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-600">{selectedReturn.customerPhone}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedReturn.customerPhone || "", "phone")}
                      className="text-blue-600 font-medium hover:underline text-[10px]"
                    >
                      {copiedField === "phone" ? "Copied!" : "Copy Phone"}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Reverse Courier:</span>
                    <span className="font-semibold text-slate-800">{selectedReturn.pickupCourier || "DTDC Express"}</span>
                  </div>
                </div>
              </div>

              {/* Status Selector Bar */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Update Claim Status</span>
                <div className="flex flex-wrap gap-1.5">
                  {returnStatuses.slice(0, 6).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedReturn.id, st)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                        selectedReturn.status === st
                          ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const ord = getOrderForReturn(selectedReturn.orderId);
                  if (ord) setInvoiceOrder(ord);
                }}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <FileText size={13} />
                <span>Open Tax Invoice (#{selectedReturn.orderId})</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReturn(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedReturn.id, "Completed", "Refund settled and claim closed")}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs"
                >
                  Approve & Settle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox Image Modal ────────────────────────────────────────────── */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-xl max-h-[80vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors text-xs"
            >
              ✕
            </button>
            <img src={lightboxImage} alt="Preview" className="w-full h-full max-h-[75vh] object-contain" />
          </div>
        </div>
      )}

      {/* ── Integrated Full Tax Invoice & Shipping Label Modal ─────────────── */}
      {invoiceOrder && (
        <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      )}
    </div>
  );
}

// ── Refunds ─────────────────────────────────────────────────────────────────

const initRefunds: AdminRefund[] = [];

export function RefundsPage() {
  // The refunds ledger is stored in MongoDB so finance records survive the browser.
  const [refunds, setRefunds] = useState<AdminRefund[]>(initRefunds);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [invoiceOrder, setInvoiceOrder] = useState<AdminOrder | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<AdminRefund | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [utrInput, setUtrInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [statusSelect, setStatusSelect] = useState<AdminRefund["status"]>("Processing");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dedicated Confirmation Warning Dialog States
  const [settleConfirmRefund, setSettleConfirmRefund] = useState<AdminRefund | null>(null);
  const [settleUtrInput, setSettleUtrInput] = useState("");
  const [settleNoteInput, setSettleNoteInput] = useState("");
  const [settleConfirmedCheck, setSettleConfirmedCheck] = useState(true);

  const [revertConfirmRefund, setRevertConfirmRefund] = useState<AdminRefund | null>(null);

  const loadRefunds = React.useCallback(async () => {
    try {
      const rows = await api.get<AdminRefund[]>(API_ENDPOINTS.refunds);
      setRefunds(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      console.error("Could not load refunds:", e);
    }
  }, []);

  React.useEffect(() => {
    void loadRefunds();
  }, [loadRefunds]);

  /**
   * Persists the ledger. Each changed row is written individually so a single
   * failure cannot wipe the rest, then the list is re-read from the database.
   */
  const saveRefunds = (next: AdminRefund[]) => {
    const previous = refunds;
    setRefunds(next);

    const changed = next.filter((row) => {
      const before = previous.find((r) => r.id === row.id);
      return !before || JSON.stringify(before) !== JSON.stringify(row);
    });

    Promise.all(
      changed.map((row) =>
        previous.some((r) => r.id === row.id)
          ? api.patch(`${API_ENDPOINTS.refunds}/${encodeURIComponent(row.id)}`, row)
          : api.post(API_ENDPOINTS.refunds, row)
      )
    )
      .then(() => loadRefunds())
      .catch((e: any) => {
        setRefunds(previous);
        showToast(e?.message || "Could not save the refund. Nothing was changed.");
      });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getOrder = (orderId: string): AdminOrder | undefined => {
    return mockOrdersData.find((o) => o.orderId === orderId || o.orderId === orderId.replace("#", ""));
  };

  const filteredRefunds = activeTab === "all" ? refunds : refunds.filter((r) => r.status.toLowerCase() === activeTab.toLowerCase());

  const openManageModal = (refund: AdminRefund) => {
    setSelectedRefund(refund);
    setStatusSelect(refund.status);
    setUtrInput(refund.returnId ? `UTR-99${refund.returnId.replace(/\D/g, "")}81` : "UTR-IND-2026-9921");
    setNoteInput(refund.reason || "Processed refund to original payment source");
    setModalOpen(true);
  };

  const openSettleConfirmModal = (refund: AdminRefund) => {
    setSettleConfirmRefund(refund);
    setSettleUtrInput(
      refund.paymentMethod.includes("UPI")
        ? `UPI-REF-${Math.floor(100000 + Math.random() * 900000)}`
        : `UTR-PG-${Math.floor(10000000 + Math.random() * 90000000)}`
    );
    setSettleNoteInput(`Payout settled via ${refund.paymentMethod}`);
    setSettleConfirmedCheck(true);
  };

  const handleConfirmSettle = () => {
    if (!settleConfirmRefund) return;
    const dateStr = new Date().toISOString().split("T")[0];

    const next = refunds.map((r) =>
      r.id === settleConfirmRefund.id
        ? {
            ...r,
            status: "Completed" as const,
            processedDate: dateStr,
            processedBy: "FaasBay Admin",
            reason: settleNoteInput || r.reason,
          }
        : r
    );

    saveRefunds(next);
    setSettleConfirmRefund(null);
    if (modalOpen && selectedRefund?.id === settleConfirmRefund.id) {
      setSelectedRefund(null);
      setModalOpen(false);
    }

    showToast(`✓ Refund #${settleConfirmRefund.id.toUpperCase()} (₹${settleConfirmRefund.amount.toLocaleString("en-IN")}) marked as Settled.`);
  };

  const handleConfirmRevert = () => {
    if (!revertConfirmRefund) return;

    const next = refunds.map((r) =>
      r.id === revertConfirmRefund.id
        ? {
            ...r,
            status: "Processing" as const,
            processedDate: undefined,
            processedBy: undefined,
          }
        : r
    );

    saveRefunds(next);
    setRevertConfirmRefund(null);
    if (modalOpen && selectedRefund?.id === revertConfirmRefund.id) {
      setSelectedRefund(null);
      setModalOpen(false);
    }

    showToast(`↺ Refund #${revertConfirmRefund.id.toUpperCase()} reverted to Processing.`);
  };

  const handleUpdateStatus = (newStatus: AdminRefund["status"]) => {
    if (!selectedRefund) return;

    if (newStatus === "Completed" && selectedRefund.status !== "Completed") {
      openSettleConfirmModal(selectedRefund);
      return;
    }

    if (newStatus === "Processing" && selectedRefund.status === "Completed") {
      setRevertConfirmRefund(selectedRefund);
      return;
    }

    const next = refunds.map((r) =>
      r.id === selectedRefund.id
        ? {
            ...r,
            status: newStatus,
            processedDate: newStatus === "Completed" ? (r.processedDate || new Date().toISOString().split("T")[0]) : undefined,
            processedBy: newStatus === "Completed" ? (r.processedBy || "FaasBay Admin") : undefined,
          }
        : r
    );

    saveRefunds(next);
    setModalOpen(false);
    setSelectedRefund(null);
    showToast(`Updated refund status to ${newStatus}.`);
  };

  const totalRefundedAmount = refunds
    .filter((r) => r.status === "Completed")
    .reduce((sum, r) => sum + r.amount, 0);

  const columns = [
    {
      key: "id",
      label: "Refund ID",
      render: (r: AdminRefund) => (
        <div>
          <button
            type="button"
            onClick={() => openManageModal(r)}
            className="text-xs font-mono font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer"
          >
            #{r.id.toUpperCase()}
          </button>
          {r.returnId && <div className="text-[10px] text-slate-400 font-mono">Claim: #{r.returnId}</div>}
        </div>
      ),
    },
    {
      key: "orderId",
      label: "Order",
      render: (r: AdminRefund) => {
        const ord = getOrder(r.orderId);
        return (
          <button
            type="button"
            onClick={() => ord && setInvoiceOrder(ord)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <FileText size={12} />
            <span>#{r.orderId}</span>
          </button>
        );
      },
    },
    {
      key: "customerName",
      label: "Customer",
      render: (r: AdminRefund) => (
        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">{r.customerName}</div>
          <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{r.reason}</div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (r: AdminRefund) => (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-white/10">
          {r.type} Refund
        </span>
      ),
    },
    {
      key: "amount",
      label: "Refund Amount",
      sortable: true,
      render: (r: AdminRefund) => (
        <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
          {formatCurrency(r.amount)}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Payout Destination",
      render: (r: AdminRefund) => (
        <div className="flex items-center gap-1.5">
          <CreditCard size={12} className="text-slate-400 shrink-0" />
          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{r.paymentMethod}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r: AdminRefund) => (
        <button
          type="button"
          onClick={() => openManageModal(r)}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          title="Click to view or change status"
        >
          <StatusBadge status={r.status} size="xs" />
        </button>
      ),
    },
    {
      key: "requestedDate",
      label: "Date",
      render: (r: AdminRefund) => (
        <div>
          <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">{r.requestedDate}</div>
          {r.processedDate && <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Settled: {r.processedDate}</div>}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r: AdminRefund) => {
        const ord = getOrder(r.orderId);
        return (
          <div className="flex items-center gap-1.5 justify-end">
            {r.status !== "Completed" ? (
              <button
                type="button"
                onClick={() => openSettleConfirmModal(r)}
                className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1 active:scale-95"
                title="Settle & Issue Refund Payout"
              >
                <Check size={11} />
                Settle
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openManageModal(r)}
                className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="Manage Settlement & Revert Status"
              >
                <RotateCcw size={11} />
                Manage
              </button>
            )}

            {ord && (
              <button
                type="button"
                onClick={() => setInvoiceOrder(ord)}
                className="px-2 py-1 text-[11px] font-semibold bg-white hover:bg-slate-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="View Tax Invoice"
              >
                <FileText size={11} />
                Invoice
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <PageHeader
        title="Refunds Ledger"
        subtitle={`${refunds.length} recorded refund transactions across payment gateways`}
        breadcrumbs={[{ label: "Orders" }, { label: "Refunds Ledger" }]}
        actions={
          toastMessage ? (
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300/80 dark:border-emerald-800 px-3 py-1.5 rounded-full animate-in fade-in">
              {toastMessage}
            </div>
          ) : undefined
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          title="Total Refunded Amount"
          value={formatCurrency(totalRefundedAmount)}
          icon={<DollarSign size={14} />}
        />
        <KPICard
          title="Completed Refunds"
          value={String(refunds.filter((r) => r.status === "Completed").length)}
          icon={<CheckCircle2 size={14} className="text-emerald-500" />}
        />
        <KPICard
          title="In Processing"
          value={String(refunds.filter((r) => r.status === "Processing").length)}
          icon={<Clock size={14} className="text-blue-500" />}
        />
        <KPICard
          title="Pending Approval"
          value={String(refunds.filter((r) => r.status === "Pending").length)}
          icon={<AlertCircle size={14} className="text-amber-500" />}
        />
      </div>

      {/* Filter Tabs */}
      <TabSwitcher
        tabs={[
          { key: "all", label: "All Refunds", count: refunds.length },
          { key: "completed", label: "Completed", count: refunds.filter((r) => r.status === "Completed").length },
          { key: "processing", label: "Processing", count: refunds.filter((r) => r.status === "Processing").length },
          { key: "pending", label: "Pending", count: refunds.filter((r) => r.status === "Pending").length },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {/* Table Card */}
      <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden p-1">
        <DataTable
          columns={columns}
          data={filteredRefunds}
          keyField="id"
          searchPlaceholder="Search by refund ID, order #, or customer..."
        />
      </div>

      {/* ========================================================================= */}
      {/* ⚠️ SETTLEMENT CONFIRMATION & WARNING MODAL                                */}
      {/* ========================================================================= */}
      <Modal
        open={Boolean(settleConfirmRefund)}
        onClose={() => setSettleConfirmRefund(null)}
        title="Confirm Refund Settlement"
        subtitle={settleConfirmRefund ? `Payout authorization for Refund #${settleConfirmRefund.id.toUpperCase()}` : ""}
        width="max-w-lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Btn
              variant="secondary"
              onClick={() => setSettleConfirmRefund(null)}
            >
              Cancel
            </Btn>
            <button
              type="button"
              disabled={!settleConfirmedCheck}
              onClick={handleConfirmSettle}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                settleConfirmedCheck
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Check size={14} />
              Confirm & Settle {settleConfirmRefund ? formatCurrency(settleConfirmRefund.amount) : ""}
            </button>
          </div>
        }
      >
        {settleConfirmRefund && (
          <div className="space-y-4">
            {/* Warning Alert Box */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Warning: Payout Settlement Confirmation</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300/90 leading-relaxed pl-6">
                You are about to mark a payout of{" "}
                <strong className="font-bold underline text-amber-900 dark:text-white">
                  {formatCurrency(settleConfirmRefund.amount)}
                </strong>{" "}
                as <strong>Settled & Completed</strong> to{" "}
                <strong>{settleConfirmRefund.customerName}</strong> via{" "}
                <strong>{settleConfirmRefund.paymentMethod}</strong>. Please ensure the transfer has been initiated in your payment gateway dashboard.
              </p>
            </div>

            {/* Payout Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Refund ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">#{settleConfirmRefund.id.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">#{settleConfirmRefund.orderId}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Recipient Customer:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{settleConfirmRefund.customerName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Payout Destination:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{settleConfirmRefund.paymentMethod}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Settlement Value:</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(settleConfirmRefund.amount)}
                </span>
              </div>
            </div>

            {/* UTR Input */}
            <FormField label="Gateway UTR / Bank Reference No." required>
              <Input
                value={settleUtrInput}
                onChange={(e) => setSettleUtrInput(e.target.value)}
                placeholder="e.g. UTR-HDFC-992810"
              />
            </FormField>

            {/* Settlement Note */}
            <FormField label="Settlement Memo / Internal Note">
              <Input
                value={settleNoteInput}
                onChange={(e) => setSettleNoteInput(e.target.value)}
                placeholder="e.g. Refund disbursed via payment gateway"
              />
            </FormField>

            {/* Confirmation Checkbox */}
            <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settleConfirmedCheck}
                onChange={(e) => setSettleConfirmedCheck(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                I confirm that this payout has been authorized and disbursed to the customer.
              </span>
            </label>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* ⚠️ REVERT CONFIRMATION MODAL                                              */}
      {/* ========================================================================= */}
      <Modal
        open={Boolean(revertConfirmRefund)}
        onClose={() => setRevertConfirmRefund(null)}
        title="Confirm Status Reversion"
        subtitle={revertConfirmRefund ? `Revert Refund #${revertConfirmRefund.id.toUpperCase()}` : ""}
        width="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Btn
              variant="secondary"
              onClick={() => setRevertConfirmRefund(null)}
            >
              Cancel
            </Btn>
            <button
              type="button"
              onClick={handleConfirmRevert}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <RotateCcw size={12} />
              Yes, Revert to Processing
            </button>
          </div>
        }
      >
        {revertConfirmRefund && (
          <div className="space-y-3.5">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Revert Settled Refund</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300/90 leading-relaxed pl-6">
                Are you sure you want to revert Refund <strong>#{revertConfirmRefund.id.toUpperCase()}</strong> (
                <strong>{formatCurrency(revertConfirmRefund.amount)}</strong>) back to{" "}
                <strong>Processing</strong>?
              </p>
            </div>
            <p className="text-xs text-slate-500">
              This will unmark the payout settlement and update completed ledger statistics accordingly. You can settle it again at any time.
            </p>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* APPLE CENTER MODAL: REFUND SETTLEMENT & STATUS CONTROL                    */}
      {/* ========================================================================= */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedRefund(null);
        }}
        title="Manage Refund Settlement"
        subtitle={`Configure settlement payout, gateway reference, or revert status for #${selectedRefund?.id.toUpperCase()}`}
        width="max-w-lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {selectedRefund?.status === "Completed" ? (
                <button
                  type="button"
                  onClick={() => selectedRefund && setRevertConfirmRefund(selectedRefund)}
                  className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <RotateCcw size={12} />
                  Revert to Processing
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => selectedRefund && openSettleConfirmModal(selectedRefund)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Check size={12} />
                  Settle & Complete Payout
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Btn
                variant="secondary"
                onClick={() => {
                  setModalOpen(false);
                  setSelectedRefund(null);
                }}
              >
                Close
              </Btn>
              <Btn onClick={() => handleUpdateStatus(statusSelect)}>
                Save Changes
              </Btn>
            </div>
          </div>
        }
      >
        {selectedRefund && (
          <div className="space-y-4">
            {/* Refund Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Refund Transaction</span>
                <StatusBadge status={selectedRefund.status} size="xs" />
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedRefund.customerName}
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">
                    Order #{selectedRefund.orderId} {selectedRefund.returnId ? `· Return #${selectedRefund.returnId}` : ""}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    {formatCurrency(selectedRefund.amount)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{selectedRefund.type} Refund</span>
                </div>
              </div>
            </div>

            {/* Status Control Field */}
            <FormField label="Refund Status" required>
              <Select
                options={[
                  { value: "Pending", label: "Pending Approval (Under store review)" },
                  { value: "Processing", label: "In Processing (Gateway payout initiated)" },
                  { value: "Completed", label: "Completed / Settled (Amount credited)" },
                  { value: "Failed", label: "Failed / Rejected (Gateway decline)" },
                ]}
                value={statusSelect}
                onChange={(e) => setStatusSelect(e.target.value as AdminRefund["status"])}
              />
            </FormField>

            {/* Payout Channel & UTR Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Payout Destination">
                <Input
                  value={selectedRefund.paymentMethod}
                  disabled
                  className="bg-slate-100/60 dark:bg-white/5 text-slate-600 dark:text-slate-400"
                />
              </FormField>

              <FormField label="Gateway UTR / Txn Reference">
                <Input
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  placeholder="e.g. UTR-IND-998210"
                />
              </FormField>
            </div>

            {/* Settlement Note */}
            <FormField label="Settlement Note / Audit Memo">
              <Input
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Audit notes regarding payout reason"
              />
            </FormField>

            {/* Processed Metadata */}
            {selectedRefund.processedDate && (
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5">
                <span>Settled Date: <strong>{selectedRefund.processedDate}</strong></span>
                <span>By: <strong>{selectedRefund.processedBy || "FaasBay Admin"}</strong></span>
              </div>
            )}
          </div>
        )}
      </Modal>

      {invoiceOrder && (
        <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      )}
    </div>
  );
}

// ── Fulfillment ─────────────────────────────────────────────────────────────

interface Shipment {
  id: string;
  orderId: string;
  customer: string;
  courier: string;
  tracking: string;
  status: string;
  items: number;
  date: string;
  estimatedDelivery: string;
}

const initShipments: Shipment[] = [];

export function FulfillmentPage() {
  const [shipments] = useState<Shipment[]>(initShipments);

  const columns = [
    {
      key: "id",
      label: "Shipment",
      render: (s: Shipment) => <span className="text-xs font-mono font-bold text-slate-900">#{s.id.toUpperCase()}</span>,
    },
    {
      key: "orderId",
      label: "Order",
      render: (s: Shipment) => <span className="text-xs font-semibold text-slate-700">#{s.orderId}</span>,
    },
    {
      key: "customer",
      label: "Customer",
      render: (s: Shipment) => <span className="text-xs font-semibold text-slate-800">{s.customer}</span>,
    },
    {
      key: "courier",
      label: "Courier",
      render: (s: Shipment) => <span className="text-xs text-slate-600">{s.courier}</span>,
    },
    {
      key: "tracking",
      label: "Tracking AWB",
      render: (s: Shipment) => <span className="text-xs font-mono text-slate-700">{s.tracking}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (s: Shipment) => <StatusBadge status={s.status} size="xs" />,
    },
    {
      key: "date",
      label: "Shipped Date",
      render: (s: Shipment) => <span className="text-xs text-slate-500">{s.date}</span>,
    },
    {
      key: "estimatedDelivery",
      label: "ETA",
      render: (s: Shipment) => <span className="text-xs text-slate-500">{s.estimatedDelivery}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Fulfillment"
        subtitle="Shipping & courier dispatch tracking"
        breadcrumbs={[{ label: "Orders" }, { label: "Fulfillment" }]}
      />
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-1">
        <DataTable
          columns={columns}
          data={shipments}
          keyField="id"
          searchPlaceholder="Search shipments & tracking AWB..."
        />
      </div>
    </div>
  );
}
