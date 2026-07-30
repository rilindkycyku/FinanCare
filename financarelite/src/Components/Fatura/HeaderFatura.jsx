import { View, Text, StyleSheet, Image } from "@react-pdf/renderer";
import "./pdfFonts";
import JsBarcode from "jsbarcode";
import { DEFAULT_DOCUMENT_TYPES } from "../../lib/options";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Quicksand",
  },
  // Three columns instead of two: who's selling, who's buying, and what the document is. The
  // invoice's own details (date, deadline, notes, page) used to sit under the seller, which made
  // that column run far taller than the other one and left the right half half-empty. Widths are
  // set so the seller's contact line and the barcode each still fit without wrapping.
  colShitesi: { width: "34%" },
  colBleresi: { width: "32%" },
  colDokumenti: { width: "32%" },
  colHeading: { fontSize: 7, fontWeight: "bold", letterSpacing: 0.5, marginBottom: 2 },
  title: { fontSize: 16, textAlign: "left", marginTop: 2 },
  titleLong: { fontSize: 12 },
  text: { fontSize: 9, marginBottom: 1.5 },
  // The registry line (NUI / NF / TVSH) is three long numbers with three labels — the one line
  // that doesn't fit a third of the page at 9pt. A point smaller keeps it on one line, and these
  // are reference numbers to copy rather than anything read at a glance.
  textId: { fontSize: 8, marginBottom: 1.5 },
  bold: { fontWeight: "bold" },
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
function logoSrc(teDhenatBiznesit) {
  return teDhenatBiznesit?.logo || null;
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
  const MAX_BARCODE_WIDTH = 170;

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
    if (width > MAX_BARCODE_WIDTH) {
      const scale = MAX_BARCODE_WIDTH / width;
      width = MAX_BARCODE_WIDTH;
      height *= scale;
    }
    const barcode = { dataUrl: canvas.toDataURL("image/png"), width, height };
    barcodeCache.set(Barkodi, barcode);
    return barcode;
  };

  const barcode = generateBarcodeImage();

  return (
    <View style={styles.header}>
      <View style={styles.colShitesi}>
        {/* `contain`, so a wide wordmark isn't squashed into the box's 2:1 shape — the box only
            caps how much room the logo may take. */}
        {logoSrc(teDhenatBiznesit) ? (
          <Image src={logoSrc(teDhenatBiznesit)} style={{ width: 100, height: 50, objectFit: "contain" }} />
        ) : null}
        <Text style={[styles.title, styles.bold]}>
          {teDhenatBiznesit?.emriIBiznesit || ""}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Adresa: </Text>
          {teDhenatBiznesit?.adresa || ""}
        </Text>
        <Text style={styles.textId}>
          <Text style={styles.bold}>NUI: </Text>
          {teDhenatBiznesit?.nui || ""} / <Text style={styles.bold}>NF: </Text>
          {teDhenatBiznesit?.nf || ""} / <Text style={styles.bold}>TVSH: </Text>
          {teDhenatBiznesit?.nrTVSH || ""}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Kontakti: </Text>
          {teDhenatBiznesit?.nrKontaktit || ""} - {teDhenatBiznesit?.email || ""}
        </Text>
        {teDhenatBiznesit?.website ? (
          <Text style={styles.text}>
            <Text style={styles.bold}>Uebfaqja: </Text>
            {teDhenatBiznesit.website}
          </Text>
        ) : null}
      </View>

      <View style={styles.colBleresi}>
        <Text style={styles.colHeading}>KLIENTI</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>{teDhenatFat?.regjistrimet?.emriBiznesit || ""}</Text>
        </Text>
        <Text style={styles.textId}>
          <Text style={styles.bold}>NUI: </Text>
          {teDhenatFat?.regjistrimet?.nui || ""} / <Text style={styles.bold}>NF: </Text>
          {teDhenatFat?.regjistrimet?.nrf || ""} / <Text style={styles.bold}>TVSH: </Text>
          {teDhenatFat?.regjistrimet?.partneriTVSH || ""}
        </Text>
        <Text style={styles.text}>{teDhenatFat?.regjistrimet?.adresa || ""}</Text>
        <Text style={styles.text}>
          {teDhenatFat?.regjistrimet?.nrKontaktit || ""} - {teDhenatFat?.regjistrimet?.email || ""}
        </Text>
      </View>

      <View style={styles.colDokumenti}>
        <View style={styles.barcodeContainer}>
          {/* Custom document types can carry long titles ("FATURË SIPAS KONTRATËS"); stepping the
              size down keeps them on one line inside the header column. */}
          <Text style={[styles.title, styles.bold, ...(titulliDokumentit.length > 20 ? [styles.titleLong] : [])]}>
            {titulliDokumentit}
          </Text>
          <Image
            src={barcode.dataUrl}
            style={[styles.barcodeImage, { width: barcode.width, height: barcode.height }]}
          />
        </View>
        <Text style={styles.text}>
          <Text style={styles.bold}>Data e Faturës: </Text>
          {new Date(teDhenatFat?.regjistrimet?.dataRegjistrimit || Date.now()).toLocaleDateString("en-GB")}
        </Text>
        {teDhenatFat?.regjistrimet?.afatiPageses ? (
          <Text style={styles.text}>
            <Text style={styles.bold}>Afati i Pagesës: </Text>
            {new Date(teDhenatFat.regjistrimet.afatiPageses).toLocaleDateString("en-GB")}
          </Text>
        ) : null}
        {teDhenatFat?.regjistrimet?.pershkrimShtese ? (
          <Text style={styles.text}>
            <Text style={styles.bold}>Shënime: </Text>
            {teDhenatFat.regjistrimet.pershkrimShtese}
          </Text>
        ) : null}
        <Text style={styles.bold}>
          Faqe: {NrFaqes} / {NrFaqeve}
        </Text>
      </View>
    </View>
  );
}

export default HeaderFatura;
