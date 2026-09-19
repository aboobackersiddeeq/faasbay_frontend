// ============================================================================
// FaasBay Commerce OS — Orders Management, Tax Invoice & Shipping Label Suite
// ============================================================================
import React, { useState } from "react";
import {
  Eye,
  Printer,
  Truck,
  RotateCcw,
  X as XIcon,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  Package,
  Calendar,
  Clock,
  ExternalLink,
  Tag,
  AlertCircle,
  CheckCircle2,
  Search,
  Box,
  Banknote,
  ShieldCheck,
  Download,
} from "lucide-react";
import type { AdminOrder, OrderStatus } from "./shared/types";
import { formatCurrency, TabSwitcher } from "./shared/components";
import { ReturnsPage, RefundsPage } from "./OrdersExtended";
import { sanitizeOrder } from "./shared/orders-storage";
import { API_ENDPOINTS } from "@/config/api";
import { useAdminOrders, saveOrderChanges, saveOrderStatus } from "@/lib/cloud-orders-sync";
import faasbayLogo from "@/assets/faasbay-logo.png";

// Helper for converting number to Indian currency words
function numberToWordsINR(amount: number): string {
  const units = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  if (amount === 0) return "Zero Rupees Only";

  const convertLessThanOneThousand = (num: number): string => {
    let current = "";
    if (num >= 100) {
      current += units[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }
    if (num >= 20) {
      current += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    }
    if (num > 0) {
      current += units[num] + " ";
    }
    return current.trim();
  };

  const integerPart = Math.floor(amount);
  let words = "";

  const crore = Math.floor(integerPart / 10000000);
  let remainder = integerPart % 10000000;
  const lakh = Math.floor(remainder / 100000);
  remainder %= 100000;
  const thousand = Math.floor(remainder / 1000);
  remainder %= 1000;

  if (crore > 0) words += convertLessThanOneThousand(crore) + " Crore ";
  if (lakh > 0) words += convertLessThanOneThousand(lakh) + " Lakh ";
  if (thousand > 0) words += convertLessThanOneThousand(thousand) + " Thousand ";
  if (remainder > 0) words += convertLessThanOneThousand(remainder);

  return words.trim() + " Rupees Only";
}

const allStatuses: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Ready to Ship",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Return Requested",
  "Returned",
  "Refunded",
];

export const mockOrdersData: AdminOrder[] = [];

// Helper to test if an order is Cash on Delivery
export function isCodOrder(order: AdminOrder): boolean {
  const method = (order.paymentMethod || "").toLowerCase();
  return method.includes("cod") || method.includes("cash on delivery");
}

// Status pill styling
export function getStatusPill(status: OrderStatus) {
  switch (status) {
    case "Delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    case "Shipped":
      return "bg-blue-50 text-blue-700 border-blue-200/80";
    case "Processing":
      return "bg-purple-50 text-purple-700 border-purple-200/80";
    case "Packed":
    case "Ready to Ship":
      return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
    case "Pending":
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    case "Cancelled":
    case "Payment Failed":
      return "bg-rose-50 text-rose-700 border-rose-200/80";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200/80";
  }
}

// ============================================================================
// Brandable Tax Invoice & Shipping Label Modal (Matching Reference Template)
// ============================================================================
interface InvoiceModalProps {
  order: AdminOrder;
  onClose: () => void;
}

