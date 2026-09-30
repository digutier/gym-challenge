import { cn } from '@/lib/utils';
import {
  surfaceSubtle, ringToday, pillTabsList, pillTabTrigger, fieldInput, errorBox, iconCircleButton,
  photoThumbImage, photoThumbDateBadge, photoGridThumbButton, photoGridSkeletonCell,
  historyViewerOverlay, historyViewerContent, historyViewerHeaderBar, historyViewerImageArea, historyViewerArrowButton,
} from '@/components/styles/shared';

// ─── HomeTab ─────────────────────────────────────────────────────────────

export const homeTab = {
  root: 'flex flex-col lg:flex-row gap-0 lg:gap-6 lg:max-w-[1280px] lg:w-full lg:mx-auto lg:px-6 lg:py-2',
  leftColumn: 'flex flex-col gap-4 pb-6 flex-1 lg:pb-2 min-w-0',

  // Hero card (today's photo already uploaded)
  heroCard: 'relative overflow-hidden rounded-3xl mx-4 lg:mx-0 lg:h-[500px] shadow-[0px_20px_25px_-5px_rgba(127,13,242,0.35)] bg-black',
  heroImage: (isHorizontal: boolean) =>
    cn(
      'w-full lg:absolute lg:inset-0 lg:h-full lg:w-full lg:object-contain',
      isHorizontal ? 'max-h-64 object-contain' : 'aspect-[3/4] object-cover'
    ),
  deleteFab: 'absolute top-4 left-4 z-10 rounded-full size-10 flex items-center justify-center bg-black/60 backdrop-blur-md active:scale-95 transition-transform',
  uploadedBadge: 'absolute top-4 right-2 flex items-center gap-2 bg-black/75 backdrop-blur-md px-4 py-2 rounded-full z-10',
  uploadedBadgeIcon: 'bg-[#7f0df2] rounded-full size-5 flex items-center justify-center shrink-0',
  uploadedBadgeText: 'text-white text-xs font-bold tracking-widest uppercase whitespace-nowrap',
  heroBottomOverlay: 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent px-5 pt-20 pb-5 flex items-end justify-between gap-4',
  heroBottomTextWrap: 'flex-1 min-w-0',
  heroTitle: 'text-white text-3xl font-black italic leading-tight uppercase',
  heroMotivationRow: 'flex items-center gap-2 mt-2',
  heroMotivationIcon: 'w-5 h-5 text-[#7f0df2] fill-[#7f0df2] shrink-0',
  heroMotivationText: 'text-white/90 text-base font-semibold',
  changePhotoButton: 'hidden lg:flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-semibold px-4 py-2.5 rounded-2xl hover:bg-white/25 active:scale-95 transition-all shrink-0',

  // CTA card (no photo yet today)
  ctaCard: 'mx-4 lg:mx-0 relative overflow-hidden flex flex-col gap-4 items-start p-6 rounded-3xl shadow-[0px_20px_25px_-5px_rgba(127,13,242,0.2),0px_8px_10px_-6px_rgba(127,13,242,0.2)]',
  ctaCardBackground: { background: 'linear-gradient(151deg, rgb(127,13,242) 0%, rgba(127,13,242,0.8) 50%, rgb(79,70,229) 100%)' },
  ctaGlow: 'absolute bg-white/10 blur-[32px] -right-12 -top-12 rounded-full size-48 pointer-events-none',
  ctaHeaderRow: 'flex items-start justify-between w-full relative',
  ctaTextWrap: 'flex flex-col gap-1 flex-1 pr-4',
  ctaTitle: 'text-white text-2xl font-bold leading-tight',
  ctaSubtitle: 'text-white/80 text-sm leading-5',
  ctaIconWrap: 'w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0',
  ctaButtonWrap: 'w-full relative',

  // Week section
  weekSection: 'flex flex-col gap-4 px-4 lg:px-0 pt-2',
  weekHeaderRow: 'flex items-center justify-between',
  weekGridContainer: cn(surfaceSubtle, 'backdrop-blur-[5px] flex items-center justify-between px-4 py-4 rounded-3xl'),
  weekGridSkeleton: cn(surfaceSubtle, 'backdrop-blur-[5px] rounded-3xl h-20 animate-pulse'),
  dayButton: 'flex flex-col items-center gap-2 disabled:opacity-100',
  dayCircleFuture: 'border-2 border-dashed border-[#334155] rounded-full size-9',
  dayCircleTodayDone: 'relative bg-[#7f0df2] rounded-full size-9 flex items-center justify-center shadow-[0px_0px_0px_4px_rgba(127,13,242,0.2)]',
  dayCirclePastDone: 'bg-[rgba(127,13,242,0.2)] rounded-full size-9 flex items-center justify-center',
  dayCircleMissed: 'bg-[#1e293b] rounded-full size-9 flex items-center justify-center',
  weekNavRow: 'flex items-center justify-between -mt-1',
  weekNavButton: (enabled: boolean) =>
    cn(
      'flex items-center gap-1 text-xs transition-colors disabled:opacity-100',
      enabled ? 'text-[#94a3b8] hover:text-[#f1f5f9]' : 'text-[#334155] cursor-not-allowed'
    ),

  rankingSectionMobile: 'lg:hidden flex flex-col gap-4 px-4',
  rankingSectionDesktop: 'hidden lg:flex flex-col gap-4 w-[280px] shrink-0 pb-6',
  rankingHeaderWrap: 'flex flex-col gap-2',
  gymHistoryButton: 'flex items-center gap-1.5 self-start text-xs font-semibold text-[#94a3b8] hover:text-[#f1f5f9] transition-colors',
};

