import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm text-muted">۴۰۴</p>
      <h1 className="text-4xl font-extrabold text-foreground">این صفحه پیدا نشد</h1>
      <p className="text-subtle">دایرکتورا هنوز این مسیر را ندارد.</p>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        بازگشت به صفحه اصلی
      </Link>
    </main>
  );
}
