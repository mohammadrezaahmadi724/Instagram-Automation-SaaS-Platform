import { pino } from 'pino';
import {
  createRedis,
  createSystemWorker,
  definedProductQueues,
  systemQueueName,
} from './queues.js';
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

const worker = createSystemWorker(connection.duplicate(), (at) => {
  log.info({ at, queues: definedProductQueues() }, 'system.ping');
});

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
