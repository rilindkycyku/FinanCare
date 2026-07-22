import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./Styles/FaturaModern.css";
import { Document, Page, pdf, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import { Button, Spinner } from "react-bootstrap";
import { Download, ArrowLeft, FileText, Share2, Pencil, Lock, Unlock, CreditCard } from "lucide-react";
import DetajeFatura from "./DetajeFatura";
import HeaderFatura from "./HeaderFatura";
import FooterFatura from "./FooterFatura";
import PdfCanvasViewer from "./PdfCanvasViewer";

Font.register({
  family: "Quicksand",
  fonts: [
    { src: "/fonts/Quicksand-Regular.ttf" },
    { src: "/fonts/Quicksand-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  hr: { borderBottomWidth: 1, borderColor: "black", marginVertical: 5 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ccc" },
  header: { backgroundColor: "#f0f0f0", fontWeight: "bold" },
  cell: { flex: 1, padding: 3, fontSize: 7, textAlign: "center" },
});

/** Renders one invoice, on-screen and as a downloadable PDF. `data` = { produktet, teDhenatFat, teDhenatBiznesit, bankat }.
 * `qrCodeDataUrl`, once available, is embedded directly on the invoice footer (on-screen and in
 * the PDF) so a printed/exported copy carries a working "scan to reopen" code on its own.
 * The on-screen preview rasterizes the literal PDF with pdf.js (`PdfCanvasViewer`) rather than a
 * parallel HTML re-implementation, so it always matches what gets printed/downloaded. This used to
 * embed the PDF via `<PDFViewer>` (the browser's native plugin inside an iframe), but mobile Chrome
 * doesn't render that reliably — it falls back to a bare "Open" download prompt instead of showing
 * the invoice — so the pages are drawn to canvas directly instead. */
function Fatura({
  data,
  qrCodeDataUrl,
  onBack,
  onShare,
  onEdit,
  onAddPayment,
  mbyllur,
  onToggleStatus,
  autoDownload = false,
  readOnly = false,
}) {
  const { produktet = [], teDhenatFat = {}, teDhenatBiznesit = {}, bankat = [], currencies = [] } = data || {};
  const [saving, setSaving] = useState(false);
  const [autoDownloaded, setAutoDownloaded] = useState(false);

  // The toolbar used to be `position: sticky` so it stayed visible while the (long, HTML)
  // invoice scrolled underneath it — but with the invoice now rendered as a PDF preview (which
  // scrolls internally on its own, see `.invoice-pdf-viewer`), a sticky toolbar just sits on top
  // of it as the outer page scrolls, covering the invoice header instead of stopping above it.
  // Sizing the preview to exactly fill the remaining viewport height means the outer page never
  // scrolls at all, so the toolbar and the invoice never overlap in the first place.
  const containerRef = useRef(null);
  const shellRef = useRef(null);
  const [shellHeight, setShellHeight] = useState(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const shell = shellRef.current;
    if (!container || !shell) return;

    const recalc = () => {
      const shellTop = shell.getBoundingClientRect().top;
      const containerBottomPadding = parseFloat(getComputedStyle(container).paddingBottom) || 0;
      const available = window.innerHeight - shellTop - containerBottomPadding;
      setShellHeight(Math.max(available, 400));
    };

    recalc();
    window.addEventListener("resize", recalc);
    const resizeObserver = new ResizeObserver(recalc);
    resizeObserver.observe(container);
    return () => {
      window.removeEventListener("resize", recalc);
      resizeObserver.disconnect();
    };
  }, []);

  const dataPorosise = new Date(teDhenatFat?.regjistrimet?.dataRegjistrimit || Date.now());
  const dita = dataPorosise.getDate().toString().padStart(2, "0");
  const muaji = (dataPorosise.getMonth() + 1).toString().padStart(2, "0");
  const viti = dataPorosise.getFullYear().toString().slice(-2);

  const barkodi = useMemo(() => {
    if (teDhenatFat?.regjistrimet?.nrFatures) return teDhenatFat.regjistrimet.nrFatures;
    return `${teDhenatBiznesit?.shkurtesaEmritBiznesit || "FAT"}-${dita}${muaji}${viti}-FAT-${
      teDhenatFat?.regjistrimet?.nrRendorFatures || ""
    }`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teDhenatFat, teDhenatBiznesit]);

  const estimatedPages = useMemo(() => {
    const itemCount = produktet.length;
    const fullPages = Math.floor(itemCount / 24);
    const remainder = itemCount % 24;
    return remainder > 0 ? (remainder <= 14 ? fullPages + 1 : fullPages + 2) : Math.max(fullPages, 1);
  }, [produktet.length]);

  // Built once per actual data change (not on every render) — passed as-is to both the
  // download button and the on-screen preview, so they're always in sync and the preview
  // doesn't regenerate/reload its PDF on unrelated re-renders (e.g. opening a modal).
  const invoiceDocument = useMemo(() => {
    if (produktet.length === 0) {
      return (
        <Document>
          <Page size="A4">
            <Text>Nuk ka produkte në këtë faturë.</Text>
          </Page>
        </Document>
      );
    }

    const itemsPerFullPage = 24;
    const maxItemsLastPage = 14;
    const pages = [];
    let currentStart = 0;
    let pageNumber = 1;

    while (currentStart < produktet.length) {
      let itemsPerPage = itemsPerFullPage;
      const remainingItems = produktet.length - currentStart;
      const isLastPage = remainingItems <= itemsPerFullPage;

      if (isLastPage) {
        itemsPerPage = remainingItems <= maxItemsLastPage ? remainingItems : itemsPerFullPage;
      }

      const end = Math.min(currentStart + itemsPerPage, produktet.length);
      const itemsOnPage = end - currentStart;
      const forceFooterNewPage = isLastPage && itemsOnPage > maxItemsLastPage;

      pages.push(
        <Page size={{ width: 595, height: 842 }} key={pageNumber}>
          <DetajeFatura
            Barkodi={barkodi}
            ProduktiPare={currentStart}
            ProduktiFundit={end}
            LargoFooter={forceFooterNewPage || end < produktet.length}
            NrFaqes={pageNumber}
            NrFaqeve={estimatedPages}
            data={{ produktet, teDhenatFat, teDhenatBiznesit, bankat, currencies, qrCodeDataUrl }}
            forceFooterNewPage={forceFooterNewPage}
          />
        </Page>
      );

      if (forceFooterNewPage) {
        pages.push(
          <Page size={{ width: 595, height: 842 }} key={pageNumber + 1}>
            <View style={{ padding: 20, fontSize: 11 }}>
              <HeaderFatura Barkodi={barkodi} NrFaqes={pageNumber + 1} NrFaqeve={estimatedPages} data={{ teDhenatFat, teDhenatBiznesit }} />
              <View style={styles.hr} />
              <FooterFatura Barkodi={barkodi} data={{ teDhenatFat, produktet, bankat, currencies, qrCodeDataUrl }} />
            </View>
          </Page>
        );
        pageNumber++;
      }

      currentStart += itemsPerPage;
      pageNumber++;
    }

    return <Document>{pages}</Document>;
  }, [produktet, teDhenatFat, teDhenatBiznesit, bankat, currencies, qrCodeDataUrl, barkodi, estimatedPages]);

  // The on-screen preview needs the invoice as an actual PDF blob (to rasterize with pdf.js),
  // built separately from `ruajFaturen`'s own blob so a slow render never blocks the download button.
  const [previewBlob, setPreviewBlob] = useState(null);
  useEffect(() => {
    let cancelled = false;
    setPreviewBlob(null);
    pdf(invoiceDocument)
      .toBlob()
      .then((blob) => {
        if (!cancelled) setPreviewBlob(blob);
      })
      .catch((err) => console.error("Gabim gjatë përgatitjes së faturës:", err));
    return () => {
      cancelled = true;
    };
  }, [invoiceDocument]);

  async function ruajFaturen() {
    try {
      setSaving(true);
      const blob = await pdf(invoiceDocument).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${barkodi || "fatura"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gabim gjatë ruajtjes së PDF-së:", err);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (autoDownload && !autoDownloaded && produktet.length >= 0 && teDhenatBiznesit) {
      setAutoDownloaded(true);
      ruajFaturen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload]);

  return (
    <div className="invoice-viewer-container" ref={containerRef}>
      <div className="invoice-toolbar shadow-sm">
        <div className="d-flex align-items-center">
          <FileText size={24} className="text-primary me-3" />
          <h1 className="invoice-title-main mb-0">{barkodi}</h1>
        </div>

        <div className="invoice-toolbar-actions">
          <span className="invoice-page-hint d-none d-md-inline">
            Fatura ndahet në: <strong>{estimatedPages} faqe</strong>
          </span>

          {onShare && (
            <Button className="btn-invoice-action btn-invoice-close" onClick={onShare}>
              <Share2 size={18} /> QR / Shpërndaj
            </Button>
          )}

          {onAddPayment && (
            <Button className="btn-invoice-action btn-invoice-close" onClick={onAddPayment}>
              <CreditCard size={18} /> Shto Pagesë
            </Button>
          )}

          {onToggleStatus && (
            <Button className="btn-invoice-action btn-invoice-close" onClick={onToggleStatus}>
              {mbyllur ? <Unlock size={18} /> : <Lock size={18} />}
              {mbyllur ? "Hap Faturën" : "Mbyll Faturën"}
            </Button>
          )}

          {onEdit && !mbyllur && (
            <Button className="btn-invoice-action btn-invoice-close" onClick={onEdit}>
              <Pencil size={18} /> Ndrysho
            </Button>
          )}

          <Button className="btn-invoice-action btn-invoice-save" onClick={ruajFaturen} disabled={saving}>
            {saving ? <Spinner size="sm" /> : <Download size={18} />}
            {saving ? "Duke Ruajtur..." : "Ruaj Faturën"}
          </Button>

          {onBack && (
            <Button className="btn-invoice-action btn-invoice-close" onClick={onBack}>
              <ArrowLeft size={18} /> {readOnly ? "Kthehu" : "Mbyll"}
            </Button>
          )}
        </div>
      </div>

      <div className="invoice-pdf-shell" ref={shellRef} style={{ height: shellHeight ?? undefined }}>
        <PdfCanvasViewer className="invoice-pdf-viewer" blob={previewBlob} />
      </div>
    </div>
  );
}

export default Fatura;
