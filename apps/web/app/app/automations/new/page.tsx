import { listAccounts } from '../../../../src/instagram/queries';
import { requireProfile } from '../../../../src/panel/queries';
import { AutomationForm } from '../automation-form';

export default async function NewAutomationPage() {
  const profile = await requireProfile();
  const accounts = await listAccounts(profile.workspace.id);
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h1 className="text-3xl font-bold">دستور تازه</h1>
      {accounts.length === 0 ? (
        <p className="text-subtle">اول یک حساب اینستاگرام وصل کنید.</p>
      ) : (
        <AutomationForm
          accounts={accounts.map((account) => ({ id: account.id, username: account.username }))}
        />
      )}
    </div>
  );
}
