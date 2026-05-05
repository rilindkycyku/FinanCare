import NavBar from "../../../Components/TeTjera/layout/NavBar";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { TailSpin } from "react-loader-spinner";
import "../../Styles/PremiumTheme.css";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  Alert,
  Card,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import Select from "react-select";
import CalculatorModal from "../../../Components/TeTjera/CalculatorModal";
import Titulli from "../../../Components/TeTjera/Titulli";

function BarazimiArkes() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  const getID = localStorage.getItem("id");
  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: { Authorization: `Bearer ${getToken}` },
  };

  const [teDhenat, setTeDhenat] = useState({});
  const [arkataret, setArkataret] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    idArkatari: null,
    fillimiArkes: "",
    teShtuaraNeArke: "",
    cash: "",
    monedha: "",
    borxhe: "",
    banka: "",
    pagesFatura: "",
    tjera: "",
    pershkrimiTjera: "",
  });

  const [selectedOption, setSelectedOption] = useState(null);

  // Calculator Modal State
  const [calculatorField, setCalculatorField] = useState(null);
  const [calculatorValue, setCalculatorValue] = useState("");
  const [calculatorError, setCalculatorError] = useState("");

  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");

  // Refs for inputs
  const selectRef = useRef(null);
  const fillimiRef = useRef(null);
  const teShtuaraRef = useRef(null);
  const cashRef = useRef(null);
  const monedhaRef = useRef(null);
  const borxheRef = useRef(null);
  const bankaRef = useRef(null);
  const pagesFaturaRef = useRef(null);
  const tjeraRef = useRef(null);
  const pershkrimiRef = useRef(null);
  const submitRef = useRef(null);

  // Refs for calculator buttons (to restore focus)
  const calcButtonRefs = {
    fillimiArkes: useRef(null),
    teShtuaraNeArke: useRef(null),
    cash: useRef(null),
    monedha: useRef(null),
    borxhe: useRef(null),
    banka: useRef(null),
    pagesFatura: useRef(null),
    tjera: useRef(null),
  };

  useEffect(() => {
    if (getID && getToken) {
      const fetchPerdoruesi = async () => {
        try {
          setLoadingUser(true);
          const response = await axios.get(
            `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
            authentikimi
          );
          setTeDhenat(response.data);
        } catch (err) {
          setError("Gabim gjatë ngarkimit të përdoruesit.");
          if (err.response?.status === 401) navigate("/login");
        } finally {
          setLoadingUser(false);
        }
      };
      fetchPerdoruesi();
    } else {
      navigate("/login");
    }
  }, [getID, getToken, API_BASE_URL, navigate]);

  useEffect(() => {
    if (!loadingUser && teDhenat.perdoruesi) {
      axios
        .get(
          `${API_BASE_URL}/api/BarazoArken/shfaqArkataretPerSot`,
          authentikimi
        )
        .then((res) => {
          setArkataret(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError("Gabim gjatë marrjes së arkëtarëve.");
          setLoading(false);
        });
    }
  }, [loadingUser, teDhenat, API_BASE_URL, authentikimi]);

  const arkatarOptions = arkataret.map((a) => ({
    value: a.stafiID,
    label: `${a.emri} ${a.mbiemri} (${a.username})`,
  }));

  const idPersoniPergjegjes = teDhenat?.perdoruesi?.userID || null;

  const handleKeyDown = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };

  const parseAmount = (value) => {
    if (value === "" || value === null) return 0;
    const cleaned = value.toString().replace(/,/g, ".");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Calculator handlers
  const openCalculator = (field) => {
    setCalculatorField(field);
    setCalculatorValue(form[field] || "");
    setCalculatorError("");
  };

  const applyCalculatorValue = () => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(calculatorValue.replace(/,/g, "."));
      if (typeof result === "number" && !isNaN(result)) {
        const formatted = result.toFixed(2).replace(".", ",");
        setForm({ ...form, [calculatorField]: formatted });
        closeCalculator();
      } else {
        setCalculatorError("Rezultati nuk është numër valid!");
      }
    } catch {
      setCalculatorError("Shprehje e pavlefshme!");
    }
  };

  const closeCalculator = () => {
    setCalculatorField(null);
    setCalculatorValue("");
    setCalculatorError("");
    if (calculatorField && calcButtonRefs[calculatorField].current) {
      calcButtonRefs[calculatorField].current.focus();
    }
  };

  const handleCalculatorInputChange = (e) => {
    setCalculatorValue(e.target.value);
    setCalculatorError("");
  };

  const handleCalculatorKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyCalculatorValue();
    } else if (e.key === "Escape") {
      closeCalculator();
    }
  };

  const handleSubmit = async () => {
    if (!form.idArkatari) return alert("Zgjidhni arkëtarin!");
    if (parseAmount(form.tjera) > 0 && !form.pershkrimiTjera.trim())
      return alert("Plotësoni përshkrimin për 'Tjera'!");

    const selectedArkatar = arkataret.find(
      (a) => a.stafiID === form.idArkatari
    );
    if (!selectedArkatar) return;

    const income =
      selectedArkatar.totaliShitjeve +
      parseAmount(form.fillimiArkes) +
      parseAmount(form.teShtuaraNeArke);
    const outcome =
      parseAmount(form.cash) +
      parseAmount(form.monedha) +
      parseAmount(form.borxhe) +
      parseAmount(form.banka) +
      parseAmount(form.pagesFatura) +
      parseAmount(form.tjera);
    const difference = outcome - income;

    const payload = {
      IDBarazoArken: 0,
      IDArkatari: form.idArkatari,
      TotaliShitjeve: selectedArkatar.totaliShitjeve,
      FillimiArkes: parseAmount(form.fillimiArkes),
      TeShtuaraNeArke: parseAmount(form.teShtuaraNeArke),
      Cash: parseAmount(form.cash),
      Monedha: parseAmount(form.monedha),
      Borxhe: parseAmount(form.borxhe),
      Banka: parseAmount(form.banka),
      PagesFatura: parseAmount(form.pagesFatura),
      Tjera: parseAmount(form.tjera),
      PershkrimiTjera:
        parseAmount(form.tjera) > 0 ? form.pershkrimiTjera : null,
      KohaBarazimit: new Date().toISOString(),
      IDPersoniPergjegjes: idPersoniPergjegjes,
    };

    try {
      await axios.post(
        `${API_BASE_URL}/api/BarazoArken/shtoBarazimin`,
        payload,
        authentikimi
      );

      setTipiMesazhit("success");
      setPershkrimiMesazhit(
        `Barazimi u regjistrua me sukses! Dallimi: ${difference.toFixed(2)} €`
      );
      setShfaqMesazhin(true);

      // Reset form
      setForm({
        idArkatari: null,
        fillimiArkes: "",
        teShtuaraNeArke: "",
        cash: "",
        monedha: "",
        borxhe: "",
        banka: "",
        pagesFatura: "",
        tjera: "",
        pershkrimiTjera: "",
      });
      setSelectedOption(null);
      selectRef.current?.focus();
    } catch {
      setTipiMesazhit("danger");
      setPershkrimiMesazhit("Gabim gjatë ruajtjes së barazimit!");
      setShfaqMesazhin(true);
    }
  };

  if (loadingUser || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <TailSpin height="100" width="100" color="#10b981" />
      </div>
    );
  }

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Arkatar"]} />
      <NavBar />
      <Titulli titulli={"Barazo Arken"} />

      <div className="containerDashboardP py-2">
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}
        {error && (
          <Alert variant="danger" className="m-4">
            {error}
          </Alert>
        )}
        <div className="text-center mb-3">
          <h1 className="h2 fw-bold text-dark mb-2">Barazimi i Arkës</h1>
          <p className="text-muted small">
            {(() => {
              const days = ["E diel", "E hënë", "E martë", "E mërkurë", "E enjte", "E premte", "E shtunë"];
              const months = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"];
              const d = new Date();
              return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
            })()}
          </p>
        </div>

        <Card className="sp-card mx-auto" style={{ maxWidth: "1400px" }}>
          <div className="sp-card-header text-center">
            <h3>Regjistrimi i Barazimit të Arkës</h3>
          </div>

          <Card.Body className="px-xl-5 py-xl-3 p-3">
            <Form>
              <Row className="mb-3">
                <Col>
                  <Form.Label className="sp-label">Zgjidh Arkëtarin</Form.Label>
                  <Select
                    ref={selectRef}
                    className="sp-select"
                    classNamePrefix="sp-select"
                    options={arkatarOptions}
                    value={selectedOption}
                    onChange={(option) => {
                      setSelectedOption(option);
                      setForm({
                        ...form,
                        idArkatari: option ? option.value : null,
                      });
                      fillimiRef.current?.focus();
                    }}
                    placeholder="Kërko arkëtarin..."
                    isClearable
                    isSearchable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        fillimiRef.current?.focus();
                      }
                    }}
                  />
                </Col>
              </Row>

              <Row className="g-4">
                <Col lg={6}>
                  <div className="sp-order-box green h-100">
                    <div className="box-label mb-2 small">HYRJE (PARA NE ARKE)</div>
                    <div className="d-grid gap-2">
                      <Form.Group>
                        <Form.Label className="sp-label small mb-1">Fillimi i Arkës</Form.Label>
                        <InputGroup className="premium-input-group">
                          <Form.Control
                            ref={fillimiRef}
                            className="sp-input text-end fw-bold"
                            type="text"
                            inputMode="decimal"
                            value={form.fillimiArkes}
                            onChange={(e) => setForm({ ...form, fillimiArkes: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, teShtuaraRef)}
                            placeholder="0.00"
                          />
                          <InputGroup.Text className="bg-transparent border-0 text-success fw-bold">€</InputGroup.Text>
                          <Button
                            ref={calcButtonRefs.fillimiArkes}
                            variant="link"
                            className="text-success p-0 ms-1"
                            onClick={() => openCalculator("fillimiArkes")}>
                            <span style={{ fontSize: '1rem' }}>ðŸ§®</span>
                          </Button>
                        </InputGroup>
                      </Form.Group>

                      <Form.Group>
                        <Form.Label className="sp-label small mb-1">Të Shtuara në Arkë</Form.Label>
                        <InputGroup className="premium-input-group">
                          <Form.Control
                            ref={teShtuaraRef}
                            className="sp-input text-end fw-bold"
                            type="text"
                            inputMode="decimal"
                            value={form.teShtuaraNeArke}
                            onChange={(e) => setForm({ ...form, teShtuaraNeArke: e.target.value })}
                            onKeyDown={(e) => handleKeyDown(e, cashRef)}
                            placeholder="0.00"
                          />
                          <InputGroup.Text className="bg-transparent border-0 text-success fw-bold">€</InputGroup.Text>
                          <Button
                            ref={calcButtonRefs.teShtuaraNeArke}
                            variant="link"
                            className="text-success p-0 ms-1"
                            onClick={() => openCalculator("teShtuaraNeArke")}>
                            <span style={{ fontSize: '1rem' }}>ðŸ§®</span>
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </div>
                  </div>
                </Col>

                <Col lg={6}>
                  <div className="sp-order-box blue h-100">
                    <div className="box-label mb-2 small">DALJE (NUMERIMI ATY PER ATY)</div>
                    <div className="d-grid gap-2">
                      {[
                        { field: "cash", label: "Cash (kartëmonedha)" },
                        { field: "monedha", label: "Monedha (fizike)" },
                        { field: "borxhe", label: "Borxhe" },
                        { field: "banka", label: "Banka (POS)" },
                        { field: "pagesFatura", label: "Paguar Fatura" },
                        { field: "tjera", label: "Tjera" },
                      ].map((item, idx) => {
                        const refs = [cashRef, monedhaRef, borxheRef, bankaRef, pagesFaturaRef, tjeraRef];
                        const nextRef = idx < 5 ? refs[idx + 1] : parseAmount(form.tjera) > 0 ? pershkrimiRef : submitRef;

                        return (
                          <Form.Group key={item.field}>
                            <Form.Label className="sp-label small mb-1">{item.label}</Form.Label>
                            <InputGroup className="premium-input-group">
                              <Form.Control
                                ref={refs[idx]}
                                className="sp-input text-end fw-bold"
                                type="text"
                                inputMode="decimal"
                                value={form[item.field]}
                                onChange={(e) => setForm({ ...form, [item.field]: e.target.value })}
                                onKeyDown={(e) => handleKeyDown(e, nextRef)}
                                placeholder="0.00"
                              />
                              <InputGroup.Text className="bg-transparent border-0 text-info fw-bold">€</InputGroup.Text>
                              <Button
                                ref={calcButtonRefs[item.field]}
                                variant="link"
                                className="text-info p-0 ms-1"
                                onClick={() => openCalculator(item.field)}>
                                <span style={{ fontSize: '1rem' }}>ðŸ§®</span>
                              </Button>
                            </InputGroup>
                          </Form.Group>
                        );
                      })}
                    </div>
                  </div>
                </Col>
              </Row>

              {parseAmount(form.tjera) > 0 && (
                <Row className="mt-3">
                  <Col>
                    <Form.Label className="sp-label text-danger small">Përshkrimi për "Tjera"</Form.Label>
                    <Form.Control
                      ref={pershkrimiRef}
                      className="sp-input"
                      as="textarea"
                      rows={2}
                      value={form.pershkrimiTjera}
                      onChange={(e) => setForm({ ...form, pershkrimiTjera: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, submitRef)}
                      placeholder="Specifikoni arsyen e shpenzimeve të tjera..."
                    />
                  </Col>
                </Row>
              )}

              <div className="text-center mt-3">
                <Button
                  ref={submitRef}
                  className="btn-save px-5 py-3 fs-5"
                  disabled={error}
                  onClick={handleSubmit}
                  style={{ minWidth: '300px' }}>
                  Përfundo dhe Ruaj Barazimin
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <CalculatorModal
          show={!!calculatorField}
          calculatorValue={calculatorValue}
          calculatorError={calculatorError}
          onApply={applyCalculatorValue}
          onClose={closeCalculator}
          onInputChange={handleCalculatorInputChange}
          onKeyDown={handleCalculatorKeyDown}
        />
      </div>
    </>
  );
}

export default BarazimiArkes;
