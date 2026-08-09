'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Loader2 } from 'lucide-react';
import { formatTimeChile } from '@/lib/date';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
        overlayClassName={`!bg-black/95 !backdrop-blur-none ${zIndexClassName}`}
        className={`fixed inset-0 top-0 left-0 translate-x-0 translate-y-0 w-full max-w-none ${zIndexClassName} rounded-none border-0 bg-transparent p-0 shadow-none flex items-center justify-center`}
        onClick={onClose}
      >
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center gap-3 bg-gradient-to-b from-black/60 to-transparent z-10">
          <div className={`w-10 h-10 rounded-full ${avatarBgClassName} flex items-center justify-center ring-2 ring-white/30`}>
            <span className="text-xl">{avatar}</span>
          </div>
          <div className="flex-1">
            <DialogTitle className="text-white font-semibold text-sm">{name}</DialogTitle>
            <div className="flex items-center gap-2">
              <p className="text-white/60 text-xs capitalize">{subtitle}</p>
              {timestamp && (
                <span className="text-white/40 text-xs">{formatTimeChile(timestamp)}</span>
              )}
            </div>
          </div>
          <Button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </Button>
        </div>

        <div className="absolute top-2 left-4 right-4 h-0.5 bg-white/20 rounded-full z-10">
          {!imageLoading && (
            <div className="h-full bg-white rounded-full" style={{ animation: 'storyProgress 5s linear forwards' }} />
          )}
        </div>

        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        )}

        <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
          <Image
            src={photoUrl}
            alt={`Foto de ${name}`}
            fill
            sizes="100vw"
            className={`object-contain ${imageLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
        </div>

        <p className="absolute bottom-6 left-0 right-0 text-center text-white/40 text-xs" onClick={onClose}>
          Toca para cerrar
        </p>
      </DialogContent>
    </Dialog>
  );
}
