/**
 * Professional account reference. See docs/03.
 * Field-level mapping to Graph API objects is تأییدنشده where a doc conflict remains.
 */
export interface InstagramAccountRef {
  igId: string;
}

declare const igScopedUserIdBrand: unique symbol;

/**
 * Instagram-scoped user id (IGSID). Distinct from IG_ID.
 * See docs/03 and docs/08.
 */
export type IgScopedUserId = string & { readonly [igScopedUserIdBrand]: never };

/**
 * Inbound webhook envelope. Exact entry fields are تأییدنشده where docs/03 section 16 lists conflicts.
 */
export interface WebhookEnvelope {
  object: string;
  entry: WebhookEntry[];
}

/** تأییدنشده: payload fields differ across Meta documents. */
export interface WebhookEntry {
  id?: string;
  time?: number;
}

/**
 * Send API text message.
 * Maximum 1000 UTF-8 bytes. See docs/03 section 6.
 */
export interface SendTextMessageRequest {
  recipient: { id: IgScopedUserId };
  message: { text: string };
}

/**
 * Whether a human messaging window is open.
 * Exact Meta field names are تأییدنشده.
 */
export type MessagingWindowState = 'open' | 'closed' | 'unknown';
