import { z } from 'zod';

const buttonSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('web_url'),
    title: z.string().trim().min(1).max(20),
    url: z
      .string()
      .url()
      .refine((value) => value.startsWith('https://')),
  }),
  z.object({
    type: z.literal('postback'),
    title: z.string().trim().min(1).max(20),
    payload: z.string().trim().min(1).max(1000),
  }),
]);

export const automationInputSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    instagramAccountId: z.string().uuid(),
    triggerType: z.enum(['POST_COMMENT', 'LIVE_COMMENT', 'DM', 'STORY_REPLY']),
    mediaScope: z.enum(['ALL', 'SPECIFIC']),
    mediaId: z.string().trim().min(1).max(120).optional(),
    matchType: z.enum(['EXACT', 'CONTAINS', 'ANY']),
    keywords: z.array(z.string().trim().min(1).max(80)).max(20),
    replyText: z.string().max(1000),
    buttons: z.array(buttonSchema).max(3).default([]),
    publicCommentReplyText: z.string().max(1000).optional(),
    sendPrivateReply: z.boolean().default(true),
    cooldownSeconds: z.number().int().min(0).max(86_400).default(0),
  })
  .superRefine((value, context) => {
    if (Buffer.byteLength(value.replyText, 'utf8') > 1000) {
      context.addIssue({
        code: 'custom',
        path: ['replyText'],
        message: 'متن پاسخ بیش از ۱۰۰۰ بایت است',
      });
    }
    if (value.mediaScope === 'SPECIFIC' && !value.mediaId) {
      context.addIssue({ code: 'custom', path: ['mediaId'], message: 'پست مشخص لازم است' });
    }
    if (value.matchType !== 'ANY' && value.keywords.length === 0) {
      context.addIssue({ code: 'custom', path: ['keywords'], message: 'کلیدواژه لازم است' });
    }
  });

export type AutomationInput = z.infer<typeof automationInputSchema>;
