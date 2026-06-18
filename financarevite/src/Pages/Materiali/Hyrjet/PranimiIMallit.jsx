import { useEffect, useMemo, useState } from "react";
import "../../Styles/DizajniPergjithshem.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {

  faPlus
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { Form, Container, Row, Col } from "react-bootstrap";
import BarcodeScannerModal from "../../../Components/TeTjera/BarcodeScannerModal";
import { Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RegjistroFaturen from "../../../Components/Materiali/Hyrjet/PranimiIMallit/RegjistroFaturen";
import TeDhenatKalkulimit from "../../../Components/Materiali/Hyrjet/PranimiIMallit/TeDhenatKalkulimit";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import Select from "react-select";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import { darkSelectStyles } from "@/utils/darkSelectStyles";
import EditoDetajetFatures from "../../../Components/Materiali/Hyrjet/PranimiIMallit/EditoDetajetFatures";

function KalkulimiIMallit(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [partneret, setPartneret] = useState([]);

  const [nrRendorKalkulimit, setNrRendorKalkulimit] = useState(0);
  const [Partneri, setPartneri] = useState(0);
  const [nrFatures, setNrFatures] = useState("");
  const [showScannerFature, setShowScannerFature] = useState(false);
  const handleScanFatureResult = (decodedText) => {
    setNrFatures(decodedText);
    setShowScannerFature(false);
    const el = document.getElementById("dataEFatures");
    if (el) {
      el.focus();
      setTimeout(() => el.select(), 0);
    }
  };

  const today = new Date();
  const initialDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0]; // Format as 'yyyy-MM-dd'
  const [dataEFatures, setDataEFatures] = useState(initialDate);
  const [llojiIPageses, setLlojiIPageses] = useState("Cash");
  const [statusiIPageses, setStatusiIPageses] = useState("Pa Paguar");
  const [totPaTVSH, setTotPaTVSH] = useState("0.00");
  const [TVSH, setTVSH] = useState("0.00");

  const [kalkulimet, setKalkulimet] = useState([]);
  const [regjistroKalkulimin, setRegjistroKalkulimin] = useState(false);
  const [shfaqTeDhenat, setShfaqTeDhenat] = useState(false);
  const [mbyllFature, setMbyllFaturen] = useState(true);
  const [id, setId] = useState(0);

  const [idKalkulimitEdit, setIdKalkulimitEdit] = useState(0);

  const [edito, setEdito] = useState(false);

  const [teDhenat, setTeDhenat] = useState([]);

  const [statusiIPagesesValue, setStatusiIPagesesValue] = useState("Pa Paguar");

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

  // Add these state variables at the top of your component
  const [dataFillim, setDataFillim] = useState(
    new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0], // Today
  );
  const [dataMbarim, setDataMbarim] = useState(
    new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0], // Today
  );

  useEffect(() => {
    const shfaqKalkulimet = async () => {
      try {
        setLoading(true);
        const kalkulimi = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimet?dataFillim=${dataFillim}&dataMbarim=${dataMbarim}`,
          authentikimi
        );
        const kalkulimet = kalkulimi.data.filter(
          (item) => item.llojiKalkulimit === "PRM"
        );
        setKalkulimet(
          kalkulimet.map((k) => ({
            ID: k.idRegjistrimit,
            "Nr. Kalkulimit": k.nrRendorFatures,
            "Nr. Fatures": k.nrFatures,
            Partneri: k.emriBiznesit,
            "Totali Pa TVSH €": parseFloat(k.totaliPaTVSH).toFixed(2),
            "TVSH €": parseFloat(k.tvsh).toFixed(2),
            "Totali €": parseFloat(k.totaliPaTVSH + k.tvsh).toFixed(2),
            "Statusi Kalkulimit":
              k.statusiKalkulimit == "true" ? "I Mbyllur" : "I Hapur",
            "Data e Fatures": new Date(k.dataRegjistrimit).toISOString(),
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
          `${API_BASE_URL}/api/Partneri/shfaqPartneretFurntiore`,
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
          `${API_BASE_URL}/api/Faturat/getNumriFaturesMeRradhe?llojiKalkulimit=PRM`,
          authentikimi
        );
        setNrRendorKalkulimit(parseInt(nrFat.data));
      } catch (err) {
        console.log(err);
      }
    };

    vendosNrFaturesMeRradhe();
  }, []);

  const ndrroField = (e, tjetra) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const el = document.getElementById(tjetra);
      if (el) { el.focus(); setTimeout(() => el.select(), 0); }
    }
  };

  async function handleRegjistroKalkulimin() {
    if (isSubmitting) return;
    if (!Partneri) {
      setTipiMesazhit("danger");
      setPershkrimiMesazhit("Ju lutem zgjidhni nje partner!");
      setShfaqMesazhin(true);
      return;
    }
    if (!nrFatures) {
      setTipiMesazhit("danger");
      setPershkrimiMesazhit("Ju lutem vendosni numrin e fatures!");
      setShfaqMesazhin(true);
      return;
    }
    setIsSubmitting(true);
    try {
    try {
      await axios
        .post(
          `${API_BASE_URL}/api/Faturat/ruajKalkulimin`,
          {
            dataRegjistrimit: dataEFatures,
            stafiID: teDhenat.perdoruesi.userID,
            totaliPaTVSH: totPaTVSH,
            tvsh: TVSH,
            idPartneri: Partneri,
            statusiPageses: statusiIPageses,
            llojiPageses: llojiIPageses,
            nrFatures: nrFatures,
            nrRendorFatures: nrRendorKalkulimit + 1,
            llojiKalkulimit: "PRM",
          },
          authentikimi
        )
        .then((response) => {
          console.log(response);
          if (response.status === 200 || response.status === 201) {
            setPerditeso(Date.now());
            setIdKalkulimitEdit(response.data.idRegjistrimit);
            setRegjistroKalkulimin(true);
            setNrFatures("");
            setDataEFatures(initialDate);
            setLlojiIPageses("Cash");
            setStatusiIPageses("E Paguar");
            setTotPaTVSH("0.00");
            setTVSH("0.00");
          } else {
            console.log("gabim");
            setPerditeso(Date.now());
          }
        });
    } catch (error) {
      console.error(error);
    }
  
    } finally {
      setIsSubmitting(false);
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
        .then(async () => {
          setRegjistroKalkulimin(false);
          var r = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${idKalkulimitEdit}`,
            authentikimi
          );
          if (r.data.regjistrimet.llojiPageses !== "Borxh") {
            await axios.post(
              `${API_BASE_URL}/api/Faturat/ruajKalkulimin`,
              {
                dataRegjistrimit: r.data.regjistrimet.dataRegjistrimit,
                stafiID: r.data.regjistrimet.stafiID,
                totaliPaTVSH: parseFloat(
                  r.data.regjistrimet.totaliPaTVSH +
                  r.data.regjistrimet.tvsh -
                  r.data.rabati
                ),
                tvsh: 0,
                idPartneri: r.data.regjistrimet.idPartneri,
                statusiPageses: "E Paguar",
                llojiPageses: r.data.regjistrimet.llojiPageses,
                nrFatures: "PAGES-" + r.data.regjistrimet.nrFatures,
                llojiKalkulimit: "PAGES",
                pershkrimShtese:
                  "Pagese per Faturen: " + r.data.regjistrimet.nrFatures,
                nrRendorFatures: r.data.regjistrimet.nrRendorFatures + 1,
                idBonusKartela: null,
                statusiKalkulimit: "true",
              },
              authentikimi
            );
          }
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

  const [options, setOptions] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
    useEffect(() => {
    axios
      .get(
        `${API_BASE_URL}/api/Partneri/shfaqPartneretFurntiore`,
        authentikimi
      )
      .then((response) => {
        const fetchedoptions = response.data
          .filter((item) => item.idPartneri !== 2 && item.idPartneri !== 3)
          .map((item) => ({
            value: item.idPartneri,
            label: item.emriBiznesit,
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

    document.getElementById("nrFatures").focus();
  };

  const handleMenaxhoTastetPagesa = (event) => {
    if (event.key === "Enter") {
      handleRegjistroKalkulimin();
    }
  };

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Kalkulant", "Pergjegjes i Porosive", "1 Euro Menaxher", "1 Euro Staff"]} />
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
        <EditoDetajetFatures
          show={shfaqEditoFaturen}
          onHide={() => setShfaqEditoFaturen(false)}
          idKalkulimit={idKalkulimitPerEdito}
          perditesoTeDhenat={() => setPerditeso(Date.now())}
        />
        {edito && (
          <PerditesoStatusinKalk
            show={() => ndryshoStatusin(true)}
            hide={() => ndryshoStatusin(false)}
          />
        )}
        {loading ? (
          <div className="d-flex align-items-center justify-content-center py-5">
            <TailSpin
              height="80"
              width="80"
              color="#10b981"
              ariaLabel="tail-spin-loading"
              radius="1"
              visible={true}
            />
            <span className="text-soft ms-3">Duke ngarkuar...</span>
          </div>
        ) : (
          !regjistroKalkulimin &&
          !shfaqTeDhenat && (
            <>
              <div className="mb-4">
                <h1 className="h2 fw-bold text-white mb-1">Pranimi i Mallit</h1>
                <p className="text-soft opacity-75 small">Regjistrimi dhe menaxhimi i pranimit të mallit</p>
              </div>

              <Container fluid>
                <Row>
                  <Form className="row">
                    <Col md={4} className="mb-3">
                      <Form.Group controlId="nrRendorKalkulimit">
                        <Form.Label className="sp-label">Nr. Rendor i Kalkulimit</Form.Label>
                        <Form.Control
                          className="sp-input"
                          type="number"
                          value={
                            nrRendorKalkulimit ? nrRendorKalkulimit + 1 : 1
                          }
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4} className="mb-3">
                      <Form.Group controlId="produktiSelect">
                        <Form.Label className="sp-label">Partneri <span style={{ color: "red" }}>*</span></Form.Label>
                        <Select
                          className="sp-select-container"
                          classNamePrefix="sp-select"
                          value={optionsSelected}
                          onChange={handleChange}
                          options={options}
                          id="produktiSelect"
                          inputId="produktiSelect-input"
                          isDisabled={edito}
                          styles={darkSelectStyles}
                          placeholder="Zgjidh partnerin..."
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4} className="mb-3">
                      <Form.Group controlId="nrFatures">
                        <Form.Label className="sp-label">
                          Nr. Fatures <span style={{ color: "red" }}>*</span>
                          <button
                            type="button"
                            className="btn btn-sm d-inline-flex align-items-center justify-content-center ms-2"
                            onClick={() => setShowScannerFature(true)}
                            style={{ color: '#10b981', padding: '0', background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Skano faturën"
                          >
                            <Camera size={14} /> Skano
                          </button>
                        </Form.Label>
                        <Form.Control
                          className="sp-input"
                          id="nrFatures"
                          type="text"
                          value={nrFatures}
                          placeholder="Shkruaj numrin e faturës"
                          onChange={(e) => {
                            setNrFatures(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            ndrroField(e, "dataEFatures");
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Form>
                  <Col md={4} className="mb-3">
                    <Form.Group controlId="dataEFatures">
                      <Form.Label className="sp-label">Data e Fatures</Form.Label>
                      <Form.Control
                        className="sp-input"
                        id="dataEFatures"
                        type="date"
                        value={dataEFatures}
                        onChange={(e) => {
                          setDataEFatures(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          ndrroField(e, "llojiIPageses");
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Group controlId="llojiIPageses">
                      <Form.Label className="sp-label">Lloji i Pageses</Form.Label>
                      <Form.Select
                        id="llojiIPageses"
                        className="sp-input"
                        value={llojiIPageses ? llojiIPageses : 0}
                        onChange={(e) => {
                          setLlojiIPageses(e.target.value);
                          if (e.target.value == "Borxh") {
                            setStatusiIPageses("Pa Paguar");
                          }
                        }}
                        onKeyDown={(e) => {
                          ndrroField(e, "totPaTVSH");
                        }}>
                        <option value={0} disabled>
                          Zgjedhni Llojin e Pageses
                        </option>
                        <option value="Cash">Cash</option>
                        <option value="Banke">Banke</option>
                        <option value="Borxh">Borxh</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Group controlId="totPaTVSH">
                      <Form.Label className="sp-label">Totali Pa TVSH</Form.Label>
                      <Form.Control
                        className="sp-input"
                        id="totPaTVSH"
                        type="number"
                        value={totPaTVSH}
                        onChange={(e) => {
                          setTotPaTVSH(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          ndrroField(e, "TVSH");
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="mb-3">
                    <Form.Group controlId="TVSH">
                      <Form.Label className="sp-label">TVSH</Form.Label>
                      <Form.Control
                        className="sp-input"
                        id="TVSH"
                        type="number"
                        value={TVSH}
                        onChange={(e) => {
                          setTVSH(e.target.value);
                        }}
                        onKeyDown={handleMenaxhoTastetPagesa}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end mb-3">
                    <Button
                      className="btn-premium-shto w-100"
                      disabled={isSubmitting} onClick={() => handleRegjistroKalkulimin()}>
                      Regjistro <FontAwesomeIcon icon={faPlus} className="ms-2" />
                    </Button>
                  </Col>
                </Row>
                <div className="mt-2">
                  <Row className="mb-4 g-3 align-items-end">
                    <Col md={4}>
                      <Form.Group controlId="dataFillimFilter">
                        <Form.Label className="sp-label small">Data Fillim</Form.Label>
                        <Form.Control
                          className="sp-input"
                          type="date"
                          value={dataFillim}
                          onChange={(e) => {
                            setDataFillim(e.target.value);
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group controlId="dataMbarimFilter">
                        <Form.Label className="sp-label small">Data Mbarim</Form.Label>
                        <Form.Control
                          className="sp-input"
                          type="date"
                          value={dataMbarim}
                          onChange={(e) => {
                            setDataMbarim(e.target.value);
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Button
                        className="btn-premium-outline w-100"
                        onClick={() => {
                          setDataFillim(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
                          setDataMbarim(new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
                        }}>
                        Sot
                      </Button>
                    </Col>
                  </Row>


                  <Tabela
                    data={kalkulimet}
                    tableName="Lista e Kalkulimeve"
                    kaButona={true}
                    funksionShfaqFature={(e) => handleShfaqTeDhenat(e)}
                    funksionEditoFaturen={(id) => {
                      setIdKalkulimitPerEdito(id);
                      setShfaqEditoFaturen(true);
                    }}
                    funksionButonEdit={(e) => {
                      setIdKalkulimitEdit(e);
                      setNrRendorKalkulimit(e);
                      setRegjistroKalkulimin(true);
                    }}
                    dateField="Data e Fatures"
                    mosShfaqID={true}
                  />
                </div>
              </Container>
            </>
          )
        )}
      
        <BarcodeScannerModal
          show={showScannerFature}
          onHide={() => setShowScannerFature(false)}
          onScan={handleScanFatureResult}
        />
</div>
    </>
  );
}

export default KalkulimiIMallit;
