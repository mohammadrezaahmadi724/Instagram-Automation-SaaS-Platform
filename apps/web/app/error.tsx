'use client';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-extrabold text-foreground">نمایش صفحه ممکن نشد</h1>
      <p className="text-subtle">یک خطای غیرمنتظره رخ داد.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        تلاش دوباره
      </button>
    </main>
  );
}
