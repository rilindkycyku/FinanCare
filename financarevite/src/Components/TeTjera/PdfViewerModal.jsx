import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { Download, Printer, X, ZoomIn, ZoomOut } from "lucide-react";
import PdfCanvasViewer from "./PdfCanvasViewer";
import "./PdfViewerModal.css";

/**
 * Shows a generated PDF before anything leaves the app: the document is rasterized with pdf.js and
 * only written to disk if "Shkarko PDF" is pressed. Same idea as the invoice preview, made reusable
 * for everything that used to go straight to the Downloads folder (kartela, barazimi, etiketat,
 * paragoni).
 *
 * `blob` may arrive late — pass `null` while it is still being generated and the viewer shows its
 * own spinner.
 */
function PdfViewerModal({ show, blob, filename, title, onHide }) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (show) setZoom(1);
  }, [show, blob]);

  const shkarko = () => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "dokument.pdf";
    link.click();
    URL.revokeObjectURL(url);
  };

  /** Prints the PDF itself through a hidden iframe, so what comes out of the printer is the
   * document — not the page behind the dialog with its navbar, filters and buttons. */
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
    <Modal show={show} onHide={onHide} centered size="xl" fullscreen="md-down" className="fcv-pdf-modal">
      <Modal.Header closeButton>
        <Modal.Title>{title || "Parapamja e PDF-së"}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="fcv-pdf-body">
        <div className="fcv-pdf-zoom">
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
          emriKlases="fcv-pdf-page"
          className={`fcv-pdf-pages${zoom > 1 ? " zoomuar" : ""}`}
        />
      </Modal.Body>

      <Modal.Footer className="fcv-pdf-footer">
        <span className="fcv-pdf-name me-auto text-truncate">{filename}</span>
        <Button className="btn-cancel px-4" onClick={onHide}>
          <X size={15} className="me-1" />
          Mbyll
        </Button>
        <Button className="btn-cancel px-4" onClick={printo} disabled={!blob}>
          <Printer size={15} className="me-1" />
          Printo
        </Button>
        <Button className="btn-save px-4" onClick={shkarko} disabled={!blob}>
          <Download size={15} className="me-1" />
          Shkarko PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PdfViewerModal;
