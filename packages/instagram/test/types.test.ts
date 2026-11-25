import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('instagram package', () => {
  it('contains types only and no network calls', () => {
    const source = readFileSync(new URL('../src/types.ts', import.meta.url), 'utf8');
    expect(source).not.toMatch(/fetch\s*\(/);
    expect(source).toContain('SendTextMessageRequest');
    expect(source).toContain('تأییدنشده');
  });
});
