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
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex flex-col items-center px-4 py-6">
      {/* Container principal */}
      <div className="w-full max-w-md flex flex-col gap-5">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{user.avatar}</span>
            <div className="flex flex-col">
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

        {/* Card de foto del día */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col">
          {/* Imagen con aspect ratio */}
          <div className="relative aspect-[4/3] bg-gray-100">
            <img
              src={photoUrl}
              alt="Foto del gym"
              className="w-full h-full object-cover"
            />
            
            {/* Badge de éxito */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 
                          bg-emerald-500 text-white px-2.5 py-1 rounded-full
                          font-semibold text-xs shadow-lg backdrop-blur-sm">
              <CheckCircle className="w-3.5 h-3.5" />
              {isToday ? '¡Hoy!' : 'Registrado'}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-gradient-to-b from-white to-gray-50 flex flex-col items-center gap-3">
            <p className="text-gray-600 text-sm font-medium">
              {formatDate(entry.date)}
            </p>
            <PhotoUpload 
              token={token} 
              onUploadComplete={onPhotoRetake}
              isRetake
            />
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
          <div className="flex flex-col gap-4">
            <div className="bg-white/10 rounded-2xl h-32 animate-pulse" />
            <div className="bg-white/10 rounded-2xl h-48 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

