import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getServiceSupabase } from '@/lib/supabase';
import { getAcceptedFriendIds } from '@/lib/friends';
import { GymHistoryEntry } from '@/types';

// One row per day at most, so even years of daily use stay small — this
// cap exists as a sanity ceiling on the query, not a real pagination limit.
const DEFAULT_LIMIT = 1000;
const MAX_LIMIT = 1000;

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return auth.error;
    const { userId: currentUserId } = auth;

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId') || currentUserId;
    const requestedLimit = Number(searchParams.get('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, MAX_LIMIT)
      : DEFAULT_LIMIT;

    const serviceSupabase = getServiceSupabase();

    // Viewing a friend's history is allowed (gym photos are already shared
    // with friends via all-stats/day-stats) — but only an accepted friend,
    // never an arbitrary userId.
    if (targetUserId !== currentUserId) {
      const friendResult = await getAcceptedFriendIds(serviceSupabase, currentUserId);

      if ('error' in friendResult) {
        console.error('Error verificando amistad:', friendResult.error);
        return NextResponse.json({ error: 'Error al verificar amistad' }, { status: 500 });
      }

      if (!friendResult.friendIds.includes(targetUserId)) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      }
    }

    const { data: rows, error } = await serviceSupabase
      .from('gym_entries')
      .select('date, photo_url, created_at, updated_at')
      .eq('user_id', targetUserId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error obteniendo historial de gym:', error);
      return NextResponse.json({ error: 'Error al obtener historial' }, { status: 500 });
    }

    const entries: GymHistoryEntry[] = (rows || []).map((row) => ({
      date: row.date,
      photoUrl: row.photo_url,
      timestamp: row.updated_at || row.created_at,
    }));

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error en GET gym-history:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
