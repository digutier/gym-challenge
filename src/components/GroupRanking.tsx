'use client';

import { useState, useEffect } from 'react';
import { UserStats } from '@/types';
import { capDays, WEEKLY_GOAL } from '@/lib/stats';
import { formatTimeChile } from '@/lib/date';
import { X, Loader2 } from 'lucide-react';

interface GroupRankingProps {
  users: UserStats[];
  currentUserId?: string;
  period?: 'week' | 'month' | 'year';
}

export default function GroupRanking({ users, currentUserId, period = 'week' }: GroupRankingProps) {
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (selectedUser && !imageLoading) {
      const timer = setTimeout(() => setSelectedUser(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [selectedUser, imageLoading]);

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
      setImageLoading(true);
      setSelectedUser(u);
    }
  };

  const closeStory = () => {
    setSelectedUser(null);
    setImageLoading(true);
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

  const podiumTopOffset: Record<number, string> = {
    1: 'pt-0',
    2: 'pt-10',
    3: 'pt-16',
  };

  const PodiumAvatar = ({ u, rank }: { u: UserStats; rank: number }) => {
    const isMe = u.id === currentUserId;
    const hasPhoto = hasTodayPhoto(u);
    const avatarSize = rank === 1 ? 'w-[88px] h-[88px] text-5xl' : 'w-[68px] h-[68px] text-4xl';
    const medalColors: Record<number, string> = {
      1: 'bg-amber-400 text-amber-900',
      2: 'bg-[#94a3b8] text-slate-800',
      3: 'bg-amber-700 text-amber-100',
    };
    const ringColors: Record<number, string> = {
      1: 'ring-amber-400',
      2: 'ring-[#94a3b8]',
      3: 'ring-amber-700',
    };

    return (
      <div className={`flex flex-col items-center gap-2 flex-1 ${podiumTopOffset[rank]}`}>
        <div className="relative">
          {rank === 1 && (
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 text-4xl">👑</div>
          )}
          <button
            onClick={() => handleAvatarClick(u)}
            disabled={!hasPhoto}
            className={`${avatarSize} rounded-full flex items-center justify-center bg-[rgba(127,13,242,0.15)] ring-[4px] ${ringColors[rank]} ${hasPhoto ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
            style={rank === 1 ? { animation: 'goldGlow 2s ease-in-out infinite' } : undefined}
          >
            <span>{u.avatar}</span>
          </button>
          {/* Rank pill — overlaps bottom of avatar */}
          <div className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-10 ${medalColors[rank]} px-3 py-[3px] rounded-lg text-[11px] font-black shadow-lg whitespace-nowrap`}>
            {rank === 1 ? '1er' : rank === 2 ? '2do' : '3er'}
          </div>
          {hasPhoto && (
            <div className="absolute inset-0 rounded-full ring-[3px] ring-emerald-400 ring-offset-2 ring-offset-[#191022] pointer-events-none" />
          )}
        </div>
        <div className="flex flex-col items-center gap-0.5 mt-2">
          <p className={`text-xs font-bold truncate max-w-[90px] text-center ${isMe ? 'text-[#7f0df2]' : 'text-[#f1f5f9]'}`}>
            {u.name}{isMe && <span className="text-[9px] opacity-60 ml-0.5">(tú)</span>}
          </p>
          <p className={`text-sm font-black ${podiumMetricColor(u)}`}>
            {metricLabel(u)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Podium */}
      {sortedUsers.length > 0 && (
        <div className="backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-3xl px-4 pt-4 pb-6">
          <div className="flex items-end justify-center gap-4">
            {/* 2nd */}
            {second ? (
              <PodiumAvatar u={second} rank={2} />
            ) : (
              <div className="flex-1" />
            )}
            {/* 1st */}
            {first && <PodiumAvatar u={first} rank={1} />}
            {/* 3rd */}
            {third ? (
              <PodiumAvatar u={third} rank={3} />
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
                <button
                  onClick={() => handleAvatarClick(u)}
                  disabled={!hasPhoto}
                  className={`w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(127,13,242,0.15)] text-xl shrink-0 ${hasPhoto ? 'ring-[3px] ring-emerald-400 ring-offset-1 ring-offset-[#191022] cursor-pointer active:scale-95 transition-transform' : ''}`}
                >
                  {u.avatar}
                </button>
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
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeStory}
        >
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3 bg-gradient-to-b from-black/60 to-transparent z-10">
            <div className="w-10 h-10 rounded-full bg-[rgba(127,13,242,0.3)] flex items-center justify-center ring-2 ring-white/30">
              <span className="text-xl">{selectedUser.avatar}</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{selectedUser.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-white/60 text-xs">Hoy</p>
                {selectedUser.todayPhotoTimestamp && (
                  <span className="text-white/40 text-xs">{formatTimeChile(selectedUser.todayPhotoTimestamp)}</span>
                )}
              </div>
            </div>
            <button onClick={closeStory} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="absolute top-2 left-4 right-4 h-0.5 bg-white/20 rounded-full z-10">
            {!imageLoading && (
              <div className="h-full bg-white rounded-full" style={{ animation: 'storyProgress 5s linear forwards' }} />
            )}
          </div>

          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          )}

          <img
            src={selectedUser.todayPhotoUrl}
            alt={`Foto de ${selectedUser.name}`}
            className={`max-w-full max-h-full object-contain ${imageLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
            onClick={(e) => e.stopPropagation()}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />

          <p className="absolute bottom-6 left-0 right-0 text-center text-white/40 text-xs">Toca para cerrar</p>
        </div>
      )}
    </>
  );
}
