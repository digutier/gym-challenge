'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Loader2 } from 'lucide-react';
import { formatTimeChile } from '@/lib/date';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { storyViewer as styles } from '@/components/styles/photo-viewer';

interface StoryViewerProps {
  avatar: string;
  name: string;
  photoUrl: string;
  subtitle: string;
  timestamp?: string;
  avatarBgClassName?: string;
  zIndexClassName?: string;
  onClose: (e?: React.MouseEvent) => void;
}

export default function StoryViewer({
  avatar,
  name,
  photoUrl,
  subtitle,
  timestamp,
  avatarBgClassName = '!bg-[rgba(127,13,242,0.3)]',
  zIndexClassName = '!z-50',
  onClose,
}: StoryViewerProps) {
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (!imageLoading) {
      const t = setTimeout(() => onClose(), 5000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageLoading]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        overlayClassName={styles.overlayClassName(zIndexClassName)}
        className={styles.contentClassName(zIndexClassName)}
        onClick={onClose}
      >
        <div className={styles.headerBar}>
          <div className={styles.avatarCircle(avatarBgClassName)}>
            <span className="text-xl">{avatar}</span>
          </div>
          <div className={styles.nameWrap}>
            <DialogTitle className="text-white font-semibold text-sm">{name}</DialogTitle>
            <div className={styles.subtitleRow}>
              <p className={styles.subtitleText}>{subtitle}</p>
              {timestamp && (
                <span className={styles.timestampText}>{formatTimeChile(timestamp)}</span>
              )}
            </div>
          </div>
          <Button onClick={onClose} className={styles.closeButton}>
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        <div className={styles.progressTrack}>
          {!imageLoading && (
            <div className={styles.progressBar} style={{ animation: 'storyProgress 5s linear forwards' }} />
          )}
        </div>

        {imageLoading && (
          <div className={styles.loadingOverlay}>
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        )}

        <div className={styles.imageWrap} onClick={(e) => e.stopPropagation()}>
          <Image
            src={photoUrl}
            alt={`Foto de ${name}`}
            fill
            sizes="100vw"
            className={styles.image(imageLoading)}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
        </div>

        <p className={styles.tapToClose} onClick={onClose}>
          Toca para cerrar
        </p>
      </DialogContent>
    </Dialog>
  );
}
