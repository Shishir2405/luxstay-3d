import 'server-only';
import crypto from 'node:crypto';

// Unambiguous alphabet (no 0/O/1/I) for human-readable booking/RSVP codes.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Generates a code like `LX-7F3K9Q`. */
export function generateRefCode(prefix: string, length = 6): string {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i]! % ALPHABET.length];
  return `${prefix}-${out}`;
}
