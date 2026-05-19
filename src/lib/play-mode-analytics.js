import { buildTrafficSourcePayload } from './traffic-source.js';

const STORAGE_KEY = 'nuevo.playModeEvents';
const BROWSER_EVENT = 'nuevo:play-mode';
const PLAY_ENTRY_SOURCES = new Set(['feed', 'next_app']);

export function buildPlayModeEventPayload({
  eventName,
  postId,
  fromPostId = '',
  search = '',
  referrer = '',
} = {}) {
  const source = new URLSearchParams(String(search).replace(/^\?/, '')).get('utm_source') ?? '';
  return {
    event_name: String(eventName || ''),
    post_id: String(postId || ''),
    from_post_id: String(fromPostId || ''),
    play_entry: PLAY_ENTRY_SOURCES.has(source) ? source : 'external',
    traffic_source: buildTrafficSourcePayload({ search, referrer }).traffic_source,
  };
}

export function recordPlayModeEvent(payload, browserWindow = globalThis.window) {
  if (!browserWindow?.sessionStorage || !payload) return;

  const events = getStoredPlayModeEvents(browserWindow);
  browserWindow.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...events, payload].slice(-50)));

  if (typeof browserWindow.CustomEvent === 'function' && typeof browserWindow.dispatchEvent === 'function') {
    browserWindow.dispatchEvent(new browserWindow.CustomEvent(BROWSER_EVENT, { detail: payload }));
  }
}

export function getStoredPlayModeEvents(browserWindow = globalThis.window) {
  if (!browserWindow?.sessionStorage) return [];
  try {
    const parsed = JSON.parse(browserWindow.sessionStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
