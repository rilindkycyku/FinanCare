import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Row, Col, Form } from "react-bootstrap";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

const ShtoProduktin = (props) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [perditeso, setPerditeso] = useState("");

  const [produktet, setProduktet] = useState([]);
  const [grupetEProduktev, setGrupetEProduktev] = useState([]);
  const [partneret, setPartneret] = useState([]);
  const [njesitMatese, setNjesitMatese] = useState([]);
  const [kontrolloProduktin, setKontrolloProduktin] = useState(false);
  const [konfirmoProduktin, setKonfirmoProduktin] = useState(false);
  const [fushatEZbrazura, setFushatEZbrazura] = useState(false);

  const getToken = localStorage.getItem("token");

  const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

  const [produkti, setProdukti] = useState({
    emriProduktit: "",
    idNjesiaMatese: 0,
    barkodi: "",
    kodiProduktit: "",
    llojiTVSH: "",
    idGrupiProduktit: 0,
    sasiaShumices: "",
    idPartneri: 0,
  });

  useEffect(() => {
    const vendosTeDhenat = async () => {
      try {
        const produktet = await axios.get(
          `${API_BASE_URL}/api/Produkti/Products`,
          authentikimi
        );

        setProduktet(produktet.data);
      } catch (err) {
        console.log(err);
      }
    };

    vendosTeDhenat();
  }, [perditeso]);

  const onChange = (e) => {
    setProdukti({ ...produkti, [e.target.name]: e.target.value });
  };

  async function handleSubmit() {
    try {
      await axios
        .post(
          `${API_BASE_URL}/api/Produkti/shtoProdukt`,
          {
            emriProduktit: produkti.emriProduktit,
            idNjesiaMatese: produkti.idNjesiaMatese,
            barkodi: produkti.barkodi,
            kodiProduktit: produkti.kodiProduktit,
            llojiTVSH: produkti.llojiTVSH,
            idGrupiProduktit: produkti.idGrupiProduktit,
            sasiaShumices: produkti.sasiaShumices,
            idPartneri: produkti.idPartneri,
          },
          authentikimi
        )
        .then(() => {
          props.setTipiMesazhit("success");
          props.setPershkrimiMesazhit("Produkti u insertua me sukses!");
          props.perditesoTeDhenat();
          props.hide();
          props.shfaqmesazhin();
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (err) {
      console.error(err);
    }
  }

  function isNullOrEmpty(value) {
    return value === null || value === "" || value === undefined;
  }

  const handleKontrolli = () => {
    if (isNullOrEmpty(produkti.emriProduktit)) {
      setFushatEZbrazura(true);
    } else {
      if (
        konfirmoProduktin == false &&
        produktet.filter(
          (item) => item.emriProduktit === produkti.emriProduktit
        ).length !== 0
      ) {
        setKontrolloProduktin(true);
      } else {
        handleSubmit();
      }
    }
  };

  const ndrroField = (e, tjetra) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const el = document.getElementById(tjetra);
      if (el) { el.focus(); setTimeout(() => el.select(), 0); }
    }
  };

  const [optionsGrupiProduktit, setOptionsGrupiProduktit] = useState([]);
  const [optionsSelectedGrupiProduktit, setOptionsSelectedGrupiProduktit] =
    useState(null);
  const [optionsPartneri, setOptionsPartneri] = useState([]);
  const [optionsSelectedPartneri, setOptionsSelectedPartneri] = useState(null);
  const [optionsNjesiaMatese, setOptionsNjesiaMatese] = useState([]);
  const [optionsSelectedNjesiaMatese, setOptionsSelectedNjesiaMatese] =
    useState(null);
  const [optionsLlojiTVSH, setOptionsLlojiTVSH] = useState([]);
  const [optionsSelectedLlojiTVSH, setOptionsSelectedLlojiTVSH] =
    useState(null);
  useEffect(() => {
    axios
      .get(
        `${API_BASE_URL}/api/GrupiProduktit/shfaqGrupetEProduktit`,
        authentikimi
      )
      .then((response) => {
        console.log(response);
        const fetchedoptions = response.data.map((item) => ({
          value: item.idGrupiProduktit,
          label: item.grupiIProduktit,
        }));
        setOptionsGrupiProduktit(fetchedoptions);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
    axios
      .get(
        `${API_BASE_URL}/api/Partneri/shfaqPartneretFurntiore`,
        authentikimi
      )
      .then((response) => {
        console.log(response);
        const fetchedoptions = response.data.filter((item) => item.idPartneri != 1 && item.idPartneri != 2 && item.idPartneri != 3).map((item) => ({
          value: item.idPartneri,
          label: item.emriBiznesit,
        }));
        setOptionsPartneri(fetchedoptions);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
    axios
      .get(
        `${API_BASE_URL}/api/NjesiaMatese/shfaqNjesiteMatese`,
        authentikimi
      )
      .then((response) => {
        console.log(response);
        const fetchedoptions = response.data.map((item) => ({
          value: item.idNjesiaMatese,
          label: item.njesiaMatese,
        }));
        setOptionsNjesiaMatese(fetchedoptions);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
    setOptionsLlojiTVSH([
      { label: "0%", value: "0" },
      { label: "8%", value: "8" },
      { label: "18%", value: "18" },
    ]);
  }, []);

  const handleChangeGrupiProduktit = async (partneri) => {
    setOptionsSelectedGrupiProduktit(partneri);
    setProdukti({ ...produkti, idGrupiProduktit: partneri.value });
    document.getElementById("partneriSelect-input").focus();
  };
  const handleChangePartneri = async (partneri) => {
    setOptionsSelectedPartneri(partneri);

    await axios
      .get(
        `${API_BASE_URL}/api/Produkti/GetKodiProduktitPerRegjistrim?idPartneri=${partneri.value}`,
        authentikimi
      )
      .then((response) => {
        setProdukti({
          ...produkti,
          idPartneri: partneri.value,
          kodiProduktit: response.data,
        });
      });

    document.getElementById("njesiaMateseSelect-input").focus();
  };
  const handleChangeNjesiaMatese = async (partneri) => {
    setOptionsSelectedNjesiaMatese(partneri);
    setProdukti({ ...produkti, idNjesiaMatese: partneri.value });
    document.getElementById("llojiTVSHSelect-input").focus();
  };
  const handleChangeLlojiTVSH = async (partneri) => {
    setOptionsSelectedLlojiTVSH(partneri);
    setProdukti({ ...produkti, llojiTVSH: partneri.value });
    document.getElementById("sasiaShumices").focus();
  };

  const handleMenaxhoTastetPagesa = (event) => {
    if (event.key === "Enter") {
      handleKontrolli();
    }
  };

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant", "1 Euro Menaxher", "1 Euro Staff"]}
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
      {kontrolloProduktin && (
        <Modal
          size="sm"
          show={kontrolloProduktin}
          onHide={() => setKontrolloProduktin(false)}
          className="sp-modal">
          <Modal.Header closeButton>
            <Modal.Title>Konfirmo Vendosjen</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            <p className="text-warning mb-2">Ky produkt ekziston në sistem!</p>
            <p className="text-white small">A jeni të sigurt që dëshironi të vazhdoni?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="btn-cancel"
              onClick={() => setKontrolloProduktin(false)}>
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
        size="lg"
        className="sp-modal"
        show={props.show}
        onHide={props.hide}>
        <Modal.Header closeButton>
          <Modal.Title>Shto Produkt të Ri</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="sp-form-container p-2">
            <Form>
              <Row className="g-4 mb-3">
                <Col md="6">
                  <div className="sp-input-group">
                    <label className="sp-label">Barkodi <span className="text-danger">*</span></label>
                    <Form.Control
                      onChange={onChange}
                      value={produkti.barkodi}
                      name="barkodi"
                      id="barkodi"
                      type="text"
                      autoFocus
                      onKeyDown={(e) => ndrroField(e, "emriProduktit")}
                      autoComplete="off"
                      className="sp-input"
                      placeholder="Skano ose shëno barkodin..."
                    />
                  </div>
                </Col>
                <Col md="6">
                  <div className="sp-input-group">
                    <label className="sp-label">Emri Produktit <span className="text-danger">*</span></label>
                    <Form.Control
                      onChange={onChange}
                      value={produkti.emriProduktit}
                      name="emriProduktit"
                      id="emriProduktit"
                      type="text"
                      onKeyDown={(e) => ndrroField(e, "grupiProduktitSelect-input")}
                      autoComplete="off"
                      className="sp-input"
                      placeholder="Emri i produktit..."
                    />
                  </div>
                </Col>
              </Row>

              <Row className="g-4 mb-3">
                <Col md="4">
                  <div className="sp-input-group">
                    <label className="sp-label">Grupi Produktit <span className="text-danger">*</span></label>
                    <div className="sp-select-container">
                      <Select
                        value={optionsSelectedGrupiProduktit}
                        onChange={handleChangeGrupiProduktit}
                        options={optionsGrupiProduktit}
                        inputId="grupiProduktitSelect-input"
                        placeholder="Zgjidh..."
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

                <Col md="4">
                  <div className="sp-input-group">
                    <label className="sp-label">Partneri <span className="text-danger">*</span></label>
                    <div className="sp-select-container">
                      <Select
                        value={optionsSelectedPartneri}
                        onChange={handleChangePartneri}
                        options={optionsPartneri}
                        inputId="partneriSelect-input"
                        placeholder="Zgjidh..."
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

                <Col md="4">
                  <div className="sp-input-group">
                    <label className="sp-label">Njësia Matëse <span className="text-danger">*</span></label>
                    <div className="sp-select-container">
                      <Select
                        value={optionsSelectedNjesiaMatese}
                        onChange={handleChangeNjesiaMatese}
                        options={optionsNjesiaMatese}
                        inputId="njesiaMateseSelect-input"
                        placeholder="Zgjidh..."
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

              <Row className="g-4 align-items-end">
                <Col md="4">
                  <div className="sp-input-group">
                    <label className="sp-label">TVSH % <span className="text-danger">*</span></label>
                    <div className="sp-select-container">
                      <Select
                        value={optionsSelectedLlojiTVSH}
                        onChange={handleChangeLlojiTVSH}
                        options={optionsLlojiTVSH}
                        inputId="llojiTVSHSelect-input"
                        placeholder="Zgjidh..."
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

                <Col md="4">
                  <div className="sp-input-group">
                    <label className="sp-label">Sasia e Shumicës <span className="text-danger">*</span></label>
                    <Form.Control
                      onChange={onChange}
                      name="sasiaShumices"
                      id="sasiaShumices"
                      value={produkti.sasiaShumices}
                      type="number"
                      autoComplete="off"
                      onKeyDown={handleMenaxhoTastetPagesa}
                      className="sp-input"
                      placeholder="0.00"
                    />
                  </div>
                </Col>

                <Col md="4">
                  <div className="sp-input-group opacity-75">
                    <label className="sp-label text-muted">Kodi Produktit</label>
                    <Form.Control
                      value={produkti.kodiProduktit}
                      name="kodiProduktit"
                      type="text"
                      disabled
                      className="sp-input"
                      placeholder="Gjenerohet..."
                    />
                  </div>
                </Col>
              </Row>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-cancel" onClick={props.hide}>
            Anulo
          </Button>
          <Button
            className="btn-save px-4"
            onClick={handleKontrolli}>
            Shto Produktin
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ShtoProduktin;
