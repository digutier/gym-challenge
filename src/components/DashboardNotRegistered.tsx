'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PhotoUpload from './PhotoUpload';

interface DashboardNotRegisteredProps {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  onUploadComplete: () => void;
  onLogout: () => void;
}

export default function DashboardNotRegistered({ 
  user, 
  onUploadComplete,
  onLogout
}: DashboardNotRegisteredProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex flex-col items-center px-4 py-6">
      {/* Container principal */}
      <div className="w-full max-w-md flex flex-col flex-1">
        {/* Header */}
        <header className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="rounded-full bg-white/10 hover:bg-white/20 !w-8 !h-8"
          >
            <LogOut className="w-4 h-4 text-white/70" />
          </Button>
          <span className="text-3xl">{user.avatar}</span>
          <div className="flex flex-col">
            <p className="text-white/60 text-xs">¡Hola,</p>
            <h1 className="text-white font-bold text-lg">{user.name}!</h1>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-center gap-8 pb-20">
          {/* Mensaje motivacional */}
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-6xl animate-bounce">🏋️</p>
            <div className="flex flex-col gap-2">
              <h2 className="text-white text-2xl font-bold">
                ¡Es hora de entrenar!
              </h2>
              <p className="text-purple-200/80">
                Toma una foto en el gym para registrar tu día
              </p>
            </div>
          </div>

          {/* Botón de foto */}
          <PhotoUpload 
            onUploadComplete={onUploadComplete}
          />
        </main>
      </div>

      {/* Bottom decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
}

