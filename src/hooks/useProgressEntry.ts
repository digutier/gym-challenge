import { useState, useCallback, useEffect } from 'react';
import { ProgressEntry } from '@/types';
import { BodyPart } from '@/lib/constants';

const EMPTY_PHOTOS = { back: null, front: null, arms: null, legs: null };

export function useProgressEntry() {
  const [entry, setEntry] = useState<ProgressEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPart, setUploadingPart] = useState<BodyPart | null>(null);
  const [savingDetails, setSavingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/progress');
      if (res.ok) {
        const data = await res.json();
        setEntry(data.entry);
      }
    } catch (err) {
      console.error('Error fetching progress entry:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const uploadPhoto = useCallback(async (part: BodyPart, file: Blob) => {
    setUploadingPart(part);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('part', part);
      formData.append('photo', file, 'photo.jpg');

      const res = await fetch('/api/progress/photo', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al subir foto');
        return;
      }
      setEntry(data.entry);
    } catch (err) {
      console.error('Error uploading progress photo:', err);
      setError('Error de conexión');
    } finally {
      setUploadingPart(null);
    }
  }, []);

  const deletePhoto = useCallback(async (part: BodyPart) => {
    setUploadingPart(part);
    setError(null);
    try {
      const res = await fetch(`/api/progress/photo?part=${part}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al eliminar foto');
        return;
      }
      setEntry(data.entry);
    } catch (err) {
      console.error('Error deleting progress photo:', err);
      setError('Error de conexión');
    } finally {
      setUploadingPart(null);
    }
  }, []);

  const saveDetails = useCallback(async (note: string, weightKg: number | null) => {
    setSavingDetails(true);
    setError(null);
    try {
      const res = await fetch('/api/progress/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note || null, weightKg }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al guardar');
        return false;
      }
      setEntry(data.entry);
      return true;
    } catch (err) {
      console.error('Error saving progress details:', err);
      setError('Error de conexión');
      return false;
    } finally {
      setSavingDetails(false);
    }
  }, []);

  return {
    entry: entry ?? { date: '', photos: EMPTY_PHOTOS, note: null, weightKg: null },
    loading,
    uploadingPart,
    savingDetails,
    error,
    uploadPhoto,
    deletePhoto,
    saveDetails,
    refresh,
  };
}
