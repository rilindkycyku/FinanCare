import { View, Text, StyleSheet, Image } from "@react-pdf/renderer";
import "./pdfFonts";
import JsBarcode from "jsbarcode";
import { DEFAULT_DOCUMENT_TYPES } from "../../lib/options";

// The whole letterhead band is this tall and no taller — see `band` below. Sized to what the
// document title and its barcode need, since those are fixed; everything else fits inside it.
const BAND_HEIGHT = 50;
// Room for the logo once the business name underneath it has taken its line.
const LOGO_MAX_HEIGHT = 28;
const LOGO_MAX_WIDTH = 80;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Quicksand",
  },
  // The two tall things — the logo and the title/barcode — sit together on a band across the
  // top, so the three text columns below can start on the same line and end at roughly the same
  // depth. Stacking the logo inside the seller's column instead made that column run long while
  // the client's ended early, leaving an obvious hole under it.
  // Fixed height, so nothing in the band can push the invoice down: the logo is fitted into
  // whatever room is left beside the title and barcode, rather than the header growing to
  // accommodate it. A tall or square logo therefore comes out smaller, not more expensive.
  band: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: BAND_HEIGHT, marginBottom: 3 },
  // The band's three parts line up with the three columns below it, so the two names — the
  // business's and the client's — sit on the same line as each other and each sits directly
  // above its own details.
  bandLeft: { width: "32%", height: BAND_HEIGHT, justifyContent: "flex-end" },
  bandMid: { width: "36%", height: BAND_HEIGHT, justifyContent: "flex-end" },
  bandRight: { width: "30%", height: BAND_HEIGHT, alignItems: "flex-end", justifyContent: "flex-end" },
  // Three columns: who's selling, who's buying, and the invoice's own details. Widths are set so
  // the seller's contact line fits without wrapping.
  colShitesi: { width: "32%" },
  colBleresi: { width: "36%" },
  colDokumenti: { width: "30%" },
  // No column headings at all: the seller is named in the band above its column, the details
  // column labels every line of itself, and the client's name at 11pt is the biggest thing in
  // the row — which is what a reader looks for first anyway.
  klientiEmri: { fontSize: 12, fontWeight: "bold" },
  klientiRresht: { marginBottom: 2 },
  title: { fontSize: 16, textAlign: "left", marginTop: 2 },
  titleLong: { fontSize: 12 },
  titleBand: { textAlign: "right", marginTop: 0 },
  emriBiznesit: { fontSize: 14, marginTop: 0, marginBottom: 1 },
  text: { fontSize: 9, marginBottom: 1.5 },
  // The registry line (NUI / NF / TVSH) is three long numbers with three labels — the one line
  // that doesn't fit a third of the page at 9pt. A point smaller keeps it on one line, and these
  // are reference numbers to copy rather than anything read at a glance.
  textId: { fontSize: 7.5, marginBottom: 1.5 },
  regjistri: { flexDirection: "row", flexWrap: "wrap" },
  // Just enough to separate two pairs on the same line — any more and a registry that used to fit
  // on one line starts wrapping for the sake of the gaps.
  regjistriPjesa: { marginRight: 2 },
  bold: { fontWeight: "bold" },
  // Caps rather than a fixed box, with `contain`: a wide wordmark uses the full width at
  // whatever height that implies, a square mark stops at the height limit — neither is squashed,
  // and neither can outgrow the band.
  logo: { maxWidth: LOGO_MAX_WIDTH, maxHeight: LOGO_MAX_HEIGHT, objectFit: "contain", marginBottom: 2 },
  barcodeImage: { marginTop: 5 },
  barcodeContainer: { alignItems: "center" },
});

// Fallback for invoices issued before the document title started being stored on the invoice
// record itself (see `titulliDokumentit` in KrijoFaturen) — derived from the built-in types so
// adding one there is enough, and old invoices of a custom type still read "FATURË".
const TITLE_MAP = {
  ...Object.fromEntries(DEFAULT_DOCUMENT_TYPES.map((t) => [t.value, t.titleLabel])),
  PARAGON: "PARAGON",
  OFERTE: "OFERTË",
};

// One entry per invoice number, and an invoice number never changes what its barcode looks
// like — so this is bounded by how many invoices get opened in a session, and each of those
// would otherwise re-rasterize on every page of every PDF rebuild.
const barcodeCache = new Map();

