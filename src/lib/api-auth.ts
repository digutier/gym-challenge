import { NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';
import { createServerSupabaseClient } from './supabase-server';

type ServerSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export type AuthResult = { userId: string } | { error: NextResponse };
export type AuthUserResult = { user: User } | { error: NextResponse };
export type AuthClientResult = { userId: string; supabase: ServerSupabaseClient } | { error: NextResponse };

/**
 * Hard auth: requires a valid Supabase session, returns a ready-to-return
 * 401 NextResponse if there isn't one.
 */
export async function requireAuth(): Promise<AuthResult> {
  const authSupabase = await createServerSupabaseClient();
  const { data: { session } } = await authSupabase.auth.getSession();

  if (!session) {
    return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) };
  }

  return { userId: session.user.id };
}

/**
 * Hard auth variant that returns the full Supabase user object (email,
 * user_metadata, etc.) for routes that need more than just the id.
 */
export async function requireAuthUser(): Promise<AuthUserResult> {
  const authSupabase = await createServerSupabaseClient();
  const { data: { session } } = await authSupabase.auth.getSession();

  if (!session) {
    return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) };
  }

  return { user: session.user };
}

/**
 * Hard auth variant that also returns the session-scoped Supabase client,
 * for routes that need to perform RLS-scoped queries as the current user
 * (not just the service-role client).
 */
export async function requireAuthClient(): Promise<AuthClientResult> {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) };
  }

  return { userId: session.user.id, supabase };
}

/**
 * Soft auth: returns the session's userId if present, otherwise null. Never 401s.
 */
export async function getOptionalUserId(): Promise<string | null> {
  const authSupabase = await createServerSupabaseClient();
  const { data: { session } } = await authSupabase.auth.getSession();
  return session?.user?.id ?? null;
}
