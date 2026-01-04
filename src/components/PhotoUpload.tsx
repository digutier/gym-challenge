'use client';

import { useRef, useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { compressImage } from '@/lib/utils';

interface PhotoUploadProps {
  token: string;
  onUploadComplete: () => void;
  isRetake?: boolean;
}

export default function PhotoUpload({ token, onUploadComplete, isRetake = false }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Comprimir imagen
      const compressedBlob = await compressImage(file);
      
      // Crear FormData
      const formData = new FormData();
      formData.append('photo', compressedBlob, 'photo.jpg');

      // Subir
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al subir foto');
      }

      onUploadComplete();
    } catch (err) {
      console.error('Error uploading:', err);
      setError(err instanceof Error ? err.message : 'Error al subir la foto');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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
        <button
          onClick={triggerFileInput}
          className="flex items-center gap-2 px-5 py-2.5 
                   bg-gradient-to-r from-violet-500 to-purple-600
                   hover:from-violet-600 hover:to-purple-700
                   rounded-xl shadow-md
                   text-white font-semibold text-sm
                   transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <Camera className="w-4 h-4" />
          Retomar Foto
        </button>
      ) : (
        <button
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
          
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
        </button>
      )}

      {!isRetake && (
        <button
          onClick={triggerFileInput}
          className="mt-6 flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm">o subir desde galería</span>
        </button>
      )}

      {error && (
        <div className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-xl">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

