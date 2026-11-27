import { EmptyState } from '@directora/ui';
import { automationRules, requireProfile } from '../../../src/panel/queries';

export default async function AutomationsPage() {
  const profile = await requireProfile();
  const rules = await automationRules(profile.workspace.id);
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h1 className="text-3xl font-bold">دستورها</h1>
      {rules.length === 0 ? (
        <EmptyState
          kind="first-use"
          title="هنوز دستوری نیست"
          description="ساخت اتوماسیون بعد از اتصال رسمی اینستاگرام ممکن می‌شود."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {rules.map((rule) => (
            <li key={rule.id} className="rounded-lg border border-border bg-surface p-4">
              {rule.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
