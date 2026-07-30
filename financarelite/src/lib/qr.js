import QRCode from "qrcode";

/** Thrown when the invoice payload is too large to fit in a QR code. */
export class QrTooLargeError extends Error {
  constructor(message) {
    super(message);
    this.name = "QrTooLargeError";
  }
}

// A full invoice payload fills a dense, high-version QR: at 480px its modules land under ~2px
// each and phone cameras (and zxing on the exported PDF) start missing it. 960px keeps every
// module comfortably above that, and the PNG still costs only tens of KB inside the PDF.
const QR_SIZE = 960;
const QR_BASE_OPTIONS = { margin: 1, width: QR_SIZE, color: { dark: "#0f172a", light: "#ffffff" } };

function asQrTooLarge(err) {
  if (err instanceof Error && /too (big|long)|overflow|maximum/i.test(err.message)) {
    return new QrTooLargeError(err.message);
  }
  return err;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Business logos are stored as data URLs and the fallback mark is served from our own
    // origin, so this only matters if a logo ever comes from elsewhere — without it the
    // canvas would be tainted and toDataURL() would throw.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Nuk u ngarkua dot logoja: ${src}`));
    img.src = src;
  });
}

/** Picks the error-correction level to draw an invoice QR at. A logo punched into the middle
 * destroys the modules underneath it, so the code only survives it with enough redundancy — L
 * (7%) doesn't have it. But redundancy costs capacity: asking for more of it can push the code
 * up a few versions, and a denser grid of smaller modules is exactly what makes a camera give
 * up. So the level chosen is the *strongest one that doesn't make the code any bigger* — free
 * robustness on small payloads (which land on H), no extra density on invoice-sized ones. */
function bestQrLevel(text) {
  let best = null;
  let lastError = null;
  for (const level of ["L", "M", "Q", "H"]) {
    try {
      const { version } = QRCode.create(text, { errorCorrectionLevel: level });
      if (!best || version <= best.version) best = { level, version };
    } catch (err) {
      lastError = err; // payload doesn't fit at this level — weaker levels may still work
    }
  }
  if (!best) throw asQrTooLarge(lastError || new Error("QR code generation failed"));
  return best.level;
}

/** The QR "version" (1-40) a string ends up needing — i.e. how dense the resulting grid is, 21
 * modules across at version 1 up to 177 at version 40. Returns null when it doesn't fit at all.
 * Lets a caller weigh how much payload a QR can carry *and still be comfortable to scan*, which
 * is a much lower bar than the absolute maximum. */
export function qrVersionFor(text) {
  try {
    return QRCode.create(text, { errorCorrectionLevel: bestQrLevel(text) }).version;
  } catch {
    return null;
  }
}

async function renderQrCanvas(text, options) {
  const errorCorrectionLevel = bestQrLevel(text);
  const canvas = document.createElement("canvas");
  try {
    await QRCode.toCanvas(canvas, text, { errorCorrectionLevel, ...QR_BASE_OPTIONS, ...options });
  } catch (err) {
    throw asQrTooLarge(err);
  }
  return { canvas, errorCorrectionLevel };
}

function drawCenteredLogo(canvas, logo, ratio) {
  const ctx = canvas.getContext("2d");
  const box = Math.round(canvas.width * ratio);
  const padding = Math.round(box * 0.12);
  const boxX = Math.round((canvas.width - box) / 2);
  const boxY = Math.round((canvas.height - box) / 2);

  // A quiet white plate behind the logo: scanners cope far better with one solid blanked-out
  // square than with a logo blended into the modules around it.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(boxX, boxY, box, box);

  const inner = box - padding * 2;
  const scale = Math.min(inner / logo.width, inner / logo.height);
  const w = logo.width * scale;
  const h = logo.height * scale;
  ctx.drawImage(logo, boxX + (box - w) / 2, boxY + (box - h) / 2, w, h);
}

// How much of the code's width the logo plate is allowed to take, per error-correction level.
// What matters is the *area* it blanks out versus the level's budget: 14% of the width is 2% of
// the modules against L's 7% allowance, 26% is under 7% against H's 30% — so every step stays
// well inside its own margin, and a small invoice payload (which lands on a strong level anyway)
// simply gets a larger mark.
const LOGO_RATIOS = { L: 0.14, M: 0.18, Q: 0.22, H: 0.26 };

/** Render a string to a QR-code PNG data URL, with `logoSrc` (the business logo, or any image)
 * drawn into the middle of the code. Falls back to a plain QR when there's no logo or it can't
 * be loaded — a code that scans without a logo beats a branded one that doesn't scan. */
export async function qrDataUrl(text, logoSrc, options) {
  const { canvas, errorCorrectionLevel } = await renderQrCanvas(text, options);
  if (logoSrc) {
    try {
      const logo = await loadImage(logoSrc);
      drawCenteredLogo(canvas, logo, LOGO_RATIOS[errorCorrectionLevel] || LOGO_RATIOS.L);
    } catch (err) {
      console.warn("QR pa logo:", err);
    }
  }
  return canvas.toDataURL("image/png");
}

/** Redraws a business logo (an arbitrarily large uploaded data URL) at a small size, so it can
 * ride inside a share link or a QR payload without bloating it. Returns null when there's no
 * logo, or when it can't be read.
 *
 * `jpeg` trades transparency for size and it is not a small difference: a logo is antialiased
 * artwork, which PNG stores badly — the same 48px-wide mark costs ~1.5 kB as PNG and ~0.7 kB as
 * JPEG once compressed, and inside a QR that gap decides whether the logo fits at all. The lost
 * transparency costs nothing here because the logo is only ever drawn on the invoice's white
 * paper, which is exactly what it gets flattened onto. */
export async function shrinkLogoDataUrl(dataUrl, maxWidth = 120, maxHeight = 60, { jpeg = false, quality = 0.6 } = {}) {
  if (!dataUrl) return null;
  try {
    const img = await loadImage(dataUrl);
    const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (jpeg) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return jpeg ? canvas.toDataURL("image/jpeg", quality) : canvas.toDataURL("image/png");
  } catch (err) {
    console.warn("Logoja nuk u zvogëlua dot për ndarje:", err);
    return null;
  }
}
