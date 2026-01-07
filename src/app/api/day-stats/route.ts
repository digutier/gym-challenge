import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET: Obtener estadísticas de un día específico (fotos de todos los usuarios)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Fecha requerida' },
        { status: 400 }
      );
    }

    // Validar formato de fecha (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Formato de fecha inválido' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    
    // Obtener autenticación para saber quién es el usuario actual
    const authSupabase = await createServerSupabaseClient();
    const { data: { session } } = await authSupabase.auth.getSession();
    const currentUserId = session?.user?.id;

    // Obtener todos los usuarios
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, name, avatar');

    if (usersError) {
      console.error('Error obteniendo usuarios:', usersError);
      return NextResponse.json(
        { error: 'Error al obtener usuarios' },
        { status: 500 }
      );
    }

    // Obtener las fotos del día específico para todos los usuarios
    const { data: dayEntries, error: dayError } = await supabase
      .from('gym_entries')
      .select('user_id, photo_url, created_at')
      .eq('date', date);

    if (dayError) {
      console.error('Error obteniendo fotos del día:', dayError);
      return NextResponse.json(
        { error: 'Error al obtener fotos del día' },
        { status: 500 }
      );
    }

    // Crear mapa de fotos por usuario
    const userPhotos = new Map<string, { photo_url: string; created_at: string }>();
    dayEntries?.forEach(entry => {
      userPhotos.set(entry.user_id, {
        photo_url: entry.photo_url,
        created_at: entry.created_at,
      });
    });

    // Construir respuesta con usuarios y sus fotos del día
    const usersWithPhotos = users?.map(user => {
      const photoData = userPhotos.get(user.id);
      return {
        id: user.id,
        name: user.name || 'Usuario',
        avatar: user.avatar || '🧑',
        photoUrl: photoData?.photo_url || null,
        photoTimestamp: photoData?.created_at || null,
        hasPhoto: !!photoData,
      };
    }) || [];

    // Encontrar la foto del usuario actual
    const currentUserPhoto = currentUserId ? userPhotos.get(currentUserId) : null;

    return NextResponse.json({
      date,
      users: usersWithPhotos,
      currentUserPhoto: currentUserPhoto ? {
        photo_url: currentUserPhoto.photo_url,
        timestamp: currentUserPhoto.created_at,
      } : null,
    });
  } catch (error) {
    console.error('Error en day-stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

