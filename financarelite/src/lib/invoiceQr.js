import { buildInvoicePayload, encodeInvoiceToLink, toQrPayloadUrl } from "./shareLink";
import { qrDataUrl, qrVersionFor, shrinkLogoDataUrl, QrTooLargeError } from "./qr";

const FALLBACK_QR_LOGO = "/img/web/apple-touch-icon.png";
// Past roughly this QR version the modules get small enough that phone cameras start to
// struggle, so a logo is only allowed to ride inside the payload while the code stays under it.
const MAX_COMFORTABLE_QR_VERSION = 20;

/** Builds the share link + QR PNG for one invoice, so it can both be embedded directly on the
 * invoice (header/footer, on-screen and PDF) and reused by the share modal — one computation,
 * shared everywhere.
 *
 * There's no server behind any of this: everything an opened invoice shows has to travel inside
 * the link itself, logo included. A URL has room for that; a QR mostly doesn't — so the two are
 * allowed to differ slightly:
 *  - the *link* (copied / shared / sent over WhatsApp) always carries a downscaled logo, so an
 *    invoice opened from it renders branded instead of showing the "kjo faqe nuk ka logo" box;
 *  - the *QR* carries a smaller copy of the logo only while the code stays comfortable to scan,
 *    and otherwise encodes the invoice alone. Either way the QR *image* gets the logo drawn into
 *    its middle, so the printed code still looks like the business's own. */
export async function buildInvoiceShareQr({ teDhenatBiznesit, banks, currencies, invoice }) {
  const payloadFor = (logo) => buildInvoicePayload({ teDhenatBiznesit, banks, currencies, invoice, logo });
  const [linkLogo, qrLogo] = await Promise.all([
    shrinkLogoDataUrl(teDhenatBiznesit?.logo, 120, 60),
    shrinkLogoDataUrl(teDhenatBiznesit?.logo, 56, 28),
  ]);

  const link = await encodeInvoiceToLink(payloadFor(linkLogo));

  let qrLink = link;
  if (qrLogo) {
    const withSmallLogo = await encodeInvoiceToLink(payloadFor(qrLogo));
    const version = qrVersionFor(toQrPayloadUrl(withSmallLogo));
    qrLink = version && version <= MAX_COMFORTABLE_QR_VERSION ? withSmallLogo : await encodeInvoiceToLink(payloadFor(null));
  }

  const qrText = toQrPayloadUrl(qrLink);
  // An invoice with too many items to encode at all isn't an error here: the link still works, and
  // it's the only thing left to offer, so it's reported alongside `tooLarge` rather than thrown.
  let dataUrl = null;
  let tooLarge = false;
  try {
    dataUrl = await qrDataUrl(qrText, teDhenatBiznesit?.logo || FALLBACK_QR_LOGO);
  } catch (err) {
    if (!(err instanceof QrTooLargeError)) throw err;
    tooLarge = true;
  }

  // Well before that limit a QR stops being pleasant to scan: past ~version 30 the grid is fine
  // enough that phones need a steady hand and a good camera. Flagged, not hidden, so the share
  // modal can point at the link instead.
  const version = qrVersionFor(qrText);
  return { link, dataUrl, tooLarge, dense: !!version && version > 30 };
}
