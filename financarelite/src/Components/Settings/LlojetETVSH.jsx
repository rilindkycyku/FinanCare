import { useEffect, useState } from "react";
import { Button, Table, Form } from "react-bootstrap";
import { Trash2, Plus } from "lucide-react";
import { getAll, put, remove, makeId, STORES } from "../../lib/db";
import "./SettingsList.css";

const BLANK_TVSH = { emri: "", perqindja: "" };

/** "Llojet e TVSH" — the business's own set of VAT rates (Kosovo's 8%/18%, Albania's 10%/20%,
 * or anything else), used everywhere a product/line-item picks a TVSH rate, and broken down
 * into its own total row on every invoice footer. `embedded` skips the outer card + title when
 * this is shown inside a settings tab rather than on its own page. */
function LlojetETVSH({ embedded }) {
  const [tvshTypes, setTvshTypes] = useState([]);
  const [newTvsh, setNewTvsh] = useState(BLANK_TVSH);

  const load = () =>
    getAll(STORES.tvshTypes).then((list) =>
      setTvshTypes([...list].sort((a, b) => (parseFloat(a.perqindja) || 0) - (parseFloat(b.perqindja) || 0)))
    );

  useEffect(() => {
    load();
  }, []);

  const addTvsh = async () => {
    const emri = newTvsh.emri.trim();
    const perqindja = parseFloat(newTvsh.perqindja);
    if (!emri || !(perqindja >= 0)) return;
    const record = { id: makeId("tvsh"), emri, perqindja };
    await put(STORES.tvshTypes, record);
    setNewTvsh(BLANK_TVSH);
    load();
  };

  const updateTvsh = async (id, field, value) => {
    const record = tvshTypes.find((t) => t.id === id);
    if (!record) return;
    const updated = { ...record, [field]: field === "perqindja" ? parseFloat(value) || 0 : value };
    setTvshTypes((prev) => prev.map((t) => (t.id === id ? updated : t)));
    await put(STORES.tvshTypes, updated);
  };

  const removeTvsh = async (id) => {
    await remove(STORES.tvshTypes, id);
    setTvshTypes((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className={embedded ? "pt-3" : "containerDashboardP"}>
      {!embedded && <h1 className="titulliPerditeso">Llojet e TVSH</h1>}
      <p className="settings-list-intro">
        Përcaktoni vetë llojet e TVSH-së që përdor biznesi juaj (p.sh. në Kosovë 8% dhe 18%, në Shqipëri 10% dhe
        20%) — mund t'i shtoni, ndryshoni ose fshini si të doni. Çdo lloj shfaqet si opsion kur zgjidhni TVSH-në e
        një produkti/artikulli, dhe si rresht i veçantë totali në fund të çdo fature.
      </p>

      <div className="settings-add-bar">
        <div>
          <label>Emri</label>
          <Form.Control
            placeholder="p.sh. TVSH Standarde"
            value={newTvsh.emri}
            onChange={(e) => setNewTvsh({ ...newTvsh, emri: e.target.value })}
          />
        </div>
        <div>
          <label>Përqindja %</label>
          <Form.Control
            type="number"
            step="0.01"
            placeholder="p.sh. 18"
            value={newTvsh.perqindja}
            onChange={(e) => setNewTvsh({ ...newTvsh, perqindja: e.target.value })}
          />
        </div>
        <div className="settings-add-btn-col">
          <Button className="btn-primary w-100" onClick={addTvsh}>
            <Plus size={14} className="me-1" /> Shto
          </Button>
        </div>
      </div>

      {tvshTypes.length > 0 && (
        <Table responsive className="align-middle settings-table">
          <thead>
            <tr>
              <th>Emri</th>
              <th>Përqindja %</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tvshTypes.map((t) => (
              <tr key={t.id}>
                <td data-label="Emri">
                  <Form.Control value={t.emri} onChange={(e) => updateTvsh(t.id, "emri", e.target.value)} />
                </td>
                <td data-label="Përqindja" className="settings-col-narrow">
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={t.perqindja}
                    onChange={(e) => updateTvsh(t.id, "perqindja", e.target.value)}
                  />
                </td>
                <td>
                  <Button variant="outline-danger" size="sm" onClick={() => removeTvsh(t.id)}>
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

export default LlojetETVSH;
