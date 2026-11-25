import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { NextConfig } from 'next';

function loadRootEnv() {
  const file = path.resolve(process.cwd(), '../../.env');
  try {
    const text = readFileSync(file, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const match = /^([A-Z0-9_]+)=(.*)$/.exec(line);
      const key = match?.[1];
      const value = match?.[2];
      if (key && value !== undefined && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    return;
  }
}

loadRootEnv();

const isProd = process.env.NODE_ENV === 'production';
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy-Report-Only',
    value:
      "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'",
  },
  ...(isProd
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1'],
  transpilePackages: ['@directora/ui', '@directora/core', '@directora/db'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
