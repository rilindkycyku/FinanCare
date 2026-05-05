import { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form, Modal, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function ShtoGrupetEProduktit(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [njesiaMatese, setNjesiaMatese] = useState("");

  const [perditeso, setPerditeso] = useState("");
  const [njesiteMatese, setNjesiteMatese] = useState([]);
  const [kontrolloNjesineMatese, setKontrolloNjesineMatese] = useState(false);
  const [konfirmoNjesineMatese, setKonfirmoNjesineMatese] = useState(false);
  const [fushatEZbrazura, setFushatEZbrazura] = useState(false);

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const vendosNjesiteMatese = async () => {
      try {
        const njesiteMatese = await axios.get(
          `${API_BASE_URL}/api/GrupiProduktit/shfaqGrupetEProduktit`,
          authentikimi
        );
        setNjesiteMatese(njesiteMatese.data);
        console.log(njesiteMatese.data);
      } catch (err) {
        console.log(err);
      }
    };

    vendosNjesiteMatese();
  }, [perditeso]);

  const handleNjesiaMateseChange = (value) => {
    setNjesiaMatese(value);
  };

  function isNullOrEmpty(value) {
    return value === null || value === "" || value === undefined;
  }

  function handleSubmit() {
    axios
      .post(
        `${API_BASE_URL}/api/GrupiProduktit/shtoGrupinEProduktit`,
        {
          grupiIProduktit: njesiaMatese,
        },
        authentikimi
      )
      .then((response) => {
        props.setTipiMesazhit("success");
        props.setPershkrimiMesazhit("Grupi i Produktit u insertua me sukses!");
        props.perditesoTeDhenat();
        props.largo();
        props.shfaqmesazhin();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handleKontrolli = () => {
    if (isNullOrEmpty(njesiaMatese)) {
      setFushatEZbrazura(true);
    } else {
      if (
        konfirmoNjesineMatese == false &&
        njesiteMatese.filter((item) => item.grupiIProduktit === njesiaMatese)
          .length !== 0
      ) {
        setKontrolloNjesineMatese(true);
      } else {
        handleSubmit();
      }
    }
  };

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
      {fushatEZbrazura && (
        <Modal
          size="sm"
          show={fushatEZbrazura}
          onHide={() => setFushatEZbrazura(false)}
          className="sp-modal">
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">
              Ndodhi një gabim
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            <div className="mb-3 text-danger">
              <FontAwesomeIcon icon={faXmark} size="3x" />
            </div>
            <p className="text-white">Ju lutem plotësoni të gjitha fushat me *</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="btn-cancel w-100"
              onClick={() => setFushatEZbrazura(false)}>
              Mbylle
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {kontrolloNjesineMatese && (
        <Modal
          size="sm"
          show={kontrolloNjesineMatese}
          onHide={() => setKontrolloNjesineMatese(false)}
          className="sp-modal">
          <Modal.Header closeButton>
            <Modal.Title>Konfirmo Vendosjen</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            <p className="text-warning mb-2">Ky grup ekziston në sistem!</p>
            <p className="text-white small">A jeni të sigurt që dëshironi të vazhdoni?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="btn-cancel"
              onClick={() => setKontrolloNjesineMatese(false)}>
              Korrigjo
            </Button>
            <Button
              variant="warning"
              className="px-4"
              onClick={() => handleSubmit()}>
              Vazhdo
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      <Modal
        show={props.shfaq}
        onHide={() => props.largo()}
        className="sp-modal">
        <Modal.Header closeButton>
          <Modal.Title>Shto Grupin e Produktit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="sp-form-container p-2">
            <Form>
              <div className="sp-input-group mb-0">
                <label className="sp-label">Emri i Grupit <span className="text-danger">*</span></label>
                <Form.Control
                  onChange={(e) => handleNjesiaMateseChange(e.target.value)}
                  value={njesiaMatese}
                  type="text"
                  placeholder="Psh: Pije, Ushqim..."
                  className="sp-input"
                  autoFocus
                />
              </div>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-cancel" onClick={() => props.largo()}>
            Anulo
          </Button>
          <Button className="btn-save px-4" onClick={handleKontrolli}>
            Shto Grupin
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ShtoGrupetEProduktit;
