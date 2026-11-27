import { getRule, listAccounts } from '../../../../src/instagram/queries';
import { requireProfile } from '../../../../src/panel/queries';
import { notFound } from 'next/navigation';
import { AutomationForm } from '../automation-form';

export default async function EditAutomationPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireProfile();
  const { id } = await params;
  const [rule, accounts] = await Promise.all([
    getRule(profile.workspace.id, id),
    listAccounts(profile.workspace.id),
  ]);
  if (!rule) notFound();
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h1 className="text-3xl font-bold">ویرایش دستور</h1>
      <AutomationForm
        ruleId={rule.id}
        accounts={accounts.map((account) => ({ id: account.id, username: account.username }))}
        initial={{
          name: rule.name,
          instagramAccountId: rule.instagramAccountId,
          triggerType: rule.triggerType,
          mediaScope: rule.mediaScope,
          mediaId: rule.mediaId ?? '',
          matchType: rule.matchType,
          keywords: rule.keywords.join('، '),
          replyText: rule.replyText ?? '',
          cooldownSeconds: rule.cooldownSeconds,
          publicCommentReplyText: rule.publicCommentReplyText ?? '',
        }}
      />
    </div>
  );
}