// ─── ProgressTab ─────────────────────────────────────────────────────────

export const progressTab = {
  root: 'flex flex-col gap-5 px-4 pb-6 pt-4 lg:max-w-[640px] lg:mx-auto lg:w-full lg:px-6',
  partTabsList: pillTabsList,
  partTabTrigger: pillTabTrigger,
  photoSectionWrap: 'flex flex-col gap-3',
  noteSection: 'flex flex-col gap-2',
  noteLabelRow: 'flex items-center justify-between',
  noteCounter: (overLimit: boolean) => (overLimit ? 'text-red-400' : 'text-[#64748b]'),
  noteTextarea: cn(fieldInput, 'min-h-[100px]'),
  weightSection: 'flex flex-col gap-2',
  weightRow: 'flex items-center gap-3',
  weightInput: cn(fieldInput, 'w-28'),
  weightUnit: 'text-sm text-[#64748b] font-semibold',
  saveButton: 'w-full py-3 rounded-2xl bg-[#7f0df2] text-white text-sm font-semibold shadow-[0px_4px_16px_rgba(127,13,242,0.4)] disabled:opacity-50 flex items-center justify-center gap-2',
  saveHint: 'text-xs text-emerald-400 text-center',
  errorBox,
  historySection: 'flex flex-col gap-3 pt-2',
};

