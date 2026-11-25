import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function loadRootEnv() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  try {
    process.loadEnvFile(path.resolve(here, '../../../.env'));
  } catch {
    return;
  }
}
