import 'server-only';
import { z } from 'zod';

const optionalString = z.preprocess(
  (value) => (value === '' || value === undefined ? undefined : value),
  z.string().min(1).optional(),
);

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: optionalString,
  REDIS_URL: optionalString,
  NEXT_PUBLIC_APP_NAME: optionalString,
  DESIGN_CATALOG: optionalString,
});

export type WebEnv = z.infer<typeof schema>;

export function readEnv(source: NodeJS.ProcessEnv = process.env): WebEnv {
  const parsed = schema.safeParse({
    NODE_ENV: source.NODE_ENV,
    DATABASE_URL: source.DATABASE_URL,
    REDIS_URL: source.REDIS_URL,
    NEXT_PUBLIC_APP_NAME: source.NEXT_PUBLIC_APP_NAME,
    DESIGN_CATALOG: source.DESIGN_CATALOG,
  });
  if (!parsed.success) {
    const keys = parsed.error.issues.map((issue) => issue.path.join('.') || 'env').join(', ');
    throw new Error(`Invalid environment: ${keys}`);
  }
  return parsed.data;
}
