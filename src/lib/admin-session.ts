// ============================================================================
// FaasBay Commerce OS — Admin session (token + signed-in user)
// ============================================================================
//
// The session token is the one thing that legitimately belongs in browser storage:
// it identifies *this browser* to the API. Every piece of business data behind it
// lives in MongoDB and is fetched per request.

export interface AdminUser {
  id?: string;
  email: string;
  name: string;
  role: string;
  permissions?: string[];
}

const TOKEN_KEY = "faasbay_admin_token";
const USER_KEY = "faasbay_admin_session";
export const SESSION_EVENT = "faasbay_admin_session_changed";

/** Reads from localStorage first (Remember me), then sessionStorage. */
function readStored(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getAdminToken(): string | null {
  return readStored(TOKEN_KEY);
}

export function getAdminUser(): AdminUser | null {
  const raw = readStored(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function saveAdminSession(token: string, user: AdminUser, remember = true) {
  if (typeof window === "undefined") return;
  const store = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  try {
    store.setItem(TOKEN_KEY, token);
    store.setItem(USER_KEY, JSON.stringify(user));
    other.removeItem(TOKEN_KEY);
    other.removeItem(USER_KEY);
    window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail: user }));
  } catch (e) {
    console.error("Failed to persist admin session:", e);
  }
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  try {
    [localStorage, sessionStorage].forEach((store) => {
      store.removeItem(TOKEN_KEY);
      store.removeItem(USER_KEY);
    });
    window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail: null }));
  } catch {
    /* storage unavailable — nothing to clear */
  }
}
