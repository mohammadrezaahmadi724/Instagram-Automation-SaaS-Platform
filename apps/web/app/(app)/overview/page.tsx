import { EmptyState, PageHeader } from '@directora/ui';

export default function OverviewPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader title="نمای کلی" description="خلاصه Workspace، وقتی داده واقعی وصل شود." />
      <EmptyState
        kind="first-use"
        title="هنوز داده‌ای نیست"
        description="اتوماسیون، گفتگو و آمار بعد از اتصال رسمی اینستاگرام اینجا می‌آید. این صفحه نمونه است."
      />
    </div>
  );
}
