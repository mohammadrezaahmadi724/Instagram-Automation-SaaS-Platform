'use client';

import { formatJalali } from '@directora/core';
import { Badge, DataTable, type DataColumn } from '@directora/ui';

type LogRow = {
  id: string;
  createdAt: string;
  ruleName: string;
  triggerType: string;
  matchedKeyword: string;
  status: string;
  errorCode: string;
};

const labels: Record<string, string> = {
  SUCCESS: 'موفق',
  FAILED: 'ناموفق',
  SKIPPED_COOLDOWN: 'رد شده (کول‌داون)',
  SKIPPED_WINDOW: 'رد شده (خارج از پنجره)',
  SKIPPED_PLAN_LIMIT: 'رد شده (سقف پلن)',
  RATE_LIMITED: 'محدودیت نرخ',
  POST_COMMENT: 'کامنت',
  DM: 'دایرکت',
  STORY_REPLY: 'استوری',
  LIVE_COMMENT: 'لایو',
};

const columns: DataColumn<LogRow>[] = [
  { accessorKey: 'createdAt', header: 'زمان', cell: ({ row }) => formatJalali(new Date(row.original.createdAt), 'numeric') },
  { accessorKey: 'ruleName', header: 'دستور' },
  { accessorKey: 'triggerType', header: 'تریگر', cell: ({ row }) => labels[row.original.triggerType] ?? row.original.triggerType },
  { accessorKey: 'matchedKeyword', header: 'کلیدواژه' },
  {
    accessorKey: 'status',
    header: 'وضعیت',
    cell: ({ row }) => <Badge title={row.original.errorCode}>{labels[row.original.status] ?? row.original.status}</Badge>,
  },
];

export function LogsTable({ rows }: { rows: LogRow[] }) {
  return <DataTable caption="گزارش ارسال‌ها" data={rows} columns={columns} status={rows.length === 0 ? 'empty' : 'ready'} />;
}
