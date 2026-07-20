import { useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { Download, CheckCircle2 } from "lucide-react";
import { exportListExcel } from "../../lib/exportExcel";

/** Column-picker + Excel export, ported from FinanCare's EksportoTeDhenat.jsx. */
function EksportoTeDhenat({ teDhenatJSON, emriDokumentit }) {
  const [showConfig, setShowConfig] = useState(false);
  const [selectedHeaders, setSelectedHeaders] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportSelection = () => {
    if (selectedHeaders.length === 0) return teDhenatJSON;
    return teDhenatJSON.map((item) => {
      const newItem = {};
      selectedHeaders.forEach((header) => {
        newItem[header] = item[header];
      });
      return newItem;
    });
  };

  const handleExportExcelDirect = () => {
    setIsExporting(true);
    setTimeout(async () => {
      try {
        const exportData = handleExportSelection();
        const headers = selectedHeaders.length > 0 ? selectedHeaders : Object.keys(teDhenatJSON[0] || {});
        await exportListExcel(emriDokumentit || "Eksporti i të Dhënave", headers, exportData, `${emriDokumentit || "FinanCareLite_Export"}.xlsx`);
      } catch (error) {
        console.error("Error during export:", error);
      } finally {
        setIsExporting(false);
        setShowConfig(false);
      }
    }, 50);
  };

  const handleCheckboxChange = (header) => {
    setSelectedHeaders((prev) => (prev.includes(header) ? prev.filter((h) => h !== header) : [...prev, header]));
  };

  const selectAll = () => setSelectedHeaders(Object.keys(teDhenatJSON[0] || {}));
  const selectNone = () => setSelectedHeaders([]);

  return (
    <div className="d-inline-block">
      <Button variant="outline-primary" className="btn-premium-outline d-flex align-items-center gap-2" onClick={() => setShowConfig(true)}>
        <Download size={18} />
        <span>Eksporto Excel</span>
      </Button>

      <Modal show={showConfig} onHide={() => setShowConfig(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-800">Konfigurimi i Eksportit Excel</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <p className="text-muted small mb-3">Zgjidhni kolonat që dëshironi të përfshini në skedarin tuaj Excel.</p>

          <div className="d-flex gap-2 mb-3">
            <button className="btn-small-link" onClick={selectAll}>
              Zgjidh të gjitha
            </button>
            <span className="text-muted">|</span>
            <button className="btn-small-link" onClick={selectNone}>
              Pastro
            </button>
          </div>

          <div className="column-grid">
            {Object.keys(teDhenatJSON[0] || {}).map((header, index) => (
              <div key={index} className={`column-item ${selectedHeaders.includes(header) ? "active" : ""}`} onClick={() => handleCheckboxChange(header)}>
                <div className="check-box">{selectedHeaders.includes(header) && <CheckCircle2 size={14} />}</div>
                <span>{header}</span>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="btn-premium-outline" onClick={() => setShowConfig(false)}>
            Anulo
          </Button>
          <Button variant="primary" className="btn-premium-shto d-flex align-items-center gap-2" disabled={selectedHeaders.length === 0 || isExporting} onClick={handleExportExcelDirect}>
            {isExporting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                Duke eksportuar...
              </>
            ) : (
              "Eksporto Excel"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .column-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.75rem;
          max-height: 340px;
          overflow-y: auto;
          padding: 0.5rem;
        }
        .column-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--sp-surface-2);
          padding: 0.6rem 0.75rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid var(--sp-border);
          color: var(--sp-text-muted);
          font-size: 0.82rem;
          font-weight: 500;
        }
        .column-item:hover {
          background: var(--sp-surface-3);
          color: var(--sp-text);
        }
        .column-item.active {
          background: var(--sp-emerald-glow);
          border-color: var(--sp-emerald);
          color: var(--sp-emerald);
          font-weight: 700;
        }
        .check-box {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          border: 2px solid var(--sp-border);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--sp-surface);
          color: transparent;
        }
        .column-item.active .check-box {
          background: var(--sp-emerald);
          border-color: var(--sp-emerald);
          color: white;
        }
        .btn-small-link {
          background: none;
          border: none;
          color: var(--sp-emerald);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0;
          cursor: pointer;
        }
        .btn-small-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

export default EksportoTeDhenat;
