import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

try {
  process.loadEnvFile(path.join(root, '.env'));
} catch {
  if (!process.env.DATABASE_URL || !process.env.REDIS_URL) {
    console.error('test:integration: DATABASE_URL and REDIS_URL are required');
    process.exit(1);
  }
}

process.env.RUN_INTEGRATION = '1';
process.env.SMS_PROVIDER = 'console';
process.env.OTP_TEST_HELPER = '1';
if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 16) {
  process.env.AUTH_SECRET = 'integration-auth-secret';
}
if (!process.env.ENCRYPTION_KEY) process.env.ENCRYPTION_KEY = '11'.repeat(32);
if (!process.env.ENCRYPTION_KEY_ID) process.env.ENCRYPTION_KEY_ID = 'v1';
process.env.INSTAGRAM_API_MODE = 'mock';
if (!process.env.META_APP_SECRET) process.env.META_APP_SECRET = 'integration-meta-app-secret';
if (!process.env.META_WEBHOOK_VERIFY_TOKEN) {
  process.env.META_WEBHOOK_VERIFY_TOKEN = 'integration-webhook-verify';
}

function run(args) {
  return new Promise((resolve, reject) => {
    const command =
      process.platform === 'win32'
        ? `pnpm ${args.map((arg) => (/\s/.test(arg) ? `"${arg}"` : arg)).join(' ')}`
        : 'pnpm';
    const child =
      process.platform === 'win32'
        ? spawn(command, { cwd: root, stdio: 'inherit', env: process.env, shell: true })
        : spawn(command, args, { cwd: root, stdio: 'inherit', env: process.env });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`pnpm ${args.join(' ')} exited ${code ?? 'null'}`));
    });
  });
}

await runVitest('@directora/db', 'test/integration.test.ts');
await runVitest('@directora/worker', 'test/ping.test.ts');
await runVitest('@directora/web', 'test/auth.integration.test.ts');
await runVitest('@directora/web', 'test/instagram.integration.test.ts');

async function runVitest(filter, file) {
  const dir = mkdtempSync(path.join(tmpdir(), 'directora-vitest-'));
  const output = path.join(dir, 'report.json');
  try {
    await run([
      '--filter',
      filter,
      'exec',
      'vitest',
      'run',
      file,
      '--reporter=default',
      '--reporter=json',
      `--outputFile.json=${output}`,
    ]);
    const report = JSON.parse(readFileSync(output, 'utf8'));
    const skipped = Number(report.numPendingTests ?? 0) + Number(report.numTodoTests ?? 0);
    if (!Number(report.numTotalTests ?? 0)) {
      console.error(`test:integration: ${filter} ran no tests`);
      process.exit(1);
    }
    if (skipped > 0) {
      console.error(`test:integration: ${filter} skipped ${skipped}`);
      process.exit(1);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
