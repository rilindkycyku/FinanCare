import { useEffect, useRef, useState } from "react";
import { Form, Row, Col, Button, Table, Modal, Alert } from "react-bootstrap";
import Select from "react-select";
import { Trash2, Plus, Info } from "lucide-react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import PageTitle from "../Components/PageTitle";
import { getBusinessDetails, putBusinessDetails, getAll, put, remove, makeId, STORES } from "../lib/db";
import { darkSelectStyles } from "../lib/darkSelectStyles";
import { CURRENCY_OPTIONS } from "../lib/options";
import { parseArbkPayload } from "../lib/arbk";
import "./Styles/PremiumTheme.css";
import "./Styles/DizajniPergjithshem.css";
import "./Styles/TeDhenatEBiznesit.css";

const BUZ_FIELDS = [
  { name: "emriIBiznesit", label: "Emri i Biznesit", md: 6, required: true },
  { name: "shkurtesaEmritBiznesit", label: "Shkurtesa e Emrit (përdoret në faturë)", md: 6, required: true },
  { name: "menaxheri", label: "Menaxheri / Personi i Autorizuar", md: 4 },
  { name: "nui", label: "Numri Unik Identifikues (NUI)", md: 4, required: true },
  { name: "nf", label: "Numri Fiskal (NF)", md: 4 },
  { name: "nrTVSH", label: "Numri TVSH", md: 4 },
  { name: "email", label: "Email", md: 4 },
  { name: "adresa", label: "Adresa", md: 4 },
  { name: "nrKontaktit", label: "Numri i Kontaktit", md: 4 },
  { name: "website", label: "Uebfaqja (Website)", md: 4 },
];

