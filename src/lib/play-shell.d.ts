export declare const PLAY_STATE: {
  readonly LOADING: 'loading';
  readonly PLAYING: 'playing';
  readonly DONE: 'done';
};

export type PlayState = 'loading' | 'playing' | 'done';

export declare const PLAY_TOP_HEIGHT: number;
export declare const PLAY_BOTTOM_HEIGHT: number;
export declare const PLAY_TOP_CLASS: string;
export declare const PLAY_BOTTOM_CLASS: string;
export declare const PLAY_DONE_PANEL_CLASS: string;

export declare function buildPlayShellPath(
  postId: string,
  opts?: { source?: string },
): string;
