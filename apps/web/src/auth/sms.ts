import { getRedis } from './redis';

export type SmsProvider = {
  sendOtp(phoneE164: string, code: string): Promise<void>;
};

export function testHelperEnabled() {
  return process.env.NODE_ENV !== 'production' && process.env.OTP_TEST_HELPER === '1';
}

export async function rememberTestCode(phoneE164: string, code: string) {
  if (!testHelperEnabled()) return;
  const client = await getRedis().catch(() => null);
  if (!client) return;
  await client.set(`otp:test:${phoneE164}`, code, 'EX', 120);
}

export async function readTestCode(phoneE164: string) {
  if (!testHelperEnabled()) return null;
  const client = await getRedis().catch(() => null);
  if (!client) return null;
  return client.get(`otp:test:${phoneE164}`);
}

export function consoleSmsProvider(): SmsProvider {
  return {
    async sendOtp(phoneE164, code) {
      if (process.env.SMS_PROVIDER !== 'console' || process.env.NODE_ENV === 'production') {
        throw new Error('sms provider is unavailable');
      }
      await rememberTestCode(phoneE164, code);
      console.info(`otp console delivery for ${phoneE164}: ${code}`);
    },
  };
}

export function smsProvider(): SmsProvider {
  if (process.env.SMS_PROVIDER === 'console' && process.env.NODE_ENV !== 'production') {
    return consoleSmsProvider();
  }
  return {
    async sendOtp() {
      throw new Error('sms provider is unavailable');
    },
  };
}
