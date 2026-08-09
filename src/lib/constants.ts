// Nombre del bucket de Supabase Storage
export const STORAGE_BUCKET = 'gym-photos';

// Bucket privado de fotos de progreso — nunca público, ver supabase/progress_entries.sql
export const PROGRESS_STORAGE_BUCKET = 'progress-photos';
export const PROGRESS_NOTE_MAX_LENGTH = 300;

export const BODY_PARTS = ['back', 'front', 'arms', 'legs'] as const;
export type BodyPart = typeof BODY_PARTS[number];
export const BODY_PART_LABELS: Record<BodyPart, string> = {
  back: 'Espalda',
  front: 'Frente',
  arms: 'Brazos',
  legs: 'Piernas',
};
