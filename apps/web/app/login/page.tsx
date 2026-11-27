import { existsSync } from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import { ThemeToggle } from '@directora/ui';
import { LoginForm } from './login-form';

function safeCallback(value: string | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\'))
    return '/app';
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callback?: string }>;
}) {
  const params = await searchParams;
  const logo = existsSync(path.join(process.cwd(), 'public', 'brand', 'directora-logo.png'));
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-5">
        {logo ? (
          <span className="inline-flex rounded-lg bg-brand-plate p-3">
            <Image
              src="/brand/directora-logo.png"
              alt="لوگوی دایرکتورا"
              width={140}
              height={42}
              priority
              className="h-auto w-auto"
            />
          </span>
        ) : (
          <span className="text-xl font-extrabold">دایرکتورا</span>
        )}
        <ThemeToggle />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">ورود به پنل</h1>
          <p className="text-sm text-subtle">کد فقط برای ورود به دایرکتورا است.</p>
        </div>
        <LoginForm callback={safeCallback(params.callback)} />
      </main>
    </div>
  );
}
