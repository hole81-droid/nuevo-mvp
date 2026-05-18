export type UploadRemixState =
  | { status: 'none'; canContinue: true; title: ''; message: '' }
  | { status: 'loading' | 'invalid' | 'missing' | 'blocked'; canContinue: false; title: string; message: string }
  | { status: 'ready'; canContinue: true; title: string; message: string };

export function getUploadRemixState(params: {
  remixPostId: string | null;
  originalPost: { title?: string; remixable?: boolean } | null;
  hasCheckedOriginal: boolean;
}): UploadRemixState;
