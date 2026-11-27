'use client';

import { Button, EmptyState, Input, Textarea, toast } from '@directora/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Article = { id: string; titleFa: string; bodyMd: string };
type Category = { id: string; titleFa: string; articles: Article[] };

export function HelpAdmin({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [titleFa, setTitleFa] = useState('');
  const [slug, setSlug] = useState('');

  async function addCategory() {
    const response = await fetch('/api/admin/help/categories', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ titleFa, slug, icon: 'ن', sortOrder: categories.length }),
    });
    if (!response.ok) {
      toast.error('ساخت دسته ممکن نشد');
      return;
    }
    toast.success('دسته ساخته شد');
    setTitleFa('');
    setSlug('');
    router.refresh();
  }

  async function removeArticle(id: string) {
    const response = await fetch(`/api/admin/help/articles/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      toast.error('حذف مقاله ممکن نشد');
      return;
    }
    toast.success('مقاله حذف شد');
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void addCategory();
        }}
      >
        <Input value={titleFa} onChange={(event) => setTitleFa(event.target.value)} aria-label="عنوان دسته" />
        <Input value={slug} onChange={(event) => setSlug(event.target.value)} aria-label="نامک دسته" />
        <Button type="submit">دسته جدید</Button>
      </form>
      {categories.length === 0 ? (
        <EmptyState kind="first-use" title="دسته‌ای نیست" description="اولین دسته راهنما را بسازید." />
      ) : (
        categories.map((category) => (
          <section key={category.id} className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4">
            <h2 className="text-lg font-semibold">{category.titleFa}</h2>
            {category.articles.map((article) => (
              <div key={article.id} className="flex flex-col gap-2">
                <p>{article.titleFa}</p>
                <Textarea value={article.bodyMd} readOnly aria-label={article.titleFa} />
                <Button type="button" variant="outline" onClick={() => void removeArticle(article.id)}>
                  حذف مقاله
                </Button>
              </div>
            ))}
          </section>
        ))
      )}
    </div>
  );
}
