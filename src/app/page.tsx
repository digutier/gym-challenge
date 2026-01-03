'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import LoginScreen from '@/components/LoginScreen';
import DashboardRegistered from '@/components/DashboardRegistered';
import DashboardNotRegistered from '@/components/DashboardNotRegistered';
import { TOKEN_STORAGE_KEY } from '@/lib/constants';
import { AppState, CheckTodayResponse } from '@/types';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<CheckTodayResponse | null>(null);

  // Verificar estado inicial
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    
    if (!storedToken) {
      setAppState('login');
      return;
    }

    setToken(storedToken);
    checkTodayStatus(storedToken);
  }, []);

  const checkTodayStatus = async (userToken: string) => {
    setAppState('loading');
    
    try {
      const response = await fetch(`/api/check-today?token=${userToken}`);
      
      if (!response.ok) {
        // Token inválido, mostrar login
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setAppState('login');
        return;
      }

      const data: CheckTodayResponse = await response.json();
      setUserData(data);
      setAppState(data.alreadyRegistered ? 'registered' : 'not-registered');
    } catch (error) {
      console.error('Error checking status:', error);
      setAppState('login');
    }
  };

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    checkTodayStatus(newToken);
  };

  const handleUploadComplete = () => {
    if (token) {
      checkTodayStatus(token);
    }
  };

  // Loading state
  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 
                    flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        </div>
        <p className="text-white/80 mt-4 font-medium">Cargando...</p>
      </div>
    );
  }

  // Login state
  if (appState === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Not registered state
  if (appState === 'not-registered' && userData && token) {
    return (
      <DashboardNotRegistered
        user={userData.user}
        token={token}
        onUploadComplete={handleUploadComplete}
      />
    );
  }

  // Registered state
  if (appState === 'registered' && userData?.entry && token) {
    return (
      <DashboardRegistered
        user={userData.user}
        entry={userData.entry}
        token={token}
        onPhotoRetake={handleUploadComplete}
      />
    );
  }

  // Fallback
  return null;
}
