import { useEffect, useState } from "react";
import { Button, Table, Form } from "react-bootstrap";
import { Trash2, Plus } from "lucide-react";
import { getAll, put, remove, makeId, STORES } from "../../lib/db";
import "./SettingsList.css";

const BLANK_CURRENCY = { code: "", rate: "" };

/** "Kurset e Këmbimit" — optional extra currency totals shown at the bottom of every invoice,
 * with rates the business sets manually here (no external API). Standalone settings section,
 * usable either on its own page or embedded inside a settings tab (`embedded` skips the outer
 * card + title since the tab itself already provides those). */
function KursetEKembimit({ embedded }) {
  const [currencies, setCurrencies] = useState([]);
  const [newCurrency, setNewCurrency] = useState(BLANK_CURRENCY);

  useEffect(() => {
    getAll(STORES.currencies).then(setCurrencies);
  }, []);

  const addCurrency = async () => {
    const code = newCurrency.code.trim().toUpperCase();
    const rate = parseFloat(newCurrency.rate);
    if (!code || !(rate > 0)) return;
    const record = { id: makeId("cur"), code, rate };
    await put(STORES.currencies, record);
    setCurrencies((prev) => [...prev, record]);
    setNewCurrency(BLANK_CURRENCY);
  };

  const updateCurrencyRate = async (id, rate) => {
    setCurrencies((prev) => prev.map((c) => (c.id === id ? { ...c, rate } : c)));
    const record = currencies.find((c) => c.id === id);
    if (record) await put(STORES.currencies, { ...record, rate: parseFloat(rate) || 0 });
  };

  const removeCurrency = async (id) => {
    await remove(STORES.currencies, id);
    setCurrencies((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className={embedded ? "pt-3" : "containerDashboardP"}>
      {!embedded && <h1 className="titulliPerditeso">Kurset e Këmbimit</h1>}
      <p className="settings-list-intro">
        Shtoni sa monedha të doni (ose asnjë) — çmohen manualisht këtu, pa lidhje me ndonjë API të jashtme. Ato
        shfaqen si rreshta shtesë totali në fund të çdo fature, në krah të totalit në €.
      </p>

      <div className="settings-add-bar">
        <div>
          <label>Kodi</label>
          <Form.Control
            placeholder="p.sh. USD"
            value={newCurrency.code}
            onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value })}
          />
        </div>
        <div>
          <label>Kursi (1 € = ?)</label>
          <Form.Control
            type="number"
            step="0.0001"
            placeholder="p.sh. 1.10"
            value={newCurrency.rate}
            onChange={(e) => setNewCurrency({ ...newCurrency, rate: e.target.value })}
          />
        </div>
        <div className="settings-add-btn-col">
          <Button className="btn-primary w-100" onClick={addCurrency}>
            <Plus size={14} className="me-1" /> Shto
          </Button>
        </div>
      </div>

      {currencies.length > 0 && (
        <Table responsive className="align-middle settings-table">
          <thead>
            <tr>
              <th>Kodi</th>
              <th>Kursi (1 € = ?)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currencies.map((c) => (
              <tr key={c.id}>
                <td data-label="Kodi">{c.code}</td>
                <td data-label="Kursi" className="settings-col-narrow">
                  <Form.Control
                    type="number"
                    step="0.0001"
                    value={c.rate}
                    onChange={(e) => updateCurrencyRate(c.id, e.target.value)}
                  />
                </td>
                <td>
                  <Button variant="outline-danger" size="sm" onClick={() => removeCurrency(c.id)}>
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

export default KursetEKembimit;
