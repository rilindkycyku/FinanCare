import { useState, useEffect } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function ShtoBanken(props) {
  const [emriBankes, setEmriBankes] = useState("");
  const [lokacioniBankes, setLokacioniBankes] = useState("Kombetare");

  const [perditeso, setPerditeso] = useState("");
  const [bankat, setBankat] = useState([]);
  const [kontrolloBankat, setKontrolloBankat] = useState(false);
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
          `https://localhost:7285/api/TeDhenatBiznesit/ShfaqBankat`,
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

  const handleChange = (setState) => (event) => {
    setState(event.target.value);
  };

  const handlelokacioniBankesChange = (event) => {
    setLokacioniBankes(event);
  };

  function isNullOrEmpty(value) {
    return value === null || value === "" || value === undefined;
  }

  function handleSubmit() {
    axios
      .post(
        "https://localhost:7285/api/TeDhenatBiznesit/ShtoBanken",
        {
          emriBankes: emriBankes,
          lokacioniBankes: lokacioniBankes,
        },
        authentikimi
      )
      .then((response) => {
        props.setTipiMesazhit("success");
        props.setPershkrimiMesazhit("Banka u insertua me sukses!");
        props.perditesoTeDhenat();
        props.largo();
        props.shfaqmesazhin();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handleKontrolli = () => {
    if (isNullOrEmpty(emriBankes)) {
      setFushatEZbrazura(true);
    } else {
      if (
        konfirmoBanken == false &&
        bankat.filter(
          (item) =>
            item.emriBankes === emriBankes &&
            item.lokacioniBankes == lokacioniBankes
        ).length !== 0
      ) {
        setKontrolloBankat(true);
      } else {
        handleSubmit();
      }
    }
  };

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Financa", "Burime Njerzore"]}
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
          onHide={() => setFushatEZbrazura(false)}>
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "red" }} as="h6">
              Ndodhi nje gabim
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <strong style={{ fontSize: "10pt" }}>
              Ju lutemi plotesoni te gjitha fushat me{" "}
              <span style={{ color: "red" }}>*</span>
            </strong>
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="sm"
              onClick={() => setFushatEZbrazura(false)}
              variant="secondary">
              Mbylle <FontAwesomeIcon icon={faXmark} />
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {kontrolloBankat && (
        <Modal
          size="sm"
          show={kontrolloBankat}
          onHide={() => setKontrolloBankat(false)}>
          <Modal.Header closeButton>
            <Modal.Title as="h6">Konfirmo vendosjen</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span style={{ fontSize: "10pt" }}>
              Kjo Banke ekziston ne sistem!
            </span>
            <br />
            <strong style={{ fontSize: "10pt" }}>
              A jeni te sigurt qe deshironi te vazhdoni?
            </strong>
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setKontrolloBankat(false)}>
              Korrigjo <FontAwesomeIcon icon={faXmark} />
            </Button>
            <Button
              size="sm"
              variant="warning"
              onClick={() => {
                handleSubmit();
              }}>
              Vazhdoni
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      <Modal
        className="modalEditShto"
        show={props.shfaq}
        onHide={() => props.largo()}>
        <Modal.Header closeButton>
          <Modal.Title>Shto Banken</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>
                Emri i Bankes<span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                onChange={handleChange(setEmriBankes)}
                value={emriBankes}
                type="text"
                placeholder="Emri i Bankes"
                autoFocus
              />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1">
              <Form.Label>
                Lokacioni Bankes<span style={{ color: "red" }}>*</span>
              </Form.Label>
              <select
                placeholder="lokacioniBankes"
                className="form-select"
                value={lokacioniBankes}
                onChange={(e) => handlelokacioniBankesChange(e.target.value)}>
                <option defaultValue selected value="Kombetare">
                  Kombetare
                </option>
                <option value="Nderkombtare">Nderkombtare</option>
              </select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => props.largo()}>
            Anulo <FontAwesomeIcon icon={faXmark} />
          </Button>
          <Button className="Butoni" onClick={handleKontrolli}>
            Shto Banken <FontAwesomeIcon icon={faPlus} />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ShtoBanken;
