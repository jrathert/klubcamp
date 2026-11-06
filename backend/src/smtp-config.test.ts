import { describe, expect, it } from 'vitest';
import { smtpOptions } from './smtp-config.js';

const local = {
  SMTP_MODE: 'mailpit', SMTP_HOST: '127.0.0.1', SMTP_PORT: '1025', SMTP_SECURE: 'false',
};
const remote = {
  SMTP_HOST: 'smtp.example.test', SMTP_PORT: '587', SMTP_SECURE: 'false',
  SMTP_USER: 'user', SMTP_PASSWORD: 'password',
};

describe('SMTP configuration', () => {
  it('permits explicit loopback capture without TLS or authentication', () => {
    expect(smtpOptions(local)).toMatchObject({
      host: '127.0.0.1', port: 1025, secure: false, requireTLS: false, ignoreTLS: true,
    });
    expect(smtpOptions(local).auth).toBeUndefined();
    expect(smtpOptions({ ...local, SMTP_HOST: '::1' }).host).toBe('::1');
  });

  it.each([
    { NODE_ENV: 'production' }, { SMTP_HOST: 'smtp.example.test' },
    { SMTP_HOST: 'localhost' }, { SMTP_SECURE: 'true' },
    { SMTP_USER: 'user' }, { SMTP_PASSWORD: 'password' },
  ])('rejects unsafe local settings: %j', (override) => {
    expect(() => smtpOptions({ ...local, ...override })).toThrow();
  });

  it('defaults to authenticated STARTTLS, including in production', () => {
    const options = smtpOptions({ ...remote, NODE_ENV: 'production' });
    expect(options).toMatchObject({ secure: false, requireTLS: true,
      auth: { user: 'user', pass: 'password' } });
    expect(options.ignoreTLS).toBeUndefined();
  });

  it('supports authenticated implicit TLS', () => {
    expect(smtpOptions({ ...remote, SMTP_MODE: 'smtp', SMTP_SECURE: 'true', SMTP_PORT: '465' }))
      .toMatchObject({ secure: true, requireTLS: false, port: 465 });
  });

  it.each([
    { SMTP_MODE: 'unknown' }, { SMTP_HOST: '' }, { SMTP_PORT: '0' },
    { SMTP_PORT: '65536' }, { SMTP_PORT: '1.5' }, { SMTP_PORT: 'invalid' },
    { SMTP_SECURE: '' }, { SMTP_USER: '' }, { SMTP_PASSWORD: '' },
  ])('rejects incomplete or invalid ordinary SMTP settings: %j', (override) => {
    expect(() => smtpOptions({ ...remote, ...override })).toThrow();
  });
});