export const progressPhotoSlot = {
  box: 'relative aspect-[3/4] rounded-3xl overflow-hidden bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]',
  emptyButton: 'w-full h-full flex flex-col items-center justify-center gap-2 text-[#64748b] disabled:opacity-100',
  emptyIcon: 'w-8 h-8',
  loadingOverlay: 'absolute inset-0 flex items-center justify-center bg-black/40 z-10',
  photoImage: (loading: boolean) => cn('object-cover', loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'),
  actionsRow: 'absolute bottom-0 left-0 right-0 flex items-center gap-2 p-3 bg-gradient-to-t from-black/70 to-transparent',
  retakeButton: 'flex-1 flex items-center justify-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-semibold py-2 rounded-xl active:scale-95 transition-all disabled:opacity-50',
  deleteButton: 'w-9 h-9 rounded-xl bg-red-500/80 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all disabled:opacity-50',
};

export const progressHistoryGallery = {
  // Flexible-column wrapping grid instead of a horizontal scroll strip —
  // a flex row here forced the whole page to scroll horizontally past ~4
  // thumbnails (flex children ignore their container's overflow-x-auto
  // without min-width:0 threaded through every ancestor; a grid with 1fr
  // tracks can't do that, it wraps instead). Column count is responsive
  // to viewport width (auto-fill), not a fixed number per row.
  grid: 'grid gap-2 grid-cols-[repeat(auto-fill,minmax(72px,1fr))]',
  thumbButton: photoGridThumbButton,
  thumbImage: photoThumbImage,
  thumbDateBadge: photoThumbDateBadge,
  skeletonCell: photoGridSkeletonCell,
};

export const progressHistoryViewer = {
  overlayClassName: historyViewerOverlay,
  contentClassName: historyViewerContent,
  headerBar: historyViewerHeaderBar,
  closeButton: iconCircleButton('light'),
  imageArea: historyViewerImageArea,
  arrowButton: historyViewerArrowButton,
  infoPanel: 'px-5 pt-4 pb-6 bg-black flex flex-col gap-3',
  infoWeightRow: 'flex items-center gap-2',
  infoWeightValue: 'text-white text-lg font-bold',
  infoWeightLabel: 'text-white/50 text-xs',
  infoNote: (hasNote: boolean) => cn('text-sm leading-relaxed', hasNote ? 'text-white/90' : 'text-white/40 italic'),
};

// ─── FeedTab ─────────────────────────────────────────────────────────────

export const feedTab = {
  root: 'flex flex-col gap-4 px-4 pb-6 pt-4 lg:max-w-[800px] lg:mx-auto lg:w-full lg:px-6',
  headerRow: 'flex items-center justify-between',
  titleRow: 'flex items-center gap-2',
  periodTabsList: pillTabsList,
  periodTabTrigger: pillTabTrigger,
  skeletonWrap: 'flex flex-col gap-3',
  skeletonRow: 'bg-[rgba(255,255,255,0.03)] rounded-3xl h-16 animate-pulse',
};

// ─── ProfileTab ──────────────────────────────────────────────────────────

export const profileTab = {
  root: 'flex flex-col gap-5 px-4 pb-6 pt-4 lg:max-w-[640px] lg:mx-auto lg:w-full lg:px-6',
  header: 'flex flex-col items-center gap-3 pt-4',
  avatar: 'bg-[rgba(127,13,242,0.2)] border-2 border-[rgba(127,13,242,0.5)] rounded-full size-20 flex items-center justify-center text-4xl',
  headerTextWrap: 'text-center',
  statsGrid: 'grid grid-cols-3 gap-3',
  statCard: 'backdrop-blur-[5px] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)] rounded-2xl py-3 gap-0 shadow-none text-center',
  statCardContent: 'px-3',
  menuList: 'flex flex-col gap-3',
  menuButton: cn(surfaceSubtle, 'backdrop-blur-[5px] flex items-center justify-start gap-3 p-4 rounded-2xl text-left'),
  menuButtonRelative: cn(surfaceSubtle, 'backdrop-blur-[5px] flex items-center justify-start gap-3 p-4 rounded-2xl text-left relative'),
  notificationBadge: 'ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0',
};

// ─── RankingList ─────────────────────────────────────────────────────────

export const rankingList = {
  skeletonWrap: 'flex flex-col gap-3',
  skeletonRow: cn(surfaceSubtle, 'rounded-3xl h-[74px] animate-pulse'),
  listWrap: 'flex flex-col gap-3',
  row: (isMe: boolean) =>
    cn(
      'backdrop-blur-[5px] flex items-center gap-3 p-[13px] rounded-3xl',
      isMe ? 'bg-[rgba(127,13,242,0.15)] ring-1 ring-[rgba(127,13,242,0.4)]' : surfaceSubtle
    ),
  rankIconWrap: 'w-7 flex items-center justify-center shrink-0 text-lg leading-none',
  avatarButton: (clickable: boolean) =>
    cn(
      'size-12 rounded-full flex items-center justify-center shrink-0 text-2xl bg-[rgba(127,13,242,0.15)] disabled:opacity-100',
      clickable && cn(ringToday, 'ring-offset-1 ring-offset-[#191022] cursor-pointer active:scale-95 transition-transform')
    ),
  nameTextWrap: 'flex-1 min-w-0',
  metricWrap: 'text-right shrink-0',
};
