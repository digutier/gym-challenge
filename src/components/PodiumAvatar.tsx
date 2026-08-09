import { UserStats } from '@/types';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

const podiumTopOffset: Record<number, string> = {
  1: 'pt-0',
  2: 'pt-10',
  3: 'pt-16',
};

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
  const avatarSize = rank === 1 ? 'w-[88px] h-[88px] text-5xl' : 'w-[68px] h-[68px] text-4xl';

  return (
    <div className={`flex flex-col items-center gap-2 flex-1 ${podiumTopOffset[rank]}`}>
      <div className="relative">
        {rank === 1 && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 text-4xl">👑</div>
        )}
        <Button
          onClick={() => onAvatarClick(u)}
          disabled={!hasPhoto}
          className={`${avatarSize} rounded-full flex items-center justify-center bg-[rgba(127,13,242,0.15)] ring-[4px] ${ringColors[rank]} disabled:opacity-100 ${hasPhoto ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
          style={rank === 1 ? { animation: 'goldGlow 2s ease-in-out infinite' } : undefined}
        >
          <span>{u.avatar}</span>
        </Button>
        {/* Rank pill — overlaps bottom of avatar */}
        <div className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-10 ${medalColors[rank]} px-3 py-[3px] rounded-lg text-[11px] font-black shadow-lg whitespace-nowrap`}>
          {rank === 1 ? '1er' : rank === 2 ? '2do' : '3er'}
        </div>
        {hasPhoto && (
          <div className="absolute inset-0 rounded-full ring-[3px] ring-emerald-400 ring-offset-2 ring-offset-[#191022] pointer-events-none" />
        )}
      </div>
      <div className="flex flex-col items-center gap-0.5 mt-2">
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
