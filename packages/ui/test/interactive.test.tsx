import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it } from 'vitest';

beforeAll(() => {
  Element.prototype.scrollIntoView = () => undefined;
});
import { Checkbox } from '../src/components/checkbox';
import { ConfirmDialog } from '../src/components/confirm-dialog';
import { DataTable, type DataColumn } from '../src/components/data-table';
import { FormField } from '../src/components/field';
import { Input } from '../src/components/input';
import { Select, SelectItem } from '../src/components/select';
import { AppShell, type ShellNavItem } from '../src/components/shell/app-shell';
import { TabList, TabPanel, TabTrigger, Tabs } from '../src/components/tabs';

const nav: ShellNavItem[] = [
  { href: '/overview', label: 'نمای کلی', group: 'کار', icon: <span>ن</span> },
  { href: '/design', label: 'کاتالوگ', group: 'سامانه', icon: <span>ک</span> },
];

const columns: DataColumn<{ id: string; name: string }>[] = [
  { accessorKey: 'name', header: 'نام' },
];

describe('interactive components', () => {
  it('connects form field description and error', () => {
    render(
      <FormField id="city" label="شهر" description="نمونه" error="الزامی است">
        {(field) => <Input {...field} />}
      </FormField>,
    );
    const field = screen.getByLabelText('شهر');
    expect(field.getAttribute('aria-invalid')).toBe('true');
    expect(field.getAttribute('aria-describedby')).toContain('city-error');
  });

  it('toggles a checkbox with Space', async () => {
    const user = userEvent.setup();
    render(<Checkbox label="یادآوری" />);
    const box = screen.getByRole('checkbox', { name: 'یادآوری' });
    box.focus();
    await user.keyboard(' ');
    expect(box.getAttribute('aria-checked')).toBe('true');
  });

  it('moves tabs with the RTL arrow, Home and End', async () => {
    render(
      <Tabs defaultValue="one">
        <TabList aria-label="نمونه">
          <TabTrigger value="one">اول</TabTrigger>
          <TabTrigger value="two">دوم</TabTrigger>
          <TabTrigger value="three">سوم</TabTrigger>
        </TabList>
        <TabPanel value="one">یک</TabPanel>
        <TabPanel value="two">دو</TabPanel>
        <TabPanel value="three">سه</TabPanel>
      </Tabs>,
    );
    const first = screen.getByRole('tab', { name: 'اول' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowLeft' });
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'دوم' }).getAttribute('aria-selected')).toBe('true');
    });
    fireEvent.keyDown(screen.getByRole('tab', { name: 'دوم' }), { key: 'End' });
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'سوم' }).getAttribute('aria-selected')).toBe('true');
    });
    fireEvent.keyDown(screen.getByRole('tab', { name: 'سوم' }), { key: 'Home' });
    await waitFor(() => {
      expect(first.getAttribute('aria-selected')).toBe('true');
    });
  });

  it('opens a select with the keyboard', () => {
    render(
      <Select label="انتخاب نمونه">
        <SelectItem value="one">گزینه‌ی اول</SelectItem>
        <SelectItem value="two">گزینه‌ی دوم</SelectItem>
      </Select>,
    );
    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: 'گزینه‌ی اول' })).toBeTruthy();
  });

  it('keeps confirm focus on cancel until the name matches', async () => {
    render(
      <ConfirmDialog
        title="حذف نمونه"
        consequence="این کار برنمی‌گردد."
        confirmLabel="حذف"
        confirmText="نمونه"
        trigger={<button type="button">باز کردن</button>}
        onConfirm={() => undefined}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'باز کردن' }));
    const cancel = await screen.findByRole('button', { name: 'انصراف' });
    await waitFor(() => expect(document.activeElement).toBe(cancel));
    const danger = screen.getByRole('button', { name: 'حذف' });
    expect((danger as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'نمونه' } });
    expect((danger as HTMLButtonElement).disabled).toBe(false);
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('button', { name: 'انصراف' })).toBeNull());
  });

  it('sorts a table and shows empty and loading', () => {
    const { rerender } = render(
      <DataTable
        caption="نمونه"
        columns={columns}
        data={[
          { id: 'b', name: 'ب' },
          { id: 'a', name: 'الف' },
        ]}
      />,
    );
    const header = screen.getAllByRole('columnheader', { name: 'نام' })[0];
    expect(header?.getAttribute('aria-sort')).toBe('none');
    const sortButton = screen.getAllByRole('button', { name: 'نام' })[0];
    if (!sortButton) throw new Error('sort button missing');
    fireEvent.click(sortButton);
    expect(header?.getAttribute('aria-sort')).toBe('ascending');
    rerender(<DataTable caption="نمونه" columns={columns} data={[]} status="empty" />);
    expect(document.body.textContent).toContain('فیلتر');
    rerender(<DataTable caption="نمونه" columns={columns} data={[]} status="loading" />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('moves sidebar focus with arrows and exposes the skip link first', () => {
    render(
      <AppShell title="نمای کلی" nav={nav} currentPath="/overview">
        <p>محتوا</p>
      </AppShell>,
    );
    const skip = screen.getByRole('link', { name: 'پرش به محتوا' });
    expect(skip.compareDocumentPosition(screen.getByRole('link', { name: 'نمای کلی' }))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    const current = screen.getByRole('link', { name: 'نمای کلی' });
    expect(current.getAttribute('aria-current')).toBe('page');
    current.focus();
    fireEvent.keyDown(current, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'کاتالوگ' }));
  });
});
