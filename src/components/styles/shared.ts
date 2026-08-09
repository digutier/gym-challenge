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
