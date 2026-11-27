import { describe, expect, it } from 'vitest';
import { roleAtLeast } from './roles';

describe('workspace role', () => {
  it('allows the same role and higher roles', () => {
    expect(roleAtLeast('VIEWER', 'VIEWER')).toBe(true);
    expect(roleAtLeast('AGENT', 'VIEWER')).toBe(true);
    expect(roleAtLeast('ADMIN', 'AGENT')).toBe(true);
    expect(roleAtLeast('OWNER', 'ADMIN')).toBe(true);
  });

  it('rejects a lower role', () => {
    expect(roleAtLeast('VIEWER', 'AGENT')).toBe(false);
    expect(roleAtLeast('AGENT', 'ADMIN')).toBe(false);
    expect(roleAtLeast('ADMIN', 'OWNER')).toBe(false);
  });
});
