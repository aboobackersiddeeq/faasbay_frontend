// ============================================================================
// FaasBay Commerce OS — Orders live store
// ============================================================================
//
// A shared, server-backed store for the order list, so every admin screen reads the
// same records from MongoDB instead of each keeping its own localStorage copy.

import type { AdminOrder } from "@/admin/shared/types";
import {
  fetchAdminOrders,
  createOrder as createOrderApi,
  updateOrder as updateOrderApi,
  updateOrderStatus as updateOrderStatusApi,
  deleteOrder as deleteOrderApi,
} from "@/admin/shared/orders-storage";
import { createRemoteStore, useRemoteStoreState } from "./remote-store";

const ordersStore = createRemoteStore<AdminOrder[]>([], fetchAdminOrders);

/** Live order list with load state; shares one request across all subscribers. */
export function useAdminOrders() {
  return useRemoteStoreState(ordersStore);
}

/** Re-reads all orders from the database. */
export async function refreshOrders(): Promise<AdminOrder[]> {
  return ordersStore.refresh();
}

/** Orders as last loaded, without subscribing. */
export function getLoadedOrders(): AdminOrder[] {
  void ordersStore.load();
  return ordersStore.get();
}

/** Places an order, then refreshes the shared list so every screen sees it. */
export async function recordNewAdminOrder(newOrder: Partial<AdminOrder>): Promise<AdminOrder> {
  const saved = await createOrderApi(newOrder);
  // The server also creates/updates the customer profile behind this order.
  await ordersStore.refresh();
  return saved;
}

export async function saveOrderChanges(orderId: string, changes: Partial<AdminOrder>): Promise<AdminOrder> {
  const saved = await updateOrderApi(orderId, changes);
  ordersStore.set(ordersStore.get().map((o) => (o.orderId === saved.orderId ? saved : o)));
  return saved;
}

export async function saveOrderStatus(
  orderId: string,
  changes: { orderStatus?: string; trackingNumber?: string; paymentStatus?: string }
): Promise<AdminOrder> {
  const saved = await updateOrderStatusApi(orderId, changes);
  ordersStore.set(ordersStore.get().map((o) => (o.orderId === saved.orderId ? saved : o)));
  return saved;
}

export async function removeOrder(orderId: string): Promise<void> {
  await deleteOrderApi(orderId);
  ordersStore.set(ordersStore.get().filter((o) => o.orderId !== orderId));
}

/**
 * Loads the full order list from MongoDB.
 * Kept under its original name so existing call sites keep working.
 */
export async function fetchGlobalOrdersFromCloud(): Promise<AdminOrder[]> {
  return ordersStore.refresh();
}
