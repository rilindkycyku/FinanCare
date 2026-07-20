import { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { Copy, Share2 } from "lucide-react";
import { buildInvoicePayload, encodeInvoiceToLink, toQrPayloadUrl } from "../lib/shareLink";
import { qrDataUrl, QrTooLargeError } from "../lib/qr";

/** QR modal for one invoice — same interaction pattern as GuestSeat's share-link QR modal. */
function ShareQrModal({ show, onHide, teDhenatBiznesit, banks, currencies, invoice }) {
  const [link, setLink] = useState(null);
  const [dataUrl, setDataUrl] = useState(null);
  const [status, setStatus] = useState("loading");
  const [copied, setCopied] = useState(false);

  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => {
    if (!show) return;
    let cancelled = false;
    setStatus("loading");
    setLink(null);
    setDataUrl(null);
    (async () => {
      try {
        const payload = buildInvoicePayload({ teDhenatBiznesit, banks, currencies, invoice });
        const url = await encodeInvoiceToLink(payload);
        if (cancelled) return;
        setLink(url);
        try {
          const png = await qrDataUrl(toQrPayloadUrl(url));
          if (cancelled) return;
          setDataUrl(png);
          setStatus("ready");
        } catch (err) {
          if (cancelled) return;
          setStatus(err instanceof QrTooLargeError ? "tooLarge" : "failed");
        }
      } catch {
        if (!cancelled) setStatus("failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [show, teDhenatBiznesit, banks, currencies, invoice]);

  const copyLink = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — user can still select the link text */
    }
  };

  const shareNative = async () => {
    if (!link) return;
    try {
      await navigator.share({ title: "Fatura", text: "Shikoni faturën këtu:", url: link });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      await copyLink();
    }
  };

  const tooLarge = status === "tooLarge";

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>QR / Shpërndaj Faturën</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted small mb-3">
          {tooLarge
            ? "Fatura ka shumë artikuj për t'u koduar në një QR — përdorni lidhjen më poshtë."
            : "Skanoni këtë kod për të hapur dhe eksportuar këtë faturë si PDF — nuk kërkohet server."}
        </p>

        <div className="d-flex align-items-center justify-content-center bg-white rounded-3 p-3" style={{ minHeight: 220 }}>
          {status === "ready" && dataUrl ? (
            <img src={dataUrl} alt="QR e faturës" style={{ width: 208, height: 208 }} />
          ) : status === "loading" ? (
            <Spinner animation="border" variant="secondary" />
          ) : tooLarge ? (
            <div className="text-center text-muted small px-2">Përdorni lidhjen ose ndarjen më poshtë</div>
          ) : (
            <div className="text-center text-muted small px-2">Nuk u krijua dot QR-ja</div>
          )}
        </div>

        {link && (
          <div className="mt-3 d-grid gap-2">
            {canShare && (
              <Button variant={tooLarge ? "primary" : "outline-light"} onClick={shareNative}>
                <Share2 size={16} className="me-2" /> Shpërndaj
              </Button>
            )}
            <Button variant={tooLarge && !canShare ? "primary" : "outline-light"} onClick={copyLink}>
              <Copy size={16} className="me-2" /> {copied ? "U kopjua!" : "Kopjo Lidhjen"}
            </Button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ShareQrModal;
