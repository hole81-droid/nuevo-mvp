import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';
import { getSupabaseClientConfig } from '@/lib/supabase-env';

export function createClient() {
  const config = getSupabaseClientConfig();

  return createBrowserClient<Database>(
    config.url,
    config.anonKey,
  );
}
