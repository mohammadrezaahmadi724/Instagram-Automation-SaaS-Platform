export type {
  IgScopedUserId,
  InstagramAccountRef,
  MessagingWindowState,
  SendTextMessageRequest,
  WebhookEnvelope,
  WebhookEntry,
} from './types';
export { InstagramApiError, mapGraphFailure } from './errors';
export type { InstagramErrorCode } from './errors';
export { readSignedRequest, verifyMetaSignature } from './signature';
export { parseWebhookPayload } from './parse';
export type { InstagramTrigger, ParsedInstagramEvent } from './parse';
export { matchAutomationRule, normalizeMatchText } from './match';
export type { MatchableEvent, MatchableRule } from './match';
export { assertOutboundMessage, messageBody } from './messages';
export type { ReplyButton } from './messages';
export {
  buildInstagramAuthUrl,
  createInstagramApi,
  instagramScopes,
  isProfessionalAccount,
  resolveInstagramMode,
} from './client';
export type { InstagramMedia, InstagramMode, InstagramProfile } from './client';
export { automationInputSchema } from './schema';
export type { AutomationInput } from './schema';
