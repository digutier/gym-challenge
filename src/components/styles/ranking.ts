import { cn } from '@/lib/utils';
import { surfaceSubtle, surfaceAccent, ringToday } from '@/components/styles/shared';

export const groupRanking = {
  podiumCard: cn(surfaceSubtle, 'backdrop-blur-[5px] rounded-3xl px-4 pt-4 pb-6'),
  podiumRow: 'flex items-end justify-center gap-4',
  podiumSpacer: 'flex-1',
  restList: 'flex flex-col gap-2',
  restRow: (isMe: boolean) =>
    cn('flex items-center gap-3 px-4 py-3 rounded-2xl', isMe ? surfaceAccent : surfaceSubtle),
  restAvatarButton: (hasPhoto: boolean) =>
    cn(
      'w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(127,13,242,0.15)] text-xl shrink-0 disabled:opacity-100',
      hasPhoto && cn(ringToday, 'ring-offset-1 ring-offset-[#191022] cursor-pointer active:scale-95 transition-transform')
    ),
  restNameWrap: 'flex-1 min-w-0',
  restMetricWrap: 'text-right shrink-0',
};

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

const avatarSize = (rank: number) => (rank === 1 ? 'w-[88px] h-[88px] text-5xl' : 'w-[68px] h-[68px] text-4xl');

export const podiumAvatar = {
  wrap: (rank: number) => cn('flex flex-col items-center gap-2 flex-1', podiumTopOffset[rank]),
  avatarWrap: 'relative',
  crownWrap: 'absolute -top-9 left-1/2 -translate-x-1/2 text-4xl',
  avatarButton: (rank: number, hasPhoto: boolean) =>
    cn(
      avatarSize(rank),
      'rounded-full flex items-center justify-center bg-[rgba(127,13,242,0.15)] ring-[4px]',
      ringColors[rank],
      'disabled:opacity-100',
      hasPhoto && 'cursor-pointer active:scale-95 transition-transform'
    ),
  rankPill: (rank: number) =>
    cn('absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-10 px-3 py-[3px] rounded-lg text-[11px] font-black shadow-lg whitespace-nowrap', medalColors[rank]),
  photoRing: cn(ringToday, 'absolute inset-0 rounded-full ring-offset-2 ring-offset-[#191022] pointer-events-none'),
  textWrap: 'flex flex-col items-center gap-0.5 mt-2',
};
