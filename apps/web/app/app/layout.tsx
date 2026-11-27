import type { ReactNode } from 'react';
import { getPrisma } from '@directora/db';
import { requireProfile } from '../../src/panel/queries';
import { PanelShell } from './panel-shell';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await requireProfile();
  const url = process.env.DATABASE_URL;
  const row = url
    ? await getPrisma(url).user.findUnique({
        where: { id: profile.user.id },
        select: { isSuperAdmin: true },
      })
    : null;
  return (
    <PanelShell
      user={profile.user}
      workspace={profile.workspace}
      workspaces={profile.workspaces}
      isSuperAdmin={row?.isSuperAdmin === true}
    >
      {children}
    </PanelShell>
  );
}
