import { UserStats } from '@/types';
import { capDays, WEEKLY_GOAL } from '@/lib/stats';
import { formatTimeChile } from '@/lib/date';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { rankingList as styles } from './styles';

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
  return <Text as="span" size="xs" color="muted" weight="bold" className="w-6 text-center">{rank}</Text>;
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
        <div className={styles.skeletonWrap}>
          {[1, 2, 3].map(i => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      ) : friendActivity.length > 0 ? (
        <div className={styles.listWrap}>
          {friendActivity.map((friend, idx) => {
            const isMe = friend.id === currentUserId;
            const hasPhoto = !!friend.todayPhotoUrl;
            const metric = capDays(friend.daysThisWeek);
            const rank = idx === 0 ? 1 : ranksByIndex[idx];
            return (
              <div
                key={friend.id}
                className={styles.row(isMe)}
              >
                <div className={styles.rankIconWrap}>
                  {rankIcon(rank)}
                </div>
                <Button
                  onClick={() => {
                    if (hasPhoto && !isMe) { onAvatarClick(friend); }
                  }}
                  disabled={!hasPhoto || isMe}
                  className={styles.avatarButton(hasPhoto && !isMe)}
                >
                  {friend.avatar}
                </Button>
                <div className={styles.nameTextWrap}>
                  <Text size="sm" weight="bold" color={isMe ? 'accent' : 'primary'} className="truncate">
                    {friend.name}{isMe && <Text as="span" size="10px" className="opacity-60 ml-1">(tú)</Text>}
                  </Text>
                  {hasPhoto && friend.todayPhotoTimestamp && (
                    <Text size="xs" color="success" className="truncate">
                      Fue al gym hoy {formatTimeChile(friend.todayPhotoTimestamp)} hrs
                    </Text>
                  )}
                </div>
                <div className={styles.metricWrap}>
                  <Text size="lg" weight="black" color={metric >= WEEKLY_GOAL ? 'success' : 'primary'} className="leading-none">
                    {metric}
                  </Text>
                  <Text size="10px" color="muted">/ {WEEKLY_GOAL}</Text>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Text size="sm" color="muted" className="text-center py-6">
          Agrega amigos para ver su actividad aquí.
        </Text>
      )}
    </>
  );
}
