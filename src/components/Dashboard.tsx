'use client';

import { useState, useRef, useCallback } from 'react';
import { Home, User, Trophy, Loader2, CalendarDays } from 'lucide-react';
import PhotoUpload, { PhotoUploadHandle } from './PhotoUpload';
import AddFriendModal from './AddFriendModal';
import NotificationsModal from './NotificationsModal';
import FriendsListModal from './FriendsListModal';
import PastDayModal from './PastDayModal';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import HomeTab from './dashboard/HomeTab';
import WorkoutsTab from './dashboard/WorkoutsTab';
import FeedTab from './dashboard/FeedTab';
import ProfileTab from './dashboard/ProfileTab';
import { EntryData, User as UserType } from '@/types';
import { getTodayDate } from '@/lib/date';
import { WEEKLY_GOAL } from '@/lib/stats';
import { useWeekNavigation } from '@/hooks/useWeekNavigation';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useFriendRequests } from '@/hooks/useFriendRequests';

type Tab = 'home' | 'workouts' | 'feed' | 'profile';

interface DashboardProps {
  user: UserType;
  entry?: EntryData | null;
  onPhotoUpload: (entryData?: EntryData) => void;
  onEntryDelete: () => void;
  onLogout: () => void;
}

export default function Dashboard({ user, entry, onPhotoUpload, onEntryDelete, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const fabRef = useRef<PhotoUploadHandle>(null);

  const {
    selectedWeekStart, setSelectedWeekStart, weekLabel, isCurrentWeek,
    canGoPrev, canGoNext, handleWeekPrev, handleWeekNext,
  } = useWeekNavigation();

  const { weekEntries, currentWeekActiveDays, ranking, loading, refreshStats } =
    useDashboardStats(user.id, selectedWeekStart);

  const { pendingRequests, friends, fetchPendingRequests } = useFriendRequests(user.id);

  // Wrapper de upload: actualiza entry en el padre y luego refresca stats
  // para que grid semanal, ranking y mensaje de motivación queden en sync.
  const handleUploadComplete = useCallback(async (
    entryData?: { date: string; photo_url: string; timestamp: string }
  ) => {
    onPhotoUpload(entryData);
    await refreshStats();
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

  const activeDaysThisWeek = weekEntries.filter(e => e.registered).length;
  const cappedActiveDays = Math.min(activeDaysThisWeek, WEEKLY_GOAL);

  const TAB_LABELS: Record<Tab, string> = {
    home: 'Dashboard',
    workouts: 'Registros',
    feed: 'Ranking Global',
    profile: 'Mi Perfil',
  };

  // ─── Layout ────────────────────────────────────────────────────────────────

  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as Tab)}
        className="min-h-screen bg-[#191022] flex"
      >

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
          <TabsList className="flex flex-col gap-1 p-3 flex-1">
            {(
              [
                { tab: 'home' as Tab, icon: <Home className="w-[18px] h-[18px]" />, label: 'Inicio' },
                { tab: 'workouts' as Tab, icon: <CalendarDays className="w-[18px] h-[18px]" />, label: 'Registros' },
                { tab: 'feed' as Tab, icon: <Trophy className="w-[18px] h-[18px]" />, label: 'Ranking' },
                { tab: 'profile' as Tab, icon: <User className="w-[18px] h-[18px]" />, label: 'Perfil' },
              ] as const
            ).map(({ tab, icon, label }) => (
              <TabsTrigger
                key={tab}
                value={tab}
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
              </TabsTrigger>
            ))}
          </TabsList>

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
            <TabsContent value="home">
              <HomeTab
                user={user}
                entry={entry}
                hasEntryToday={hasEntryToday}
                photoUrl={photoUrl}
                today={today}
                currentWeekActiveDays={currentWeekActiveDays}
                cappedActiveDays={cappedActiveDays}
                weekEntries={weekEntries}
                loading={loading}
                isCurrentWeek={isCurrentWeek}
                weekLabel={weekLabel}
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
                onWeekPrev={handleWeekPrev}
                onWeekNext={handleWeekNext}
                onSelectDate={setSelectedDate}
                onRequestDelete={() => setShowDeleteConfirm(true)}
                onRequestOverwrite={() => setShowOverwriteConfirm(true)}
                onUploadComplete={handleUploadComplete}
                ranking={ranking}
                currentUserId={user.id}
              />
            </TabsContent>
            <TabsContent value="workouts">
              <WorkoutsTab />
            </TabsContent>
            <TabsContent value="feed">
              <FeedTab ranking={ranking} loading={loading} currentUserId={user.id} />
            </TabsContent>
            <TabsContent value="profile">
              <ProfileTab
                user={user}
                ranking={ranking}
                friendsCount={friends.length}
                pendingRequestsCount={pendingRequests.length}
                onShowFriendsList={() => { fetchPendingRequests(); setShowFriendsList(true); }}
                onShowAddFriend={() => setShowAddFriend(true)}
                onShowNotifications={() => setShowNotifications(true)}
                onLogout={onLogout}
              />
            </TabsContent>
          </main>

          {/* Mobile bottom nav — oculto en desktop */}
          <nav
            className="lg:hidden fixed bottom-0 left-0 right-0 h-[90px] backdrop-blur-[5px] bg-[rgba(25,16,34,0.9)] border-t border-[#1e293b] z-10"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <TabsList className="relative flex items-center justify-around h-full px-2">
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
              <TabsTrigger value="home" className="flex flex-col items-center gap-1 flex-1">
                <Home className={`w-[22px] h-[22px] ${activeTab === 'home' ? 'text-[#7f0df2]' : 'text-[#64748b]'}`} />
                <span className={`text-[12px] font-bold text-center leading-tight ${activeTab === 'home' ? 'text-[#7f0df2]' : 'text-[#64748b]'}`}>Inicio</span>
              </TabsTrigger>

              {/* Workouts */}
              <TabsTrigger value="workouts" className="flex flex-col items-center gap-1 flex-1">
                <CalendarDays className={`w-[22px] h-[22px] ${activeTab === 'workouts' ? 'text-[#7f0df2]' : 'text-[#64748b]'}`} />
                <span className={`text-[12px] font-bold text-center leading-tight ${activeTab === 'workouts' ? 'text-[#7f0df2]' : 'text-[#64748b]'}`}>Registros</span>
              </TabsTrigger>

              {/* Spacer for FAB column */}
              <div className="flex-1" />

              {/* Feed */}
              <TabsTrigger value="feed" className="flex flex-col items-center gap-1 flex-1">
                <Trophy className={`w-[22px] h-[22px] ${activeTab === 'feed' ? 'text-[#7f0df2]' : 'text-[#64748b]'}`} />
                <span className={`text-[12px] font-bold text-center leading-tight ${activeTab === 'feed' ? 'text-[#7f0df2]' : 'text-[#64748b]'}`}>Ranking</span>
              </TabsTrigger>

              {/* Profile */}
              <TabsTrigger value="profile" className="flex flex-col items-center gap-1 flex-1">
                <div className="relative">
                  <User className={`w-[22px] h-[22px] ${activeTab === 'profile' ? 'text-[#7f0df2]' : 'text-[#64748b]'}`} />
                  {pendingRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
                </div>
                <span className={`text-[12px] font-bold text-center leading-tight ${activeTab === 'profile' ? 'text-[#7f0df2]' : 'text-[#64748b]'}`}>Perfil</span>
              </TabsTrigger>

            </TabsList>
          </nav>

        </div>
      </Tabs>

      {/* Delete confirmation modal */}
      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => { if (!open && !isDeleting) setShowDeleteConfirm(false); }}
      >
        <AlertDialogContent>
          <AlertDialogTitle className="text-[#f1f5f9] text-lg font-bold">Eliminar foto de hoy</AlertDialogTitle>
          <AlertDialogDescription className="text-[#94a3b8] text-sm">
            Esta acción es irreversible. ¿Seguro que quieres borrar tu foto de hoy?
          </AlertDialogDescription>
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
        </AlertDialogContent>
      </AlertDialog>

      {/* Overwrite confirmation modal */}
      <AlertDialog open={showOverwriteConfirm} onOpenChange={setShowOverwriteConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle className="text-[#f1f5f9] text-lg font-bold">Ya tienes una foto hoy</AlertDialogTitle>
          <AlertDialogDescription className="text-[#94a3b8] text-sm">
            ¿Seguro que quieres sobreescribir la foto de hoy?
          </AlertDialogDescription>
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
        </AlertDialogContent>
      </AlertDialog>

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
    </>
  );
}
