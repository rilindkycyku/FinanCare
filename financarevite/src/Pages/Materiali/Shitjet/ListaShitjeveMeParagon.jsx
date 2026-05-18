import { useEffect, useMemo, useState } from "react";
import "../../Styles/DizajniPergjithshem.css";
import axios from "axios";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { TailSpin } from "react-loader-spinner";
import { Button, Col, Container, Form, Row} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PerditesoStatusinKalk from "../../../Components/Materiali/Shitjet/ListaShitjeveMeParagon/PerditesoStatusinKalk";
import TeDhenatKalkulimit from "../../../Components/Materiali/Shitjet/ListaShitjeveMeParagon/TeDhenatKalkulimit";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import EditoDetajetFatures from "../../../Components/Materiali/Shitjet/ListaShitjeveMeParagon/EditoDetajetFatures";

function ListaShitjeveMeParagon(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [partneret, setPartneret] = useState([]);

  const [nrRendorKalkulimit, setNrRendorKalkulimit] = useState(0);
  const [pershkrimShtese, setPershkrimShtese] = useState("");
  const [Partneri, setPartneri] = useState(0);
  const [nrFatures, setNrFatures] = useState("");
  const today = new Date();
  const initialDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  const [dataEFatures, setDataEFatures] = useState(initialDate);
  const [llojiIPageses, setLlojiIPageses] = useState("Cash");
  const [statusiIPageses, setStatusiIPageses] = useState("E Paguar");
  const [totPaTVSH, setTotPaTVSH] = useState("0.00");
  const [TVSH, setTVSH] = useState("0.00");

  const [kalkulimet, setKalkulimet] = useState([]);
  const [regjistroKalkulimin, setRegjistroKalkulimin] = useState(false);

  const [shfaqTeDhenat, setShfaqTeDhenat] = useState(false);
  const [mbyllFature, setMbyllFaturen] = useState(true);
  const [id, setId] = useState(0);

  const [idKalkulimitEdit, setIdKalkulimitEdit] = useState(0);

  const [edito, setEdito] = useState(false);
  const [konfirmoMbylljenFatures, setKonfirmoMbylljenFatures] = useState(false);

  const [dataFillestare, setDataFillestare] = useState(null);
  const [dataFundit, setDataFundit] = useState(null);
  const [filtroStatusi, setFiltroStatusi] = useState("Te Gjitha");

  const [teDhenat, setTeDhenat] = useState([]);

  // Edit invoice header modal
  const [shfaqEditoFaturen, setShfaqEditoFaturen] = useState(false);
  const [idKalkulimitPerEdito, setIdKalkulimitPerEdito] = useState(null);

  const navigate = useNavigate();

  const getID = localStorage.getItem("id");

  const getToken = localStorage.getItem("token");

    const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

  const handleShfaqTeDhenat = (id) => {
    setId(id);
    setShfaqTeDhenat(true);
    setMbyllFaturen(false);
  };

  const [dataFillim, setDataFillim] = useState(
    new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]
  );
  const [dataMbarim, setDataMbarim] = useState(
    new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]
  );

  useEffect(() => {
    const shfaqKalkulimet = async () => {
      try {
        setLoading(true);
        const kalkulimi = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimet?dataFillim=${dataFillim}&dataMbarim=${dataMbarim}`,
          authentikimi
        );
        const kthimet = kalkulimi.data.filter(
          (item) => item.llojiKalkulimit === "PARAGON"
        );
        console.log(kthimet);
        setKalkulimet(
          kthimet.map((k) => ({
            ID: k.idRegjistrimit,
            "Nr. Fatures": k.nrFatures,
            Partneri: k.emriBiznesit,
            "Data e Fatures": new Date(k.dataRegjistrimit).toISOString(),
            "Tot - TVSH €": parseFloat(k.totaliPaTVSH).toFixed(2),
            "TVSH €": parseFloat(k.tvsh).toFixed(2),
            "R. €": parseFloat(k.rabati).toFixed(2),
            "Totali €": parseFloat(k.totaliPaTVSH + k.tvsh).toFixed(2),
            "Lloji Pageses": k.llojiPageses,
            "Statusi Kalkulimit":
              k.statusiKalkulimit === "true" ? "I Mbyllur" : "I Hapur",
          }))
        );
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    shfaqKalkulimet();
  }, [perditeso, dataFillim, dataMbarim]);

  useEffect(() => {
    if (getID) {
      const vendosTeDhenat = async () => {
        try {
          const perdoruesi = await axios.get(
            `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
            authentikimi
          );
          setTeDhenat(perdoruesi.data);
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      };

      vendosTeDhenat();
    } else {
      navigate("/login");
    }
  }, [perditeso]);

  useEffect(() => {
    const vendosPartnerin = async () => {
      try {
        const partneri = await axios.get(
          `${API_BASE_URL}/api/Partneri/shfaqPartneretBleres`,
          authentikimi
        );
        setPartneret(partneri.data);
        console.log(partneri);
      } catch (err) {
        console.log(err);
      }
    };

    vendosPartnerin();
  }, [perditeso]);

  function ndryshoStatusin(shfaq) {
    if (shfaq === true) {
      setEdito(true);
    } else {
      setEdito(false);
    }
    setPerditeso(Date.now());
  }

  const mbyllTeDhenat = () => {
    setMbyllFaturen(true);
    setShfaqTeDhenat(false);
  };

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "1 Euro Menaxher"]} />
      <NavBar />
      <div className="containerDashboardP" style={{ width: "90%" }}>
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}
        {shfaqTeDhenat && (
          <TeDhenatKalkulimit setMbyllTeDhenat={mbyllTeDhenat} id={id} />
        )}
        {edito && (
          <PerditesoStatusinKalk
            show={() => ndryshoStatusin(true)}
            hide={() => ndryshoStatusin(false)}
          />
        )}
        <EditoDetajetFatures
          show={shfaqEditoFaturen}
          onHide={() => setShfaqEditoFaturen(false)}
          idKalkulimit={idKalkulimitPerEdito}
          perditesoTeDhenat={() => setPerditeso(Date.now())}
        />
        {loading ? (
          <div className="Loader">
            <TailSpin
              height="80"
              width="80"
              color="#10b981"
              ariaLabel="tail-spin-loading"
              radius="1"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
            />
          </div>
        ) : (
          !shfaqTeDhenat && (
            <>
              <Container fluid>
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Data Fillim</Form.Label>
                      <Form.Control
                        type="date"
                        value={dataFillim}
                        onChange={(e) => {
                          setDataFillim(e.target.value);
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Data Mbarim</Form.Label>
                      <Form.Control
                        type="date"
                        value={dataMbarim}
                        onChange={(e) => {
                          setDataMbarim(e.target.value);
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3} className="d-flex align-items-end">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setDataFillim(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
                        setDataMbarim(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
                      }}
                      className="w-100">
                      Sot
                    </Button>
                  </Col>
                </Row>
                <Tabela
                  data={kalkulimet}
                  tableName="Lista e Shitjeve me Paragon"
                  kaButona={true}
                  funksionShfaqFature={(e) => handleShfaqTeDhenat(e)}
                  funksionEditoFaturen={(id) => {
                    setIdKalkulimitPerEdito(id);
                    setShfaqEditoFaturen(true);
                  }}
                  funksionNdryshoStatusinEFatures={() => setEdito(true)}
                  dateField="Data e Fatures"
                  mosShfaqID={true}
                />
              </Container>
            </>
          )
        )}
      </div>
    </>
  );
}

export default ListaShitjeveMeParagon;
