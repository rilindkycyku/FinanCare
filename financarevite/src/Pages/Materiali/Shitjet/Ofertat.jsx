import { useEffect, useState } from "react";
import "../../Styles/DizajniPergjithshem.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { Form, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import RegjistroFaturen from "../../../Components/Materiali/Shitjet/Ofertat/RegjistroFaturen";
import PerditesoStatusinKalk from "../../../Components/Materiali/Shitjet/Ofertat/PerditesoStatusinKalk";
import TeDhenatKalkulimit from "../../../Components/Materiali/Shitjet/Ofertat/TeDhenatKalkulimit";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import FaturoOferten from "../../../Components/Materiali/Shitjet/Ofertat/FaturoOferten";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import Select from "react-select";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";

function Ofertat(props) {
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
  const [llojiIPageses, setLlojiIPageses] = useState("Cash");
  const [statusiIPageses, setStatusiIPageses] = useState("E Paguar");
  const [totPaTVSH, setTotPaTVSH] = useState("0.00");
  const [TVSH, setTVSH] = useState("0.00");
  const [kartela, setKartela] = useState(null);
  const [kalkulimet, setKalkulimet] = useState([]);
  const [regjistroKalkulimin, setRegjistroKalkulimin] = useState(false);
  const [shfaqTeDhenat, setShfaqTeDhenat] = useState(false);
  const [mbyllFature, setMbyllFaturen] = useState(true);
  const [id, setId] = useState(0);
  const [idKalkulimitEdit, setIdKalkulimitEdit] = useState(0);
  const [edito, setEdito] = useState(false);
  const [importoNgaOferta, setImportoNgaOferta] = useState(false);
  const [nrRendorFat, setNrRendorFat] = useState(0);
  const [teDhenat, setTeDhenat] = useState([]);
  const navigate = useNavigate();
  const getID = localStorage.getItem("id");
  const getToken = localStorage.getItem("token");
  const authentikimi = { headers: { Authorization: `Bearer ${getToken}` } };

  const handleShfaqTeDhenat = (id) => {
    setId(id);
    setShfaqTeDhenat(true);
    setMbyllFaturen(false);
  };

  useEffect(() => {
    const shfaqKalkulimet = async () => {
      try {
        setLoading(true);
        const kalkulimi = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimet`,
          authentikimi
        );
        const kthimet = kalkulimi.data.filter(
          (item) => item.llojiKalkulimit === "OFERTE"
        );
        setKalkulimet(
          kthimet.map((k) => ({
            ID: k.idRegjistrimit,
            "Nr. Ofertes": k.nrRendorFatures,
            Partneri: k.emriBiznesit,
            "Pershkrimi Shtese": k.pershkrimShtese,
            "Data e Fatures": new Date(k.dataRegjistrimit).toISOString(),
            "Lloji Pageses": k.llojiPageses,
            Referenti: k.username,
            "Statusi Kalkulimit":
              k.statusiKalkulimit === "true" ? "I Mbyllur" : "I Hapur",
            "Eshte Faturuar": k.eshteFaturuarOferta === "true" ? "Po" : "Jo",
          }))
        );
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };
    shfaqKalkulimet();
  }, [perditeso]);

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
      } catch (err) {
        console.log(err);
      }
    };
    vendosPartnerin();
  }, [perditeso]);

  useEffect(() => {
    const vendosNrFaturesMeRradhe = async () => {
      try {
        const nrFat = await axios.get(
          `${API_BASE_URL}/api/Faturat/getNumriFaturesMeRradhe?llojiKalkulimit=OFERTE`,
          authentikimi
        );
        setNrRendorKalkulimit(parseInt(nrFat.data));
      } catch (err) {
        console.log(err);
      }
    };
    vendosNrFaturesMeRradhe();
  }, [perditeso]);

  const ndrroField = (e, tjetra) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(tjetra).focus();
    }
  };

  async function handleRegjistroKalkulimin() {
    try {
      await axios
        .post(
          `${API_BASE_URL}/api/Faturat/ruajKalkulimin`,
          {
            stafiID: teDhenat.perdoruesi.userID,
            totaliPaTVSH: totPaTVSH,
            tvsh: TVSH,
            idPartneri: Partneri,
            statusiPageses: statusiIPageses,
            llojiPageses: llojiIPageses,
            nrFatures: parseInt(nrRendorKalkulimit + 1).toString(),
            llojiKalkulimit: "OFERTE",
            pershkrimShtese: pershkrimShtese,
            nrRendorFatures: nrRendorKalkulimit + 1,
            idBonusKartela: kartela,
          },
          authentikimi
        )
        .then((response) => {
          if (response.status === 200 || response.status === 201) {
            setPerditeso(Date.now());
            setIdKalkulimitEdit(response.data.idRegjistrimit);
            setRegjistroKalkulimin(true);
          } else {
            console.log("gabim");
            setPerditeso(Date.now());
          }
        });
    } catch (error) {
      console.error(error);
    }
  }

  function mbyllKalkulimin() {
    try {
      axios
        .put(
          `${API_BASE_URL}/api/Faturat/ruajKalkulimin/perditesoStatusinKalkulimit?id=${idKalkulimitEdit}&statusi=true`,
          {},
          authentikimi
        )
        .then(() => {
          setRegjistroKalkulimin(false);
        });
    } catch (error) {
      console.error(error);
    }
  }

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

  const [statusiIPagesesValue, setStatusiIPagesesValue] = useState("Borxh");
  useEffect(() => {
    if (llojiIPageses === "Borxh") {
      setStatusiIPagesesValue("Borxh");
    } else {
      setStatusiIPagesesValue(statusiIPageses ? statusiIPageses : 0);
    }
  }, [llojiIPageses, statusiIPageses]);

  function shfaqImportoNgaOferta(shfaq) {
    if (shfaq === true) {
      setImportoNgaOferta(true);
    } else {
      setImportoNgaOferta(false);
    }
    setPerditeso(Date.now());
  }

  const [options, setOptions] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
  const customStyles = {
    menu: (provided) => ({
      ...provided,
      zIndex: 1050,
    }),
    control: (provided, state) => ({
      ...provided,
      fontSize: "16px", // Larger font for mobile
      padding: "5px",
      minHeight: "48px", // Larger tap target
      "@media (max-width: 576px)": {
        fontSize: "14px",
        padding: "3px",
        minHeight: "40px",
      },
    }),
    option: (provided) => ({
      ...provided,
      fontSize: "16px",
      padding: "10px",
      "@media (max-width: 576px)": {
        fontSize: "14px",
        padding: "8px",
      },
    }),
  };
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/Partneri/shfaqPartneretBleres`, authentikimi)
      .then((response) => {
        const fetchedoptions = response.data
          .filter((item) => item.nui != 0)
          .map((item) => ({
            value: item.idPartneri,
            label: item.emriBiznesit,
            item: item,
          }));
        setOptions(fetchedoptions);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleChange = async (partneri) => {
    setPartneri(partneri.value);
    setOptionsSelected(partneri);
    setKartela(partneri?.item?.kartela?.idKartela ?? null);
    document.getElementById("pershkrimShtese").focus();
  };

  const handleMenaxhoTastet = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleRegjistroKalkulimin();
    }
  };

  return (
    <>
      <KontrolloAksesinNeFaqe
        roletELejuara={["Menaxher", "Kalkulant", "Komercialist", "Faturist"]}
      />
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
        {regjistroKalkulimin && (
          <RegjistroFaturen
            mbyllKalkulimin={mbyllKalkulimin}
            mbyllPerkohesisht={() => setRegjistroKalkulimin(false)}
            nrRendorKalkulimit={idKalkulimitEdit}
            setPerditeso={() => setPerditeso(Date.now())}
            idKalkulimitEdit={idKalkulimitEdit}
          />
        )}
        {edito && (
          <PerditesoStatusinKalk
            show={() => ndryshoStatusin(true)}
            hide={() => ndryshoStatusin(false)}
          />
        )}
        {importoNgaOferta && (
          <FaturoOferten
            show={() => shfaqImportoNgaOferta(true)}
            hide={() => shfaqImportoNgaOferta(false)}
            nrRendorKalkulimit={nrRendorFat}
            setPerditeso={() => setPerditeso(Date.now())}
            setShfaqMesazhin={(e) => setShfaqMesazhin(e)}
            setPershkrimiMesazhit={(e) => setPershkrimiMesazhit(e)}
            setTipiMesazhit={(e) => setTipiMesazhit(e)}
          />
        )}
        {loading ? (
          <div className="Loader">
            <TailSpin
              height="80"
              width="80"
              color="#009879"
              ariaLabel="tail-spin-loading"
              radius="1"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
            />
          </div>
        ) : (
          !regjistroKalkulimin &&
          !shfaqTeDhenat && (
            <>
              <h1 className="title">Ofertat</h1>
              <Container fluid>
                <Row className="gy-3">
                  {" "}
                  {/* Added gy-3 for vertical gutter spacing */}
                  <Col xs={12} sm={6} md={4} className="mb-3">
                    <Form.Group controlId="idDheEmri">
                      <Form.Label>Nr. Rendor i Ofertes</Form.Label>
                      <Form.Control
                        id="nrRendorKalkulimit"
                        type="number"
                        value={nrRendorKalkulimit ? nrRendorKalkulimit + 1 : 1}
                        disabled
                        className="form-control-lg"
                      />
                    </Form.Group>
                    <Form.Group controlId="idDheEmri" className="mt-3">
                      <Form.Label>Partneri</Form.Label>
                      <Select
                        value={optionsSelected}
                        onChange={handleChange}
                        options={options}
                        id="produktiSelect"
                        inputId="produktiSelect-input"
                        isDisabled={edito}
                        styles={customStyles}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={4} className="mb-3">
                    <Form.Group controlId="pershkrimShtese">
                      <Form.Label>Pershkrim Shtese</Form.Label>
                      <Form.Control
                        id="pershkrimShtese"
                        type="text"
                        value={pershkrimShtese}
                        onChange={(e) => setPershkrimShtese(e.target.value)}
                        onKeyDown={(e) => ndrroField(e, "llojiIPageses")}
                        className="form-control-lg"
                      />
                    </Form.Group>
                    <Form.Group className="mt-3">
                      <Form.Label>Lloji i Pageses</Form.Label>
                      <select
                        id="llojiIPageses"
                        className="form-select form-select-lg"
                        value={llojiIPageses ? llojiIPageses : 0}
                        onChange={(e) => setLlojiIPageses(e.target.value)}
                        onKeyDown={handleMenaxhoTastet}>
                        <option defaultValue value={0} key={0} disabled>
                          Zgjedhni Llojin e Pageses
                        </option>
                        <option key={1} value="Cash">
                          Cash
                        </option>
                        <option key={2} value="Banke">
                          Banke
                        </option>
                        <option key={3} value="Borxh">
                          Borxh
                        </option>
                      </select>
                    </Form.Group>
                  </Col>
                  <Col
                    xs={12}
                    sm={12}
                    md={4}
                    className="mb-3 d-flex align-items-end">
                    <Button
                      className="Butoni w-100 mb-3"
                      onClick={() => handleRegjistroKalkulimin()}
                      style={{ padding: "12px", fontSize: "18px" }}>
                      Regjistro <FontAwesomeIcon icon={faPlus} />
                    </Button>
                  </Col>
                </Row>
                <div className="mt-2">
                  <Tabela
                    data={kalkulimet}
                    tableName="Lista e Ofertave"
                    kaButona={true}
                    funksionShfaqFature={(e) => handleShfaqTeDhenat(e)}
                    funksionNdryshoStatusinEFatures={() => setEdito(true)}
                    funksionButonEdit={(e) => {
                      setIdKalkulimitEdit(e);
                      setNrRendorKalkulimit(e);
                      setRegjistroKalkulimin(true);
                    }}
                    funksionFaturoOferten={(e) => {
                      setImportoNgaOferta(true);
                      setNrRendorFat(e);
                    }}
                    dateField="Data e Fatures"
                    kontrolloStatusin
                    mosShfaqID={true}
                  />
                </div>
              </Container>
            </>
          )
        )}
      </div>
    </>
  );
}

export default Ofertat;
