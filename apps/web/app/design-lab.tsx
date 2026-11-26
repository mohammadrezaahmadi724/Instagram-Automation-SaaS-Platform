'use client';

import { useEffect, useState } from 'react';
import { contrastRatio, readableOn } from '@directora/core';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  FieldDescription,
  FieldError,
  Input,
  Label,
  Switch,
  toast,
} from '@directora/ui';

const scales = [
  {
    name: 'blue',
    steps: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
  {
    name: 'cyan',
    steps: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
  {
    name: 'ink',
    steps: [
      '0',
      '25',
      '50',
      '100',
      '200',
      '300',
      '400',
      '450',
      '500',
      '600',
      '700',
      '800',
      '850',
      '900',
      '950',
    ],
  },
  {
    name: 'orange',
    steps: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
  {
    name: 'amber',
    steps: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
  {
    name: 'green',
    steps: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
  {
    name: 'red',
    steps: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  },
] as const;

const semantics = [
  ['primary', 'bg-primary text-primary-foreground'],
  ['accent', 'bg-accent text-accent-foreground'],
  ['success', 'bg-success text-success-foreground'],
  ['warning', 'bg-warning text-warning-foreground'],
  ['danger', 'bg-danger text-danger-foreground'],
  ['info', 'bg-info text-info-foreground'],
] as const;

function channelToHex(color: string) {
  const match = color.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (!match?.[1] || !match[2] || !match[3]) return color.trim();
  const hex = [match[1], match[2], match[3]]
    .map((part) => Math.round(Number(part)).toString(16).padStart(2, '0'))
    .join('');
  return `#${hex}`;
}

export function DesignLab() {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [pairs, setPairs] = useState<Record<string, number>>({});

  useEffect(() => {
    const read = () => {
      const next: Record<string, number> = {};
      for (const [name] of semantics) {
        const card = document.querySelector<HTMLElement>(`[data-semantic="${name}"]`);
        if (!card) continue;
        const styles = getComputedStyle(card);
        next[name] = Math.round(contrastRatio(styles.color, styles.backgroundColor) * 100) / 100;
      }
      setPairs(next);
    };
    const frame = requestAnimationFrame(read);
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">پالت رنگ</h2>
        {scales.map((scale) => (
          <Card key={scale.name}>
            <CardHeader>
              <h3 className="text-lg font-semibold">{scale.name}</h3>
            </CardHeader>
            <CardContent>
              <div
                tabIndex={0}
                role="region"
                aria-label={`مقیاس رنگ ${scale.name}`}
                className="flex flex-wrap gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {scale.steps.map((step) => (
                  <Swatch
                    key={step}
                    name={`${scale.name}-${step}`}
                    variable={`--${scale.name}-${step}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">توکن‌های معنایی</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {semantics.map(([name, className]) => (
            <div key={name} data-semantic={name} className={`rounded-lg p-4 ${className}`}>
              <p className="font-semibold">{name}</p>
              <p>{pairs[name] ? `${pairs[name]} ✅ AA` : '…'}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">نمونه‌ی کامپوننت</h2>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => toast.success('پیام نمونه نمایش داده شد')}>
            نمایش پیام موفقیت
          </Button>
          <Button
            type="button"
            variant="secondary"
            loading={loading}
            onClick={() => {
              setLoading(true);
              window.setTimeout(() => setLoading(false), 1500);
            }}
          >
            حالت بارگذاری
          </Button>
          <Button type="button" variant="outline">
            حاشیه‌دار
          </Button>
          <Button type="button" variant="ghost">
            شفاف
          </Button>
          <Button type="button" variant="destructive">
            خطر
          </Button>
          <Button type="button" variant="link">
            پیوند
          </Button>
          <Button type="button" disabled>
            غیرفعال
          </Button>
          <Button type="button" size="sm">
            کوچک
          </Button>
          <Button type="button" size="lg">
            بزرگ
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>خنثی</Badge>
          <Badge variant="primary">اصلی</Badge>
          <Badge variant="accent">تاکید</Badge>
          <Badge variant="success">موفق</Badge>
          <Badge variant="warning">هشدار</Badge>
          <Badge variant="danger">خطر</Badge>
          <Badge variant="info">اطلاع</Badge>
        </div>
        <Card>
          <CardHeader>
            <h3 className="font-semibold">کارت نمونه</h3>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Label htmlFor="sample-phone">شماره نمونه</Label>
            <Input
              id="sample-phone"
              dir="ltr"
              defaultValue="+989120000000"
              invalid
              aria-describedby="sample-phone-help sample-phone-error"
            />
            <FieldDescription id="sample-phone-help">نمایش فیلد با جهت چپ‌به‌راست</FieldDescription>
            <FieldError id="sample-phone-error">نمونه‌ی خطای فیلد</FieldError>
            <div className="flex items-center gap-3">
              <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="نمونه‌ی سوئیچ" />
              <span>{enabled ? 'روشن' : 'خاموش'}</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function Swatch({ name, variable }: { name: string; variable: string }) {
  const [hex, setHex] = useState('');
  const [ink, setInk] = useState('');
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const probe = document.createElement('span');
      probe.style.backgroundColor = `var(${variable})`;
      document.body.append(probe);
      const computed = getComputedStyle(probe).backgroundColor;
      probe.remove();
      const value = channelToHex(computed);
      setHex(value);
      setInk(readableOn(value));
    });
    return () => cancelAnimationFrame(frame);
  }, [variable]);
  return (
    <div
      className="flex h-24 w-24 shrink-0 flex-col justify-end rounded-md p-2 text-xs"
      style={{ backgroundColor: `var(${variable})`, color: ink }}
    >
      <span>{name}</span>
      <span dir="ltr">{hex}</span>
    </div>
  );
}
