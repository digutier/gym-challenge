import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getOptionalUserId } from '@/lib/api-auth';

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
    const currentUserId = await getOptionalUserId();

    // Si está autenticado, filtrar por amigos aceptados + sí mismo
    let allowedUserIds: string[] | null = null;
    if (currentUserId) {
      const { data: friendships } = await supabase
        .from('friendships')
        .select('requester_id, recipient_id')
        .or(`recipient_id.eq.${currentUserId},requester_id.eq.${currentUserId}`)
        .eq('status', 'accepted');

      const friendIds = (friendships || []).map((f: { requester_id: string; recipient_id: string }) =>
        f.requester_id === currentUserId ? f.recipient_id : f.requester_id
      );
      allowedUserIds = [currentUserId, ...friendIds];
    }

    // Obtener usuarios (filtrados si autenticado)
    let usersQuery = supabase.from('profiles').select('id, name, avatar');
    if (allowedUserIds) {
      usersQuery = usersQuery.in('id', allowedUserIds);
    }
    const { data: users, error: usersError } = await usersQuery;

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

