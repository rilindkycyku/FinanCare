import { useState } from "react";
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import {
  Download,
  FileText,
  Table as TableIcon,
  Code,
  FileJson,
  Globe,
  X,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import exportFromJSON from 'export-from-json';

function EksportoTeDhenat(props) {
  const [showConfig, setShowConfig] = useState(false);
  const [showFormats, setShowFormats] = useState(false);
  const [selectedHeaders, setSelectedHeaders] = useState([]);

  const exportOptions = [
    { id: 'csv', label: 'CSV', icon: <FileText size={20} />, color: '#10b981' },
    { id: 'xls', label: 'Excel', icon: <FileSpreadsheet size={20} />, color: '#22c55e' },
    { id: 'json', label: 'JSON', icon: <FileJson size={20} />, color: '#6366f1' },
    { id: 'html', label: 'HTML', icon: <Globe size={20} />, color: '#f59e0b' },
    { id: 'xml', label: 'XML', icon: <Code size={20} />, color: '#8b5cf6' },
    { id: 'txt', label: 'Text', icon: <FileText size={20} />, color: '#64748b' },
  ];

  const handleExport = (formatId) => {
    let format;
    switch (formatId) {
      case 'csv': format = exportFromJSON.types.csv; break;
      case 'json': format = exportFromJSON.types.json; break;
      case 'xls': format = exportFromJSON.types.xls; break;
      case 'txt': format = exportFromJSON.types.txt; break;
      case 'html': format = exportFromJSON.types.html; break;
      case 'xml': format = exportFromJSON.types.xml; break;
      default: return;
    }

    exportFromJSON({
      data: handleExportSelection(),
      fileName: props.emriDokumentit || 'FinanCare_Export',
      exportType: format
    });
    setShowFormats(false);
  };

  const handleCheckboxChange = (header) => {
    if (selectedHeaders.includes(header)) {
      setSelectedHeaders(selectedHeaders.filter((item) => item !== header));
    } else {
      setSelectedHeaders([...selectedHeaders, header]);
    }
  };

  const selectAll = () => {
    const allHeaders = Object.keys(props.teDhenatJSON[0] || {});
    setSelectedHeaders(allHeaders);
  };

  const selectNone = () => {
    setSelectedHeaders([]);
  };

  function handleExportSelection() {
    if (selectedHeaders.length === 0) return props.teDhenatJSON;
    return props.teDhenatJSON.map((item) => {
      const newItem = {};
      selectedHeaders.forEach((header) => {
        newItem[header] = item[header];
      });
      return newItem;
    });
  }

  return (
    <div className="d-inline-block">
      <Button
        variant="outline-primary"
        className="btn-premium-outline d-flex align-items-center gap-2"
        onClick={() => setShowConfig(true)}
      >
        <Download size={18} />
        <span>Eksporto</span>
      </Button>

      {/* Step 1: Select Columns */}
      <Modal show={showConfig} onHide={() => setShowConfig(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-800">Konfigurimi i Eksportit</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <p className="text-muted small mb-3">Zgjidhni kolonat që dëshironi të përfshini në dokumentin tuaj.</p>

          <div className="d-flex gap-2 mb-3">
            <button className="btn-small-link" onClick={selectAll}>Zgjidh të gjitha</button>
            <span className="text-muted">|</span>
            <button className="btn-small-link" onClick={selectNone}>Pastro</button>
          </div>

          <div className="column-grid">
            {Object.keys(props.teDhenatJSON[0] || {}).map((header, index) => (
              <div key={index} className={`column-item ${selectedHeaders.includes(header) ? 'active' : ''}`} onClick={() => handleCheckboxChange(header)}>
                <div className="check-box">
                  {selectedHeaders.includes(header) && <CheckCircle2 size={14} />}
                </div>
                <span>{header}</span>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="btn-premium-outline" onClick={() => setShowConfig(false)}>
            Anulo
          </Button>
          <Button
            variant="primary"
            className="btn-premium-shto"
            disabled={selectedHeaders.length === 0}
            onClick={() => {
              setShowFormats(true);
              setShowConfig(false);
            }}
          >
            Vazhdo
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Step 2: Select Format */}
      <Modal show={showFormats} onHide={() => setShowFormats(false)} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-800 fs-5 text-center w-100">Zgjidhni Formatin</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="format-grid">
            {exportOptions.map((opt) => (
              <button key={opt.id} className="format-option" onClick={() => handleExport(opt.id)}>
                <div className="format-icon" style={{ backgroundColor: opt.color + '20', color: opt.color }}>
                  {opt.icon}
                </div>
                <span className="format-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </Modal.Body>
      </Modal>

      <style>{`
        .column-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.75rem;
          max-height: 340px;
          overflow-y: auto;
          padding: 0.5rem;
          scrollbar-width: thin;
          scrollbar-color: #1e2d45 transparent;
        }
        .column-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #162033;
          padding: 0.6rem 0.75rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid rgba(255,255,255,0.08);
          color: #94a3b8;
          font-size: 0.82rem;
          font-weight: 500;
        }
        .column-item:hover {
          background: #1e2d45;
          border-color: rgba(255,255,255,0.15);
          color: #e2e8f0;
        }
        .column-item.active {
          background: rgba(16,185,129,0.12);
          border-color: #10b981;
          color: #10b981;
          font-weight: 700;
        }
        .check-box {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.20);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f1827;
          color: transparent;
        }
        .column-item.active .check-box {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }
        .format-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }
        .format-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          padding: 0.5rem;
          transition: transform 0.2s ease;
          cursor: pointer;
        }
        .format-option:hover {
          transform: translateY(-4px);
        }
        .format-icon {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .format-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
        }
        .btn-small-link {
          background: none;
          border: none;
          color: #10b981;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0;
          cursor: pointer;
        }
        .btn-small-link:hover {
          text-decoration: underline;
          color: #34d399;
        }
      `}</style>

    </div>
  );
}

export default EksportoTeDhenat;
