import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function Mesazhi(props) {
  const handleMesazhiMbyll = () => {
    localStorage.setItem("shfaqMesazhinPasRef", false);
    props.setShfaqMesazhin(false);
  };
  return (
    <Modal show={true} onHide={handleMesazhiMbyll} centered className="sp-modal">
      <Modal.Header closeButton>
        <Modal.Title
          style={
            props.tipi === "success" ? { color: "#10b981" } : { color: "#f87171" }
          }>
          {props.tipi === "success" ? "Me Sukses" : "Ndodhi një gabim"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-white">
        <div dangerouslySetInnerHTML={{ __html: props.pershkrimi }} />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleMesazhiMbyll} className="btn-cancel px-4">
          Mbylle
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Mesazhi;
