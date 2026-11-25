import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client';

const globalForPrisma = globalThis as unknown as { directoraPrisma?: PrismaClient };

export function getPrisma(databaseUrl: string): PrismaClient {
  const existing = globalForPrisma.directoraPrisma;
  if (existing) return existing;
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const client = new PrismaClient({ adapter });
  globalForPrisma.directoraPrisma = client;
  return client;
}

export type { PrismaClient };
