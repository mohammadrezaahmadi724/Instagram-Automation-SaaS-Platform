'use client';

import { toPersianDigits } from '@directora/core';
import { FormField, Input } from '@directora/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function LoginForm({ callback }: { callback: string }) {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  async function sendCode() {
    setPending(true);
    setError('');
    const response = await fetch('/api/auth/otp/request', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(body.error ?? 'ارسال کد ممکن نشد');
      return;
    }
    setStep('code');
    setSeconds(60);
  }

  async function verifyCode() {
    setPending(true);
    setError('');
    const response = await fetch('/api/auth/otp/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(body.error ?? 'ورود ممکن نشد');
      return;
    }
    router.push(callback);
    router.refresh();
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (step === 'phone') void sendCode();
        else void verifyCode();
      }}
    >
      {step === 'phone' ? (
        <FormField id="phone" label="شماره موبایل">
          {(field) => (
            <bdi dir="ltr">
              <Input
                {...field}
                inputMode="tel"
                autoComplete="tel"
                placeholder="09123456789"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </bdi>
          )}
        </FormField>
      ) : (
        <FormField id="code" label="کد شش‌رقمی">
          {(field) => (
            <bdi dir="ltr">
              <Input
                {...field}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </bdi>
          )}
        </FormField>
      )}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-accent-foreground disabled:opacity-50"
      >
        {step === 'phone' ? 'ارسال کد' : 'ورود'}
      </button>
      {step === 'code' ? (
        <button
          type="button"
          disabled={seconds > 0 || pending}
          className="min-h-11 text-sm text-link disabled:opacity-50"
          onClick={() => void sendCode()}
        >
          {seconds > 0 ? `ارسال مجدد تا ${toPersianDigits(String(seconds))} ثانیه` : 'ارسال مجدد'}
        </button>
      ) : null}
    </form>
  );
}
