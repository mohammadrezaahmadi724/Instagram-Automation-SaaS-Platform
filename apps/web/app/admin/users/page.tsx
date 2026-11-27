import { listPlans, listUsers } from '../../../src/admin/service';
import { UsersTable } from './users-table';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [users, plans] = await Promise.all([listUsers(q?.trim() ?? ''), listPlans()]);
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <h1 className="text-3xl font-bold">کاربران و فضاها</h1>
      <UsersTable users={users ?? []} plans={plans ?? []} />
    </div>
  );
}
