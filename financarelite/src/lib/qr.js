import QRCode from "qrcode";

/** Thrown when the invoice payload is too large to fit in a QR code. */
export class QrTooLargeError extends Error {
  constructor(message) {
    super(message);
    this.name = "QrTooLargeError";
  }
}

/** Render an arbitrary string to a QR-code PNG data URL. */
export async function qrDataUrl(text, options) {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: "L",
      margin: 1,
      width: 480,
      color: { dark: "#0f172a", light: "#ffffff" },
      ...options,
    });
  } catch (err) {
    if (err instanceof Error && /too (big|long)|overflow|maximum/i.test(err.message)) {
      throw new QrTooLargeError(err.message);
    }
    throw err;
  }
}
