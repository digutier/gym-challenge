import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { getServiceSupabase } from '@/lib/supabase';
import { getTodayDate } from '@/lib/date';
import { PROGRESS_STORAGE_BUCKET } from '@/lib/constants';
import { isBodyPart, toProgressEntry } from '@/lib/progress';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return auth.error;
    const { userId } = auth;

    const formData = await request.formData();
    const part = formData.get('part');
    const file = formData.get('photo') as File | null;

    if (!isBodyPart(part)) {
      return NextResponse.json({ error: 'Parte del cuerpo inválida' }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: 'Foto requerida' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Foto muy grande (máx 5MB)' }, { status: 400 });
    }

    const serviceSupabase = getServiceSupabase();
    const today = getTodayDate();
    const path = `${userId}/${today}/${part}.jpg`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await serviceSupabase.storage
      .from(PROGRESS_STORAGE_BUCKET)
      .upload(path, arrayBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '0',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error subiendo foto de progreso:', uploadError);
      return NextResponse.json({ error: 'Error al subir foto' }, { status: 500 });
    }

    const { data: row, error: upsertError } = await serviceSupabase
      .from('progress_entries')
      .upsert(
        { user_id: userId, date: today, [`${part}_photo_path`]: path },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('Error guardando progress entry:', upsertError);
      return NextResponse.json({ error: 'Error al guardar registro' }, { status: 500 });
    }

    const entry = await toProgressEntry(serviceSupabase, today, row);
    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Error en POST progress/photo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return auth.error;
    const { userId } = auth;

    const { searchParams } = new URL(request.url);
    const part = searchParams.get('part');

    if (!isBodyPart(part)) {
      return NextResponse.json({ error: 'Parte del cuerpo inválida' }, { status: 400 });
    }

    const serviceSupabase = getServiceSupabase();
    const today = getTodayDate();
    const path = `${userId}/${today}/${part}.jpg`;

    await serviceSupabase.storage.from(PROGRESS_STORAGE_BUCKET).remove([path]);

    const { data: row, error: updateError } = await serviceSupabase
      .from('progress_entries')
      .update({ [`${part}_photo_path`]: null })
      .eq('user_id', userId)
      .eq('date', today)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('Error eliminando foto de progreso:', updateError);
      return NextResponse.json({ error: 'Error al eliminar foto' }, { status: 500 });
    }

    const entry = await toProgressEntry(serviceSupabase, today, row);
    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error('Error en DELETE progress/photo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
