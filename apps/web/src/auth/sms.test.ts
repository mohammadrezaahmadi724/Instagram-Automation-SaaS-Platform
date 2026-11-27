import { afterEach, describe, expect, it } from 'vitest';
import { testHelperEnabled } from './sms';

const previousNodeEnv = process.env.NODE_ENV;
const previousFlag = process.env.OTP_TEST_HELPER;

function setNodeEnv(value: string) {
  (process.env as { NODE_ENV: string }).NODE_ENV = value;
}

afterEach(() => {
  setNodeEnv(previousNodeEnv ?? 'test');
  if (previousFlag === undefined) delete process.env.OTP_TEST_HELPER;
  else process.env.OTP_TEST_HELPER = previousFlag;
});

describe('otp test helper', () => {
  it('stays closed in production even when the flag is set', () => {
    setNodeEnv('production');
    process.env.OTP_TEST_HELPER = '1';
    expect(testHelperEnabled()).toBe(false);
  });

  it('opens only outside production with the explicit flag', () => {
    setNodeEnv('test');
    process.env.OTP_TEST_HELPER = '1';
    expect(testHelperEnabled()).toBe(true);
    process.env.OTP_TEST_HELPER = '0';
    expect(testHelperEnabled()).toBe(false);
  });
});
