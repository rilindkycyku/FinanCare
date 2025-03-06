import { useState, useEffect } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faXmark } from "@fortawesome/free-solid-svg-icons";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function EditoNjesineMatese(props) {
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
          `https://localhost:7285/api/NjesiaMatese/shfaqNjesiteMatese`,
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
          `https://localhost:7285/api/NjesiaMatese/shfaqNjesineMateseSipasIDs?id=${props.id}`,
          authentikimi
        );
        setNjesiaMatese(njesiaMatese.data);
        console.log(njesiaMatese.data);
      } catch (err) {
        console.log(err);
      }
    };

    shfaqNjesineMatese();
  }, []);

  const handleNjesiaMateseChange = (value) => {
    setNjesiaMatese((prev) => ({ ...prev, emriNjesiaMatese: value }));
  };

  function isNullOrEmpty(value) {
    return value === null || value === "" || value === undefined;
  }

  function handleSubmit() {
    axios
      .put(
        `https://localhost:7285/api/NjesiaMatese/perditesoNjesineMatese?id=${njesiaMatese.idNjesiaMatese}`,
        njesiaMatese,
        authentikimi
      )
      .then((x) => {
        props.setTipiMesazhit("success");
        props.setPershkrimiMesazhit("Njesia Matese u Perditesua me sukses!");
        props.perditesoTeDhenat();
        props.largo();
        props.shfaqmesazhin();
      })
      .catch((error) => {
        console.error("Error saving njesia matese:", error);
        props.setTipiMesazhit("danger");
        props.setPershkrimiMesazhit(
          "Ndodhi nje gabim gjate perditesimit te njesise matese!"
        );
        props.perditesoTeDhenat();
        props.shfaqmesazhin();
      });
  }

  const handleKontrolli = () => {
    if (isNullOrEmpty(njesiaMatese.emriNjesiaMatese)) {
      setFushatEZbrazura(true);
    } else {
      if (
        konfirmoNjesineMatese == false &&
        njesiteMatese.filter(
          (item) => item.njesiaMatese === njesiaMatese.emriNjesiaMatese
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
      {kontrolloNjesineMatese && (
        <Modal
          size="sm"
          show={kontrolloNjesineMatese}
          onHide={() => setKontrolloNjesineMatese(false)}>
          <Modal.Header closeButton>
            <Modal.Title as="h6">Konfirmo vendosjen</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span style={{ fontSize: "10pt" }}>
              Kjo Njesi Matese ekziston ne sistem!
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
              onClick={() => setKontrolloNjesineMatese(false)}>
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
      <Modal className="modalEditShto" show={true} onHide={() => props.largo()}>
        <Modal.Header closeButton>
          <Modal.Title>Edito Njesine Matese</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>ID Njesia Matese</Form.Label>
              <Form.Control value={njesiaMatese.idNjesiaMatese} disabled />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>
                Njesia Matese<span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                onChange={(e) => handleNjesiaMateseChange(e.target.value)}
                value={njesiaMatese.emriNjesiaMatese}
                type="text"
                placeholder="Njesia Matese"
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => props.largo()}>
            Anulo <FontAwesomeIcon icon={faXmark} />
          </Button>
          <Button className="Butoni" onClick={handleKontrolli}>
            Edito Njesine Matese <FontAwesomeIcon icon={faPenToSquare} />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditoNjesineMatese;
