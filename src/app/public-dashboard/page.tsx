'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserStats } from '@/types';
import { getCurrentMonthName, WEEKLY_GOAL } from '@/lib/utils';

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
        // Ordenar por días mensuales (con cap semanal aplicado)
        const sortedUsers = [...data.users].sort((a: UserStats, b: UserStats) => 
          (b.monthlyDays ?? 0) - (a.monthlyDays ?? 0)
        );
        setUsers(sortedUsers);
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

  // Calcular máximo mensual posible (4 semanas * WEEKLY_GOAL)
  const maxMonthlyDays = 4 * WEEKLY_GOAL;

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
        <Button 
          variant="secondary"
          onClick={() => window.location.reload()}
          className="!mt-4"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="p-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/')}
          className="!rounded-full !bg-white/10 hover:!bg-white/20"
        >
          <ArrowLeft className="!w-5 !h-5 !text-white" />
        </Button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-xl flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Ranking {getCurrentMonthName()}
          </h1>
          <p className="text-white/50 text-sm">
            Meta: {WEEKLY_GOAL} días por semana (máx. {maxMonthlyDays}/mes)
          </p>
        </div>
      </header>

      {/* Podium para top 3 (días mensuales) */}
      <div className="!px-6 !mb-8">
        <div className="flex items-end justify-center !gap-2">
          {/* Segundo lugar */}
          {users[1] && (
            <div className="flex flex-col items-center">
              <span className="!text-4xl !mb-2">{users[1].avatar}</span>
              <div className={`!w-24 !h-20 ${getRankStyle(1).bg} !rounded-t-xl flex flex-col items-center justify-center`}>
                <span className="!text-2xl">🥈</span>
                <span className="!text-white !font-bold">{users[1].monthlyDays ?? 0}</span>
              </div>
              <p className="!text-white/80 !text-sm !mt-2 !font-medium truncate !max-w-24 text-center">
                {users[1].name}
              </p>
            </div>
          )}

          {/* Primer lugar */}
          {users[0] && (
            <div className="flex flex-col items-center !-mb-4">
              <span className="!text-5xl !mb-2 animate-bounce">{users[0].avatar}</span>
              <div className={`!w-28 !h-28 ${getRankStyle(0).bg} !rounded-t-xl flex flex-col items-center justify-center !shadow-lg !shadow-amber-500/30`}>
                <span className="!text-3xl">🏆</span>
                <span className="!text-white !font-black !text-2xl">{users[0].monthlyDays ?? 0}</span>
              </div>
              <p className="!text-white !font-bold !mt-2 truncate !max-w-28 text-center">
                {users[0].name}
              </p>
            </div>
          )}

          {/* Tercer lugar */}
          {users[2] && (
            <div className="flex flex-col items-center">
              <span className="!text-4xl !mb-2">{users[2].avatar}</span>
              <div className={`!w-24 !h-16 ${getRankStyle(2).bg} !rounded-t-xl flex flex-col items-center justify-center`}>
                <span className="!text-2xl">🥉</span>
                <span className="!text-white !font-bold">{users[2].monthlyDays ?? 0}</span>
              </div>
              <p className="!text-white/80 !text-sm !mt-2 !font-medium truncate !max-w-24 text-center">
                {users[2].name}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lista completa */}
      <div className="!px-6 !pb-8">
        <div className="!bg-white/5 backdrop-blur-lg !rounded-2xl !border !border-white/10 overflow-hidden">
          {users.map((user, index) => {
            const rankStyle = getRankStyle(index);
            
            return (
              <div
                key={user.id}
                className={`flex items-center !gap-4 !p-4 !border-b !border-white/5 last:!border-0
                  ${index < 3 ? '!bg-white/5' : ''}
                `}
              >
                {/* Posición */}
                <div className={`!w-10 !h-10 !rounded-full ${rankStyle.bg} !ring-2 ${rankStyle.ring}
                              flex items-center justify-center !text-xl !shadow-lg`}>
                  {index < 3 ? rankStyle.emoji : (index + 1)}
                </div>

                {/* Avatar y nombre */}
                <div className="flex items-center !gap-3 flex-1">
                  <span className="!text-3xl">{user.avatar}</span>
                  <div>
                    <p className="!text-white !font-semibold">{user.name}</p>
                    <p className="!text-white/40 !text-xs">{user.monthlyDays ?? user.totalDays} días este mes</p>
                  </div>
                </div>

                {/* Stats mensuales */}
                <div className="text-right">
                  <p className={`!font-black !text-2xl ${(user.monthlyDays ?? 0) >= maxMonthlyDays ? '!text-emerald-400' : '!text-white'}`}>
                    {user.monthlyDays ?? 0}
                  </p>
                  <p className="!text-white/40 !text-xs">días</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info del sistema de puntos */}
        <div className="!mt-6 !bg-white/5 !rounded-2xl !p-4 !border !border-white/10">
          <h3 className="!text-white/60 !text-sm !mb-3 !font-medium">📊 Sistema de puntos</h3>
          <div className="!space-y-2 !text-sm">
            <p className="!text-white/70">
              • Meta semanal: <span className="!text-emerald-400 !font-semibold">{WEEKLY_GOAL} días</span>
            </p>
            <p className="!text-white/70">
              • Máximo mensual: <span className="!text-amber-400 !font-semibold">{maxMonthlyDays} días</span> (4 semanas × {WEEKLY_GOAL})
            </p>
            <p className="!text-white/50 !text-xs !mt-2">
              Los días extra por semana (más de {WEEKLY_GOAL}) no suman al ranking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

