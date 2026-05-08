import { useEffect, useRef } from "react";
﻿import { Modal, Form, Button, Alert } from "react-bootstrap";

function CalculatorModal({
  show,
  calculatorValue,
  calculatorError,
  onApply,
  onClose,
  onInputChange,
  onKeyDown,
}) {
  const calculatorInputRef = useRef();

  useEffect(() => {
    if (show && calculatorInputRef.current) {
      console.log("Focusing calculator input");
      calculatorInputRef.current.focus();
    }
  }, [show]);

  return (
    <Modal
      show={show}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      restoreFocus={false}
      autoFocus={false}
      className="sp-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Kalkulatori</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {calculatorError && (
          <Alert variant="danger" className="mb-3">
            {calculatorError}
          </Alert>
        )}
        <div className="sp-input-group">
          <label className="sp-label">Shprehja Matematike</label>
          <Form.Control
            type="text"
            value={calculatorValue}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            className="sp-input"
            ref={calculatorInputRef}
            placeholder="Psh: 12.5 + 3 * 2"
            autoComplete="off"
          />
          <p className="text-white-50 small mt-3">
            Shtypni <strong>Enter</strong> për të aplikuar rezultatin.
            Mund të përdorni mbledhje (+), zbritje (-), shumëzim (*) dhe pjestim (/).
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button className="btn-cancel" onClick={onClose}>
          Mbyll
        </Button>
        <Button className="btn-save px-4" onClick={onApply}>
          Apliko
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CalculatorModal;
