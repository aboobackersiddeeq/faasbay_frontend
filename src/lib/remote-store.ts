      // ============================================================================
// FaasBay Commerce OS — Shared remote store
// ============================================================================
//
// A tiny external store so many components can read the same server-backed state
// (storefront CMS, feature flags, catalog) from a single request rather than each
// firing its own fetch. Replaces the old pattern of every component reading and
// writing the same localStorage keys.

import { useSyncExternalStore } from "react";

export interface RemoteStore<T> {
  /** Current value — the fallback until the first load resolves. */
  get: () => T;
  set: (value: T) => void;
  /** Loads from the server once; repeat calls share the in-flight promise. */
  load: () => Promise<T>;
  /** Forces a fresh load, discarding any cached result. */
  refresh: () => Promise<T>;
  subscribe: (listener: () => void) => () => void;
  isLoaded: () => boolean;
  getError: () => Error | null;
}

export function createRemoteStore<T>(fallback: T, fetcher: () => Promise<T>): RemoteStore<T> {
  let value = fallback;
  let loaded = false;
  let error: Error | null = null;
  let inFlight: Promise<T> | null = null;
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((fn) => fn());

  const run = (): Promise<T> => {
    inFlight = fetcher()
      .then((next) => {
        if (next !== undefined && next !== null) {
          value = next;
          loaded = true;
          error = null;
          emit();
        }
        return value;
      })
      .catch((e: Error) => {
        // Keep showing the fallback rather than blanking the page when the API
        // is unreachable; surface the error for callers that want to show it.
        error = e;
        emit();
        return value;
      })
      .finally(() => {
        inFlight = null;
      });
    return inFlight;
  };

  return {
    get: () => value,
    set: (next: T) => {
      value = next;
      loaded = true;
      emit();
    },
    load: () => {
      if (loaded) return Promise.resolve(value);
      if (inFlight) return inFlight;
      return run();
    },
    refresh: () => (inFlight ? inFlight : run()),
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    isLoaded: () => loaded,
    getError: () => error,
  };
}

/** Subscribes a component to a remote store, kicking off the initial load. */
export function useRemoteStore<T>(store: RemoteStore<T>): T {
  if (typeof window !== "undefined") void store.load();
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

/** Subscribes and also reports load state, for spinners and error banners. */
export function useRemoteStoreState<T>(store: RemoteStore<T>): {
  value: T;
  isLoaded: boolean;
  error: Error | null;
  refresh: () => Promise<T>;
} {
  const value = useRemoteStore(store);
  return { value, isLoaded: store.isLoaded(), error: store.getError(), refresh: store.refresh };
}
