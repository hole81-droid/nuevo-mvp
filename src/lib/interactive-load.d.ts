export function shouldMountInteractiveFrame(options: {
  autoplay: boolean;
  deferUntilStart: boolean;
  started: boolean;
}): boolean;

export function getInteractiveLoadState(options: {
  mounted: boolean;
  loaded: boolean;
}): {
  label: string;
  busy: boolean;
};
