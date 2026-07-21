import { useEffect, useState } from "react";
import { Form, Row, Col, Button, Table, Modal } from "react-bootstrap";
import Select from "react-select";
import { Trash2, Plus } from "lucide-react";
import NavBar from "../Components/NavBar";
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
  { name: "nui", label: "Numri Unik Identifikues (NUI)", md: 4 },
  { name: "nf", label: "Numri Fiskal (NF)", md: 4 },
  { name: "nrTVSH", label: "Numri TVSH", md: 4 },
  { name: "email", label: "Email", md: 4 },
  { name: "adresa", label: "Adresa", md: 4 },
  { name: "nrKontaktit", label: "Numri i Kontaktit", md: 4 },
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
    setArbkImported(true);
    setTimeout(() => setArbkImported(false), 2500);
  };

  // Bridge contract from FinanCare-ARBK-Extension: listens for a postMessage while the tab is
  // open, and for a one-shot localStorage flag set right before the extension focuses this tab.
  useEffect(() => {
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

    const handleMessage = (event) => {
      if (event.data && event.data.type === "ARBK_BRIDGE_DATA" && event.data.payload) {
        handleAutoParse(event.data.payload);
      }
    };
    window.addEventListener("message", handleMessage);

    const savedData = localStorage.getItem("arbk_bridge_data");
    if (savedData) {
      handleAutoParse(savedData);
      localStorage.removeItem("arbk_bridge_data");
    }

    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => setFormValue({ ...formValue, [e.target.name]: e.target.value });

  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setFormValue((prev) => ({ ...prev, logo: dataUrl }));
  };

  const handleRuaj = async (e) => {
    e.preventDefault();
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
        <h1 className="titulliPerditeso">Të Dhënat e Biznesit</h1>
        <p className="text-muted mb-4">
          Këto të dhëna shfaqen në krye të çdo fature (emri, NUI, NF, TVSH, adresa, kontakti, logoja).
        </p>

        {loading ? (
          <p>Duke ngarkuar...</p>
        ) : (
          <Form onSubmit={handleRuaj}>
            <Row className="g-3">
              {BUZ_FIELDS.map((f) => (
                <Col md={f.md} key={f.name}>
                  <Form.Group>
                    <Form.Label>{f.label}</Form.Label>
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
                  <Button className="btn-primary" onClick={() => setEdito(true)}>
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

        <Table responsive className="align-middle">
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
              <td>
                <Form.Control
                  size="sm"
                  placeholder="Emri i bankës"
                  value={newBank.emriBankes}
                  onChange={(e) => setNewBank({ ...newBank, emriBankes: e.target.value })}
                />
              </td>
              <td>
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

      <Modal
        show={showArbkModal}
        onHide={() => {
          setShowArbkModal(false);
          setArbkResults([]);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title as="h6">Zgjidhni Biznesin nga ARBK</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
        </Modal.Body>
      </Modal>
    </>
  );
}

export default TeDhenatBiznesit;
