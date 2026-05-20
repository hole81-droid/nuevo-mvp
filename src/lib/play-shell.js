/**
 * Play Shell — YouTube Shorts / Instagram Reels-style full-screen app experience.
 *
 * Architecture: fixed inset-0 overlay with two safe zones outside the iframe bounds.
 * The iframe owns 100% of the touch/scroll area; safe zones are never inside the iframe.
 *
 * State machine:
 *   loading  — iframe mounting; show spinner + 건너뛰기 button
 *   playing  — iframe loaded; show ♡좋아요 / ✓완료 / ↑다음앱
 *   done     — user tapped 완료; slide-up panel with reactions + actions + next CTA
 */

export const PLAY_STATE = /** @type {const} */ ({
  LOADING: 'loading',
  PLAYING: 'playing',
  DONE: 'done',
});

/** Height of the top overlay in pixels. */
export const PLAY_TOP_HEIGHT = 54;

/** Height of the bottom safe zone in pixels (excl. safe-area-inset-bottom). */
export const PLAY_BOTTOM_HEIGHT = 64;

/** Top overlay: back button + app title. Always visible, sits above iframe. */
export const PLAY_TOP_CLASS =
  'absolute top-0 inset-x-0 z-20 flex items-center gap-2 px-3 bg-gradient-to-b from-black/75 to-transparent';

/** Bottom safe zone: action buttons. Always visible, sits below iframe. */
export const PLAY_BOTTOM_CLASS =
  'absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/80 to-transparent pb-[env(safe-area-inset-bottom,0px)]';

/** Slide-up done panel that replaces the bottom bar when state === done. */
export const PLAY_DONE_PANEL_CLASS =
  'absolute bottom-0 inset-x-0 z-20 rounded-t-[28px] bg-[#F8F8F3] px-5 pt-5 pb-[calc(24px+env(safe-area-inset-bottom,0px))] shadow-[0_-20px_40px_rgba(0,0,0,0.35)]';

/**
 * Returns the path for the next app in the Play Shell.
 * @param {string} postId
 * @param {{ source?: string }} [opts]
 */
export function buildPlayShellPath(postId, opts = {}) {
  const params = new URLSearchParams({ autoplay: 'true' });
  if (opts.source) params.set('source', opts.source);
  return `/play/${postId}?${params.toString()}`;
}
