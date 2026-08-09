import { useState, useCallback, useEffect } from 'react';
import { ProgressEntry } from '@/types';

export function useProgressHistory() {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/progress/history');
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
      }
    } catch (err) {
      console.error('Error fetching progress history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, loading, refresh };
}
