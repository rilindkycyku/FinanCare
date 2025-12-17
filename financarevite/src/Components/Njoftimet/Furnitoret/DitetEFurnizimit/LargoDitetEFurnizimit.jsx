import axios from "axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faXmark } from "@fortawesome/free-solid-svg-icons";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function LargoDitenEFurnizimit(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:7285";

  const token = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const handleFshij = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/DitaFurnizimit/fshijDitenEFurnizimit?id=${props.id}`,
        authentikimi
      );

      props.setTipiMesazhit("success");
      props.setPershkrimiMesazhit("Dita e furnizimit u fshi me sukses!");
      props.perditesoTeDhenat();
      props.shfaqmesazhin();
      props.largo();
    } catch (error) {
      console.error("Gabim gjatë fshirjes:", error);
      props.setTipiMesazhit("danger");
      props.setPershkrimiMesazhit("Ndodhi një gabim gjatë fshirjes së ditës së furnizimit.");
      props.shfaqmesazhin();
    }
  };

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant", "Pergjegjes i Porosive"]} // shto rolet që lejohet të fshijë
        largo={() => props.largo()}
        shfaqmesazhin={() => props.shfaqmesazhin()}
        perditesoTeDhenat={() => props.perditesoTeDhenat()}
        setTipiMesazhit={(e) => props.setTipiMesazhit(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit(e)}
      />

      <Modal show={true} onHide={props.largo} centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "red" }}>
            Largo Ditën e Furnizimit
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center py-4">
          <h6 className="mb-4">
            A jeni të sigurt që dëshironi të fshihet kjo ditë furnizimi?
          </h6>
          <p className="text-muted small">
            Kjo veprim nuk mund të zhbëhet.
          </p>
        </Modal.Body>

        <Modal.Footer className="justify-content-between">
          <Button variant="secondary" onClick={props.largo}>
            Anulo <FontAwesomeIcon icon={faXmark} className="ms-2" />
          </Button>

          <Button variant="danger" onClick={handleFshij}>
            Fshij Ditën <FontAwesomeIcon icon={faBan} className="ms-2" />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default LargoDitenEFurnizimit;