import { useEffect, useRef, useState } from "react";
import { Button, Table, Form, Alert } from "react-bootstrap";
import { Download, Upload, Trash2, Plus } from "lucide-react";
import NavBar from "../Components/NavBar";
import PageTitle from "../Components/PageTitle";
import { exportAllData, importAllData, getAll, put, remove, makeId, STORES } from "../lib/db";
import "./Styles/PremiumTheme.css";
import "./Styles/DizajniPergjithshem.css";

const BLANK_CURRENCY = { code: "", rate: "" };

function TeDhena() {
  const [currencies, setCurrencies] = useState([]);
  const [newCurrency, setNewCurrency] = useState(BLANK_CURRENCY);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const loadCurrencies = () => getAll(STORES.currencies).then(setCurrencies);

  useEffect(() => {
    loadCurrencies();
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

  const handleExport = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `financarelite-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!confirm("Importimi do të zëvendësojë të gjitha të dhënat aktuale (klientë, produkte, fatura, kurse). Vazhdo?")) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAllData(data);
      setMessage({ type: "success", text: "Të dhënat u importuan me sukses." });
      loadCurrencies();
    } catch (err) {
      setMessage({ type: "danger", text: "Importimi dështoi: " + err.message });
    }
  };

  return (
    <>
      <PageTitle title="Eksporto / Importo" />
      <NavBar />

      <div className="containerDashboardP">
        <h1 className="titulliPerditeso">Kurset e Këmbimit</h1>
        <p className="text-muted mb-4">
          Shtoni sa monedha të doni (ose asnjë) — çmohen manualisht këtu, pa lidhje me ndonjë API të jashtme. Ato
          shfaqen si rreshta shtesë totali në fund të çdo fature, në krah të totalit në €.
        </p>

        <Table responsive className="align-middle">
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
                <td>{c.code}</td>
                <td style={{ maxWidth: 160 }}>
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
            <tr>
              <td>
                <Form.Control
                  size="sm"
                  placeholder="p.sh. USD"
                  value={newCurrency.code}
                  onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value })}
                />
              </td>
              <td style={{ maxWidth: 160 }}>
                <Form.Control
                  size="sm"
                  type="number"
                  step="0.0001"
                  placeholder="p.sh. 1.10"
                  value={newCurrency.rate}
                  onChange={(e) => setNewCurrency({ ...newCurrency, rate: e.target.value })}
                />
              </td>
              <td>
                <Button variant="outline-success" size="sm" onClick={addCurrency}>
                  <Plus size={14} />
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>

      <div className="containerDashboardP">
        <h1 className="titulliPerditeso">Eksporto / Importo Të Dhënat</h1>
        <p className="text-muted mb-4">
          Të gjitha të dhënat (biznesi, klientët, produktet, faturat, kurset) ruhen vetëm në këtë shfletues. Eksportoni
          një kopje JSON për arkivim, ose importojeni në një shfletues/pajisje tjetër.
        </p>

        {message && (
          <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
            {message.text}
          </Alert>
        )}

        <div className="d-flex gap-3">
          <Button className="btn-primary" onClick={handleExport}>
            <Download size={16} className="me-2" /> Eksporto si JSON
          </Button>
          <Button variant="outline-light" onClick={handleImportClick}>
            <Upload size={16} className="me-2" /> Importo nga JSON
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleImportFile} />
        </div>
      </div>
    </>
  );
}

export default TeDhena;
