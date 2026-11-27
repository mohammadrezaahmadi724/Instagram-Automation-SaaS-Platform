import { getPrisma } from '@directora/db';

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return getPrisma(url);
}

export async function publishedHelp() {
  const client = db();
  if (!client) return { categories: [], contact: {} as Record<string, string> };
  const [categories, setting] = await Promise.all([
    client.helpCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        articles: {
          where: { isPublished: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
    client.systemSetting.findUnique({ where: { key: 'support.contact' } }),
  ]);
  const contact =
    setting?.valueJson && typeof setting.valueJson === 'object'
      ? (setting.valueJson as Record<string, string>)
      : {};
  return {
    categories: categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      titleFa: category.titleFa,
      icon: category.icon,
      articles: category.articles.map((article) => ({
        id: article.id,
        slug: article.slug,
        titleFa: article.titleFa,
        summaryFa: article.summaryFa,
        bodyMd: article.bodyMd,
      })),
    })),
    contact,
  };
}
