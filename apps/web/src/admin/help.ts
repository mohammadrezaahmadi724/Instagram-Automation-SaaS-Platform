import { getPrisma } from '@directora/db';

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return getPrisma(url);
}

function text(value: unknown, min: number, max: number) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) return null;
  return trimmed;
}

export async function listHelpAdmin() {
  const client = db();
  if (!client) return null;
  return client.helpCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { articles: { orderBy: { sortOrder: 'asc' } } },
  });
}

export async function createCategory(body: unknown) {
  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const slug = text(record.slug, 2, 60);
  const titleFa = text(record.titleFa, 2, 80);
  const icon = text(record.icon, 1, 8);
  if (!slug || !titleFa || !icon)
    return { ok: false as const, status: 400, error: 'دسته معتبر نیست' };
  const client = db();
  if (!client) return { ok: false as const, status: 500, error: 'داده در دسترس نیست' };
  const row = await client.helpCategory.create({
    data: {
      slug,
      titleFa,
      icon,
      sortOrder: Number(record.sortOrder) || 0,
      isActive: record.isActive !== false,
    },
  });
  return { ok: true as const, data: { id: row.id } };
}

export async function updateCategory(id: string, body: unknown) {
  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const titleFa = text(record.titleFa, 2, 80);
  const icon = text(record.icon, 1, 8);
  if (!titleFa || !icon) return { ok: false as const, status: 400, error: 'دسته معتبر نیست' };
  const client = db();
  if (!client) return { ok: false as const, status: 500, error: 'داده در دسترس نیست' };
  await client.helpCategory.update({
    where: { id },
    data: {
      titleFa,
      icon,
      sortOrder: Number(record.sortOrder) || 0,
      isActive: record.isActive !== false,
    },
  });
  return { ok: true as const, data: { id } };
}

export async function deleteCategory(id: string) {
  const client = db();
  if (!client) return { ok: false as const, status: 500, error: 'داده در دسترس نیست' };
  const articles = await client.helpArticle.count({ where: { categoryId: id } });
  if (articles > 0)
    return { ok: false as const, status: 409, error: 'اول مقاله‌های این دسته را حذف کنید' };
  await client.helpCategory.delete({ where: { id } });
  return { ok: true as const, data: { id } };
}

export async function createArticle(body: unknown) {
  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const categoryId = text(record.categoryId, 8, 80);
  const slug = text(record.slug, 2, 80);
  const titleFa = text(record.titleFa, 2, 120);
  const summaryFa = text(record.summaryFa, 2, 240);
  const bodyMd = text(record.bodyMd, 2, 8000);
  if (!categoryId || !slug || !titleFa || !summaryFa || !bodyMd) {
    return { ok: false as const, status: 400, error: 'مقاله معتبر نیست' };
  }
  const client = db();
  if (!client) return { ok: false as const, status: 500, error: 'داده در دسترس نیست' };
  const row = await client.helpArticle.create({
    data: {
      categoryId,
      slug,
      titleFa,
      summaryFa,
      bodyMd,
      sortOrder: Number(record.sortOrder) || 0,
      isPublished: record.isPublished !== false,
    },
  });
  return { ok: true as const, data: { id: row.id } };
}

export async function updateArticle(id: string, body: unknown) {
  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const titleFa = text(record.titleFa, 2, 120);
  const summaryFa = text(record.summaryFa, 2, 240);
  const bodyMd = text(record.bodyMd, 2, 8000);
  if (!titleFa || !summaryFa || !bodyMd)
    return { ok: false as const, status: 400, error: 'مقاله معتبر نیست' };
  const client = db();
  if (!client) return { ok: false as const, status: 500, error: 'داده در دسترس نیست' };
  await client.helpArticle.update({
    where: { id },
    data: {
      titleFa,
      summaryFa,
      bodyMd,
      sortOrder: Number(record.sortOrder) || 0,
      isPublished: record.isPublished !== false,
    },
  });
  return { ok: true as const, data: { id } };
}

export async function deleteArticle(id: string) {
  const client = db();
  if (!client) return { ok: false as const, status: 500, error: 'داده در دسترس نیست' };
  await client.helpArticle.delete({ where: { id } });
  return { ok: true as const, data: { id } };
}
