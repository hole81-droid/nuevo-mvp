import type { TrafficSource } from './traffic-source';

export type PlayModeEventName =
  | 'internal_play_start'
  | 'next_app_reveal'
  | 'next_app_click';

export type PlayEntrySource = 'external' | 'feed' | 'next_app';

export type PlayModeEventPayload = {
  event_name: PlayModeEventName | string;
  post_id: string;
  from_post_id: string;
  play_entry: PlayEntrySource;
  traffic_source: TrafficSource;
};

export function buildPlayModeEventPayload(options?: {
  eventName?: PlayModeEventName | string;
  postId?: string;
  fromPostId?: string;
  search?: string;
  referrer?: string;
}): PlayModeEventPayload;

export function recordPlayModeEvent(
  payload: PlayModeEventPayload,
  browserWindow?: Window,
): void;

export function getStoredPlayModeEvents(
  browserWindow?: Window,
): PlayModeEventPayload[];
