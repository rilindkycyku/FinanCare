import { useRef, useState } from "react";
import { Button, Alert } from "react-bootstrap";
import { Download, Upload } from "lucide-react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import PageTitle from "../Components/PageTitle";
import { exportAllData, importAllData } from "../lib/db";
import { useDialog } from "../Context/DialogContext";
import "./Styles/PremiumTheme.css";
import "./Styles/DizajniPergjithshem.css";

function TeDhena() {
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);
  const dialog = useDialog();

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
    const proceed = await dialog.confirm(
      "Importimi do të zëvendësojë të gjitha të dhënat aktuale (klientë, produkte, fatura, kurse). Vazhdo?",
      { title: "Konfirmo Importimin" }
    );
    if (!proceed) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAllData(data);
      setMessage({ type: "success", text: "Të dhënat u importuan me sukses." });
    } catch (err) {
      setMessage({ type: "danger", text: "Importimi dështoi: " + err.message });
    }
  };

  return (
    <>
      <PageTitle title="Eksporto / Importo" />
      <NavBar />

      <div className="containerDashboardP">
        <h1 className="titulliPerditeso">Eksporto / Importo Të Dhënat</h1>
        <p className="text-muted mb-4">
          Të gjitha të dhënat (biznesi, klientët, produktet, faturat, kurset, TVSH-ja, njësitë) ruhen vetëm në këtë
          shfletues. Eksportoni një kopje JSON për arkivim, ose importojeni në një shfletues/pajisje tjetër.
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

      <Footer />
    </>
  );
}

export default TeDhena;
