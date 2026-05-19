import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getSupabaseClientConfig,
  getSupabaseServerConfig,
  isSupabaseConfigured,
  isServiceRoleConfigured,
  getSupabaseAdminConfig,
} from './supabase-env.js';

test('isSupabaseConfigured requires both public Supabase values', () => {
  assert.equal(isSupabaseConfigured({
    NEXT_PUBLIC_SUPABASE_URL: 'https://demo.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
  }), true);
  assert.equal(isSupabaseConfigured({
    NEXT_PUBLIC_SUPABASE_URL: 'https://demo.supabase.co',
  }), false);
});

test('client config returns a local placeholder when Supabase env is missing', () => {
  assert.deepEqual(
    getSupabaseClientConfig({}),
    {
      url: 'http://127.0.0.1:54321',
      anonKey: 'local-demo-anon-key',
      configured: false,
    },
  );
});

test('server config exposes whether real Supabase is configured', () => {
  assert.equal(getSupabaseServerConfig({}).configured, false);
  assert.equal(getSupabaseServerConfig({
    NEXT_PUBLIC_SUPABASE_URL: 'https://demo.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
  }).configured, true);
});

test('isServiceRoleConfigured requires service role key and public keys', () => {
  assert.equal(isServiceRoleConfigured({}), false);
  assert.equal(isServiceRoleConfigured({
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-secret',
  }), false, 'service role key alone is not enough');
  assert.equal(isServiceRoleConfigured({
    NEXT_PUBLIC_SUPABASE_URL: 'https://demo.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-secret',
  }), true);
});

test('getSupabaseAdminConfig returns null serviceRoleKey when not configured', () => {
  const config = getSupabaseAdminConfig({});
  assert.equal(config.adminConfigured, false);
  assert.equal(config.serviceRoleKey, null);
});

test('getSupabaseAdminConfig returns serviceRoleKey when all env vars present', () => {
  const config = getSupabaseAdminConfig({
    NEXT_PUBLIC_SUPABASE_URL: 'https://demo.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-secret',
  });
  assert.equal(config.adminConfigured, true);
  assert.equal(config.serviceRoleKey, 'service-role-secret');
  assert.equal(config.url, 'https://demo.supabase.co');
});
