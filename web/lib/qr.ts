import QRCode from 'qrcode';

/** Render a QR code for `text` to a PNG data URL (server-side). */
export async function qrDataUrl(text: string): Promise<string | null> {
  try {
    return await QRCode.toDataURL(text, {
      margin: 1,
      width: 240,
      color: {dark: '#0F172A', light: '#FFFFFF'},
    });
  } catch {
    return null;
  }
}
