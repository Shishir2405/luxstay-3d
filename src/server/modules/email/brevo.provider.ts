import 'server-only';
import type { EmailMessage, EmailProvider } from './email-provider';

/** Brevo sender identity + API key, injected by the email service. */
export interface BrevoCredentials {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}

/**
 * Brevo (Sendinblue) transactional email transport.
 *
 * Uses the stable Brevo v3 REST API directly (POST /v3/smtp/email) rather than
 * the SDK client — the SDK's class surface churns across versions, but the REST
 * contract is stable and version-proof.
 */
export class BrevoProvider implements EmailProvider {
  readonly name = 'Brevo';
  private readonly apiKey: string;
  private readonly from: { email: string; name?: string };

  constructor(creds: BrevoCredentials) {
    this.apiKey = creds.apiKey;
    this.from = { email: creds.fromEmail, name: creds.fromName };
  }

  async send(msg: EmailMessage): Promise<void> {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': this.apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: this.from,
        to: [{ email: msg.to }],
        subject: msg.subject,
        htmlContent: msg.html,
        attachment: msg.attachments?.map((a) => ({
          name: a.filename,
          content: typeof a.content === 'string' ? a.content : a.content.toString('base64'),
        })),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Brevo send failed (${res.status}): ${body.slice(0, 200)}`);
    }
  }
}
