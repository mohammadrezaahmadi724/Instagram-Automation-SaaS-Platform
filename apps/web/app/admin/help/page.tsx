import { listHelpAdmin } from '../../../src/admin/help';
import { HelpAdmin } from './help-admin';

export default async function AdminHelpPage() {
  const categories = ((await listHelpAdmin()) ?? []).map((category) => ({
    id: category.id,
    titleFa: category.titleFa,
    articles: category.articles.map((article) => ({
      id: article.id,
      titleFa: article.titleFa,
      bodyMd: article.bodyMd,
    })),
  }));
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <h1 className="text-3xl font-bold">مرکز راهنما</h1>
      <HelpAdmin categories={categories} />
    </div>
  );
}
