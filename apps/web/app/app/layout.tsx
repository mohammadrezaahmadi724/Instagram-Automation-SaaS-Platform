import type { ReactNode } from 'react';
import { requireProfile } from '../../src/panel/queries';
import { PanelShell } from './panel-shell';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await requireProfile();
  return (
    <PanelShell user={profile.user} workspace={profile.workspace} workspaces={profile.workspaces}>
      {children}
    </PanelShell>
  );
}