// No logo means no image at all — not a placeholder. The "kjo faqe nuk ka logo" box belongs to
// the settings form, where it's a prompt to upload one; on a finished invoice it's just a grey
// box telling the recipient something they can't act on. It shows up most on invoices opened
// from a share link, where the logo often can't travel inside the QR (see lib/invoiceQr.js).
//
// `shfaqLogonNeFature` is the business's own switch (Të Dhënat e Biznesit): off means print
// plainly without having to delete the uploaded file. Undefined counts as on, so every database
// that predates the switch keeps showing the logo it already had.
function logoSrc(teDhenatBiznesit) {
  if (teDhenatBiznesit?.shfaqLogonNeFature === false) return null;
  return teDhenatBiznesit?.logo || null;
}

const ka = (value) => !!(value ?? "").toString().trim();

/** One labelled line, or nothing at all when there's no value. A business with no website, or a
 * private client with no email, shouldn't have to print an empty label on every invoice. */
function Rresht({ label, value, style }) {
  if (!ka(value)) return null;
  return (
    <Text style={style}>
      {label ? <Text style={styles.bold}>{`${label}: `}</Text> : null}
      {value}
    </Text>
  );
}

/** The NUI / NF / TVSH line, carrying only the numbers that exist — so a business registered
 * without a VAT number prints "NUI: 812085688 / NF: 600111222" rather than a trailing "/ TVSH:"
 * with nothing after it. Gone entirely when none of the three is filled in. */
function RreshtRegjistri({ nui, nf, tvsh }) {
  const parts = [
    ["NUI", nui],
    ["NF", nf],
    ["TVSH", tvsh],
  ].filter(([, value]) => ka(value));
  if (parts.length === 0) return null;
  // Each pair is its own item in a wrapping row rather than words in one paragraph, so a number
  // that doesn't fit moves to the next line *with its label*. Written as running text it broke
  // after "TVSH:" and left the number stranded underneath; joining the two with a non-breaking
  // space only made react-pdf force-break the pair and print a hyphen, which reads as a typo in
  // a registry number. Wrapping happens between items, where there's nothing to hyphenate.
  return (
    <View style={styles.regjistri}>
      {parts.map(([label, value], index) => (
        <Text key={label} style={[styles.textId, styles.regjistriPjesa]}>
          <Text style={styles.bold}>{`${label}: `}</Text>
          {value}
          {index < parts.length - 1 ? " /" : ""}
        </Text>
      ))}
    </View>
  );
}

/** Phone and email read as one contact line, joined only when both are there. */
function rreshtKontakti(nrKontaktit, email) {
  return [nrKontaktit, email].filter(ka).join(" - ");
}

