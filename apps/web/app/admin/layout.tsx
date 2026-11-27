import { NoPermissionState } from '@directora/ui';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { loadSession } from '../../src/auth/service';
import { AdminShell } from './admin-shell';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const token = (await cookies()).get('directora_session')?.value ?? '';
  const session = await loadSession(token);
  if (!session) redirect('/login?callback=/admin');
  if (!session.user.isSuperAdmin) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center p-6">
        <NoPermissionState
          title="اجازه ورود به پنل مدیریت را ندارید"
          description="این بخش فقط برای مدیر پلتفرم است."
        />
      </main>
    );
  }
  return <AdminShell>{children}</AdminShell>;
}
