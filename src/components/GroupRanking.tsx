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
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
      <h3 className="text-white/90 text-xs font-bold mb-3 uppercase tracking-widest">
        🏆 Ranking
      </h3>
      
      <div className="space-y-2">
        {users.map((user, index) => {
          const isCurrentUser = user.id === currentUserId;
          
          return (
            <div
              key={user.id}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all
                ${isCurrentUser 
                  ? 'bg-amber-400/20 ring-1 ring-amber-400/40' 
                  : 'bg-white/5'
                }
              `}
            >
              {/* Posición */}
              <span className="text-xl w-7 text-center">
                {getRankEmoji(index)}
              </span>
              
              {/* Avatar */}
              <span className="text-2xl">
                {user.avatar}
              </span>
              
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
              
              {/* Días esta semana */}
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-black text-white leading-none">
                  {user.daysThisWeek}
                </p>
                <p className="text-white/40 text-[10px]">
                  semana
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

