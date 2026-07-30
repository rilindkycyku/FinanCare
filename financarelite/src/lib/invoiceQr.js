import { buildInvoicePayload, encodeInvoiceToLink, toQrPayloadUrl } from "./shareLink";
import { qrDataUrl, qrVersionFor, shrinkLogoDataUrl, QrTooLargeError } from "./qr";

const FALLBACK_QR_LOGO = "/img/web/apple-touch-icon.png";
// A logo may ride inside the payload only while the printed code stays readable, and on paper
// that's decided by how wide one module ends up being, not by the version number as such. The
// invoice prints the QR at 105 pt ≈ 37 mm (see FooterFatura); version 27 is 125 modules across,
// so ~0.30 mm each — the same physical module size the invoice already shipped with before, just
// in a bigger square. Past that, the printed copy is the first thing to stop scanning.
const MAX_COMFORTABLE_QR_VERSION = 27;

// Two copies of the same logo. The link can afford a legible PNG with its transparency intact;
// the QR is measured in hundreds of characters, so its copy is a tiny JPEG flattened onto white
// — measured on a real logo, that's ~1.1k characters of payload instead of ~2.2k, which is the
// difference between a scanned invoice carrying the business's mark and carrying nothing.
const LINK_LOGO_SIZE = [120, 60];
const QR_LOGO_SIZE = [48, 24];

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
  // A business that switched the logo off wants a plain invoice, so it doesn't ride along in the
  // link either — which leaves the QR smaller and easier to scan into the bargain.
  const logo = teDhenatBiznesit?.shfaqLogonNeFature === false ? null : teDhenatBiznesit?.logo;
  const [linkLogo, qrLogo] = await Promise.all([
    shrinkLogoDataUrl(logo, ...LINK_LOGO_SIZE),
    shrinkLogoDataUrl(logo, ...QR_LOGO_SIZE, { jpeg: true }),
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
    dataUrl = await qrDataUrl(qrText, logo || FALLBACK_QR_LOGO);
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
