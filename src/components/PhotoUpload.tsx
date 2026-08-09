'use client';

import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Camera, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { compressImage } from '@/lib/image';
import { EntryData } from '@/types';
import { photoUpload as styles } from './PhotoUpload.styles';

interface PhotoUploadProps {
  onUploadComplete: (entryData?: EntryData) => void;
  isRetake?: boolean;
  variant?: 'default' | 'cta' | 'fab' | 'retake-fab';
  onBeforeOpen?: () => boolean;
}

export interface PhotoUploadHandle {
  open: () => void;
}

const PhotoUpload = forwardRef<PhotoUploadHandle, PhotoUploadProps>(function PhotoUpload(
  { onUploadComplete, isRetake = false, variant = 'default', onBeforeOpen },
  ref
) {
  // 'retake-fab' is treated the same as 'fab' but with a RotateCcw icon
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => fileInputRef.current?.click(),
  }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const compressedBlob = await compressImage(file);

      const formData = new FormData();
      formData.append('photo', compressedBlob, 'photo.jpg');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al subir foto');
      }

      const result = await response.json();
      if (result.entry) {
        onUploadComplete({
          date: result.entry.date,
          photo_url: result.entry.photo_url,
          timestamp: result.entry.updated_at || result.entry.created_at,
        });
      } else {
        onUploadComplete();
      }
    } catch (err) {
      console.error('Error uploading:', err);
      setError(err instanceof Error ? err.message : 'Error al subir la foto');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    if (onBeforeOpen && !onBeforeOpen()) return;
    fileInputRef.current?.click();
  };

  // FAB variant (bottom nav camera button)
  if (variant === 'fab') {
    return (
      <div className={styles.fabWrap}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className={styles.hiddenInput}
        />
        <Button
          onClick={triggerFileInput}
          disabled={isUploading}
          className={styles.fabButton}
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </Button>
        {error && (
          <p className={styles.fabError}>{error}</p>
        )}
      </div>
    );
  }

  // Retake FAB variant (round purple button overlaid on the photo card)
  if (variant === 'retake-fab') {
    return (
      <div className={styles.fabWrap}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className={styles.hiddenInput}
        />
        <Button
          onClick={triggerFileInput}
          disabled={isUploading}
          className={styles.retakeFabButton}
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <RotateCcw className="w-5 h-5 text-white" />
          )}
        </Button>
      </div>
    );
  }

  // CTA variant (hero card "Take Daily Photo" white button)
  if (variant === 'cta') {
    return (
      <div className={styles.ctaWrap}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className={styles.hiddenInput}
        />
        <Button
          onClick={triggerFileInput}
          disabled={isUploading}
          className={styles.ctaButton}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              Tomar foto del día
              <span className="text-[#7f0df2]">→</span>
            </>
          )}
        </Button>
        {error && (
          <div className={styles.ctaErrorBox}>
            <p className={styles.ctaErrorText}>{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Default loading spinner (original behavior)
  if (isUploading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loadingCircleWrap}>
          <div className={styles.loadingCircle}>
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
          <div className={styles.loadingRing}
               style={{ animationDuration: '1.5s' }} />
        </div>
        <p className={styles.loadingText}>Subiendo foto...</p>
      </div>
    );
  }

  return (
    <div className={styles.defaultWrap}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className={styles.hiddenInput}
      />

      {isRetake ? (
        <Button
          onClick={triggerFileInput}
          size="lg"
          className={styles.retakeButton}
        >
          <Camera className="w-5 h-5" />
          Retomar
        </Button>
      ) : (
        <Button
          onClick={triggerFileInput}
          className={styles.defaultButton}
        >
          <Camera className={styles.defaultIcon} />
          <span className={styles.defaultLabel}>
            Tomar Foto
          </span>

          <div className={styles.defaultPing} />
        </Button>
      )}

      {error && (
        <div className={styles.defaultErrorBox}>
          <p className={styles.defaultErrorText}>{error}</p>
        </div>
      )}
    </div>
  );
});

export default PhotoUpload;
