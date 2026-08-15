import { useState, useCallback, useEffect } from 'react';
import { GymHistoryEntry } from '@/types';

export function useGymHistory(userId?: string) {
  const [entries, setEntries] = useState<GymHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const url = userId ? `/api/gym-history?userId=${userId}` : '/api/gym-history';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
      }
    } catch (err) {
      console.error('Error fetching gym history:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, loading, refresh };
}
