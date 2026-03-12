'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Trophy, LogOut, Bell, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PhotoUpload from './PhotoUpload';
import WeekProgress from './WeekProgress';
import GroupRanking from './GroupRanking';
import AddFriendModal from './AddFriendModal';
import NotificationsModal from './NotificationsModal';
import { WeekEntry, UserStats, FriendRequest } from '@/types';
import { formatDate, getTodayDate, getCurrentMonthName, getWeekStart } from '@/lib/utils';

interface DashboardProps {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  entry?: {
    date: string;
    photo_url: string;
    timestamp: string;
  } | null;
  onPhotoUpload: () => void;
  onLogout: () => void;
}

export default function Dashboard({ 
  user, 
  entry,
  onPhotoUpload,
  onLogout
}: DashboardProps) {
  const [weekEntries, setWeekEntries] = useState<WeekEntry[]>([]);
  const [ranking, setRanking] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(getWeekStart());
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch('/api/friends');
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.pendingRequests || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [user.id]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const weekStartStr = selectedWeekStart.toISOString().split('T')[0];
        const weekEndDate = new Date(selectedWeekStart);
        weekEndDate.setDate(selectedWeekStart.getDate() + 6);
        const weekEndStr = weekEndDate.toISOString().split('T')[0];

        // Fetch en paralelo
        const [userStatsRes, allStatsRes] = await Promise.all([
          fetch(`/api/user-stats?userId=${user.id}&weekStart=${weekStartStr}&weekEnd=${weekEndStr}`),
          fetch(`/api/all-stats?weekStart=${weekStartStr}&weekEnd=${weekEndStr}`),
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
  }, [user.id, selectedWeekStart]);

  const handleWeekChange = (weekStart: Date) => {
    setSelectedWeekStart(weekStart);
  };

  const today = getTodayDate();
  const hasEntryToday = entry && entry.date === today;
  
  // Añadimos timestamp para invalidar cache del navegador
  const photoUrl = entry ? `${entry.photo_url}?t=${new Date(entry.timestamp).getTime()}` : '';

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    // Si el aspect ratio es mayor que 1, es horizontal
    setIsHorizontal(aspectRatio > 1);
  };

  return (
    <>
    <div className="!min-h-screen !bg-gradient-to-br !from-violet-600 !via-purple-600 !to-fuchsia-600 !flex !flex-col !items-center !px-4 !pt-3 !pb-8">
      {/* Container principal */}
      <div className="!w-full !max-w-md !flex !flex-col !gap-4">
        {/* Header */}
        <header className="!flex !items-center !justify-between !mb-2">
          <div className="!flex !items-center !gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="!rounded-full !bg-white/10 hover:!bg-white/20 !w-8 !h-8"
            >
              <LogOut className="!w-4 !h-4 !text-white/70" />
            </Button>
            <span className="!text-3xl">{user.avatar}</span>
            <div className="!flex !flex-col">
              <p className="!text-white/60 !text-xs">
                {hasEntryToday ? '¡Bien hecho,' : '¡Hola,'}
              </p>
              <h1 className="!text-white !font-bold !text-lg">{user.name}!</h1>
            </div>
          </div>
          
          <div className="!flex !items-center !gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="!rounded-full !bg-white/10 hover:!bg-white/20 !text-white !px-2"
            >
              <a href="/public-dashboard" className="!flex !items-center !gap-2">
                <Trophy className="!w-4 !h-4 !text-amber-300" />
                <span className="!text-xs">Ranking {getCurrentMonthName()}</span>
              </a>
            </Button>

            {/* Botón agregar amigo */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddFriend(true)}
              className="!relative !rounded-full !bg-white/10 hover:!bg-white/20 !w-8 !h-8"
              title="Agregar amigo"
            >
              <UserPlus className="!w-4 !h-4 !text-white/70" />
            </Button>

            {/* Botón notificaciones */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(true)}
              className="!relative !rounded-full !bg-white/10 hover:!bg-white/20 !w-8 !h-8"
              title="Solicitudes de amistad"
            >
              <Bell className="!w-4 !h-4 !text-white/70" />
              {pendingRequests.length > 0 && (
                <span className="!absolute !-top-0.5 !-right-0.5 !w-4 !h-4 !bg-red-500 !text-white !text-[10px] !font-bold !rounded-full !flex !items-center !justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </Button>
          </div>
        </header>

        {/* Sección de foto */}
        {hasEntryToday && entry ? (
          // Si tiene foto de hoy, mostrar la foto
          <div className="!overflow-hidden !shadow-xl !rounded-2xl">
            <div className={`!relative !aspect-[4/5] ${isHorizontal ? '!bg-black' : '!bg-gray-100'}`}>
              <img
                src={photoUrl}
                alt="Foto del gym"
                onLoad={handleImageLoad}
                className={`!w-full !h-full ${isHorizontal ? '!object-contain' : '!object-cover'}`}
              />
              
              {/* Tag de fecha */}
              <div className="!absolute !top-1 !left-0.5 !bg-black/60 !backdrop-blur-md !text-white !px-4 !py-2 !rounded-2xl !font-semibold !text-sm !shadow-xl !capitalize">
                {formatDate(entry.date)}
              </div>
              
              {/* Badge de éxito */}
              <div className="!absolute !top-1 !right-0.5 !flex !items-center !gap-1.5 !bg-emerald-500 !text-white !px-1.5 !py-1 !rounded-full !font-semibold !text-xs !shadow-lg !backdrop-blur-sm">
                <CheckCircle className="!w-3.5 !h-3.5" />
                ¡Hoy!
              </div>
              
              {/* Botón retomar foto */}
              <div className="!absolute !bottom-2 !right-2">
                <PhotoUpload 
                  onUploadComplete={onPhotoUpload}
                  isRetake
                />
              </div>
            </div>
          </div>
        ) : (
          // Si no tiene foto de hoy, mostrar área para subir foto
          <div className="!bg-white/10 !backdrop-blur-md !rounded-2xl !p-6 !pb-10 !border !border-white/10 !shadow-lg !mb-2">
            <div className="!flex !flex-col !items-center !gap-4 !text-center">
              <p className="!text-5xl">📸</p>
              <div className="!flex !flex-col !gap-1">
                <h2 className="!text-white !text-lg !font-bold">
                  ¿Fuiste al gym hoy?
                </h2>
                <p className="!text-purple-200/70 !text-sm">
                  Toma una foto para registrar tu día
                </p>
              </div>
              
              <div className="!mt-2 !mb-4">
                <PhotoUpload onUploadComplete={onPhotoUpload} />
              </div>
            </div>
          </div>
        )}

        {/* Progreso semanal */}
        {!loading && weekEntries.length > 0 && (
          <WeekProgress 
            entries={weekEntries} 
            currentUserId={user.id}
            weekStart={selectedWeekStart}
            onWeekChange={handleWeekChange}
          />
        )}

        {/* Ranking del grupo */}
        {!loading && ranking.length > 0 && (
          <GroupRanking users={ranking} currentUserId={user.id} />
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="!flex !flex-col !gap-4">
            <div className="!bg-white/10 !rounded-2xl !h-32 !animate-pulse" />
            <div className="!bg-white/10 !rounded-2xl !h-48 !animate-pulse" />
          </div>
        )}
      </div>
    </div>

    {showAddFriend && (
      <AddFriendModal onClose={() => setShowAddFriend(false)} />
    )}

    {showNotifications && (
      <NotificationsModal
        requests={pendingRequests}
        onClose={() => setShowNotifications(false)}
        onRefresh={() => {
          fetchPendingRequests();
          setSelectedWeekStart(prev => new Date(prev));
        }}
      />
    )}
    </>
  );
}

