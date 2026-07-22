import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Spinner } from "react-bootstrap";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

const RENDER_WIDTH = 900;

/** Renders a PDF blob as a stack of full-width `<canvas>` pages instead of relying on the
 * browser's own PDF plugin (via `<iframe>`/`<object>`). Mobile Chrome doesn't render a plugin
 * inside an iframe reliably — it falls back to a bare "Open" download prompt — so this rasterizes
 * every page itself with pdf.js, which works the same everywhere. */
function PdfCanvasViewer({ blob, className }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!blob) return undefined;
    let cancelled = false;
    let doc = null;
    const container = containerRef.current;
    setError(null);

    (async () => {
      try {
        const data = await blob.arrayBuffer();
        doc = await pdfjsLib.getDocument({ data }).promise;
        if (cancelled || !container) return;
        container.innerHTML = "";

        for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
          if (cancelled) return;
          const page = await doc.getPage(pageNum);
          const unscaledViewport = page.getViewport({ scale: 1 });
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const viewport = page.getViewport({ scale: (RENDER_WIDTH / unscaledViewport.width) * dpr });

          const canvas = document.createElement("canvas");
          canvas.className = "invoice-pdf-page";
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
          if (cancelled) return;
          container.appendChild(canvas);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Gabim gjatë shfaqjes së faturës:", err);
          setError(err);
        }
      }
    })();

    return () => {
      cancelled = true;
      doc?.destroy();
    };
  }, [blob]);

  if (error) {
    return (
      <div className="invoice-pdf-error">
        Faturën nuk mundëm ta shfaqim këtu. Përdorni "Ruaj Faturën" për ta shkarkuar dhe hapur.
      </div>
    );
  }

  if (!blob) {
    return (
      <div className="invoice-pdf-loading">
        <Spinner animation="border" size="sm" className="me-2" /> Duke përgatitur faturën...
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}

export default PdfCanvasViewer;
