import { createHash } from 'node:crypto';

export type InstagramTrigger = 'POST_COMMENT' | 'LIVE_COMMENT' | 'DM' | 'STORY_REPLY';

export type ParsedInstagramEvent = {
  externalEventId: string;
  triggerType: InstagramTrigger;
  igUserId: string;
  igsid: string;
  commentId: string | null;
  mediaId: string | null;
  text: string;
  timestamp: Date;
  isEcho: boolean;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function textOf(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function idOf(value: unknown) {
  const record = asRecord(value);
  return typeof record?.id === 'string' ? record.id : '';
}

function timestampOf(value: unknown) {
  const raw = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(raw) || raw <= 0) return new Date();
  return new Date(raw < 1_000_000_000_000 ? raw * 1000 : raw);
}

function stableId(parts: unknown) {
  return createHash('sha256').update(JSON.stringify(parts)).digest('hex');
}

export function parseWebhookPayload(payload: unknown): ParsedInstagramEvent[] {
  const root = asRecord(payload);
  const entries = Array.isArray(root?.entry) ? root.entry : [];
  const events: ParsedInstagramEvent[] = [];
  for (const entryValue of entries) {
    const entry = asRecord(entryValue);
    if (!entry) continue;
    const igUserId = textOf(entry.id);
    const messaging = Array.isArray(entry.messaging) ? entry.messaging : [];
    for (const itemValue of messaging) {
      const item = asRecord(itemValue);
      if (!item) continue;
      const message = asRecord(item.message);
      const sender = idOf(item.sender);
      const recipient = idOf(item.recipient);
      const replyTo = asRecord(message?.reply_to);
      const story = asRecord(replyTo?.story);
      const mid = textOf(message?.mid);
      const echo =
        message?.is_echo === true ||
        message?.is_self_reply === true ||
        (sender !== '' && (sender === igUserId || sender === recipient));
      events.push({
        externalEventId:
          mid || stableId(['messaging', igUserId, sender, item.timestamp, message?.text]),
        triggerType: story ? 'STORY_REPLY' : 'DM',
        igUserId,
        igsid: sender,
        commentId: null,
        mediaId: textOf(story?.id) || null,
        text: textOf(message?.text),
        timestamp: timestampOf(item.timestamp),
        isEcho: echo,
      });
    }
    const changes = Array.isArray(entry.changes) ? entry.changes : [];
    for (const changeValue of changes) {
      const change = asRecord(changeValue);
      if (!change) continue;
      const field = textOf(change.field);
      if (field !== 'comments' && field !== 'live_comments') continue;
      const value = asRecord(change.value);
      const commentId = textOf(value?.id);
      const from = idOf(value?.from);
      const media = asRecord(value?.media);
      events.push({
        externalEventId: commentId
          ? `${field}:${commentId}`
          : stableId(['change', field, igUserId, value]),
        triggerType: field === 'live_comments' ? 'LIVE_COMMENT' : 'POST_COMMENT',
        igUserId,
        igsid: from,
        commentId: commentId || null,
        mediaId: textOf(media?.id) || null,
        text: textOf(value?.text),
        timestamp: timestampOf(value?.timestamp ?? entry.time),
        isEcho: from !== '' && from === igUserId,
      });
    }
  }
  return events;
}
