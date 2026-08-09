'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { compressImage } from '@/lib/image';
import { progressPhotoSlot as styles } from './styles';

interface ProgressPhotoSlotProps {
  photoUrl: string | null;
  uploading: boolean;
  onUpload: (file: Blob) => void;
  onDelete: () => void;
}

export default function ProgressPhotoSlot({ photoUrl, uploading, onUpload, onDelete }: ProgressPhotoSlotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [trackedPhotoUrl, setTrackedPhotoUrl] = useState(photoUrl);

  // Reset the loading spinner when the photo changes (retake) — adjusting
  // state during render, per React's guidance, instead of an effect.
  if (photoUrl !== trackedPhotoUrl) {
    setTrackedPhotoUrl(photoUrl);
    setImageLoading(true);
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    onUpload(compressed);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <div className={styles.box}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {photoUrl ? (
        <>
          {imageLoading && (
            <div className={styles.loadingOverlay}>
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
          <Image
            src={photoUrl}
            alt="Foto de progreso"
            fill
            sizes="(min-width: 1024px) 400px, 100vw"
            className={styles.photoImage(imageLoading)}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          <div className={styles.actionsRow}>
            <Button onClick={triggerFileInput} disabled={uploading} className={styles.retakeButton}>
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
              Cambiar
            </Button>
            <Button onClick={onDelete} disabled={uploading} className={styles.deleteButton}>
              <Trash2 className="w-4 h-4 text-white" />
            </Button>
          </div>
        </>
      ) : (
        <Button onClick={triggerFileInput} disabled={uploading} className={styles.emptyButton}>
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <>
              <Camera className={styles.emptyIcon} />
              <Text size="sm" weight="semibold" color="muted">Foto del día pendiente</Text>
              <Text size="xs" color="muted">Toca para subir</Text>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
