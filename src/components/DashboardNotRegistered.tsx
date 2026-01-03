'use client';

import PhotoUpload from './PhotoUpload';

interface DashboardNotRegisteredProps {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  token: string;
  onUploadComplete: () => void;
}

export default function DashboardNotRegistered({ 
  user, 
  token,
  onUploadComplete 
}: DashboardNotRegisteredProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center gap-4">
        <span className="text-4xl">{user.avatar}</span>
        <div>
          <p className="text-white/60 text-sm">¡Hola,</p>
          <h1 className="text-white font-bold text-xl">{user.name}!</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {/* Mensaje motivacional */}
        <div className="text-center mb-10">
          <p className="text-5xl mb-4">🏋️</p>
          <h2 className="text-white text-2xl font-bold mb-2">
            ¡Es hora de entrenar!
          </h2>
          <p className="text-purple-200">
            Toma una foto en el gym para registrar tu día
          </p>
        </div>

        {/* Botón de foto */}
        <PhotoUpload 
          token={token} 
          onUploadComplete={onUploadComplete}
        />
      </main>

      {/* Bottom decorative gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
    </div>
  );
}

