// ============================================================================
// FaasBay Commerce OS — REST API client
// ============================================================================
//
// One place for every backend call: attaches the admin token, unwraps the
// { success, data } envelope the API returns, and turns failures into a typed
// error instead of a silent fallback.

import { getAdminToken, clearAdminSession } from "./admin-session";

export class ApiError extends Error {
  status: number;
  code?: string | undefined;

  constructor(message: string, status: number, code?: string | undefined) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Abort the request after this many ms. Defaults to 15s. */
  timeoutMs?: number;
  signal?: AbortSignal;
}

const DEFAULT_TIMEOUT = 15000;

/**
 * Performs a request and returns the `data` payload from the API envelope.
 * Throws ApiError on any non-2xx response or transport failure.
 */
export async function apiRequest<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, timeoutMs = DEFAULT_TIMEOUT, signal } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  if (signal) signal.addEventListener("abort", () => controller.abort());

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = getAdminToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      signal: controller.signal,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (e) {
    clearTimeout(timeout);
    const aborted = (e as Error)?.name === "AbortError";
    throw new ApiError(
      aborted ? "The server took too long to respond." : "Could not reach the FaasBay server.",
      0,
      aborted ? "TIMEOUT" : "NETWORK"
    );
  }
  clearTimeout(timeout);

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    /* some responses legitimately carry no body */
  }

  if (!response.ok) {
    // An expired or revoked token should drop the stale session rather than
    // leaving the admin in a half-signed-in state.
    if (response.status === 401 && token) clearAdminSession();

    throw new ApiError(
      payload?.message || `Request failed (${response.status})`,
      response.status,
      payload?.code
    );
  }

  // Endpoints wrap their result as { success, data, ... }; unwrap when present.
  if (payload && typeof payload === "object" && "data" in payload) return payload.data as T;
  return payload as T;
}

/** Same as apiRequest but returns the whole envelope, for callers that need `count`/`token`. */
export async function apiRequestRaw<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, timeoutMs = DEFAULT_TIMEOUT } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getAdminToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(url, {
      method,
      headers,
      signal: controller.signal,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && token) clearAdminSession();
      throw new ApiError(payload?.message || `Request failed (${response.status})`, response.status, payload?.code);
    }
    return payload as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    const aborted = (e as Error)?.name === "AbortError";
    throw new ApiError(
      aborted ? "The server took too long to respond." : "Could not reach the FaasBay server.",
      0,
      aborted ? "TIMEOUT" : "NETWORK"
    );
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  get: <T = unknown>(url: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(url, { ...options, method: "GET" }),
  post: <T = unknown>(url: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(url, { ...options, method: "POST", body }),
  put: <T = unknown>(url: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(url, { ...options, method: "PUT", body }),
  patch: <T = unknown>(url: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(url, { ...options, method: "PATCH", body }),
  delete: <T = unknown>(url: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(url, { ...options, method: "DELETE" }),
};

/** Builds a query string from defined values only. */
export function queryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
