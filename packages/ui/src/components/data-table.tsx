'use client';

import { flexRender, type RowData, type SortingState } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useLegacyTable,
  type LegacyColumnDef,
} from '@tanstack/react-table/legacy';
import { useState } from 'react';
import { Checkbox } from './checkbox';
import { ErrorState } from './error-state';
import { Pagination } from './pagination';
import { Skeleton } from './skeleton';

export type DataColumn<T extends RowData> = LegacyColumnDef<T, unknown>;

export function DataTable<T extends RowData & { id: string }>({
  data,
  columns,
  status = 'ready',
  onRetry,
  caption,
}: {
  data: T[];
  columns: DataColumn<T>[];
  status?: 'ready' | 'loading' | 'empty' | 'error';
  onRetry?: () => void;
  caption: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const table = useLegacyTable({
    data: status === 'ready' ? data : [],
    columns,
    state: { sorting, rowSelection },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
  });
  const rows = table.getRowModel().rows;
  const page = table.getState().pagination.pageIndex + 1;

  if (status === 'error') {
    return (
      <ErrorState
        title="جدول بارگذاری نشد"
        description="ارتباط با سرور قطع شد. دوباره تلاش کنید."
        errorId="sample-table"
        {...(onRetry ? { onRetry } : {})}
      />
    );
  }

  const body =
    status === 'loading' ? (
      <tr>
        <td colSpan={columns.length + 1} className="p-3">
          <div className="flex flex-col gap-2" aria-busy="true">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </td>
      </tr>
    ) : rows.length === 0 || status === 'empty' ? (
      <tr>
        <td colSpan={columns.length + 1} className="p-6 text-sm text-subtle">
          با این فیلتر نتیجه‌ای نیست.
        </td>
      </tr>
    ) : (
      rows.map((row) => (
        <tr key={row.id} className="border-t border-border">
          <td className="p-2">
            <Checkbox
              hideLabel
              label={`انتخاب ${row.id}`}
              checked={row.getIsSelected()}
              onCheckedChange={(checked) => row.toggleSelected(checked === true)}
            />
          </td>
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id} className="px-3 py-2 text-sm tabular-nums">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))
    );

  return (
    <div data-testid="data-table" className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:hidden">
        {status === 'loading' ? (
          <div className="flex flex-col gap-2" aria-busy="true">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : rows.length === 0 || status === 'empty' ? (
          <p className="text-sm text-subtle">با این فیلتر نتیجه‌ای نیست.</p>
        ) : (
          rows.map((row) => (
            <article key={row.id} className="rounded-lg border border-border bg-surface p-4">
              <Checkbox
                label={`انتخاب ${row.id}`}
                checked={row.getIsSelected()}
                onCheckedChange={(checked) => row.toggleSelected(checked === true)}
              />
              <dl className="mt-2 flex flex-col gap-2">
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id} className="flex items-baseline justify-between gap-3">
                    <dt className="text-sm text-muted">
                      {typeof cell.column.columnDef.header === 'string'
                        ? cell.column.columnDef.header
                        : cell.column.id}
                    </dt>
                    <dd className="text-sm tabular-nums">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))
        )}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-start">
          <caption className="sr-only">{caption}</caption>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="border-b border-border">
                <th className="p-2 text-start">
                  <Checkbox
                    hideLabel
                    label="انتخاب همه"
                    checked={
                      table.getIsAllPageRowsSelected()
                        ? true
                        : table.getIsSomePageRowsSelected()
                          ? 'indeterminate'
                          : false
                    }
                    onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked === true)}
                  />
                </th>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      aria-sort={
                        sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'
                      }
                      className="px-3 py-2 text-start text-sm font-medium text-subtle"
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="inline-flex min-h-11 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>{body}</tbody>
        </table>
      </div>
      {status === 'ready' && table.getPageCount() > 1 ? (
        <Pagination
          page={page}
          pageCount={table.getPageCount()}
          onPageChange={(next) => table.setPageIndex(next - 1)}
        />
      ) : null}
    </div>
  );
}
