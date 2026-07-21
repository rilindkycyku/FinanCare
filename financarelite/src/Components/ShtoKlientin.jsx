import { useEffect, useState } from "react";
import { Modal, Button, Tab, Tabs, Form, Row, Col, Alert } from "react-bootstrap";
import { Search, Info } from "lucide-react";
import { put, makeId, STORES } from "../lib/db";

const BLANK = {
  llojiPartnerit: "privat",
  emri: "",
  mbiemri: "",
  emriBiznesit: "",
  shkurtesaPartnerit: "",
  nui: "",
  nrf: "",
  tvsh: "",
  adresa: "",
  nrKontaktit: "",
  email: "",
};

/** Parses the exact ARBK bridge payload shape the FinanCare-ARBK-Extension sends. */
function parseArbkPayload(payloadStr) {
  const parsed = JSON.parse(payloadStr);
  const list = parsed?.tableSearch?.tableList || [];
  return list
    .filter((item) => item.teDhenatBiznesit && item.teDhenatBiznesit.StatusiARBK === "Regjistruar")
    .map((item) => item.teDhenatBiznesit);
}

function ShtoKlientin({ show, onHide, onSaved, initial }) {
  const [klienti, setKlienti] = useState(BLANK);
  const [key, setKey] = useState("privat");

  const [showArbkModal, setShowArbkModal] = useState(false);
  const [arbkJson, setArbkJson] = useState("");
  const [arbkResults, setArbkResults] = useState([]);
  const [arbkError, setArbkError] = useState("");

  useEffect(() => {
    if (show) {
      setKlienti(initial || BLANK);
      setKey(initial?.llojiPartnerit || "privat");
    }
  }, [show, initial]);

  const applyArbkData = (biz) => {
    setKlienti((prev) => ({
      ...prev,
      llojiPartnerit: "biznes",
      emriBiznesit: biz.EmriBiznesit || "",
      shkurtesaPartnerit: biz.EmriTregtar || biz.EmriBiznesit?.substring(0, 3)?.toUpperCase() || "",
      nui: biz.NUI || "",
      nrf: biz.NumriFiskal || "",
      adresa: `${biz.Adresa || ""}, ${biz.Komuna || ""}`.trim().replace(/^,|,$/g, ""),
      nrKontaktit: biz.Telefoni || "",
      email: biz.Email || "",
    }));
    setKey("biznes");
    setShowArbkModal(false);
    setArbkJson("");
    setArbkResults([]);
    setArbkError("");
  };

  const handleAutoParse = (payloadStr) => {
    try {
      const realList = parseArbkPayload(payloadStr);
      if (realList.length === 1) {
        applyArbkData(realList[0]);
      } else if (realList.length > 1) {
        setArbkResults(realList);
        setShowArbkModal(true);
      }
    } catch (e) {
      console.error("Gabim në leximin automatik nga ARBK", e);
    }
  };

  // Bridge contract from FinanCare-ARBK-Extension: listens for a postMessage while the tab is
  // open, and for a one-shot localStorage flag set right before the extension focuses this tab.
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "ARBK_BRIDGE_DATA" && event.data.payload) {
        setArbkJson(event.data.payload);
        handleAutoParse(event.data.payload);
      }
    };
    window.addEventListener("message", handleMessage);

    const savedData = localStorage.getItem("arbk_bridge_data");
    if (savedData) {
      setArbkJson(savedData);
      handleAutoParse(savedData);
      localStorage.removeItem("arbk_bridge_data");
    }

    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleParseJSON = () => {
    try {
      if (!arbkJson) return;
      const realList = parseArbkPayload(arbkJson);
      if (realList.length === 0) {
        throw new Error("Nuk u gjet asnjë biznes aktiv i regjistruar në këtë JSON.");
      } else if (realList.length === 1) {
        applyArbkData(realList[0]);
      } else {
        setArbkResults(realList);
      }
      setArbkError("");
    } catch (err) {
      setArbkError("Gabim gjatë leximit: " + err.message);
    }
  };

  const onChange = (e) => setKlienti({ ...klienti, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    const isPrivat = key === "privat";
    const record = {
      id: klienti.id || makeId("client"),
      llojiPartnerit: key,
      emriBiznesit: isPrivat ? `${klienti.emri || ""} ${klienti.mbiemri || ""}`.trim() : klienti.emriBiznesit,
      shkurtesaPartnerit: isPrivat
        ? `${(klienti.emri || "?")[0]}${(klienti.mbiemri || "?")[0]}`.toUpperCase()
        : klienti.shkurtesaPartnerit,
      emri: klienti.emri,
      mbiemri: klienti.mbiemri,
      nui: isPrivat ? "" : klienti.nui,
      nrf: isPrivat ? "" : klienti.nrf,
      tvsh: isPrivat ? "" : klienti.tvsh,
      adresa: klienti.adresa,
      nrKontaktit: klienti.nrKontaktit,
      email: klienti.email,
    };
    await put(STORES.clients, record);
    onSaved(record);
  };

  return (
    <>
      <Modal size="lg" show={show} onHide={onHide} className="sp-modal">
        <Modal.Header closeButton>
          <div className="d-flex align-items-center w-100 justify-content-between">
            <Modal.Title>{initial ? "Ndrysho Klientin" : "Shto Klientin e Ri"}</Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body>
          <Tabs id="klienti-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="mb-4">
            <Tab eventKey="privat" title="Klient Privat">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Emri</Form.Label>
                  <Form.Control name="emri" value={klienti.emri || ""} onChange={onChange} autoFocus />
                </Col>
                <Col md={6}>
                  <Form.Label>Mbiemri</Form.Label>
                  <Form.Control name="mbiemri" value={klienti.mbiemri || ""} onChange={onChange} />
                </Col>
                <Col md={12}>
                  <Form.Label>Adresa</Form.Label>
                  <Form.Control name="adresa" value={klienti.adresa || ""} onChange={onChange} />
                </Col>
                <Col md={6}>
                  <Form.Label>Nr. Kontaktit</Form.Label>
                  <Form.Control name="nrKontaktit" value={klienti.nrKontaktit || ""} onChange={onChange} />
                </Col>
                <Col md={6}>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={klienti.email || ""} onChange={onChange} />
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="biznes" title="Klient Biznesor">
              <Row className="g-3">
                <Col md={8}>
                  <Form.Label>Emri i Biznesit</Form.Label>
                  <Form.Control name="emriBiznesit" value={klienti.emriBiznesit || ""} onChange={onChange} />
                </Col>
                <Col md={4}>
                  <Form.Label>Shkurtesa</Form.Label>
                  <Form.Control name="shkurtesaPartnerit" value={klienti.shkurtesaPartnerit || ""} onChange={onChange} />
                </Col>
                <Col md={4}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <Form.Label className="mb-0">NUI</Form.Label>
                    <a href="https://arbk.rks-gov.net/" target="_blank" rel="noreferrer" className="small fw-bold text-decoration-none">
                      <Search size={12} className="me-1" /> ARBK
                    </a>
                  </div>
                  <Form.Control name="nui" value={klienti.nui || ""} onChange={onChange} />
                </Col>
                <Col md={4}>
                  <Form.Label>Nr. Fiskal (NF)</Form.Label>
                  <Form.Control name="nrf" value={klienti.nrf || ""} onChange={onChange} />
                </Col>
                <Col md={4}>
                  <Form.Label>Nr. TVSH</Form.Label>
                  <Form.Control name="tvsh" value={klienti.tvsh || ""} onChange={onChange} />
                </Col>
                <Col md={12}>
                  <Form.Label>Adresa</Form.Label>
                  <Form.Control name="adresa" value={klienti.adresa || ""} onChange={onChange} />
                </Col>
                <Col md={6}>
                  <Form.Label>Nr. Kontaktit</Form.Label>
                  <Form.Control name="nrKontaktit" value={klienti.nrKontaktit || ""} onChange={onChange} />
                </Col>
                <Col md={6}>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={klienti.email || ""} onChange={onChange} />
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Anulo
          </Button>
          <Button className="btn-primary" onClick={handleSave}>
            Ruaj Klientin
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showArbkModal}
        onHide={() => {
          setShowArbkModal(false);
          setArbkResults([]);
          setArbkJson("");
          setArbkError("");
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title as="h6">Importo nga ARBK</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {arbkResults.length === 0 ? (
            <>
              <Alert variant="info" className="py-2 small mb-3">
                <Info size={14} className="me-2" />
                Instaloni shtesën <strong>FinanCare ARBK Bridge</strong> për import automatik me një klikim, ose ngjisni
                më poshtë <code>localStorage.getItem("state")</code> nga faqja e ARBK-së.
              </Alert>
              {arbkError && (
                <Alert variant="danger" className="py-2 small">
                  {arbkError}
                </Alert>
              )}
              <Form.Control
                as="textarea"
                rows={6}
                placeholder='{"version":2,"locale":"sq",...}'
                value={arbkJson}
                onChange={(e) => setArbkJson(e.target.value)}
              />
            </>
          ) : (
            <>
              <p className="small mb-3">
                U gjetën <strong>{arbkResults.length}</strong> biznese. Zgjidhni njërin:
              </p>
              <div className="list-group" style={{ maxHeight: 350, overflowY: "auto" }}>
                {arbkResults.map((biz, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="list-group-item list-group-item-action mb-2 rounded"
                    onClick={() => applyArbkData(biz)}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong>{biz.EmriBiznesit}</strong>
                      <span className="badge bg-secondary ms-2">{biz.StatusiARBK}</span>
                    </div>
                    <div className="small text-muted">
                      NUI: {biz.NUI || "-"} | {biz.Adresa}, {biz.Komuna}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowArbkModal(false);
              setArbkResults([]);
              setArbkJson("");
              setArbkError("");
            }}
          >
            Anulo
          </Button>
          {arbkResults.length === 0 && (
            <Button variant="success" onClick={handleParseJSON} disabled={!arbkJson}>
              Analizo JSON
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ShtoKlientin;
