export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="مسیر">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-subtle">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">‹</span> : null}
              {last || !item.href ? (
                <span aria-current={last ? 'page' : undefined} className="text-foreground">
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className="text-link underline-offset-4 hover:underline">
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
