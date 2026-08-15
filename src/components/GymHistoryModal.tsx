'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import GymHistoryViewer from './GymHistoryViewer';
import { useGymHistory } from '@/hooks/useGymHistory';
import { formatShortDate, getMonthName } from '@/lib/date';
import { GymHistoryEntry, Friend } from '@/types';
import {
  modalHeaderRow, modalHeaderTextWrap, modalCloseButton, modalEmptyState, gymHistoryModal as styles,
} from '@/components/styles/modals';

interface GymHistoryModalProps {
  currentUserId: string;
  friends: Friend[];
  onClose: () => void;
}

interface MonthGroup {
  year: number;
  month: number;
  items: { entry: GymHistoryEntry; index: number }[];
}

// entries arrives newest-first, so each (year, month) run is contiguous —
// a single pass is enough, no need to bucket by key across the whole list.
function groupByMonth(entries: GymHistoryEntry[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  entries.forEach((entry, index) => {
    const d = new Date(entry.date + 'T12:00:00');
    const year = d.getFullYear();
    const month = d.getMonth();
    const last = groups[groups.length - 1];
    if (last && last.year === year && last.month === month) {
      last.items.push({ entry, index });
    } else {
      groups.push({ year, month, items: [{ entry, index }] });
    }
  });
  return groups;
}

export default function GymHistoryModal({ currentUserId, friends, onClose }: GymHistoryModalProps) {
  const [selectedUserId, setSelectedUserId] = useState(currentUserId);
  const { entries, loading } = useGymHistory(selectedUserId === currentUserId ? undefined : selectedUserId);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const isEmpty = !loading && entries.length === 0;
  const monthGroups = groupByMonth(entries);
  const isOwnHistory = selectedUserId === currentUserId;

  const handleUserChange = (value: string) => {
    setSelectedUserId(value);
    setViewerIndex(null);
  };

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <div className={modalHeaderRow}>
            <div className={modalHeaderTextWrap}>
              <DialogTitle className="text-[#f1f5f9] text-lg font-bold">Historial de idas al gym</DialogTitle>
              <DialogDescription className="text-[#64748b] text-sm">
                {loading ? 'Cargando...' : isEmpty ? 'Aún no hay fotos' : `${entries.length} día${entries.length > 1 ? 's' : ''} registrado${entries.length > 1 ? 's' : ''}`}
              </DialogDescription>
            </div>
            <Button onClick={onClose} className={modalCloseButton}>
              <X className="w-4 h-4 text-[#64748b]" />
            </Button>
          </div>

          {friends.length > 0 && (
            <Tabs value={selectedUserId} onValueChange={handleUserChange}>
              <TabsList className={styles.userTabsList}>
                <TabsTrigger value={currentUserId} className={styles.userTabTrigger}>Tú</TabsTrigger>
                {friends.map((friend) => (
                  <TabsTrigger key={friend.id} value={friend.id} className={styles.userTabTrigger}>
                    {friend.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {isEmpty ? (
            <div className={modalEmptyState}>
              <span className="text-5xl">📸</span>
              <div>
                <Text size="sm" weight="semibold">Sin fotos aún</Text>
                <Text size="xs" color="muted" className="mt-1 leading-relaxed">
                  {isOwnHistory
                    ? 'Cuando registres tu primera ida al gym, aparecerá aquí.'
                    : 'Cuando registre su primera ida al gym, aparecerá aquí.'}
                </Text>
              </div>
            </div>
          ) : loading ? (
            <div className={styles.grid}>
              {Array.from({ length: 8 }, (_, i) => <div key={i} className={styles.skeletonCell} />)}
            </div>
          ) : (
            <div className={styles.scrollWrap}>
              {monthGroups.map((group, i) => {
                const isNewYear = i === 0 || monthGroups[i - 1].year !== group.year;
                return (
                  <div key={`${group.year}-${group.month}`} className={styles.monthSectionWrap}>
                    {isNewYear && (
                      <Heading as="h4" size="xl" className={styles.yearHeading}>{group.year}</Heading>
                    )}
                    <div className={styles.monthHeaderRow}>
                      <Text size="xs" weight="semibold" color="muted" className="uppercase tracking-widest">
                        {getMonthName(group.month)}
                      </Text>
                      <Text size="xs" color="muted">
                        {group.items.length} foto{group.items.length > 1 ? 's' : ''}
                      </Text>
                    </div>
                    <div className={styles.grid}>
                      {group.items.map(({ entry, index }) => (
                        <Button key={entry.date} onClick={() => setViewerIndex(index)} className={styles.thumbButton}>
                          <Image
                            src={entry.photoUrl}
                            alt={`Foto del gym del ${entry.date}`}
                            fill
                            sizes="(min-width: 1024px) 100px, 25vw"
                            className={styles.thumbImage}
                          />
                          <div className={styles.thumbDateBadge}>{formatShortDate(entry.date)}</div>
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
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
