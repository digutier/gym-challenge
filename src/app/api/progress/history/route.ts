import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getServiceSupabase } from '@/lib/supabase';
import { toProgressEntries } from '@/lib/progress';

// One row per day at most, so even a year of daily use stays reasonable —
// this cap exists as a sanity ceiling on the query (each row can carry up
// to 4 photo paths to batch-sign), not a real pagination limit.
const DEFAULT_LIMIT = 365;
const MAX_LIMIT = 365;

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
      .from('progress_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error obteniendo historial de progreso:', error);
      return NextResponse.json({ error: 'Error al obtener historial' }, { status: 500 });
    }

    const entries = await toProgressEntries(
      serviceSupabase,
      (rows || []).map((row) => ({ date: row.date as string, row }))
    );

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error en GET progress/history:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
