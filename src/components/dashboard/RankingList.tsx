import { UserStats } from '@/types';
import { capDays, WEEKLY_GOAL } from '@/lib/stats';
import { formatTimeChile } from '@/lib/date';
import { Button } from '@/components/ui/button';

interface RankingListProps {
  ranking: UserStats[];
  loading: boolean;
  currentUserId: string;
  onAvatarClick: (friend: UserStats) => void;
}

const rankIcon = (rank: number) => {
  if (rank === 1) return '🏆';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return <span className="text-[#64748b] text-xs font-bold w-6 text-center">{rank}</span>;
};

export default function RankingList({ ranking, loading, currentUserId, onAvatarClick }: RankingListProps) {
  const friendActivity = ranking.slice(0, 5);

  // Compute ranks (ties share the same rank) once, by position in the
  // weekly-sorted order — matches the original per-row recomputation exactly,
  // just done in one pass instead of once per row.
  const sortedByWeek = [...ranking].sort((a, b) => capDays(b.daysThisWeek) - capDays(a.daysThisWeek));
  const ranksByIndex: number[] = [];
  sortedByWeek.forEach((u, i) => {
    if (i === 0) {
      ranksByIndex.push(1);
      return;
    }
    const prevMetric = capDays(sortedByWeek[i - 1].daysThisWeek);
    const curMetric = capDays(u.daysThisWeek);
    ranksByIndex.push(curMetric < prevMetric ? i + 1 : ranksByIndex[i - 1]);
  });

  return (
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
            const isMe = friend.id === currentUserId;
            const hasPhoto = !!friend.todayPhotoUrl;
            const metric = capDays(friend.daysThisWeek);
            const rank = idx === 0 ? 1 : ranksByIndex[idx];
            return (
              <div
                key={friend.id}
                className={`backdrop-blur-[5px] flex items-center gap-3 p-[13px] rounded-3xl ${isMe ? 'bg-[rgba(127,13,242,0.15)] ring-1 ring-[rgba(127,13,242,0.4)]' : 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]'}`}
              >
                <div className="w-7 flex items-center justify-center shrink-0 text-lg leading-none">
                  {rankIcon(rank)}
                </div>
                <Button
                  onClick={() => {
                    if (hasPhoto && !isMe) { onAvatarClick(friend); }
                  }}
                  disabled={!hasPhoto || isMe}
                  className={`size-12 rounded-full flex items-center justify-center shrink-0 text-2xl bg-[rgba(127,13,242,0.15)] ${hasPhoto && !isMe ? 'ring-[3px] ring-emerald-400 ring-offset-1 ring-offset-[#191022] cursor-pointer active:scale-95 transition-transform' : ''}`}
                >
                  {friend.avatar}
                </Button>
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
}
