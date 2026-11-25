import { QueueEvents } from 'bullmq';
import { createRedis, createSystemQueue, systemQueueName } from './queues.js';
import { readWorkerEnv } from './env.js';
import { loadRootEnv } from './load-env.js';

loadRootEnv();

const env = readWorkerEnv();
const connection = createRedis(env.REDIS_URL);
connection.on('error', () => undefined);
const queue = createSystemQueue(connection);
const events = new QueueEvents(systemQueueName, { connection: connection.duplicate() });

const job = await queue.add('system.ping', { at: new Date().toISOString() });
const result = await job.waitUntilFinished(events, 10_000);
console.log(JSON.stringify(result));
connection.disconnect();
process.exit(0);
