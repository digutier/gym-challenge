import { cn } from '@/lib/utils';
import { iconCircleButton } from '@/components/styles/shared';

export const serviceWorkerRegister = {
  toast: 'fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-[90%] w-auto animate-[slideUp_0.4s_ease-out]',
  textWrap: 'flex-1 min-w-0',
  title: 'font-semibold text-sm',
  subtitle: 'text-white/70 text-xs',
  updateButton: 'flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-lg flex-shrink-0',
  dismissButton: cn(iconCircleButton('light'), 'flex-shrink-0'),
};
