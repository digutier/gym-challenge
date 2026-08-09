'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import GymHistoryViewer from './GymHistoryViewer';
import { useGymHistory } from '@/hooks/useGymHistory';
import { formatShortDate } from '@/lib/date';
import {
  modalHeaderRow, modalHeaderTextWrap, modalCloseButton, modalEmptyState, gymHistoryModal as styles,
} from '@/components/styles/modals';

interface GymHistoryModalProps {
  onClose: () => void;
}

export default function GymHistoryModal({ onClose }: GymHistoryModalProps) {
  const { entries, loading } = useGymHistory();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const isEmpty = !loading && entries.length === 0;

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <div className={modalHeaderRow}>
            <div className={modalHeaderTextWrap}>
              <DialogTitle className="text-[#f1f5f9] text-lg font-bold">Historial de fotos</DialogTitle>
              <DialogDescription className="text-[#64748b] text-sm">
                {loading ? 'Cargando...' : isEmpty ? 'Aún no tienes fotos' : `${entries.length} día${entries.length > 1 ? 's' : ''} registrado${entries.length > 1 ? 's' : ''}`}
              </DialogDescription>
            </div>
            <Button onClick={onClose} className={modalCloseButton}>
              <X className="w-4 h-4 text-[#64748b]" />
            </Button>
          </div>

          {isEmpty ? (
            <div className={modalEmptyState}>
              <span className="text-5xl">📸</span>
              <div>
                <Text size="sm" weight="semibold">Sin fotos aún</Text>
                <Text size="xs" color="muted" className="mt-1 leading-relaxed">
                  Cuando registres tu primera ida al gym, aparecerá aquí.
                </Text>
              </div>
            </div>
          ) : (
            <div className={styles.scrollRow}>
              {loading
                ? [1, 2, 3].map((i) => <div key={i} className={styles.skeletonRow} />)
                : entries.map((entry, index) => (
                  <Button key={entry.date} onClick={() => setViewerIndex(index)} className={styles.thumbButton}>
                    <Image
                      src={entry.photoUrl}
                      alt={`Foto del gym del ${entry.date}`}
                      fill
                      sizes="80px"
                      className={styles.thumbImage}
                    />
                    <div className={styles.thumbDateBadge}>{formatShortDate(entry.date)}</div>
                  </Button>
                ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {viewerIndex !== null && (
        <GymHistoryViewer
          entries={entries}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
        />
      )}
    </>
  );
}
