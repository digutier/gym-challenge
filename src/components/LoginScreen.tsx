'use client';

import { USERS, TOKEN_STORAGE_KEY } from '@/lib/constants';

interface LoginScreenProps {
  onLogin: (token: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const handleUserSelect = (token: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    onLogin(token);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-7xl mb-4 animate-bounce">💪</div>
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">
          Gym Challenge
        </h1>
        <p className="text-purple-200 text-lg font-medium">
          ¿Quién eres?
        </p>
      </div>

      {/* Grid de usuarios */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {USERS.map((user) => (
          <button
            key={user.token}
            onClick={() => handleUserSelect(user.token)}
            className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 
                     hover:bg-white/20 hover:scale-105 active:scale-95
                     transition-all duration-300 ease-out
                     flex flex-col items-center gap-3"
          >
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
              {user.avatar}
            </span>
            <span className="text-white font-bold text-lg">
              {user.name}
            </span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <p className="text-purple-200/60 text-sm mt-10 text-center">
        Selecciona tu perfil para continuar
      </p>
    </div>
  );
}

