import { EmptyState } from '@directora/ui';
import { instagramAccounts, requireProfile } from '../../../src/panel/queries';

export default async function InstagramPage() {
  const profile = await requireProfile();
  const accounts = await instagramAccounts(profile.workspace.id);
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h1 className="text-3xl font-bold">حساب‌های اینستاگرام</h1>
      {accounts.length === 0 ? (
        <EmptyState
          kind="first-use"
          title="هنوز حسابی وصل نشده"
          description="اتصال رسمی Meta API در مرحله بعد فعال می‌شود."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {accounts.map((account) => (
            <li key={account.id} className="rounded-lg border border-border bg-surface p-4">
              <bdi dir="ltr">{account.username}</bdi>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
