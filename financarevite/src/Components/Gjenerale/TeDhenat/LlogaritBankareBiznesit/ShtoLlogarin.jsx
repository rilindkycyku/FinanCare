import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

import { darkSelectStyles } from "@/utils/darkSelectStyles";

function ShtoLlogarin(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [bankaID, setBankaID] = useState(0);
  const [numriLlogaris, setNumriLlogaris] = useState("");
  const [adresaBankes, setAdresaBankes] = useState("");
  const [valuta, setValuta] = useState("Euro");

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

  const handleValutaChange = (event) => {
    setValuta(event);
  };

  function isNullOrEmpty(value) {
    return value === null || value === "" || value === undefined;
  }

  function handleSubmit() {
    axios
      .post(
        `${API_BASE_URL}/api/TeDhenatBiznesit/ShtoLlogarineBankareBiznesit`,
        {
          bankaID: bankaID,
          numriLlogaris: numriLlogaris,
          adresaBankes: adresaBankes,
          valuta: valuta,
        },
        authentikimi
      )
      .then((response) => {
        props.setTipiMesazhit("success");
        props.setPershkrimiMesazhit("Llogaria u insertua me sukses!");
        props.perditesoTeDhenat();
        props.largo();
        props.shfaqmesazhin();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handleKontrolli = () => {
    if (isNullOrEmpty(numriLlogaris)) {
      setFushatEZbrazura(true);
    } else {
      if (
        konfirmoBanken == false &&
        bankat.filter(
          (item) =>
            item.bankaID === bankaID && item.numriLlogaris == numriLlogaris
        ).length !== 0
      ) {
        setKontrolloBankat(true);
      } else {
        handleSubmit();
      }
    }
  };

  const [options, setOptions] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqBankat`, authentikimi)
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
  }, []);

  const handleChangeBanka = async (partneri) => {
    setOptionsSelected(partneri);
    setBankaID(partneri.value);
    document.getElementById("numriLlogaris").focus();
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
            <p className="text-warning mb-2">Kjo llogari ekziston në sistem!</p>
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
          <Modal.Title>Shto Llogarinë Bankare</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="sp-form-container p-2">
            <Form>
              <div className="sp-input-group mb-3">
                <label className="sp-label">Zgjedh Bankën <span className="text-danger">*</span></label>
                <div className="sp-select-container">
                  <Select
                    value={optionsSelected}
                    onChange={handleChangeBanka}
                    options={options}
                    id="produktiSelect"
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
              <div className="sp-input-group mb-3">
                <label className="sp-label">Numri i Llogarisë <span className="text-danger">*</span></label>
                <Form.Control
                  onChange={handleChange(setNumriLlogaris)}
                  value={numriLlogaris}
                  type="text"
                  placeholder="Numri i llogarisë..."
                  id="numriLlogaris"
                  className="sp-input"
                />
              </div>
              <div className="sp-input-group mb-3">
                <label className="sp-label">Adresa e Bankës <span className="text-danger">*</span></label>
                <Form.Control
                  onChange={handleChange(setAdresaBankes)}
                  value={adresaBankes}
                  type="text"
                  placeholder="Adresa e bankës..."
                  className="sp-input"
                />
              </div>
              <div className="sp-input-group mb-0">
                <label className="sp-label">Valuta <span className="text-danger">*</span></label>
                <div className="sp-select-container">
                  <Form.Select
                    value={valuta}
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
            Shto Llogarinë
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ShtoLlogarin;
