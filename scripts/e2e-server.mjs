import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const web = path.join(root, 'apps', 'web');

try {
  process.loadEnvFile(path.join(root, '.env'));
} catch {
  // The Playwright env already carries the test fallbacks.
}

process.env.INSTAGRAM_API_MODE = 'mock';
if (!process.env.META_APP_SECRET) process.env.META_APP_SECRET = 'playwright-meta-app-secret';
if (!process.env.META_WEBHOOK_VERIFY_TOKEN) {
  process.env.META_WEBHOOK_VERIFY_TOKEN = 'playwright-webhook-verify';
}
if (!process.env.ENCRYPTION_KEY) process.env.ENCRYPTION_KEY = '11'.repeat(32);
if (!process.env.ENCRYPTION_KEY_ID) process.env.ENCRYPTION_KEY_ID = 'v1';

function start(command) {
  return spawn(command, {
    cwd: command.includes('next') ? web : root,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
}

const worker = start('pnpm --filter @directora/worker exec tsx src/index.ts');
const next = start('pnpm exec next dev --port 3000');

function stop() {
  worker.kill();
  next.kill();
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
worker.on('exit', (code) => {
  if (code) console.error('e2e worker exited');
});
next.on('exit', (code) => {
  stop();
  process.exit(code ?? 1);
});
