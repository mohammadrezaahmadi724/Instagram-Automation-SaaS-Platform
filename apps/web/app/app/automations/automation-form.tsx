'use client';

import { Button, Input, Select, SelectItem, Textarea } from '@directora/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type AccountOption = { id: string; username: string };

export function AutomationForm({
  accounts,
  initial,
  ruleId,
}: {
  accounts: AccountOption[];
  ruleId?: string;
  initial?: {
    name: string;
    instagramAccountId: string;
    triggerType: string;
    mediaScope: string;
    mediaId: string;
    matchType: string;
    keywords: string;
    replyText: string;
    cooldownSeconds: number;
    publicCommentReplyText: string;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [name, setName] = useState(initial?.name ?? '');
  const [accountId, setAccountId] = useState(initial?.instagramAccountId ?? accounts[0]?.id ?? '');
  const [triggerType, setTriggerType] = useState(initial?.triggerType ?? 'POST_COMMENT');
  const [mediaScope, setMediaScope] = useState(initial?.mediaScope ?? 'ALL');
  const [mediaId, setMediaId] = useState(initial?.mediaId ?? '');
  const [matchType, setMatchType] = useState(initial?.matchType ?? 'CONTAINS');
  const [keywords, setKeywords] = useState(initial?.keywords ?? 'قیمت');
  const [replyText, setReplyText] = useState(
    initial?.replyText ?? 'سلام، جزئیات را برایتان می‌فرستیم.',
  );
  const [publicReply, setPublicReply] = useState(initial?.publicCommentReplyText ?? '');
  const [cooldown, setCooldown] = useState(String(initial?.cooldownSeconds ?? 60));
  const [buttons, setButtons] = useState<{ title: string; url: string }[]>([]);

  async function save() {
    setError('');
    const response = await fetch(ruleId ? `/api/automations/${ruleId}` : '/api/automations', {
      method: ruleId ? 'PATCH' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name,
        instagramAccountId: accountId,
        triggerType,
        mediaScope,
        mediaId: mediaId || undefined,
        matchType,
        keywords: keywords
          .split(/[,،]/)
          .map((item) => item.trim())
          .filter(Boolean),
        replyText,
        buttons: buttons
          .filter((button) => button.title && button.url)
          .map((button) => ({ type: 'web_url', title: button.title, url: button.url })),
        publicCommentReplyText: publicReply || undefined,
        sendPrivateReply: true,
        cooldownSeconds: Number(cooldown),
      }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string; id?: string };
    if (!response.ok) {
      setError(body.error ?? 'ذخیره ممکن نشد');
      return;
    }
    router.push('/app/automations');
    router.refresh();
  }

  return (
    <form
      className="grid gap-6 lg:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          نام دستور
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <Select label="حساب" value={accountId} onValueChange={setAccountId}>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.username}
            </SelectItem>
          ))}
        </Select>
        <Select label="تریگر" value={triggerType} onValueChange={setTriggerType}>
          <SelectItem value="POST_COMMENT">کامنت پست یا ریلز</SelectItem>
          <SelectItem value="DM">دایرکت</SelectItem>
          <SelectItem value="STORY_REPLY">ریپلای استوری</SelectItem>
        </Select>
        <Select label="دامنه" value={mediaScope} onValueChange={setMediaScope}>
          <SelectItem value="ALL">همهٔ پست‌ها</SelectItem>
          <SelectItem value="SPECIFIC">پست مشخص</SelectItem>
        </Select>
        {mediaScope === 'SPECIFIC' ? (
          <label className="flex flex-col gap-2 text-sm">
            شناسهٔ پست
            <bdi dir="ltr">
              <Input value={mediaId} onChange={(event) => setMediaId(event.target.value)} />
            </bdi>
          </label>
        ) : null}
        <Select label="تطبیق" value={matchType} onValueChange={setMatchType}>
          <SelectItem value="EXACT">دقیق</SelectItem>
          <SelectItem value="CONTAINS">شامل</SelectItem>
          <SelectItem value="ANY">هر پیامی</SelectItem>
        </Select>
        <label className="flex flex-col gap-2 text-sm">
          کلیدواژه‌ها، با ویرگول
          <Input value={keywords} onChange={(event) => setKeywords(event.target.value)} />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          متن پاسخ
          <Textarea
            maxBytes={1000}
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
          />
          <span className="text-sm text-muted">سقف ۱۰۰۰ نویسه و ۱۰۰۰ بایت</span>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          پاسخ عمومی کامنت، اختیاری
          <Textarea value={publicReply} onChange={(event) => setPublicReply(event.target.value)} />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          فاصلهٔ تکرار برای هر شخص، ثانیه
          <Input
            value={cooldown}
            onChange={(event) => setCooldown(event.target.value)}
            inputMode="numeric"
          />
        </label>
        {buttons.map((button, index) => (
          <div key={index} className="grid gap-2 md:grid-cols-2">
            <Input
              aria-label="عنوان دکمه"
              value={button.title}
              onChange={(event) =>
                setButtons((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, title: event.target.value } : item,
                  ),
                )
              }
            />
            <Input
              aria-label="نشانی دکمه"
              value={button.url}
              onChange={(event) =>
                setButtons((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, url: event.target.value } : item,
                  ),
                )
              }
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          disabled={buttons.length >= 3}
          onClick={() => setButtons((current) => [...current, { title: '', url: 'https://' }])}
        >
          افزودن دکمه
        </Button>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit">ذخیرهٔ دستور</Button>
      </div>
      <aside className="rounded-lg border border-border bg-surface p-4">
        <p className="mb-3 text-sm text-muted">پیش‌نمایش دایرکت</p>
        <div className="rounded-lg bg-primary-subtle p-3 text-sm text-primary-subtle-foreground">
          <p>{replyText || 'متن پاسخ اینجا دیده می‌شود.'}</p>
          <div className="mt-3 flex flex-col gap-2">
            {buttons
              .filter((button) => button.title)
              .map((button) => (
                <span
                  key={button.title}
                  className="rounded-md bg-surface px-3 py-2 text-center text-link"
                >
                  {button.title}
                </span>
              ))}
          </div>
        </div>
      </aside>
    </form>
  );
}
