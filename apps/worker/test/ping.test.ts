import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { QueueEvents } from 'bullmq';
import { afterAll, describe, expect, it } from 'vitest';
import { createRedis, createSystemQueue, createSystemWorker } from '../src/queues';

function ownRedisIsRunning() {
  try {
    const state = execSync(
      'docker inspect -f "{{.State.Running}}" instagramautomationsaasplatform-redis-1',
      {
        encoding: 'utf8',
      },
    ).trim();
    return state === 'true';
  } catch {
    return false;
  }
}

function redisUrl() {
  if (process.env.REDIS_URL) return process.env.REDIS_URL;
  const file = readFileSync(new URL('../../../.env', import.meta.url), 'utf8');
  const line = file.split(/\r?\n/).find((entry) => entry.startsWith('REDIS_URL='));
  return line?.slice('REDIS_URL='.length);
}

describe.skipIf(!ownRedisIsRunning())('system.ping', () => {
  const url = redisUrl();
  const connection = createRedis(url ?? 'redis://127.0.0.1:6379');
  const queue = createSystemQueue(connection);
  const events = new QueueEvents('system', { connection: connection.duplicate() });
  const worker = createSystemWorker(connection.duplicate(), () => undefined);

  afterAll(async () => {
    await worker.close();
    await events.close();
    await queue.close();
    await connection.quit();
  });

  it('returns pong', async () => {
    expect(url).toBeTruthy();
    const job = await queue.add('system.ping', { at: new Date().toISOString() });
    const result = await job.waitUntilFinished(events, 8000);
    expect(result).toEqual({ pong: true });
  });
});
