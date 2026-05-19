import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildPlayModeEventPayload,
  getStoredPlayModeEvents,
  recordPlayModeEvent,
} from './play-mode-analytics.js';

function createFakeWindow() {
  const events = {};
  const dispatched = [];
  const storage = new Map();
  return {
    CustomEvent: class CustomEvent {
      constructor(type, init = {}) {
        this.type = type;
        this.detail = init.detail;
      }
    },
    addEventListener(type, listener) {
      events[type] = [...(events[type] ?? []), listener];
    },
    dispatchEvent(event) {
      dispatched.push(event);
      for (const listener of events[event.type] ?? []) listener(event);
      return true;
    },
    sessionStorage: {
      getItem(key) {
        return storage.has(key) ? storage.get(key) : null;
      },
      setItem(key, value) {
        storage.set(key, value);
      },
    },
    dispatched,
  };
}

describe('play mode analytics', () => {
  it('builds an internal Browse Mode to Play Mode conversion payload', () => {
    assert.deepEqual(buildPlayModeEventPayload({
      eventName: 'internal_play_start',
      postId: '42',
      search: '?mode=play&autoplay=true&utm_source=feed',
      referrer: 'https://nuevo.app/',
    }), {
      event_name: 'internal_play_start',
      post_id: '42',
      from_post_id: '',
      play_entry: 'feed',
      traffic_source: 'direct',
    });
  });

  it('builds an external next-app reveal payload with source classification', () => {
    assert.deepEqual(buildPlayModeEventPayload({
      eventName: 'next_app_reveal',
      postId: 'next',
      fromPostId: 'current',
      search: '?autoplay=true&utm_source=instagram',
      referrer: '',
    }), {
      event_name: 'next_app_reveal',
      post_id: 'next',
      from_post_id: 'current',
      play_entry: 'external',
      traffic_source: 'instagram',
    });
  });

  it('records payloads in session storage and dispatches a browser event', () => {
    const fakeWindow = createFakeWindow();
    const seen = [];
    fakeWindow.addEventListener('nuevo:play-mode', (event) => seen.push(event.detail));

    const payload = buildPlayModeEventPayload({
      eventName: 'next_app_click',
      postId: '2',
      fromPostId: '1',
      search: '?mode=play&autoplay=true&utm_source=next_app',
      referrer: '',
    });

    recordPlayModeEvent(payload, fakeWindow);

    assert.deepEqual(seen, [payload]);
    assert.deepEqual(getStoredPlayModeEvents(fakeWindow), [payload]);
  });
});
