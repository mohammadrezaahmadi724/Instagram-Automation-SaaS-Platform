'use client';

import { Button, Input, toast } from '@directora/ui';
import { useEffect, useState } from 'react';

type CardSetting = { cardNumber?: string; iban?: string; accountHolderName?: string };
type ContactSetting = { telegram?: string; whatsapp?: string; phone?: string; email?: string };

export default function AdminSettingsPage() {
  const [card, setCard] = useState<CardSetting>({});
  const [contact, setContact] = useState<ContactSetting>({});

  useEffect(() => {
    void fetch('/api/admin/settings')
      .then((response) => response.json())
      .then((body: { settings: Record<string, CardSetting & ContactSetting> }) => {
        setCard(body.settings['billing.card_to_card'] ?? {});
        setContact(body.settings['support.contact'] ?? {});
      });
  }, []);

  async function save() {
    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ 'billing.card_to_card': card, 'support.contact': contact }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      toast.error(body.error ?? 'ذخیره ممکن نشد');
      return;
    }
    toast.success('تنظیمات ذخیره شد');
  }

  return (
    <form
      className="mx-auto flex w-full max-w-xl flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <h1 className="text-3xl font-bold">تنظیمات پلتفرم</h1>
      <label className="flex flex-col gap-1 text-sm">
        شماره کارت
        <Input
          value={card.cardNumber ?? ''}
          onChange={(event) => setCard({ ...card, cardNumber: event.target.value })}
          dir="ltr"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        شبا
        <Input
          value={card.iban ?? ''}
          onChange={(event) => setCard({ ...card, iban: event.target.value })}
          dir="ltr"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        نام صاحب حساب
        <Input
          value={card.accountHolderName ?? ''}
          onChange={(event) => setCard({ ...card, accountHolderName: event.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        تلگرام
        <Input
          value={contact.telegram ?? ''}
          onChange={(event) => setContact({ ...contact, telegram: event.target.value })}
          dir="ltr"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        واتساپ
        <Input
          value={contact.whatsapp ?? ''}
          onChange={(event) => setContact({ ...contact, whatsapp: event.target.value })}
          dir="ltr"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        تلفن
        <Input
          value={contact.phone ?? ''}
          onChange={(event) => setContact({ ...contact, phone: event.target.value })}
          dir="ltr"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        ایمیل
        <Input
          value={contact.email ?? ''}
          onChange={(event) => setContact({ ...contact, email: event.target.value })}
          dir="ltr"
        />
      </label>
      <Button type="submit">ذخیره</Button>
    </form>
  );
}
