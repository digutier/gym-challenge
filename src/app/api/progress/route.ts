import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getServiceSupabase } from '@/lib/supabase';
import { getTodayDate } from '@/lib/date';
import { toProgressEntry } from '@/lib/progress';

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return auth.error;
    const { userId } = auth;

    const serviceSupabase = getServiceSupabase();
    const today = getTodayDate();

    const { data: row, error } = await serviceSupabase
      .from('progress_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (error) {
      console.error('Error obteniendo progress entry:', error);
      return NextResponse.json({ error: 'Error al obtener registro de progreso' }, { status: 500 });
    }

    const entry = await toProgressEntry(serviceSupabase, today, row);
    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error en GET progress:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
