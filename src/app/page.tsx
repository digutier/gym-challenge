'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthScreen from '@/components/AuthScreen';
import Dashboard from '@/components/Dashboard';
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

  const handlePhotoUpload = async (entryData?: { date: string; photo_url: string; timestamp: string }) => {
    if (entryData) {
      // Si tenemos los datos directamente de la API, usarlos inmediatamente
      setTodayEntry({
        date: entryData.date,
        photo_url: entryData.photo_url,
        created_at: entryData.timestamp,
        updated_at: entryData.timestamp,
      });
    } else {
      // Si no tenemos datos, hacer query con un pequeño delay
      // La API debería retornar los datos, pero por si acaso hacemos esto como fallback
      await new Promise(resolve => setTimeout(resolve, 1000));
      await checkTodayEntry();
    }
  };

  const handleEntryDelete = () => {
    setTodayEntry(null);
  };

  const handleLogout = () => {
    signOut();
  };

  // Loading state
  if (authLoading || (user && checkingToday)) {
    return (
      <div className="min-h-screen bg-[#191022] flex flex-col items-center justify-center">
        <div className="bg-[rgba(127,13,242,0.2)] rounded-full size-20 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#7f0df2] animate-spin" />
        </div>
        <p className="text-[#94a3b8] mt-4 font-medium">Cargando...</p>
      </div>
    );
  }

  // Si no hay usuario, mostrar login
  if (!user) {
    return <AuthScreen />;
  }

  // Preparar datos del usuario
  const userData = {
    id: user.id,
    name: profile?.name || user.email?.split('@')[0] || 'Usuario',
    avatar: profile?.avatar || user.user_metadata?.avatar || '🧑',
  };

  // Preparar entry si existe
  const entryData = todayEntry ? {
    date: todayEntry.date,
    photo_url: todayEntry.photo_url,
    timestamp: todayEntry.updated_at || todayEntry.created_at,
  } : null;

  return (
    <Dashboard
      user={userData}
      entry={entryData}
      onPhotoUpload={handlePhotoUpload}
      onEntryDelete={handleEntryDelete}
      onLogout={handleLogout}
    />
  );
}
