import { getServiceSupabase } from '@/lib/supabase';
import { PROGRESS_STORAGE_BUCKET, BODY_PARTS, BodyPart } from '@/lib/constants';
import { ProgressEntry, ProgressPhotos } from '@/types';

const SIGNED_URL_EXPIRES_IN = 3600;

export function isBodyPart(value: unknown): value is BodyPart {
  return typeof value === 'string' && (BODY_PARTS as readonly string[]).includes(value);
}

type ProgressEntryRow = Record<string, string | number | null> | null;

/**
 * Builds a client-facing ProgressEntry from a raw progress_entries row,
 * signing each stored photo path fresh (bucket is private — see
 * supabase/progress_entries.sql).
 */
export async function toProgressEntry(
  serviceSupabase: ReturnType<typeof getServiceSupabase>,
  date: string,
  row: ProgressEntryRow
): Promise<ProgressEntry> {
  const photos: ProgressPhotos = { back: null, front: null, arms: null, legs: null };

  if (row) {
    await Promise.all(
      BODY_PARTS.map(async (part: BodyPart) => {
        const path = row[`${part}_photo_path`];
        if (!path || typeof path !== 'string') return;
        const { data } = await serviceSupabase.storage
          .from(PROGRESS_STORAGE_BUCKET)
          .createSignedUrl(path, SIGNED_URL_EXPIRES_IN);
        photos[part] = data?.signedUrl ?? null;
      })
    );
  }

  return {
    date,
    photos,
    note: (row?.note as string | null) ?? null,
    weightKg: (row?.weight_kg as number | null) ?? null,
  };
}
