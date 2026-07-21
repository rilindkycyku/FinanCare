import { useEffect, useState } from "react";
import { Button, Table, Form } from "react-bootstrap";
import { Trash2, Plus } from "lucide-react";
import { getAll, put, remove, makeId, STORES } from "../../lib/db";
import "./SettingsList.css";

const BLANK_DOCTYPE = { label: "", value: "", negateAmounts: false };

/** "Llojet e Faturave" — the business's own set of invoice/document types, in addition to the
 * 3 built-in ones (Faturë Shitëse, Porosi, Fletëkthim). Each type is just a label + a short
 * numbering prefix, plus a flag for whether amounts on that type should show as negative
 * (same as Fletëkthim does), for things like custom credit/return documents. Used everywhere a
 * document type is picked (KrijoFaturen's "Lloji i Dokumentit" select). */
function LlojetEDokumentit({ embedded }) {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [newDocType, setNewDocType] = useState(BLANK_DOCTYPE);

  const load = () => getAll(STORES.documentTypes).then(setDocumentTypes);

  useEffect(() => {
    load();
  }, []);

  const addDocType = async () => {
    const label = newDocType.label.trim();
    const value = newDocType.value.trim().toUpperCase();
    if (!label || !value) return;
    const record = {
      id: makeId("doctype"),
      value,
      label,
      titleLabel: label.toUpperCase(),
      negateAmounts: newDocType.negateAmounts,
    };
    await put(STORES.documentTypes, record);
    setNewDocType(BLANK_DOCTYPE);
    load();
  };

  const updateDocType = async (id, field, value) => {
    const record = documentTypes.find((t) => t.id === id);
    if (!record) return;
    const updated = { ...record, [field]: value };
    if (field === "label") updated.titleLabel = value.toUpperCase();
    setDocumentTypes((prev) => prev.map((t) => (t.id === id ? updated : t)));
    await put(STORES.documentTypes, updated);
  };

  const removeDocType = async (id) => {
    await remove(STORES.documentTypes, id);
    setDocumentTypes((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className={embedded ? "pt-3" : "containerDashboardP"}>
      {!embedded && <h1 className="titulliPerditeso">Llojet e Faturave</h1>}
      <p className="settings-list-intro">
        Krijoni lloje faturash sipas nevojës suaj, përveç 3 llojeve bazë (Faturë Shitëse, Porosi, Fletëkthim). Çdo
        lloj i ri ka një emër, një prefiks të shkurtër për numërimin (p.sh. "OFR"), dhe mund të shënohet që shumat e
        tij të shfaqen negative — njësoj si te Fletëkthimi — për dokumente të tjera kthimi/krediti.
      </p>

      <div className="settings-add-bar">
        <div>
          <label>Emri</label>
          <Form.Control
            placeholder="p.sh. Ofertë"
            value={newDocType.label}
            onChange={(e) => setNewDocType({ ...newDocType, label: e.target.value })}
          />
        </div>
        <div>
          <label>Prefiksi</label>
          <Form.Control
            placeholder="p.sh. OFR"
            value={newDocType.value}
            onChange={(e) => setNewDocType({ ...newDocType, value: e.target.value })}
          />
        </div>
        <div>
          <label>Shumat</label>
          <Form.Select
            value={newDocType.negateAmounts ? "negative" : "positive"}
            onChange={(e) => setNewDocType({ ...newDocType, negateAmounts: e.target.value === "negative" })}
          >
            <option value="positive">Pozitive (normale)</option>
            <option value="negative">Negative (kthim/kredit)</option>
          </Form.Select>
        </div>
        <div className="settings-add-btn-col">
          <Button className="btn-primary w-100" onClick={addDocType}>
            <Plus size={14} className="me-1" /> Shto
          </Button>
        </div>
      </div>

      {documentTypes.length > 0 && (
        <Table responsive className="align-middle settings-table">
          <thead>
            <tr>
              <th>Emri</th>
              <th>Prefiksi</th>
              <th>Shumat</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {documentTypes.map((t) => (
              <tr key={t.id}>
                <td data-label="Emri">
                  <Form.Control value={t.label} onChange={(e) => updateDocType(t.id, "label", e.target.value)} />
                </td>
                <td data-label="Prefiksi" style={{ maxWidth: 140 }}>
                  <Form.Control
                    value={t.value}
                    onChange={(e) => updateDocType(t.id, "value", e.target.value.toUpperCase())}
                  />
                </td>
                <td data-label="Shumat" style={{ maxWidth: 200 }}>
                  <Form.Select
                    value={t.negateAmounts ? "negative" : "positive"}
                    onChange={(e) => updateDocType(t.id, "negateAmounts", e.target.value === "negative")}
                  >
                    <option value="positive">Pozitive (normale)</option>
                    <option value="negative">Negative (kthim/kredit)</option>
                  </Form.Select>
                </td>
                <td>
                  <Button variant="outline-danger" size="sm" onClick={() => removeDocType(t.id)}>
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default LlojetEDokumentit;
