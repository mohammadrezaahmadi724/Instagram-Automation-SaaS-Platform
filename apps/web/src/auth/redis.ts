import Redis from 'ioredis';

let client: Redis | null = null;

export async function getRedis() {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!client) {
    client = new Redis(url, { maxRetriesPerRequest: 1, enableOfflineQueue: false });
    client.on('error', () => undefined);
  }
  if (client.status === 'ready') return client;
  const current = client;
  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => finish(false), 3000);
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      current.off('ready', onReady);
      current.off('end', onEnd);
      if (ok) resolve();
      else reject(new Error('redis unavailable'));
    };
    const onReady = () => finish(true);
    const onEnd = () => finish(false);
    current.on('ready', onReady);
    current.on('end', onEnd);
    if (current.status === 'ready') finish(true);
  });
  return current.status === 'ready' ? current : null;
}
