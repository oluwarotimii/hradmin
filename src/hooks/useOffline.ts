import { useState, useEffect, useCallback } from 'react';
import { adminDataStore } from '../services/offline/adminDataStore';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await adminDataStore.getMutationCount();
      setPendingCount(count);
    } catch { setPendingCount(0); }
  }, []);

  useEffect(() => { refreshPendingCount(); }, [refreshPendingCount]);
  useEffect(() => {
    if (isOnline) refreshPendingCount();
  }, [isOnline, refreshPendingCount]);

  return { isOnline, pendingCount, refreshPendingCount };
}
