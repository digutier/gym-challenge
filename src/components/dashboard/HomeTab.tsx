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
import { homeTab as styles } from './styles';

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
    <div className={styles.root}>
      {/* Left column: hero card + week grid + ranking (mobile) */}
      <div className={styles.leftColumn}>
      {/* Hero card */}
      {hasEntryToday && entry ? (
        <div className={styles.heroCard}>
          {/* Intentionally not next/image: intrinsic aspect-ratio sizing on
              mobile vs absolute fill on desktop, with object-fit also
              branching on photo orientation — too much layout risk to
              restructure without visual verification. See StoryViewer/
              PastDayModal for the migrated pattern. */}
          <img
            src={photoUrl}
            alt="Foto del gym"
            onLoad={handleImageLoad}
            className={styles.heroImage(isHorizontal)}
          />

          {/* Delete FAB — top left */}
          <Button
            onClick={onRequestDelete}
            className={styles.deleteFab}
          >
            <Trash2 className="w-4 h-4 text-white" />
          </Button>

          {/* PHOTO UPLOADED badge */}
          <div className={styles.uploadedBadge}>
            <div className={styles.uploadedBadgeIcon}>
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <span className={styles.uploadedBadgeText}>¡Hoy!</span>
          </div>

          {/* Bottom gradient overlay — text left, button right, no overlap */}
          <div className={styles.heroBottomOverlay}>
            <div className={styles.heroBottomTextWrap}>
              <p className={styles.heroTitle}>
                ¡Bien hecho, {user.name}!
              </p>
              <div className={styles.heroMotivationRow}>
                <Zap className={styles.heroMotivationIcon} />
                <span className={styles.heroMotivationText}>{getWeekMotivation(currentWeekActiveDays)}</span>
              </div>
            </div>
            {/* Cambiar foto — solo visible en desktop (en mobile lo maneja el FAB) */}
            <Button
              onClick={onRequestOverwrite}
              className={styles.changePhotoButton}
            >
              <Camera className="w-4 h-4" />
              Cambiar
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={styles.ctaCard}
          style={styles.ctaCardBackground}
        >
          <div className={styles.ctaGlow} />

          <div className={styles.ctaHeaderRow}>
            <div className={styles.ctaTextWrap}>
              <h2 className={styles.ctaTitle}>¡Anda al GYM CTM!</h2>
              <p className={styles.ctaSubtitle}>Captura tu ida del día.</p>
            </div>
            <div className={styles.ctaIconWrap}>
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className={styles.ctaButtonWrap}>
            <PhotoUpload onUploadComplete={onUploadComplete} variant="cta" />
          </div>
        </div>
      )}

      {/* This Week */}
      <div className={styles.weekSection}>
        <div className={styles.weekHeaderRow}>
          <Heading as="h3" size="lg">{isCurrentWeek ? 'Esta semana' : weekLabel}</Heading>
          <Text as="span" size="xs" color="accent" weight="semibold" className="tracking-[1.2px] uppercase">
            {cappedActiveDays}/{WEEKLY_GOAL} Idas al GYM 💪
          </Text>
        </div>

        {!loading && weekEntries.length > 0 ? (
          <>
            <div className={styles.weekGridContainer}>
              {weekEntries.map((dayEntry, i) => {
                const isToday = dayEntry.date === today;
                const isPast = dayEntry.date < today;
                const isFuture = dayEntry.date > today;

                return (
                  <Button
                    key={dayEntry.date}
                    onClick={() => isPast && onSelectDate(dayEntry.date)}
                    disabled={!isPast}
                    className={styles.dayButton}
                  >
                    <Text as="span" size="10px" weight="bold" color={isToday ? 'accent' : 'muted'} className="uppercase">
                      {DAY_LABELS[i]}
                    </Text>
                    {isFuture || (isToday && !dayEntry.registered) ? (
                      <div className={styles.dayCircleFuture} />
                    ) : isToday && dayEntry.registered ? (
                      <div className={styles.dayCircleTodayDone}>
                        <Check className="w-[14px] h-[14px] text-white" strokeWidth={3} />
                      </div>
                    ) : dayEntry.registered ? (
                      <div className={styles.dayCirclePastDone}>
                        <Check className="w-[14px] h-[14px] text-[#7f0df2]" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className={styles.dayCircleMissed}>
                        <XIcon className="w-[14px] h-[14px] text-[#64748b]" strokeWidth={2.5} />
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Week navigation */}
            <div className={styles.weekNavRow}>
              <Button
                onClick={onWeekPrev}
                disabled={!canGoPrev}
                className={styles.weekNavButton(canGoPrev)}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </Button>

              <Button
                onClick={onWeekNext}
                disabled={!canGoNext}
                className={styles.weekNavButton(canGoNext)}
              >
                Siguiente
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </>
        ) : loading ? (
          <div className={styles.weekGridSkeleton} />
        ) : null}
      </div>

      {/* Ranking Semanal — sólo visible en mobile */}
      <div className={styles.rankingSectionMobile}>
        <Heading as="h3" size="lg">Ranking Semanal</Heading>
        <RankingList ranking={ranking} loading={loading} currentUserId={currentUserId} onAvatarClick={setHomeStoryUser} />
      </div>

      </div>{/* /left column */}

      {/* Right column: ranking semanal — sólo visible en desktop (lg+) */}
      <div className={styles.rankingSectionDesktop}>
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
