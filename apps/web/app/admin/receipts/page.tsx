import { listReceipts } from '../../../src/admin/service';
import { ReceiptsTable } from './receipts-table';

export default async function AdminReceiptsPage() {
  const data = await listReceipts('PENDING', 1);
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <h1 className="text-3xl font-bold">فیش‌های کارت‌به‌کارت</h1>
      <ReceiptsTable rows={data?.receipts ?? []} />
    </div>
  );
}
