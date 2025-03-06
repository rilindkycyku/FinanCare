import "./Styles/Fatura.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Document, Page, pdf } from "@react-pdf/renderer";
import DetajeFatura from "./DetajeFatura";
import { MDBBtn } from "mdb-react-ui-kit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";

function Fatura({ nrFatures, mbyllFaturen }) {
  const [vendosFature, setVendosFature] = useState(false);
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState({});
  const [teDhenatFat, setTeDhenatFat] = useState({});
  const [produktet, setProduktet] = useState([]);
  const [kaAkses, setKaAkses] = useState(true);
  const [pageFlags, setPageFlags] = useState({
    meShumeSe15: false,
    meShumeSe30: false,
    meShumeSe45: false,
    meShumeSe60: false,
    meShumeSe75: false,
    meShumeSe90: false,
  });
  const [nrFaqeve, setNrFaqeve] = useState(1);

  const navigate = useNavigate();
  const getID = localStorage.getItem("id");
  const getToken = localStorage.getItem("token");
  const authentikimi = { headers: { Authorization: `Bearer ${getToken}` } };

  const dataPorosise = new Date(teDhenatFat?.regjistrimet?.dataRegjistrimit || Date.now());
  const dita = dataPorosise.getDate().toString().padStart(2, "0");
  const muaji = (dataPorosise.getMonth() + 1).toString().padStart(2, "0");
  const viti = dataPorosise.getFullYear().toString().slice(-2);
  const barkodi = teDhenatFat?.regjistrimet?.llojiKalkulimit === "PARAGON"
    ? teDhenatFat?.regjistrimet?.nrFatures || "N/A"
    : `${teDhenatBiznesit?.shkurtesaEmritBiznesit || "N/A"}-${dita}${muaji}${viti}-${teDhenatFat?.regjistrimet?.llojiKalkulimit || "N/A"}-${teDhenatFat?.regjistrimet?.nrRendorFatures || "N/A"}`;

  useEffect(() => {
    if (!getID) return navigate("/login");

    const fetchData = async () => {
      try {
        const [produktetRes, fatRes, biznesiRes, userRes] = await Promise.all([
          axios.get(`https://localhost:7285/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${nrFatures}`, authentikimi),
          axios.get(`https://localhost:7285/api/Faturat/shfaqRegjistrimetNgaID?id=${nrFatures}`, authentikimi),
          axios.get("https://localhost:7285/api/TeDhenatBiznesit/ShfaqTeDhenat", authentikimi),
          axios.get(`https://localhost:7285/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`, authentikimi),
        ]);

        setProduktet(produktetRes.data || []);
        setTeDhenatFat(fatRes.data || {});
        setTeDhenatBiznesit(biznesiRes.data || {});
        const roles = ["Faturist", "Menaxher", "Kalkulant"];
        setKaAkses(userRes.data?.rolet?.some(role => roles.includes(role)) || false);

        const itemCount = produktetRes.data.length;
        setPageFlags({
          meShumeSe15: itemCount >= 15,
          meShumeSe30: itemCount >= 40,
          meShumeSe45: itemCount >= 65,
          meShumeSe60: itemCount >= 90,
          meShumeSe75: itemCount >= 115,
          meShumeSe90: itemCount >= 140,
        });
        setNrFaqeve(Math.ceil(itemCount / 25) || 1);
        setVendosFature(true);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [getID, nrFatures, navigate]);

  useEffect(() => {
    if (vendosFature && !kaAkses) navigate("/dashboard");
  }, [vendosFature, kaAkses, navigate]);

  const InvoicePDF = () => (
    <Document>
      <Page size={{ width: 595, height: 842 }}>
        <DetajeFatura
          nrFatures={nrFatures}
          Barkodi={barkodi}
          ProduktiPare={0}
          ProduktiFundit={pageFlags.meShumeSe15 ? 14 : produktet.length}
          LargoFooter={pageFlags.meShumeSe15}
          NrFaqes={1}
          NrFaqeve={nrFaqeve}
          isPDF={true}
          data={{ produktet, teDhenatFat, teDhenatBiznesit }}
        />
      </Page>
      {pageFlags.meShumeSe15 && (
        <Page size={{ width: 595, height: 842 }}>
          <DetajeFatura
            nrFatures={nrFatures}
            Barkodi={barkodi}
            ProduktiPare={15}
            ProduktiFundit={pageFlags.meShumeSe30 ? 30 : produktet.length}
            LargoFooter={pageFlags.meShumeSe30}
            NrFaqes={2}
            NrFaqeve={nrFaqeve}
            isPDF={true}
            data={{ produktet, teDhenatFat, teDhenatBiznesit }}
          />
        </Page>
      )}
      {pageFlags.meShumeSe30 && (
        <Page size={{ width: 595, height: 842 }}>
          <DetajeFatura
            nrFatures={nrFatures}
            Barkodi={barkodi}
            ProduktiPare={30}
            ProduktiFundit={pageFlags.meShumeSe45 ? 45 : produktet.length}
            LargoFooter={pageFlags.meShumeSe45}
            NrFaqes={3}
            NrFaqeve={nrFaqeve}
            isPDF={true}
            data={{ produktet, teDhenatFat, teDhenatBiznesit }}
          />
        </Page>
      )}
      {pageFlags.meShumeSe45 && (
        <Page size={{ width: 595, height: 842 }}>
          <DetajeFatura
            nrFatures={nrFatures}
            Barkodi={barkodi}
            ProduktiPare={45}
            ProduktiFundit={pageFlags.meShumeSe60 ? 60 : produktet.length}
            LargoFooter={pageFlags.meShumeSe60}
            NrFaqes={4}
            NrFaqeve={nrFaqeve}
            isPDF={true}
            data={{ produktet, teDhenatFat, teDhenatBiznesit }}
          />
        </Page>
      )}
      {pageFlags.meShumeSe60 && (
        <Page size={{ width: 595, height: 842 }}>
          <DetajeFatura
            nrFatures={nrFatures}
            Barkodi={barkodi}
            ProduktiPare={60}
            ProduktiFundit={pageFlags.meShumeSe75 ? 75 : produktet.length}
            LargoFooter={pageFlags.meShumeSe75}
            NrFaqes={5}
            NrFaqeve={nrFaqeve}
            isPDF={true}
            data={{ produktet, teDhenatFat, teDhenatBiznesit }}
          />
        </Page>
      )}
      {pageFlags.meShumeSe75 && (
        <Page size={{ width: 595, height: 842 }}>
          <DetajeFatura
            nrFatures={nrFatures}
            Barkodi={barkodi}
            ProduktiPare={75}
            ProduktiFundit={pageFlags.meShumeSe90 ? 90 : produktet.length}
            LargoFooter={pageFlags.meShumeSe90}
            NrFaqes={6}
            NrFaqeve={nrFaqeve}
            isPDF={true}
            data={{ produktet, teDhenatFat, teDhenatBiznesit }}
          />
        </Page>
      )}
      {pageFlags.meShumeSe90 && (
        <Page size={{ width: 595, height: 842 }}>
          <DetajeFatura
            nrFatures={nrFatures}
            Barkodi={barkodi}
            ProduktiPare={90}
            ProduktiFundit={produktet.length}
            LargoFooter={false}
            NrFaqes={7}
            NrFaqeve={nrFaqeve}
            isPDF={true}
            data={{ produktet, teDhenatFat, teDhenatBiznesit }}
          />
        </Page>
      )}
    </Document>
  );

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
    width: "595px", // Updated to portrait width
    margin: "0 auto",
    overflow: "auto",
    background: "#fff",
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
      <div className="mePakSe25">
        <DetajeFatura
          nrFatures={nrFatures}
          Barkodi={barkodi}
          ProduktiPare={0}
          ProduktiFundit={pageFlags.meShumeSe15 ? 14 : produktet.length}
          LargoFooter={pageFlags.meShumeSe15}
          NrFaqes={1}
          NrFaqeve={nrFaqeve}
          isPDF={false}
          data={{ produktet, teDhenatFat, teDhenatBiznesit }}
        />
      </div>
      {pageFlags.meShumeSe15 && (
        <div className="meShumeSe15">
          <DetajeFatura
            nrFatures={nrFatures}
            Barkodi={barkodi}
            ProduktiPare={15}
            ProduktiFundit={pageFlags.meShumeSe30 ? 30 : produktet.length}
            LargoFooter={pageFlags.meShumeSe30}
            NrFaqes={2}
            NrFaqeve={nrFaqeve}
            isPDF={false}
            data={{ produktet, teDhenatFat, teDhenatBiznesit }}
          />
        </div>
      )}
      {pageFlags.meShumeSe30 && (
        <div className="meShumeSe30">
          <DetajeFatura
            nrFatures={nrFatures}
            Barkodi={barkodi}
            ProduktiPare={30}
            ProduktiFundit={pageFlags.meShumeSe45 ? 45 : produktet.length}
            LargoFooter={pageFlags.meShumeSe45}
            NrFaqes={3}
            NrFaqeve={nrFaqeve}
            isPDF={false}
            data={{ produktet, teDhenatFat, teDhenatBiznesit }}
          />
        </div>
      )}
      {pageFlags.meShumeSe45 && (
        <div className="meShumeSe45">
          <DetajeFatura
            nrFatures={nrFatures}
            Barkodi={barkodi}
            ProduktiPare={45}
            ProduktiFundit={pageFlags.meShumeSe60 ? 60 : produktet.length}
            LargoFooter={pageFlags.meShumeSe60}
            NrFaqes={4}
            NrFaqeve={nrFaqeve}
            isPDF={false}
            data={{ produktet, teDhenatFat, teDhenatBiznesit }}
          />
        </div>
      )}
      {pageFlags.meShumeSe60 && (
        <div className="meShumeSe60">
          <DetajeFatura
            nrFatures={nrFatures}
            Barkodi={barkodi}
            ProduktiPare={60}
            ProduktiFundit={pageFlags.meShumeSe75 ? 75 : produktet.length}
            LargoFooter={pageFlags.meShumeSe75}
            NrFaqes={5}
            NrFaqeve={nrFaqeve}
            isPDF={false}
            data={{ produktet, teDhenatFat, teDhenatBiznesit }}
          />
        </div>
      )}
      {pageFlags.meShumeSe75 && (
        <div className="meShumeSe75">
          <DetajeFatura
            nrFatures={nrFatures}
            Barkodi={barkodi}
            ProduktiPare={75}
            ProduktiFundit={pageFlags.meShumeSe90 ? 90 : produktet.length}
            LargoFooter={pageFlags.meShumeSe90}
            NrFaqes={6}
            NrFaqeve={nrFaqeve}
            isPDF={false}
            data={{ produktet, teDhenatFat, teDhenatBiznesit }}
          />
        </div>
      )}
      {pageFlags.meShumeSe90 && (
        <div className="meShumeSe90">
          <DetajeFatura
            nrFatures={nrFatures}
            Barkodi={barkodi}
            ProduktiPare={90}
            ProduktiFundit={produktet.length}
            LargoFooter={false}
            NrFaqes={7}
            NrFaqeve={nrFaqeve}
            isPDF={false}
            data={{ produktet, teDhenatFat, teDhenatBiznesit }}
          />
        </div>
      )}
    </div>
  ) : null;
}

export default Fatura;