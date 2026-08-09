'use client';

import { useState } from 'react';
import { UserStats } from '@/types';
import { capDays, WEEKLY_GOAL } from '@/lib/stats';
import PodiumAvatar from './PodiumAvatar';
import StoryViewer from './StoryViewer';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { groupRanking as styles } from '@/components/styles/ranking';

interface GroupRankingProps {
  users: UserStats[];
  currentUserId?: string;
  period?: 'week' | 'month' | 'year';
}

export default function GroupRanking({ users, currentUserId, period = 'week' }: GroupRankingProps) {
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);

  const getMetric = (u: UserStats) => {
    if (period === 'month') return u.monthlyDays ?? 0;
    if (period === 'year') return u.totalDays;
    return capDays(u.daysThisWeek);
  };

  const sortedUsers = [...users].sort((a, b) => getMetric(b) - getMetric(a));

  const metricLabel = (u: UserStats) => {
    const m = getMetric(u);
    return period === 'week' ? `${m}/${WEEKLY_GOAL} días` : `${m} días`;
  };

  const handleAvatarClick = (u: UserStats) => {
    if (period === 'week' && u.todayPhotoUrl && u.id !== currentUserId) {
      setSelectedUser(u);
    }
  };

  const hasTodayPhoto = (u: UserStats) =>
    period === 'week' && !!u.todayPhotoUrl && u.id !== currentUserId;

  // Podium: top 3
  const first = sortedUsers[0];
  const second = sortedUsers[1];
  const third = sortedUsers[2];
  const rest = sortedUsers.slice(3);

  const podiumMetricColor = (u: UserStats) => {
    const m = getMetric(u);
    return period === 'week' && m >= WEEKLY_GOAL ? 'text-emerald-400' : 'text-[#f1f5f9]';
  };

  return (
    <>
      {/* Podium */}
      {sortedUsers.length > 0 && (
        <div className={styles.podiumCard}>
          <div className={styles.podiumRow}>
            {/* 2nd */}
            {second ? (
              <PodiumAvatar
                u={second}
                rank={2}
                isMe={second.id === currentUserId}
                hasPhoto={hasTodayPhoto(second)}
                metricLabel={metricLabel(second)}
                metricColorClassName={podiumMetricColor(second)}
                onAvatarClick={handleAvatarClick}
              />
            ) : (
              <div className={styles.podiumSpacer} />
            )}
            {/* 1st */}
            {first && (
              <PodiumAvatar
                u={first}
                rank={1}
                isMe={first.id === currentUserId}
                hasPhoto={hasTodayPhoto(first)}
                metricLabel={metricLabel(first)}
                metricColorClassName={podiumMetricColor(first)}
                onAvatarClick={handleAvatarClick}
              />
            )}
            {/* 3rd */}
            {third ? (
              <PodiumAvatar
                u={third}
                rank={3}
                isMe={third.id === currentUserId}
                hasPhoto={hasTodayPhoto(third)}
                metricLabel={metricLabel(third)}
                metricColorClassName={podiumMetricColor(third)}
                onAvatarClick={handleAvatarClick}
              />
            ) : (
              <div className={styles.podiumSpacer} />
            )}
          </div>
        </div>
      )}

      {/* Rest of the list (4th+) */}
      {rest.length > 0 && (
        <div className={styles.restList}>
          {rest.map((u, i) => {
            const isMe = u.id === currentUserId;
            const hasPhoto = hasTodayPhoto(u);
            const pos = i + 4;
            const metric = getMetric(u);
            const reachedGoal = period === 'week' && metric >= WEEKLY_GOAL;

            return (
              <div
                key={u.id}
                className={styles.restRow(isMe)}
              >
                <Text as="span" size="sm" color="muted" weight="bold" className="w-5 text-center">{pos}</Text>
                <Button
                  onClick={() => handleAvatarClick(u)}
                  disabled={!hasPhoto}
                  className={styles.restAvatarButton(hasPhoto)}
                >
                  {u.avatar}
                </Button>
                <div className={styles.restNameWrap}>
                  <Text size="sm" weight="semibold" color={isMe ? 'accent' : 'primary'} className="truncate">
                    {u.name}{isMe && <Text as="span" size="10px" className="opacity-60 ml-1">(tú)</Text>}
                  </Text>
                  <Text size="11px" color="muted">{u.totalDays} total histórico</Text>
                </div>
                <div className={styles.restMetricWrap}>
                  <Text size="lg" weight="black" color={reachedGoal ? 'success' : 'primary'} className="leading-none">
                    {metric}
                  </Text>
                  <Text size="10px" color="muted">{period === 'week' ? `/ ${WEEKLY_GOAL}` : 'días'}</Text>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Story Modal */}
      {selectedUser && selectedUser.todayPhotoUrl && (
        <StoryViewer
          avatar={selectedUser.avatar}
          name={selectedUser.name}
          photoUrl={selectedUser.todayPhotoUrl}
          subtitle="Hoy"
          timestamp={selectedUser.todayPhotoTimestamp}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
}