const BLANK_BANK = { emriBankes: "", numriLlogaris: "", valuta: "EUR" };

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function TeDhenatBiznesit() {
  const [formValue, setFormValue] = useState({});
  const [edito, setEdito] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [banks, setBanks] = useState([]);
  const [newBank, setNewBank] = useState(BLANK_BANK);
  const [showArbkModal, setShowArbkModal] = useState(false);
  const [arbkResults, setArbkResults] = useState([]);
  const [arbkImported, setArbkImported] = useState(false);
  const [arbkJson, setArbkJson] = useState("");
  const [arbkError, setArbkError] = useState("");
  // A ref (not state) so it's readable synchronously the instant the follow-up submit event
  // fires, regardless of whether React has already re-rendered `edito` to true by then.
  const suppressNextSubmit = useRef(false);

  const loadAll = async () => {
    const [biz, bankList] = await Promise.all([getBusinessDetails(), getAll(STORES.banks)]);
    setFormValue(biz || {});
    setBanks(bankList);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const applyArbkData = (biz) => {
    setFormValue((prev) => ({
      ...prev,
      emriIBiznesit: biz.EmriBiznesit || prev.emriIBiznesit,
      shkurtesaEmritBiznesit:
        biz.EmriTregtar || biz.EmriBiznesit?.substring(0, 3)?.toUpperCase() || prev.shkurtesaEmritBiznesit,
      nui: biz.NUI || prev.nui,
      nf: biz.NumriFiskal || prev.nf,
      adresa: `${biz.Adresa || ""}, ${biz.Komuna || ""}`.trim().replace(/^,|,$/g, ""),
      nrKontaktit: biz.Telefoni || prev.nrKontaktit,
      email: biz.Email || prev.email,
    }));
    setEdito(true);
    setShowArbkModal(false);
    setArbkResults([]);
    setArbkJson("");
    setArbkError("");
    setArbkImported(true);
    setTimeout(() => setArbkImported(false), 2500);
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
        // Without this, the flag below survives and gets wrongly replayed on whichever
        // FinanCare page/component mounts next (e.g. pre-filling business details with
        // a client's ARBK data), since only the mount-time check used to clear it.
        localStorage.removeItem("arbk_bridge_data");
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

  // Manual fallback for when the browser extension isn't installed/enabled: paste the ARBK
  // page's own `localStorage.getItem("state")` value straight into the textarea below.
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

  const onChange = (e) => setFormValue({ ...formValue, [e.target.name]: e.target.value });

  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setFormValue((prev) => ({ ...prev, logo: dataUrl }));
  };

  const handleRuaj = async (e) => {
    e.preventDefault();
    // Defensive: this form has been seen to receive a spurious native submit event immediately
    // following the "Ndrysho të dhënat" button's click even with type="button" set, which would
    // otherwise silently save + immediately re-disable the fields the moment edit mode turns on.
    // The guard only needs to catch that same-tick phantom submit — left armed indefinitely, it
    // instead ate the user's next real "Ruaj" click (whichever submit happened to arrive first),
    // so the very first save after entering edit mode silently no-opped.
    if (suppressNextSubmit.current) {
      suppressNextSubmit.current = false;
      return;
    }
    await putBusinessDetails(formValue);
    setEdito(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addBank = async () => {
    if (!newBank.emriBankes || !newBank.numriLlogaris) return;
    const record = { id: makeId("bank"), ...newBank };
    await put(STORES.banks, record);
    setBanks((prev) => [...prev, record]);
    setNewBank(BLANK_BANK);
  };

  const removeBank = async (id) => {
    await remove(STORES.banks, id);
    setBanks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <>
      <PageTitle title="Të Dhënat e Biznesit" />
      <NavBar />
      <div className="containerDashboardP">
        <h1 className="titulliPerditeso mb-0">Të Dhënat e Biznesit</h1>
        <p className="text-muted mb-3">
          Këto të dhëna shfaqen në krye të çdo fature (emri, NUI, NF, TVSH, adresa, kontakti, logoja).
        </p>

        {loading ? (
          <p>Duke ngarkuar...</p>
        ) : (
          <Form onSubmit={handleRuaj}>
            <Row className="g-2">
              {BUZ_FIELDS.map((f) => (
                <Col md={f.md} key={f.name}>
                  <Form.Group>
                    <Form.Label>
                      {f.label}
                      {f.required && <span className="text-danger ms-1">*</span>}
                    </Form.Label>
                    <Form.Control
                      name={f.name}
                      value={formValue[f.name] ?? ""}
                      onChange={onChange}
                      required={f.required}
                      disabled={!edito}
                    />
                  </Form.Group>
                </Col>
              ))}
              {edito && (
                <Col xs={12}>
                  <p className="text-muted small mb-0">
                    <span className="text-danger">*</span> Fusha të detyrueshme
                  </p>
                </Col>
              )}

              <Col md={4} className="d-flex flex-column align-items-center justify-content-center">
                {formValue.logo || edito ? (
                  <div className="logo w-100">
                    <img src={formValue.logo || "/img/web/PaLogo.png"} alt="Logo e Biznesit" />
                  </div>
                ) : null}
              </Col>
              <Col md={4} className="d-flex align-items-center">
                <Form.Group className="w-100">
                  <Form.Label>Logo (mos ta ketë sfond të bardhë)</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleFotoChange} disabled={!edito} />
                </Form.Group>
              </Col>

              <Col xs={12}>
                {!edito ? (
                  <Button
                    type="button"
                    className="btn-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      suppressNextSubmit.current = true;
                      setEdito(true);
                      // Disarm right after this tick: only a submit that fires as an immediate
                      // side effect of *this* click should be swallowed. Anything later — like
                      // the user's actual "Ruaj" click a moment afterwards — must always save.
                      setTimeout(() => {
                        suppressNextSubmit.current = false;
                      }, 0);
                    }}
                  >
                    Ndrysho të dhënat
                  </Button>
                ) : (
                  <Button type="submit" className="btn-primary">
                    Ruaj
                  </Button>
                )}
                {saved && <span className="text-success ms-3 fw-bold">U ruajt me sukses ✓</span>}
                {arbkImported && (
                  <span className="text-success ms-3 fw-bold">Të dhënat u importuan nga ARBK ✓</span>
                )}
              </Col>
            </Row>
          </Form>
        )}
      </div>

      <div className="containerDashboardP">
        <h1 className="titulliPerditeso">Llogaritë Bankare</h1>
        <p className="text-muted mb-4">Shfaqen te fusnota e faturës si mundësi pagese.</p>

        {/* Table layout for tablet/desktop, where there's room for all columns side by side. */}
        <div className="bank-table-wrap d-none d-md-block">
          <Table responsive className="align-middle mb-0">
            <thead>
              <tr>
                <th>Emri i Bankës</th>
                <th>Numri i Llogarisë</th>
                <th>Valuta</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {banks.map((b) => (
                <tr key={b.id}>
                  <td>{b.emriBankes}</td>
                  <td>{b.numriLlogaris}</td>
                  <td>{b.valuta}</td>
                  <td>
                    <Button variant="outline-danger" size="sm" onClick={() => removeBank(b.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
              <tr>
                <td style={{ minWidth: 160 }}>
                  <Form.Control
                    size="sm"
                    placeholder="Emri i bankës"
                    value={newBank.emriBankes}
                    onChange={(e) => setNewBank({ ...newBank, emriBankes: e.target.value })}
                  />
                </td>
                <td style={{ minWidth: 160 }}>
                  <Form.Control
                    size="sm"
                    placeholder="IBAN / Nr. llogarie"
                    value={newBank.numriLlogaris}
                    onChange={(e) => setNewBank({ ...newBank, numriLlogaris: e.target.value })}
                  />
                </td>
                <td style={{ minWidth: 130 }}>
                  <Select
                    styles={darkSelectStyles}
                    classNamePrefix="react-select"
                    options={CURRENCY_OPTIONS}
                    value={CURRENCY_OPTIONS.find((o) => o.value === newBank.valuta)}
                    onChange={(opt) => setNewBank({ ...newBank, valuta: opt.value })}
                  />
                </td>
                <td>
                  <Button variant="outline-success" size="sm" onClick={addBank}>
                    <Plus size={14} />
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>

        {/* Stacked card layout for phones — a fixed-width table forces horizontal scrolling and
         * truncates every column, so each bank (and the "add new" row) gets its own full-width card
         * with labeled fields instead. */}
        <div className="bank-cards d-md-none">
          {banks.map((b) => (
            <div className="bank-card" key={b.id}>
              <div className="bank-card-row">
                <span className="bank-card-label">Emri i Bankës</span>
                <span className="bank-card-value">{b.emriBankes}</span>
              </div>
              <div className="bank-card-row">
                <span className="bank-card-label">Numri i Llogarisë</span>
                <span className="bank-card-value">{b.numriLlogaris}</span>
              </div>
              <div className="bank-card-row">
                <span className="bank-card-label">Valuta</span>
                <span className="bank-card-value">{b.valuta}</span>
              </div>
              <Button variant="outline-danger" size="sm" className="w-100 mt-2" onClick={() => removeBank(b.id)}>
                <Trash2 size={14} className="me-1" /> Fshij
              </Button>
            </div>
          ))}

          <div className="bank-card bank-card-new">
            <Form.Group className="mb-2">
              <Form.Label className="bank-card-label">Emri i Bankës</Form.Label>
              <Form.Control
                size="sm"
                placeholder="Emri i bankës"
                value={newBank.emriBankes}
                onChange={(e) => setNewBank({ ...newBank, emriBankes: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="bank-card-label">Numri i Llogarisë</Form.Label>
              <Form.Control
                size="sm"
                placeholder="IBAN / Nr. llogarie"
                value={newBank.numriLlogaris}
                onChange={(e) => setNewBank({ ...newBank, numriLlogaris: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="bank-card-label">Valuta</Form.Label>
              <Select
                styles={darkSelectStyles}
                classNamePrefix="react-select"
                options={CURRENCY_OPTIONS}
                value={CURRENCY_OPTIONS.find((o) => o.value === newBank.valuta)}
                onChange={(opt) => setNewBank({ ...newBank, valuta: opt.value })}
              />
            </Form.Group>
            <Button variant="outline-success" className="w-100" onClick={addBank}>
              <Plus size={14} className="me-1" /> Shto Llogarinë
            </Button>
          </div>
        </div>
      </div>

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
          <Modal.Title as="h6">{arbkResults.length > 0 ? "Zgjidhni Biznesin nga ARBK" : "Importo nga ARBK"}</Modal.Title>
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

      <Footer />
    </>
  );
}

export default TeDhenatBiznesit;
