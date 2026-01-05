'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  created_at: string;
  updated_at: string;
};

type AuthResponse = {
  data: { user: User | null; session: Session | null } | null;
  error: AuthError | null;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar configuración de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('[AuthContext] Initializing AuthProvider');
    console.log('[AuthContext] Supabase URL:', supabaseUrl ? '✅ Configured' : '❌ Missing');
    console.log('[AuthContext] Supabase Key:', supabaseKey ? '✅ Configured' : '❌ Missing');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[AuthContext] ⚠️ Supabase environment variables not configured!');
      setLoading(false);
      return;
    }
    
    let isMounted = true;

    const loadProfile = async (userId: string) => {
      console.log('[AuthContext] Loading profile for userId:', userId);
      try {
        // Usar API route en vez de consulta directa para evitar problemas de RLS
        console.log('[AuthContext] Fetching profile from API route...');
        const response = await fetch('/api/profile');
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log('[AuthContext] Not authenticated');
            if (isMounted) {
              setProfile(null);
            }
            return;
          }
          throw new Error(`HTTP ${response.status}`);
        }
        
        const { profile: data, error } = await response.json();
        
        // Si hay error en la respuesta JSON
        if (error) {
          throw new Error(error);
        }
        
        console.log('[AuthContext] Profile loaded from API:', data);
        
        if (!isMounted) {
          console.log('[AuthContext] Component unmounted, skipping profile update');
          return;
        }
        
        if (data) {
          console.log('[AuthContext] Setting profile state');
          setProfile(data);
        } else {
          console.log('[AuthContext] No profile data, setting to null');
          setProfile(null);
        }
      } catch (error: unknown) {
        const errorObj = error as { message?: string; code?: string; details?: string; hint?: string };
        console.error('[AuthContext] Error loading profile (catch):', errorObj);
        console.error('[AuthContext] Error details:', {
          message: errorObj?.message,
          code: errorObj?.code,
          details: errorObj?.details,
          hint: errorObj?.hint,
        });
        
        
        if (isMounted) {
          setProfile(null);
        }
      }
    };
    
    // Verificar sesión actual
    console.log('[AuthContext] Initializing, checking session...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('[AuthContext] getSession result:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        error 
      });
      
      if (!isMounted) {
        console.log('[AuthContext] Component unmounted during getSession');
        return;
      }
      
      if (error) {
        console.error('[AuthContext] Error getting session:', error);
        setLoading(false);
        return;
      }
      
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('[AuthContext] User found, loading profile...');
        loadProfile(session.user.id).finally(() => {
          console.log('[AuthContext] loadProfile finished, setting loading to false');
          if (isMounted) {
            setLoading(false);
          }
        });
      } else {
        console.log('[AuthContext] No session, setting loading to false');
        setLoading(false);
      }
    }).catch((error) => {
      console.error('[AuthContext] Error in getSession (catch):', error);
      if (isMounted) {
        setLoading(false);
      }
    });

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return;
        
        console.log('Auth event:', event);
        
        // ⚠️ IGNORAR TOKEN_REFRESHED si ya tenemos datos cargados
        if (event === 'TOKEN_REFRESHED') {
          console.log('[AuthContext] Token refreshed, but skipping reload');
          return; // No hacer nada, solo es un refresh del token
        }
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            await loadProfile(session.user.id);
          } catch (error) {
            console.error('Error loading profile in auth change:', error);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Timeout de seguridad (10 segundos)
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth loading timeout, forcing false');
        setLoading(false);
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          name,
          avatar: '🧑'
        }
      }
    });
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (!error) {
      // Recargar perfil después de actualizar
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!fetchError && data) {
        setProfile(data);
      }
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (!error && data) {
      setProfile(data);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signUp, 
      signIn, 
      signOut,
      updateProfile,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

