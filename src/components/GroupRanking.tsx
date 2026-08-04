'use client';

import { useState } from 'react';
import { UserStats } from '@/types';
import { capDays, WEEKLY_GOAL } from '@/lib/stats';
import PodiumAvatar from './PodiumAvatar';
import StoryViewer from './StoryViewer';
import { Button } from '@/components/ui/button';

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
        <div className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-3xl px-4 pt-4 pb-6">
          <div className="flex items-end justify-center gap-4">
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
              <div className="flex-1" />
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
              <div className="flex-1" />
            )}
          </div>
        </div>
      )}

      {/* Rest of the list (4th+) */}
      {rest.length > 0 && (
        <div className="flex flex-col gap-2">
          {rest.map((u, i) => {
            const isMe = u.id === currentUserId;
            const hasPhoto = hasTodayPhoto(u);
            const pos = i + 4;
            const metric = getMetric(u);
            const reachedGoal = period === 'week' && metric >= WEEKLY_GOAL;

            return (
              <div
                key={u.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${isMe ? 'bg-[rgba(127,13,242,0.15)] ring-1 ring-[rgba(127,13,242,0.4)]' : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]'}`}
              >
                <span className="text-[#64748b] text-sm font-bold w-5 text-center">{pos}</span>
                <Button
                  onClick={() => handleAvatarClick(u)}
                  disabled={!hasPhoto}
                  className={`w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(127,13,242,0.15)] text-xl shrink-0 ${hasPhoto ? 'ring-[3px] ring-emerald-400 ring-offset-1 ring-offset-[#191022] cursor-pointer active:scale-95 transition-transform' : ''}`}
                >
                  {u.avatar}
                </Button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isMe ? 'text-[#7f0df2]' : 'text-[#f1f5f9]'}`}>
                    {u.name}{isMe && <span className="text-[10px] opacity-60 ml-1">(tú)</span>}
                  </p>
                  <p className="text-[#64748b] text-[11px]">{u.totalDays} total histórico</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-lg font-black leading-none ${reachedGoal ? 'text-emerald-400' : 'text-[#f1f5f9]'}`}>
                    {metric}
                  </p>
                  <p className="text-[#64748b] text-[10px]">{period === 'week' ? `/ ${WEEKLY_GOAL}` : 'días'}</p>
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
