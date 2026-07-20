import { buildInvoicePayload, encodeInvoiceToLink, toQrPayloadUrl } from "./shareLink";
import { qrDataUrl } from "./qr";

/** Builds the share link + QR PNG for one invoice, so it can both be embedded directly on the
 * invoice (header/footer, on-screen and PDF) and reused by the share modal — one computation,
 * shared everywhere, so the printed QR and the "QR / Shpërndaj" modal always agree. */
export async function buildInvoiceShareQr({ teDhenatBiznesit, banks, currencies, invoice }) {
  const payload = buildInvoicePayload({ teDhenatBiznesit, banks, currencies, invoice });
  const link = await encodeInvoiceToLink(payload);
  const dataUrl = await qrDataUrl(toQrPayloadUrl(link));
  return { link, dataUrl };
}
