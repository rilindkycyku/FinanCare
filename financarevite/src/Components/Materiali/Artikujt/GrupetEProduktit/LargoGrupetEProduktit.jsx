import { useMemo } from "react";
﻿import axios from "axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faXmark } from "@fortawesome/free-solid-svg-icons";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function LargoGrupetEProduktit(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const getToken = localStorage.getItem("token");

    const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

  async function handleSubmit() {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/GrupiProduktit/fshijGrupinEProduktit?id=${props.id}`,
        authentikimi
      );
      props.setTipiMesazhit("success");
      props.setPershkrimiMesazhit("Grupi i Produktit u fshi me sukses!");
      props.perditesoTeDhenat();
      props.largo();
      props.shfaqmesazhin();
    } catch (error) {
      console.error(error);
      props.setTipiMesazhit("danger");
      props.setPershkrimiMesazhit(
        "Ndodhi nje gabim gjate fshirjes se grupit te produktit!"
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
          <Modal.Title className="text-white">Largo Grupin e Produktit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center p-3">
            <div className="mb-4 text-danger">
              <FontAwesomeIcon icon={faBan} size="3x" />
            </div>
            <h5 className="text-white mb-2 fw-bold">Konfirmimi i Fshirjes</h5>
            <p className="text-white-50">
              A jeni të sigurt që dëshironi ta fshini këtë grup? <br />
              <span className="small opacity-75">Produktet e këtij grupi do të mbeten pa kategori.</span>
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-cancel px-4" onClick={() => props.largo()}>
            Anulo
          </Button>
          <Button variant="danger" onClick={handleSubmit} className="px-4 fw-bold shadow-sm">
            Konfirmo Fshirjen
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default LargoGrupetEProduktit;
