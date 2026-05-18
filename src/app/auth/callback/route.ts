import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildAuthCallbackFailureRedirect } from '@/lib/auth-callback-redirect';
import { safeNextPath } from '@/lib/safe-next-path';
import type { UserRow } from '@/lib/supabase/types';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = safeNextPath(requestUrl.searchParams.get('next'), '/');
  const redirectTo = new URL(next, requestUrl.origin);
  const loginFailureRedirect = (reason: 'missing_code' | 'exchange_failed' | 'missing_user') =>
    new URL(buildAuthCallbackFailureRedirect({ next, reason }), requestUrl.origin);

  if (!code) {
    return NextResponse.redirect(loginFailureRedirect('missing_code'));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(loginFailureRedirect('exchange_failed'));
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(loginFailureRedirect('missing_user'));
  }

  const { data: profile }: { data: Pick<UserRow, 'handle' | 'display_name'> | null } = await supabase
    .from('users')
    .select('handle,display_name')
    .eq('id', user.id)
    .maybeSingle();

  const needsSetup = !profile || profile.handle.startsWith('user_') || !profile.display_name.trim();
  if (needsSetup && next !== '/setup') {
    return NextResponse.redirect(new URL(`/setup?next=${encodeURIComponent(next)}`, requestUrl.origin));
  }

  return NextResponse.redirect(redirectTo);
}
