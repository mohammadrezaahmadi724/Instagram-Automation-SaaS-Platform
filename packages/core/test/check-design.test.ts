import { describe, expect, it } from 'vitest';
import { scanSource } from '../../../scripts/check-design.mjs';

describe('check-design', () => {
  it('accepts logical classes and token colors', () => {
    const source = 'export const box = "ms-4 text-start rounded-lg border border-input"';
    expect(scanSource('packages/ui/src/ok.tsx', source)).toEqual([]);
  });

  it('rejects physical direction, raw color, empty handlers, and arbitrary values', () => {
    const source = [
      'const a = "ml-4 text-left"',
      'const b = "pl-2"',
      'const color = "#fff"',
      'const click = onClick={() => {}}',
      'const href = href="#"',
      'const size = "w-[13px]"',
    ].join('\n');
    const rules = scanSource('apps/web/app/bad.tsx', source).map((item) => item.rule);
    expect(rules).toContain('physical-direction');
    expect(rules).toContain('raw-color');
    expect(rules).toContain('empty-onclick');
    expect(rules).toContain('empty-href');
    expect(rules).toContain('arbitrary-value');
  });

  it('allows hex only in tokens.css', () => {
    expect(scanSource('packages/ui/src/tokens.css', '--ink-0: #FFFFFF;')).toEqual([]);
  });
});
