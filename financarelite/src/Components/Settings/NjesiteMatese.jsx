import { useEffect, useState } from "react";
import { Button, Table, Form } from "react-bootstrap";
import { Trash2, Plus } from "lucide-react";
import { getAll, put, remove, makeId, STORES } from "../../lib/db";
import { DEFAULT_UNITS } from "../../lib/options";
import "./SettingsList.css";

const BLANK_UNIT = { emri: "" };

/** "Njësitë Matëse" — the business's own list of units of measure (copë, kg, litër, orë...),
 * used everywhere a product/line-item picks its njësia. Comes pre-filled with the common ones
 * (see DEFAULT_UNITS) so the list isn't empty on first use, but every row can be renamed or
 * removed, and quick-add chips make it fast to bring back any default that got deleted.
 * `embedded` skips the outer card + title when shown inside a settings tab. */
function NjesiteMatese({ embedded }) {
  const [units, setUnits] = useState([]);
  const [newUnit, setNewUnit] = useState(BLANK_UNIT);

  const load = () => getAll(STORES.units).then(setUnits);

  useEffect(() => {
    load();
  }, []);

  const addUnit = async (emriRaw) => {
    const emri = (emriRaw ?? newUnit.emri).trim();
    if (!emri) return;
    if (units.some((u) => u.emri.toLowerCase() === emri.toLowerCase())) {
      setNewUnit(BLANK_UNIT);
      return;
    }
    const record = { id: makeId("unit"), emri };
    await put(STORES.units, record);
    setNewUnit(BLANK_UNIT);
    load();
  };

  const updateUnit = async (id, emri) => {
    const record = units.find((u) => u.id === id);
    if (!record) return;
    const updated = { ...record, emri };
    setUnits((prev) => prev.map((u) => (u.id === id ? updated : u)));
    await put(STORES.units, updated);
  };

  const removeUnit = async (id) => {
    await remove(STORES.units, id);
    setUnits((prev) => prev.filter((u) => u.id !== id));
  };

  const missingDefaults = DEFAULT_UNITS.filter(
    (d) => !units.some((u) => u.emri.toLowerCase() === d.emri.toLowerCase())
  );

  return (
    <div className={embedded ? "pt-3" : "containerDashboardP"}>
      {!embedded && <h1 className="titulliPerditeso">Njësitë Matëse</h1>}
      <p className="settings-list-intro">
        Njësitë e përdorura kur shtoni produkte ose artikuj në faturë (copë, kg, litër, orë...). Vijnë të
        parapërgatitura me disa njësi të zakonshme — shtoni, ndryshoni ose fshini si të doni.
      </p>

      <div className="settings-add-bar">
        <div>
          <label>Njësia e Re</label>
          <Form.Control
            placeholder="p.sh. litër"
            value={newUnit.emri}
            onChange={(e) => setNewUnit({ emri: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUnit();
              }
            }}
          />
        </div>
        <div className="settings-add-btn-col">
          <Button className="btn-primary w-100" onClick={() => addUnit()}>
            <Plus size={14} className="me-1" /> Shto
          </Button>
        </div>
      </div>

      {missingDefaults.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-4">
          {missingDefaults.map((d) => (
            <Button key={d.id} variant="outline-light" size="sm" onClick={() => addUnit(d.emri)}>
              <Plus size={12} className="me-1" /> {d.emri}
            </Button>
          ))}
        </div>
      )}

      {units.length > 0 && (
        <Table responsive className="align-middle settings-table">
          <thead>
            <tr>
              <th>Njësia</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {units.map((u) => (
              <tr key={u.id}>
                <td data-label="Njësia">
                  <Form.Control value={u.emri} onChange={(e) => updateUnit(u.id, e.target.value)} />
                </td>
                <td>
                  <Button variant="outline-danger" size="sm" onClick={() => removeUnit(u.id)}>
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

export default NjesiteMatese;
