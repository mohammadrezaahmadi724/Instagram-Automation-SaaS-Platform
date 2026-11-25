import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getPrisma } from '../src/index';

function ownDatabaseIsRunning() {
  try {
    const state = execSync(
      'docker inspect -f "{{.State.Running}}" instagramautomationsaasplatform-postgres-1',
      {
        encoding: 'utf8',
      },
    ).trim();
    return state === 'true';
  } catch {
    return false;
  }
}

function databaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const file = readFileSync(new URL('../../../.env', import.meta.url), 'utf8');
  const line = file.split(/\r?\n/).find((entry) => entry.startsWith('DATABASE_URL='));
  return line?.slice('DATABASE_URL='.length);
}

describe.skipIf(!ownDatabaseIsRunning())('postgres', () => {
  it('connects, writes a workspace graph, and rolls it back', async () => {
    const url = databaseUrl();
    expect(url).toBeTruthy();
    const prisma = getPrisma(url ?? '');
    const probe = await prisma.$queryRawUnsafe<Array<{ ok: number }>>('SELECT 1 as ok');
    expect(probe[0]?.ok).toBe(1);
    const before = await prisma.workspace.count();
    await expect(
      prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
          data: { name: 'نمونه', slug: `sample-${Date.now()}` },
        });
        const user = await tx.user.create({
          data: { phoneE164: `+98900${String(Date.now()).slice(-7)}`, displayName: 'نمونه' },
        });
        await tx.membership.create({
          data: { workspaceId: workspace.id, userId: user.id, role: 'OWNER' },
        });
        throw new Error('rollback');
      }),
    ).rejects.toThrow('rollback');
    expect(await prisma.workspace.count()).toBe(before);
    await prisma.$disconnect();
  });
});
