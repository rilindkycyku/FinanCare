import axios from "axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faXmark } from "@fortawesome/free-solid-svg-icons";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function LargoBanken(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  async function handleSubmit() {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/TeDhenatBiznesit/FshijBanken?id=${props.id}`,
        authentikimi
      );
      props.setTipiMesazhit("success");
      props.setPershkrimiMesazhit("Banka u fshi me sukses!");
      props.perditesoTeDhenat();
      props.largo();
      props.shfaqmesazhin();
    } catch (error) {
      console.error(error);
      props.setTipiMesazhit("danger");
      props.setPershkrimiMesazhit("Ndodhi nje gabim gjate fshirjes se bankes!");
      props.perditesoTeDhenat();
      props.shfaqmesazhin();
    }
  }
  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Financa"]}
        largo={() => props.largo()}
        shfaqmesazhin={() => props.shfaqmesazhin()}
        perditesoTeDhenat={() => props.perditesoTeDhenat()}
        setTipiMesazhit={(e) => props.setTipiMesazhit(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit(e)}
      />
      <Modal show={true} onHide={() => props.largo()} className="sp-modal">
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Largo Bankën</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-3 text-danger">
            <FontAwesomeIcon icon={faBan} size="3x" />
          </div>
          <h5 className="text-white mb-3">A jeni të sigurt?</h5>
          <p className="text-muted">Deshironi ta fshini këtë bankë? Ky veprim mund të ndikojë në regjistrimet e transaksioneve.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-cancel" onClick={() => props.largo()}>
            Anulo
          </Button>
          <Button variant="danger" className="px-4" onClick={handleSubmit}>
            Konfirmo Largimin
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default LargoBanken;
