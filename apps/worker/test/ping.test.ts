import { QueueEvents, type Queue, type Worker } from 'bullmq';
import type { Redis } from 'ioredis';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createRedis, createSystemQueue, createSystemWorker, systemQueueName } from '../src/queues';

const runIntegration = process.env.RUN_INTEGRATION === '1';

if (!runIntegration) {
  describe.skip('system.ping (RUN_INTEGRATION is not set; integration test skipped)', () => {
    it('returns pong', () => {
      expect(true).toBe(true);
    });
  });
} else {
  describe('system.ping', () => {
    let connection: Redis;
    let queue: Queue;
    let events: QueueEvents;
    let worker: Worker;

    beforeAll(async () => {
      const url = process.env.REDIS_URL;
      if (!url) throw new Error('REDIS_URL is required when RUN_INTEGRATION=1');
      connection = createRedis(url);
      connection.on('error', () => undefined);
      try {
        await Promise.race([
          connection.ping(),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('redis unavailable')), 2000);
          }),
        ]);
      } catch (error) {
        connection.disconnect();
        throw error;
      }
      queue = createSystemQueue(connection);
      events = new QueueEvents(systemQueueName, { connection: connection.duplicate() });
      worker = createSystemWorker(connection.duplicate(), () => undefined);
      await worker.waitUntilReady();
    });

    afterAll(async () => {
      await worker?.close();
      await events?.close();
      await queue?.close();
      await connection?.quit();
    });

    it('returns pong', async () => {
      const job = await queue.add('system.ping', { at: new Date().toISOString() });
      const result = await job.waitUntilFinished(events, 8000);
      expect(result).toEqual({ pong: true });
    });
  });
}
