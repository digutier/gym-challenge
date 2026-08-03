import { NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';
import { createServerSupabaseClient } from './supabase-server';

type ServerSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export type AuthResult = { userId: string } | { error: NextResponse };
export type AuthUserResult = { user: User } | { error: NextResponse };
export type AuthClientResult = { userId: string; supabase: ServerSupabaseClient } | { error: NextResponse };

/**
 * Hard auth: requires a valid Supabase session, returns a ready-to-return
 * 401 NextResponse if there isn't one. Uses getUser() (not getSession()) so
 * the user claim is verified against the Supabase Auth server rather than
 * trusted from the cookie as-is.
 */
export async function requireAuth(): Promise<AuthResult> {
  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) };
  }

  return { userId: user.id };
}

/**
 * Hard auth variant that returns the full Supabase user object (email,
 * user_metadata, etc.) for routes that need more than just the id.
 */
export async function requireAuthUser(): Promise<AuthUserResult> {
  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) };
  }

  return { user };
}

/**
 * Hard auth variant that also returns the session-scoped Supabase client,
 * for routes that need to perform RLS-scoped queries as the current user
 * (not just the service-role client).
 */
export async function requireAuthClient(): Promise<AuthClientResult> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) };
  }

  return { userId: user.id, supabase };
}

/**
 * Soft auth: returns the userId if present, otherwise null. Never 401s.
 */
export async function getOptionalUserId(): Promise<string | null> {
  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();
  return user?.id ?? null;
}
