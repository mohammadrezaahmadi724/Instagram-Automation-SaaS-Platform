import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getPrisma } from '../src/index';

const runIntegration = process.env.RUN_INTEGRATION === '1';

if (!runIntegration) {
  describe.skip('postgres (RUN_INTEGRATION is not set; integration test skipped)', () => {
    it('connects', () => {
      expect(true).toBe(true);
    });
  });
} else {
  describe('postgres', () => {
    let prisma: ReturnType<typeof getPrisma>;

    beforeAll(async () => {
      const url = process.env.DATABASE_URL;
      if (!url) throw new Error('DATABASE_URL is required when RUN_INTEGRATION=1');
      prisma = getPrisma(url);
      const probe = await prisma.$queryRaw`SELECT 1`;
      expect(Array.isArray(probe)).toBe(true);
    });

    afterAll(async () => {
      await prisma.$disconnect();
    });

    it('connects, writes a workspace graph, and rolls it back', async () => {
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
    });
  });
}
