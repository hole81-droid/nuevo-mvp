import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from './types';
import { getSupabaseServerConfig } from '@/lib/supabase-env';

export async function createClient() {
  const cookieStore = await cookies();
  const config = getSupabaseServerConfig();

  return createServerClient<Database>(
    config.url,
    config.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component에서는 쿠키 쓰기 불가 — middleware가 처리
          }
        },
      },
    },
  );
}
