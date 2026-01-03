'use client';

import { UserStats } from '@/types';

interface GroupRankingProps {
  users: UserStats[];
  currentUserId?: string;
}

export default function GroupRanking({ users, currentUserId }: GroupRankingProps) {
  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '🏆';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🎖️';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
      <h3 className="text-white/80 text-sm font-semibold mb-3 uppercase tracking-wider">
        Ranking del Grupo
      </h3>
      
      <div className="space-y-2">
        {users.map((user, index) => {
          const isCurrentUser = user.id === currentUserId;
          
          return (
            <div
              key={user.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all
                ${isCurrentUser 
                  ? 'bg-white/20 ring-2 ring-amber-400/50' 
                  : 'bg-white/5 hover:bg-white/10'
                }
              `}
            >
              {/* Posición */}
              <span className="text-2xl w-8 text-center">
                {getRankEmoji(index)}
              </span>
              
              {/* Avatar */}
              <span className="text-3xl">
                {user.avatar}
              </span>
              
              {/* Nombre */}
              <div className="flex-1">
                <p className={`font-semibold ${isCurrentUser ? 'text-amber-200' : 'text-white'}`}>
                  {user.name}
                  {isCurrentUser && <span className="text-xs ml-2 opacity-70">(tú)</span>}
                </p>
                <p className="text-white/50 text-xs">
                  {user.totalDays} días totales
                </p>
              </div>
              
              {/* Días esta semana */}
              <div className="text-right">
                <p className="text-2xl font-black text-white">
                  {user.daysThisWeek}
                </p>
                <p className="text-white/50 text-xs">
                  esta semana
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

