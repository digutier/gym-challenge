import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/api-auth';

// POST: Aceptar o rechazar solicitud de amistad
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) return auth.error;
    const currentUserId = auth.userId;

    const { friendshipId, action } = await request.json();

    if (!friendshipId || !action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Verificar que la solicitud existe y está dirigida al usuario actual
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('id, recipient_id, status')
      .eq('id', friendshipId)
      .single();

    if (fetchError || !friendship) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
    }

    if (friendship.recipient_id !== currentUserId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    if (friendship.status !== 'pending') {
      return NextResponse.json({ error: 'La solicitud ya fue procesada' }, { status: 409 });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    const { error: updateError } = await supabase
      .from('friendships')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', friendshipId);

    if (updateError) {
      console.error('Error actualizando solicitud:', updateError);
      return NextResponse.json({ error: 'Error al procesar solicitud' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en friends/respond:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
