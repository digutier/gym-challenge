import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getServiceSupabase } from '@/lib/supabase';
import { GymHistoryEntry } from '@/types';

const DEFAULT_LIMIT = 60;
const MAX_LIMIT = 60;

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return auth.error;
    const { userId } = auth;

    const { searchParams } = new URL(request.url);
    const requestedLimit = Number(searchParams.get('limit'));
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, MAX_LIMIT)
      : DEFAULT_LIMIT;

    const serviceSupabase = getServiceSupabase();

    const { data: rows, error } = await serviceSupabase
      .from('gym_entries')
      .select('date, photo_url, created_at, updated_at')
      .eq('user_id', userId)
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
