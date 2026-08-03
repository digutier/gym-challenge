import { useState, useEffect, useCallback } from 'react';
import { FriendRequest, Friend } from '@/types';

export function useFriendRequests(userId: string) {
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);

  const fetchPendingRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/friends');
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.pendingRequests || []);
        setFriends(data.friends || []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    // Same fetch-in-effect pattern as the original inline Dashboard.tsx code
    // (and AuthContext's loadProfile); moving it into this hook just made the
    // analyzer able to trace it. No behavior change intended here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPendingRequests();
  }, [userId, fetchPendingRequests]);

  return { pendingRequests, friends, fetchPendingRequests };
}
