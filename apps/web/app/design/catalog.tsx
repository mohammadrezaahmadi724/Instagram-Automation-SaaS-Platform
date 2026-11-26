'use client';

import { useState } from 'react';
import { formatJalali, formatToman } from '@directora/core';
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Combobox,
  ConfirmDialog,
  DataTable,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  EmptyState,
  ErrorState,
  FormField,
  Input,
  NoPermissionState,
  Pagination,
  RadioGroup,
  RadioItem,
  Select,
  SelectItem,
  StatCard,
  Switch,
  TabList,
  TabPanel,
  TabTrigger,
  Tabs,
  Textarea,
  toast,
  type DataColumn,
} from '@directora/ui';
import { DesignLab } from '../design-lab';

const sections = [
  ['fields', 'فیلدها'],
  ['choice', 'انتخاب'],
  ['overlay', 'لایه‌ها'],
  ['feedback', 'بازخورد'],
  ['table', 'جدول'],
  ['palette', 'پالت'],
] as const;

const sampleDate = new Date('2026-11-25T08:30:00+03:30');

type SampleRow = { id: string; name: string; when: string; amount: string };

const sampleRows: SampleRow[] = [
  {
    id: 'sample-1',
    name: 'اتوماسیون نمونه ۱',
    when: formatJalali(sampleDate),
    amount: formatToman(12500000),
  },
  {
    id: 'sample-2',
    name: 'اتوماسیون نمونه ۲',
    when: formatJalali(sampleDate),
    amount: formatToman(8400000),
  },
  {
    id: 'sample-3',
    name: 'اتوماسیون نمونه ۳',
    when: formatJalali(sampleDate),
    amount: formatToman(2300000),
  },
];

const columns: DataColumn<SampleRow>[] = [
  { accessorKey: 'name', header: 'نام' },
  { accessorKey: 'when', header: 'تاریخ' },
  { accessorKey: 'amount', header: 'مبلغ' },
];

function StateLabel({ children }: { children: string }) {
  return <p className="text-xs font-medium text-muted">{children}</p>;
}

