import axios from "axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faXmark } from "@fortawesome/free-solid-svg-icons";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function LargoNjesineMatese(props) {
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
        `${API_BASE_URL}/api/NjesiaMatese/fshijNjesineMatese?id=${props.id}`,
        authentikimi
      );
      props.setTipiMesazhit("success");
      props.setPershkrimiMesazhit("Njesia matese u fshi me sukses!");
      props.perditesoTeDhenat();
      props.largo();
      props.shfaqmesazhin();
    } catch (error) {
      console.error(error);
      props.setTipiMesazhit("danger");
      props.setPershkrimiMesazhit(
        "Ndodhi nje gabim gjate fshirjes se njesise matese!"
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
      <Modal show={true} onHide={() => props.largo()}>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "red" }}>
            Largo Njesine Matese
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6>A jeni te sigurt qe deshironi ta fshini kete njesi matese?</h6>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => props.largo()}>
            Anulo <FontAwesomeIcon icon={faXmark} />
          </Button>
          <Button variant="danger" onClick={handleSubmit}>
            Largo Njesine Matese <FontAwesomeIcon icon={faBan} />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default LargoNjesineMatese;
