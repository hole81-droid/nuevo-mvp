import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getSupabaseAdminConfig } from '@/lib/supabase-env';

export function createAdminClient() {
  const config = getSupabaseAdminConfig();
  if (!config.adminConfigured || !config.serviceRoleKey) return null;
  return createClient<Database>(config.url, config.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
