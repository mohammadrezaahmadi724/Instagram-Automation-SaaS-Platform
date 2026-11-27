'use client';

import { formatRialAsToman } from '@directora/core';
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  EmptyState,
  FieldError,
  Textarea,
  toast,
} from '@directora/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Receipt = {
  id: string;
  workspaceName: string;
  planName: string;
  amountRial: string;
  referenceCode: string;
  payerCardLast4: string | null;
  note: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNote: string | null;
};

export function ReceiptsTable({ rows }: { rows: Receipt[] }) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState<Receipt | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  async function approve(id: string) {
    const response = await fetch(`/api/admin/receipts/${id}/approve`, { method: 'POST' });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      toast.error(body.error ?? 'تأیید ممکن نشد');
      return;
    }
    toast.success('فیش تأیید شد');
    router.refresh();
  }

  async function reject() {
    if (!rejecting) return;
    const response = await fetch(`/api/admin/receipts/${rejecting.id}/reject`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reviewNote: reason }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setError(body.error ?? 'رد فیش ممکن نشد');
      toast.error(body.error ?? 'رد فیش ممکن نشد');
      return;
    }
    toast.success('فیش رد شد');
    setRejecting(null);
    setReason('');
    router.refresh();
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        kind="first-use"
        title="فیش در انتظاری نیست"
        description="فیش‌های تازه‌ثبت‌شده اینجا دیده می‌شوند."
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-sunken">
            <tr>
              <th className="px-3 py-3 text-start">فضا</th>
              <th className="px-3 py-3 text-start">پلن</th>
              <th className="px-3 py-3 text-start">مبلغ</th>
              <th className="px-3 py-3 text-start">پیگیری</th>
              <th className="px-3 py-3 text-start">وضعیت</th>
              <th className="px-3 py-3 text-start">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-3 py-3">{row.workspaceName}</td>
                <td className="px-3 py-3">{row.planName}</td>
                <td className="px-3 py-3 tabular-nums">
                  {formatRialAsToman(BigInt(row.amountRial))}
                </td>
                <td className="px-3 py-3">
                  <bdi dir="ltr">{row.referenceCode}</bdi>
                  {row.payerCardLast4 ? (
                    <span className="ms-2">
                      <bdi dir="ltr">{row.payerCardLast4}</bdi>
                    </span>
                  ) : null}
                  {row.note ? <p className="text-subtle">{row.note}</p> : null}
                </td>
                <td className="px-3 py-3">
                  <Badge variant="warning">در انتظار بررسی</Badge>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <Button type="button" onClick={() => void approve(row.id)}>
                      تأیید
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setRejecting(row)}>
                      رد
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={rejecting !== null} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent title="رد فیش" description="دلیل رد برای کاربر ذخیره می‌شود.">
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            aria-label="دلیل رد"
          />
          {error ? <FieldError id="reject-error">{error}</FieldError> : null}
          <DialogActions>
            <Button type="button" onClick={() => void reject()}>
              ثبت رد
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
}
