import { getServiceSupabase } from '@/lib/supabase';
import { PROGRESS_STORAGE_BUCKET, BODY_PARTS, BodyPart } from '@/lib/constants';
import { ProgressEntry, ProgressPhotos } from '@/types';

const SIGNED_URL_EXPIRES_IN = 3600;

export function isBodyPart(value: unknown): value is BodyPart {
  return typeof value === 'string' && (BODY_PARTS as readonly string[]).includes(value);
}

export type ProgressEntryRow = Record<string, string | number | null> | null;

/**
 * Signs every distinct photo path across a batch of rows in one round-trip
 * (Supabase's createSignedUrls, not N createSignedUrl calls) — matters once
 * the history route can pull up to ~240 paths (60 days × 4 body parts).
 */
async function buildSignedUrlMap(
  serviceSupabase: ReturnType<typeof getServiceSupabase>,
  rows: ProgressEntryRow[]
): Promise<Map<string, string>> {
  const paths = new Set<string>();
  rows.forEach((row) => {
    if (!row) return;
    BODY_PARTS.forEach((part) => {
      const path = row[`${part}_photo_path`];
      if (typeof path === 'string') paths.add(path);
    });
  });

  const map = new Map<string, string>();
  if (paths.size === 0) return map;

  const { data } = await serviceSupabase.storage
    .from(PROGRESS_STORAGE_BUCKET)
    .createSignedUrls(Array.from(paths), SIGNED_URL_EXPIRES_IN);

  data?.forEach((item) => {
    if (item.path && item.signedUrl && !item.error) map.set(item.path, item.signedUrl);
  });

  return map;
}

function rowToEntry(date: string, row: ProgressEntryRow, signedMap: Map<string, string>): ProgressEntry {
  const photos: ProgressPhotos = { back: null, front: null, arms: null, legs: null };

  if (row) {
    BODY_PARTS.forEach((part: BodyPart) => {
      const path = row[`${part}_photo_path`];
      if (typeof path === 'string') photos[part] = signedMap.get(path) ?? null;
    });
  }

  return {
    date,
    photos,
    note: (row?.note as string | null) ?? null,
    weightKg: (row?.weight_kg as number | null) ?? null,
  };
}

/** Builds a client-facing ProgressEntry for a single day (today's entry). */
export async function toProgressEntry(
  serviceSupabase: ReturnType<typeof getServiceSupabase>,
  date: string,
  row: ProgressEntryRow
): Promise<ProgressEntry> {
  const signedMap = await buildSignedUrlMap(serviceSupabase, [row]);
  return rowToEntry(date, row, signedMap);
}

/** Builds client-facing ProgressEntries for a batch of days (history view). */
export async function toProgressEntries(
  serviceSupabase: ReturnType<typeof getServiceSupabase>,
  rows: { date: string; row: ProgressEntryRow }[]
): Promise<ProgressEntry[]> {
  const signedMap = await buildSignedUrlMap(serviceSupabase, rows.map((r) => r.row));
  return rows.map(({ date, row }) => rowToEntry(date, row, signedMap));
}
