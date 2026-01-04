import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getTodayDate, getWeekStart, getWeekEnd } from '@/lib/utils';
import { STORAGE_BUCKET } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    // Obtener token del header Authorization
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Verificar usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name')
      .eq('token', token)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obtener archivo de FormData
    const formData = await request.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Foto requerida' },
        { status: 400 }
      );
    }

    const today = getTodayDate();
    const timestamp = Date.now();
    // Usar timestamp en el nombre para evitar caché de CDN
    const fileName = `${user.id}/${today}-${timestamp}.jpg`;

    // Borrar archivos anteriores del mismo día (si existen)
    const { data: existingFiles } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(user.id, {
        search: today,
      });
    
    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `${user.id}/${f.name}`);
      await supabase.storage.from(STORAGE_BUCKET).remove(filesToDelete);
    }

    // Subir foto a Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
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
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    const photoUrl = urlData.publicUrl;

    // Verificar si ya existe un registro de hoy (para update vs insert)
    const { data: existingEntry } = await supabase
      .from('gym_entries')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    let entry;

    if (existingEntry) {
      // Actualizar registro existente
      const { data, error } = await supabase
        .from('gym_entries')
        .update({
          photo_url: photoUrl,
          updated_at: new Date().toISOString(),
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
          user_id: user.id,
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
      .eq('user_id', user.id)
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

