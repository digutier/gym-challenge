import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/api-auth';

// DELETE: Eliminar amistad aceptada
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return auth.error;
    const currentUserId = auth.userId;

    const { friendshipId } = await request.json();

    if (!friendshipId) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Verificar que la amistad existe y el usuario es parte de ella
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('id, requester_id, recipient_id, status')
      .eq('id', friendshipId)
      .single();

    if (fetchError || !friendship) {
      return NextResponse.json({ error: 'Amistad no encontrada' }, { status: 404 });
    }

    if (friendship.requester_id !== currentUserId && friendship.recipient_id !== currentUserId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (deleteError) {
      console.error('Error eliminando amistad:', deleteError);
      return NextResponse.json({ error: 'Error al eliminar amistad' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en friends/remove:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
