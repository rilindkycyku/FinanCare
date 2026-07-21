import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { Camera } from "lucide-react";
import { getAll, put, makeId, STORES } from "../lib/db";
import { darkSelectStyles } from "../lib/darkSelectStyles";
import { useTvshTypes, useUnits } from "../lib/useConfigLists";
import BarcodeScannerModal from "./BarcodeScannerModal";
import { useDialog } from "../Context/DialogContext";

const BLANK = {
  emriProduktit: "",
  barkodi: "",
  kodiProduktit: "",
  emriNjesiaMatese: "copë",
  llojiTVSH: "18",
  qmimiShites: "",
  rabati1: "0",
};

function ShtoProduktin({ show, onHide, onSaved, initial }) {
  const [produkti, setProdukti] = useState(BLANK);
  const [showScanner, setShowScanner] = useState(false);
  const dialog = useDialog();
  const tvshTypes = useTvshTypes();
  const units = useUnits();

  useEffect(() => {
    if (show) setProdukti(initial || BLANK);
  }, [show, initial]);

  const tvshOptions = useMemo(
    () => tvshTypes.map((t) => ({ value: String(t.perqindja), label: `${t.emri} (${t.perqindja}%)` })),
    [tvshTypes]
  );
  const unitOptions = useMemo(() => units.map((u) => ({ value: u.emri, label: u.emri })), [units]);

  const onChange = (e) => setProdukti({ ...produkti, [e.target.name]: e.target.value });

  const handleScanResult = (scannedCode) => {
    setShowScanner(false);
    setProdukti((prev) => ({ ...prev, barkodi: scannedCode }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!produkti.emriProduktit || !produkti.qmimiShites) return;
    const record = { id: produkti.id || makeId("prod"), ...produkti };

    const nameKey = record.emriProduktit.trim().toLowerCase();
    const barcodeKey = record.barkodi?.trim().toLowerCase();
    const existingProducts = await getAll(STORES.products);
    const duplicate = existingProducts.find(
      (p) =>
        p.id !== record.id &&
        (p.emriProduktit?.trim().toLowerCase() === nameKey || (barcodeKey && p.barkodi?.trim().toLowerCase() === barcodeKey))
    );
    if (duplicate) {
      const proceed = await dialog.confirm(
        `Një produkt me emrin "${record.emriProduktit}" ekziston tashmë. Ta ruaj gjithsesi si produkt të ri?`,
        { title: "Produkt i ngjashëm ekziston" }
      );
      if (!proceed) return;
    }

    await put(STORES.products, record);
    onSaved(record);
  };

  return (
    <Modal size="lg" show={show} onHide={onHide} className="sp-modal">
      <Modal.Header closeButton>
        <Modal.Title>{initial ? "Ndrysho Produktin" : "Shto Produkt të Ri"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSave}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>
                Emri i Produktit <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control name="emriProduktit" value={produkti.emriProduktit} onChange={onChange} autoFocus required />
            </Col>
            <Col md={3}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Form.Label className="mb-0">Barkodi</Form.Label>
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="btn btn-link btn-sm p-0 d-flex align-items-center gap-1"
                  style={{ fontSize: "0.8rem", fontWeight: 600 }}
                >
                  <Camera size={14} /> Skano
                </button>
              </div>
              <Form.Control name="barkodi" value={produkti.barkodi} onChange={onChange} placeholder="Skano ose shëno..." />
            </Col>
            <Col md={3}>
              <Form.Label>Kodi i Produktit</Form.Label>
              <Form.Control name="kodiProduktit" value={produkti.kodiProduktit} onChange={onChange} />
            </Col>

            <Col md={4}>
              <Form.Label>Njësia Matëse</Form.Label>
              <CreatableSelect
                styles={darkSelectStyles}
                classNamePrefix="react-select"
                options={unitOptions}
                placeholder="copë, kg, orë..."
                formatCreateLabel={(input) => `Përdor "${input}"`}
                value={produkti.emriNjesiaMatese ? { value: produkti.emriNjesiaMatese, label: produkti.emriNjesiaMatese } : null}
                onChange={(opt) => setProdukti({ ...produkti, emriNjesiaMatese: opt?.value || "" })}
              />
            </Col>
            <Col md={4}>
              <Form.Label>TVSH %</Form.Label>
              <Select
                styles={darkSelectStyles}
                classNamePrefix="react-select"
                options={tvshOptions}
                value={tvshOptions.find((o) => o.value === produkti.llojiTVSH) || null}
                onChange={(opt) => setProdukti({ ...produkti, llojiTVSH: opt.value })}
              />
            </Col>
            <Col md={4}>
              <Form.Label>
                Çmimi (me TVSH) € <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control type="number" step="0.01" name="qmimiShites" value={produkti.qmimiShites} onChange={onChange} required />
            </Col>

            <Col md={4}>
              <Form.Label>Rabati Standard %</Form.Label>
              <Form.Control type="number" step="0.01" name="rabati1" value={produkti.rabati1} onChange={onChange} />
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Anulo
        </Button>
        <Button className="btn-primary" onClick={handleSave}>
          Ruaj Produktin
        </Button>
      </Modal.Footer>
      <BarcodeScannerModal show={showScanner} onHide={() => setShowScanner(false)} onScan={handleScanResult} />
    </Modal>
  );
}

export default ShtoProduktin;
