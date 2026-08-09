'use client';

import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Camera, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { compressImage } from '@/lib/image';
import { EntryData } from '@/types';

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
      <div className="flex flex-col items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          onClick={triggerFileInput}
          disabled={isUploading}
          className="relative bg-[#7f0df2] rounded-full size-[68px] flex items-center justify-center shadow-[0px_0px_0px_5px_#191022,0px_12px_20px_-4px_rgba(127,13,242,0.5),0px_6px_8px_-4px_rgba(127,13,242,0.4)] active:scale-95 transition-transform"
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </Button>
        {error && (
          <p className="text-red-400 text-[10px] mt-1 text-center max-w-[80px]">{error}</p>
        )}
      </div>
    );
  }

  // Retake FAB variant (round purple button overlaid on the photo card)
  if (variant === 'retake-fab') {
    return (
      <div className="flex flex-col items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          onClick={triggerFileInput}
          disabled={isUploading}
          className="bg-[#7f0df2] rounded-full size-14 flex items-center justify-center shadow-[0px_4px_24px_rgba(127,13,242,0.5)] active:scale-95 transition-transform"
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
      <div className="w-full flex flex-col">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          onClick={triggerFileInput}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-2 bg-white py-4 rounded-3xl font-bold text-[#7f0df2] text-base shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] active:scale-[0.98] transition-transform"
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
          <div className="mt-2 px-3 py-1.5 bg-red-500/20 border border-red-500/40 rounded-xl">
            <p className="text-red-200 text-xs">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Default loading spinner (original behavior)
  if (isUploading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-white/30 border-t-white animate-spin"
               style={{ animationDuration: '1.5s' }} />
        </div>
        <p className="text-white/80 mt-4 font-medium">Subiendo foto...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {isRetake ? (
        <Button
          onClick={triggerFileInput}
          size="lg"
          className="rounded-full px-3 py-5 text-base font-bold gap-3
                     bg-gradient-to-r from-violet-500 to-purple-600
                     hover:from-violet-600 hover:to-purple-700
                     text-white shadow-xl shadow-purple-500/40
                     hover:scale-105 active:scale-95 transition-all"
        >
          <Camera className="w-5 h-5" />
          Retomar
        </Button>
      ) : (
        <Button
          onClick={triggerFileInput}
          className="group relative w-40 h-40
                   bg-gradient-to-br from-emerald-400 to-cyan-500
                   rounded-full shadow-2xl shadow-emerald-500/30
                   flex flex-col items-center justify-center gap-2
                   transition-all duration-300 hover:scale-110 active:scale-95
                   hover:shadow-emerald-500/50"
        >
          <Camera className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
          <span className="text-white font-bold text-lg">
            Tomar Foto
          </span>

          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
        </Button>
      )}

      {error && (
        <div className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-xl">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
});

export default PhotoUpload;
