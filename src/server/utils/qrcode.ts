import 'server-only';
import QRCode from 'qrcode';

/** Encodes `text` as a QR code and returns a base64 PNG data URL. */
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text);
}

/** Encodes `text` as a QR code and returns the raw PNG bytes. */
export async function qrPngBuffer(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text);
}
