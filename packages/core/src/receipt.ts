export type ReceiptFields = {
  referenceCode: string;
  payerCardLast4?: string;
  note?: string;
};

export function normalizeReceiptFields(input: {
  referenceCode: unknown;
  payerCardLast4?: unknown;
  note?: unknown;
}): { ok: true; value: ReceiptFields } | { ok: false; error: string } {
  const referenceCode = typeof input.referenceCode === 'string' ? input.referenceCode.trim() : '';
  if (referenceCode.length < 4 || referenceCode.length > 64) {
    return { ok: false, error: 'شماره پیگیری باید بین ۴ تا ۶۴ نویسه باشد' };
  }
  let payerCardLast4: string | undefined;
  if (input.payerCardLast4 !== undefined && input.payerCardLast4 !== null && input.payerCardLast4 !== '') {
    if (typeof input.payerCardLast4 !== 'string' || !/^\d{4}$/.test(input.payerCardLast4)) {
      return { ok: false, error: 'چهار رقم کارت باید دقیقاً چهار عدد باشد' };
    }
    payerCardLast4 = input.payerCardLast4;
  }
  let note: string | undefined;
  if (input.note !== undefined && input.note !== null && input.note !== '') {
    if (typeof input.note !== 'string' || input.note.length > 500) {
      return { ok: false, error: 'یادداشت حداکثر ۵۰۰ نویسه است' };
    }
    note = input.note;
  }
  const value: ReceiptFields = { referenceCode };
  if (payerCardLast4) value.payerCardLast4 = payerCardLast4;
  if (note) value.note = note;
  return { ok: true, value };
}

/** Client-supplied amounts are ignored. The stored amount is always the plan price. */
export function amountFromPlan(
  plan: { isActive: boolean; priceRial: bigint } | null,
  clientAmount?: unknown,
): { ok: true; amountRial: bigint } | { ok: false; error: string } {
  void clientAmount;
  if (!plan || !plan.isActive || plan.priceRial <= 0n) {
    return { ok: false, error: 'این پلن قابل خرید نیست' };
  }
  return { ok: true, amountRial: plan.priceRial };
}

export function pendingReceiptLimitError(pendingCount: number) {
  if (pendingCount >= 3) return 'حداکثر سه فیش در انتظار بررسی مجاز است';
  return null;
}
