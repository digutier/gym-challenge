'use client';

import { useState } from 'react';
import { Camera, Check, X as XIcon, ChevronLeft, ChevronRight, Trash2, Zap } from 'lucide-react';
import PhotoUpload from '../PhotoUpload';
import StoryViewer from '../StoryViewer';
import RankingList from './RankingList';
import { User, EntryData, WeekEntry, UserStats } from '@/types';
import { WEEKLY_GOAL } from '@/lib/stats';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const getWeekMotivation = (days: number): string => {
  if (days >= 4) return '¡Semana completada! Eres una máquina 🔥';
  if (days === 3) return '¡Solo falta uno para cumplir la meta! 🤪';
  if (days === 2) return 'Ya vas por la mitad, no te detengas 😫';
  if (days === 1) return '¡Arrancaste la semana con todo! 🚀';
  return '';
};

interface HomeTabProps {
  user: User;
  entry?: EntryData | null;
  hasEntryToday: boolean | undefined | null;
  photoUrl: string;
  today: string;
  currentWeekActiveDays: number;
  cappedActiveDays: number;
  weekEntries: WeekEntry[];
  loading: boolean;
  isCurrentWeek: boolean;
  weekLabel: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  onWeekPrev: () => void;
  onWeekNext: () => void;
  onSelectDate: (date: string) => void;
  onRequestDelete: () => void;
  onRequestOverwrite: () => void;
  onUploadComplete: (entryData?: EntryData) => void;
  ranking: UserStats[];
  currentUserId: string;
}

export default function HomeTab({
  user,
  entry,
  hasEntryToday,
  photoUrl,
  today,
  currentWeekActiveDays,
  cappedActiveDays,
  weekEntries,
  loading,
  isCurrentWeek,
  weekLabel,
  canGoPrev,
  canGoNext,
  onWeekPrev,
  onWeekNext,
  onSelectDate,
  onRequestDelete,
  onRequestOverwrite,
  onUploadComplete,
  ranking,
  currentUserId,
}: HomeTabProps) {
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [homeStoryUser, setHomeStoryUser] = useState<UserStats | null>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setIsHorizontal(img.naturalWidth / img.naturalHeight > 1);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 lg:max-w-[1280px] lg:w-full lg:mx-auto lg:px-6 lg:py-2">
      {/* Left column: hero card + week grid + ranking (mobile) */}
      <div className="flex flex-col gap-4 pb-6 flex-1 lg:pb-2 min-w-0">
      {/* Hero card */}
      {hasEntryToday && entry ? (
        <div className="relative overflow-hidden rounded-3xl mx-4 lg:mx-0 lg:h-[500px] shadow-[0px_20px_25px_-5px_rgba(127,13,242,0.35)] bg-black">
          {/* Intentionally not next/image: intrinsic aspect-ratio sizing on
              mobile vs absolute fill on desktop, with object-fit also
              branching on photo orientation — too much layout risk to
              restructure without visual verification. See StoryViewer/
              PastDayModal for the migrated pattern. */}
          <img
            src={photoUrl}
            alt="Foto del gym"
            onLoad={handleImageLoad}
            className={`w-full lg:absolute lg:inset-0 lg:h-full lg:w-full lg:object-contain ${isHorizontal ? 'max-h-64 object-contain' : 'aspect-[3/4] object-cover'}`}
          />

          {/* Delete FAB — top left */}
          <Button
            onClick={onRequestDelete}
            className="absolute top-4 left-4 z-10 rounded-full size-10 flex items-center justify-center bg-black/60 backdrop-blur-md active:scale-95 transition-transform"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </Button>

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
            <Button
              onClick={onRequestOverwrite}
              className="hidden lg:flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-semibold px-4 py-2.5 rounded-2xl hover:bg-white/25 active:scale-95 transition-all shrink-0"
            >
              <Camera className="w-4 h-4" />
              Cambiar
            </Button>
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
            <PhotoUpload onUploadComplete={onUploadComplete} variant="cta" />
          </div>
        </div>
      )}

      {/* This Week */}
      <div className="flex flex-col gap-4 px-4 lg:px-0 pt-2">
        <div className="flex items-center justify-between">
          <Heading as="h3" size="lg">{isCurrentWeek ? 'Esta semana' : weekLabel}</Heading>
          <Text as="span" size="xs" color="accent" weight="semibold" className="tracking-[1.2px] uppercase">
            {cappedActiveDays}/{WEEKLY_GOAL} Idas al GYM 💪
          </Text>
        </div>

        {!loading && weekEntries.length > 0 ? (
          <>
            <div className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] flex items-center justify-between px-4 py-4 rounded-3xl">
              {weekEntries.map((dayEntry, i) => {
                const isToday = dayEntry.date === today;
                const isPast = dayEntry.date < today;
                const isFuture = dayEntry.date > today;

                return (
                  <Button
                    key={dayEntry.date}
                    onClick={() => isPast && onSelectDate(dayEntry.date)}
                    disabled={!isPast}
                    className="flex flex-col items-center gap-2 disabled:opacity-100"
                  >
                    <Text as="span" size="10px" weight="bold" color={isToday ? 'accent' : 'muted'} className="uppercase">
                      {DAY_LABELS[i]}
                    </Text>
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
                  </Button>
                );
              })}
            </div>

            {/* Week navigation */}
            <div className="flex items-center justify-between -mt-1">
              <Button
                onClick={onWeekPrev}
                disabled={!canGoPrev}
                className={`flex items-center gap-1 text-xs transition-colors disabled:opacity-100 ${canGoPrev ? 'text-[#94a3b8] hover:text-[#f1f5f9]' : 'text-[#334155] cursor-not-allowed'}`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </Button>

              <Button
                onClick={onWeekNext}
                disabled={!canGoNext}
                className={`flex items-center gap-1 text-xs transition-colors disabled:opacity-100 ${canGoNext ? 'text-[#94a3b8] hover:text-[#f1f5f9]' : 'text-[#334155] cursor-not-allowed'}`}
              >
                Siguiente
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </>
        ) : loading ? (
          <div className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-3xl h-20 animate-pulse" />
        ) : null}
      </div>

      {/* Ranking Semanal — sólo visible en mobile */}
      <div className="lg:hidden flex flex-col gap-4 px-4">
        <Heading as="h3" size="lg">Ranking Semanal</Heading>
        <RankingList ranking={ranking} loading={loading} currentUserId={currentUserId} onAvatarClick={setHomeStoryUser} />
      </div>

      </div>{/* /left column */}

      {/* Right column: ranking semanal — sólo visible en desktop (lg+) */}
      <div className="hidden lg:flex flex-col gap-4 w-[280px] shrink-0 pb-6">
        <Heading as="h3" size="base">Ranking Semanal</Heading>
        <RankingList ranking={ranking} loading={loading} currentUserId={currentUserId} onAvatarClick={setHomeStoryUser} />
      </div>

      {/* Home story modal */}
      {homeStoryUser && homeStoryUser.todayPhotoUrl && (
        <StoryViewer
          avatar={homeStoryUser.avatar}
          name={homeStoryUser.name}
          photoUrl={homeStoryUser.todayPhotoUrl}
          subtitle="Hoy"
          timestamp={homeStoryUser.todayPhotoTimestamp}
          onClose={() => setHomeStoryUser(null)}
        />
      )}

    </div>
  );
}
