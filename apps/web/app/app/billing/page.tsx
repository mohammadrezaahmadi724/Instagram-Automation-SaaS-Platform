import { billingOverview } from '../../../src/billing/service';
import { requireProfile } from '../../../src/panel/queries';
import { BillingPanel } from './billing-panel';
import { cookies } from 'next/headers';

export default async function BillingPage() {
  const profile = await requireProfile();
  const token = (await cookies()).get('directora_session')?.value ?? '';
  const overview = await billingOverview(token);
  if (!overview.ok) {
    return <p className="text-subtle">{overview.error}</p>;
  }
  const canPay = profile.workspace.role === 'ADMIN' || profile.workspace.role === 'OWNER';
  return (
    <BillingPanel
      {...overview.data}
      canPay={canPay}
      daysLeft={overview.data.subscription?.daysLeft ?? 0}
    />
  );
}
