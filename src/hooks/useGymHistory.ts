import { useState, useCallback, useEffect, useRef } from 'react';
import { GymHistoryEntry } from '@/types';

export function useGymHistory(userId?: string) {
  const [entries, setEntries] = useState<GymHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    // Cancel any in-flight request for a previous userId — otherwise a
    // slow response for A arriving after B's fast one would clobber B's
    // entries, showing one person's photos under another's name.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const url = userId ? `/api/gym-history?userId=${encodeURIComponent(userId)}` : '/api/gym-history';
      const res = await fetch(url, { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
      } else {
        // Don't leave the previous user's entries on screen under the
        // newly-selected name (e.g. a 403 if a friendship was revoked).
        setEntries([]);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error fetching gym history:', err);
        setEntries([]);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
    return () => abortRef.current?.abort();
  }, [refresh]);

  return { entries, loading, refresh };
}
