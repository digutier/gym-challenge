'use client';

import { useState } from 'react';
import { UserStats } from '@/types';
import { capDays, WEEKLY_GOAL } from '@/lib/utils';
import { X } from 'lucide-react';

interface GroupRankingProps {
  users: UserStats[];
  currentUserId?: string;
}

export default function GroupRanking({ users, currentUserId }: GroupRankingProps) {
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);

  // Ordenar por días con cap aplicado
  const sortedUsers = [...users].sort((a, b) => 
    capDays(b.daysThisWeek) - capDays(a.daysThisWeek)
  );

  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '🏆';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🎖️';
    }
  };

  const handleAvatarClick = (user: UserStats) => {
    // Solo abrir story si tiene foto de hoy y no es el usuario actual
    if (user.todayPhotoUrl && user.id !== currentUserId) {
      setSelectedUser(user);
    }
  };

  const closeStory = () => {
    setSelectedUser(null);
  };

  return (
    <>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl !p-4 border border-white/10 shadow-lg">
        <h3 className="text-white/90 text-xs font-bold !mb-3 uppercase tracking-widest">
          🏆 Ranking Semanal
        </h3>
        
        <div className="space-y-2">
          {sortedUsers.map((user, index) => {
            const isCurrentUser = user.id === currentUserId;
            const cappedDays = capDays(user.daysThisWeek);
            const reachedGoal = cappedDays >= WEEKLY_GOAL;
            // Mostrar borde verde si tiene foto de hoy y no es el usuario actual
            const hasTodayPhoto = user.todayPhotoUrl && !isCurrentUser;
            
            return (
              <div
                key={user.id}
                className={`flex items-center !gap-2.5 !p-2.5 rounded-xl transition-all
                  ${isCurrentUser 
                    ? 'bg-amber-400/20 ring-1 ring-amber-400/40' 
                    : 'bg-white/5'
                  }
                `}
              >
                {/* Posición */}
                <span className="text-xl !w-7 text-center">
                  {getRankEmoji(index)}
                </span>
                
                {/* Avatar con borde si tiene foto de hoy */}
                <button
                  onClick={() => handleAvatarClick(user)}
                  disabled={!hasTodayPhoto}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all
                    ${hasTodayPhoto 
                      ? 'ring-[3px] ring-emerald-400 cursor-pointer hover:scale-110 active:scale-95' 
                      : 'cursor-default'
                    }
                  `}
                  style={{
                    background: hasTodayPhoto 
                      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)' 
                      : 'transparent'
                  }}
                >
                  <span className={`text-2xl ${hasTodayPhoto ? 'bg-[#6b46c1] rounded-full w-9 h-9 flex items-center justify-center' : ''}`}>
                    {user.avatar}
                  </span>
                </button>
                
                {/* Nombre */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${isCurrentUser ? 'text-amber-200' : 'text-white'}`}>
                    {user.name}
                    {isCurrentUser && <span className="text-[10px] ml-1 opacity-60">(tú)</span>}
                  </p>
                  <p className="text-white/40 text-[10px]">
                    {user.totalDays} total
                  </p>
                </div>
                
                {/* Días esta semana (con cap) */}
                <div className="text-right flex-shrink-0">
                  <p className={`text-xl font-black leading-none ${reachedGoal ? 'text-emerald-400' : 'text-white'}`}>
                    {cappedDays}
                  </p>
                  <p className="text-white/40 text-[10px]">
                    / {WEEKLY_GOAL}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Story Modal */}
      {selectedUser && selectedUser.todayPhotoUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeStory}
        >
          {/* Header con info del usuario */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3 bg-gradient-to-b from-black/60 to-transparent z-10">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center ring-2 ring-white/30">
              <span className="text-xl">{selectedUser.avatar}</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{selectedUser.name}</p>
              <p className="text-white/60 text-xs">Hoy</p>
            </div>
            <button 
              onClick={closeStory}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Barra de progreso (estilo Instagram) */}
          <div className="absolute top-2 left-4 right-4 h-0.5 bg-white/20 rounded-full z-10">
            <div 
              className="h-full bg-white rounded-full"
              style={{ animation: 'storyProgress 5s linear forwards' }}
            />
          </div>

          {/* Imagen */}
          <img
            src={selectedUser.todayPhotoUrl}
            alt={`Foto de ${selectedUser.name}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Indicador de toque para cerrar */}
          <p className="absolute bottom-6 left-0 right-0 text-center text-white/40 text-xs">
            Toca para cerrar
          </p>
        </div>
      )}
    </>
  );
}
