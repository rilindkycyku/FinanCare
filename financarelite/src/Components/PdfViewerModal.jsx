import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { Download, Printer, X, ZoomIn, ZoomOut } from "lucide-react";
import { saveAs } from "file-saver";
import PdfCanvasViewer from "./Fatura/PdfCanvasViewer";
import "./PdfViewerModal.css";

/**
 * The invoice preview, made reusable for every other document the app generates: the PDF is shown
 * inside the app first and reaches the Downloads folder only if "Shkarko PDF" is pressed.
 *
 * `blob` may arrive late — pass `null` while it is being generated and the canvas viewer shows its
 * own spinner.
 */
function PdfViewerModal({ show, blob, filename, title, onHide }) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (show) setZoom(1);
  }, [show, blob]);

  const shkarko = () => blob && saveAs(blob, filename || "dokument.pdf");

  /** Prints the document itself through a hidden iframe, so the printout is the PDF — not the page
   * behind the dialog with its navbar and controls. */
  const printo = () => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    };
    // No cross-browser "print dialog closed" event exists for an iframe, so cleanup is on a timer.
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 60000);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="xl" fullscreen="md-down" className="fcl-pdf-modal">
      <Modal.Header closeButton>
        <Modal.Title>{title || "Parapamja e PDF-së"}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="fcl-pdf-body">
        <div className="fcl-pdf-zoom">
          <button type="button" aria-label="Zvogëlo" onClick={() => setZoom((z) => Math.max(1, z - 0.5))} disabled={zoom <= 1}>
            <ZoomOut size={15} />
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label="Zmadho" onClick={() => setZoom((z) => Math.min(3, z + 0.5))} disabled={zoom >= 3}>
            <ZoomIn size={15} />
          </button>
        </div>

        <PdfCanvasViewer
          blob={blob}
          zoom={zoom}
          emriKlases="fcl-pdf-page"
          className={`fcl-pdf-pages${zoom > 1 ? " zoomuar" : ""}`}
        />
      </Modal.Body>

      <Modal.Footer className="fcl-pdf-footer">
        <span className="fcl-pdf-name me-auto text-truncate">{filename}</span>
        <Button variant="secondary" onClick={onHide}>
          <X size={15} className="me-1" />
          Mbyll
        </Button>
        <Button variant="secondary" onClick={printo} disabled={!blob}>
          <Printer size={15} className="me-1" />
          Printo
        </Button>
        <Button variant="primary" onClick={shkarko} disabled={!blob}>
          <Download size={15} className="me-1" />
          Shkarko PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PdfViewerModal;
