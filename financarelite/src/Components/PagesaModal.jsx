import { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { put, makeId, STORES } from "../lib/db";

const BLANK = { shuma: "", dataRegjistrimit: new Date().toISOString().slice(0, 10), menyra: "kesh", pershkrimi: "" };

/** Records a payment received against a client — used both from Kartela Analitike (generic,
 * against the selected client) and from a single invoice's view (prefilled with a reference to
 * that invoice). Payments only ever reduce a client's balance in Kartela Analitike; they don't
 * touch the invoice record itself. `klienti` needs at least `emriBiznesit`, since that's what
 * Kartela Analitike matches payments to a client by (same convention invoices already use —
 * there's no foreign key, just a name snapshot). */
function PagesaModal({ show, onHide, klienti, defaultPershkrimi = "", onSaved }) {
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) setForm({ ...BLANK, pershkrimi: defaultPershkrimi });
  }, [show, defaultPershkrimi]);

  const onChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const valid = klienti?.emriBiznesit && parseFloat(form.shuma) > 0;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    try {
      const record = {
        id: makeId("pay"),
        klienti: { emriBiznesit: klienti.emriBiznesit },
        shuma: parseFloat(form.shuma),
        dataRegjistrimit: new Date(form.dataRegjistrimit).toISOString(),
        menyra: form.menyra,
        pershkrimi: form.pershkrimi.trim(),
      };
      await put(STORES.payments, record);
      onSaved?.(record);
      onHide();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h6">Shto Pagesë {klienti?.emriBiznesit ? `— ${klienti.emriBiznesit}` : ""}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSave}>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={6}>
              <Form.Label>
                Shuma € <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control type="number" step="0.01" min="0" value={form.shuma} onChange={onChange("shuma")} autoFocus required />
            </Col>
            <Col xs={6}>
              <Form.Label>Data</Form.Label>
              <Form.Control type="date" value={form.dataRegjistrimit} onChange={onChange("dataRegjistrimit")} />
            </Col>
            <Col xs={12}>
              <Form.Label>Mënyra e Pagesës</Form.Label>
              <Form.Select value={form.menyra} onChange={onChange("menyra")}>
                <option value="kesh">Kesh</option>
                <option value="banke">Bankë</option>
                <option value="tjeter">Tjetër</option>
              </Form.Select>
            </Col>
            <Col xs={12}>
              <Form.Label>Përshkrimi</Form.Label>
              <Form.Control as="textarea" rows={2} value={form.pershkrimi} onChange={onChange("pershkrimi")} placeholder="p.sh. Pagesë për FAT-..." />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Anulo
          </Button>
          <Button type="submit" className="btn-primary" disabled={!valid || saving}>
            {saving ? "Duke ruajtur..." : "Ruaj Pagesën"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default PagesaModal;
