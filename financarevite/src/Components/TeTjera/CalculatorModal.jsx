import { useRef, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";

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
    >
      <Modal.Header closeButton>
        <Modal.Title>Calculator</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {calculatorError && (
          <Alert variant="danger" className="mb-3">
            {calculatorError}
          </Alert>
        )}
        <Form.Control
          type="text"
          value={calculatorValue}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          className="calculator-input"
          ref={calculatorInputRef}
          placeholder="Shkruani shprehjen (p.sh., 12.5 + 3 * 2)"
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Mbyll
        </Button>
        <Button variant="primary" onClick={onApply}>
          Apliko
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CalculatorModal;