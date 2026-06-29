import 'server-only';

/** A single file attachment carried on an outbound email. */
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

/** Provider-agnostic outbound email message. */
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

/**
 * Pluggable transport contract. `email.service` selects an implementation at
 * call-time from the live `email` settings namespace, so swapping providers
 * (or falling back) never requires a redeploy.
 */
export interface EmailProvider {
  readonly name: string;
  send(msg: EmailMessage): Promise<void>;
}
