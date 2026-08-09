import { UserStats } from '@/types';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { podiumAvatar as styles } from '@/components/styles/ranking';

interface PodiumAvatarProps {
  u: UserStats;
  rank: 1 | 2 | 3;
  isMe: boolean;
  hasPhoto: boolean;
  metricLabel: string;
  metricColorClassName: string;
  onAvatarClick: (u: UserStats) => void;
}

export default function PodiumAvatar({
  u,
  rank,
  isMe,
  hasPhoto,
  metricLabel,
  metricColorClassName,
  onAvatarClick,
}: PodiumAvatarProps) {
  return (
    <div className={styles.wrap(rank)}>
      <div className={styles.avatarWrap}>
        {rank === 1 && (
          <div className={styles.crownWrap}>👑</div>
        )}
        <Button
          onClick={() => onAvatarClick(u)}
          disabled={!hasPhoto}
          className={styles.avatarButton(rank, hasPhoto)}
          style={rank === 1 ? { animation: 'goldGlow 2s ease-in-out infinite' } : undefined}
        >
          <span>{u.avatar}</span>
        </Button>
        {/* Rank pill — overlaps bottom of avatar */}
        <div className={styles.rankPill(rank)}>
          {rank === 1 ? '1er' : rank === 2 ? '2do' : '3er'}
        </div>
        {hasPhoto && (
          <div className={styles.photoRing} />
        )}
      </div>
      <div className={styles.textWrap}>
        <Text size="xs" weight="bold" color={isMe ? 'accent' : 'primary'} className="truncate max-w-[90px] text-center">
          {u.name}{isMe && <Text as="span" size="9px" className="opacity-60 ml-0.5">(tú)</Text>}
        </Text>
        <Text size="sm" weight="black" className={metricColorClassName}>
          {metricLabel}
        </Text>
      </div>
    </div>
  );
}
