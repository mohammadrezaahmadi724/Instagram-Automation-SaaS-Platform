import { pino } from 'pino';
import {
  createRedis,
  createSystemQueue,
  createSystemWorker,
  definedProductQueues,
} from './queues.js';
import { readWorkerEnv } from './env.js';

const log = pino({
  redact: ['*.token', '*.accessToken', '*.secret', '*.password', '*.phone', '*.phoneE164'],
});

let env: { REDIS_URL: string };
try {
  env = readWorkerEnv();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Invalid environment';
  console.error(message);
  process.exit(1);
}

const connection = createRedis(env.REDIS_URL);
const queue = createSystemQueue(connection);
const worker = createSystemWorker(connection.duplicate(), (at) => {
  log.info({ at, queues: definedProductQueues() }, 'system.ping');
});

let stopping = false;
async function shutdown() {
  if (stopping) return;
  stopping = true;
  await worker.close();
  await queue.close();
  await connection.quit();
  process.exit(0);
}

process.on('SIGINT', () => {
  void shutdown();
});
process.on('SIGTERM', () => {
  void shutdown();
});
