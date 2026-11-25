import { Skeleton } from '@directora/ui';

export default function Loading() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 md:gap-16">
      <Skeleton className="h-11 w-40" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </main>
  );
}
