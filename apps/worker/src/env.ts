import { z } from 'zod';

const schema = z.object({
  REDIS_URL: z.string().min(1),
});

export function readWorkerEnv(source: NodeJS.ProcessEnv = process.env) {
  const parsed = schema.safeParse({ REDIS_URL: source.REDIS_URL });
  if (!parsed.success) {
    const keys = parsed.error.issues.map((issue) => issue.path.join('.') || 'REDIS_URL').join(', ');
    throw new Error(`Invalid environment: ${keys}`);
  }
  return parsed.data;
}
