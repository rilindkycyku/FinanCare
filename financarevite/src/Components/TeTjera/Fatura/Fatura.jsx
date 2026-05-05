import "./Styles/FaturaModern.css";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Document,
  Page,
  pdf,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { Button, Container, Spinner } from "react-bootstrap";
import {
  Download,
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import DetajeFatura from "./DetajeFatura";
import HeaderFatura from "./HeaderFatura";
import TeDhenatFatura from "./TeDhenatFatura";
import FooterFatura from "./FooterFatura";
import Titulli from "../Titulli";

// Register fonts for PDF generation
Font.register({
  family: "Quicksand",
  fonts: [
    { src: "/fonts/Quicksand-Regular.ttf" },
    { src: "/fonts/Quicksand-Bold.ttf", fontWeight: "bold" },
  ],
});

function Fatura({ nrFatures, mbyllFaturen }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState({});
  const [teDhenatFat, setTeDhenatFat] = useState({});
  const [produktet, setProduktet] = useState([]);
  const [bankat, setBankat] = useState([]);
  const [kaAkses, setKaAkses] = useState(true);
  const [estimatedPages, setEstimatedPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const getID = localStorage.getItem("id");
  const getToken = localStorage.getItem("token");

  const authentikimi = useMemo(() => ({
    headers: { Authorization: `Bearer ${getToken}` }
  }), [getToken]);

  const dataPorosise = new Date(
    teDhenatFat?.regjistrimet?.dataRegjistrimit || Date.now()
  );
  const dita = dataPorosise.getDate().toString().padStart(2, "0");
  const muaji = (dataPorosise.getMonth() + 1).toString().padStart(2, "0");
  const viti = dataPorosise.getFullYear().toString().slice(-2);

  const barkodi = useMemo(() => {
    if (!teDhenatFat?.regjistrimet) return "";
    return teDhenatFat.regjistrimet.llojiKalkulimit === "PARAGON"
      ? teDhenatFat.regjistrimet.nrFatures || ""
      : `${teDhenatBiznesit?.shkurtesaEmritBiznesit || "FAT"}-${dita}${muaji}${viti}-${teDhenatFat.regjistrimet.llojiKalkulimit || ""
      }-${teDhenatFat.regjistrimet.nrRendorFatures || ""}`;
  }, [teDhenatFat, teDhenatBiznesit, dita, muaji, viti]);

  useEffect(() => {
    if (!getID) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [produktetRes, fatRes, biznesiRes, userRes, bankatRes] =
          await Promise.all([
            axios.get(`${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${nrFatures}`, authentikimi),
            axios.get(`${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${nrFatures}`, authentikimi),
            axios.get(`${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`, authentikimi),
            axios.get(`${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`, authentikimi),
            axios.get(`${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqLlogaritEBiznesit`, authentikimi),
          ]);

        const produktetData = produktetRes.data || [];
        setProduktet(produktetData);
        setTeDhenatFat(fatRes.data || {});
        setTeDhenatBiznesit(biznesiRes.data || {});
        setBankat(bankatRes.data || []);

        const roles = ["Faturist", "Menaxher", "Kalkulant", "Arkatar", "Komercialist"];
        const userHasAccess = userRes.data?.rolet?.some((role) => roles.includes(role)) || false;
        setKaAkses(userHasAccess);

        if (!userHasAccess) {
          navigate("/403");
          return;
        }

        // Calculate pages
        const itemCount = produktetData.length;
        const fullPages = Math.floor(itemCount / 24);
        const remainder = itemCount % 24;
        const totalPages = remainder > 0 ? (remainder <= 14 ? fullPages + 1 : fullPages + 2) : Math.max(fullPages, 1);
        setEstimatedPages(totalPages);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getID, nrFatures, navigate, API_BASE_URL, authentikimi]);

  const styles = StyleSheet.create({
    page: { padding: 20, fontSize: 11 },
    hr: { borderBottomWidth: 1, borderColor: "black", marginVertical: 5 },
    row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ccc" },
    header: { backgroundColor: "#f0f0f0", fontWeight: "bold" },
    cell: { flex: 1, padding: 3, fontSize: 7, textAlign: "center" },
  });

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
            nrFatures={nrFatures}
            Barkodi={barkodi}
            ProduktiPare={currentStart}
            ProduktiFundit={end}
            LargoFooter={forceFooterNewPage || end < produktet.length}
            NrFaqes={pageNumber}
            NrFaqeve={estimatedPages}
            isPDF={true}
            data={{ produktet, teDhenatFat, teDhenatBiznesit, bankat }}
            forceFooterNewPage={forceFooterNewPage}
          />
        </Page>
      );

      if (forceFooterNewPage) {
        pages.push(
          <Page size={{ width: 595, height: 842 }} key={pageNumber + 1}>
            <View style={styles.page}>
              <HeaderFatura faturaID={nrFatures} Barkodi={barkodi} NrFaqes={pageNumber + 1} NrFaqeve={estimatedPages} isPDF={true} data={{ teDhenatFat, teDhenatBiznesit }} />
              <View style={styles.hr} />
              <View style={styles.table}>
                <View style={[styles.row, styles.header]}>
                  <Text style={styles.cell}>Nr.</Text>
                  <Text style={styles.cell}>Shifra</Text>
                  <Text style={styles.cell}>Emertimi</Text>
                  <Text style={styles.cell}>Njm</Text>
                  <Text style={styles.cell}>Sasia</Text>
                  <Text style={styles.cell}>Qm. - TVSH</Text>
                  <Text style={styles.cell}>Rab. 1 %</Text>
                  <Text style={styles.cell}>Rab. 2 %</Text>
                  <Text style={styles.cell}>Rab. 3 %</Text>
                  <Text style={styles.cell}>T %</Text>
                  <Text style={styles.cell}>Qm. + TVSH - Rab</Text>
                  <Text style={styles.cell}>TVSH €</Text>
                  <Text style={styles.cell}>Shuma €</Text>
                </View>
                <View style={styles.row} key={1}><Text style={styles.cell}> </Text><Text style={styles.cell}> </Text><Text style={styles.cell}> </Text><Text style={styles.cell}> </Text><Text style={styles.cell}> </Text><Text style={styles.cell}> </Text><Text style={styles.cell}> </Text><Text style={styles.cell}> </Text><Text style={styles.cell}> </Text><Text style={styles.cell}> </Text><Text style={styles.cell}> </Text><Text style={styles.cell}> </Text><Text style={styles.cell}> </Text></View>
              </View>
              <View style={styles.hr} />
              <FooterFatura faturaID={nrFatures} Barkodi={barkodi} isPDF={true} data={{ teDhenatFat, produktet, bankat }} />
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

  const ruajFaturen = async () => {
    try {
      setSaving(true);
      const blob = await pdf(<InvoicePDF />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${barkodi || 'fatura'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setSaving(false);
      mbyllFaturen();
    } catch (err) {
      console.error("Erro saving PDF:", err);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted fw-bold">Duke përgatitur faturën...</p>
      </div>
    );
  }

  if (!teDhenatFat || !teDhenatFat.regjistrimet) {
    return (
      <Container className="text-center py-5">
        <AlertCircle size={48} className="text-danger mb-3" />
        <h3>Gabim në shkarkimin e faturës</h3>
        <p>Nuk u gjetën të dhënat për këtë faturë.</p>
        <Button variant="primary" onClick={mbyllFaturen}>Kthehu mbrapa</Button>
      </Container>
    );
  }

  return (
    <div className="invoice-viewer-container">
      <Titulli titulli={`Fatura: ${barkodi}`} />

      {/* Modern Toolbar */}
      <div className="invoice-toolbar shadow-sm">
        <div className="d-flex align-items-center">
          <FileText size={24} className="text-primary me-3" />
          <h1 className="invoice-title-main mb-0">{barkodi}</h1>
        </div>

        <div className="d-flex align-items-center">
          <span className="invoice-page-hint d-none d-md-inline">
            Fatura ndahet në : <strong>{estimatedPages} faqe</strong>
          </span>

          <Button
            className="btn-invoice-action btn-invoice-save me-3"
            onClick={ruajFaturen}
            disabled={saving}
          >
            {saving ? <Spinner size="sm" /> : <Download size={18} />}
            {saving ? "Duke Ruajtur..." : "Ruaj Faturën"}
          </Button>

          <Button
            className="btn-invoice-action btn-invoice-close"
            onClick={mbyllFaturen}
          >
            <ArrowLeft size={18} /> Mbyll
          </Button>
        </div>
      </div>

      {/* Invoice Paper */}
      <div className="invoice-paper" id="invoice-capture">
        <HeaderFatura
          faturaID={nrFatures}
          Barkodi={barkodi}
          NrFaqes={1}
          NrFaqeve={estimatedPages}
          isPDF={false}
          data={{ teDhenatFat, teDhenatBiznesit }}
        />
        <hr className="invoice-hr" />
        <TeDhenatFatura
          faturaID={nrFatures}
          ProduktiPare={0}
          ProduktiFundit={produktet.length}
          isPDF={false}
          data={{ produktet }}
        />
        <hr className="invoice-hr" />
        <FooterFatura
          faturaID={nrFatures}
          Barkodi={barkodi}
          isPDF={false}
          data={{ teDhenatFat, produktet, bankat }}
        />
      </div>
    </div>
  );
}

export default Fatura;
