import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getTodayDate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    const today = getTodayDate();

    // Buscar usuario por token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, avatar')
      .eq('token', token)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar si ya registró hoy
    const { data: entry, error: entryError } = await supabase
      .from('gym_entries')
      .select('date, photo_url, created_at, updated_at')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (entryError && entryError.code !== 'PGRST116') {
      // PGRST116 = no rows found (es esperado si no ha registrado)
      console.error('Error buscando entry:', entryError);
      return NextResponse.json(
        { error: 'Error al verificar registro' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      alreadyRegistered: !!entry,
      entry: entry ? {
        date: entry.date,
        photo_url: entry.photo_url,
        // Usar updated_at para cache busting (cambia al retomar foto)
        timestamp: entry.updated_at || entry.created_at,
      } : undefined,
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Error en check-today:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