export function DesignCatalog() {
  const [page, setPage] = useState(1);
  const [combo, setCombo] = useState('');
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 py-8">
      <nav aria-label="بخش‌های کاتالوگ" className="flex flex-wrap gap-2">
        {sections.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="inline-flex min-h-11 items-center rounded-md px-3 text-link"
          >
            {label}
          </a>
        ))}
        <a href="/overview" className="inline-flex min-h-11 items-center rounded-md px-3 text-link">
          پوسته‌ی برنامه
        </a>
      </nav>

      <section id="fields" className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">فیلدها</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <StateLabel>پیش‌فرض</StateLabel>
            <FormField id="name" label="نام نمونه" description="برچسب جدا از placeholder است.">
              {(field) => <Input {...field} placeholder="نام" />}
            </FormField>
          </div>
          <div className="flex flex-col gap-2">
            <StateLabel>غیرفعال</StateLabel>
            <Input aria-label="فیلد غیرفعال" disabled defaultValue="به‌زودی" />
          </div>
          <div className="flex flex-col gap-2" data-testid="form-error">
            <StateLabel>خطا</StateLabel>
            <FormField id="email" label="ایمیل نمونه" error="ایمیل نامعتبر است.">
              {(field) => <Input {...field} dir="ltr" defaultValue="not-an-email" />}
            </FormField>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-2">
            <StateLabel>کوچک</StateLabel>
            <Input aria-label="اندازه کوچک" fieldSize="sm" />
          </div>
          <div className="flex flex-col gap-2">
            <StateLabel>متوسط</StateLabel>
            <Input aria-label="اندازه متوسط" fieldSize="md" />
          </div>
          <div className="flex flex-col gap-2">
            <StateLabel>بزرگ</StateLabel>
            <Input aria-label="اندازه بزرگ" fieldSize="lg" />
          </div>
        </div>
        <Textarea aria-label="پیام نمونه" maxBytes={1000} defaultValue="متن نمونه‌ی چندخطی" />
      </section>

      <section id="choice" className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">انتخاب</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="انتخاب نمونه" placeholder="انتخاب نمونه">
            <SelectItem value="one">گزینه‌ی نمونه ۱</SelectItem>
            <SelectItem value="two">گزینه‌ی نمونه ۲</SelectItem>
          </Select>
          <Select invalid label="انتخاب با خطا" placeholder="انتخاب با خطا">
            <SelectItem value="bad">نامعتبر</SelectItem>
          </Select>
          <Combobox
            label="جستجوی نمونه"
            placeholder="جستجو"
            value={combo}
            onValueChange={setCombo}
            options={[
              { value: 'a', label: 'اتوماسیون نمونه ۱', latin: 'auto-1' },
              { value: 'b', label: 'اتوماسیون نمونه ۲', latin: 'auto-2' },
            ]}
          />
          <Combobox label="جستجوی در حال بارگذاری" loading options={[]} />
          <Combobox label="جستجوی خالی" options={[]} />
        </div>
        <div className="flex flex-wrap gap-4">
          <Checkbox label="انتخاب نمونه" />
          <Checkbox label="نامشخص" checked="indeterminate" />
          <Checkbox label="غیرفعال" disabled />
        </div>
        <RadioGroup legend="گروه نمونه" defaultValue="a">
          <RadioItem value="a" label="گزینه‌ی الف" />
          <RadioItem value="b" label="گزینه‌ی ب" />
        </RadioGroup>
        <RadioGroup legend="گروه با خطا" error="یکی را انتخاب کنید.">
          <RadioItem value="c" label="گزینه‌ی ج" />
        </RadioGroup>
        <div className="flex items-center gap-3">
          <StateLabel>سوئیچ</StateLabel>
          <Switch aria-label="نمونه‌ی سوئیچ" data-testid="catalog-switch" />
          <Switch aria-label="سوئیچ در حال ذخیره" loading />
        </div>
        <Tabs defaultValue="one">
          <TabList aria-label="نمونه‌ی زبانه‌ها">
            <TabTrigger value="one">اول</TabTrigger>
            <TabTrigger value="two">دوم</TabTrigger>
            <TabTrigger value="three">سوم</TabTrigger>
          </TabList>
          <TabPanel value="one">نمای اول نمونه</TabPanel>
          <TabPanel value="two">نمای دوم نمونه</TabPanel>
          <TabPanel value="three">نمای سوم نمونه</TabPanel>
        </Tabs>
      </section>

      <section id="overlay" className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">لایه‌ها</h2>
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                گفتگو
              </Button>
            </DialogTrigger>
            <DialogContent
              title="گفتگوی نمونه"
              description="این پنجره تمرکز را نگه می‌دارد و با Esc بسته می‌شود."
            >
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  بستن
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
          <ConfirmDialog
            title="حذف اتوماسیون نمونه"
            consequence="این کار برنمی‌گردد و پیام‌های وابسته هم حذف می‌شوند."
            confirmLabel="حذف"
            confirmText="نمونه"
            trigger={
              <Button type="button" variant="destructive">
                حذف نمونه
              </Button>
            }
            onConfirm={() => toast.error('حذف نمونه انجام نشد')}
          />
        </div>
      </section>

      <section id="feedback" className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">بازخورد</h2>
        <div className="flex flex-wrap gap-2" data-testid="badge-row">
          <Badge>خنثی</Badge>
          <Badge variant="primary">اصلی</Badge>
          <Badge variant="success">موفق</Badge>
          <Badge variant="warning">هشدار</Badge>
          <Badge variant="danger">خطر</Badge>
          <Badge variant="info">اطلاع</Badge>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => toast.success('پیام نمونه نمایش داده شد')}>
            نمایش پیام موفقیت
          </Button>
          <Button type="button" variant="outline" onClick={() => toast.error('خطای نمونه')}>
            پیام خطا
          </Button>
          <Button type="button" variant="outline" onClick={() => toast.warning('هشدار نمونه')}>
            پیام هشدار
          </Button>
          <Button type="button" variant="outline" onClick={() => toast.info('اطلاع نمونه')}>
            پیام اطلاع
          </Button>
          <Button type="button" disabled>
            غیرفعال
          </Button>
          <Button type="button" loading>
            بارگذاری
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="پاسخ نمونه" value="۱۲۸" direction="up" delta="۱۲" />
          <StatCard label="در حال بارگذاری" value="" loading />
          <div className="flex items-center gap-3">
            <Avatar name="نگار" />
            <Avatar name="آرمین" size="lg" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2" data-testid="both-themes">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4">
            <StateLabel>تم روشن</StateLabel>
            <Button type="button">اصلی</Button>
            <Badge variant="info">اطلاع</Badge>
          </div>
          <div className="dark flex flex-col gap-3 rounded-lg border border-border bg-background p-4 text-foreground">
            <StateLabel>تم تیره</StateLabel>
            <Button type="button">اصلی</Button>
            <Badge variant="info">اطلاع</Badge>
          </div>
        </div>
        <EmptyState
          kind="first-use"
          title="هنوز اتوماسیونی نساخته‌اید"
          description="این حالت اولین استفاده است و با فیلتر خالی فرق دارد."
        />
        <EmptyState
          kind="filter"
          title="با این فیلتر نتیجه‌ای نیست"
          description="فیلتر را عوض کنید. داده‌ی این بخش نمونه است."
        />
        <ErrorState
          title="ذخیره انجام نشد"
          description="ارتباط با سرور قطع شد. دوباره تلاش کنید."
          errorId="sample-err"
          onRetry={() => toast.info('تلاش دوباره نمونه')}
        />
        <NoPermissionState description="از مالک Workspace بخواهید نقش شما را عوض کند. دکمه مخفی نشده است چون کاری برای انجام دادن وجود ندارد." />
        <Pagination page={page} pageCount={3} onPageChange={setPage} />
      </section>

      <section id="table" className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">جدول نمونه</h2>
        <DataTable caption="اتوماسیون‌های نمونه" data={sampleRows} columns={columns} />
        <div data-testid="table-loading">
          <DataTable caption="جدول در حال بارگذاری" data={[]} columns={columns} status="loading" />
        </div>
        <div data-testid="table-empty">
          <DataTable caption="جدول خالی" data={[]} columns={columns} status="empty" />
        </div>
        <DataTable
          caption="جدول خطا"
          data={[]}
          columns={columns}
          status="error"
          onRetry={() => toast.info('تلاش دوباره نمونه')}
        />
      </section>

      <section id="palette" className="flex flex-col gap-8">
        <h2 className="text-2xl font-bold">پالت و نمونه‌های قبلی</h2>
        <DesignLab />
      </section>
    </div>
  );
}
