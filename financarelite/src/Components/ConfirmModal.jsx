import { Modal, Button } from "react-bootstrap";
import { AlertTriangle, Info } from "lucide-react";

function ConfirmModal({
  show,
  title,
  message,
  confirmLabel = "Vazhdo",
  cancelLabel = "Anulo",
  onConfirm,
  onCancel,
  hideCancel = false,
  variant = "warning",
}) {
  const isInfo = variant === "info";
  return (
    <Modal show={show} onHide={onCancel} centered className="sp-modal">
      <Modal.Body className="text-center py-4">
        <div
          className="d-inline-flex align-items-center justify-content-center mb-3"
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: isInfo ? "rgba(79, 70, 229, 0.15)" : "rgba(245, 158, 11, 0.15)",
            color: isInfo ? "#4f46e5" : "#f59e0b",
          }}
        >
          {isInfo ? <Info size={26} /> : <AlertTriangle size={26} />}
        </div>
        {title && <h5 className="fw-semibold mb-2">{title}</h5>}
        <p className="text-muted mb-0">{message}</p>
      </Modal.Body>
      <Modal.Footer className="justify-content-center border-0 pt-0">
        {!hideCancel && (
          <Button variant="outline-secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
        <Button variant={isInfo ? "primary" : "warning"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmModal;
