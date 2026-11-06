// Keep the plaintext development exception explicit and limited to local capture.
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

export function smtpOptions(env: NodeJS.ProcessEnv = process.env): SMTPTransport.Options {
  const required = (name: string) => {
    const value = env[name];
    if (!value) throw new Error('Missing configuration');
    return value;
  };
  const mode = env.SMTP_MODE ?? 'smtp';
  if (mode !== 'smtp' && mode !== 'mailpit') throw new Error('Invalid SMTP mode');
  const host = required('SMTP_HOST');
  const port = Number(required('SMTP_PORT'));
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port');
  const secure = required('SMTP_SECURE');
  if (secure !== 'true' && secure !== 'false') throw new Error('Invalid TLS setting');
  const options: SMTPTransport.Options = {
    host, port,
    connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 5000,
    logger: false, debug: false,
  };
  if (mode === 'mailpit') {
    // Numeric loopback addresses avoid DNS resolution to a nonlocal destination.
    if (env.NODE_ENV === 'production' || !['127.0.0.1', '::1'].includes(host)
      || secure !== 'false' || env.SMTP_USER || env.SMTP_PASSWORD) {
      throw new Error('Invalid local SMTP configuration');
    }
    return { ...options, secure: false, requireTLS: false, ignoreTLS: true };
  }
  return {
    ...options, secure: secure === 'true', requireTLS: secure === 'false',
    auth: { user: required('SMTP_USER'), pass: required('SMTP_PASSWORD') },
  };
}
