'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import ProgressPhotoSlot from './ProgressPhotoSlot';
import ProgressHistoryGallery from './ProgressHistoryGallery';
import ProgressHistoryViewer from './ProgressHistoryViewer';
import { useProgressEntry } from '@/hooks/useProgressEntry';
import { useProgressHistory } from '@/hooks/useProgressHistory';
import { BODY_PARTS, BODY_PART_LABELS, BodyPart, PROGRESS_NOTE_MAX_LENGTH } from '@/lib/constants';
import { progressTab as styles } from './styles';

export default function ProgressTab() {
  const { entry, loading, uploadingPart, savingDetails, error, uploadPhoto, deletePhoto, saveDetails } = useProgressEntry();
  const { entries: historyEntries, loading: historyLoading, refresh: refreshHistory } = useProgressHistory();
  const [selectedPart, setSelectedPart] = useState<BodyPart>(BODY_PARTS[0]);
  const [note, setNote] = useState('');
  const [weight, setWeight] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const handlePartChange = (value: string) => {
    setSelectedPart(value as BodyPart);
    setViewerIndex(null);
  };

  const handleUploadPhoto = async (file: Blob) => {
    await uploadPhoto(selectedPart, file);
    refreshHistory();
  };

  const handleDeletePhoto = async () => {
    await deletePhoto(selectedPart);
    refreshHistory();
  };

  const partHistoryEntries = historyEntries.filter((e) => e.photos[selectedPart]);

  // Sync local drafts once the entry loads from the server. Guarded on
  // `loading` (not `entry`) so it only runs once per fetch, not on every
  // photo upload response that also refreshes `entry`.
  useEffect(() => {
    if (!loading) {
      setNote(entry.note ?? '');
      setWeight(entry.weightKg != null ? String(entry.weightKg) : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const overLimit = note.length > PROGRESS_NOTE_MAX_LENGTH;

  const handleSave = async () => {
    const weightKg = weight.trim() === '' ? null : Number(weight);
    const ok = await saveDetails(note, weightKg);
    if (ok) {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    }
  };

  return (
    <div className={styles.root}>
      <Tabs value={selectedPart} onValueChange={handlePartChange}>
        <TabsList className={styles.partTabsList}>
          {BODY_PARTS.map((part) => (
            <TabsTrigger key={part} value={part} className={styles.partTabTrigger}>
              {BODY_PART_LABELS[part]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className={styles.photoSectionWrap}>
        <ProgressPhotoSlot
          key={selectedPart}
          photoUrl={entry.photos[selectedPart]}
          uploading={uploadingPart === selectedPart}
          onUpload={handleUploadPhoto}
          onDelete={handleDeletePhoto}
        />
      </div>

      <div className={styles.noteSection}>
        <div className={styles.noteLabelRow}>
          <Text as="label" size="11px" color="muted" weight="semibold" className="uppercase tracking-widest">
            Nota del día
          </Text>
          <Text as="span" size="10px" className={styles.noteCounter(overLimit)}>
            {note.length}/{PROGRESS_NOTE_MAX_LENGTH}
          </Text>
        </div>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={PROGRESS_NOTE_MAX_LENGTH}
          placeholder="Hoy hice piernas y estoy pumpeado..."
          className={styles.noteTextarea}
        />
      </div>

      <div className={styles.weightSection}>
        <Text as="label" size="11px" color="muted" weight="semibold" className="uppercase tracking-widest">
          Peso (opcional)
        </Text>
        <div className={styles.weightRow}>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.1}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="—"
            className={styles.weightInput}
          />
          <span className={styles.weightUnit}>kg</span>
        </div>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <Text size="xs" color="danger">{error}</Text>
        </div>
      )}

      <Button onClick={handleSave} disabled={savingDetails || overLimit} className={styles.saveButton}>
        {savingDetails ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
      </Button>

      {savedFlash && (
        <p className={styles.saveHint}>¡Guardado!</p>
      )}

      <div className={styles.historySection}>
        <Heading as="h3" size="lg">Historial</Heading>
        <ProgressHistoryGallery
          entries={partHistoryEntries}
          part={selectedPart}
          loading={historyLoading}
          onSelect={setViewerIndex}
        />
      </div>

      {viewerIndex !== null && (
        <ProgressHistoryViewer
          entries={partHistoryEntries}
          part={selectedPart}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onNavigate={setViewerIndex}
        />
      )}
    </div>
  );
}
