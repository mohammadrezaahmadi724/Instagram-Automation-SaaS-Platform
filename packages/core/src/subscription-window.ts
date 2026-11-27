const extendable = new Set(['TRIAL', 'ACTIVE', 'PAST_DUE']);

export function nextSubscriptionWindow(input: {
  now: Date;
  durationDays: number;
  targetPlanId: string;
  current: { planId: string; status: string; endsAt: Date } | null;
}): { mode: 'extend' | 'replace'; startsAt: Date; endsAt: Date } {
  const days = input.durationDays * 24 * 60 * 60 * 1000;
  const current = input.current;
  if (
    current &&
    current.planId === input.targetPlanId &&
    extendable.has(current.status) &&
    current.endsAt.getTime() > input.now.getTime()
  ) {
    return {
      mode: 'extend',
      startsAt: input.now,
      endsAt: new Date(current.endsAt.getTime() + days),
    };
  }
  return {
    mode: 'replace',
    startsAt: input.now,
    endsAt: new Date(input.now.getTime() + days),
  };
}
