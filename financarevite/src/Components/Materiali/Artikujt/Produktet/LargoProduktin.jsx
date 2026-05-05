import axios from "axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faXmark } from "@fortawesome/free-solid-svg-icons";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function LargoProduktin(props) {
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
        `${API_BASE_URL}/api/Produkti/${props.id}`,
        authentikimi
      );
      props.setTipiMesazhit("success");
      props.setPershkrimiMesazhit("Produkti u fshi me sukses!");
      props.perditesoTeDhenat();
      props.largo();
      props.shfaqmesazhin();
    } catch (error) {
      console.error(error);
      props.setTipiMesazhit("danger");
      props.setPershkrimiMesazhit(
        "Ndodhi nje gabim gjate fshirjes se produktit!"
      );
      props.perditesoTeDhenat();
      props.shfaqmesazhin();
    }
  }
  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant"]}
        largo={() => props.largo()}
        shfaqmesazhin={() => props.shfaqmesazhin()}
        perditesoTeDhenat={() => props.perditesoTeDhenat()}
        setTipiMesazhit={(e) => props.setTipiMesazhit(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit(e)}
      />
      <Modal show={true} onHide={() => props.largo()} className="sp-modal">
        <Modal.Header closeButton>
          <Modal.Title className="text-white">Largo Produktin</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-3 text-danger">
            <FontAwesomeIcon icon={faBan} size="3x" />
          </div>
          <h5 className="text-white mb-3 fw-bold">Konfirmimi i Fshirjes</h5>
          <p className="text-white-50">
            A jeni të sigurt që dëshironi ta fshini këtë produkt? <br />
            <span className="small opacity-75">Ky veprim nuk mund të kthehet.</span>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-cancel px-4" onClick={() => props.largo()}>
            Anulo
          </Button>
          <Button variant="danger" className="px-4 fw-bold shadow-sm" onClick={handleSubmit}>
            Konfirmo Largimin
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default LargoProduktin;
