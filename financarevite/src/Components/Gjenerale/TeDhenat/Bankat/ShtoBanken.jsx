import { useEffect, useMemo, useState } from "react";
﻿import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function ShtoBanken(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [emriBankes, setEmriBankes] = useState("");
  const [lokacioniBankes, setLokacioniBankes] = useState("Kombetare");

  const [perditeso, setPerditeso] = useState("");
  const [bankat, setBankat] = useState([]);
  const [kontrolloBankat, setKontrolloBankat] = useState(false);
  const [konfirmoBanken, setKonfirmoBanken] = useState(false);
  const [fushatEZbrazura, setFushatEZbrazura] = useState(false);

  const getToken = localStorage.getItem("token");

    const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

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
        `${API_BASE_URL}/api/TeDhenatBiznesit/ShtoBanken`,
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
      {kontrolloBankat && (
        <Modal
          size="sm"
          show={kontrolloBankat}
          onHide={() => setKontrolloBankat(false)}
          className="sp-modal">
          <Modal.Header closeButton>
            <Modal.Title>Konfirmo Vendosjen</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            <p className="text-warning mb-2">Kjo bankë ekziston në sistem!</p>
            <p className="text-white small">A jeni të sigurt që dëshironi të vazhdoni?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="btn-cancel"
              onClick={() => setKontrolloBankat(false)}>
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
          <Modal.Title>Shto Bankën</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="sp-form-container p-2">
            <Form>
              <div className="sp-input-group mb-3">
                <label className="sp-label">Emri i Bankës <span className="text-danger">*</span></label>
                <Form.Control
                  onChange={handleChange(setEmriBankes)}
                  value={emriBankes}
                  type="text"
                  placeholder="Psh: BKT, TEB, Raiffeisen..."
                  className="sp-input"
                  autoFocus
                />
              </div>
              <div className="sp-input-group mb-0">
                <label className="sp-label">Lokacioni i Bankës <span className="text-danger">*</span></label>
                <div className="sp-select-container">
                  <Form.Select
                    value={lokacioniBankes}
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
            Shto Bankën
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ShtoBanken;
