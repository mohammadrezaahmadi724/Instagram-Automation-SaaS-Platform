import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const schema = readFileSync(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');

describe('schema', () => {
  it('has the initial migration and no password fields', () => {
    const migrations = readdirSync(new URL('../prisma/migrations', import.meta.url));
    expect(migrations.some((name) => name.endsWith('_init'))).toBe(true);
    expect(schema.toLowerCase()).not.toContain('password');
    expect(schema).toContain('phoneE164');
    expect(schema).toContain('model Workspace');
    expect(schema).toContain('model User');
    expect(schema).toContain('model Membership');
  });
});
