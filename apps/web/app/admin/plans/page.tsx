import { listPlans } from '../../../src/admin/service';
import { PlansEditor } from './plans-editor';

export default async function AdminPlansPage() {
  const plans = (await listPlans()) ?? [];
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <h1 className="text-3xl font-bold">پلن‌ها</h1>
      <PlansEditor plans={plans} />
    </div>
  );
}
