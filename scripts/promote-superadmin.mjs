import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPrisma } from '../packages/db/src/client.ts';

try {
  process.loadEnvFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env'));
} catch {
  // DATABASE_URL may already be in the environment.
}

function normalize(input) {
  const digits = input.trim().replace(/[\s-]/g, '');
  if (/^09\d{9}$/.test(digits)) return `+98${digits.slice(1)}`;
  if (/^\+989\d{9}$/.test(digits)) return digits;
  return null;
}

const raw = process.argv.slice(2).find((item) => item !== '--');
const phone = raw ? normalize(raw) : null;
if (!phone) {
  console.error('admin:promote: شماره موبایل ایران لازم است');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('admin:promote: DATABASE_URL is required');
  process.exit(1);
}

const db = getPrisma(process.env.DATABASE_URL);
const user = await db.user.findUnique({ where: { phoneE164: phone } });
if (!user) {
  console.log('کاربر یافت نشد');
  await db.$disconnect();
  process.exit(1);
}
if (user.isSuperAdmin) {
  console.log('از قبل Super Admin بود');
  await db.$disconnect();
  process.exit(0);
}
await db.user.update({ where: { id: user.id }, data: { isSuperAdmin: true } });
console.log('ارتقا داده شد');
await db.$disconnect();
