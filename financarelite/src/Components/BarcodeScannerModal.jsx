import { useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Camera, X } from "lucide-react";

/** Camera barcode/QR scanner — works from any HTTPS origin (camera access requires a secure
 * context), which is why this is safe to ship in a purely static, no-backend app. */
const BarcodeScannerModal = ({ show, onHide, onScan }) => {
  useEffect(() => {
    if (!show) return undefined;
    let html5QrcodeScanner = null;
    let cancelled = false;

    // The scanner library is only needed once someone actually opens the camera, so it's loaded
    // here instead of riding along in the main bundle. The small delay is still there for the
    // Modal to have mounted #reader; the import usually covers it on its own by now.
    const start = async () => {
      const { Html5QrcodeScanner } = await import("html5-qrcode");
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (cancelled || !document.getElementById("reader")) return;

      html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 280, height: 180 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
        },
        false
      );

      html5QrcodeScanner.render(
        (decodedText) => {
          html5QrcodeScanner.clear().catch(console.error);
          onScan(decodedText);
        },
        () => {
          // Ignore scan failures — they fire continuously while no code is in frame.
        }
      );
    };

    start().catch((err) => console.error("Skaneri nuk u ngarkua dot:", err));

    return () => {
      cancelled = true;
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(console.error);
      }
    };
  }, [show, onScan]);

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false} restoreFocus={false}>
      <Modal.Header
        closeButton
        style={{ background: "var(--sp-surface)", borderBottom: "1px solid var(--sp-border)", color: "var(--sp-text)" }}
      >
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
            border: "2px solid var(--sp-emerald)",
            background: "var(--sp-surface-2)",
          }}
        ></div>
        <p className="mt-3 text-center mb-0" style={{ color: "var(--sp-text-muted)", fontSize: "0.9rem" }}>
          Afroni barkodin e produktit në kamerë.
        </p>
      </Modal.Body>
      <Modal.Footer style={{ background: "var(--sp-surface)", borderTop: "1px solid var(--sp-border)", justifyContent: "center" }}>
        <button className="btn-scanner-close" onClick={onHide}>
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
        }
        #reader button {
          background: var(--sp-emerald) !important;
          color: white !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 8px 16px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          margin-top: 10px !important;
        }
        #reader select {
          background: var(--sp-surface-2) !important;
          color: var(--sp-text) !important;
          border: 1px solid var(--sp-border) !important;
          border-radius: 8px !important;
          padding: 8px !important;
          margin-bottom: 10px !important;
        }
        #reader span, #reader a {
          color: var(--sp-text) !important;
        }
      `}</style>
    </Modal>
  );
};

export default BarcodeScannerModal;
