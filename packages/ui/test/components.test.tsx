import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../src/components/button';
import { FieldError, Input, Label } from '../src/components/input';
import { AppThemeProvider, ThemeToggle } from '../src/components/theme-toggle';

describe('components', () => {
  it('marks a loading button busy and disabled', () => {
    render(<Button loading>ذخیره</Button>);
    const button = screen.getByRole('button', { name: 'ذخیره' });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('connects an input error to the field', () => {
    render(
      <div>
        <Label htmlFor="phone">شماره</Label>
        <Input id="phone" invalid aria-describedby="phone-error" />
        <FieldError id="phone-error">شماره نامعتبر است</FieldError>
      </div>,
    );
    const field = screen.getByLabelText('شماره');
    expect(field.getAttribute('aria-invalid')).toBe('true');
    expect(field.getAttribute('aria-describedby')).toBe('phone-error');
  });

  it('exposes a theme toggle label', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: () => ({
        matches: false,
        media: '',
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() {
          return false;
        },
      }),
    });
    render(
      <AppThemeProvider>
        <ThemeToggle />
      </AppThemeProvider>,
    );
    expect(screen.getByRole('group', { name: 'تغییر تم' }).getAttribute('aria-label')).toBe(
      'تغییر تم',
    );
  });
});
