const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321';
const LOCAL_SUPABASE_ANON_KEY = 'local-demo-anon-key';

export function isSupabaseConfigured(env = process.env) {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseClientConfig(env = process.env) {
  const configured = isSupabaseConfigured(env);
  return {
    url: configured ? env.NEXT_PUBLIC_SUPABASE_URL : LOCAL_SUPABASE_URL,
    anonKey: configured ? env.NEXT_PUBLIC_SUPABASE_ANON_KEY : LOCAL_SUPABASE_ANON_KEY,
    configured,
  };
}

export function getSupabaseServerConfig(env = process.env) {
  return getSupabaseClientConfig(env);
}

export function isServiceRoleConfigured(env = process.env) {
  return Boolean(env.SUPABASE_SERVICE_ROLE_KEY && isSupabaseConfigured(env));
}

export function getSupabaseAdminConfig(env = process.env) {
  return {
    ...getSupabaseServerConfig(env),
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY ?? null,
    adminConfigured: isServiceRoleConfigured(env),
  };
}
