import { format } from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';
import { toPersianDigits } from './digits.js';

export type JalaliStyle = 'long' | 'numeric';

function tehranWallClock(date: Date): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');
  return new Date(
    read('year'),
    read('month') - 1,
    read('day'),
    read('hour'),
    read('minute'),
    read('second'),
  );
}

export function formatJalali(date: Date, style: JalaliStyle = 'long'): string {
  const pattern = style === 'numeric' ? 'yyyy/MM/dd' : 'd MMMM yyyy';
  return toPersianDigits(format(tehranWallClock(date), pattern, { locale: faIR }));
}

export function jalaliYear(date: Date = new Date()): string {
  return toPersianDigits(format(tehranWallClock(date), 'yyyy', { locale: faIR }));
}

const UNITS = [
  ['year', 60 * 60 * 24 * 365],
  ['month', 60 * 60 * 24 * 30],
  ['day', 60 * 60 * 24],
  ['hour', 60 * 60],
  ['minute', 60],
  ['second', 1],
] as const;

export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('fa-IR', { numeric: 'auto' });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size || unit === 'second') {
      return formatter.format(Math.trunc(seconds / size), unit);
    }
  }
  return formatter.format(0, 'second');
}
