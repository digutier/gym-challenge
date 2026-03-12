import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET: Obtener solicitudes de amistad pendientes recibidas por el usuario actual
export async function GET() {
  try {
    const authSupabase = await createServerSupabaseClient();
    const { data: { session } } = await authSupabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from('friendships')
      .select('id, created_at, profiles!friendships_requester_id_fkey(id, name, avatar, email)')
      .eq('recipient_id', currentUserId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error obteniendo solicitudes:', error);
      return NextResponse.json({ error: 'Error al obtener solicitudes' }, { status: 500 });
    }

    const pendingRequests = (data || []).map((row: {
      id: string;
      created_at: string;
      profiles: { id: string; name: string; avatar: string; email: string } | null;
    }) => ({
      id: row.id,
      created_at: row.created_at,
      requester: row.profiles,
    }));

    return NextResponse.json({ pendingRequests });
  } catch (error) {
    console.error('Error en friends route:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
