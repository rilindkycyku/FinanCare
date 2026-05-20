import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSearch, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { Form, Col, Row, Button, Modal, Tabs, Tab } from "react-bootstrap";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function EditoKompanin(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [partneri, setPartneri] = useState([]);
  const [foto, setFoto] = useState(null);

  const [kontrolloPartnerin, setKontrolloPartnerin] = useState(false);
  const [konfirmoPartnerin, setKonfirmoPartnerin] = useState(false);
  const [fushatEZbrazura, setFushatEZbrazura] = useState(false);

  const [llojiPartnerit, setLlojiPartnerit] = useState("");
  const [rabati, setRabati] = useState(0);

  const [key, setKey] = useState("teDhenat");

  const [teDhenat, setTeDhenat] = useState([]);

  const [perditeso, setPerditeso] = useState(Date.now());

  const [showArbkModal, setShowArbkModal] = useState(false);
  const [arbkJson, setArbkJson] = useState("");
  const [arbkResults, setArbkResults] = useState([]);

  const getID = localStorage.getItem("id");
  const getToken = localStorage.getItem("token");

  const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

  const handleAutoParse = (payloadStr) => {
    console.log("Filloi parsingu automatik. Gjatësia e payload:", payloadStr?.length);
    try {
      const parsed = JSON.parse(payloadStr);
      const list = parsed?.tableSearch?.tableList || [];
      const realList = list.filter(item => item.teDhenatBiznesit && item.teDhenatBiznesit.StatusiARBK === "Regjistruar");

      console.log("U gjetën rekorde aktive:", realList.length);

      if (realList.length === 1) {
        const biz = realList[0].teDhenatBiznesit;
        setPartneri(prev => ({
          ...prev,
          emriBiznesit: biz.EmriBiznesit || prev.emriBiznesit,
          shkurtesaPartnerit: biz.EmriTregtar || biz.EmriBiznesit?.substring(0, 3)?.toUpperCase() || prev.shkurtesaPartnerit,
          nui: biz.NUI || prev.nui,
          nrf: biz.NumriFiskal || prev.nrf,
          adresa: `${biz.Adresa || ""}, ${biz.Komuna || ""}`.trim().replace(/^,|,$/g, "") || prev.adresa,
          nrKontaktit: biz.Telefoni || prev.nrKontaktit,
          email: biz.Email || prev.email,
        }));

        props.setTipiMesazhit("success");
        props.setPershkrimiMesazhit("Të dhënat u importuan automatikisht nga ARBK!");
        props.shfaqmesazhin(true);

        setShowArbkModal(false);
        setArbkJson("");
        setArbkResults([]);
      } else if (realList.length > 1) {
        setArbkResults(realList.map(item => item.teDhenatBiznesit));
      } else {
        console.warn("Nuk u gjet asnjë rekord në JSON!");
      }
    } catch (e) {
      console.error("Gabim në leximin automatik", e);
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "ARBK_BRIDGE_DATA") {
        if (event.data.payload) {
          setArbkJson(event.data.payload);
          setShowArbkModal(true);
          handleAutoParse(event.data.payload);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem("arbk_bridge_data");
    if (savedData) {
      setArbkJson(savedData);
      setShowArbkModal(true);
      handleAutoParse(savedData);
      localStorage.removeItem("arbk_bridge_data");
    }
  }, []);

  useEffect(() => {
    if (showArbkModal) {
      const savedData = localStorage.getItem("arbk_bridge_data");
      if (savedData) {
        setArbkJson(savedData);
        handleAutoParse(savedData);
        localStorage.removeItem("arbk_bridge_data");
      }
    }
  }, [showArbkModal]);

  useEffect(() => {
    const vendosTeDhenat = async () => {
      try {
        const perdoruesi = await axios.get(
          `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
          authentikimi
        );
        setTeDhenat(perdoruesi.data);
      } catch (err) {
        console.log(err);
      }
    };
    vendosTeDhenat();
  }, [perditeso]);

  useEffect(() => {
    const shfaqpartneret = async () => {
      try {
        const partneri = await axios.get(
          `${API_BASE_URL}/api/Partneri/shfaqPartnerinSipasIDs?id=${props.id}`,
          authentikimi
        );
        setPartneri(partneri.data);
        setLlojiPartnerit(partneri.data.llojiPartnerit);
        setRabati(partneri?.data?.kartela?.rabati ?? 0);
      } catch (err) {
        console.log(err);
      }
    };

    shfaqpartneret();
  }, []);

  const onChange = (e) => {
    setPartneri((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleLlojiPartneritChange = (event) => {
    setLlojiPartnerit(event.target.value);
  };
  const handleRabatiChange = (event) => {
    setRabati(event.target.value);
  };

  function isNullOrEmpty(value) {
    return (
      value === null ||
      value === "" ||
      value === undefined ||
      llojiPartnerit === 0
    );
  }

  async function handleSubmit() {
    try {
      await axios
        .put(
          `${API_BASE_URL}/api/Partneri/perditesoPartnerin?stafiID=${teDhenat.perdoruesi.userID}&id=${props.id}`,
          {
            emriBiznesit: partneri.emriBiznesit,
            nui: partneri.nui,
            nrf: partneri.nrf,
            tvsh: partneri.tvsh,
            email: partneri.email,
            adresa: partneri.adresa,
            nrKontaktit: partneri.nrKontaktit,
            llojiPartnerit: llojiPartnerit,
            shkurtesaPartnerit: partneri.shkurtesaPartnerit,
          },
          authentikimi
        )
        .then((x) => {
          props.setTipiMesazhit("success");
          props.setPershkrimiMesazhit("Partneri u Perditesua me sukses!");
          props.perditesoTeDhenat();
          props.largo();
          props.shfaqmesazhin();
        })
        .catch((error) => {
          console.error("Error saving partneri:", error);
          props.setTipiMesazhit("danger");
          props.setPershkrimiMesazhit(
            "Ndodhi nje gabim gjate perditesimit te partnerit!"
          );
          props.perditesoTeDhenat();
          props.shfaqmesazhin();
        });
    } catch (error) {
      console.error(error);
    }
  }

  const handleKontrolli = () => {
    if (
      isNullOrEmpty(partneri.emriBiznesit) ||
      isNullOrEmpty(partneri.shkurtesaPartnerit) ||
      isNullOrEmpty(partneri.nui) ||
      isNullOrEmpty(partneri.adresa) ||
      isNullOrEmpty(llojiPartnerit)
    ) {
      setFushatEZbrazura(true);
    } else {
      handleSubmit();
    }
  };

  async function PerditesoKartelen() {
    try {
      await axios
        .put(
          `${API_BASE_URL}/api/Kartelat/perditesoKartelen?id=${partneri?.kartela?.idKartela}`,
          {
            kodiKartela: partneri?.kartela?.kodiKartela,
            llojiKarteles: partneri?.kartela?.llojiKarteles,
            rabati: rabati,
            stafiID: partneri?.kartela?.stafiID,
            partneriID: partneri?.kartela?.partneriID,
          },
          authentikimi
        )
        .then((x) => {
          props.setTipiMesazhit("success");
          props.setPershkrimiMesazhit("Partneri u Perditesua me sukses!");
          props.perditesoTeDhenat();
          props.largo();
          props.shfaqmesazhin();
        })
        .catch((error) => {
          console.error("Error saving partneri:", error);
          props.setTipiMesazhit("danger");
          props.setPershkrimiMesazhit(
            "Ndodhi nje gabim gjate perditesimit te karteles!"
          );
          props.perditesoTeDhenat();
          props.shfaqmesazhin();
        });
    } catch (error) {
      console.error(error);
    }
  }

  const handleParseJSON = () => {
    try {
      if (!arbkJson) return;
      const parsed = JSON.parse(arbkJson);
      const list = parsed?.tableSearch?.tableList || [];
      const realList = list.filter(item => item.teDhenatBiznesit && item.teDhenatBiznesit.StatusiARBK === "Regjistruar");

      if (realList.length === 0) {
        throw new Error("Nuk u gjet asnjë biznes aktiv i regjistruar në këtë JSON.");
      } else if (realList.length === 1) {
        applyArbkData(realList[0].teDhenatBiznesit);
      } else {
        setArbkResults(realList.map(item => item.teDhenatBiznesit));
      }
    } catch (err) {
      props.setTipiMesazhit("danger");
      props.setPershkrimiMesazhit("Gabim gjatë leximit: " + err.message);
      props.shfaqmesazhin(true);
    }
  };

  const applyArbkData = (biz) => {
    if (!biz) return;
    setPartneri(prev => ({
      ...prev,
      emriBiznesit: biz.EmriBiznesit || prev.emriBiznesit,
      shkurtesaPartnerit: biz.EmriTregtar || biz.EmriBiznesit?.substring(0, 3)?.toUpperCase() || prev.shkurtesaPartnerit,
      nui: biz.NUI || prev.nui,
      nrf: biz.NumriFiskal || prev.nrf,
      adresa: `${biz.Adresa || ""}, ${biz.Komuna || ""}`.trim().replace(/^,|,$/g, "") || prev.adresa,
      nrKontaktit: biz.Telefoni || prev.nrKontaktit,
      email: biz.Email || prev.email,
    }));

    props.setTipiMesazhit("success");
    props.setPershkrimiMesazhit("Të dhënat u importuan me sukses nga ARBK!");
    props.shfaqmesazhin(true);

    setShowArbkModal(false);
    setArbkJson("");
    setArbkResults([]);
  };

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
      {fushatEZbrazura && (
        <Modal
          size="sm"
          show={fushatEZbrazura}
          onHide={() => setFushatEZbrazura(false)}>
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "red" }} as="h6">
              Ndodhi nje gabim
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <strong style={{ fontSize: "10pt" }}>
              Ju lutemi plotesoni te gjitha fushat me{" "}
              <span style={{ color: "red" }}>*</span>
            </strong>
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="sm"
              onClick={() => setFushatEZbrazura(false)}
              variant="secondary">
              Mbylle <FontAwesomeIcon icon={faXmark} />
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      <Modal
        size="lg"
        show={true}
        onHide={() => props.largo()}
        className="sp-modal">
        <Modal.Header closeButton>
          <div className="d-flex align-items-center w-100 justify-content-between">
            <Modal.Title>Edito Partnerin</Modal.Title>
            <Button variant="outline-info" size="sm" onClick={() => setShowArbkModal(true)} className="rounded-pill px-3 me-3 fw-bold d-flex align-items-center">
              <FontAwesomeIcon icon={faSearch} className="me-2" />
              Importo nga ARBK (JSON)
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            id="editoPartnerin"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="sp-tabs mb-4">
            <Tab eventKey="teDhenat" title="Të Dhënat e Partnerit">
              <div className="sp-form-container p-2">
                <Form>
                  <Row className="g-4 mb-3">
                    <Col md="8">
                      <div className="sp-input-group">
                        <label className="sp-label">Emri i Biznesit / Klientit <span className="text-danger">*</span></label>
                        <Form.Control
                          type="text"
                          name="emriBiznesit"
                          value={partneri.emriBiznesit ?? ""}
                          onChange={onChange}
                          className="sp-input"
                          placeholder="Emri i plotë..."
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Shkurtesa <span className="text-danger">*</span></label>
                        <Form.Control
                          type="text"
                          name="shkurtesaPartnerit"
                          value={partneri.shkurtesaPartnerit ?? ""}
                          onChange={onChange}
                          className="sp-input"
                          placeholder="FC"
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row className="g-4 mb-3">
                    <Col md="4">
                      <div className="sp-input-group">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label className="sp-label mb-0">NUI <span className="text-danger">*</span></label>
                          <a href="https://arbk.rks-gov.net/" target="_blank" rel="noreferrer" className="text-emerald small text-decoration-none fw-bold" title="Kërko në ARBK">
                            <FontAwesomeIcon icon={faSearch} className="me-1" /> ARBK
                          </a>
                        </div>
                        <Form.Control
                          type="number"
                          name="nui"
                          value={partneri.nui ?? ""}
                          onChange={onChange}
                          className="sp-input"
                          placeholder="111222333"
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Nr. Fiskal (NF)</label>
                        <Form.Control
                          type="number"
                          name="nrf"
                          value={partneri.nrf ?? ""}
                          onChange={onChange}
                          className="sp-input"
                          placeholder="Optional..."
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Nr. TVSH</label>
                        <Form.Control
                          type="number"
                          name="tvsh"
                          value={partneri.tvsh ?? ""}
                          onChange={onChange}
                          className="sp-input"
                          placeholder="Optional..."
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row className="g-4 mb-3">
                    <Col md="12">
                      <div className="sp-input-group">
                        <label className="sp-label">Adresa <span className="text-danger">*</span></label>
                        <Form.Control
                          type="text"
                          name="adresa"
                          value={partneri.adresa ?? ""}
                          onChange={onChange}
                          className="sp-input"
                          placeholder="Adresa e plotë..."
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row className="g-4">
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Kontakt</label>
                        <Form.Control
                          type="text"
                          name="nrKontaktit"
                          value={partneri.nrKontaktit ?? ""}
                          onChange={onChange}
                          className="sp-input"
                          placeholder="+383..."
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Email</label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={partneri.email ?? ""}
                          onChange={onChange}
                          className="sp-input"
                          placeholder="email@example.com"
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Lloji i Partnerit <span className="text-danger">*</span></label>
                        <div className="sp-select-container">
                          <Form.Select
                            value={llojiPartnerit}
                            onChange={handleLlojiPartneritChange}
                            className="sp-input">
                            <option hidden disabled value={0}>
                              Zgjedhni Llojin
                            </option>
                            <option value="B">Blerës</option>
                            <option value="F">Furnitorë</option>
                            <option value="B/F">Blerës & Furnitorë</option>
                          </Form.Select>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Tab>
            <Tab eventKey="kartelaRabati" title="Kartela & Rabati">
              <div className="sp-form-container p-2">
                <Row className="g-4">
                  <Col md="6">
                    <div className="sp-input-group">
                      <label className="sp-label">Kodi i Kartelës</label>
                      <Form.Control
                        type="text"
                        value={partneri?.kartela?.kodiKartela ?? ""}
                        disabled
                        className="sp-input"
                        style={{ opacity: 0.6 }}
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="sp-input-group">
                      <label className="sp-label">Rabati (%)</label>
                      <Form.Control
                        type="number"
                        name="rabati"
                        value={rabati}
                        onChange={handleRabatiChange}
                        className="sp-input"
                        placeholder="0"
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-cancel" onClick={() => props.largo()}>
            Anulo
          </Button>
          <Button
            className="btn-save px-4"
            onClick={(e) =>
              key == "teDhenat" ? handleKontrolli() : PerditesoKartelen()
            }>
            Përditëso Partnerin
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ARBK Import Modal */}
      <Modal show={showArbkModal} onHide={() => { setShowArbkModal(false); setArbkResults([]); setArbkJson(""); }} centered className="sp-modal">
        <Modal.Header closeButton>
          <Modal.Title as="h6">Importo nga ARBK</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {arbkResults.length === 0 ? (
            <>
              <div className="alert alert-info py-2 small mb-3">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                <strong>Këshillë:</strong> Për rezultate më të pakta e të sakta, kërkoni në ARBK përmes <strong>NUI</strong> në vend të emrit.
              </div>
              <p className="text-white-50 small mb-2">Ngjisni këtu objektin JSON që keni kopjuar nga <code>localStorage.getItem("state")</code> në faqen e ARBK-së.</p>
              <Form.Control
                as="textarea"
                rows={6}
                className="sp-input"
                placeholder='{"version":2,"locale":"sq",...}'
                value={arbkJson}
                onChange={(e) => setArbkJson(e.target.value)}
              />
            </>
          ) : (
            <>
              <p className="text-white small mb-3">U gjetën <strong>{arbkResults.length}</strong> biznese. Zgjidhni njërin prej tyre:</p>
              <div className="list-group" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {arbkResults.map((biz, idx) => (
                  <button key={idx} type="button" className="list-group-item list-group-item-action bg-dark text-white border-secondary mb-2 rounded" onClick={() => applyArbkData(biz)}>
                    <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                      <h6 className="mb-0 text-info" style={{ fontSize: '0.95rem' }}>{biz.EmriBiznesit}</h6>
                      <span className="badge bg-secondary ms-2">{biz.StatusiARBK}</span>
                    </div>
                    <div className="small text-muted mb-1">
                      <strong className="text-light">NUI:</strong> {biz.NUI || "-"} &nbsp;|&nbsp; <strong className="text-light">Lloji:</strong> {biz.LlojiBiznesit}
                    </div>
                    <div className="small text-muted">
                      <strong className="text-light">Adresa:</strong> {biz.Adresa}, {biz.Komuna}
                    </div>
                  </button>
                ))}
              </div>
              <Button variant="outline-secondary" size="sm" className="mt-3 w-100" onClick={() => { setArbkResults([]); setArbkJson(""); }}>
                Pastro dhe kthehu mbrapa
              </Button>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowArbkModal(false); setArbkResults([]); setArbkJson(""); }}>Anulo</Button>
          {arbkResults.length === 0 && <Button variant="success" onClick={handleParseJSON} disabled={!arbkJson}>Analizo JSON</Button>}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditoKompanin;
