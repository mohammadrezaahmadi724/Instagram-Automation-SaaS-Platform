import { pino } from 'pino';
import { resolveInstagramMode } from '@directora/instagram';
import { processWebhookJob, refreshDueTokens } from './process-event.js';
import {
  createRedis,
  createSystemWorker,
  definedProductQueues,
  instagramRefreshQueueName,
  instagramWebhookQueueName,
  systemQueueName,
} from './queues.js';
import { Queue, Worker } from 'bullmq';
import { readWorkerEnv } from './env.js';
import { loadRootEnv } from './load-env.js';

const log = pino({
  redact: ['*.token', '*.accessToken', '*.secret', '*.password', '*.phone', '*.phoneE164'],
});

loadRootEnv();

let env: { REDIS_URL: string };
try {
  env = readWorkerEnv();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Invalid environment';
  log.error(message);
  process.exit(1);
}

const connection = createRedis(env.REDIS_URL);
connection.on('error', (error: Error) => {
  log.error({ name: error.name }, 'redis connection error');
});

try {
  resolveInstagramMode(process.env);
} catch {
  log.error('instagram api mode is unavailable');
  process.exit(1);
}

const worker = createSystemWorker(connection.duplicate(), (at) => {
  log.info({ at, queues: definedProductQueues() }, 'system.ping');
});

const instagramWorker = new Worker(
  instagramWebhookQueueName,
  async (job) => {
    const eventId = typeof job.data?.eventId === 'string' ? job.data.eventId : '';
    if (!eventId) return { ignored: true };
    await processWebhookJob({
      eventId,
      attemptsMade: job.attemptsMade,
      maxAttempts: job.opts.attempts ?? 3,
      redis: connection.duplicate(),
    });
    return { ok: true };
  },
  { connection: connection.duplicate(), concurrency: 4 },
);

const refreshQueue = new Queue(instagramRefreshQueueName, { connection: connection.duplicate() });
const refreshWorker = new Worker(
  instagramRefreshQueueName,
  async () => {
    await refreshDueTokens();
    return { ok: true };
  },
  { connection: connection.duplicate() },
);
await refreshQueue.upsertJobScheduler(
  'instagram.token-refresh',
  { every: 60 * 60 * 1000 },
  { name: 'instagram.token-refresh', data: {} },
);

worker.on('error', (error: Error) => {
  log.error({ name: error.name }, 'worker error');
});
worker.on('failed', (job, error) => {
  log.error({ jobId: job?.id, name: error.name }, 'job failed');
});
worker.on('ready', () => {
  log.info({ queue: systemQueueName }, 'worker ready');
});

let stopping = false;
async function shutdown(signal: string) {
  if (stopping) return;
  stopping = true;
  const timer = setTimeout(() => {
    log.error({ signal }, 'shutdown timed out');
    process.exit(1);
  }, 10_000);
  try {
    await worker.close();
    await instagramWorker.close();
    await refreshWorker.close();
    await refreshQueue.close();
    await connection.quit();
    clearTimeout(timer);
    log.info({ signal }, 'shutdown complete');
    process.exit(0);
  } catch (error) {
    clearTimeout(timer);
    const name = error instanceof Error ? error.name : 'Error';
    log.error({ name, signal }, 'shutdown failed');
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
