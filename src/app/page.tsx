'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthScreen from '@/components/AuthScreen';
import DashboardRegistered from '@/components/DashboardRegistered';
import DashboardNotRegistered from '@/components/DashboardNotRegistered';
import { supabase } from '@/lib/supabase';
import { getTodayDate } from '@/lib/utils';

type TodayEntry = {
  date: string;
  photo_url: string;
  created_at: string;
  updated_at: string;
} | null;

export default function Home() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [todayEntry, setTodayEntry] = useState<TodayEntry>(null);
  const [checkingToday, setCheckingToday] = useState(true);

  const checkTodayEntry = useCallback(async () => {
    if (!user) return;
    
    setCheckingToday(true);
    try {
      const today = getTodayDate();
      const { data, error } = await supabase
        .from('gym_entries')
        .select('date, photo_url, created_at, updated_at')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
      
      if (error) throw error;
      setTodayEntry(data);
    } catch (error) {
      console.error('Error checking today entry:', error);
    } finally {
      setCheckingToday(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkTodayEntry();
    } else {
      setCheckingToday(false);
    }
  }, [user, checkTodayEntry]);

  const handleUploadComplete = () => {
    checkTodayEntry();
  };

  const handleLogout = () => {
    signOut();
  };

  // Loading state
  if (authLoading || (user && checkingToday)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 
                    flex flex-col items-center justify-center">
        <div className="relative">
          <div className="!w-20 !h-20 !rounded-full bg-white/20 flex items-center justify-center">
            <Loader2 className="!w-10 !h-10 !text-white animate-spin" />
          </div>
        </div>
        <p className="!text-white/80 !mt-4 !font-medium">Cargando...</p>
      </div>
    );
  }

  // Si no hay usuario, mostrar login
  if (!user) {
    return <AuthScreen />;
  }

  // Si no hay profile aún, mostrar loading solo si aún está cargando auth
  // Si auth ya terminó pero no hay profile, usar datos básicos
  if (!profile && !authLoading) {
    const userData = {
      id: user.id,
      name: user.email?.split('@')[0] || 'Usuario',
      avatar: user.user_metadata?.avatar || '🧑',
    };
    
    if (todayEntry) {
      return (
        <DashboardRegistered
          user={userData}
          entry={{
            date: todayEntry.date,
            photo_url: todayEntry.photo_url,
            timestamp: todayEntry.updated_at || todayEntry.created_at,
          }}
          onPhotoRetake={handleUploadComplete}
          onLogout={handleLogout}
        />
      );
    } else {
      return (
        <DashboardNotRegistered
          user={userData}
          onUploadComplete={handleUploadComplete}
          onLogout={handleLogout}
        />
      );
    }
  }

  // Si aún no hay profile después de todo, no debería llegar aquí pero por seguridad
  if (!profile) {
    return <AuthScreen />;
  }

  // Preparar datos del usuario para los componentes
  const userData = {
    id: user.id,
    name: profile.name,
    avatar: profile.avatar || '🧑',
  };

  // Si hay entrada de hoy, mostrar DashboardRegistered
  if (todayEntry) {
    return (
      <DashboardRegistered
        user={userData}
        entry={{
          date: todayEntry.date,
          photo_url: todayEntry.photo_url,
          timestamp: todayEntry.updated_at || todayEntry.created_at,
        }}
        onPhotoRetake={handleUploadComplete}
        onLogout={handleLogout}
      />
    );
  }

  // Si no hay entrada de hoy, mostrar DashboardNotRegistered
  return (
    <DashboardNotRegistered
      user={userData}
      onUploadComplete={handleUploadComplete}
      onLogout={handleLogout}
    />
  );
}
