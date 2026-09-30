import { getServiceSupabase } from '@/lib/supabase';

type FriendIdsResult = { friendIds: string[]; error?: undefined } | { friendIds?: undefined; error: string };

/**
 * Accepted-friendship ids for a user — shared by every route that needs an
 * "is this person my friend" allowed-list (day-stats, gym-history). Keeping
 * this in one place means a future change to friendship semantics doesn't
 * get applied on only one side.
 */
export async function getAcceptedFriendIds(
  supabase: ReturnType<typeof getServiceSupabase>,
  userId: string
): Promise<FriendIdsResult> {
  const { data, error } = await supabase
    .from('friendships')
    .select('requester_id, recipient_id')
    .or(`recipient_id.eq.${userId},requester_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (error) {
    return { error: error.message };
  }

  const friendIds = (data || []).map((f: { requester_id: string; recipient_id: string }) =>
    f.requester_id === userId ? f.recipient_id : f.requester_id
  );

  return { friendIds };
}
