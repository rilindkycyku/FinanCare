import { useEffect, useMemo, useState, useRef } from "react";
import "../../../../Pages/Styles/DizajniPergjithshem.css"; // Fixed import for plain CSS
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
  Card,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import { Camera } from "lucide-react";
import BarcodeScannerModal from "../../../TeTjera/BarcodeScannerModal";
import Tabela from "../../../TeTjera/Tabela/Tabela";
import PrintLabels from "../../../TeTjera/PrintLabels";
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
  const [produktiID, setproduktiID] = useState(0);
  const [produktet, setProduktet] = useState([]);
  const [sasia, setSasia] = useState("");
  const [qmimiBleres, setQmimiBleres] = useState("");
  const [qmimiShites, setQmimiShites] = useState("");
  const [qmimiShitesMeShumic, setQmimiShitesMeShumic] = useState("");
  const [njesiaMatese, setNjesiaMatese] = useState("Cope");
  const [sasiaNeStok, setSasiaNeStok] = useState(0);
  const [qmimiB, setQmimiB] = useState(0);
  const [qmimiSH, setQmimiSH] = useState(0);
  const [llojiTVSH, setLlojiTVSH] = useState(0);
  const [qmimiSH2, setQmimiSH2] = useState(0);

  const [idTeDhenatKalk, setIdTeDhenatKalk] = useState(0);

  const [edito, setEdito] = useState(false);
  const [konfirmoMbylljenFatures, setKonfirmoMbylljenFatures] = useState(false);
  const [konfirmoProduktin, setKonfirmoProduktin] = useState(false);

  const [teDhenat, setTeDhenat] = useState([]);
  const [teDhenatFatures, setTeDhenatFatures] = useState([]);

  const [siteName, setSiteName] = useState("FinanCare");
  const [produktetQmimore, setProduktetQmimore] = useState([]);

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
          setLoading(true);
          const perdoruesi = await axios.get(
            `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
            authentikimi,
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
          setLoading(true);
          const teDhenatKalkulimit = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${props.idKalkulimitEdit}`,
            authentikimi,
          );

          const teDhenatFatures = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.idKalkulimitEdit}`,
            authentikimi,
          );
          setproduktetNeKalkulim(
            teDhenatKalkulimit.data.map((k, index) => ({
              ID: k.id,
              "Nr. Rendor": index + 1,
              Barkodi: k.barkodi,
              "Emri Produktit": k.emriProduktit,
              Sasia: parseFloat(k.sasiaStokut).toFixed(2),
              "Qmimi Bleres + TVSH €": parseFloat(k.qmimiBleres).toFixed(2),
              "Qmimi Shites me Pakic + TVSH €": parseFloat(
                k.qmimiShites,
              ).toFixed(2),
              "Qmimi Shites me Shumic + TVSH €": parseFloat(
                k.qmimiShitesMeShumic,
              ).toFixed(2),
              "Totali Bleres €": parseFloat(
                k.sasiaStokut * k.qmimiBleres,
              ).toFixed(2),
              "Totali Shites €": parseFloat(
                k.sasiaStokut * k.qmimiShites,
              ).toFixed(2),
              "Mazha %": parseFloat(
                ((k.sasiaStokut *
                  k.qmimiShites *
                  (1 - k.llojiTVSH / 100 / (1 + k.llojiTVSH / 100)) -
                  k.sasiaStokut * k.qmimiBleres) /
                  (k.sasiaStokut * k.qmimiBleres)) *
                100,
              ).toFixed(2),
            })),
          );
          setProduktetQmimore(
            teDhenatKalkulimit.data.map((k, index) => ({
              name: k.emriProduktit,
              price: k.qmimiShites,
              wholesalePrice: k.qmimiShitesMeShumic,
              barcode: k.barkodi,
            })),
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
  }, [API_BASE_URL, authentikimi, perditeso, props.idKalkulimitEdit]);

  useEffect(() => {
    const perditesoFaturen = async () => {
      try {
        if (!props.idKalkulimitEdit || props.idKalkulimitEdit == 0) return;
        await axios
          .get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.idKalkulimitEdit}`,
            authentikimi,
          )
          .then(async (r) => {
            console.log(r.data);
            await axios.put(
              `${API_BASE_URL}/api/Faturat/perditesoFaturen?idKalulimit=${props.nrRendorKalkulimit}`,
              {
                dataRegjistrimit: r.data.regjistrimet.dataRegjistrimit,
                stafiID: r.data.regjistrimet.stafiID,
                totaliPaTVSH: r.data.regjistrimet.totaliPaTVSH,
                tvsh: r.data.regjistrimet.tvsh,
                idPartneri: r.data.regjistrimet.idPartneri,
                statusiPageses: r.data.regjistrimet.statusiPageses,
                llojiPageses: r.data.regjistrimet.llojiPageses,
                llojiKalkulimit: r.data.regjistrimet.llojiKalkulimit,
                nrFatures: r.data.regjistrimet.nrFatures,
                statusiKalkulimit: r.data.regjistrimet.statusiKalkulimit,
                pershkrimShtese:
                  "Tot - TVSH: " +
                  parseFloat(r.data.totaliPaTVSH).toFixed(2) +
                  "€, TVSH: " +
                  parseFloat(r.data.totaliMeTVSH - r.data.totaliPaTVSH).toFixed(2) +
                  "€, Tot Fat: " +
                  parseFloat(r.data.totaliMeTVSH).toFixed(2) +
                  "€",
                rabati: r.data.regjistrimet.rabati,
                nrRendorFatures: r.data.regjistrimet.nrRendorFatures,
                idBonusKartela: r.data.regjistrimet.idBonusKartela,
              },
              authentikimi,
            );
          });
      } catch (err) {
        console.log(err);
      }
    };

    perditesoFaturen();
  }, [
    API_BASE_URL,
    authentikimi,
    perditeso,
    props.idKalkulimitEdit,
    props.nrRendorKalkulimit,
  ]);

  const handleSubmit = async (event) => {
    const sasiaNum = Number(sasia);
    const qmimiBleresNum = Number(qmimiBleres);
    const qmimiShitesNum = Number(qmimiShites);
    const qmimiShitesMeShumicNum = Number(qmimiShitesMeShumic);

    if (
      !Number.isFinite(sasiaNum) ||
      !Number.isFinite(qmimiBleresNum) ||
      !Number.isFinite(qmimiShitesNum) ||
      !Number.isFinite(qmimiShitesMeShumicNum) ||
      sasiaNum <= 0 ||
      qmimiShitesNum <= 0 ||
      qmimiBleresNum <= 0
    ) {
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      await axios.post(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/teDhenat`,
        {
          idRegjistrimit: props.nrRendorKalkulimit,
          idProduktit: optionsSelected?.value,
          sasiaStokut: sasiaNum,
          qmimiBleres: qmimiBleresNum,
          qmimiShites: qmimiShitesNum,
          qmimiShitesMeShumic: qmimiShitesMeShumicNum,
        },
        authentikimi,
      );

      setproduktiID(0);
      setQmimiBleres("");
      setSasia("");
      setQmimiShites("");
      setQmimiShitesMeShumic("");
      setSasiaNeStok(0);
      setQmimiB(0);
      setQmimiSH(0);
      setQmimiSH2(0);
      setPerditeso(Date.now());
      setOptionsSelected(null);
      setTimeout(() => {
        document.getElementById("produktiSelect-input")?.focus();
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
          console.log(produkti);
          var prod = produktet.find(
            (item) => item.emriProduktit == produkti["Emri Produktit"],
          );

          console.log(produktet);

          await axios.put(
            `${API_BASE_URL}/api/Faturat/ruajKalkulimin/perditesoStokunQmimin?id=${prod?.produktiID}`,
            {
              qmimiBleres: produkti["Qmimi Bleres + TVSH €"],
              qmimiProduktit: produkti["Qmimi Shites me Pakic + TVSH €"],
              sasiaNeStok: produkti["Sasia"],
              qmimiMeShumic: produkti["Qmimi Shites me Shumic + TVSH €"],
            },
            authentikimi,
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
        authentikimi,
      )
      .then(async () => {
        setPerditeso(Date.now());
      });
  }

  async function handleEdit(id, index) {
    const produkti = await axios
      .get(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/getKalkulimi?idKalkulimit=${id}`,
        authentikimi,
      )
      .then((p) => {
        setPerditeso(Date.now());

        setEdito(true);
        setproduktiID(p.data[0].idProduktit);
        setEmriProduktit(p.data[0].emriProduktit);
        setSasia(p.data[0].sasiaStokut);
        setQmimiBleres(p.data[0].qmimiBleres);
        setQmimiShites(p.data[0].qmimiShites);
        setQmimiShitesMeShumic(p.data[0].qmimiShitesMeShumic);

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
    const sasiaNum = Number(sasia);
    const qmimiBleresNum = Number(qmimiBleres);
    const qmimiShitesNum = Number(qmimiShites);
    const qmimiShitesMeShumicNum = Number(qmimiShitesMeShumic);

    if (
      !Number.isFinite(sasiaNum) ||
      !Number.isFinite(qmimiBleresNum) ||
      !Number.isFinite(qmimiShitesNum) ||
      !Number.isFinite(qmimiShitesMeShumicNum) ||
      sasiaNum <= 0 ||
      qmimiShitesNum <= 0 ||
      qmimiBleresNum <= 0
    ) {
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      await axios
        .put(
          `${API_BASE_URL}/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${id}`,
          {
            qmimiBleres: qmimiBleresNum,
            qmimiShites: qmimiShitesNum,
            sasiaStokut: sasiaNum,
            qmimiShitesMeShumic: qmimiShitesMeShumicNum,
          },
          authentikimi,
        )
        .then(async () => {
          setPerditeso(Date.now());
        });

      setproduktiID(0);
      setQmimiBleres("");
      setSasia("");
      setQmimiShites("");
      setQmimiShitesMeShumic("");
      setSasiaNeStok(0);
      setQmimiB(0);
      setQmimiSH(0);
      setQmimiSH2(0);
      setOptionsSelected(null);
      setEdito(false);
    }
  }

  function KthehuTekFaturat() {
    props.setPerditeso();
    props.mbyllPerkohesisht();
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
      setLoadingProdukteve(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`,
          authentikimi,
        );
        if (!isMounted) return;
        setListaProdukteve(response.data);
        setProduktet(Array.isArray(response.data) ? response.data : (response.data.$values || []));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (isMounted) setLoadingProdukteve(false);
      }
    };

    vendosProduktet();

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL, authentikimi]);

  useEffect(() => {
    const rawData = Array.isArray(listaProdukteve) ? listaProdukteve : (listaProdukteve?.$values || []);
    const fetchedoptions = rawData.map((item) => ({
      value: item.produktiID,
      label:
        (item.emriProduktit || "") + " - " + (item.barkodi || "") + " - " + (item.kodiProduktit || ""),
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

  useEffect(() => {
    const vendosTeDhenatBiznesit = async () => {
      try {
        const teDhenat = await axios.get(
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`,
          authentikimi,
        );
        setSiteName(teDhenat?.data?.emriIBiznesit);
      } catch (err) {
        console.log(err);
      }
    };

    vendosTeDhenatBiznesit();
  }, [API_BASE_URL, authentikimi, perditeso]);

  const handleMenaxhoTastetPagesa = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!edito) {
        handleSubmit();
      } else {
        handleEdito(idTeDhenatKalk);
      }
    }
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

  const totaliPaTVSH = teDhenatFatures?.regjistrimet?.totaliPaTVSH ?? 0;
  const tvsh = teDhenatFatures?.regjistrimet?.tvsh ?? 0;
  const totaliFatures = useMemo(
    () => Number(totaliPaTVSH || 0) + Number(tvsh || 0),
    [totaliPaTVSH, tvsh],
  );

  const canSubmit = Boolean(
    !loadingProdukteve &&
    optionsSelected?.value &&
    Number(sasia) > 0 &&
    Number(qmimiBleres) > 0 &&
    Number(qmimiShites) > 0 &&
    Number(qmimiShitesMeShumic) > 0,
  );

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant", "1 Euro Menaxher"]}
        largo={() => props.largo()}
        shfaqmesazhin={() => props.shfaqmesazhin()}
        perditesoTeDhenat={() => props.perditesoTeDhenat()}
        setTipiMesazhit={(e) => props.setTipiMesazhit(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit(e)}
      />
      <div className="containerDashboardP">
        {" "}
        {/* Updated to plain class name */}
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
            onHide={() => setKonfirmoMbylljenFatures(false)}
            centered
            className="sp-modal">
            <Modal.Header closeButton>
              <Modal.Title>Konfirmo Mbylljen e Faturës</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center py-4">
              <div className="mb-3 text-warning">
                <FontAwesomeIcon icon={faPenToSquare} size="3x" />
              </div>
              <h5 className="text-white mb-2 fw-bold">A jeni të sigurt?</h5>
              <p className="text-white-50">
                Pasi të konfirmoni, të dhënat e faturës do të mbyllen dhe stoku do të përditësohet.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                className="btn-cancel px-4"
                onClick={() => setKonfirmoMbylljenFatures(false)}>
                Anulo
              </Button>
              <Button className="btn-save px-4" onClick={handleMbyllFature}>
                Konfirmo Mbylljen
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
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
              <div>
                <h1 className="title mb-1">Kalkulimi i Mallit</h1>
                <div className="text-white-50 small opacity-75">
                  Shtoni produktet, kontrolloni çmimet dhe mbyllni faturën kur të jeni gati.
                </div>
              </div>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <PrintLabels storeName={siteName} products={produktetQmimore} />
                <Button
                  className="btn-cancel px-3"
                  onClick={() => KthehuTekFaturat()}>
                  <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Kthehu mbrapa
                </Button>
              </div>
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

                        <Form.Group className="mb-2">
                          <Form.Label className="fw-semibold">Sasia</Form.Label>
                          <InputGroup>
                            <Form.Control
                              id="sasia"
                              type="number"
                              inputMode="decimal"
                              placeholder="0.00"
                              value={sasia}
                              onChange={(e) => setSasia(e.target.value)}
                              onKeyDown={(e) => ndrroField(e, "qmimiBleres")}
                            />
                            <InputGroup.Text>{njesiaMatese}</InputGroup.Text>
                          </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-2">
                          <Form.Label className="fw-semibold">
                            Qmimi Bleres + TVSH (€)
                          </Form.Label>
                          <InputGroup>
                            <Form.Control
                              id="qmimiBleres"
                              type="number"
                              inputMode="decimal"
                              value={qmimiBleres}
                              placeholder="0.00"
                              onChange={(e) => {
                                const raw = e.target.value;
                                setQmimiBleres(raw);
                                const qmimbleres = parseFloat(raw);
                                if (!Number.isFinite(qmimbleres)) return;
                                const tvshProdukti = Number(
                                  optionsSelected?.item?.llojiTVSH ?? 0,
                                );
                                const qmimishites =
                                  qmimbleres +
                                  qmimbleres * ((tvshProdukti + 8) / 100);
                                if (!Number.isNaN(qmimishites)) {
                                  setQmimiShites(qmimishites.toFixed(2));
                                  setQmimiShitesMeShumic(qmimishites.toFixed(2));
                                }
                              }}
                              onKeyDown={(e) => ndrroField(e, "qmimiShites")}
                            />
                            <InputGroup.Text>€</InputGroup.Text>
                          </InputGroup>
                        </Form.Group>

                        <Row className="g-2">
                          <Col md={6}>
                            <Form.Group className="mb-2">
                              <Form.Label className="fw-semibold">
                                Shitje Pakic + TVSH (€)
                              </Form.Label>
                              <InputGroup>
                                <Form.Control
                                  id="qmimiShites"
                                  type="number"
                                  inputMode="decimal"
                                  value={qmimiShites}
                                  placeholder="0.00"
                                  onChange={(e) =>
                                    setQmimiShites(e.target.value)
                                  }
                                  onKeyDown={(e) =>
                                    ndrroField(e, "qmimiShitesMeShumic")
                                  }
                                />
                                <InputGroup.Text>€</InputGroup.Text>
                              </InputGroup>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-2">
                              <Form.Label className="fw-semibold">
                                Shitje Shumic + TVSH (€)
                              </Form.Label>
                              <InputGroup>
                                <Form.Control
                                  id="qmimiShitesMeShumic"
                                  type="number"
                                  inputMode="decimal"
                                  value={qmimiShitesMeShumic}
                                  placeholder="0.00"
                                  onChange={(e) =>
                                    setQmimiShitesMeShumic(e.target.value)
                                  }
                                  onKeyDown={handleMenaxhoTastetPagesa}
                                />
                                <InputGroup.Text>€</InputGroup.Text>
                              </InputGroup>
                            </Form.Group>
                          </Col>
                        </Row>

                        <div className="d-flex gap-2 flex-wrap mt-3">
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
                          <div className="text-muted ms-auto" style={{ fontSize: "9pt" }}>
                            {loadingProdukteve ? "Duke ngarkuar produktet..." : "Enter: ruaj"}
                          </div>
                        </div>
                      </Form>
                    </Card.Body>
                    <Card.Footer className="text-muted" style={{ fontSize: "9pt" }}>
                      {edito
                        ? "Po editoni një rresht ekzistues në tabelë."
                        : "Shto rreshta në tabelë dhe më pas mbyll faturën."}
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
                                    TVSH
                                  </div>
                                  <div className="fw-semibold">
                                    {Number(
                                      optionsSelected?.item?.llojiTVSH ?? 0,
                                    ).toFixed(0)}
                                    %
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col sm={4}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div className="text-muted" style={{ fontSize: "9pt" }}>
                                    Blerje
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
                                    Pakic
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
                                    Shumic
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
                      Përmbledhje fature
                    </Card.Header>
                    <Card.Body>
                      <Row className="g-2">
                        <Col sm={6}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Nr. Kalkulimit
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures?.regjistrimet?.idRegjistrimit ??
                              "-"}
                          </div>
                        </Col>
                        <Col sm={6}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Nr. Fat
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures?.regjistrimet?.nrFatures ?? "-"}
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
                        <Col sm={4}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Pa TVSH
                          </div>
                          <div className="fw-semibold">
                            {parseFloat(totaliPaTVSH).toFixed(2)} €
                          </div>
                        </Col>
                        <Col sm={4}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            TVSH
                          </div>
                          <div className="fw-semibold">
                            {parseFloat(tvsh).toFixed(2)} €
                          </div>
                        </Col>
                        <Col sm={4}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Totali
                          </div>
                          <div className="fw-bold">
                            {parseFloat(totaliFatures).toFixed(2)} €
                          </div>
                        </Col>
                        <Col sm={12}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Totalet nga regjistrimi
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures?.regjistrimet?.pershkrimShtese ??
                              "-"}
                          </div>
                        </Col>
                      </Row>

                      <div className="d-grid gap-2 mt-3">
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
                  <div className="fw-semibold">Tabela e Produkteve te Fatures</div>
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg="dark">
                      {Array.isArray(produktetNeKalkulim)
                        ? produktetNeKalkulim.length
                        : 0}{" "}
                      rreshta
                    </Badge>
                    <Badge bg="success">
                      Totali: {parseFloat(totaliFatures).toFixed(2)} €
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  {Array.isArray(produktetNeKalkulim) &&
                    produktetNeKalkulim.length === 0 ? (
                    <div className="text-muted">
                      Ende nuk ka produkte në faturë. Shto një produkt nga forma
                      lart.
                    </div>
                  ) : (
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
                      mosShfaqID={true}
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
