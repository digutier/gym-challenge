import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    // Si el query parece un email completo (contiene @), buscar exacto primero
    const queryTrimmed = query?.trim() || '';
    
    if (!queryTrimmed || queryTrimmed.length < 2) {
      return NextResponse.json(
        { error: 'Query debe tener al menos 2 caracteres' },
        { status: 400 }
      );
    }

    type UserSearchResult = {
      user_id: string;
      email: string;
      name: string;
      avatar: string;
    };
    
    let users: UserSearchResult[] = [];
    
    // Si parece un email completo, buscar exacto primero
    if (queryTrimmed.includes('@')) {
      const { data: exactMatch, error: exactError } = await supabase
        .from('profiles')
        .select('id, email, name, avatar')
        .eq('email', queryTrimmed.toLowerCase())
        .limit(1);
      
      if (!exactError && exactMatch && exactMatch.length > 0) {
        // Formatear para que coincida con el formato de search_users_by_email
        users = exactMatch.map(profile => ({
          user_id: profile.id,
          email: profile.email,
          name: profile.name || '',
          avatar: profile.avatar || '🧑'
        }));
      } else {
        // Si no hay coincidencia exacta, buscar con la función de búsqueda
        const { data: searchResults, error: searchError } = await supabase.rpc(
          'search_users_by_email',
          {
            p_email_query: queryTrimmed,
            p_limit: 10
          }
        );
        
        if (!searchError && searchResults) {
          users = searchResults as UserSearchResult[];
        }
      }
    } else {
      // Búsqueda parcial usando la función
      const { data: searchResults, error: searchError } = await supabase.rpc(
        'search_users_by_email',
        {
          p_email_query: queryTrimmed,
          p_limit: 10
        }
      );
      
      if (!searchError && searchResults) {
        users = searchResults as UserSearchResult[];
      }
    }
    
    // Filtrar usuario actual de resultados
    const filtered = users.filter(
      (u) => u.user_id !== session.user.id
    );
    
    return NextResponse.json({ users: filtered });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

