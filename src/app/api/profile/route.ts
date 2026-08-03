import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/api-auth';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const auth = await requireAuthUser();
    if ('error' in auth) return auth.error;
    const { user } = auth;
    const userId = user.id;

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
        const email = user.email || '';
        const name = user.user_metadata?.name || email.split('@')[0] || 'Usuario';
        const avatar = user.user_metadata?.avatar || '🧑';
        
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

