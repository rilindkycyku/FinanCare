import { useBarcode } from "next-barcode";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import HeaderFatura from "./HeaderFatura";
import "./Styles/Fatura.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Document, Page, pdf } from "@react-pdf/renderer";
import DetajeFatura from "./DetajeFatura";
import { MDBBtn } from "mdb-react-ui-kit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";
import FooterFatura from "./FooterFatura";

const Barkodi = ({ value }) => {
  const { inputRef } = useBarcode({ value: value || "" });
  return <svg ref={inputRef} style={{ width: "100px", height: "60px" }} />;
};

function Fatura({ nrFatures, mbyllFaturen }) {
  const [vendosFature, setVendosFature] = useState(false);
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState({});
  const [teDhenatFat, setTeDhenatFat] = useState({});
  const [produktet, setProduktet] = useState([]);
  const [bankat, setBankat] = useState([]);
  const [kaAkses, setKaAkses] = useState(true);
  const [nrFaqeve, setNrFaqeve] = useState(1);

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

        setProduktet(produktetRes.data || []);
        setTeDhenatFat(fatRes.data || {});
        setTeDhenatBiznesit(biznesiRes.data || {});
        setBankat(bankatRes.data || []);
        const roles = ["Faturist", "Menaxher", "Kalkulant"];
        setKaAkses(
          userRes.data?.rolet?.some((role) => roles.includes(role)) || false
        );

        const itemCount = produktetRes.data.length;
        const basePages = Math.ceil(itemCount / 13);
        setNrFaqeve(itemCount % 13 >= 9 ? basePages + 1 : basePages); // Adjust page count if last page has 9+ items
        setVendosFature(true);
        console.log(
          "Total products:",
          itemCount,
          "Pages:",
          Math.ceil(itemCount / 13)
        );
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [getID, nrFatures, navigate]);

  useEffect(() => {
    if (vendosFature && !kaAkses) navigate("/dashboard");
  }, [vendosFature, kaAkses, navigate]);

  const InvoicePDF = () => {
    const pages = [];
    let currentStart = 0;
    let pageNumber = 1;
    const itemsPerPage = 13;

    while (currentStart < produktet.length) {
      const end = Math.min(currentStart + itemsPerPage, produktet.length);
      const itemsOnPage = end - currentStart;
      const isLastPage = end === produktet.length;
      const forceFooterNewPage = isLastPage && itemsOnPage >= 9;

      const pageContent = (
        <DetajeFatura
          nrFatures={nrFatures}
          Barkodi={barkodi}
          ProduktiPare={currentStart}
          ProduktiFundit={end}
          LargoFooter={forceFooterNewPage || end < produktet.length}
          NrFaqes={pageNumber}
          NrFaqeve={nrFaqeve}
          isPDF={true}
          data={{ produktet, teDhenatFat, teDhenatBiznesit, bankat }}
          forceFooterNewPage={forceFooterNewPage}
        />
      );

      if (pageContent) {
        pages.push(
          <Page size={{ width: 595, height: 842 }} key={pageNumber}>
            {pageContent}
          </Page>
        );
        console.log(`PDF Page ${pageNumber}: ${currentStart}-${end}`);
      }

      if (forceFooterNewPage) {
        pages.push(
          <Page size={{ width: 595, height: 842 }} key={pageNumber + 1}>
            <View style={styles.page}>
              <HeaderFatura
                faturaID={nrFatures}
                Barkodi={barkodi}
                NrFaqes={pageNumber + 1}
                NrFaqeve={nrFaqeve+1}
                isPDF={true}
                data={{ teDhenatFat, teDhenatBiznesit }}
              />

              <View style={styles.hr} />
              <View style={styles.table}>
                <View style={[styles.row, ]}>
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
        console.log(`PDF Footer Page ${pageNumber + 1}`);

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

  const fixedContainerStyle = {
    width: "595px",
    margin: "0 auto",
    overflow: "auto",
    background: "#fff",
  };

  const renderUIPages = () => {
    const sections = [];
    let currentStart = 0;
    let pageNumber = 1;
    const itemsPerPage = 13;

    while (currentStart < produktet.length) {
      const end = Math.min(currentStart + itemsPerPage, produktet.length);
      const itemsOnPage = end - currentStart;
      const isLastPage = end === produktet.length;
      const forceFooterNewPage = isLastPage && itemsOnPage >= 9;

      sections.push(
        <div className={`page-${pageNumber}`} key={pageNumber}>
          <DetajeFatura
            nrFatures={nrFatures}
            Barkodi={barkodi}
            ProduktiPare={currentStart}
            ProduktiFundit={end}
            LargoFooter={forceFooterNewPage || end < produktet.length}
            NrFaqes={pageNumber}
            NrFaqeve={nrFaqeve}
            isPDF={false}
            data={{ produktet, teDhenatFat, teDhenatBiznesit, bankat }}
            forceFooterNewPage={forceFooterNewPage}
          />
        </div>
      );
      console.log(`UI Page ${pageNumber}: ${currentStart}-${end}`);

      if (forceFooterNewPage) {
        sections.push(
          <div className={`page-${pageNumber + 1}`} key={pageNumber + 1}>
            <HeaderFatura
              faturaID={nrFatures}
              Barkodi={barkodi}
              NrFaqes={pageNumber + 1}
              NrFaqeve={nrFaqeve}
              isPDF={false}
              data={{ teDhenatFat, teDhenatBiznesit }}
            />
            <hr
              style={{
                height: "1px",
                borderWidth: "0",
                backgroundColor: "black",
                margin: "0.5em 0",
              }}
            />
            <FooterFatura
              faturaID={nrFatures}
              Barkodi={barkodi}
              isPDF={false}
              data={{ teDhenatFat, produktet, bankat }}
            />
          </div>
        );
        console.log(`UI Footer Page ${pageNumber + 1}`);

        pageNumber++;
      }

      currentStart += itemsPerPage;
      pageNumber++;
    }
    return sections;
  };

  return vendosFature ? (
    <div style={fixedContainerStyle} className="fatura">
      <h1 className="title">
        Fatura NR: {barkodi}
        <div>
          <MDBBtn className="Butoni" onClick={FaturaPerRuajtje}>
            Ruaj <FontAwesomeIcon icon={faDownload} />
          </MDBBtn>
          <MDBBtn className="Butoni" onClick={mbyllFaturen}>
            <FontAwesomeIcon icon={faArrowLeft} /> Mbyll
          </MDBBtn>
        </div>
      </h1>
      {renderUIPages()}
    </div>
  ) : null;
}

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 11 },
  hr: { borderBottomWidth: 1, borderColor: "black", marginVertical: 5 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ccc" },
  header: { backgroundColor: "#f0f0f0" },
  cell: { flex: 1, padding: 3, fontSize: 7, textAlign: "center" }, // Smaller font and padding
});

export default Fatura;
