import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import type { EmailMessage, EmailProvider } from './email-provider';

/** SMTP credentials + envelope sender, injected by the email service. */
export interface GmailSmtpCredentials {
  user: string;
  pass: string;
  fromEmail: string;
  fromName?: string;
}

/**
 * Gmail SMTP transport via nodemailer's `service: 'gmail'` shortcut. Requires
 * an app password (not the account password) supplied through `creds`.
 */
export class GmailSmtpProvider implements EmailProvider {
  readonly name = 'GmailSmtp';
  private readonly creds: GmailSmtpCredentials;
  private readonly transporter: Transporter;

  constructor(creds: GmailSmtpCredentials) {
    this.creds = creds;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: creds.user, pass: creds.pass },
    });
  }

  async send(msg: EmailMessage): Promise<void> {
    const from = this.creds.fromName
      ? `${this.creds.fromName} <${this.creds.fromEmail}>`
      : this.creds.fromEmail;

    await this.transporter.sendMail({
      from,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      attachments: msg.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });
  }
}
