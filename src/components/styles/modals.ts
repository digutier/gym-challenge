import { cn } from '@/lib/utils';
import {
  surfaceSubtleAlt, iconCircleButton, cancelButton, fieldInput, errorBox, successBox,
  photoThumbImage, photoThumbDateBadge,
} from '@/components/styles/shared';

// Shared across AddFriendModal / NotificationsModal / FriendsListModal header rows.
export const modalHeaderRow = 'flex items-center justify-between';
export const modalHeaderTextWrap = 'flex flex-col gap-0.5';
export const modalCloseButton = iconCircleButton('dark');
export const modalEmptyState = 'flex flex-col items-center gap-3 py-6 text-center';
export const modalRow = cn(surfaceSubtleAlt, 'flex items-center gap-3 p-4 rounded-2xl');
export const modalRowAvatar = 'text-2xl shrink-0 leading-none';
export const modalRowTextWrap = 'flex-1 min-w-0';

export const addFriendModal = {
  form: 'flex flex-col gap-3',
  fieldWrap: 'flex flex-col gap-1.5',
  emailInput: fieldInput,
  errorBox,
  successBox,
  buttonRow: 'flex gap-3 mt-1',
  cancelButton,
  submitButton: 'flex-1 py-3 rounded-2xl bg-[#7f0df2] text-white text-sm font-semibold shadow-[0px_4px_16px_rgba(127,13,242,0.4)] disabled:opacity-50 flex items-center justify-center gap-2',
};

export const notificationsModal = {
  actionsWrap: 'flex gap-2',
  acceptButton: 'flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white text-xs font-semibold rounded-xl active:scale-95 transition-transform',
  declineButton: 'px-3 py-2 border border-[rgba(255,255,255,0.1)] text-[#94a3b8] text-xs font-semibold rounded-xl active:scale-95 transition-transform',
};

export const friendsListModal = {
  listWrap: 'flex flex-col gap-3 max-h-80 overflow-y-auto',
  removeButton: 'shrink-0 w-8 h-8 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center active:scale-95 transition-transform',
  confirmButtonRow: 'flex gap-3 mt-1',
  confirmCancelButton: cn(cancelButton, 'disabled:opacity-50'),
  confirmDeleteButton: 'flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-semibold shadow-[0px_4px_16px_rgba(239,68,68,0.4)] disabled:opacity-50 flex items-center justify-center gap-2',
};

export const gymHistoryModal = {
  // Vertical-scrolling 4-column grid — unlike ProgressHistoryGallery's
  // horizontal strip, this modal has room to spare vertically, so a grid
  // makes far better use of the screen for a photo-heavy history.
  grid: 'grid grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto pr-1',
  thumbButton: 'relative aspect-square rounded-2xl overflow-hidden disabled:opacity-100',
  thumbImage: photoThumbImage,
  thumbDateBadge: photoThumbDateBadge,
  skeletonCell: 'aspect-square rounded-2xl bg-[rgba(255,255,255,0.03)] animate-pulse',
};
