import { useState, useCallback, useEffect } from 'react';
import { GymHistoryEntry } from '@/types';

export function useGymHistory() {
  const [entries, setEntries] = useState<GymHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gym-history');
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
      }
    } catch (err) {
      console.error('Error fetching gym history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, loading, refresh };
}
