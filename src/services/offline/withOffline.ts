import { adminDataStore, StoreName } from './adminDataStore';

export async function withOffline<T>(
  storeName: StoreName,
  fetchFn: () => Promise<T>,
  options?: { maxAgeMs?: number }
): Promise<{ data: T; fromCache: boolean }> {
  // Try cache first
  const cached = await adminDataStore.get<T>(storeName);
  const maxAge = options?.maxAgeMs ?? 5 * 60 * 1000;

  if (cached && (Date.now() - cached.timestamp < maxAge)) {
    // Cache is fresh enough — use it, refresh in background if online
    if (navigator.onLine) {
      fetchFn().then(async (fresh) => {
        await adminDataStore.put(storeName, fresh);
      }).catch(() => { /* background refresh failed, non-critical */ });
    }
    return { data: cached.data, fromCache: true };
  }

  // Not cached or stale — fetch fresh
  try {
    const fresh = await fetchFn();
    await adminDataStore.put(storeName, fresh);
    return { data: fresh, fromCache: false };
  } catch (err) {
    // Network failed — use stale cache if available
    if (cached) {
      return { data: cached.data, fromCache: true };
    }
    throw err;
  }
}
