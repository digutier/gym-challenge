'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDate, formatTimeChile } from '@/lib/date';
import { GymHistoryEntry } from '@/types';
import { gymHistoryViewer as styles } from '@/components/styles/photo-viewer';

interface GymHistoryViewerProps {
  entries: GymHistoryEntry[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const SWIPE_THRESHOLD = 50;

export default function GymHistoryViewer({ entries, index, onClose, onNavigate }: GymHistoryViewerProps) {
  const touchStartX = useRef<number | null>(null);
  const entry = entries[index];
  const hasPrev = index > 0;
  const hasNext = index < entries.length - 1;

  if (!entry) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (deltaX > SWIPE_THRESHOLD && hasPrev) onNavigate(index - 1);
    else if (deltaX < -SWIPE_THRESHOLD && hasNext) onNavigate(index + 1);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent overlayClassName={styles.overlayClassName} className={styles.contentClassName}>
        <div className={styles.headerBar}>
          <div>
            <DialogTitle className="text-white font-bold text-sm capitalize">
              {formatDate(entry.date)}
            </DialogTitle>
            <p className="text-white/60 text-xs">{formatTimeChile(entry.timestamp)} hrs</p>
          </div>
          <Button onClick={onClose} className={styles.closeButton}>
            <X className="w-4 h-4 text-white" />
          </Button>
        </div>

        <div className={styles.imageArea} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <Image
            src={entry.photoUrl}
            alt={`Foto del gym del ${entry.date}`}
            fill
            sizes="100vw"
            className="object-contain"
          />
          {hasPrev && (
            <Button onClick={() => onNavigate(index - 1)} className={styles.arrowButton('left')}>
              <ChevronLeft className="w-5 h-5 text-white" />
            </Button>
          )}
          {hasNext && (
            <Button onClick={() => onNavigate(index + 1)} className={styles.arrowButton('right')}>
              <ChevronRight className="w-5 h-5 text-white" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
