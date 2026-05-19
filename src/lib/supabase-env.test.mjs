import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getSupabaseClientConfig,
  getSupabaseServerConfig,
  isSupabaseConfigured,
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