export function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  const safeOrder = sanitizeOrder(order);
  const [activeView, setActiveView] = useState<"invoice" | "shipping_label">("invoice");
  const isCOD = isCodOrder(safeOrder);

  // 100% Reliable Print Function using isolated hidden iframe
  const handlePrint = () => {
    const printContent = document.getElementById("printable-document");
    if (!printContent) {
      window.print();
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }
    const customerName = (safeOrder.customerName || safeOrder.shippingAddress?.name || safeOrder.customer?.name || "Customer").trim();
    const cleanCustomerName = customerName.replace(/[/\\?%*:|"<>]/g, "");
    const cleanOrderId = (safeOrder.orderId || "FB-ORDER").replace(/[/\\?%*:|"<>]/g, "");
    const docTitle =
      activeView === "invoice"
        ? `Faasbay - ${cleanCustomerName} - ${cleanOrderId}`
        : `Faasbay - ${cleanCustomerName} - Shipping Label - ${cleanOrderId}`;

    const originalParentTitle = document.title;
    document.title = docTitle;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              box-sizing: border-box;
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
            }
            body {
              margin: 0;
              padding: 0;
              background: #ffffff !important;
              color: #0f172a !important;
            }
            .bg-\\[\\#10b981\\] {
              background-color: #10b981 !important;
              color: #ffffff !important;
            }
            .bg-amber-500 {
              background-color: #f59e0b !important;
              color: #ffffff !important;
            }
            .text-\\[\\#10b981\\] {
              color: #10b981 !important;
            }
            .border-slate-200 {
              border-color: #e2e8f0 !important;
            }
            .border-slate-900 {
              border-color: #0f172a !important;
            }
          </style>
        </head>
        <body>
          <div style="padding: 10px; max-width: 760px; margin: 0 auto;">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.title = originalParentTitle;
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }, 450);
  };

  const invoiceNo = safeOrder.invoiceId || `#FB-${(safeOrder.orderId || "10291").replace(/[^0-9]/g, "") || "10291"}`;
  const formattedDate = new Date(safeOrder.createdAt || Date.now()).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "-");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden my-auto flex flex-col max-h-[94vh] ring-1 ring-black/5">
        {/* Top Apple Glass Control Bar */}
        <div className="no-print bg-slate-900/90 backdrop-blur-xl text-white px-6 py-3.5 flex items-center justify-between shrink-0 border-b border-white/10 shadow-sm">
          <div className="flex items-center gap-3">
            {/* View Switcher: iOS Segmented Control */}
            <div className="flex bg-slate-800/90 p-1 rounded-2xl border border-white/10 shadow-inner">
              <button
                onClick={() => setActiveView("invoice")}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeView === "invoice"
                    ? "bg-[#10b981] text-white shadow-md shadow-emerald-950/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Tax Invoice
              </button>
              <button
                onClick={() => setActiveView("shipping_label")}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeView === "shipping_label"
                    ? "bg-[#10b981] text-white shadow-md shadow-emerald-950/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Shipping Label ({isCOD ? "COD" : "Prepaid"})
              </button>
            </div>

            <span
              className={`text-[11px] font-semibold px-3 py-1 rounded-full border backdrop-blur-md flex items-center gap-1.5 ${
                isCOD
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isCOD ? "bg-amber-400" : "bg-emerald-400"}`} />
              {isCOD ? "COD Order" : "Prepaid Order"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-xs font-bold text-white transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-98 cursor-pointer"
            >
              <Printer size={15} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer"
              title="Close"
            >
              <XIcon size={16} />
            </button>
          </div>
        </div>

        {/* Document Canvas Area */}
        <div className="overflow-y-auto p-6 sm:p-10 bg-gradient-to-b from-slate-100/70 to-slate-200/50 backdrop-blur-sm flex justify-center">
          <div
            id="printable-document"
            className="w-full max-w-3xl bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-10 text-slate-900 text-xs font-sans space-y-6 transition-all"
          >
            {activeView === "invoice" ? (
              // ==========================================================
              // VIEW 1: PRECISE INVOICE TEMPLATE (MATCHING USER REFERENCE)
              // ==========================================================
              <>
                {/* Header: FaasBay Logo (Left) and INVOICE Title (Right) */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-200 gap-4">
                  <div>
                    <img
                      src={faasbayLogo}
                      alt="FaasBay"
                      className="h-8 w-auto object-contain"
                    />
                    <div className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
                      OFFICIAL STORE & COMMERCE
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black tracking-wider text-[#10b981] uppercase">
                      INVOICE
                    </div>
                    <div className="h-0.5 w-14 bg-[#10b981] ml-auto mt-0.5" />
                  </div>
                </div>

                {/* Metadata Row: Invoice No, Date, Invoice To */}
                <div className="grid grid-cols-3 gap-2 text-[11px] py-2 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Invoice no.</span>
                    <span className="font-bold text-slate-900">{invoiceNo}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">Date</span>
                    <span className="font-bold text-slate-900">{formattedDate}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] block">Invoice to:</span>
                    <span className="font-bold text-slate-900 block truncate">{safeOrder.customer?.name || "Valued Customer"}</span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {safeOrder.shippingAddress?.city || "India"}, {safeOrder.shippingAddress?.state || "India"}
                    </span>
                  </div>
                </div>

                {/* Total Due & Company Address Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      TOTAL DUE
                    </span>
                    <div className="text-2xl font-black text-slate-900 tracking-tight">
                      {formatCurrency(safeOrder.totalAmount || 0)}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block mt-0.5 ${
                        isCOD
                          ? "bg-amber-100 text-amber-900 font-extrabold"
                          : "bg-emerald-100 text-emerald-900 font-extrabold"
                      }`}
                    >
                      {isCOD ? "● CASH ON DELIVERY (COLLECT ON DELIVERY)" : "✓ PREPAID — PAID IN FULL"}
                    </span>
                  </div>

                  <div className="text-left sm:text-right text-[10px] text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-800 block">Faasbay Trading LLP</span>
                    37G&H, Treasury Road<br />
                    Malappuram, Kerala — 676101<br />
                    Ph: +91 9746598889 • faasbay.com
                  </div>
                </div>

                {/* Itemized Table (Emerald Green Header + Alternating Zebra Rows) */}
                <div className="rounded-lg overflow-hidden border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#10b981] text-white text-[11px] font-bold">
                        <th className="py-2.5 px-3.5">Item Description</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px]">
                      {(safeOrder.items || []).map((item, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-slate-50/80" : "bg-white"}
                        >
                          <td className="py-2.5 px-3.5">
                            <div className="font-bold text-slate-900">{item.title || "FaasBay Product"}</div>
                            <div className="text-[10px] text-slate-400">
                              SKU: {item.sku || `FB-PROD-00${idx + 1}`} • HSN: 8518.30
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-700">
                            {formatCurrency(item.unitPrice || 0)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                            {(item.quantity || 1) < 10 ? `0${item.quantity || 1}` : item.quantity}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-black text-slate-900">
                            {formatCurrency(item.total || (item.unitPrice || 0) * (item.quantity || 1))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Payment Method Details & Grand Total Calculation Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 items-start">
                  {/* Left: Payment Method Info */}
                  <div className="text-[11px] space-y-1.5">
                    <span className="font-bold text-slate-800 block text-[11px]">
                      Payment Method We Accept
                    </span>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Selected Mode:</span>
                        <span className="font-bold text-slate-900">{safeOrder.paymentMethod || "Prepaid"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Payment Status:</span>
                        <span
                          className={`font-bold ${
                            isCOD ? "text-amber-700" : "text-emerald-700"
                          }`}
                        >
                          {isCOD ? "Pending (Cash On Delivery)" : "Captured & Verified"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 pt-0.5">
                        Accepted: UPI, Cards (Visa/Mastercard/RuPay), NetBanking, COD
                      </div>
                    </div>
                  </div>

                  {/* Right: SubTotal, Tax, Discount & Green Grand Total Bar */}
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-600 px-1">
                      <span>Sub Total:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(safeOrder.subtotal || safeOrder.totalAmount || 0)}</span>
                    </div>

                    <div className="flex justify-between text-slate-600 px-1">
                      <span>Shipping Fee:</span>
                      <span className="font-semibold text-slate-900">
                        {safeOrder.shippingFee ? formatCurrency(safeOrder.shippingFee) : "₹0.00 (FREE)"}
                      </span>
                    </div>

                    {safeOrder.discount ? (
                      <div className="flex justify-between text-slate-600 px-1">
                        <span>Discount:</span>
                        <span className="font-semibold text-emerald-600">-{formatCurrency(safeOrder.discount)}</span>
                      </div>
                    ) : null}

                    {/* Green Grand Total Banner */}
                    <div className="bg-[#10b981] text-white px-3 py-2 rounded-md flex justify-between items-center font-bold text-xs mt-1 shadow-2xs">
                      <span>Grand Total</span>
                      <span className="text-sm font-black">{formatCurrency(safeOrder.totalAmount || 0)}</span>
                    </div>

                    {isCOD && (safeOrder.advancePaid || safeOrder.codAmountDue !== undefined) ? (
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1 mt-1.5">
                        <div className="flex justify-between text-emerald-700 font-bold text-[10px]">
                          <span>Advance Online Paid:</span>
                          <span>-{formatCurrency(safeOrder.advancePaid || 0)}</span>
                        </div>
                        <div className="flex justify-between text-amber-800 font-extrabold text-[11px] pt-1 border-t border-slate-200">
                          <span>Balance Due upon Delivery:</span>
                          <span>{formatCurrency(safeOrder.codAmountDue !== undefined ? safeOrder.codAmountDue : (safeOrder.totalAmount || 0) - (safeOrder.advancePaid || 0))}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Amount in words & Signature Area */}
                <div className="flex flex-col sm:flex-row items-end justify-between pt-2 gap-4">
                  <div className="text-[10px] text-slate-500 max-w-xs">
                    <span className="font-bold text-slate-700 block">Amount in words:</span>
                    <span className="italic text-slate-800 font-medium">
                      {numberToWordsINR(safeOrder.totalAmount || 0)}
                    </span>
                  </div>

                  <div className="text-center sm:text-right">
                    <div className="font-serif italic text-base font-bold text-slate-800 tracking-wide">
                      Faasbay Trading LLP
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Authorized Signatory</div>
                  </div>
                </div>

                {/* Bottom Footer with Contact Details & Logo */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 gap-2">
                  <div>
                    <span className="font-bold text-slate-700">Faasbay Trading LLP:</span> 37G&H, Treasury Road, Malappuram, Kerala — 676101 • +91 9746598889 • support@faasbay.com
                  </div>
                  <img
                    src={faasbayLogo}
                    alt="FaasBay"
                    className="h-5 w-auto object-contain opacity-80"
                  />
                </div>
              </>
            ) : (
              // ==========================================================
              // VIEW 2: AUTOMATIC 4"x6" SHIPPING LABEL (COD vs PREPAID)
              // ==========================================================
              <div className="space-y-4">
                {/* Shipping Label Top Header */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
                  <img
                    src={faasbayLogo}
                    alt="FaasBay"
                    className="h-8 w-auto object-contain"
                  />
                  <div className="text-right">
                    <span className="text-xs font-black uppercase text-slate-900 block">
                      {safeOrder.courier || "DTDC EXPRESS"}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-bold">
                      STANDARD AIR CARGO
                    </span>
                  </div>
                </div>

                {/* Big Dynamic COD vs PREPAID Banner */}
                {isCOD ? (
                  <div className="p-3 bg-amber-500 text-white rounded-xl border-2 border-amber-600 text-center space-y-0.5 shadow-sm">
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-amber-100">
                      ★ CASH ON DELIVERY (COD) ★
                    </div>
                    <div className="text-xl font-black tracking-tight">
                      COLLECT CASH: {formatCurrency(safeOrder.codAmountDue !== undefined ? safeOrder.codAmountDue : (safeOrder.totalAmount || 0))}
                    </div>
                    <div className="text-[10px] font-bold text-amber-100">
                      {safeOrder.advancePaid 
                        ? `Advance shipping paid online: ${formatCurrency(safeOrder.advancePaid)} • Collect balance from customer` 
                        : "Delivery Associate: Please collect cash before handing over parcel"}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-[#10b981] text-white rounded-xl border-2 border-emerald-600 text-center space-y-0.5 shadow-sm">
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-100">
                      ✓ PREPAID SHIPMENT
                    </div>
                    <div className="text-xl font-black tracking-tight">
                      DO NOT COLLECT CASH (₹0.00 DUE)
                    </div>
                    <div className="text-[10px] font-bold text-emerald-100">
                      Payment Captured & Verified Online (100% Free Delivery)
                    </div>
                  </div>
                )}

                {/* Scannable Barcode & Tracking AWB */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-300 text-center space-y-1">
                  <div className="font-mono text-sm font-black tracking-widest text-slate-900">
                    {safeOrder.trackingNumber || `AWB-${safeOrder.orderId || "FB"}-EXP`}
                  </div>
                  {/* Barcode Lines */}
                  <div className="h-9 w-full flex items-center justify-center gap-0.5 px-2 overflow-hidden">
                    {[
                      2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 1, 5, 2, 4, 1, 3, 2, 5, 1, 4,
                      2, 3, 1, 5, 2, 4, 1, 3, 2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 1, 5,
                      2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 1, 5, 2, 4, 1, 3, 2, 4, 1, 3,
                    ].map((w, bi) => (
                      <div
                        key={bi}
                        className="bg-slate-900 h-full"
                        style={{ width: `${w}px` }}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Order Ref: #{safeOrder.orderId || "FB-ORDER"} • Routing: MLP/HUB-01 • Date: {formattedDate}
                  </div>
                </div>

                {/* DELIVER TO (CUSTOMER / CONSIGNEE) */}
                <div className="p-4 rounded-xl border-2 border-slate-900 space-y-1 bg-white">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    DELIVER TO (CONSIGNEE):
                  </div>
                  <div className="text-sm font-black text-slate-900">{safeOrder.shippingAddress?.name || safeOrder.customer?.name || "Customer"}</div>
                  <div className="text-xs text-slate-800 leading-relaxed font-medium">
                    {safeOrder.shippingAddress?.street || ""}<br />
                    {safeOrder.shippingAddress?.city || "India"}, {safeOrder.shippingAddress?.state || "India"}<br />
                    <span className="text-sm font-black text-slate-900">
                      PIN CODE: {safeOrder.shippingAddress?.pincode || ""}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 pt-1">
                    Phone: {safeOrder.customer?.phone || safeOrder.shippingAddress?.phone || "No phone"}
                  </div>
                </div>

                {/* SHIP FROM (RETURN ADDRESS) & DETAILS */}
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[9px] font-bold uppercase text-slate-400">
                      SHIP FROM / RETURN IF UNDELIVERED TO:
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5">Faasbay Trading LLP</div>
                    <div className="text-[10px] text-slate-700 leading-tight mt-0.5 font-medium">
                      37G&H, Treasury Road<br />
                      Malappuram, Kerala — 676101<br />
                      Ph: +91 9746598889
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="text-[9px] font-bold uppercase text-slate-400">Parcel Contents</div>
                      <div className="font-bold text-slate-900 truncate">
                        {(safeOrder.items || [])[0]?.title || "Artisan Products"}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-200">
                      <span>Total Qty: <strong>{(safeOrder.items || []).length}</strong></span>
                      <span>Weight: <strong>0.45 kg</strong></span>
                    </div>
                  </div>
                </div>

                {/* Footer Declaration */}
                <div className="border-t border-dashed border-slate-300 pt-2 text-[9px] text-slate-500 flex justify-between items-center">
                  <span>Authorized E-Commerce Shipping Label</span>
                  <span className="font-mono text-slate-400">Faasbay Trading LLP • Malappuram</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Orders Management Page Component
// ============================================================================
export function OrdersList() {
  // Orders come straight from MongoDB; this store is shared with every other screen.
  const { value: orders, isLoaded: ordersLoaded, error: ordersError, refresh: refreshOrdersList } = useAdminOrders();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<AdminOrder | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [newNote, setNewNote] = useState("");

  // Poll the backend so a new order placed on the storefront appears here
  React.useEffect(() => {
    const interval = setInterval(() => {
      void refreshOrdersList();
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Filtering
  const filteredOrders = orders.filter((order) => {
    if (!order) return false;
    const status = order.orderStatus || "Processing";

    // Status Filter
    if (activeFilter === "unfulfilled" && ["Delivered", "Cancelled"].includes(status)) return false;
    if (activeFilter === "cod" && !isCodOrder(order)) return false;
    if (activeFilter === "prepaid" && isCodOrder(order)) return false;
    if (
      activeFilter !== "all" &&
      activeFilter !== "unfulfilled" &&
      activeFilter !== "cod" &&
      activeFilter !== "prepaid" &&
      status.toLowerCase() !== activeFilter.toLowerCase()
    ) {
      return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (order.orderId || "").toLowerCase().includes(q);
      const matchName = (order.customer?.name || "").toLowerCase().includes(q);
      const matchPhone = (order.customer?.phone || "").toLowerCase().includes(q);
      const matchCity = (order.shippingAddress?.city || "").toLowerCase().includes(q);
      const matchItem = Array.isArray(order.items) ? order.items.some((i) => (i?.title || "").toLowerCase().includes(q)) : false;
      if (!matchId && !matchName && !matchPhone && !matchCity && !matchItem) return false;
    }

    return true;
  });

  // Bulk Selection
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o.orderId));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Quick Status Update — persisted to MongoDB
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const current = orders.find((o) => o.orderId === orderId);
    if (!current) return;

    const timeline = [
      ...(current.timeline || []),
      {
        status: newStatus,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        note: `Status updated to ${newStatus}`,
      },
    ];

    try {
      await saveOrderStatus(orderId, { orderStatus: newStatus });
      const saved = await saveOrderChanges(orderId, { timeline });
      if (selectedOrder?.orderId === orderId) setSelectedOrder(saved);
    } catch (e) {
      console.error("Could not update order status:", e);
      await refreshOrdersList();
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedOrder) return;
    const noteObj = {
      id: `n-${Date.now()}`,
      text: newNote.trim(),
      author: "Admin Staff",
      createdAt: new Date().toISOString(),
      isInternal: true,
    };

    try {
      const saved = await saveOrderChanges(selectedOrder.orderId, {
        notes: [...(selectedOrder.notes || []), noteObj],
      });
      setSelectedOrder(saved);
      setNewNote("");
    } catch (e) {
      console.error("Could not save order note:", e);
    }
  };

  // Status Filter Tabs
  const filterTabs = [
    { key: "all", label: "All Orders", count: orders.length },
    { key: "unfulfilled", label: "Unfulfilled", count: orders.filter((o) => !["Delivered", "Cancelled"].includes(o?.orderStatus || "Processing")).length },
    { key: "prepaid", label: "Prepaid", count: orders.filter((o) => o && !isCodOrder(o)).length },
    { key: "cod", label: "COD (Cash On Delivery)", count: orders.filter((o) => o && isCodOrder(o)).length },
    { key: "shipped", label: "Shipped", count: orders.filter((o) => (o?.orderStatus || "") === "Shipped").length },
    { key: "delivered", label: "Delivered", count: orders.filter((o) => (o?.orderStatus || "") === "Delivered").length },
  ];

  return (
    <div className="space-y-5">
      {/* Top Header & Fast Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            Orders Management
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100/90 text-slate-700 border border-slate-200/80 shadow-2xs">
              {orders.length} total
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage customer fulfillment, automated Prepaid/COD shipping labels, and official invoices
          </p>
        </div>

        {/* Quick Search Bar (Apple Frosted Glass) */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, name, phone, city..."
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

      {/* Backend connectivity banner */}
      {ordersError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <span>Could not load orders from the server: {ordersError.message}</span>
          <button
            onClick={() => void refreshOrdersList()}
            className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-semibold text-amber-700 hover:bg-amber-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Clean Apple Glass Orders Table */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/70">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filteredOrders.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-[#10b981] focus:ring-[#10b981] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3">Order</th>
                <th className="py-3.5 px-3">Date</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Type / Mode</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Items</th>
                <th className="py-3.5 px-3 text-right">Total</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400">
                    <Box size={28} className="mx-auto mb-2 opacity-40" />
                    {!ordersLoaded ? "Loading orders…" : "No orders match your current filter."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isChecked = selectedIds.includes(order.orderId);
                  const isCOD = isCodOrder(order);
                  return (
                    <tr
                      key={order.orderId}
                      onClick={() => setSelectedOrder(sanitizeOrder(order))}
                      className={`hover:bg-slate-50/70 transition-all duration-150 cursor-pointer group ${
                        isChecked ? "bg-emerald-50/30" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(order.orderId)}
                          className="rounded border-slate-300 text-[#10b981] focus:ring-[#10b981] cursor-pointer"
                        />
                      </td>

                      {/* Order ID */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-900 group-hover:text-[#10b981] transition-colors">
                          #{order.orderId}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 text-slate-500">
                        {new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(order.createdAt || Date.now()).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800">{order.customer?.name || "Customer"}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                          {order.shippingAddress?.city || "India"}, {order.shippingAddress?.state || "India"}
                        </div>
                      </td>

                      {/* Type / Payment Mode */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCOD ? "bg-amber-500" : "bg-[#10b981]"
                            }`}
                          />
                          <span
                            className={`font-bold text-[11px] ${
                              isCOD ? "text-amber-800" : "text-emerald-800"
                            }`}
                          >
                            {isCOD ? "COD" : "Prepaid"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                          {isCOD && order.advancePaid 
                            ? `Adv: ₹${order.advancePaid} | Due: ₹${order.codAmountDue || ((order.totalAmount || 0) - order.advancePaid)}`
                            : (order.paymentMethod || "Prepaid").split("(")[0].trim()}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.orderStatus || "Processing"}
                          onChange={(e) => updateOrderStatus(order.orderId, e.target.value as OrderStatus)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-hidden transition-all shadow-2xs ${getStatusPill(
                            order.orderStatus || "Processing"
                          )}`}
                        >
                          {allStatuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-3 text-slate-600">
                        <span className="font-medium">
                          {(order.items || []).length} item{(order.items || []).length > 1 ? "s" : ""}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-3 text-right font-black text-slate-900">
                        <div>{formatCurrency(order.totalAmount || 0)}</div>
                        {isCOD && (order.codAmountDue || order.advancePaid) ? (
                          <div className="text-[9.5px] font-bold text-amber-700">
                            Collect: {formatCurrency(order.codAmountDue !== undefined ? order.codAmountDue : ((order.totalAmount || 0) - (order.advancePaid || 0)))}
                          </div>
                        ) : null}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setInvoiceOrder(sanitizeOrder(order))}
                            className="px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-emerald-50 hover:text-[#10b981] hover:border-emerald-200 border border-slate-200/80 text-slate-700 text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                            title="Generate Invoice / Shipping Label"
                          >
                            <FileText size={13} />
                            <span>Invoice</span>
                          </button>
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

      {/* =================================================================== */}
      {/* Fast & Clean Order Slide-Over Drawer (Apple Glass Aesthetic)        */}
      {/* =================================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-2xl shadow-2xl border-l border-slate-200/80 h-full flex flex-col z-10 animate-in slide-in-from-right duration-200 rounded-l-3xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200/80 flex items-center justify-between shrink-0 bg-slate-50/70 backdrop-blur-md">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Order #{selectedOrder.orderId}
                  </h2>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${getStatusPill(selectedOrder.orderStatus)}`}>
                    {selectedOrder.orderStatus}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                      isCodOrder(selectedOrder)
                        ? "bg-amber-100/90 text-amber-800 border-amber-300/80"
                        : "bg-emerald-100/90 text-emerald-800 border-emerald-300/80"
                    }`}
                  >
                    {isCodOrder(selectedOrder) ? "COD" : "Prepaid"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Placed on {new Date(selectedOrder.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInvoiceOrder(sanitizeOrder(selectedOrder))}
                  className="px-3.5 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <FileText size={13} /> Invoice & Label
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <XIcon size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Customer & Address Card */}
              <div className="p-4.5 rounded-2xl bg-slate-50/80 backdrop-blur-sm border border-slate-200/80 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#10b981]" /> Delivery Address
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {selectedOrder.customer?.id || "CUST-ONLINE"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-900">{selectedOrder.customer?.name || "Customer"}</div>
                  <div className="text-slate-600 leading-relaxed">
                    {selectedOrder.shippingAddress?.street || ""}<br />
                    {selectedOrder.shippingAddress?.city || "India"}, {selectedOrder.shippingAddress?.state || "India"} — {selectedOrder.shippingAddress?.pincode || ""}
                  </div>
                </div>

                {/* Contact pills */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-slate-700 font-medium truncate">{selectedOrder.customer?.phone || "No phone"}</span>
                    <button
                      onClick={() => {
                        if (selectedOrder.customer?.phone) {
                          navigator.clipboard.writeText(selectedOrder.customer.phone);
                          setCopiedPhone(true);
                          setTimeout(() => setCopiedPhone(false), 2000);
                        }
                      }}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {copiedPhone ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-slate-700 font-medium truncate">{selectedOrder.customer?.email || "No email"}</span>
                    <button
                      onClick={() => {
                        if (selectedOrder.customer?.email) {
                          navigator.clipboard.writeText(selectedOrder.customer.email);
                          setCopiedEmail(true);
                          setTimeout(() => setCopiedEmail(false), 2000);
                        }
                      }}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {copiedEmail ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Card */}
              <div className="p-4.5 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 space-y-3 shadow-2xs">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex justify-between">
                  <span>Ordered Items ({(selectedOrder.items || []).length})</span>
                  <span className="text-slate-400 font-normal">GST 18% Inclusive</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={18} className="text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{item.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Qty: {item.quantity} • {formatCurrency(item.unitPrice)}
                          </div>
                        </div>
                      </div>
                      <div className="font-black text-slate-900 shrink-0">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-slate-600 text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-800">{formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount || 0)}</span>
                  </div>
                  {selectedOrder.discount ? (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span className="font-semibold">-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="font-bold text-slate-800">
                      {selectedOrder.shippingFee ? formatCurrency(selectedOrder.shippingFee) : "FREE (₹0)"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-black pt-2 border-t border-slate-200/80 text-slate-900">
                    <span>Total Order Amount</span>
                    <span className="text-[#10b981] text-base">{formatCurrency(selectedOrder.totalAmount || 0)}</span>
                  </div>

                  {(selectedOrder.advancePaid || selectedOrder.codAmountDue !== undefined || (selectedOrder.paymentMethod && selectedOrder.paymentMethod.toLowerCase().includes("cod"))) ? (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1 mt-2">
                      <div className="flex justify-between items-center text-[11px] font-bold text-emerald-700">
                        <span>Advance Online Paid:</span>
                        <span>{formatCurrency(selectedOrder.advancePaid || selectedOrder.shippingFee || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-black text-amber-900">
                        <span>Collect on Delivery (Cash):</span>
                        <span>{formatCurrency(selectedOrder.codAmountDue !== undefined ? selectedOrder.codAmountDue : ((selectedOrder.totalAmount || 0) - (selectedOrder.advancePaid || 0)))}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Logistics & Tracking */}
              <div className="p-4.5 rounded-2xl bg-slate-50/80 backdrop-blur-sm border border-slate-200/80 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Truck size={13} className="text-[#10b981]" /> Logistics & Carrier
                  </span>
                  <span className="font-bold text-slate-800 bg-white/90 px-2.5 py-0.5 rounded-lg border border-slate-200/80 text-[10px] shadow-2xs">
                    {selectedOrder.courier || "DTDC Express"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] bg-white/90 p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">AWB Number</span>
                    <div className="font-mono font-bold text-slate-900">
                      {selectedOrder.trackingNumber || "TRK-IND-99201"}
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/search?q=${selectedOrder.trackingNumber || "DTDC"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#10b981] font-bold hover:underline flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100"
                  >
                    Track <ExternalLink size={11} />
                  </a>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-4.5 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 space-y-3 shadow-2xs">
                <span className="font-bold text-slate-900 block">Fulfillment Timeline</span>
                <div className="space-y-3 border-l-2 border-emerald-100 ml-2 pl-3.5">
                  {(selectedOrder.timeline || []).map((t, ti) => (
                    <div key={ti} className="relative text-[11px]">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{t.status}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{t.timestamp}</span>
                      </div>
                      {t.note && <div className="text-[10px] text-slate-500 mt-0.5">{t.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* Professional Tax Invoice & Shipping Label Modal                     */}
      {/* =================================================================== */}
      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
}

// ── Master Orders View with Sub-Navigation ─────────────────────────────────

export default function OrdersMasterView({
  initialTab = "orders",
  initialSubTab,
  onSubTabChange,
}: {
  initialTab?: string;
  initialSubTab?: string;
  onSubTabChange?: (sub: string) => void;
}) {
  return (
    <div className="space-y-4">
      <OrdersList />
    </div>
  );
}

