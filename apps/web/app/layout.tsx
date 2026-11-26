import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { AppThemeProvider, Toaster } from '@directora/ui';
import './globals.css';

const vazirmatn = localFont({
  src: './fonts/Vazirmatn[wght].woff2',
  variable: '--font-sans',
  display: 'swap',
  weight: '100 900',
});

const jetbrains = localFont({
  src: './fonts/JetBrainsMono[wght].woff2',
  variable: '--dr-font-mono',
  display: 'swap',
  weight: '100 800',
});

export const metadata: Metadata = {
  title: 'دایرکتورا',
  description: 'اتوماسیون رسمی و امن اینستاگرام برای کسب‌وکارهای ایرانی',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body>
        <AppThemeProvider>
          {children}
          <Toaster />
        </AppThemeProvider>
      </body>
    </html>
  );
}
