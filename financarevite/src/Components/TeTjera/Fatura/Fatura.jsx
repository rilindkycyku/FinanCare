import "./Styles/Fatura.css";
import axios from "axios";
import { useState, useEffect } from "react";
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
import DetajeFatura from "./DetajeFatura";
import HeaderFatura from "./HeaderFatura";
import TeDhenatFatura from "./TeDhenatFatura";
import FooterFatura from "./FooterFatura";
import { MDBBtn } from "mdb-react-ui-kit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";

Font.register({
  family: "Quicksand",
  fonts: [
    { src: "/fonts/Quicksand-Regular.ttf" }, // Regular weight
    { src: "/fonts/Quicksand-Bold.ttf", fontWeight: "bold" }, // Bold weight (if used)
    // Add other weights/styles if needed (e.g., italic, light)
  ],
});

function Fatura({ nrFatures, mbyllFaturen }) {
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState({});
  const [teDhenatFat, setTeDhenatFat] = useState({});
  const [produktet, setProduktet] = useState([]);
  const [bankat, setBankat] = useState([]);
  const [kaAkses, setKaAkses] = useState(true);
  const [estimatedPages, setEstimatedPages] = useState(1);

  const navigate = useNavigate();
  const getID = localStorage.getItem("id");
  const getToken = localStorage.getItem("token");
  const authentikimi = { headers: { Authorization: `Bearer ${getToken}` } };

  const dataPorosise = new Date(
    teDhenatFat?.regjistrimet?.dataRegjistrimit || Date.now()
  );
  const dita = dataPorosise.getDate().toString().padStart(2, "0");
  const muaji = (dataPorosise.getMonth() + 1).toString().padStart(2, "0");
  const viti = dataPorosise.getFullYear().toString().slice(-2);
  const barkodi =
    teDhenatFat?.regjistrimet?.llojiKalkulimit === "PARAGON"
      ? teDhenatFat?.regjistrimet?.nrFatures || ""
      : `${
          teDhenatBiznesit?.shkurtesaEmritBiznesit || ""
        }-${dita}${muaji}${viti}-${
          teDhenatFat?.regjistrimet?.llojiKalkulimit || ""
        }-${teDhenatFat?.regjistrimet?.nrRendorFatures || ""}`;

  useEffect(() => {
    if (!getID) return navigate("/login");

    const fetchData = async () => {
      try {
        const [produktetRes, fatRes, biznesiRes, userRes, bankatRes] =
          await Promise.all([
            axios.get(
              `https://localhost:7285/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${nrFatures}`,
              authentikimi
            ),
            axios.get(
              `https://localhost:7285/api/Faturat/shfaqRegjistrimetNgaID?id=${nrFatures}`,
              authentikimi
            ),
            axios.get(
              "https://localhost:7285/api/TeDhenatBiznesit/ShfaqTeDhenat",
              authentikimi
            ),
            axios.get(
              `https://localhost:7285/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
              authentikimi
            ),
            axios.get(
              "https://localhost:7285/api/TeDhenatBiznesit/ShfaqLlogaritEBiznesit",
              authentikimi
            ),
          ]);

        const produktetData = produktetRes.data || [];
        setProduktet(produktetData);
        setTeDhenatFat(fatRes.data || {});
        setTeDhenatBiznesit(biznesiRes.data || {});
        setBankat(bankatRes.data || []);
        const roles = ["Faturist", "Menaxher", "Kalkulant"];
        setKaAkses(
          userRes.data?.rolet?.some((role) => roles.includes(role)) || false
        );

        const itemCount = produktetData.length;
        const fullPages = Math.floor(itemCount / 24); // Full pages at 24 items
        const remainder = itemCount % 24;
        const totalPages =
          remainder > 0 ? fullPages + (remainder <= 14 ? 1 : 2) : fullPages;
        setEstimatedPages(totalPages);
      } catch (err) {
        console.error("Error fetching data:", err);
        navigate("/login");
      }
    };

    fetchData();
  }, [getID, nrFatures, navigate]);

  useEffect(() => {
    if (!kaAkses) navigate("/dashboard");
  }, [kaAkses, navigate]);

  const styles = StyleSheet.create({
    page: { padding: 20, fontSize: 11 },
    hr: { borderBottomWidth: 1, borderColor: "black", marginVertical: 5 },
    row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ccc" },
    header: { backgroundColor: "#f0f0f0", fontWeight: "bold" },
    cell: { flex: 1, padding: 3, fontSize: 7, textAlign: "center" }, // Smaller font and padding
  });

  const InvoicePDF = () => {
    const itemsPerFullPage = 24; // Full pages
    const maxItemsLastPage = 14; // Last page with footer
    const pages = [];
    let currentStart = 0;
    let pageNumber = 1;

    while (currentStart < produktet.length) {
      let itemsPerPage = itemsPerFullPage;
      const remainingItems = produktet.length - currentStart;
      const isLastPage = remainingItems <= itemsPerFullPage;

      if (isLastPage) {
        itemsPerPage =
          remainingItems <= maxItemsLastPage
            ? remainingItems
            : itemsPerFullPage;
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
              <HeaderFatura
                faturaID={nrFatures}
                Barkodi={barkodi}
                NrFaqes={pageNumber + 1}
                NrFaqeve={estimatedPages}
                isPDF={true}
                data={{ teDhenatFat, teDhenatBiznesit }}
              />

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
                <View style={styles.row} key={1}>
                  <Text style={styles.cell}> </Text>
                  <Text style={styles.cell}> </Text>
                  <Text style={styles.cell}> </Text>
                  <Text style={styles.cell}> </Text>
                  <Text style={styles.cell}> </Text>
                  <Text style={styles.cell}> </Text>
                  <Text style={styles.cell}> </Text>
                  <Text style={styles.cell}> </Text>
                  <Text style={styles.cell}> </Text>
                  <Text style={styles.cell}> </Text>
                  <Text style={styles.cell}> </Text>
                  <Text style={styles.cell}> </Text>
                  <Text style={styles.cell}> </Text>
                </View>
              </View>
              <View style={styles.hr} />
              <FooterFatura
                faturaID={nrFatures}
                Barkodi={barkodi}
                isPDF={true}
                data={{ teDhenatFat, produktet, bankat }}
              />
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

  const FaturaPerRuajtje = async () => {
    const blob = await pdf(<InvoicePDF />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${barkodi}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    mbyllFaturen();
  };

  if (!teDhenatFat || !produktet.length) return null;

  return (
    <div className="fatura">
      <h1 className="title">
        Fatura NR: {barkodi}
        <div>
          <span className="page-hint">
            Fatura ndahet në : {estimatedPages} faqe
          </span>
          <MDBBtn className="fatura-butoni" onClick={FaturaPerRuajtje}>
            Ruaj <FontAwesomeIcon icon={faDownload} />
          </MDBBtn>
          <MDBBtn className="fatura-butoni" onClick={mbyllFaturen}>
            <FontAwesomeIcon icon={faArrowLeft} /> Mbyll
          </MDBBtn>
        </div>
      </h1>
      <div className="fatura-content">
        <HeaderFatura
          faturaID={nrFatures}
          Barkodi={barkodi}
          NrFaqes={1}
          NrFaqeve={estimatedPages}
          isPDF={false}
          data={{ teDhenatFat, teDhenatBiznesit }}
        />
        <hr className="fatura-hr" />
        <TeDhenatFatura
          faturaID={nrFatures}
          ProduktiPare={0}
          ProduktiFundit={produktet.length}
          isPDF={false}
          data={{ produktet }}
        />
        <hr className="fatura-hr" />
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
