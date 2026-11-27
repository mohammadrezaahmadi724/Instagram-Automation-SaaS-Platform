import { roleAtLeast } from '../../../src/auth/roles';
import { requireProfile } from '../../../src/panel/queries';
import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
  const profile = await requireProfile();
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h1 className="text-3xl font-bold">تنظیمات</h1>
      <SettingsForm
        workspaceName={profile.workspace.name}
        displayName={profile.user.displayName ?? ''}
        canEditWorkspace={roleAtLeast(profile.workspace.role, 'ADMIN')}
      />
    </div>
  );
}
