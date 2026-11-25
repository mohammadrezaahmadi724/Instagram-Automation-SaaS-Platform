import { getPrisma } from '@directora/db';
import packageJson from '../../../package.json';
import { readEnv } from '../../../src/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const env = readEnv();
  const body: { status: 'ok'; service: 'web'; version: string; time: string; db?: 'ok' | 'error' } =
    {
      status: 'ok',
      service: 'web',
      version: packageJson.version,
      time: new Date().toISOString(),
    };
  const deep = new URL(request.url).searchParams.get('deep') === '1';
  if (deep && env.DATABASE_URL) {
    try {
      const prisma = getPrisma(env.DATABASE_URL);
      await Promise.race([
        prisma.$queryRawUnsafe('SELECT 1'),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('timeout')), 2000);
        }),
      ]);
      body.db = 'ok';
    } catch {
      body.db = 'error';
      return Response.json(body, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
  }
  return Response.json(body, { headers: { 'Cache-Control': 'no-store' } });
}
