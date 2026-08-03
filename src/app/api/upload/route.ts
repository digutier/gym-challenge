import { NextRequest, NextResponse } from 'next/server';
import { requireAuthClient } from '@/lib/api-auth';
import { getServiceSupabase } from '@/lib/supabase';
import { getTodayDate, getWeekStart, getWeekEnd } from '@/lib/date';
import { STORAGE_BUCKET } from '@/lib/constants';

export async function DELETE() {
  try {
    const auth = await requireAuthClient();
    if ('error' in auth) return auth.error;
    const { userId, supabase } = auth;

    const today = getTodayDate();
    const serviceSupabase = getServiceSupabase();

    // Eliminar archivos del storage para hoy
    const { data: existingFiles } = await serviceSupabase.storage
      .from(STORAGE_BUCKET)
      .list(userId, { search: today });

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
      await serviceSupabase.storage.from(STORAGE_BUCKET).remove(filesToDelete);
    }

    // Eliminar registro de la base de datos
    const { error: deleteError } = await supabase
      .from('gym_entries')
      .delete()
      .eq('user_id', userId)
      .eq('date', today);

    if (deleteError) {
      console.error('Error eliminando entry:', deleteError);
      return NextResponse.json({ error: 'Error al eliminar registro' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en delete:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthClient();
    if ('error' in auth) return auth.error;
    const { userId, supabase } = auth;

    // Obtener archivo de FormData
    const formData = await request.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Foto requerida' },
        { status: 400 }
      );
    }

    // Validaciones
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Foto muy grande (máx 5MB)' },
        { status: 400 }
      );
    }

    // Usar service client para operaciones de storage (bypass RLS)
    const serviceSupabase = getServiceSupabase();

    const today = getTodayDate();
    const timestamp = Date.now();
    // Usar timestamp en el nombre para evitar caché de CDN
    const fileName = `${userId}/${today}-${timestamp}.jpg`;

    // Borrar archivos anteriores del mismo día (si existen)
    const { data: existingFiles } = await serviceSupabase.storage
      .from(STORAGE_BUCKET)
      .list(userId, {
        search: today,
      });
    
    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`);
      await serviceSupabase.storage.from(STORAGE_BUCKET).remove(filesToDelete);
    }

    // Subir foto a Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await serviceSupabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '0', // Desactivar caché
      });

    if (uploadError) {
      console.error('Error subiendo foto:', uploadError);
      return NextResponse.json(
        { error: 'Error al subir foto' },
        { status: 500 }
      );
    }

    // Obtener URL pública
    const { data: urlData } = serviceSupabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    const photoUrl = urlData.publicUrl;

    // Verificar si ya existe un registro de hoy (para update vs insert)
    const { data: existingEntry } = await supabase
      .from('gym_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    let entry;

    if (existingEntry) {
      // Actualizar registro existente
      // updated_at se maneja automáticamente por el trigger en la BD, pero lo dejamos explícito
      const { data, error } = await supabase
        .from('gym_entries')
        .update({
          photo_url: photoUrl,
        })
        .eq('id', existingEntry.id)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando entry:', error);
        return NextResponse.json(
          { error: 'Error al actualizar registro' },
          { status: 500 }
        );
      }
      entry = data;
    } else {
      // Crear nuevo registro
      const { data, error } = await supabase
        .from('gym_entries')
        .insert({
          user_id: userId,
          date: today,
          photo_url: photoUrl,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando entry:', error);
        return NextResponse.json(
          { error: 'Error al crear registro' },
          { status: 500 }
        );
      }
      entry = data;
    }

    // Contar días de esta semana
    const weekStart = getWeekStart().toISOString().split('T')[0];
    const weekEnd = getWeekEnd().toISOString().split('T')[0];

    const { count } = await supabase
      .from('gym_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', weekStart)
      .lte('date', weekEnd);

    return NextResponse.json({
      success: true,
      entry,
      daysThisWeek: count || 0,
    });
  } catch (error) {
    console.error('Error en upload:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
