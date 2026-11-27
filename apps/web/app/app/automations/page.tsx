import { toPersianDigits } from '@directora/core';
import Link from 'next/link';
import { Badge, EmptyState } from '@directora/ui';
import { roleAtLeast } from '../../../src/auth/roles';
import { listRules } from '../../../src/instagram/queries';
import { requireProfile } from '../../../src/panel/queries';
import { RuleActions } from './rule-actions';

const triggers: Record<string, string> = {
  POST_COMMENT: 'کامنت',
  LIVE_COMMENT: 'لایو',
  DM: 'دایرکت',
  STORY_REPLY: 'استوری',
};

export default async function AutomationsPage() {
  const profile = await requireProfile();
  const rules = await listRules(profile.workspace.id);
  const canEdit = roleAtLeast(profile.workspace.role, 'AGENT');
  const canDelete = roleAtLeast(profile.workspace.role, 'ADMIN');
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">دستورها</h1>
        {canEdit ? (
          <Link
            href="/app/automations/new"
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-primary-foreground"
          >
            ساخت دستور
          </Link>
        ) : null}
      </div>
      {rules.length === 0 ? (
        <EmptyState
          kind="first-use"
          title="هنوز دستوری نیست"
          description="بعد از اتصال حساب، پاسخ خودکار را اینجا می‌سازید."
        />
      ) : (
        <ul className="grid gap-4">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{rule.name}</h2>
                  <p className="text-sm text-subtle">
                    <bdi dir="ltr">@{rule.instagramAccount.username}</bdi>
                  </p>
                </div>
                <Badge>{triggers[rule.triggerType] ?? rule.triggerType}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {rule.keywords.map((keyword) => (
                  <Badge key={keyword} variant="neutral">
                    {keyword}
                  </Badge>
                ))}
                <span className="text-sm text-muted tabular-nums">
                  {toPersianDigits(String(rule.executionCount))} اجرا
                </span>
              </div>
              {canEdit ? (
                <RuleActions id={rule.id} active={rule.status === 'ACTIVE'} canDelete={canDelete} />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
