import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button, Form, Modal, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function EditoGrupetEProduktit(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [njesiaMatese, setNjesiaMatese] = useState("");

  const [perditeso, setPerditeso] = useState("");
  const [njesiteMatese, setNjesiteMatese] = useState([]);
  const [kontrolloNjesineMatese, setKontrolloNjesineMatese] = useState(false);
  const [konfirmoNjesineMatese, setKonfirmoNjesineMatese] = useState(false);
  const [fushatEZbrazura, setFushatEZbrazura] = useState(false);

  const getToken = localStorage.getItem("token");

  const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

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

  useEffect(() => {
    const shfaqNjesineMatese = async () => {
      try {
        const njesiaMatese = await axios.get(
          `${API_BASE_URL}/api/GrupiProduktit/shfaqGrupinEProduktitSipasIDs?id=${props.id}`,
          authentikimi
        );
        setNjesiaMatese(njesiaMatese.data);
      } catch (err) {
        console.log(err);
      }
    };

    shfaqNjesineMatese();
  }, []);

  const handleNjesiaMateseChange = (value) => {
    setNjesiaMatese((prev) => ({ ...prev, grupiIProduktit: value }));
  };

  function isNullOrEmpty(value) {
    return value === null || value === "" || value === undefined;
  }

  function handleSubmit() {
    axios
      .put(
        `${API_BASE_URL}/api/GrupiProduktit/perditesoGrupinEProduktit?id=${njesiaMatese.idGrupiProduktit}`,
        njesiaMatese,
        authentikimi
      )
      .then((x) => {
        props.setTipiMesazhit("success");
        props.setPershkrimiMesazhit(
          "Grupi i Produktit u Perditesua me sukses!"
        );
        props.perditesoTeDhenat();
        props.largo();
        props.shfaqmesazhin();
      })
      .catch((error) => {
        console.error("Error saving njesia matese:", error);
        props.setTipiMesazhit("danger");
        props.setPershkrimiMesazhit(
          "Ndodhi nje gabim gjate perditesimit te grupit te produktit!"
        );
        props.perditesoTeDhenat();
        props.shfaqmesazhin();
      });
  }

  const handleKontrolli = () => {
    if (isNullOrEmpty(njesiaMatese.grupiIProduktit)) {
      setFushatEZbrazura(true);
    } else {
      if (
        konfirmoNjesineMatese == false &&
        njesiteMatese.filter(
          (item) => item.grupiIProduktit === njesiaMatese.grupiIProduktit
        ).length !== 0
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
        roletELejuara={["Menaxher", "Kalkulant", "1 Euro Menaxher"]}
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
            <Modal.Title className="text-danger">Ndodhi një gabim</Modal.Title>
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
            <Modal.Title>Konfirmo Ndryshimin</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            <p className="text-warning mb-2">Ky emër grupi ekziston!</p>
            <p className="text-white small">A jeni të sigurt që dëshironi të vazhdoni?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="btn-cancel"
              onClick={() => setKontrolloNjesineMatese(false)}>
              Anulo
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
      <Modal show={true} onHide={() => props.largo()} className="sp-modal">
        <Modal.Header closeButton>
          <Modal.Title>Edito Grupin e Produktit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="sp-form-container p-2">
            <Form>
              <Row className="g-4 mb-3">
                <Col md="4">
                  <div className="sp-input-group">
                    <label className="sp-label">ID</label>
                    <Form.Control
                      value={njesiaMatese.idGrupiProduktit}
                      disabled
                      className="sp-input"
                      style={{ opacity: 0.6 }}
                    />
                  </div>
                </Col>
                <Col md="8">
                  <div className="sp-input-group">
                    <label className="sp-label">Grupi i Produktit <span className="text-danger">*</span></label>
                    <Form.Control
                      onChange={(e) => handleNjesiaMateseChange(e.target.value)}
                      value={njesiaMatese.grupiIProduktit}
                      type="text"
                      className="sp-input"
                      placeholder="Emri i grupit..."
                      autoFocus
                    />
                  </div>
                </Col>
              </Row>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-cancel" onClick={() => props.largo()}>
            Anulo
          </Button>
          <Button className="btn-save px-4" onClick={handleKontrolli}>
            Përditëso Grupin
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditoGrupetEProduktit;
