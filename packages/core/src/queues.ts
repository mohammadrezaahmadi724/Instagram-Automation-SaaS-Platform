export const productQueueNames = {
  webhooksInbound: 'webhooks-inbound',
  messagesOutbound: 'messages-outbound',
  tokensRefresh: 'tokens-refresh',
  notifications: 'notifications',
} as const;

export type ProductQueueName = (typeof productQueueNames)[keyof typeof productQueueNames];
