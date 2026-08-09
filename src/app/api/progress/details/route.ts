import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getServiceSupabase } from '@/lib/supabase';
import { getTodayDate } from '@/lib/date';
import { PROGRESS_NOTE_MAX_LENGTH } from '@/lib/constants';
import { toProgressEntry } from '@/lib/progress';

const MIN_WEIGHT_KG = 20;
const MAX_WEIGHT_KG = 400;

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return auth.error;
    const { userId } = auth;

    const body = await request.json();
    const note = typeof body.note === 'string' ? body.note : null;
    const weightKg = typeof body.weightKg === 'number' ? body.weightKg : null;

    if (note !== null && note.length > PROGRESS_NOTE_MAX_LENGTH) {
      return NextResponse.json({ error: `Nota muy larga (máx ${PROGRESS_NOTE_MAX_LENGTH} caracteres)` }, { status: 400 });
    }
    if (weightKg !== null && (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG)) {
      return NextResponse.json({ error: 'Peso fuera de rango' }, { status: 400 });
    }

    const serviceSupabase = getServiceSupabase();
    const today = getTodayDate();

    const { data: row, error: upsertError } = await serviceSupabase
      .from('progress_entries')
      .upsert(
        { user_id: userId, date: today, note, weight_kg: weightKg },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('Error guardando detalles de progreso:', upsertError);
      return NextResponse.json({ error: 'Error al guardar registro' }, { status: 500 });
    }

    const entry = await toProgressEntry(serviceSupabase, today, row);
    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Error en POST progress/details:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
