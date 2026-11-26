import net from 'node:net';
import { getPrisma } from '@directora/db';
import packageJson from '../../../package.json';
import { readEnv, type WebEnv } from '../../../src/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Dependency = 'ok' | 'error' | 'skipped';

const headers = { 'Cache-Control': 'no-store' };

async function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function probeRedis(url: string, timeoutMs = 2000) {
  const parsed = new URL(url);
  const port = Number(parsed.port || '6379');
  return new Promise<void>((resolve, reject) => {
    const socket = net.connect({ host: parsed.hostname, port });
    let settled = false;
    function finish(error?: Error) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      if (error) reject(error);
      else resolve();
    }
    const timer = setTimeout(() => finish(new Error('timeout')), timeoutMs);
    socket.on('error', finish);
    socket.on('data', (chunk) => {
      finish(chunk.toString().includes('PONG') ? undefined : new Error('unexpected'));
    });
    socket.on('connect', () => {
      socket.write('*1\r\n$4\r\nPING\r\n');
    });
  });
}

async function checkDb(env: WebEnv): Promise<Dependency> {
  if (!env.DATABASE_URL) return 'skipped';
  try {
    const prisma = getPrisma(env.DATABASE_URL);
    await withTimeout(prisma.$queryRaw`SELECT 1`, 2000);
    return 'ok';
  } catch {
    return 'error';
  }
}

async function checkRedis(env: WebEnv): Promise<Dependency> {
  if (!env.REDIS_URL) return 'skipped';
  try {
    await probeRedis(env.REDIS_URL);
    return 'ok';
  } catch {
    return 'error';
  }
}

export async function GET(request: Request) {
  const time = new Date().toISOString();
  const version = packageJson.version;
  let env: WebEnv;
  try {
    env = readEnv();
  } catch {
    return Response.json(
      { status: 'degraded', service: 'web', version, time, db: 'error', redis: 'error' },
      { status: 503, headers },
    );
  }

  const deep = new URL(request.url).searchParams.get('deep') === '1';
  if (!deep) {
    return Response.json({ status: 'ok', service: 'web', version, time }, { headers });
  }

  const [db, redis] = await Promise.all([checkDb(env), checkRedis(env)]);
  const healthy = db !== 'error' && redis !== 'error';
  return Response.json(
    { status: healthy ? 'ok' : 'degraded', service: 'web', version, time, db, redis },
    { status: healthy ? 200 : 503, headers },
  );
}
