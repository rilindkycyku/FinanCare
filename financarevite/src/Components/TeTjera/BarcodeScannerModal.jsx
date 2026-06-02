import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Camera, X } from "lucide-react";

const BarcodeScannerModal = ({ show, onHide, onScan }) => {
  useEffect(() => {
    let html5QrcodeScanner = null;

    if (show) {
      // Small timeout to ensure the DOM element #reader is mounted by the Modal
      setTimeout(() => {
        html5QrcodeScanner = new Html5QrcodeScanner(
          "reader",
          { 
            fps: 10, 
            qrbox: { width: 280, height: 180 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true
          },
          false
        );

        html5QrcodeScanner.render(
          (decodedText) => {
            // Success callback
            html5QrcodeScanner.clear().catch(console.error);
            onScan(decodedText);
          },
          (errorMessage) => {
            // Ignore scan failures as they happen continuously
          }
        );
      }, 150);
    }

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(console.error);
      }
    };
  }, [show, onScan]);

  const handleClose = () => {
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false} restoreFocus={false}>
      <Modal.Header closeButton style={{ background: "var(--sp-surface)", borderBottom: "1px solid var(--sp-border)", color: "var(--sp-text)" }}>
        <Modal.Title className="d-flex align-items-center gap-2">
          <Camera size={24} style={{ color: "#4f46e5" }} /> 
          Skano Barkodin
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: "var(--sp-bg)", padding: "1.5rem" }}>
        <div 
          id="reader" 
          style={{ 
            width: "100%", 
            minHeight: "300px", 
            borderRadius: "16px", 
            overflow: "hidden", 
            border: "2px solid #4f46e5",
            background: "#000"
          }}
        ></div>
        <p className="mt-3 text-center mb-0" style={{ color: "var(--sp-text-muted)", fontSize: "0.9rem" }}>
          Afroni barkodin e produktit në kamerë për të kërkuar çmimin automatikisht.
        </p>
      </Modal.Body>
      <Modal.Footer style={{ background: "var(--sp-surface)", borderTop: "1px solid var(--sp-border)", justifyContent: "center" }}>
        <button 
          className="btn-scanner-close" 
          onClick={handleClose}
        >
          <X size={18} />
          Mbyll Skanerin
        </button>
      </Modal.Footer>
      <style>{`
        .btn-scanner-close {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 14px;
          padding: 10px 24px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .btn-scanner-close:hover {
          background: #ef4444;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -6px rgba(239, 68, 68, 0.5);
        }

        /* html5-qrcode injected elements styling */
        #reader button {
          background: #4f46e5 !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          margin-top: 10px !important;
          transition: background 0.2s !important;
        }
        #reader button:hover {
          background: #4338ca !important;
        }
        #reader a {
          color: #818cf8 !important;
          text-decoration: none !important;
          font-weight: 500 !important;
          display: inline-block !important;
          margin-top: 10px !important;
        }
        #reader a:hover {
          color: #a5b4fc !important;
          text-decoration: underline !important;
        }
        #reader select {
          background: #1e293b !important;
          color: white !important;
          border: 1px solid #334155 !important;
          border-radius: 8px !important;
          padding: 8px !important;
          margin-bottom: 10px !important;
          outline: none !important;
        }
        #reader span {
          color: #cbd5e1 !important;
        }
      `}</style>
    </Modal>
  );
};

export default BarcodeScannerModal;
