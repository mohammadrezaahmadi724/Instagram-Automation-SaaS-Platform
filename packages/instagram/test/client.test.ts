import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { mapGraphFailure } from '../src/errors';
import { matchAutomationRule, normalizeMatchText } from '../src/match';
import { parseWebhookPayload } from '../src/parse';
import { automationInputSchema } from '../src/schema';
import { readSignedRequest, verifyMetaSignature } from '../src/signature';

const secret = 'test-app-secret';

describe('meta signature', () => {
  const body = Buffer.from('{"ok":true}');
  const header = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;

  it('accepts a valid signature and rejects empty, mismatched, and tampered values', () => {
    expect(verifyMetaSignature(body, header, secret)).toBe(true);
    expect(verifyMetaSignature(body, '', secret)).toBe(false);
    expect(verifyMetaSignature(body, 'sha256=abcd', secret)).toBe(false);
    expect(verifyMetaSignature(body, `${header.slice(0, -1)}0`, secret)).toBe(false);
    expect(verifyMetaSignature(Buffer.from('other'), header, secret)).toBe(false);
  });

  it('reads a valid signed request', () => {
    const payload = Buffer.from(JSON.stringify({ user_id: '1789' })).toString('base64url');
    const sig = createHmac('sha256', secret).update(payload).digest('base64url');
    expect(readSignedRequest(`${sig}.${payload}`, secret)?.user_id).toBe('1789');
    expect(readSignedRequest(`${sig}.${payload}`, 'other')).toBeNull();
  });
});

describe('webhook parse', () => {
  it('parses comments, direct messages, story replies, and echoes', () => {
    const events = parseWebhookPayload({
      object: 'instagram',
      entry: [
        {
          id: 'page-1',
          messaging: [
            {
              sender: { id: 'user-1' },
              recipient: { id: 'page-1' },
              timestamp: 1_700_000_000_000,
              message: { mid: 'm1', text: 'سلام' },
            },
            {
              sender: { id: 'user-1' },
              recipient: { id: 'page-1' },
              timestamp: 1_700_000_000_100,
              message: { mid: 'm2', text: 'استوری', reply_to: { story: { id: 'story-1' } } },
            },
            {
              sender: { id: 'page-1' },
              recipient: { id: 'user-1' },
              timestamp: 1_700_000_000_200,
              message: { mid: 'm3', text: 'echo', is_echo: true },
            },
          ],
          changes: [
            {
              field: 'comments',
              value: { id: 'c1', text: 'قیمت', from: { id: 'user-2' }, media: { id: 'media-1' } },
            },
          ],
        },
      ],
    });
    expect(events.map((event) => [event.triggerType, event.isEcho, event.externalEventId])).toEqual(
      [
        ['DM', false, 'm1'],
        ['STORY_REPLY', false, 'm2'],
        ['DM', true, 'm3'],
        ['POST_COMMENT', false, 'comments:c1'],
      ],
    );
  });
});

describe('persian matcher', () => {
  const base = {
    id: 'rule-1',
    status: 'ACTIVE' as const,
    triggerType: 'POST_COMMENT' as const,
    mediaScope: 'ALL' as const,
    mediaId: null,
    matchType: 'CONTAINS' as const,
    keywords: ['قیمت'],
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('normalizes arabic letters and zero-width characters', () => {
    expect(normalizeMatchText('قيمت\u200c')).toBe('قیمت');
    expect(
      matchAutomationRule({ triggerType: 'POST_COMMENT', mediaId: null, text: 'قيمت\u200b کالا' }, [
        base,
      ])?.id,
    ).toBe('rule-1');
  });

  it('honors exact, contains, any, and specific media order', () => {
    expect(
      matchAutomationRule({ triggerType: 'POST_COMMENT', mediaId: null, text: 'قیمت ها' }, [
        { ...base, matchType: 'EXACT' },
      ]),
    ).toBeNull();
    expect(
      matchAutomationRule({ triggerType: 'DM', mediaId: null, text: '' }, [
        { ...base, triggerType: 'DM', matchType: 'ANY', keywords: [] },
      ])?.id,
    ).toBe('rule-1');
    const winner = matchAutomationRule(
      { triggerType: 'POST_COMMENT', mediaId: 'media-9', text: 'قیمت' },
      [
        { ...base, id: 'all', createdAt: '2026-01-01T00:00:00.000Z' },
        {
          ...base,
          id: 'specific-new',
          mediaScope: 'SPECIFIC',
          mediaId: 'media-9',
          createdAt: '2026-02-01T00:00:00.000Z',
        },
        {
          ...base,
          id: 'specific-old',
          mediaScope: 'SPECIFIC',
          mediaId: 'media-9',
          createdAt: '2026-01-02T00:00:00.000Z',
        },
      ],
    );
    expect(winner?.id).toBe('specific-old');
  });
});

describe('automation input', () => {
  const valid = {
    name: 'پاسخ قیمت',
    instagramAccountId: '018f1b5a-7c3a-7c3a-8c3a-7c3a7c3a7c3a',
    triggerType: 'POST_COMMENT',
    mediaScope: 'ALL',
    matchType: 'CONTAINS',
    keywords: ['قیمت'],
    replyText: 'سلام',
    buttons: [],
  };

  it('rejects more than 1000 characters and more than 3 buttons', () => {
    expect(automationInputSchema.safeParse({ ...valid, replyText: 'ا'.repeat(1001) }).success).toBe(
      false,
    );
    expect(
      automationInputSchema.safeParse({
        ...valid,
        buttons: [1, 2, 3, 4].map((item) => ({
          type: 'postback',
          title: `دکمه ${item}`,
          payload: 'ok',
        })),
      }).success,
    ).toBe(false);
    expect(automationInputSchema.safeParse(valid).success).toBe(true);
  });
});

describe('graph errors', () => {
  it('maps rate limit, expired token, and the messaging window without echoing secrets', () => {
    expect(mapGraphFailure(429, {}).code).toBe('RATE_LIMITED');
    expect(
      mapGraphFailure(400, { error: { code: 190, message: 'token EAA-secret' } }).message,
    ).toBe('instagram request failed');
    expect(mapGraphFailure(400, { error: { code: 10 } }).code).toBe('OUTSIDE_WINDOW');
    expect(mapGraphFailure(503, {}).retryable).toBe(true);
  });
});
