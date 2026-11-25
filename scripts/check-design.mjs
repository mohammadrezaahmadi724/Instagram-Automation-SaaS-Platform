import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const physical =
  /(?:^|[\s"'`{:])-?(?:ml-|mr-|pl-|pr-|left-|right-|text-left|text-right|rounded-l-|rounded-r-|border-l-|border-r-)/;
const hex = /#[0-9a-fA-F]{3,8}\b/;
const rgb = /rgb\(/;
const emptyHref = /href\s*=\s*["']#["']/;
const emptyClick = /onClick=\{\(\)\s*=>\s*\{\s*\}\}/;
const arbitrary = /\[[^\]]*(\d+px|#[0-9a-fA-F]{3,8})/;
const rawInk = /bg-\[var\(--ink-/;
const arbitraryOpacity = /opacity-\[/;

const roots = ['apps/web/app', 'apps/web/src', 'packages/ui/src'];
const extensions = new Set(['.ts', '.tsx', '.css']);

export function scanSource(filePath, source) {
  const findings = [];
  const normalized = filePath.replaceAll('\\', '/');
  const tokensFile = normalized.endsWith('packages/ui/src/tokens.css');
  const lines = source.split(/\r?\n/);
  lines.forEach((line, index) => {
    const lineNo = index + 1;
    if (physical.test(line)) {
      findings.push({ file: normalized, line: lineNo, rule: 'physical-direction' });
    }
    if (!tokensFile && (hex.test(line) || rgb.test(line))) {
      findings.push({ file: normalized, line: lineNo, rule: 'raw-color' });
    }
    if (emptyHref.test(line)) {
      findings.push({ file: normalized, line: lineNo, rule: 'empty-href' });
    }
    if (emptyClick.test(line)) {
      findings.push({ file: normalized, line: lineNo, rule: 'empty-onclick' });
    }
    if (arbitrary.test(line)) {
      findings.push({ file: normalized, line: lineNo, rule: 'arbitrary-value' });
    }
    if (rawInk.test(line)) {
      findings.push({ file: normalized, line: lineNo, rule: 'raw-ink-token' });
    }
    if (arbitraryOpacity.test(line)) {
      findings.push({ file: normalized, line: lineNo, rule: 'arbitrary-opacity' });
    }
  });
  return findings;
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

export async function scanProject(root) {
  const findings = [];
  for (const relative of roots) {
    const dir = path.join(root, relative);
    const files = await walk(dir);
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      findings.push(...scanSource(path.relative(root, file), source));
    }
  }
  return findings;
}

async function main() {
  const root = process.cwd();
  const findings = await scanProject(root);
  if (findings.length === 0) {
    console.log('check-design: ok');
    return;
  }
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line} ${finding.rule}`);
  }
  process.exitCode = 1;
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  await main();
}
