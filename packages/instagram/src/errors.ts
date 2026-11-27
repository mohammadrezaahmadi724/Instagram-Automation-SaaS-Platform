export type InstagramErrorCode =
  | 'RATE_LIMITED'
  | 'EXPIRED_TOKEN'
  | 'OUTSIDE_WINDOW'
  | 'DUPLICATE_REPLY'
  | 'TRANSIENT'
  | 'REJECTED';

export class InstagramApiError extends Error {
  readonly code: InstagramErrorCode;
  readonly retryable: boolean;

  constructor(code: InstagramErrorCode, retryable: boolean) {
    super('instagram request failed');
    this.name = 'InstagramApiError';
    this.code = code;
    this.retryable = retryable;
  }
}

export function mapGraphFailure(status: number, body: unknown): InstagramApiError {
  const error =
    body && typeof body === 'object' && 'error' in body
      ? (body as { error?: { code?: unknown; error_subcode?: unknown; message?: unknown } }).error
      : undefined;
  const code = Number(error?.code ?? 0);
  const subcode = Number(error?.error_subcode ?? 0);
  const text = String(error?.message ?? '').toLowerCase();
  if (status === 429 || code === 613) return new InstagramApiError('RATE_LIMITED', true);
  if (code === 190) return new InstagramApiError('EXPIRED_TOKEN', false);
  if (
    code === 10 ||
    code === 2018278 ||
    subcode === 2018278 ||
    text.includes('outside of allowed window')
  ) {
    return new InstagramApiError('OUTSIDE_WINDOW', false);
  }
  if (text.includes('already') && text.includes('reply'))
    return new InstagramApiError('DUPLICATE_REPLY', false);
  if (status >= 500) return new InstagramApiError('TRANSIENT', true);
  return new InstagramApiError('REJECTED', false);
}
