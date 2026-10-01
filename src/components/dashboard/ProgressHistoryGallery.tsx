import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { formatShortDate } from '@/lib/date';
import { ProgressEntry } from '@/types';
import { BodyPart, BODY_PART_LABELS } from '@/lib/constants';
import { progressHistoryGallery as styles } from './styles';

interface ProgressHistoryGalleryProps {
  entries: ProgressEntry[];
  part: BodyPart;
  loading: boolean;
  onSelect: (index: number) => void;
}

export default function ProgressHistoryGallery({ entries, part, loading, onSelect }: ProgressHistoryGalleryProps) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.skeletonCell} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Text size="xs" color="muted">
        Aún no tienes fotos de {BODY_PART_LABELS[part].toLowerCase()} anteriores.
      </Text>
    );
  }

  return (
    <div className={styles.grid}>
      {entries.map((entry, index) => (
        <Button key={entry.date} onClick={() => onSelect(index)} className={styles.thumbButton}>
          <Image
            src={entry.photos[part]!}
            alt={`Foto de ${BODY_PART_LABELS[part].toLowerCase()} del ${entry.date}`}
            fill
            sizes="(min-width: 1024px) 100px, 25vw"
            className={styles.thumbImage}
          />
          <div className={styles.thumbDateBadge}>{formatShortDate(entry.date)}</div>
        </Button>
      ))}
    </div>
  );
}
