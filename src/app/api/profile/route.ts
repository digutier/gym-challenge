import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Verificar autenticación
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Usar service client para bypass RLS si es necesario
    const serviceSupabase = getServiceSupabase();
    
    const { data: profile, error } = await serviceSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      // Si el perfil no existe, crearlo
      if (error.code === 'PGRST116') {
        const email = session.user.email || '';
        const name = session.user.user_metadata?.name || email.split('@')[0] || 'Usuario';
        const avatar = session.user.user_metadata?.avatar || '🧑';
        
        const { data: newProfile, error: createError } = await serviceSupabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            name: name,
            avatar: avatar,
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
          return NextResponse.json(
            { error: 'Error al crear perfil' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({ profile: newProfile });
      }
      
      console.error('Error fetching profile:', error);
      return NextResponse.json(
        { error: 'Error al obtener perfil' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error in profile route:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

