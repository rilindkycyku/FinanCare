import { useEffect, useMemo, useState, useRef } from "react";
import "../../../../Pages/Styles/DizajniPergjithshem.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {

  faPlus,
  faPenToSquare,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import {

  Form,
  Container,
  Row,
  Col,
  Modal,
  Card,
  Badge,
  InputGroup
} from "react-bootstrap";
import Select from "react-select";
import Tabela from "../../../TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";
import { useNavigate } from "react-router-dom";

import { darkSelectStyles } from "@/utils/darkSelectStyles";

function RegjistroFaturen(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [produktetNeKalkulim, setProduktetNeKalkulim] = useState([]);
  const [emriProduktit, setEmriProduktit] = useState("");
  const [produktiID, setproduktiID] = useState(0);
  const [produktet, setProduktet] = useState([]);
  const [sasia, setSasia] = useState("");
  const [qmimiShites, setQmimiShites] = useState("");
  const [rabati1, setRabati1] = useState("");
  const [rabati2, setRabati2] = useState(null);
  const [rabati3, setRabati3] = useState(null);
  const [njesiaMatese, setNjesiaMatese] = useState("Cope");
  const [totProdukteve, setTotProdukteve] = useState(0);
  const [totStokut, setTotStokut] = useState(0);
  const [totQmimi, setTotQmimi] = useState(0);
  const [totFat, setTotFat] = useState(0);
  const [sasiaNeStok, setSasiaNeStok] = useState(0);
  const [qmimiB, setQmimiB] = useState(0);
  const [qmimiSH, setQmimiSH] = useState(0);
  const [qmimiSH2, setQmimiSH2] = useState(0);
  const [sasiaShumices, setSasiaShumices] = useState(0);

  const [idTeDhenatKalk, setIdTeDhenatKalk] = useState(0);

  const [edito, setEdito] = useState(false);
  const [konfirmoMbylljenFatures, setKonfirmoMbylljenFatures] = useState(false);
  const [konfirmoProduktin, setKonfirmoProduktin] = useState(false);

  const [teDhenat, setTeDhenat] = useState([]);
  const [teDhenatFatures, setTeDhenatFatures] = useState([]);

  const [konifirmoProduktinLista, setKonifirmoProduktinLista] = useState([]);

  const [siteName, setSiteName] = useState("FinanCare");

  const [options, setOptions] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
  const [loadingProdukteve, setLoadingProdukteve] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (val, { action }) => {
    if (action === "input-change") {
      setInputValue(val);
    } else if (action === "set-value" || action === "menu-close") {
      setInputValue("");
    }
  };

  const filteredOptions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) return [];

    const lower = inputValue.toLowerCase();
    const results = [];
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      if (option && option.label && option.label.toLowerCase().includes(lower)) {
        results.push(option);
        if (results.length >= 50) break;
      }
    }
    return results;
  }, [inputValue, options]);

  const navigate = useNavigate();

  const getID = localStorage.getItem("id");

  const getToken = localStorage.getItem("token");

  const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

    useEffect(() => {
    const vendosTeDhenatBiznesit = async () => {
      try {
        const teDhenat = await axios.get(
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`,
          authentikimi
        );
        setSiteName(teDhenat?.data?.emriIBiznesit);
      } catch (err) {
        console.log(err);
      }
    };
    vendosTeDhenatBiznesit();
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
    if (props.idKalkulimitEdit != 0) {
      const vendosTeDhenat = async () => {
        try {
          const teDhenatKalkulimit = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${props.idKalkulimitEdit}`,
            authentikimi
          );

          const teDhenatFatures = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.idKalkulimitEdit}`,
            authentikimi
          );
          setRabati2(
            teDhenatFatures?.data?.regjistrimet?.bonusKartela?.rabati ?? null
          );
          setProduktetNeKalkulim(
            teDhenatKalkulimit.data.map((k, index) => ({
              ID: k.id,
              "Nr. Rendor": index + 1,
              "Emri Produktit": k.emriProduktit,
              Sasia: parseFloat(k.sasiaStokut).toFixed(2),
              "Qmimi Shites €": parseFloat(k.qmimiShites).toFixed(2),
              "R. 1 %": parseFloat(k.rabati1).toFixed(2),
              "R. 2 %": parseFloat(k.rabati2).toFixed(2),
              "R. 3 %": parseFloat(k.rabati3).toFixed(2),
              "Qmimi Shites - Rabati": parseFloat(
                k.qmimiShites -
                k.qmimiShites * (k.rabati1 / 100) -
                (k.qmimiShites - k.qmimiShites * (k.rabati1 / 100)) *
                (k.rabati2 / 100) -
                (k.qmimiShites -
                  k.qmimiShites * (k.rabati1 / 100) -
                  (k.qmimiShites - k.qmimiShites * (k.rabati1 / 100)) *
                  (k.rabati2 / 100)) *
                (k.rabati3 / 100)
              ).toFixed(2),
              "Totali €": parseFloat(
                (k.qmimiShites -
                  k.qmimiShites * (k.rabati1 / 100) -
                  (k.qmimiShites - k.qmimiShites * (k.rabati1 / 100)) *
                  (k.rabati2 / 100) -
                  (k.qmimiShites -
                    k.qmimiShites * (k.rabati1 / 100) -
                    (k.qmimiShites - k.qmimiShites * (k.rabati1 / 100)) *
                    (k.rabati2 / 100)) *
                  (k.rabati3 / 100)) *
                k.sasiaStokut
              ).toFixed(2),
            }))
          );
          setTeDhenatFatures(teDhenatFatures.data);
          console.log(teDhenatFatures.data);
          console.log(teDhenatKalkulimit.data);
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      };

      vendosTeDhenat();
    }
  }, [perditeso, produktiID]);

  useEffect(() => {
    const vendosProduktet = async () => {
      try {
        const produktet = await axios.get(
          `${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`,
          authentikimi
        );
        setProduktet(produktet.data);
      } catch (err) {
        console.log(err);
      }
    };

    vendosProduktet();
  }, [perditeso]);

  useEffect(() => {
    let totalProdukteve = 0;
    let totalStokut = 0;
    let totalQmimi = 0;
    let totalFat = 0;

    produktetNeKalkulim.forEach((produkti) => {
      totalProdukteve += 1;
      totalStokut += parseFloat(produkti.Sasia);
      totalQmimi +=
        parseFloat(produkti.Sasia) * parseFloat(produkti["Qmimi Shites €"]);
      totalFat += parseFloat(produkti["Totali €"]);
    });

    setTotProdukteve(totalProdukteve);
    setTotStokut(totalStokut.toFixed(2));
    setTotQmimi(totalQmimi.toFixed(2));
    setTotFat(totalFat.toFixed(3));
  }, [produktetNeKalkulim]);

  useEffect(() => {
    const perditesoFaturen = async () => {
      try {
        await axios
          .get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.idKalkulimitEdit}`,
            authentikimi
          )
          .then(async (r) => {
            console.log(r.data);
            await axios.put(
              `${API_BASE_URL}/api/Faturat/perditesoFaturen?idKalulimit=${props.nrRendorKalkulimit}`,
              {
                llojiPageses: r.data.regjistrimet.llojiPageses,
                statusiKalkulimit: r.data.regjistrimet.statusiKalkulimit,
                idPartneri: r.data.regjistrimet.idPartneri,
                dataRegjistrimit: r.data.regjistrimet.dataRegjistrimit,
                stafiID: r.data.regjistrimet.stafiID,
                totaliPaTVSH: parseFloat(r.data.totaliPaTVSH),
                tvsh: parseFloat(r.data.totaliMeTVSH - r.data.totaliPaTVSH),
                statusiPageses: r.data.statusiPageses,
                llojiKalkulimit: r.data.regjistrimet.llojiKalkulimit,
                nrFatures: r.data.regjistrimet.nrFatures,
                pershkrimShtese: r.data.regjistrimet.pershkrimShtese,
                rabati: parseFloat(r.data.rabati),
                nrRendorFatures: r.data.regjistrimet.nrRendorFatures,
                idBonusKartela: r.data.regjistrimet.idBonusKartela,
              },
              authentikimi
            );
          });
      } catch (err) {
        console.log(err);
      }
    };

    perditesoFaturen();
  }, [perditeso]);

  const handleSubmit = async (event) => {
    console.log(optionsSelected);
    if (sasia <= 0) {
      event.preventDefault();
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      event.preventDefault();
      console.log(optionsSelected);
      await axios
        .post(
          `${API_BASE_URL}/api/Faturat/ruajKalkulimin/teDhenat`,
          {
            idRegjistrimit: props.nrRendorKalkulimit,
            idProduktit: optionsSelected?.value,
            sasiaStokut: sasia,
            qmimiBleres: optionsSelected?.item?.qmimiBleres,
            qmimiShites: sasia >= optionsSelected?.item?.sasiaShumices
              ? optionsSelected?.item?.qmimiMeShumic
              : optionsSelected?.item?.qmimiProduktit,
            qmimiShitesMeShumic: optionsSelected?.item?.qmimiMeShumic,
            rabati1: optionsSelected?.item?.rabati ?? 0,
            rabati2: rabati2 ?? 0,
            rabati3: rabati3 ?? 0,
          },
          authentikimi
        )
        .then(async () => {
          setPerditeso(Date.now());
        });

      setproduktiID(0);
      setInputValue("");
      setSasia("");
      setSasiaNeStok(0);
      setQmimiB(0);
      setQmimiSH(0);
      setQmimiSH2(0);
      setRabati3(null);
      setQmimiShites(0);
      setPerditeso(Date.now());
    }
  };

  const ndrroField = (e, tjetra) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const el = document.getElementById(tjetra);
      if (el) { el.focus(); setTimeout(() => el.select(), 0); }
    }
  };

  async function handleMbyllFature() {
    try {
      if (produktetNeKalkulim.length === 0) {
        props.setPerditeso();
        props.mbyllPerkohesisht();
      } else {
        for (let produkti of produktetNeKalkulim) {
          var prod = produktet.find(
            (item) => item.emriProduktit == produkti["Emri Produktit"]
          );

          await axios.put(
            `${API_BASE_URL}/api/Faturat/ruajKalkulimin/asgjesoStokun/perditesoStokunQmimin?id=${prod?.produktiID}`,
            {
              sasiaNeStok: produkti["Sasia"],
            },
            authentikimi
          );
        }

        props.setPerditeso();
        props.mbyllKalkulimin();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleFshij(id) {
    await axios
      .delete(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/FshijTeDhenat?idTeDhenat=${id}`,
        authentikimi
      )
      .then(async () => {
        setPerditeso(Date.now());
      });
  }

  async function handleEdit(id) {
    await axios
      .get(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/getKalkulimi?idKalkulimit=${id}`,
        authentikimi
      )
      .then((p) => {
        console.log(p.data[0]);
        setPerditeso(Date.now);

        setEdito(true);
        setproduktiID(p.data[0].idProduktit);
        setOptionsSelected(
          options.find((item) => item.value == p.data[0].idProduktit) || { value: p.data[0].idProduktit, label: p.data[0].emriProduktit, item: p.data[0] }
        );
        setEmriProduktit(p.data[0].emriProduktit);
        setSasiaNeStok(p.data[0].sasiaNeStok);
        setSasia(p.data[0].sasiaStokut);
        setQmimiB(p.data[0].qmimiBleres);
        setQmimiSH(p.data[0].qmimiProduktit);
        setQmimiSH2(p.data[0].qmimiShitesMeShumic);
        setQmimiShites(p.data[0].qmimiShites);
        setRabati1(p.data[0].rabati1);
        setRabati2(p.data[0].rabati2);
        setRabati3(p.data[0].rabati3);
      
        setTimeout(() => {
          document.getElementById("sasia")?.select();
        }, 150);
      });
  }

  async function handleEdito(id) {
    if (produktiID === 0 || sasia <= 0) {
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      await axios
        .put(
          `${API_BASE_URL}/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${id}`,
          {
            qmimiBleres: qmimiB,
            qmimiShites: sasia >= optionsSelected?.item?.sasiaShumices
              ? optionsSelected?.item?.qmimiMeShumic
              : optionsSelected?.item?.qmimiProduktit,
            sasiaStokut: sasia,
            qmimiShitesMeShumic: qmimiSH2,
            rabati1: rabati1 || 0,
            rabati2: rabati2 || 0,
            rabati3: rabati3 || 0,
          },
          authentikimi
        )
        .then(async () => {
          setPerditeso(Date.now());
        });

      setproduktiID(0);
      setSasia("");
      setInputValue("");
      setSasiaNeStok(0);
      setQmimiB(0);
      setQmimiSH(0);
      setQmimiSH2(0);
      setQmimiShites("");
      setRabati3(null);
      setOptionsSelected(null);
      setEdito(false);
    }
  }

  function KthehuTekFaturat() {
    props.setPerditeso();
    props.mbyllPerkohesisht();
  }

  function kontrolloQmimin(e) {
    setSasia(e.target.value);
  }

  useEffect(() => {
    let active = true;
    const fetchProduktet = async () => {
      try {
        setLoadingProdukteve(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`,
          authentikimi
        );
        if (!active) return;
        const fetchedoptions = (response.data || []).map((item) => ({
          value: item.produktiID,
          label: (item.emriProduktit || "") + " - " + (item.barkodi || "") + " - " + (item.kodiProduktit || ""),
          item: item,
        }));
        setOptions(fetchedoptions);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (active) setLoadingProdukteve(false);
      }
    };
    fetchProduktet();
    return () => { active = false; };
  }, [API_BASE_URL, authentikimi]);

  const selectRef = useRef(null);

  const handleKaloTekSasia = (event) => {
    if (event.key === "Enter") {
      const currentInput = document.getElementById("produktiSelect-input")?.value || "";
      if (filteredOptions.length === 0 && currentInput.trim().length > 0) {
        setTipiMesazhit("danger");
        setPershkrimiMesazhit(`Produkti me këtë barkod nuk u gjet! (${currentInput})`);
        setShfaqMesazhin(true);
        setInputValue(""); 
        setTimeout(() => selectRef.current?.focus(), 10);
      } else if (filteredOptions.length > 0) {
        event.preventDefault();
        handleChange(filteredOptions[0]);
      }
    }
  };

  const handleChange = async (partneri) => {
    setOptionsSelected(partneri);
    document.getElementById("sasia").focus();
  };

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant", "Komercialist", "Faturist"]}
        largo={() => props.largo()}
        shfaqmesazhin={() => props.shfaqmesazhin()}
        perditesoTeDhenat={() => props.perditesoTeDhenat()}
        setTipiMesazhit={(e) => props.setTipiMesazhit(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit(e)}
      />
      <div className="containerDashboardP">
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}
        {konfirmoMbylljenFatures && (
          <Modal
            show={konfirmoMbylljenFatures}
            onHide={() => setKonfirmoMbylljenFatures(false)}>
            <Modal.Header closeButton>
              <Modal.Title as="h6">Konfirmo Mbylljen e Fatures</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <strong style={{ fontSize: "10pt" }}>
                A jeni te sigurt qe deshironi ta mbyllni Faturen?
              </strong>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setKonfirmoMbylljenFatures(false)}>
                Edito Faturen <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
              <Button variant="warning" onClick={handleMbyllFature}>
                Konfirmo <FontAwesomeIcon icon={faPlus} />
              </Button>
            </Modal.Footer>
          </Modal>
        )}
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
          <>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <div>
                <h1 className="title mb-1">Porosia</h1>
                <div className="text-muted" style={{ fontSize: "10pt" }}>
                  Regjistro produktet për këtë porosi.
                </div>
              </div>
              <Button
                variant="outline-secondary"
                onClick={() => KthehuTekFaturat()}>
                <FontAwesomeIcon icon={faArrowLeft} /> Kthehu mbrapa
              </Button>
            </div>

            <Container fluid>
              <Row className="g-3">
                <Col lg={5} xl={4}>
                  <Card className="shadow-sm">
                    <Card.Header className="d-flex align-items-center justify-content-between">
                      <div className="fw-semibold">Shto / Edito Produkt</div>
                      {edito ? (
                        <Badge bg="warning" text="dark">
                          Editim
                        </Badge>
                      ) : (
                        <Badge bg="success">Shtim</Badge>
                      )}
                    </Card.Header>
                    <Card.Body>
                      <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="idDheEmri" className="mb-3">
                          <Form.Label className="fw-semibold">
                            Produkti
                          </Form.Label>
                          <Select
                            ref={selectRef}
                            onKeyDown={handleKaloTekSasia}
                            value={optionsSelected}
                            onChange={handleChange}
                            options={filteredOptions}
                            id="produktiSelect"
                            inputId="produktiSelect-input"
                            isDisabled={edito || loadingProdukteve}
                            isLoading={loadingProdukteve}
                            styles={darkSelectStyles}
                            placeholder={
                              loadingProdukteve
                                ? "Duke ngarkuar produktet..."
                                : "Kërko produkt (min. 2 shkronja)..."
                            }
                            onInputChange={handleInputChange}
                            inputValue={inputValue}
                            noOptionsMessage={() =>
                              loadingProdukteve
                                ? "Duke ngarkuar..."
                                : inputValue.length < 2
                                  ? "Shkruani të paktën 2 karaktere"
                                  : "Nuk u gjet asnjë produkt"
                            }
                            autoFocus
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Sasia - {njesiaMatese}
                          </Form.Label>
                          <InputGroup>
                            <Form.Control
                              id="sasia"
                              type="number"
                              placeholder={"0.00 " + njesiaMatese}
                              value={sasia}
                              onChange={(e) => {
                                kontrolloQmimin(e);
                              }}
                              onKeyDown={(e) => {
                                ndrroField(e, "rabati");
                              }}
                            />
                            <InputGroup.Text>{njesiaMatese}</InputGroup.Text>
                          </InputGroup>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Rabati %
                          </Form.Label>
                          <InputGroup>
                            <Form.Control
                              id="rabati"
                              type="number"
                              placeholder={"0.00 %"}
                              value={rabati3}
                              onChange={(e) => {
                                setRabati3(e.target.value);
                              }}
                            />
                            <InputGroup.Text>%</InputGroup.Text>
                          </InputGroup>
                        </Form.Group>
                        <div className="d-flex gap-2 mt-3">
                          <Button
                            variant="success"
                            type="submit"
                            disabled={edito}>
                            Shto Produktin <FontAwesomeIcon icon={faPlus} />
                          </Button>
                          {edito && (
                            <Button
                              variant="warning"
                              onClick={() => handleEdito(idTeDhenatKalk)}>
                              Edito Produktin{" "}
                              <FontAwesomeIcon icon={faPenToSquare} />
                            </Button>
                          )}
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={7} xl={4}>
                  <Card className="shadow-sm h-100">
                    <Card.Header className="fw-semibold">
                      Produkti i zgjedhur
                    </Card.Header>
                    <Card.Body>
                      {!optionsSelected?.item ? (
                        <div className="text-muted">
                          Zgjidh një produkt për të parë detajet.
                        </div>
                      ) : (
                        <>
                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                            <div className="fw-semibold">
                              {optionsSelected.item.emriProduktit}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              {optionsSelected.item.kodiProduktit && (
                                <Badge bg="info" text="dark">
                                  {optionsSelected.item.kodiProduktit}
                                </Badge>
                              )}
                              <Badge bg="secondary">
                                {optionsSelected.item.barkodi}
                              </Badge>
                            </div>
                          </div>
                          <Row className="g-2">
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div
                                    className="text-muted"
                                    style={{ fontSize: "9pt" }}>
                                    Sasia aktuale në stok
                                  </div>
                                  <div className="fw-semibold">
                                    {optionsSelected?.item?.sasiaNeStok ?? 0}{" "}
                                    {optionsSelected?.item?.emriNjesiaMatese ??
                                      "Copë"}
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div
                                    className="text-muted"
                                    style={{ fontSize: "9pt" }}>
                                    Blerje + TVSH
                                  </div>
                                  <div className="fw-semibold">
                                    {parseFloat(
                                      optionsSelected?.item?.qmimiBleres ?? 0
                                    ).toFixed(2)}{" "}
                                    €
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div
                                    className="text-muted"
                                    style={{ fontSize: "9pt" }}>
                                    Pakic + TVSH
                                  </div>
                                  <div className="fw-semibold">
                                    {parseFloat(
                                      optionsSelected?.item?.qmimiProduktit ?? 0
                                    ).toFixed(2)}{" "}
                                    €
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div
                                    className="text-muted"
                                    style={{ fontSize: "9pt" }}>
                                    Shumic + TVSH
                                  </div>
                                  <div className="fw-semibold">
                                    {parseFloat(
                                      optionsSelected?.item?.qmimiMeShumic ?? 0
                                    ).toFixed(2)}{" "}
                                    €
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                          </Row>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                <Col xl={4}>
                  <Card
                    className="shadow-sm h-100"
                    style={{ position: "sticky", top: "1rem" }}>
                    <Card.Header className="fw-semibold">
                      Përmbledhje fature
                    </Card.Header>
                    <Card.Body>
                      <Row className="g-2">
                        <Col sm={6}>
                          <div
                            className="text-muted"
                            style={{ fontSize: "9pt" }}>
                            Nr. Porosise
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures.regjistrimet?.nrRendorFatures ??
                              "-"}
                          </div>
                        </Col>
                        <Col sm={6}>
                          <div
                            className="text-muted"
                            style={{ fontSize: "9pt" }}>
                            Lloji Pageses
                          </div>
                          <div className="fw-semibold text-truncate">
                            {teDhenatFatures.regjistrimet?.llojiPageses ?? "-"}
                          </div>
                        </Col>
                        <Col sm={12}>
                          <div
                            className="text-muted"
                            style={{ fontSize: "9pt" }}>
                            Partneri
                          </div>
                          <div className="fw-semibold text-truncate">
                            {teDhenatFatures.regjistrimet?.emriBiznesit ?? "-"}
                          </div>
                        </Col>
                      </Row>

                      <hr />

                      <Row className="g-2">
                        <Col sm={6}>
                          <div
                            className="text-muted"
                            style={{ fontSize: "9pt" }}>
                            Totali Produkteve
                          </div>
                          <div className="fw-semibold">{totProdukteve}</div>
                        </Col>
                        <Col sm={6}>
                          <div
                            className="text-muted"
                            style={{ fontSize: "9pt" }}>
                            Sasia Totale
                          </div>
                          <div className="fw-semibold">
                            {parseFloat(totStokut).toFixed(2)}
                          </div>
                        </Col>
                        <Col sm={12}>
                          <div
                            className="text-muted"
                            style={{ fontSize: "9pt" }}>
                            Totali Fatures
                          </div>
                          <div
                            className="fw-bold text-success"
                            style={{ fontSize: "1.2rem" }}>
                            {parseFloat(totFat).toFixed(2)} €
                          </div>
                        </Col>
                      </Row>

                      <div className="d-grid gap-2 mt-4">
                        <Button
                          variant="primary"
                          onClick={() => setKonfirmoMbylljenFatures(true)}>
                          Mbyll Faturen <FontAwesomeIcon icon={faPlus} />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="shadow-sm mt-3">
                <Card.Header className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div className="fw-semibold">
                    Tabela e Produkteve te Fatures
                  </div>
                  <Badge bg="success" style={{ fontSize: "10pt" }}>
                    Totali: {parseFloat(totFat).toFixed(2)} €
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <Tabela
                    data={produktetNeKalkulim}
                    tableName="Tabela e Produkteve te Fatures"
                    kaButona={true}
                    funksionButonFshij={(e) => handleFshij(e)}
                    funksionButonEdit={(e) => {
                      handleEdit(e);
                      setIdTeDhenatKalk(e);
                    }}
                    mosShfaqKerkimin
                      mosShfaqTitullin={true}
                      mosShfaqPaginimin={true}
                    mosShfaqID={true}
                  />
                </Card.Body>
              </Card>
            </Container>
          </>
        )}
      </div>
    </>
  );
}

export default RegjistroFaturen;
