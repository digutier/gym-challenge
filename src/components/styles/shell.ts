import { cn } from '@/lib/utils';
import { cancelButton } from '@/components/styles/shared';

export const appRoot = 'min-h-screen bg-[#191022] flex';

export const sidebar = {
  root: 'hidden lg:flex flex-col w-[220px] min-h-screen fixed left-0 top-0 bottom-0 bg-[#110c1a] border-r border-[rgba(255,255,255,0.06)] z-20',
  logoRow: 'flex items-center gap-3 px-5 py-4 border-b border-[rgba(255,255,255,0.06)]',
  logoIcon: 'w-9 h-9 rounded-xl bg-gradient-to-br from-[#7f0df2] to-[#6366f1] flex items-center justify-center text-xl shrink-0',
  navList: 'flex flex-col gap-1 p-3 flex-1',
  navTrigger: (active: boolean) =>
    cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left',
      active ? 'bg-[rgba(127,13,242,0.15)] text-[#7f0df2]' : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-[rgba(255,255,255,0.04)]'
    ),
  navBadge: 'ml-auto bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0',
  userPillWrap: 'p-3 border-t border-[rgba(255,255,255,0.06)]',
  userPill: 'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)]',
  userAvatar: 'bg-[rgba(127,13,242,0.2)] border-2 border-[rgba(127,13,242,0.5)] rounded-full w-8 h-8 flex items-center justify-center text-base shrink-0',
  userTextWrap: 'flex-1 min-w-0',
};

export const mainArea = {
  root: 'flex-1 flex flex-col lg:ml-[220px]',
};

export const mobileTopNav = {
  root: 'lg:hidden backdrop-blur-[5px] bg-[rgba(25,16,34,0.8)] border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between px-4 py-[17px] sticky top-0 z-30',
  brandRow: 'flex items-center gap-3',
  avatar: 'bg-[rgba(127,13,242,0.2)] border-2 border-[rgba(127,13,242,0.5)] rounded-full size-10 flex items-center justify-center text-xl overflow-hidden',
};

export const desktopTopBar = {
  root: 'hidden lg:flex items-center gap-3 px-6 h-14 border-b border-[rgba(255,255,255,0.06)] sticky top-0 bg-[rgba(17,12,26,0.85)] backdrop-blur-[5px] z-10',
  weekBadge: 'bg-[rgba(127,13,242,0.12)] px-3 py-1 rounded-full tracking-wider uppercase',
  dateText: 'ml-auto capitalize',
};

export const main = {
  root: 'flex-1 overflow-y-auto pb-[90px] lg:pb-6 pt-4',
};

export const mobileBottomNav = {
  root: 'lg:hidden fixed bottom-0 left-0 right-0 h-[90px] backdrop-blur-[5px] bg-[rgba(25,16,34,0.9)] border-t border-[#1e293b] z-10',
  list: 'relative flex items-center justify-around h-full px-2',
  fabWrap: 'absolute left-1/2 -translate-x-1/2 -top-5 z-10',
  trigger: 'flex flex-col items-center gap-1 flex-1',
  icon: (active: boolean) => cn('w-[22px] h-[22px]', active ? 'text-[#7f0df2]' : 'text-[#64748b]'),
  label: 'text-center leading-tight',
  spacer: 'flex-1',
  profileIconWrap: 'relative',
  profileDot: 'absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full',
};

export const confirmDialogs = {
  buttonRow: 'flex gap-3',
  cancelButton,
  cancelButtonDisabled: cn(cancelButton, 'disabled:opacity-50'),
  deleteConfirmButton: 'flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-semibold shadow-[0px_4px_16px_rgba(239,68,68,0.4)] disabled:opacity-50 flex items-center justify-center gap-2',
  overwriteConfirmButton: 'flex-1 py-3 rounded-2xl bg-[#7f0df2] text-white text-sm font-semibold shadow-[0px_4px_16px_rgba(127,13,242,0.4)]',
};
