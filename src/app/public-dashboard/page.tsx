'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserStats } from '@/types';
import { formatDate, getTodayDate, getWeekDates } from '@/lib/utils';

export default function PublicDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/all-stats');
        if (!response.ok) throw new Error('Error al cargar datos');
        
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return {
          emoji: '🏆',
          bg: 'bg-gradient-to-br from-amber-400 to-orange-500',
          ring: 'ring-amber-300',
        };
      case 1:
        return {
          emoji: '🥈',
          bg: 'bg-gradient-to-br from-slate-300 to-slate-400',
          ring: 'ring-slate-200',
        };
      case 2:
        return {
          emoji: '🥉',
          bg: 'bg-gradient-to-br from-orange-300 to-orange-400',
          ring: 'ring-orange-200',
        };
      default:
        return {
          emoji: '🎖️',
          bg: 'bg-white/10',
          ring: 'ring-white/20',
        };
    }
  };

  const weekDates = getWeekDates();
  const today = getTodayDate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900
                    flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
        <p className="text-white/60 mt-4">Cargando ranking...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900
                    flex flex-col items-center justify-center p-6">
        <p className="text-red-400 text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-white"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="p-6 flex items-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-xl flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Ranking Semanal
          </h1>
          <p className="text-white/50 text-sm">
            Semana del {formatDate(weekDates[0])}
          </p>
        </div>
      </header>

      {/* Podium para top 3 */}
      <div className="px-6 mb-8">
        <div className="flex items-end justify-center gap-2">
          {/* Segundo lugar */}
          {users[1] && (
            <div className="flex flex-col items-center">
              <span className="text-4xl mb-2">{users[1].avatar}</span>
              <div className={`w-24 h-20 ${getRankStyle(1).bg} rounded-t-xl flex flex-col items-center justify-center`}>
                <span className="text-2xl">🥈</span>
                <span className="text-white font-bold">{users[1].daysThisWeek}</span>
              </div>
              <p className="text-white/80 text-sm mt-2 font-medium truncate max-w-24 text-center">
                {users[1].name}
              </p>
            </div>
          )}

          {/* Primer lugar */}
          {users[0] && (
            <div className="flex flex-col items-center -mb-4">
              <span className="text-5xl mb-2 animate-bounce">{users[0].avatar}</span>
              <div className={`w-28 h-28 ${getRankStyle(0).bg} rounded-t-xl flex flex-col items-center justify-center shadow-lg shadow-amber-500/30`}>
                <span className="text-3xl">🏆</span>
                <span className="text-white font-black text-2xl">{users[0].daysThisWeek}</span>
              </div>
              <p className="text-white font-bold mt-2 truncate max-w-28 text-center">
                {users[0].name}
              </p>
            </div>
          )}

          {/* Tercer lugar */}
          {users[2] && (
            <div className="flex flex-col items-center">
              <span className="text-4xl mb-2">{users[2].avatar}</span>
              <div className={`w-24 h-16 ${getRankStyle(2).bg} rounded-t-xl flex flex-col items-center justify-center`}>
                <span className="text-2xl">🥉</span>
                <span className="text-white font-bold">{users[2].daysThisWeek}</span>
              </div>
              <p className="text-white/80 text-sm mt-2 font-medium truncate max-w-24 text-center">
                {users[2].name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lista completa */}
      <div className="px-6 pb-8">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
          {users.map((user, index) => {
            const rankStyle = getRankStyle(index);
            
            return (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-4 border-b border-white/5 last:border-0
                  ${index < 3 ? 'bg-white/5' : ''}
                `}
              >
                {/* Posición */}
                <div className={`w-10 h-10 rounded-full ${rankStyle.bg} ring-2 ${rankStyle.ring}
                              flex items-center justify-center text-xl shadow-lg`}>
                  {index < 3 ? rankStyle.emoji : (index + 1)}
                </div>

                {/* Avatar y nombre */}
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-3xl">{user.avatar}</span>
                  <div>
                    <p className="text-white font-semibold">{user.name}</p>
                    <p className="text-white/40 text-xs">{user.totalDays} días totales</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <p className="text-white font-black text-2xl">{user.daysThisWeek}</p>
                  <p className="text-white/40 text-xs">días</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Días de la semana */}
        <div className="mt-6 bg-white/5 rounded-2xl p-4 border border-white/10">
          <h3 className="text-white/60 text-sm mb-3 font-medium">Días de esta semana</h3>
          <div className="flex justify-between">
            {weekDates.map((date, i) => {
              const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
              const isToday = date === today;
              const isPast = date < today;
              
              return (
                <div 
                  key={date} 
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg
                    ${isToday ? 'bg-purple-500/30 ring-1 ring-purple-400' : ''}
                  `}
                >
                  <span className={`text-xs ${isToday ? 'text-purple-300' : 'text-white/40'}`}>
                    {dayNames[i]}
                  </span>
                  <span className={`text-sm font-medium ${isToday ? 'text-white' : isPast ? 'text-white/60' : 'text-white/30'}`}>
                    {new Date(date + 'T12:00:00').getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

