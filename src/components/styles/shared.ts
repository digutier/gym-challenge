import { cn } from '@/lib/utils';

/**
 * Cross-cutting style fragments reused across 3+ components. Compose these
 * with cn() at the call site for context-specific padding/rounding/etc —
 * only the genuinely-repeated color/opacity values live here.
 */

// Translucent card/row surface — the dominant "list row" background across
// modals, ranking lists, and the week-grid container.
export const surfaceSubtle = 'bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]';

// Slightly brighter variant — used for standalone containers like the
// period-tabs wrapper in FeedTab.
export const surfaceSubtleAlt = 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]';

// Highlighted "this is me" row/tile background (accent-tinted).
export const surfaceAccent = 'bg-[rgba(127,13,242,0.15)] ring-1 ring-[rgba(127,13,242,0.4)]';

// Icon-in-a-circle button (close/back buttons). `bg` picks the two variants
// seen in the app: 'light' for white-on-photo contexts, 'dark' for the
// dark-chrome modal cards.
export function iconCircleButton(bg: 'light' | 'dark', size: 'sm' | 'md' = 'sm') {
  return cn(
    'rounded-full flex items-center justify-center transition-colors',
    size === 'sm' ? 'w-8 h-8' : 'w-10 h-10',
    bg === 'light' ? 'bg-white/10 hover:bg-white/20' : 'bg-[rgba(255,255,255,0.06)]'
  );
}

// "Has today's photo" emerald ring — the base fragment only; call sites
// append their own ring-offset/cursor/pointer-events since those genuinely
// differ (clickable avatar vs decorative overlay ring).
export const ringToday = 'ring-[3px] ring-emerald-400';

// Bordered, transparent "Cancelar"-style button — identical across every
// confirm dialog in the app.
export const cancelButton = 'flex-1 py-3 rounded-2xl border border-[rgba(255,255,255,0.1)] text-[#94a3b8] text-sm font-semibold';

// Pill-style Tabs selector (period toggle in FeedTab, body-part toggle in
// ProgressTab) — same look, different item counts.
export const pillTabsList = 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-1 gap-1';
export const pillTabTrigger = 'flex-1 py-2 rounded-xl text-xs font-bold transition-all text-[#64748b] data-[state=active]:bg-[#7f0df2] data-[state=active]:text-white data-[state=active]:shadow-[0px_2px_8px_rgba(127,13,242,0.4)]';

// Dark-themed form field (input/textarea) — the app's one non-AuthScreen
// text-entry look, reused by AddFriendModal's email field and ProgressTab's
// note/weight fields.
export const fieldInput = 'w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-2xl text-[#f1f5f9] placeholder:text-[#334155] outline-none focus:border-[#7f0df2] focus:ring-1 focus:ring-[#7f0df2] transition-all text-sm';

// Inline error/success message boxes — identical across every form in the app.
export const errorBox = 'px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-2xl';
export const successBox = 'px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl';

// Square thumbnail image/badge — shared by every photo history gallery,
// regardless of whether the container is a horizontal strip or a grid.
export const photoThumbImage = 'object-cover';
export const photoThumbDateBadge = 'absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[9px] font-semibold text-center py-1';

// Square thumbnail in a wrapping grid (GymHistoryModal's fixed 4-column
// grid, ProgressHistoryGallery's flexible auto-fill grid) — aspect-square
// sizes itself off the grid track instead of a fixed w/h, so it works
// whether the column count is fixed or responsive.
export const photoGridThumbButton = 'relative aspect-square rounded-2xl overflow-hidden disabled:opacity-100';
export const photoGridSkeletonCell = 'aspect-square rounded-2xl bg-[rgba(255,255,255,0.03)] animate-pulse';

// Full-screen swipeable "browse history" viewer chrome — shared by the
// progress-photo and gym-photo history viewers. StoryViewer/PastDayModal
// keep their own established chrome since they predate this and have
// slightly different needs (auto-dismiss, friend list, etc).
export const historyViewerOverlay = '!bg-black/95 !backdrop-blur-none !z-50';
export const historyViewerContent = 'fixed inset-0 top-0 left-0 translate-x-0 translate-y-0 w-full max-w-none !z-50 rounded-none border-0 bg-transparent p-0 shadow-none flex flex-col';
export const historyViewerHeaderBar = 'absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent z-20';
export const historyViewerImageArea = 'relative flex-1 bg-black';
export function historyViewerArrowButton(side: 'left' | 'right') {
  return cn('absolute top-1/2 -translate-y-1/2 z-20', side === 'left' ? 'left-3' : 'right-3', iconCircleButton('light'));
}
