// Provide an opt-in command that sends one SMTP test message to a supplied recipient.
import nodemailer from 'nodemailer';
import { required, runCheck } from './check-support.js';
import { smtpOptions } from './smtp-config.js';

// Validate the request, send using the explicit SMTP mode, and always close the transport.
await runCheck('SMTP', async () => {
  const recipient = process.argv[2];
  // Accept one plain address only, not lists or display-name syntax.
  if (process.argv.length !== 3 || !recipient || !/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(recipient)) {
    throw new Error('Supply one recipient');
  }
  const transport = nodemailer.createTransport(smtpOptions());
  try {
    const result = await transport.sendMail({
      from: required('SMTP_FROM'), to: recipient,
      subject: 'Klubcamp SMTP verification', text: 'This is an explicitly requested Klubcamp bootstrap test email.',
      disableFileAccess: true, disableUrlAccess: true,
    });
    if (result.accepted.length !== 1) throw new Error('Recipient not accepted');
  } finally {
    transport.close();
  }
});
