export function isSupabaseConfigured(env?: Record<string, string | undefined>): boolean;

export function getSupabaseClientConfig(env?: Record<string, string | undefined>): {
  url: string;
  anonKey: string;
  configured: boolean;
};

export function getSupabaseServerConfig(env?: Record<string, string | undefined>): {
  url: string;
  anonKey: string;
  configured: boolean;
};

export function isServiceRoleConfigured(env?: Record<string, string | undefined>): boolean;

export function getSupabaseAdminConfig(env?: Record<string, string | undefined>): {
  url: string;
  anonKey: string;
  configured: boolean;
  serviceRoleKey: string | null;
  adminConfigured: boolean;
};
