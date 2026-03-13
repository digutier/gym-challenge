import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET: Obtener solicitudes pendientes y amigos aceptados del usuario actual
export async function GET() {
  try {
    const authSupabase = await createServerSupabaseClient();
    const { data: { session } } = await authSupabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const supabase = getServiceSupabase();

    // Solicitudes pendientes recibidas
    const { data: pendingData, error: pendingError } = await supabase
      .from('friendships')
      .select('id, created_at, profiles!friendships_requester_id_fkey(id, name, avatar, email)')
      .eq('recipient_id', currentUserId)
      .eq('status', 'pending');

    if (pendingError) {
      console.error('Error obteniendo solicitudes:', pendingError);
      return NextResponse.json({ error: 'Error al obtener solicitudes' }, { status: 500 });
    }

    type ProfileRow = { id: string; name: string; avatar: string; email: string };
    const pendingRequests = (pendingData || []).map((row: {
      id: string;
      created_at: string;
      profiles: ProfileRow | ProfileRow[] | null;
    }) => ({
      id: row.id,
      created_at: row.created_at,
      requester: Array.isArray(row.profiles) ? row.profiles[0] ?? null : row.profiles,
    }));

    // Amigos aceptados (en ambas direcciones)
    const { data: acceptedData, error: acceptedError } = await supabase
      .from('friendships')
      .select(`
        id,
        requester_id,
        recipient_id,
        requester:profiles!friendships_requester_id_fkey(id, name, avatar, email),
        recipient:profiles!friendships_recipient_id_fkey(id, name, avatar, email)
      `)
      .or(`requester_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
      .eq('status', 'accepted');

    if (acceptedError) {
      console.error('Error obteniendo amigos:', acceptedError);
      return NextResponse.json({ error: 'Error al obtener amigos' }, { status: 500 });
    }

    type AcceptedProfileRow = { id: string; name: string; avatar: string; email: string } | { id: string; name: string; avatar: string; email: string }[] | null;
    const friends = (acceptedData || []).map((row: {
      id: string;
      requester_id: string;
      recipient_id: string;
      requester: AcceptedProfileRow;
      recipient: AcceptedProfileRow;
    }) => {
      const raw = row.requester_id === currentUserId ? row.recipient : row.requester;
      const friend = Array.isArray(raw) ? raw[0] ?? null : raw;
      return { friendshipId: row.id, ...friend };
    });

    return NextResponse.json({ pendingRequests, friends });
  } catch (error) {
    console.error('Error en friends route:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
