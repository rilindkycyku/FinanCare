/**
 * Encodes a single invoice into a URL hash so it can travel inside a QR code with no backend —
 * same technique GuestSeat uses for its share links (see its `shareLink.ts`): gzip-compress the
 * JSON, then base42-encode it. Base42 uses only characters from QR's *alphanumeric* mode
 * (digits, upper-case letters, a handful of symbols), which lets the QR encoder use its
 * high-capacity alphanumeric mode instead of byte mode — worth ~45% more data for the same QR
 * size, which matters since an invoice's line items can add up.
 */

const HASH_KEY = "i";
const MARK_GZIP_B42 = "A"; // gzip-compressed, base42 (default when CompressionStream is available)
const MARK_PLAIN_B42 = "B"; // uncompressed, base42 (fallback)

const hasCompression = typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";

// Same URL-fragment-safe, QR-alphanumeric-safe 42-character alphabet as GuestSeat's shareLink.ts.
const B42_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ.-:/*$";
const B42_REVERSE = {};
for (let i = 0; i < B42_ALPHABET.length; i++) B42_REVERSE[B42_ALPHABET[i]] = i;

function toBase42(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 2) {
    if (i + 1 < bytes.length) {
      let v = bytes[i] * 256 + bytes[i + 1];
      out += B42_ALPHABET[v % 42];
      v = Math.floor(v / 42);
      out += B42_ALPHABET[v % 42];
      out += B42_ALPHABET[Math.floor(v / 42)];
    } else {
      const v = bytes[i];
      out += B42_ALPHABET[v % 42];
      out += B42_ALPHABET[Math.floor(v / 42)];
    }
  }
  return out;
}

function fromBase42(text) {
  const out = [];
  let i = 0;
  for (; i + 3 <= text.length; i += 3) {
    const v = B42_REVERSE[text[i]] + B42_REVERSE[text[i + 1]] * 42 + B42_REVERSE[text[i + 2]] * 1764;
    out.push(Math.floor(v / 256), v % 256);
  }
  if (text.length - i === 2) {
    out.push(B42_REVERSE[text[i]] + B42_REVERSE[text[i + 1]] * 42);
  }
  return new Uint8Array(out);
}

async function gzip(text) {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
}

async function gunzip(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

/** Build the invoice payload: business + banks + currency-rate snapshot (no logo) + invoice header/items. */
export function buildInvoicePayload({ teDhenatBiznesit, banks, currencies, invoice }) {
  const { logo, ...bizNoLogo } = teDhenatBiznesit || {};
  void logo;
  return {
    v: 1,
    biz: bizNoLogo,
    banks: (banks || []).map(({ emriBankes, numriLlogaris, valuta }) => ({ emriBankes, numriLlogaris, valuta })),
    currencies: (currencies || []).map(({ code, rate }) => ({ code, rate })),
    inv: invoice,
  };
}

/** Encode an invoice payload into a full shareable URL (current page + `#i=...`). */
export async function encodeInvoiceToLink(payload) {
  const json = JSON.stringify(payload);
  const encoded = hasCompression
    ? MARK_GZIP_B42 + toBase42(await gzip(json))
    : MARK_PLAIN_B42 + toBase42(new TextEncoder().encode(json));
  const url = new URL(window.location.href);
  url.hash = `${HASH_KEY}=${encoded}`;
  return url.toString();
}

/** Rewrite a share link into the exact upper-cased string to put inside the QR image. */
export function toQrPayloadUrl(link) {
  try {
    const u = new URL(link);
    return `${u.protocol}//${u.host}`.toUpperCase() + u.pathname + u.search + u.hash;
  } catch {
    return link;
  }
}

/** Decode a `#i=...` payload back into the invoice object, or null if invalid. */
export async function decodeInvoicePayload(encoded) {
  try {
    const marker = encoded[0];
    const body = encoded.slice(1);
    const bytes = fromBase42(body);
    const json = marker === MARK_GZIP_B42 ? await gunzip(bytes) : new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json);
    if (!parsed || !parsed.inv) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Read the `#i=...` payload from the current URL hash, if present. */
export function readSharePayload() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  return new URLSearchParams(hash).get(HASH_KEY);
}

/** Strip the share payload from the URL so a refresh doesn't re-trigger the import. */
export function clearSharePayload() {
  const url = new URL(window.location.href);
  window.history.replaceState(null, "", url.pathname + url.search);
}
