/**
 * Decide when an embedded app should be mounted.
 *
 * Feed expansions should still mount immediately. Detail pages can defer the
 * iframe until a tap unless the request is an autoplay deep link.
 *
 * @param {{ autoplay: boolean, deferUntilStart: boolean, started: boolean }} options
 */
export function shouldMountInteractiveFrame({ autoplay, deferUntilStart, started }) {
  return autoplay || !deferUntilStart || started;
}

/**
 * @param {{ mounted: boolean, loaded: boolean }} options
 */
export function getInteractiveLoadState({ mounted, loaded }) {
  if (!mounted) {
    return { label: '탭해서 앱 실행', busy: false };
  }
  if (!loaded) {
    return { label: '앱 불러오는 중...', busy: true };
  }
  return { label: '앱 실행 중', busy: false };
}
