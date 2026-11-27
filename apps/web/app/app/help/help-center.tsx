'use client';

import { toPersianDigits } from '@directora/core';
import { Button, Dialog, DialogContent, EmptyState, Input } from '@directora/ui';
import { useMemo, useState } from 'react';

type Article = { id: string; titleFa: string; summaryFa: string; bodyMd: string };
type Category = { id: string; titleFa: string; icon: string; articles: Article[] };

function filled(value: string | undefined) {
  const text = value?.trim() ?? '';
  return text.length > 0;
}

export function HelpCenter({
  categories,
  contact,
}: {
  categories: Category[];
  contact: Record<string, string>;
}) {
  const [query, setQuery] = useState('');
  const [article, setArticle] = useState<Article | null>(null);
  const filtered = useMemo(() => {
    const needle = query.trim();
    return categories
      .map((category) => ({
        ...category,
        articles: category.articles.filter(
          (item) => !needle || item.titleFa.includes(needle) || item.summaryFa.includes(needle),
        ),
      }))
      .filter((category) => category.articles.length > 0);
  }, [categories, query]);
  const channels = [
    ['تلگرام', contact.telegram],
    ['واتساپ', contact.whatsapp],
    ['تلفن', contact.phone],
    ['ایمیل', contact.email],
  ].filter((item): item is [string, string] => filled(item[1]));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h1 className="text-3xl font-bold">راهنما</h1>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="جستجو در عنوان و خلاصه"
        aria-label="جستجو در راهنما"
      />
      {filtered.length === 0 ? (
        <EmptyState kind="filter" title="مطلبی پیدا نشد" description="عبارت دیگری را جستجو کنید." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((category) => (
            <section key={category.id} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
              <h2 className="text-lg font-semibold">
                <span className="me-2 inline-flex size-8 items-center justify-center rounded-full bg-primary-subtle text-primary">
                  {category.icon}
                </span>
                {category.titleFa}
              </h2>
              {category.articles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="min-h-11 rounded-md border border-border px-3 py-2 text-start hover:bg-surface-sunken"
                  onClick={() => setArticle(item)}
                >
                  <span className="block font-medium">{item.titleFa}</span>
                  <span className="block text-sm text-subtle">{item.summaryFa}</span>
                </button>
              ))}
            </section>
          ))}
        </div>
      )}
      <section className="rounded-lg border border-border bg-surface p-4">
        <h2 className="text-lg font-semibold">ارتباط با ما</h2>
        {channels.length === 0 ? (
          <p className="mt-2 text-sm text-subtle">راه تماس هنوز در تنظیمات پلتفرم ثبت نشده است.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2 text-sm">
            {channels.map(([label, value]) => (
              <li key={label}>
                {label}: <bdi dir="ltr">{value}</bdi>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-sm text-muted">{toPersianDigits(String(categories.length))} دسته</p>
      </section>
      <Dialog open={article !== null} onOpenChange={(open) => !open && setArticle(null)}>
        <DialogContent title={article?.titleFa ?? 'مطلب'} description={article?.summaryFa}>
          <p className="whitespace-pre-line text-sm leading-7">{article?.bodyMd}</p>
          <Button type="button" variant="outline" onClick={() => setArticle(null)}>
            بستن
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
