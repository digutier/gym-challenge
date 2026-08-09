import { cn } from '@/lib/utils';
import {
  iconCircleButton, ringToday,
  historyViewerOverlay, historyViewerContent, historyViewerHeaderBar, historyViewerImageArea, historyViewerArrowButton,
} from '@/components/styles/shared';

export const storyViewer = {
  overlayClassName: (zIndexClassName: string) => `!bg-black/95 !backdrop-blur-none ${zIndexClassName}`,
  contentClassName: (zIndexClassName: string) =>
    `fixed inset-0 top-0 left-0 translate-x-0 translate-y-0 w-full max-w-none ${zIndexClassName} rounded-none border-0 bg-transparent p-0 shadow-none flex items-center justify-center`,
  headerBar: 'absolute top-0 left-0 right-0 p-4 flex items-center gap-3 bg-gradient-to-b from-black/60 to-transparent z-10',
  avatarCircle: (avatarBgClassName: string) =>
    cn('w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-white/30', avatarBgClassName),
  nameWrap: 'flex-1',
  subtitleRow: 'flex items-center gap-2',
  subtitleText: 'text-white/60 text-xs capitalize',
  timestampText: 'text-white/40 text-xs',
  closeButton: iconCircleButton('light'),
  progressTrack: 'absolute top-2 left-4 right-4 h-0.5 bg-white/20 rounded-full z-10',
  progressBar: 'h-full bg-white rounded-full',
  loadingOverlay: 'absolute inset-0 flex items-center justify-center',
  imageWrap: 'relative w-full h-full',
  image: (loading: boolean) => cn('object-contain', loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'),
  tapToClose: 'absolute bottom-6 left-0 right-0 text-center text-white/40 text-xs',
};

export const pastDayModal = {
  overlayClassName: '!bg-black/90 !backdrop-blur-sm',
  contentClassName: 'fixed inset-0 top-0 left-0 translate-x-0 translate-y-0 w-full max-w-none rounded-none border-0 bg-transparent p-0 shadow-none flex flex-col',
  headerBar: 'flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent',
  closeButton: iconCircleButton('light', 'md'),
  loadingWrap: 'flex-1 flex items-center justify-center',
  scrollWrap: 'flex-1 overflow-y-auto px-4 pb-6',
  sectionWrap: 'mb-6',
  sectionHeaderRow: 'flex items-center justify-between mb-3',
  sectionLabel: 'text-white/60 text-xs font-bold uppercase tracking-wider',
  sectionTimestamp: 'text-white/40 text-xs',
  photoCardWrap: 'rounded-2xl overflow-hidden shadow-xl',
  photoFrame: (isHorizontal: boolean) => cn('relative aspect-[4/5]', isHorizontal ? 'bg-black' : 'bg-gray-900'),
  photoLoadingOverlay: 'absolute inset-0 flex items-center justify-center z-10',
  photoLoadingCircle: 'w-16 h-16 rounded-full bg-white/20 flex items-center justify-center',
  photoImage: (isHorizontal: boolean, loading: boolean) =>
    cn(isHorizontal ? 'object-contain' : 'object-cover', loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'),
  registeredBadge: 'absolute top-2 right-2 flex items-center gap-1.5 bg-emerald-500 text-white px-2 py-1 rounded-full font-semibold text-xs shadow-lg',
  missedCard: 'bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl p-8 border border-red-500/30 text-center',
  missedEmoji: 'text-5xl mb-3',
  missedTitle: 'text-white font-bold text-lg mb-1',
  missedSubtitle: 'text-white/60 text-sm',
  friendsLabel: 'text-white/60 text-xs font-bold uppercase tracking-wider mb-3',
  friendsGrid: 'flex flex-wrap gap-3',
  friendButton: 'flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors',
  friendAvatar: cn(ringToday, 'relative w-14 h-14 rounded-full flex items-center justify-center bg-purple-600'),
  friendName: 'text-white/80 text-xs font-medium truncate max-w-[60px]',
  emptyDayCard: 'bg-white/5 rounded-2xl p-6 text-center border border-white/10',
  emptyDayText: 'text-white/60 text-sm',
};

export const gymHistoryViewer = {
  overlayClassName: historyViewerOverlay,
  contentClassName: historyViewerContent,
  headerBar: historyViewerHeaderBar,
  closeButton: iconCircleButton('light'),
  imageArea: historyViewerImageArea,
  arrowButton: historyViewerArrowButton,
};
