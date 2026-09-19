// ============================================================================
// FaasBay Commerce OS — Orders (MongoDB-backed)
// ============================================================================
//
// Orders live in MongoDB and are read and written through /api/orders. The old
// localStorage mirror is gone: an order placed on a phone is immediately visible
// in the admin on any other device, and stock is decremented once, server-side.

import type { AdminOrder } from "./types";
import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/api-client";

/**
 * Fills in every field the admin components read, so a partial record from any
 * source can never crash a table cell.
 */
export const sanitizeOrder = (raw: any): AdminOrder => {
  const fallbackId = `FB-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderId = raw?.orderId || raw?.id || fallbackId;
  const createdAt = raw?.createdAt || new Date().toISOString();

  const customerName = raw?.customer?.name || raw?.shippingAddress?.name || raw?.name || "Valued Customer";
  const customerEmail = raw?.customer?.email || raw?.email || "customer@example.com";
  const customerPhone = raw?.customer?.phone || raw?.shippingAddress?.phone || raw?.phone || "";

  const street = raw?.shippingAddress?.street || raw?.shippingAddress?.address || raw?.address || "";
  const city = raw?.shippingAddress?.city || raw?.city || "India";
  const state = raw?.shippingAddress?.state || raw?.state || "India";
  const pincode = raw?.shippingAddress?.pincode || raw?.pincode || "";
  const country = raw?.shippingAddress?.country || "India";

  const rawItems = Array.isArray(raw?.items) ? raw.items : [];
  const items = rawItems.map((item: any, idx: number) => ({
    productId: item?.productId || `p-${idx + 1}`,
    title: item?.title || "FaasBay Artisan Product",
    sku: item?.sku || `FB-${item?.productId || idx + 1}`,
    quantity: Number(item?.quantity || 1),
    unitPrice: Number(item?.unitPrice || item?.price || 0),
    total: Number(item?.total || (Number(item?.unitPrice || item?.price || 0) * Number(item?.quantity || 1))),
    image: item?.image || "",
    customText: item?.customText || undefined,
  }));

  const totalAmount = Number(raw?.totalAmount || raw?.total || raw?.amount || 0);
  const subtotal = Number(raw?.subtotal || totalAmount || 0);
  const discount = Number(raw?.discount || raw?.discountAmount || 0);
  const shippingFee = Number(raw?.shippingFee || (subtotal >= 999 ? 0 : 79));
  const taxAmount = Number(raw?.taxAmount || Math.round(totalAmount * 0.18));

  const paymentMethod = raw?.paymentMethod || raw?.method || "Prepaid";
  const paymentStatus = raw?.paymentStatus || (paymentMethod.includes("COD") || paymentMethod.includes("Cash") ? "Pending" : "Paid");
  const orderStatus = raw?.orderStatus || "Processing";
  const trackingNumber = raw?.trackingNumber || `TRK-${orderId}-EXP`;
  const courier = raw?.courier || "DTDC EXPRESS";

  const notes = Array.isArray(raw?.notes) ? raw.notes : [];
  const timeline = Array.isArray(raw?.timeline) && raw.timeline.length > 0
    ? raw.timeline
    : [
        {
          status: orderStatus,
          timestamp: new Date(createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          note: paymentStatus === "Paid" ? "Online payment verified" : "Order recorded in system",
        },
      ];

  return {
    orderId,
    createdAt,
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
    },
    shippingAddress: {
      name: customerName,
      street,
      city,
      state,
      pincode,
      country,
      phone: customerPhone,
    },
    items,
    subtotal,
    discount,
    shippingFee,
    taxAmount,
    totalAmount,
    couponCode: raw?.couponCode || null,
    paymentMethod,
    paymentStatus,
    orderStatus,
    trackingNumber,
    courier,
    notes,
    timeline,
  };
};

/** Fetches every order from MongoDB, newest first. */
export const fetchAdminOrders = async (): Promise<AdminOrder[]> => {
  const rows = await api.get<any[]>(API_ENDPOINTS.orders);
  return (Array.isArray(rows) ? rows : []).map(sanitizeOrder);
};

/** Creates an order in MongoDB and returns the stored record. */
export const createOrder = async (order: Partial<AdminOrder>): Promise<AdminOrder> => {
  const saved = await api.post<any>(API_ENDPOINTS.orders, order);
  return sanitizeOrder(saved);
};

/** Persists edits to one order (status, courier, address, notes…). */
export const updateOrder = async (orderId: string, changes: Partial<AdminOrder>): Promise<AdminOrder> => {
  const saved = await api.put<any>(`${API_ENDPOINTS.orders}/${encodeURIComponent(orderId)}`, changes);
  return sanitizeOrder(saved);
};

/** Updates just the fulfilment fields, via the narrower status endpoint. */
export const updateOrderStatus = async (
  orderId: string,
  changes: { orderStatus?: string; trackingNumber?: string; paymentStatus?: string }
): Promise<AdminOrder> => {
  const saved = await api.patch<any>(`${API_ENDPOINTS.orders}/${encodeURIComponent(orderId)}/status`, changes);
  return sanitizeOrder(saved);
};

export const addOrderNote = async (
  orderId: string,
  note: { text: string; author?: string; isInternal?: boolean }
): Promise<AdminOrder> => {
  const saved = await api.post<any>(`${API_ENDPOINTS.orders}/${encodeURIComponent(orderId)}/notes`, note);
  return sanitizeOrder(saved);
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  await api.delete(`${API_ENDPOINTS.orders}/${encodeURIComponent(orderId)}`);
};
