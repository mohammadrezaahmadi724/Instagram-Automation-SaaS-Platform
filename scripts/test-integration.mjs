import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

try {
  process.loadEnvFile(path.join(root, '.env'));
} catch {
  console.error('test:integration: .env could not be loaded');
  process.exit(1);
}

process.env.RUN_INTEGRATION = '1';

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

await run(['--filter', '@directora/db', 'exec', 'vitest', 'run', 'test/integration.test.ts']);
await run(['--filter', '@directora/worker', 'exec', 'vitest', 'run', 'test/ping.test.ts']);
