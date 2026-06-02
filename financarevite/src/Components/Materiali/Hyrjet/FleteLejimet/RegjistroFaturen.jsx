import { useEffect, useMemo, useState, useRef } from "react";
﻿import "../../../../Pages/Styles/DizajniPergjithshem.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { Form, Container, Row, Col, Card, Badge, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import { Camera } from "lucide-react";
import BarcodeScannerModal from "../../../TeTjera/BarcodeScannerModal";
import Tabela from "../../../TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";
import { darkSelectStyles } from "@/utils/darkSelectStyles";

function RegjistroFaturen(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [produktetNeKalkulim, setproduktetNeKalkulim] = useState([]);
  const [emriProduktit, setEmriProduktit] = useState("");
  const [produktiID, setProduktiID] = useState(0);
  const [produktet, setProduktet] = useState([]);
  const [sasia, setSasia] = useState("");
  const [qmimiBleres, setQmimiBleres] = useState("");
  const [qmimiShites, setQmimiShites] = useState("");
  const [qmimiShitesMeShumic, setQmimiShitesMeShumic] = useState("");
  const [rabati1, setRabati1] = useState(null);
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
  const [llojiTVSH, setLlojiTVSH] = useState(0);
  const [qmimiSH2, setQmimiSH2] = useState(0);
  const [sasiaShumices, setSasiaShumices] = useState(0);

  const [idTeDhenatKalk, setIdTeDhenatKalk] = useState(0);

  const [edito, setEdito] = useState(false);
  const [konfirmoMbylljenFatures, setKonfirmoMbylljenFatures] = useState(false);
  const [konfirmoProduktin, setKonfirmoProduktin] = useState(false);

  const [teDhenat, setTeDhenat] = useState([]);
  const [teDhenatFatures, setTeDhenatFatures] = useState([]);

  const navigate = useNavigate();

  const getID = localStorage.getItem("id");
  const getToken = localStorage.getItem("token");

  const authentikimi = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${getToken}`,
      },
    }),
    [getToken],
  );

  const customStyles = useMemo(
    () => ({
      menu: (provided) => ({
        ...provided,
        zIndex: 1050,
      }),
    }),
    [],
  );

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
  }, [API_BASE_URL, authentikimi, getID, navigate, perditeso]);

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

          setproduktetNeKalkulim(
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
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      };

      vendosTeDhenat();
    }
  }, [API_BASE_URL, authentikimi, perditeso, produktiID, props.idKalkulimitEdit]);

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
  }, [API_BASE_URL, authentikimi, perditeso]);

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
  }, [API_BASE_URL, authentikimi, perditeso, props.idKalkulimitEdit, props.nrRendorKalkulimit]);

  const handleSubmit = async (event) => {
    if (event) {
      event.preventDefault();
    }
    const sasiaNum = Number(sasia);

    if (!Number.isFinite(sasiaNum) || sasiaNum <= 0) {
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      console.log(optionsSelected);
      await axios
        .post(
          `${API_BASE_URL}/api/Faturat/ruajKalkulimin/teDhenat`,
          {
            idRegjistrimit: props.nrRendorKalkulimit,
            idProduktit: optionsSelected?.value,
            sasiaStokut: sasiaNum,
            qmimiBleres: optionsSelected?.item?.qmimiBleres,
            qmimiShites: sasiaNum >= optionsSelected?.item?.sasiaShumices
              ? optionsSelected?.item?.qmimiMeShumic
              : optionsSelected?.item?.qmimiProduktit,
            qmimiShitesMeShumic: optionsSelected?.item?.qmimiMeShumic,
            rabati1: optionsSelected?.item?.rabati ?? 0,
            rabati3: rabati3 ?? 0,
          },
          authentikimi
        )
        .then(async () => {
          setPerditeso(Date.now());
        });

      setProduktiID(0);
      setSasia("");
      setSasiaNeStok(0);
      setQmimiB(0);
      setQmimiSH(0);
      setQmimiSH2(0);
      setRabati3(0);
      setQmimiShites(0);
      setPerditeso(Date.now());
      setOptionsSelected(null);
      setTimeout(() => {
        document.getElementById("produktiSelect-input").focus();
      }, 80);
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
              sasiaNeStok: -produkti["Sasia"],
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

  async function handleEdit(id, index) {
    await axios
      .get(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/getKalkulimi?idKalkulimit=${id}`,
        authentikimi
      )
      .then((p) => {
        console.log(p.data[0]);
        setPerditeso(Date.now);

        setEdito(true);
        setProduktiID(p.data[0].idProduktit);
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
        const selectedOption = options.find((opt) => opt.value === p.data[0].idProduktit);
        setOptionsSelected(selectedOption || {
          value: p.data[0].idProduktit,
          label: p.data[0].emriProduktit,
          item: { produktiID: p.data[0].idProduktit, emriProduktit: p.data[0].emriProduktit }
        });
      
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
      console.log(optionsSelected)
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
            rabati1: rabati1,
            rabati2: rabati2,
            rabati3: rabati3,
          },
          authentikimi
        )
        .then(async () => {
          setPerditeso(Date.now());
        });

      setProduktiID(0);
      setSasia("");
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

  const [options, setOptions] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleScanResult = (scannedCode) => {
    setShowScanner(false);
    setInputValue(scannedCode);
    setTimeout(() => {
       const selectElement = document.getElementById("produktiSelect-input");
       if (selectElement) {
         selectElement.focus();
         const match = options.find(opt => opt.label && opt.label.includes(scannedCode));
         if (match) {
            handleChange(match);
         }
       }
    }, 400);
  };



  const [listaProdukteve, setListaProdukteve] = useState([]);
  const [loadingProdukteve, setLoadingProdukteve] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const vendosProduktet = async () => {
      try {
        const produktet = await axios.get(
          `${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`,
          authentikimi
        );
        if (isMounted) {
          setListaProdukteve(produktet.data);
          setLoadingProdukteve(false);
        }
      } catch (err) {
        console.log(err);
        if (isMounted) {
          setLoadingProdukteve(false);
        }
      }
    };

    vendosProduktet();

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL, authentikimi]);

  useEffect(() => {
    const fetchedoptions = listaProdukteve
      .filter((item) => item.qmimiProduktit > 0)
      .map((item) => ({
        value: item.produktiID,
        label:
          item.emriProduktit +
          " - " +
          item.barkodi +
          " - " +
          item.kodiProduktit,
        item: item,
      }));
    setOptions(fetchedoptions);
  }, [listaProdukteve]);

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

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (val, { action }) => {
    if (action === "input-change") {
      setInputValue(val);
    } else if (action === "set-value" || action === "menu-close") {
      setInputValue("");
    }
  };

  const filteredOptions = useMemo(() => {
    if (inputValue.length < 2) return [];

    const lower = inputValue.toLowerCase();

    return options
      .filter((o) => o.label.toLowerCase().includes(lower))
      .slice(0, 30);
  }, [inputValue, options]);

  const canSubmit = Boolean(
    !loadingProdukteve &&
      optionsSelected?.value &&
      Number(sasia) > 0,
  );

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant", "Faturist", "Komercialist"]}
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
                A jeni te sigurt qe deshironi ta mbyllni Fletën e Lejimit?
              </strong>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setKonfirmoMbylljenFatures(false)}>
                Edito Fletën <FontAwesomeIcon icon={faPenToSquare} />
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
                <h1 className="title mb-1">Flete Lejimet</h1>
                <div className="text-muted" style={{ fontSize: "10pt" }}>
                  Shto produktet në fletën e lejimit.
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
                      <div className="fw-semibold">Shto Produkt</div>
                      <Badge bg={edito ? "warning" : "success"}>
                        {edito ? "Editim" : "Shtim"}
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="idDheEmri" className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <Form.Label className="fw-semibold mb-0">
                              Produkti
                            </Form.Label>
                            <button 
                              type="button"
                              onClick={() => setShowScanner(true)}
                              style={{ color: '#10b981', padding: '0', background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Camera size={14} /> Skano
                            </button>
                          </div>
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
                            onInputChange={handleInputChange}
                            inputValue={inputValue}
                            placeholder={
                              loadingProdukteve
                                ? "Duke ngarkuar produktet..."
                                : "Kërko produkt..."
                            }
                            noOptionsMessage={() =>
                              loadingProdukteve
                                ? "Duke ngarkuar..."
                                : inputValue.length < 2
                                  ? "Shkruani të paktën 2 karaktere"
                                  : "Nuk u gjet produkt"
                            }
                          />
                          <div className="text-muted mt-1" style={{ fontSize: "9pt" }}>
                            Këshillë: shkruani barkodin ose emrin e produktit.
                          </div>
                        </Form.Group>

                        <Row className="g-2">
                          <Col md={6}>
                            <Form.Group className="mb-2">
                              <Form.Label className="fw-semibold">
                                Sasia
                              </Form.Label>
                              <InputGroup>
                                <Form.Control
                                  id="sasia"
                                  type="number"
                                  inputMode="decimal"
                                  placeholder="0.00"
                                  value={sasia}
                                  onChange={(e) => kontrolloQmimin(e)}
                                  onKeyDown={(e) =>
                                    ndrroField(e, "rabati")
                                  }
                                />
                                <InputGroup.Text>{njesiaMatese}</InputGroup.Text>
                              </InputGroup>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-2">
                              <Form.Label className="fw-semibold">
                                Rabati %
                              </Form.Label>
                              <Form.Control
                                id="rabati"
                                type="number"
                                inputMode="decimal"
                                placeholder="0.00"
                                value={rabati3 === null ? "" : rabati3}
                                onChange={(e) =>
                                  setRabati3(e.target.value === "" ? null : parseFloat(e.target.value))
                                }
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <div className="d-grid gap-2">
                          <Button
                            variant="success"
                            type="submit"
                            disabled={edito || !canSubmit}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSubmit();
                            }}>
                            Shto Produktin <FontAwesomeIcon icon={faPlus} />
                          </Button>
                          {edito && (
                            <Button
                              variant="warning"
                              disabled={!canSubmit}
                              onClick={() => handleEdito(idTeDhenatKalk)}>
                              Ruaj Ndryshimet{" "}
                              <FontAwesomeIcon icon={faPenToSquare} />
                            </Button>
                          )}
                        </div>
                      </Form>
                    </Card.Body>
                    <Card.Footer className="text-muted" style={{ fontSize: "9pt" }}>
                      {edito
                        ? "Po editoni një rresht ekzistues në tabelë."
                        : "Shto rreshta në tabelë dhe më pas mbyll fletën."}
                    </Card.Footer>
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
                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                            <div className="fw-semibold">
                              {optionsSelected.item.emriProduktit}
                            </div>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              {optionsSelected?.item?.kodiProduktit ? (
                                <Badge bg="info" text="dark">
                                  {optionsSelected.item.kodiProduktit}
                                </Badge>
                              ) : null}
                              <Badge bg="secondary">
                                {optionsSelected.item.barkodi}
                              </Badge>
                            </div>
                          </div>
                          <Row className="g-2">
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div className="text-muted" style={{ fontSize: "9pt" }}>
                                    Sasia në stok
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
                                  <div className="text-muted" style={{ fontSize: "9pt" }}>
                                    Sasia për Shumic
                                  </div>
                                  <div className="fw-semibold">
                                    {optionsSelected?.item?.sasiaShumices ?? 0}{" "}
                                    {optionsSelected?.item?.emriNjesiaMatese ??
                                      "Copë"}
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col sm={4}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div className="text-muted" style={{ fontSize: "9pt" }}>
                                    Blerje + TVSH
                                  </div>
                                  <div className="fw-semibold">
                                    {parseFloat(
                                      optionsSelected?.item?.qmimiBleres ?? 0,
                                    ).toFixed(2)}{" "}
                                    €
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col sm={4}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div className="text-muted" style={{ fontSize: "9pt" }}>
                                    Pakic + TVSH
                                  </div>
                                  <div className="fw-semibold">
                                    {parseFloat(
                                      optionsSelected?.item?.qmimiProduktit ??
                                        0,
                                    ).toFixed(2)}{" "}
                                    €
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col sm={4}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div className="text-muted" style={{ fontSize: "9pt" }}>
                                    Shumic + TVSH
                                  </div>
                                  <div className="fw-semibold">
                                    {parseFloat(
                                      optionsSelected?.item?.qmimiMeShumic ?? 0,
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
                  <Card className="shadow-sm h-100" style={{ position: "sticky", top: "1rem" }}>
                    <Card.Header className="fw-semibold">
                      Përmbledhje Flete
                    </Card.Header>
                    <Card.Body>
                      <Row className="g-2">
                        <Col sm={12}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Nr. Flete Lejimit
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures?.regjistrimet?.nrRendorFatures ??
                              "-"}
                          </div>
                        </Col>
                        <Col sm={12}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Partneri
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures?.regjistrimet?.emriBiznesit ?? "-"}
                          </div>
                        </Col>
                      </Row>

                      <hr />

                      <Row className="g-2">
                        <Col sm={6}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Produkte
                          </div>
                          <div className="fw-semibold">{totProdukteve}</div>
                        </Col>
                        <Col sm={6}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Sasia
                          </div>
                          <div className="fw-semibold">
                            {parseFloat(totStokut).toFixed(2)}
                          </div>
                        </Col>
                        <Col sm={12}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Totali
                          </div>
                          <div className="fw-bold">
                            {parseFloat(totFat).toFixed(2)} €
                          </div>
                        </Col>
                      </Row>

                      <div className="d-grid gap-2 mt-3">
                        <Button
                          variant="primary"
                          onClick={() => setKonfirmoMbylljenFatures(true)}>
                          Mbyll Fletën <FontAwesomeIcon icon={faPlus} />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Card className="shadow-sm mt-3">
                <Card.Header className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div className="fw-semibold">Tabela e Produkteve</div>
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg="dark">
                      {Array.isArray(produktetNeKalkulim)
                        ? produktetNeKalkulim.length
                        : 0}{" "}
                      rreshta
                    </Badge>
                    <Badge bg="success">
                      Totali: {parseFloat(totFat).toFixed(2)} €
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  {Array.isArray(produktetNeKalkulim) &&
                  produktetNeKalkulim.length === 0 ? (
                    <div className="text-muted">
                      Ende nuk ka produkte në fletën e lejimit. Shto një produkt nga forma
                      lart.
                    </div>
                  ) : (
                    <Tabela
                      data={produktetNeKalkulim}
                      tableName="Tabela e Produkteve"
                      kaButona={true}
                      funksionButonFshij={(e) => handleFshij(e)}
                      funksionButonEdit={(e) => {
                        handleEdit(e);
                        setIdTeDhenatKalk(e);
                      }}
                      mosShfaqKerkimin
                      mosShfaqID={true}
                      mosShfaqTitullin={true}
                      mosShfaqPaginimin={true}
                    />
                  )}
                </Card.Body>
              </Card>
            </Container>
          </>
        )}
        <BarcodeScannerModal 
        show={showScanner} 
        onHide={() => setShowScanner(false)} 
        onScan={handleScanResult} 
      />
      </div>
    </>
  );
}

export default RegjistroFaturen;