function HeaderFatura({ Barkodi, NrFaqes, NrFaqeve, data }) {
  const { teDhenatFat, teDhenatBiznesit } = data || {};
  const llojiKalkulimit = teDhenatFat?.regjistrimet?.llojiKalkulimit || "FAT";
  const titulliDokumentit = teDhenatFat?.regjistrimet?.titulliKalkulimit || TITLE_MAP[llojiKalkulimit] || "FATURË";

  // JsBarcode draws onto a canvas at 1x pixel density; embedding that raw PNG
  // into the PDF makes it look blurry once printed/zoomed. Render the canvas
  // at a higher resolution, then scale the PDF <Image> back down to the same
  // physical size so it prints crisp instead of pixelated.
  const BARCODE_SCALE = 4;
  // Invoice numbers (e.g. "Datao-210726-FAT-2") are long alphanumeric strings, so at
  // full module width the generated barcode was overflowing the header column. Cap the
  // displayed width and scale height down with it, keeping the bar-width ratios intact
  // (uniform scaling doesn't break scannability, only non-uniform stretching would).
  const MAX_BARCODE_WIDTH = 160;
  const MAX_BARCODE_HEIGHT = BAND_HEIGHT - 22;

  // Drawing the barcode means creating a canvas and rasterizing it — cached per invoice number
  // so it happens once, not on every re-render of every page's header while the PDF is built.
  const generateBarcodeImage = () => {
    const cached = barcodeCache.get(Barkodi);
    if (cached) return cached;

    const canvas = document.createElement("canvas");
    JsBarcode(canvas, Barkodi || " ", {
      width: 1 * BARCODE_SCALE,
      height: 28 * BARCODE_SCALE,
      fontSize: 10 * BARCODE_SCALE,
      margin: 4 * BARCODE_SCALE,
      displayValue: true,
    });
    let width = canvas.width / BARCODE_SCALE;
    let height = canvas.height / BARCODE_SCALE;
    // Scaled by whichever limit binds first — width to stay inside its half of the band, height
    // so the title and barcode together always fit the band's fixed height.
    const scale = Math.min(MAX_BARCODE_WIDTH / width, MAX_BARCODE_HEIGHT / height, 1);
    width *= scale;
    height *= scale;
    const barcode = { dataUrl: canvas.toDataURL("image/png"), width, height };
    barcodeCache.set(Barkodi, barcode);
    return barcode;
  };

  const barcode = generateBarcodeImage();

  return (
    <View>
      <View style={styles.band}>
        <View style={styles.bandLeft}>
          {logoSrc(teDhenatBiznesit) ? <Image src={logoSrc(teDhenatBiznesit)} style={styles.logo} /> : null}
          <Text style={[styles.emriBiznesit, styles.bold]}>{teDhenatBiznesit?.emriIBiznesit || ""}</Text>
        </View>
        <View style={styles.bandMid}>
          {/* The client's name rides the band too, level with the business's own, and its details
              carry on in the column directly underneath. */}
          <Text style={[styles.klientiEmri, styles.klientiRresht]}>
            {teDhenatFat?.regjistrimet?.emriBiznesit || ""}
          </Text>
        </View>
        <View style={styles.bandRight}>
          {/* Custom document types can carry long titles ("FATURË SIPAS KONTRATËS"); stepping the
              size down keeps them on one line. */}
          <Text
            style={[styles.title, styles.titleBand, styles.bold, ...(titulliDokumentit.length > 20 ? [styles.titleLong] : [])]}
          >
            {titulliDokumentit}
          </Text>
          <Image src={barcode.dataUrl} style={[styles.barcodeImage, { width: barcode.width, height: barcode.height }]} />
        </View>
      </View>

      <View style={styles.header}>
        <View style={styles.colShitesi}>
          <Rresht label="Adresa" value={teDhenatBiznesit?.adresa} style={styles.text} />
          <RreshtRegjistri nui={teDhenatBiznesit?.nui} nf={teDhenatBiznesit?.nf} tvsh={teDhenatBiznesit?.nrTVSH} />
          <Rresht
            label="Kontakti"
            value={rreshtKontakti(teDhenatBiznesit?.nrKontaktit, teDhenatBiznesit?.email)}
            style={styles.text}
          />
          <Rresht label="Uebfaqja" value={teDhenatBiznesit?.website} style={styles.text} />
        </View>

        {/* Same lines, same labels, same order as the seller's column beside it: the client's
            address and contact were printed bare, which read as a stray block of text rather than
            as the counterpart to the business's own details. */}
        <View style={styles.colBleresi}>
          <Rresht label="Adresa" value={teDhenatFat?.regjistrimet?.adresa} style={styles.text} />
          <RreshtRegjistri
            nui={teDhenatFat?.regjistrimet?.nui}
            nf={teDhenatFat?.regjistrimet?.nrf}
            tvsh={teDhenatFat?.regjistrimet?.partneriTVSH}
          />
          <Rresht
            label="Kontakti"
            value={rreshtKontakti(teDhenatFat?.regjistrimet?.nrKontaktit, teDhenatFat?.regjistrimet?.email)}
            style={styles.text}
          />
        </View>

        <View style={styles.colDokumenti}>
          <Rresht
            label="Data e Faturës"
            value={new Date(teDhenatFat?.regjistrimet?.dataRegjistrimit || Date.now()).toLocaleDateString("en-GB")}
            style={styles.text}
          />
          <Rresht
            label="Afati i Pagesës"
            value={
              teDhenatFat?.regjistrimet?.afatiPageses
                ? new Date(teDhenatFat.regjistrimet.afatiPageses).toLocaleDateString("en-GB")
                : ""
            }
            style={styles.text}
          />
          <Rresht label="Shënime" value={teDhenatFat?.regjistrimet?.pershkrimShtese} style={styles.text} />
          <Text style={styles.bold}>
            Faqe: {NrFaqes} / {NrFaqeve}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default HeaderFatura;
