import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPrisma } from '../src/client.ts';

try {
  process.loadEnvFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../.env'));
} catch {
  // CI can inject DATABASE_URL without a file.
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('seed: DATABASE_URL is required');
  process.exit(1);
}

const prisma = getPrisma(databaseUrl);

// قیمت، سقف اجرا و فلگ‌ها جای‌نگهدارند. Super Admin در پرامپت پرداخت آن‌ها را عوض می‌کند.
const plans = [
  {
    code: 'FREE_TRIAL',
    nameFa: 'آزمایشی',
    priceRial: 0n,
    durationDays: 7,
    maxInstagramAccounts: 1,
    maxMonthlyExecutions: 100,
    minFollowers: 0,
    maxFollowers: null,
    featuresJson: { aiReply: false, sms: false },
  },
  {
    code: 'GROWTH_UNDER_25K',
    nameFa: 'رشد',
    priceRial: 4_900_000n,
    durationDays: 30,
    maxInstagramAccounts: 1,
    maxMonthlyExecutions: 2_000,
    minFollowers: 0,
    maxFollowers: 24_999,
    featuresJson: { aiReply: false, sms: false },
  },
  {
    code: 'PRO_OVER_25K',
    nameFa: 'حرفه‌ای',
    priceRial: 9_900_000n,
    durationDays: 30,
    maxInstagramAccounts: 3,
    maxMonthlyExecutions: 20_000,
    minFollowers: 25_000,
    maxFollowers: null,
    featuresJson: { aiReply: true, sms: false },
  },
  {
    code: 'AGENCY',
    nameFa: 'آژانس',
    priceRial: 29_900_000n,
    durationDays: 30,
    maxInstagramAccounts: 10,
    maxMonthlyExecutions: 100_000,
    minFollowers: 0,
    maxFollowers: null,
    featuresJson: { aiReply: true, sms: true },
  },
] as const;

for (const plan of plans) {
  await prisma.plan.upsert({
    where: { code: plan.code },
    create: { ...plan, isActive: true },
    update: {
      nameFa: plan.nameFa,
      priceRial: plan.priceRial,
      durationDays: plan.durationDays,
      maxInstagramAccounts: plan.maxInstagramAccounts,
      maxMonthlyExecutions: plan.maxMonthlyExecutions,
      minFollowers: plan.minFollowers,
      maxFollowers: plan.maxFollowers,
      featuresJson: plan.featuresJson,
      isActive: true,
    },
  });
}

await prisma.$disconnect();
console.log(`seed: ${plans.length} plans`);
