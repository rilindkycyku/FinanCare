import { useState, useEffect } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faXmark } from "@fortawesome/free-solid-svg-icons";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function EditoBanken(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [banka, setBanka] = useState([]);

  const [perditeso, setPerditeso] = useState("");
  const [bankat, setBankat] = useState([]);
  const [kontrolloBanken, setKontrolloBanken] = useState(false);
  const [konfirmoBanken, setKonfirmoBanken] = useState(false);
  const [fushatEZbrazura, setFushatEZbrazura] = useState(false);

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const vendosbankat = async () => {
      try {
        const bankat = await axios.get(
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqBankat`,
          authentikimi
        );
        setBankat(bankat.data);
        console.log(bankat.data);
      } catch (err) {
        console.log(err);
      }
    };

    vendosbankat();
  }, [perditeso]);

  useEffect(() => {
    const shfaqNjesineMatese = async () => {
      try {
        const bankaKerkim = await axios.get(
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqBankenNgaID?id=${props.id}`,
          authentikimi
        );
        setBanka(bankaKerkim.data[0]);

        console.log(banka);
      } catch (err) {
        console.log(err);
      }
    };

    shfaqNjesineMatese();
  }, []);

  const handleChange = (propertyName) => (event) => {
    setBanka((prev) => ({
      ...prev,
      [propertyName]: event.target.value,
    }));

    console.log(banka);
  };

  const handlelokacioniBankesChange = (event) => {
    setBanka((prev) => ({ ...prev, lokacioniBankes: event }));
  };

  function isNullOrEmpty(value) {
    return value === null || value === "" || value === undefined;
  }

  function handleSubmit() {
    axios
      .put(
        `${API_BASE_URL}/api/TeDhenatBiznesit/PerditesoBanken?id=${banka.bankaID}`,
        banka,
        authentikimi
      )
      .then((x) => {
        props.setTipiMesazhit("success");
        props.setPershkrimiMesazhit("Banka u Perditesua me sukses!");
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
    if (isNullOrEmpty(banka.emriBankes)) {
      setFushatEZbrazura(true);
    } else {
      if (
        konfirmoBanken == false &&
        bankat.filter(
          (item) =>
            item.emriBankes === banka.emriBankes &&
            item.lokacioniBankes == banka.lokacioniBankes
        ).length !== 0
      ) {
        setKontrolloBanken(true);
      } else {
        handleSubmit();
      }
    }
  };

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
      {kontrolloBanken && (
        <Modal
          size="sm"
          show={kontrolloBanken}
          onHide={() => setKontrolloBanken(false)}
          className="sp-modal">
          <Modal.Header closeButton>
            <Modal.Title>Konfirmo Ndryshimin</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            <p className="text-warning mb-2">Kjo bankë ekziston në sistem!</p>
            <p className="text-white small">A jeni të sigurt që dëshironi të vazhdoni?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="btn-cancel"
              onClick={() => setKontrolloBanken(false)}>
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
      <Modal show={true} onHide={() => props.largo()} className="sp-modal">
        <Modal.Header closeButton>
          <Modal.Title>Edito Bankën</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="sp-form-container p-2">
            <Form>
              <Row className="g-4 mb-3">
                <Col md="4">
                  <div className="sp-input-group">
                    <label className="sp-label">ID</label>
                    <Form.Control
                      value={banka.bankaID}
                      disabled
                      className="sp-input"
                      style={{ opacity: 0.6 }}
                    />
                  </div>
                </Col>
                <Col md="8">
                  <div className="sp-input-group">
                    <label className="sp-label">Emri i Bankës <span className="text-danger">*</span></label>
                    <Form.Control
                      onChange={handleChange("emriBankes")}
                      value={banka.emriBankes}
                      type="text"
                      className="sp-input"
                      placeholder="Emri i bankës..."
                      autoFocus
                    />
                  </div>
                </Col>
              </Row>
              <div className="sp-input-group mb-0">
                <label className="sp-label">Lokacioni i Bankës <span className="text-danger">*</span></label>
                <div className="sp-select-container">
                  <Form.Select
                    value={banka.lokacioniBankes}
                    onChange={(e) => handlelokacioniBankesChange(e.target.value)}
                    className="sp-input">
                    <option value="Kombetare text-dark">Kombëtare</option>
                    <option value="Nderkombtare text-dark">Ndërkombëtare</option>
                  </Form.Select>
                </div>
              </div>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-cancel" onClick={() => props.largo()}>
            Anulo
          </Button>
          <Button className="btn-save px-4" onClick={handleKontrolli}>
            Përditëso Bankën
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditoBanken;
