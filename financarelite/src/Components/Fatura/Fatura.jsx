import { useEffect, useMemo, useState } from "react";
import "./Styles/FaturaModern.css";
import { Document, Page, pdf, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import { Button, Spinner } from "react-bootstrap";
import { Download, ArrowLeft, FileText, Share2 } from "lucide-react";
import DetajeFatura from "./DetajeFatura";
import HeaderFatura from "./HeaderFatura";
import TeDhenatFatura from "./TeDhenatFatura";
import FooterFatura from "./FooterFatura";

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

/** Renders one invoice, on-screen and as a downloadable PDF. `data` = { produktet, teDhenatFat, teDhenatBiznesit, bankat }. */
function Fatura({ data, onBack, onShare, autoDownload = false, readOnly = false }) {
  const { produktet = [], teDhenatFat = {}, teDhenatBiznesit = {}, bankat = [], currencies = [] } = data || {};
  const [saving, setSaving] = useState(false);
  const [autoDownloaded, setAutoDownloaded] = useState(false);

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

  const InvoicePDF = () => {
    const itemsPerFullPage = 24;
    const maxItemsLastPage = 14;
    const pages = [];
    let currentStart = 0;
    let pageNumber = 1;

    if (produktet.length === 0) {
      return (
        <Document>
          <Page size="A4">
            <Text>Nuk ka produkte në këtë faturë.</Text>
          </Page>
        </Document>
      );
    }

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
            isPDF
            data={{ produktet, teDhenatFat, teDhenatBiznesit, bankat, currencies }}
            forceFooterNewPage={forceFooterNewPage}
          />
        </Page>
      );

      if (forceFooterNewPage) {
        pages.push(
          <Page size={{ width: 595, height: 842 }} key={pageNumber + 1}>
            <View style={{ padding: 20, fontSize: 11 }}>
              <HeaderFatura Barkodi={barkodi} NrFaqes={pageNumber + 1} NrFaqeve={estimatedPages} isPDF data={{ teDhenatFat, teDhenatBiznesit }} />
              <View style={styles.hr} />
              <FooterFatura Barkodi={barkodi} isPDF data={{ teDhenatFat, produktet, bankat, currencies }} />
            </View>
          </Page>
        );
        pageNumber++;
      }

      currentStart += itemsPerPage;
      pageNumber++;
    }

    return <Document>{pages}</Document>;
  };

  async function ruajFaturen() {
    try {
      setSaving(true);
      const blob = await pdf(<InvoicePDF />).toBlob();
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
    <div className="invoice-viewer-container">
      <div className="invoice-toolbar shadow-sm">
        <div className="d-flex align-items-center">
          <FileText size={24} className="text-primary me-3" />
          <h1 className="invoice-title-main mb-0">{barkodi}</h1>
        </div>

        <div className="d-flex align-items-center">
          <span className="invoice-page-hint d-none d-md-inline">
            Fatura ndahet në: <strong>{estimatedPages} faqe</strong>
          </span>

          {onShare && (
            <Button className="btn-invoice-action btn-invoice-close me-3" onClick={onShare}>
              <Share2 size={18} /> QR / Shpërndaj
            </Button>
          )}

          <Button className="btn-invoice-action btn-invoice-save me-3" onClick={ruajFaturen} disabled={saving}>
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

      <div className="invoice-paper" id="invoice-capture">
        <HeaderFatura Barkodi={barkodi} NrFaqes={1} NrFaqeve={estimatedPages} isPDF={false} data={{ teDhenatFat, teDhenatBiznesit }} />
        <hr className="invoice-hr" />
        <TeDhenatFatura ProduktiPare={0} ProduktiFundit={produktet.length} isPDF={false} data={{ produktet }} />
        <hr className="invoice-hr" />
        <FooterFatura Barkodi={barkodi} isPDF={false} data={{ teDhenatFat, produktet, bankat, currencies }} />
      </div>
    </div>
  );
}

export default Fatura;
