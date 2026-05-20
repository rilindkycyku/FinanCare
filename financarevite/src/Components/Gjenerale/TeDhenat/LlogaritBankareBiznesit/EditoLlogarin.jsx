import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faXmark } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

import { darkSelectStyles } from "@/utils/darkSelectStyles";

function EditoLlogarin(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [banka, setBanka] = useState([]);

  const [perditeso, setPerditeso] = useState("");
  const [bankat, setBankat] = useState([]);
  const [kontrolloBanken, setKontrolloBanken] = useState(false);
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

  const [options, setOptions] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
  useEffect(() => {
    axios
      .get(
        `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqBankat`,
        authentikimi
      )
      .then((response) => {
        const fetchedoptions = response.data.map((item) => ({
          value: item.bankaID,
          label: item.emriBankes + " - " + item.lokacioniBankes,
        }));
        setOptions(fetchedoptions);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [perditeso]);

  const handleChangeBanka = async (partneri) => {
    setOptionsSelected(partneri);
    setBanka((prev) => ({
      ...prev,
      bankaID: partneri.value,
    }));
    document.getElementById("numriLlogaris").focus();
  };

  useEffect(() => {
    const shfaqNjesineMatese = async () => {
      try {
        const bankaKerkim = await axios.get(
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqLlogarineNgaID?id=${props.id}`,
          authentikimi
        );
        setOptionsSelected(
          options.filter((item) => item.value == bankaKerkim.data[0].bankaID)
        );
        setBanka(bankaKerkim.data[0]);
        console.log(banka);
      } catch (err) {
        console.log(err);
      }
    };

    shfaqNjesineMatese();
  }, [perditeso, options]);

  const handleChange = (propertyName) => (event) => {
    setBanka((prev) => ({
      ...prev,
      [propertyName]: event.target.value,
    }));

    console.log(banka);
  };

  const handleValutaChange = (event) => {
    setBanka((prev) => ({ ...prev, valuta: event }));
  };

  function isNullOrEmpty(value) {
    return value === null || value === "" || value === undefined;
  }

  function handleSubmit() {
    axios
      .put(
        `${API_BASE_URL}/api/TeDhenatBiznesit/PerditesoLlogarineBankare?id=${banka.idLlogariaBankare}`,
        banka,
        authentikimi
      )
      .then((x) => {
        props.setTipiMesazhit("success");
        props.setPershkrimiMesazhit("Llogaria u Perditesua me sukses!");
        props.perditesoTeDhenat();
        props.largo();
        props.shfaqmesazhin();
      })
      .catch((error) => {
        console.error("Error saving llogaria:", error);
        props.setTipiMesazhit("danger");
        props.setPershkrimiMesazhit(
          "Ndodhi nje gabim gjate perditesimit te llogaris!"
        );
        props.perditesoTeDhenat();
        props.shfaqmesazhin();
      });
  }

  const handleKontrolli = () => {
    if (isNullOrEmpty(banka.numriLlogaris) || isNullOrEmpty(banka.valuta)) {
      setFushatEZbrazura(true);
    } else {
      if (
        konfirmoBanken == false &&
        bankat.filter(
          (item) =>
            item.bankaID === banka.bankaID &&
            item.numriLlogaris == banka.numriLlogaris
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
        roletELejuara={["Menaxher", "Financa", "1 Euro Menaxher"]}
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
            <Modal.Title>Konfirmo Vendosjen</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            <p className="text-warning mb-2">Kjo llogari ekziston në sistem!</p>
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
          <Modal.Title>Edito Llogarinë Bankare</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="sp-form-container p-2">
            <Form>
              <Row className="mb-3">
                <Col md={4}>
                  <div className="sp-input-group">
                    <label className="sp-label text-muted">ID Teknik</label>
                    <Form.Control
                      value={banka.idLlogariaBankare}
                      disabled
                      className="sp-input opacity-50"
                    />
                  </div>
                </Col>
                <Col md={8}>
                  <div className="sp-input-group">
                    <label className="sp-label">Banka <span className="text-danger">*</span></label>
                    <div className="sp-select-container">
                      <Select
                        value={optionsSelected}
                        onChange={handleChangeBanka}
                        options={options}
                        styles={{
                          control: (base) => ({
                            ...base,
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: 'white'
                          }),
                          menu: (base) => ({
                            ...base,
                            background: '#1a1d21',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }),
                          option: (base, state) => ({
                            ...base,
                            background: state.isFocused ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            color: 'white'
                          }),
                          singleValue: (base) => ({
                            ...base,
                            color: 'white'
                          })
                        }}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
              <div className="sp-input-group mb-3">
                <label className="sp-label">Numri i Llogarisë <span className="text-danger">*</span></label>
                <Form.Control
                  onChange={handleChange("numriLlogaris")}
                  value={banka.numriLlogaris}
                  type="text"
                  placeholder="Numri i llogarisë..."
                  id="numriLlogaris"
                  className="sp-input"
                />
              </div>
              <div className="sp-input-group mb-3">
                <label className="sp-label">Adresa e Bankës</label>
                <Form.Control
                  onChange={handleChange("adresaBankes")}
                  value={banka.adresaBankes}
                  as="textarea"
                  rows={2}
                  placeholder="Shënim për adresën..."
                  className="sp-input"
                />
              </div>
              <div className="sp-input-group mb-0">
                <label className="sp-label">Valuta <span className="text-danger">*</span></label>
                <div className="sp-select-container">
                  <Form.Select
                    value={banka.valuta}
                    onChange={(e) => handleValutaChange(e.target.value)}
                    className="sp-input">
                    <option value="Euro text-dark">Euro - €</option>
                    <option value="Dollar text-dark">Dollar - $</option>
                    <option value="Franga Zvicerane text-dark">Franga Zvicerane - CHF</option>
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
            Ruaj Ndryshimet
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditoLlogarin;
