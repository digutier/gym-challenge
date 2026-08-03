'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, Home, Users, User, Bell, UserPlus,
  Check, X as XIcon, ChevronLeft, ChevronRight, Heart, Trophy, Zap, Trash2, Loader2, CalendarDays,
} from 'lucide-react';
import PhotoUpload, { PhotoUploadHandle } from './PhotoUpload';
import GroupRanking from './GroupRanking';
import AddFriendModal from './AddFriendModal';
import NotificationsModal from './NotificationsModal';
import FriendsListModal from './FriendsListModal';
import PastDayModal from './PastDayModal';
import { WeekEntry, UserStats, FriendRequest, Friend, EntryData, User as UserType } from '@/types';
import {
  getTodayDate, getWeekStart, capDays, WEEKLY_GOAL,
  getMinWeekStart, formatTimeChile,
} from '@/lib/utils';

type Tab = 'home' | 'workouts' | 'feed' | 'profile';

interface DashboardProps {
  user: UserType;
  entry?: EntryData | null;
  onPhotoUpload: (entryData?: EntryData) => void;
  onEntryDelete: () => void;
  onLogout: () => void;
}

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function Dashboard({ user, entry, onPhotoUpload, onEntryDelete, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [weekEntries, setWeekEntries] = useState<WeekEntry[]>([]);
  const [currentWeekActiveDays, setCurrentWeekActiveDays] = useState(0);
  const [ranking, setRanking] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(getWeekStart());
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [homeStoryUser, setHomeStoryUser] = useState<UserStats | null>(null);
  const [homeStoryLoading, setHomeStoryLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const fabRef = useRef<PhotoUploadHandle>(null);

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch('/api/friends');
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.pendingRequests || []);
        setFriends(data.friends || []);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [user.id]);

  useEffect(() => {
    if (homeStoryUser && !homeStoryLoading) {
      const t = setTimeout(() => setHomeStoryUser(null), 5000);
      return () => clearTimeout(t);
    }
  }, [homeStoryUser, homeStoryLoading]);

  // Función central de refresco — se llama al montar, al cambiar semana,
  // y explícitamente tras upload/delete para evitar condición de carrera.
  const refreshStats = useCallback(async () => {
    setLoading(true);
    try {
      const weekStartStr = selectedWeekStart.toISOString().split('T')[0];
      const weekEndDate = new Date(selectedWeekStart);
      weekEndDate.setDate(selectedWeekStart.getDate() + 6);
      const weekEndStr = weekEndDate.toISOString().split('T')[0];

      const [userStatsRes, allStatsRes] = await Promise.all([
        fetch(`/api/user-stats?userId=${user.id}&weekStart=${weekStartStr}&weekEnd=${weekEndStr}`),
        fetch(`/api/all-stats?weekStart=${weekStartStr}&weekEnd=${weekEndStr}`),
      ]);

      if (userStatsRes.ok) {
        const userStats = await userStatsRes.json();
        setWeekEntries(userStats.weekEntries);
        if (selectedWeekStart.getTime() === getWeekStart().getTime()) {
          const days = userStats.weekEntries.filter((e: WeekEntry) => e.registered).length;
          setCurrentWeekActiveDays(Math.min(days, WEEKLY_GOAL));
        }
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
  }, [user.id, selectedWeekStart]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // Wrapper de upload: actualiza entry en el padre y luego refresca stats
  // para que grid semanal, ranking y mensaje de motivación queden en sync.
  const handleUploadComplete = useCallback(async (
    entryData?: { date: string; photo_url: string; timestamp: string }
  ) => {
    onPhotoUpload(entryData);
    await refreshStats();
  // refreshStats depende de selectedWeekStart y user.id (estables tras upload)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onPhotoUpload, refreshStats]);

  const handleDeleteEntry = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/upload', { method: 'DELETE' });
      if (res.ok) {
        onEntryDelete();
        // Refrescar stats para que el grid y el ranking queden actualizados
        await refreshStats();
      }
    } catch {
      // ignore
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };


  const today = getTodayDate();
  const hasEntryToday = entry && entry.date === today;
  const photoUrl = entry ? `${entry.photo_url}?t=${new Date(entry.timestamp).getTime()}` : '';

  const currentWeekStart = getWeekStart();
  const minWeekStart = getMinWeekStart();
  const isCurrentWeek = selectedWeekStart.getTime() === currentWeekStart.getTime();
  const canGoPrev = selectedWeekStart > minWeekStart;
  const canGoNext = !isCurrentWeek;

  const activeDaysThisWeek = weekEntries.filter(e => e.registered).length;
  const cappedActiveDays = Math.min(activeDaysThisWeek, WEEKLY_GOAL);

  const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const weekEnd = new Date(selectedWeekStart);
  weekEnd.setDate(selectedWeekStart.getDate() + 6);
  const weekLabel = selectedWeekStart.getMonth() === weekEnd.getMonth()
    ? `${selectedWeekStart.getDate()}-${weekEnd.getDate()} ${MONTHS[selectedWeekStart.getMonth()]}`
    : `${selectedWeekStart.getDate()} ${MONTHS[selectedWeekStart.getMonth()]} - ${weekEnd.getDate()} ${MONTHS[weekEnd.getMonth()]}`;

  const handleWeekPrev = () => {
    const prev = new Date(selectedWeekStart);
    prev.setDate(prev.getDate() - 7);
    if (prev >= minWeekStart) setSelectedWeekStart(prev);
  };

  const handleWeekNext = () => {
    if (!canGoNext) return;
    const next = new Date(selectedWeekStart);
    next.setDate(next.getDate() + 7);
    setSelectedWeekStart(next <= currentWeekStart ? next : currentWeekStart);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setIsHorizontal(img.naturalWidth / img.naturalHeight > 1);
  };

  const getWeekMotivation = (days: number): string => {
    if (days >= 4) return '¡Semana completada! Eres una máquina 🔥';
    if (days === 3) return '¡Solo falta uno para cumplir la meta! 🤪';
    if (days === 2) return 'Ya vas por la mitad, no te detengas 😫';
    if (days === 1) return '¡Arrancaste la semana con todo! 🚀';
    return '';
  };

  const friendActivity = ranking.slice(0, 5);

  // Compute ranks (ties share the same rank)
  const rankOf = (idx: number): number => {
    if (idx === 0) return 1;
    const sorted = [...ranking].sort((a, b) => capDays(b.daysThisWeek) - capDays(a.daysThisWeek));
    let rank = 1;
    for (let i = 1; i <= idx; i++) {
      if (capDays(sorted[i].daysThisWeek) < capDays(sorted[i - 1].daysThisWeek)) rank = i + 1;
    }
    return rank;
  };

  const rankIcon = (rank: number) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return <span className="text-[#64748b] text-xs font-bold w-6 text-center">{rank}</span>;
  };

  // ─── Ranking List (reutilizado en mobile y desktop sidebar) ───────────────

  const renderRankingList = () => (
    <>
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-3xl h-[74px] animate-pulse" />
          ))}
        </div>
      ) : friendActivity.length > 0 ? (
        <div className="flex flex-col gap-3">
          {friendActivity.map((friend, idx) => {
            const isMe = friend.id === user.id;
            const hasPhoto = !!friend.todayPhotoUrl;
            const metric = capDays(friend.daysThisWeek);
            const rank = rankOf(idx);
            return (
              <div
                key={friend.id}
                className={`backdrop-blur-[5px] flex items-center gap-3 p-[13px] rounded-3xl ${isMe ? 'bg-[rgba(127,13,242,0.15)] ring-1 ring-[rgba(127,13,242,0.4)]' : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]'}`}
              >
                <div className="w-7 flex items-center justify-center shrink-0 text-lg leading-none">
                  {rankIcon(rank)}
                </div>
                <button
                  onClick={() => {
                    if (hasPhoto && !isMe) { setHomeStoryLoading(true); setHomeStoryUser(friend); }
                  }}
                  disabled={!hasPhoto || isMe}
                  className={`size-12 rounded-full flex items-center justify-center shrink-0 text-2xl bg-[rgba(127,13,242,0.15)] ${hasPhoto && !isMe ? 'ring-[3px] ring-emerald-400 ring-offset-1 ring-offset-[#191022] cursor-pointer active:scale-95 transition-transform' : ''}`}
                >
                  {friend.avatar}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${isMe ? 'text-[#7f0df2]' : 'text-[#f1f5f9]'}`}>
                    {friend.name}{isMe && <span className="text-[10px] opacity-60 ml-1">(tú)</span>}
                  </p>
                  {hasPhoto && friend.todayPhotoTimestamp && (
                    <p className="text-emerald-400 text-xs truncate">
                      Fue al gym hoy {formatTimeChile(friend.todayPhotoTimestamp)} hrs
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-lg font-black leading-none ${metric >= WEEKLY_GOAL ? 'text-emerald-400' : 'text-[#f1f5f9]'}`}>
                    {metric}
                  </p>
                  <p className="text-[#64748b] text-[10px]">/ {WEEKLY_GOAL}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[#64748b] text-sm text-center py-6">
          Agrega amigos para ver su actividad aquí.
        </p>
      )}
    </>
  );

  // ─── Home Tab ─────────────────────────────────────────────────────────────

  const renderHomeTab = () => (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 lg:max-w-[1280px] lg:w-full lg:mx-auto lg:px-6 lg:py-2">
      {/* Left column: hero card + week grid + ranking (mobile) */}
      <div className="flex flex-col gap-4 pb-6 flex-1 lg:pb-2 min-w-0">
      {/* Hero card */}
      {hasEntryToday && entry ? (
        <div className="relative overflow-hidden rounded-3xl mx-4 lg:mx-0 lg:h-[500px] shadow-[0px_20px_25px_-5px_rgba(127,13,242,0.35)] bg-black">
          <img
            src={photoUrl}
            alt="Foto del gym"
            onLoad={handleImageLoad}
            className={`w-full lg:absolute lg:inset-0 lg:h-full lg:w-full lg:object-contain ${isHorizontal ? 'max-h-64 object-contain' : 'aspect-[3/4] object-cover'}`}
          />

          {/* Delete FAB — top left */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="absolute top-4 left-4 z-10 rounded-full size-10 flex items-center justify-center bg-black/60 backdrop-blur-md active:scale-95 transition-transform"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>

          {/* PHOTO UPLOADED badge */}
          <div className="absolute top-4 right-2 flex items-center gap-2 bg-black/75 backdrop-blur-md px-4 py-2 rounded-full z-10">
            <div className="bg-[#7f0df2] rounded-full size-5 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <span className="text-white text-xs font-bold tracking-widest uppercase whitespace-nowrap">¡Hoy!</span>
          </div>

          {/* Bottom gradient overlay — text left, button right, no overlap */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent px-5 pt-20 pb-5 flex items-end justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-white text-3xl font-black italic leading-tight uppercase">
                ¡Bien hecho, {user.name}!
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Zap className="w-5 h-5 text-[#7f0df2] fill-[#7f0df2] shrink-0" />
                <span className="text-white/90 text-base font-semibold">{getWeekMotivation(currentWeekActiveDays)}</span>
              </div>
            </div>
            {/* Cambiar foto — solo visible en desktop (en mobile lo maneja el FAB) */}
            <button
              onClick={() => setShowOverwriteConfirm(true)}
              className="hidden lg:flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-semibold px-4 py-2.5 rounded-2xl hover:bg-white/25 active:scale-95 transition-all shrink-0"
            >
              <Camera className="w-4 h-4" />
              Cambiar
            </button>
          </div>
        </div>
      ) : (
        <div
          className="mx-4 lg:mx-0 relative overflow-hidden flex flex-col gap-4 items-start p-6 rounded-3xl shadow-[0px_20px_25px_-5px_rgba(127,13,242,0.2),0px_8px_10px_-6px_rgba(127,13,242,0.2)]"
          style={{ background: 'linear-gradient(151deg, rgb(127,13,242) 0%, rgba(127,13,242,0.8) 50%, rgb(79,70,229) 100%)' }}
        >
          <div className="absolute bg-white/10 blur-[32px] -right-12 -top-12 rounded-full size-48 pointer-events-none" />

          <div className="flex items-start justify-between w-full relative">
            <div className="flex flex-col gap-1 flex-1 pr-4">
              <h2 className="text-white text-2xl font-bold leading-tight">¡Anda al GYM CTM!</h2>
              <p className="text-white/80 text-sm leading-5">Captura tu ida del día.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="w-full relative">
            <PhotoUpload onUploadComplete={handleUploadComplete} variant="cta" />
          </div>
        </div>
      )}

      {/* This Week */}
      <div className="flex flex-col gap-4 px-4 lg:px-0 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[#f1f5f9] text-lg font-bold">{isCurrentWeek ? 'Esta semana' : weekLabel}</h3>
          <span className="text-[#7f0df2] text-xs font-semibold tracking-[1.2px] uppercase">
            {cappedActiveDays}/{WEEKLY_GOAL} Idas al GYM 💪
          </span>
        </div>

        {!loading && weekEntries.length > 0 ? (
          <>
            <div className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-between px-4 py-4 rounded-3xl">
              {weekEntries.map((dayEntry, i) => {
                const isToday = dayEntry.date === today;
                const isPast = dayEntry.date < today;
                const isFuture = dayEntry.date > today;

                return (
                  <button
                    key={dayEntry.date}
                    onClick={() => isPast && setSelectedDate(dayEntry.date)}
                    disabled={!isPast}
                    className="flex flex-col items-center gap-2"
                  >
                    <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-[#7f0df2]' : 'text-[#64748b]'}`}>
                      {DAY_LABELS[i]}
                    </span>
                    {isFuture || (isToday && !dayEntry.registered) ? (
                      <div className="border-2 border-dashed border-[#334155] rounded-full size-9" />
                    ) : isToday && dayEntry.registered ? (
                      <div className="relative bg-[#7f0df2] rounded-full size-9 flex items-center justify-center shadow-[0px_0px_0px_4px_rgba(127,13,242,0.2)]">
                        <Check className="w-[14px] h-[14px] text-white" strokeWidth={3} />
                      </div>
                    ) : dayEntry.registered ? (
                      <div className="bg-[rgba(127,13,242,0.2)] rounded-full size-9 flex items-center justify-center">
                        <Check className="w-[14px] h-[14px] text-[#7f0df2]" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="bg-[#1e293b] rounded-full size-9 flex items-center justify-center">
                        <XIcon className="w-[14px] h-[14px] text-[#64748b]" strokeWidth={2.5} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Week navigation */}
            <div className="flex items-center justify-between -mt-1">
              <button
                onClick={handleWeekPrev}
                disabled={!canGoPrev}
                className={`flex items-center gap-1 text-xs transition-colors ${canGoPrev ? 'text-[#94a3b8] hover:text-[#f1f5f9]' : 'text-[#334155] cursor-not-allowed'}`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </button>

              <button
                onClick={handleWeekNext}
                disabled={!canGoNext}
                className={`flex items-center gap-1 text-xs transition-colors ${canGoNext ? 'text-[#94a3b8] hover:text-[#f1f5f9]' : 'text-[#334155] cursor-not-allowed'}`}
              >
                Siguiente
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : loading ? (
          <div className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-3xl h-20 animate-pulse" />
        ) : null}
      </div>

      {/* Ranking Semanal — sólo visible en mobile */}
      <div className="lg:hidden flex flex-col gap-4 px-4">
        <h3 className="text-[#f1f5f9] text-lg font-bold">Ranking Semanal</h3>
        {renderRankingList()}
      </div>

      </div>{/* /left column */}

      {/* Right column: ranking semanal — sólo visible en desktop (lg+) */}
      <div className="hidden lg:flex flex-col gap-4 w-[280px] shrink-0 pb-6">
        <h3 className="text-[#f1f5f9] text-base font-bold">Ranking Semanal</h3>
        {renderRankingList()}
      </div>

    </div>
  );

  // ─── Workouts Tab ──────────────────────────────────────────────────────────

  const renderWorkoutsTab = () => (
    <div className="flex flex-col items-center justify-center gap-4 px-6 lg:max-w-[800px] lg:mx-auto lg:w-full" style={{ minHeight: 'calc(100dvh - 160px)' }}>
      <div className="bg-[rgba(127,13,242,0.1)] rounded-full p-6">
        <CalendarDays className="w-12 h-12 text-[#7f0df2]" />
      </div>
      <div className="text-center">
        <h3 className="text-[#f1f5f9] text-xl font-bold mb-2">Registros</h3>
        <p className="text-[#64748b] text-sm">Esta sección está en camino.</p>
      </div>
    </div>
  );

  // ─── Feed Tab ──────────────────────────────────────────────────────────────

  const [rankingPeriod, setRankingPeriod] = useState<'week' | 'month' | 'year'>('week');

  const PERIOD_LABELS = { week: 'Semana', month: 'Mes', year: 'Año' } as const;

  const renderFeedTab = () => (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-4 lg:max-w-[800px] lg:mx-auto lg:w-full lg:px-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[#f1f5f9] text-lg font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Ranking Global
        </h3>
      </div>

      {/* Period tabs */}
      <div className="flex bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-1 gap-1">
        {(['week', 'month', 'year'] as const).map(p => (
          <button
            key={p}
            onClick={() => setRankingPeriod(p)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              rankingPeriod === p
                ? 'bg-[#7f0df2] text-white shadow-[0px_2px_8px_rgba(127,13,242,0.4)]'
                : 'text-[#64748b]'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {!loading && ranking.length > 0 ? (
        <GroupRanking users={ranking} currentUserId={user.id} period={rankingPeriod} />
      ) : loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[rgba(255,255,255,0.03)] rounded-3xl h-16 animate-pulse" />
          ))}
        </div>
      ) : null}
    </div>
  );

  // ─── Profile Tab ───────────────────────────────────────────────────────────

  const renderProfileTab = () => {
    const myStats = ranking.find(u => u.id === user.id);
    return (
      <div className="flex flex-col gap-5 px-4 pb-6 pt-4 lg:max-w-[640px] lg:mx-auto lg:w-full lg:px-6">
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="bg-[rgba(127,13,242,0.2)] border-2 border-[rgba(127,13,242,0.5)] rounded-full size-20 flex items-center justify-center text-4xl">
            {user.avatar}
          </div>
          <div className="text-center">
            <h3 className="text-[#f1f5f9] text-xl font-bold">{user.name}</h3>
            <p className="text-[#94a3b8] text-sm">Tu perfil</p>
          </div>
        </div>

        {myStats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-3 text-center">
              <p className="text-[#7f0df2] text-2xl font-black">{capDays(myStats.daysThisWeek)}</p>
              <p className="text-[#64748b] text-xs mt-0.5">Esta sem.</p>
            </div>
            <div className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-3 text-center">
              <p className="text-[#f1f5f9] text-2xl font-black">{myStats.monthlyDays}</p>
              <p className="text-[#64748b] text-xs mt-0.5">Este mes</p>
            </div>
            <div className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-3 text-center">
              <p className="text-[#f1f5f9] text-2xl font-black">{myStats.totalDays}</p>
              <p className="text-[#64748b] text-xs mt-0.5">Total 2026</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => { fetchPendingRequests(); setShowFriendsList(true); }}
            className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center gap-3 p-4 rounded-2xl text-left"
          >
            <Users className="w-5 h-5 text-[#7f0df2]" />
            <span className="text-[#f1f5f9] text-sm font-semibold">Mis amigos</span>
            {friends.length > 0 && (
              <span className="ml-auto text-[#64748b] text-xs font-semibold">{friends.length}</span>
            )}
          </button>

          <button
            onClick={() => setShowAddFriend(true)}
            className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center gap-3 p-4 rounded-2xl text-left"
          >
            <UserPlus className="w-5 h-5 text-[#7f0df2]" />
            <span className="text-[#f1f5f9] text-sm font-semibold">Agregar amigo</span>
          </button>

          <button
            onClick={() => setShowNotifications(true)}
            className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center gap-3 p-4 rounded-2xl text-left relative"
          >
            <Bell className="w-5 h-5 text-[#7f0df2]" />
            <span className="text-[#f1f5f9] text-sm font-semibold">Solicitudes recibidas</span>
            {pendingRequests.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={onLogout}
            className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center gap-3 p-4 rounded-2xl text-left"
          >
            <User className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm font-semibold">Cerrar sesión</span>
          </button>
        </div>
      </div>
    );
  };

  const TAB_LABELS: Record<Tab, string> = {
    home: 'Dashboard',
    workouts: 'Registros',
    feed: 'Ranking Global',
    profile: 'Mi Perfil',
  };

  // ─── Layout ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="min-h-screen bg-[#191022] flex">

        {/* ── DESKTOP SIDEBAR ── oculto en mobile, visible en lg+ */}
        <aside className="hidden lg:flex flex-col w-[220px] min-h-screen fixed left-0 top-0 bottom-0 bg-[#110c1a] border-r border-[rgba(255,255,255,0.06)] z-20">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7f0df2] to-[#6366f1] flex items-center justify-center text-xl shrink-0">🏋️</div>
            <div>
              <p className="text-[#f1f5f9] text-sm font-bold leading-tight">Gym Challenge</p>
              <p className="text-[#7f0df2] text-[10px] font-semibold tracking-wider uppercase">
                {cappedActiveDays}/{WEEKLY_GOAL} esta sem.
              </p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-1 p-3 flex-1">
            {(
              [
                { tab: 'home' as Tab, icon: <Home className="w-[18px] h-[18px]" />, label: 'Inicio' },
                { tab: 'workouts' as Tab, icon: <CalendarDays className="w-[18px] h-[18px]" />, label: 'Registros' },
                { tab: 'feed' as Tab, icon: <Trophy className="w-[18px] h-[18px]" />, label: 'Ranking' },
                { tab: 'profile' as Tab, icon: <User className="w-[18px] h-[18px]" />, label: 'Perfil' },
              ] as const
            ).map(({ tab, icon, label }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                  activeTab === tab
                    ? 'bg-[rgba(127,13,242,0.15)] text-[#7f0df2]'
                    : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-[rgba(255,255,255,0.04)]'
                }`}
              >
                {icon}
                <span>{label}</span>
                {tab === 'profile' && pendingRequests.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User pill */}
          <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)]">
              <div className="bg-[rgba(127,13,242,0.2)] border-2 border-[rgba(127,13,242,0.5)] rounded-full w-8 h-8 flex items-center justify-center text-base shrink-0">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#f1f5f9] text-xs font-bold truncate">{user.name}</p>
                <p className="text-[#64748b] text-[10px]">Gym Challenge</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN AREA ── full width en mobile, offset en lg+ */}
        <div className="flex-1 flex flex-col lg:ml-[220px]">

          {/* Mobile top nav — oculto en desktop */}
          <nav className="lg:hidden backdrop-blur-[5px] bg-[rgba(25,16,34,0.8)] border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between px-4 py-[17px] sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <div className="bg-[rgba(127,13,242,0.2)] border-2 border-[rgba(127,13,242,0.5)] rounded-full size-10 flex items-center justify-center text-xl overflow-hidden">
                {user.avatar}
              </div>
              <p className="text-[#f1f5f9] text-sm font-bold leading-tight">Gym Challenge</p>
            </div>
          </nav>

          {/* Desktop top bar — oculto en mobile */}
          <div className="hidden lg:flex items-center gap-3 px-6 h-14 border-b border-[rgba(255,255,255,0.06)] sticky top-0 bg-[rgba(17,12,26,0.85)] backdrop-blur-[5px] z-10">
            <h1 className="text-[#f1f5f9] text-base font-bold">{TAB_LABELS[activeTab]}</h1>
            {activeTab === 'home' && isCurrentWeek && (
              <span className="text-[10px] font-bold text-[#7f0df2] bg-[rgba(127,13,242,0.12)] px-3 py-1 rounded-full tracking-wider uppercase">
                Esta semana
              </span>
            )}
            <span className="ml-auto text-[#64748b] text-xs capitalize">
              {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto pb-[90px] lg:pb-6 pt-4">
            {activeTab === 'home' && renderHomeTab()}
            {activeTab === 'workouts' && renderWorkoutsTab()}
            {activeTab === 'feed' && renderFeedTab()}
            {activeTab === 'profile' && renderProfileTab()}
          </main>

          {/* Mobile bottom nav — oculto en desktop */}
          <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 h-[90px] backdrop-blur-[5px] bg-[rgba(25,16,34,0.9)] border-t border-[#1e293b] z-10"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="relative flex items-center justify-around h-full px-2">
              {/* Camera FAB — absolutely centered, floats above the nav */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-10">
                <PhotoUpload
                  ref={fabRef}
                  onUploadComplete={handleUploadComplete}
                  isRetake={!!hasEntryToday}
                  variant="fab"
                  onBeforeOpen={() => {
                    if (hasEntryToday) {
                      setShowOverwriteConfirm(true);
                      return false;
                    }
                    return true;
                  }}
                />
              </div>

              {/* Home */}
              <button onClick={() => setActiveTab('home')} className="flex flex-col items-center gap-1 flex-1">
                <Home className={`w-[22px] h-[22px] ${activeTab === 'home' ? 'text-[#7f0df2]' : 'text-[#64748b]'}`} />
                <span className={`text-[12px] font-bold text-center leading-tight ${activeTab === 'home' ? 'text-[#7f0df2]' : 'text-[#64748b]'}`}>Inicio</span>
              </button>

              {/* Workouts */}
              <button onClick={() => setActiveTab('workouts')} className="flex flex-col items-center gap-1 flex-1">
                <CalendarDays className={`w-[22px] h-[22px] ${activeTab === 'workouts' ? 'text-[#7f0df2]' : 'text-[#64748b]'}`} />
                <span className={`text-[12px] font-bold text-center leading-tight ${activeTab === 'workouts' ? 'text-[#7f0df2]' : 'text-[#64748b]'}`}>Registros</span>
              </button>

              {/* Spacer for FAB column */}
              <div className="flex-1" />

              {/* Feed */}
              <button onClick={() => setActiveTab('feed')} className="flex flex-col items-center gap-1 flex-1">
                <Trophy className={`w-[22px] h-[22px] ${activeTab === 'feed' ? 'text-[#7f0df2]' : 'text-[#64748b]'}`} />
                <span className={`text-[12px] font-bold text-center leading-tight ${activeTab === 'feed' ? 'text-[#7f0df2]' : 'text-[#64748b]'}`}>Ranking</span>
              </button>

              {/* Profile */}
              <button onClick={() => setActiveTab('profile')} className="flex flex-col items-center gap-1 flex-1">
                <div className="relative">
                  <User className={`w-[22px] h-[22px] ${activeTab === 'profile' ? 'text-[#7f0df2]' : 'text-[#64748b]'}`} />
                  {pendingRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
                </div>
                <span className={`text-[12px] font-bold text-center leading-tight ${activeTab === 'profile' ? 'text-[#7f0df2]' : 'text-[#64748b]'}`}>Perfil</span>
              </button>

            </div>
          </nav>

        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteConfirm(false)} />
          <div className="relative bg-[#1e1130] border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
            <div className="flex flex-col gap-1">
              <p className="text-[#f1f5f9] text-lg font-bold">Eliminar foto de hoy</p>
              <p className="text-[#94a3b8] text-sm">Esta acción es irreversible. ¿Seguro que quieres borrar tu foto de hoy?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-2xl border border-[rgba(255,255,255,0.1)] text-[#94a3b8] text-sm font-semibold disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteEntry}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-semibold shadow-[0px_4px_16px_rgba(239,68,68,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overwrite confirmation modal */}
      {showOverwriteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowOverwriteConfirm(false)} />
          <div className="relative bg-[#1e1130] border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
            <div className="flex flex-col gap-1">
              <p className="text-[#f1f5f9] text-lg font-bold">Ya tienes una foto hoy</p>
              <p className="text-[#94a3b8] text-sm">¿Seguro que quieres sobreescribir la foto de hoy?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowOverwriteConfirm(false)}
                className="flex-1 py-3 rounded-2xl border border-[rgba(255,255,255,0.1)] text-[#94a3b8] text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowOverwriteConfirm(false);
                  fabRef.current?.open();
                }}
                className="flex-1 py-3 rounded-2xl bg-[#7f0df2] text-white text-sm font-semibold shadow-[0px_4px_16px_rgba(127,13,242,0.4)]"
              >
                Sí, cambiar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddFriend && <AddFriendModal onClose={() => setShowAddFriend(false)} />}
      {showFriendsList && (
        <FriendsListModal
          friends={friends}
          onClose={() => setShowFriendsList(false)}
          onRefresh={fetchPendingRequests}
        />
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
      {selectedDate && (
        <PastDayModal
          date={selectedDate}
          currentUserId={user.id}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {/* Home story modal */}
      {homeStoryUser && homeStoryUser.todayPhotoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setHomeStoryUser(null)}
        >
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3 bg-gradient-to-b from-black/60 to-transparent z-10">
            <div className="w-10 h-10 rounded-full bg-[rgba(127,13,242,0.3)] flex items-center justify-center ring-2 ring-white/30">
              <span className="text-xl">{homeStoryUser.avatar}</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{homeStoryUser.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-white/60 text-xs">Hoy</p>
                {homeStoryUser.todayPhotoTimestamp && (
                  <span className="text-white/40 text-xs">{formatTimeChile(homeStoryUser.todayPhotoTimestamp)}</span>
                )}
              </div>
            </div>
            <button onClick={() => setHomeStoryUser(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <XIcon className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="absolute top-2 left-4 right-4 h-0.5 bg-white/20 rounded-full z-10">
            {!homeStoryLoading && (
              <div className="h-full bg-white rounded-full" style={{ animation: 'storyProgress 5s linear forwards' }} />
            )}
          </div>

          {homeStoryLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          )}

          <img
            src={homeStoryUser.todayPhotoUrl}
            alt={`Foto de ${homeStoryUser.name}`}
            className={`max-w-full max-h-full object-contain ${homeStoryLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
            onClick={(e) => e.stopPropagation()}
            onLoad={() => setHomeStoryLoading(false)}
            onError={() => setHomeStoryLoading(false)}
          />

          <p className="absolute bottom-6 left-0 right-0 text-center text-white/40 text-xs">Toca para cerrar</p>
        </div>
      )}
    </>
  );
}
