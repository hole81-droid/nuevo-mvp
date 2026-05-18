export type AuthCallbackFailureReason = 'missing_code' | 'exchange_failed' | 'missing_user';

export function buildAuthCallbackFailureRedirect(input?: {
  next?: string | null;
  reason?: AuthCallbackFailureReason | string | null;
}): string;

export function getAuthErrorCopy(reason?: string | null): string;
