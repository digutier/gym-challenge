'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Trophy } from 'lucide-react';
import PhotoUpload from './PhotoUpload';
import WeekProgress from './WeekProgress';
import GroupRanking from './GroupRanking';
import { WeekEntry, UserStats } from '@/types';
import { formatDate, getTodayDate } from '@/lib/utils';

interface DashboardRegisteredProps {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  entry: {
    date: string;
    photo_url: string;
    timestamp: string;
  };
  token: string;
  onPhotoRetake: () => void;
}

export default function DashboardRegistered({ 
  user, 
  entry,
  token,
  onPhotoRetake 
}: DashboardRegisteredProps) {
  const [weekEntries, setWeekEntries] = useState<WeekEntry[]>([]);
  const [ranking, setRanking] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch en paralelo
        const [userStatsRes, allStatsRes] = await Promise.all([
          fetch(`/api/user-stats?userId=${user.id}`),
          fetch('/api/all-stats'),
        ]);

        if (userStatsRes.ok) {
          const userStats = await userStatsRes.json();
          setWeekEntries(userStats.weekEntries);
        }

        if (allStatsRes.ok) {
          const allStats = await allStatsRes.json();
          setRanking(allStats.users);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.id]);

  const today = getTodayDate();
  const isToday = entry.date === today;
  // Añadimos timestamp para invalidar cache del navegador
  const photoUrl = `${entry.photo_url}?t=${new Date(entry.timestamp).getTime()}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{user.avatar}</span>
          <div>
            <p className="text-white/60 text-sm">¡Bien hecho,</p>
            <h1 className="text-white font-bold text-xl">{user.name}!</h1>
          </div>
        </div>
        
        <a 
          href="/public-dashboard"
          className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
          <Trophy className="w-5 h-5 text-amber-300" />
        </a>
      </header>

      {/* Main content */}
      <main className="px-6 pb-8 space-y-6">
        {/* Card de foto del día */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Imagen */}
          <div className="relative">
            <img
              src={photoUrl}
              alt="Foto del gym"
              className="w-full h-64 object-cover"
            />
            
            {/* Badge de éxito */}
            <div className="absolute top-4 right-4 flex items-center gap-2 
                          bg-emerald-500 text-white px-3 py-1.5 rounded-full
                          font-semibold text-sm shadow-lg">
              <CheckCircle className="w-4 h-4" />
              {isToday ? '¡Registrado hoy!' : 'Registrado'}
            </div>
          </div>

          {/* Info */}
          <div className="p-5">
            <p className="text-gray-500 text-sm">
              {formatDate(entry.date)}
            </p>
            
            {/* Botón retomar */}
            <div className="mt-4">
              <PhotoUpload 
                token={token} 
                onUploadComplete={onPhotoRetake}
                isRetake
              />
            </div>
          </div>
        </div>

        {/* Progreso semanal */}
        {!loading && weekEntries.length > 0 && (
          <WeekProgress entries={weekEntries} />
        )}

        {/* Ranking del grupo */}
        {!loading && ranking.length > 0 && (
          <GroupRanking users={ranking} currentUserId={user.id} />
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            <div className="bg-white/10 rounded-2xl h-32 animate-pulse" />
            <div className="bg-white/10 rounded-2xl h-48 animate-pulse" />
          </div>
        )}
      </main>
    </div>
  );
}

