// ============================================================================
// FaasBay Commerce OS — Customer self-service (orders, tracking, addresses)
// ============================================================================
//
// The storefront has no real customer authentication (login is a mock OTP
// step — see AuthModal), so these calls scope every lookup to the phone/email
// already stored in the shopper's local profile, matching the trust level the
// checkout flow itself already relies on.

import { apiRequest, queryString } from "./api-client";
import { API_ENDPOINTS } from "@/config/api";

export interface MyOrderItem {
  productId: string;
  title: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
  image?: string;
}

export interface MyOrderTimelineEntry {
  status: string;
  timestamp: string;
  note?: string;
}

export interface MyOrderAddress {
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  phone?: string;
}

export interface MyOrder {
  orderId: string;
  createdAt: string;
  items: MyOrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  trackingNumber?: string;
  trackingUrl?: string;
  courier?: string;
  shippingAddress?: MyOrderAddress;
  timeline: MyOrderTimelineEntry[];
}

export interface SavedAddress {
  id: string;
  name?: string | undefined;
  street: string;
  city: string;
  state?: string | undefined;
  pincode: string;
  country?: string | undefined;
  phone?: string | undefined;
}

/** Fetches every order placed under this phone number or email, newest first. */
export async function fetchMyOrders(phone?: string, email?: string): Promise<MyOrder[]> {
  if (!phone && !email) return [];
  const rows = await apiRequest<MyOrder[]>(`${API_ENDPOINTS.myOrders}${queryString({ phone, email })}`);
  return Array.isArray(rows) ? rows : [];
}

/** Looks up the saved customer profile (and their address book) for this shopper. */
export async function fetchMyAddresses(phone?: string, email?: string): Promise<SavedAddress[]> {
  if (!phone && !email) return [];
  const data = await apiRequest<{ addresses?: SavedAddress[] } | null>(
    `${API_ENDPOINTS.customerLookup}${queryString({ phone, email })}`
  );
  return data?.addresses || [];
}

/** Adds a new delivery address to this shopper's saved address book. */
export async function addMyAddress(
  contact: { phone?: string | undefined; email?: string | undefined },
  address: Omit<SavedAddress, "id">
): Promise<SavedAddress[]> {
  const data = await apiRequest<SavedAddress[]>(API_ENDPOINTS.customerAddresses, {
    method: "POST",
    body: { phone: contact.phone, email: contact.email, address },
  });
  return Array.isArray(data) ? data : [];
}

/** Removes one saved address by id. */
export async function deleteMyAddress(
  contact: { phone?: string | undefined; email?: string | undefined },
  addressId: string
): Promise<SavedAddress[]> {
  const data = await apiRequest<SavedAddress[]>(API_ENDPOINTS.customerAddresses, {
    method: "DELETE",
    body: { phone: contact.phone, email: contact.email, addressId },
  });
  return Array.isArray(data) ? data : [];
}

// --- Accounts ---------------------------------------------------------------

export interface CustomerAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
}

/** Creates a shopper account. Email and phone must each be unused by another account. */
export function registerCustomer(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<CustomerAccount> {
  return apiRequest<CustomerAccount>(API_ENDPOINTS.customerRegister, { method: "POST", body: input });
}

/** Signs a shopper in with their email or mobile number. */
export function loginCustomer(identifier: string, password: string): Promise<CustomerAccount> {
  return apiRequest<CustomerAccount>(API_ENDPOINTS.customerLogin, {
    method: "POST",
    body: { identifier, password },
  });
}

/**
 * Updates the shopper's name and mobile number. The email identifies the
 * account and can't be changed; the current password confirms the change.
 */
export function updateCustomerProfile(input: {
  email: string;
  currentPassword: string;
  name: string;
  phone: string;
}): Promise<CustomerAccount> {
  return apiRequest<CustomerAccount>(API_ENDPOINTS.customerProfile, { method: "PUT", body: input });
}

/** Replaces the shopper's password after checking the current one. */
export async function changeCustomerPassword(input: {
  email: string;
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiRequest(API_ENDPOINTS.customerChangePassword, { method: "POST", body: input });
}
