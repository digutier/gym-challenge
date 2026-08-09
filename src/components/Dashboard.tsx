'use client';

import { useState, useRef, useCallback } from 'react';
import { Home, User, Trophy, Loader2, BicepsFlexed } from 'lucide-react';
import PhotoUpload, { PhotoUploadHandle } from './PhotoUpload';
import AddFriendModal from './AddFriendModal';
import NotificationsModal from './NotificationsModal';
import FriendsListModal from './FriendsListModal';
import PastDayModal from './PastDayModal';
import GymHistoryModal from './GymHistoryModal';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import HomeTab from './dashboard/HomeTab';
import ProgressTab from './dashboard/ProgressTab';
import FeedTab from './dashboard/FeedTab';
import ProfileTab from './dashboard/ProfileTab';
import { EntryData, User as UserType } from '@/types';
import { getTodayDate } from '@/lib/date';
import { WEEKLY_GOAL } from '@/lib/stats';
import { useWeekNavigation } from '@/hooks/useWeekNavigation';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { appRoot, sidebar, mainArea, mobileTopNav, desktopTopBar, main, mobileBottomNav, confirmDialogs } from '@/components/styles/shell';

type Tab = 'home' | 'progress' | 'feed' | 'profile';

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
  const [showGymHistory, setShowGymHistory] = useState(false);
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
    progress: 'Progreso',
    feed: 'Ranking Global',
    profile: 'Mi Perfil',
  };

  // ─── Layout ────────────────────────────────────────────────────────────────

  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as Tab)}
        className={appRoot}
      >

        {/* ── DESKTOP SIDEBAR ── oculto en mobile, visible en lg+ */}
        <aside className={sidebar.root}>
          {/* Logo */}
          <div className={sidebar.logoRow}>
            <div className={sidebar.logoIcon}>🏋️</div>
            <div>
              <Text size="sm" weight="bold" className="leading-tight">Gym Challenge</Text>
              <Text size="10px" color="accent" weight="semibold" className="tracking-wider uppercase">
                {cappedActiveDays}/{WEEKLY_GOAL} esta sem.
              </Text>
            </div>
          </div>

          {/* Nav items */}
          <TabsList className={sidebar.navList}>
            {(
              [
                { tab: 'home' as Tab, icon: <Home className="w-[18px] h-[18px]" />, label: 'Inicio' },
                { tab: 'progress' as Tab, icon: <BicepsFlexed className="w-[18px] h-[18px]" />, label: 'Progreso' },
                { tab: 'feed' as Tab, icon: <Trophy className="w-[18px] h-[18px]" />, label: 'Ranking' },
                { tab: 'profile' as Tab, icon: <User className="w-[18px] h-[18px]" />, label: 'Perfil' },
              ] as const
            ).map(({ tab, icon, label }) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className={sidebar.navTrigger(activeTab === tab)}
              >
                {icon}
                <span>{label}</span>
                {tab === 'profile' && pendingRequests.length > 0 && (
                  <span className={sidebar.navBadge}>
                    {pendingRequests.length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* User pill */}
          <div className={sidebar.userPillWrap}>
            <div className={sidebar.userPill}>
              <div className={sidebar.userAvatar}>
                {user.avatar}
              </div>
              <div className={sidebar.userTextWrap}>
                <Text size="xs" weight="bold" className="truncate">{user.name}</Text>
                <Text size="10px" color="muted">Gym Challenge</Text>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN AREA ── full width en mobile, offset en lg+ */}
        <div className={mainArea.root}>

          {/* Mobile top nav — oculto en desktop */}
          <nav className={mobileTopNav.root}>
            <div className={mobileTopNav.brandRow}>
              <div className={mobileTopNav.avatar}>
                {user.avatar}
              </div>
              <Text size="sm" weight="bold" className="leading-tight">Gym Challenge</Text>
            </div>
          </nav>

          {/* Desktop top bar — oculto en mobile */}
          <div className={desktopTopBar.root}>
            <Heading as="h1" size="base">{TAB_LABELS[activeTab]}</Heading>
            {activeTab === 'home' && isCurrentWeek && (
              <Text as="span" size="10px" weight="bold" color="accent" className={desktopTopBar.weekBadge}>
                Esta semana
              </Text>
            )}
            <Text as="span" size="xs" color="muted" className={desktopTopBar.dateText}>
              {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </div>

          {/* Main content */}
          <main className={main.root}>
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
            <TabsContent value="progress">
              <ProgressTab />
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
                onShowGymHistory={() => setShowGymHistory(true)}
                onShowFriendsList={() => { fetchPendingRequests(); setShowFriendsList(true); }}
                onShowAddFriend={() => setShowAddFriend(true)}
                onShowNotifications={() => setShowNotifications(true)}
                onLogout={onLogout}
              />
            </TabsContent>
          </main>

          {/* Mobile bottom nav — oculto en desktop */}
          <nav
            className={mobileBottomNav.root}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <TabsList className={mobileBottomNav.list}>
              {/* Camera FAB — absolutely centered, floats above the nav */}
              <div className={mobileBottomNav.fabWrap}>
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
              <TabsTrigger value="home" className={mobileBottomNav.trigger}>
                <Home className={mobileBottomNav.icon(activeTab === 'home')} />
                <Text as="span" size="12px" weight="bold" color={activeTab === 'home' ? 'accent' : 'muted'} className={mobileBottomNav.label}>Inicio</Text>
              </TabsTrigger>

              {/* Progreso */}
              <TabsTrigger value="progress" className={mobileBottomNav.trigger}>
                <BicepsFlexed className={mobileBottomNav.icon(activeTab === 'progress')} />
                <Text as="span" size="12px" weight="bold" color={activeTab === 'progress' ? 'accent' : 'muted'} className={mobileBottomNav.label}>Progreso</Text>
              </TabsTrigger>

              {/* Spacer for FAB column */}
              <div className={mobileBottomNav.spacer} />

              {/* Feed */}
              <TabsTrigger value="feed" className={mobileBottomNav.trigger}>
                <Trophy className={mobileBottomNav.icon(activeTab === 'feed')} />
                <Text as="span" size="12px" weight="bold" color={activeTab === 'feed' ? 'accent' : 'muted'} className={mobileBottomNav.label}>Ranking</Text>
              </TabsTrigger>

              {/* Profile */}
              <TabsTrigger value="profile" className={mobileBottomNav.trigger}>
                <div className={mobileBottomNav.profileIconWrap}>
                  <User className={mobileBottomNav.icon(activeTab === 'profile')} />
                  {pendingRequests.length > 0 && (
                    <span className={mobileBottomNav.profileDot} />
                  )}
                </div>
                <Text as="span" size="12px" weight="bold" color={activeTab === 'profile' ? 'accent' : 'muted'} className={mobileBottomNav.label}>Perfil</Text>
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
          <div className={confirmDialogs.buttonRow}>
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className={confirmDialogs.cancelButtonDisabled}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteEntry}
              disabled={isDeleting}
              className={confirmDialogs.deleteConfirmButton}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sí, eliminar'}
            </Button>
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
          <div className={confirmDialogs.buttonRow}>
            <Button
              onClick={() => setShowOverwriteConfirm(false)}
              className={confirmDialogs.cancelButton}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setShowOverwriteConfirm(false);
                fabRef.current?.open();
              }}
              className={confirmDialogs.overwriteConfirmButton}
            >
              Sí, cambiar
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modals */}
      {showGymHistory && <GymHistoryModal onClose={() => setShowGymHistory(false)} />}
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
