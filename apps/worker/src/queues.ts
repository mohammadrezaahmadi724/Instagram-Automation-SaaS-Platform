import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import { productQueueNames } from '@directora/core';
import { Redis } from 'ioredis';

export const systemQueueName = 'system';
export const instagramWebhookQueueName = 'instagram.webhook';
export const instagramRefreshQueueName = 'instagram.token-refresh';

export function createRedis(url: string) {
  return new Redis(url, { maxRetriesPerRequest: null });
}

export function createSystemQueue(connection: ConnectionOptions) {
  return new Queue(systemQueueName, { connection });
}

export function createSystemWorker(connection: ConnectionOptions, onPing: (at: string) => void) {
  return new Worker(
    systemQueueName,
    async (job) => {
      if (job.name !== 'system.ping') return { ignored: true };
      const at = typeof job.data?.at === 'string' ? job.data.at : new Date().toISOString();
      onPing(at);
      return { pong: true };
    },
    { connection },
  );
}

export function definedProductQueues() {
  return productQueueNames;
}
