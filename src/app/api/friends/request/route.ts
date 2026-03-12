import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// POST: Enviar solicitud de amistad por email
export async function POST(request: NextRequest) {
  try {
    const authSupabase = await createServerSupabaseClient();
    const { data: { session } } = await authSupabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Buscar usuario por email en profiles
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'No encontramos un usuario con ese email' },
        { status: 404 }
      );
    }

    if (targetUser.id === currentUserId) {
      return NextResponse.json(
        { error: 'No puedes enviarte una solicitud a ti mismo' },
        { status: 400 }
      );
    }

    // Verificar si ya existe relación en cualquier dirección
    const { data: existing } = await supabase
      .from('friendships')
      .select('id, status')
      .or(
        `and(requester_id.eq.${currentUserId},recipient_id.eq.${targetUser.id}),and(requester_id.eq.${targetUser.id},recipient_id.eq.${currentUserId})`
      )
      .single();

    if (existing) {
      if (existing.status === 'accepted') {
        return NextResponse.json({ error: 'Ya son amigos' }, { status: 409 });
      }
      if (existing.status === 'pending') {
        return NextResponse.json(
          { error: 'Ya enviaste una invitación a este usuario' },
          { status: 409 }
        );
      }
    }

    // Insertar solicitud
    const { error: insertError } = await supabase
      .from('friendships')
      .insert({
        requester_id: currentUserId,
        recipient_id: targetUser.id,
        status: 'pending',
      });

    if (insertError) {
      console.error('Error insertando solicitud:', insertError);
      return NextResponse.json({ error: 'Error al enviar solicitud' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en friends/request:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
