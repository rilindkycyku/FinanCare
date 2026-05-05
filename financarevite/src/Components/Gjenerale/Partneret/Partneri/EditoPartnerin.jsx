import { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Form, Col, Button, Modal, Tabs, Tab } from "react-bootstrap";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function EditoKompanin(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [partneri, setPartneri] = useState([]);
  const [foto, setFoto] = useState(null);

  const [kontrolloPartnerin, setKontrolloPartnerin] = useState(false);
  const [konfirmoPartnerin, setKonfirmoPartnerin] = useState(false);
  const [fushatEZbrazura, setFushatEZbrazura] = useState(false);

  const [llojiPartnerit, setLlojiPartnerit] = useState("");
  const [rabati, setRabati] = useState(0);

  const [key, setKey] = useState("teDhenat");

  const [teDhenat, setTeDhenat] = useState([]);

  const [perditeso, setPerditeso] = useState(Date.now());

  const getID = localStorage.getItem("id");
  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const vendosTeDhenat = async () => {
      try {
        const perdoruesi = await axios.get(
          `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
          authentikimi
        );
        setTeDhenat(perdoruesi.data);
      } catch (err) {
        console.log(err);
      }
    };
    vendosTeDhenat();
  }, [perditeso]);

  useEffect(() => {
    const shfaqpartneret = async () => {
      try {
        const partneri = await axios.get(
          `${API_BASE_URL}/api/Partneri/shfaqPartnerinSipasIDs?id=${props.id}`,
          authentikimi
        );
        setPartneri(partneri.data);
        setLlojiPartnerit(partneri.data.llojiPartnerit);
        setRabati(partneri?.data?.kartela?.rabati ?? 0);
      } catch (err) {
        console.log(err);
      }
    };

    shfaqpartneret();
  }, []);

  const onChange = (e) => {
    setPartneri((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleLlojiPartneritChange = (event) => {
    setLlojiPartnerit(event.target.value);
  };
  const handleRabatiChange = (event) => {
    setRabati(event.target.value);
  };

  function isNullOrEmpty(value) {
    return (
      value === null ||
      value === "" ||
      value === undefined ||
      llojiPartnerit === 0
    );
  }

  async function handleSubmit() {
    try {
      await axios
        .put(
          `${API_BASE_URL}/api/Partneri/perditesoPartnerin?stafiID=${teDhenat.perdoruesi.userID}&id=${props.id}`,
          {
            emriBiznesit: partneri.emriBiznesit,
            nui: partneri.nui,
            nrf: partneri.nrf,
            tvsh: partneri.tvsh,
            email: partneri.email,
            adresa: partneri.adresa,
            nrKontaktit: partneri.nrKontaktit,
            llojiPartnerit: llojiPartnerit,
            shkurtesaPartnerit: partneri.shkurtesaPartnerit,
          },
          authentikimi
        )
        .then((x) => {
          props.setTipiMesazhit("success");
          props.setPershkrimiMesazhit("Partneri u Perditesua me sukses!");
          props.perditesoTeDhenat();
          props.largo();
          props.shfaqmesazhin();
        })
        .catch((error) => {
          console.error("Error saving partneri:", error);
          props.setTipiMesazhit("danger");
          props.setPershkrimiMesazhit(
            "Ndodhi nje gabim gjate perditesimit te partnerit!"
          );
          props.perditesoTeDhenat();
          props.shfaqmesazhin();
        });
    } catch (error) {
      console.error(error);
    }
  }

  const handleKontrolli = () => {
    if (
      isNullOrEmpty(partneri.emriBiznesit) ||
      isNullOrEmpty(partneri.shkurtesaPartnerit) ||
      isNullOrEmpty(partneri.nui) ||
      isNullOrEmpty(partneri.adresa) ||
      isNullOrEmpty(llojiPartnerit)
    ) {
      setFushatEZbrazura(true);
    } else {
      handleSubmit();
    }
  };

  async function PerditesoKartelen() {
    try {
      await axios
        .put(
          `${API_BASE_URL}/api/Kartelat/perditesoKartelen?id=${partneri?.kartela?.idKartela}`,
          {
            kodiKartela: partneri?.kartela?.kodiKartela,
            llojiKarteles: partneri?.kartela?.llojiKarteles,
            rabati: rabati,
            stafiID: partneri?.kartela?.stafiID,
            partneriID: partneri?.kartela?.partneriID,
          },
          authentikimi
        )
        .then((x) => {
          props.setTipiMesazhit("success");
          props.setPershkrimiMesazhit("Partneri u Perditesua me sukses!");
          props.perditesoTeDhenat();
          props.largo();
          props.shfaqmesazhin();
        })
        .catch((error) => {
          console.error("Error saving partneri:", error);
          props.setTipiMesazhit("danger");
          props.setPershkrimiMesazhit(
            "Ndodhi nje gabim gjate perditesimit te karteles!"
          );
          props.perditesoTeDhenat();
          props.shfaqmesazhin();
        });
    } catch (error) {
      console.error(error);
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
      <Modal
        size="lg"
        show={true}
        onHide={() => props.largo()}
        className="sp-modal">
        <Modal.Header closeButton>
          <Modal.Title>Edito Partnerin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            id="editoPartnerin"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="sp-tabs mb-4">
            <Tab eventKey="teDhenat" title="Të Dhënat e Partnerit">
              <div className="sp-form-container p-2">
                <Form>
                  <Row className="g-4 mb-3">
                    <Col md="8">
                      <div className="sp-input-group">
                        <label className="sp-label">Emri i Biznesit / Klientit <span className="text-danger">*</span></label>
                        <Form.Control
                          type="text"
                          name="emriBiznesit"
                          value={partneri.emriBiznesit ?? ""}
                          onChange={onChange}
                          className="sp-input"
                          placeholder="Emri i plotë..."
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Shkurtesa <span className="text-danger">*</span></label>
                        <Form.Control
                          type="text"
                          name="shkurtesaPartnerit"
                          value={partneri.shkurtesaPartnerit ?? ""}
                          onChange={onChange}
                          className="sp-input"
                          placeholder="FC"
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row className="g-4 mb-3">
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">NUI <span className="text-danger">*</span></label>
                        <Form.Control
                          type="number"
                          name="nui"
                          value={partneri.nui ?? ""}
                          onChange={onChange}
                          className="sp-input"
                          placeholder="111222333"
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Nr. Fiskal (NF)</label>
                        <Form.Control
                          type="number"
                          name="nrf"
                          value={partneri.nrf ?? ""}
                          onChange={onChange}
                          className="sp-input"
                          placeholder="Optional..."
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Nr. TVSH</label>
                        <Form.Control
                          type="number"
                          name="tvsh"
                          value={partneri.tvsh ?? ""}
                          onChange={onChange}
                          className="sp-input"
                          placeholder="Optional..."
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row className="g-4 mb-3">
                    <Col md="12">
                      <div className="sp-input-group">
                        <label className="sp-label">Adresa <span className="text-danger">*</span></label>
                        <Form.Control
                          type="text"
                          name="adresa"
                          value={partneri.adresa ?? ""}
                          onChange={onChange}
                          className="sp-input"
                          placeholder="Adresa e plotë..."
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row className="g-4">
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Kontakt</label>
                        <Form.Control
                          type="text"
                          name="nrKontaktit"
                          value={partneri.nrKontaktit ?? ""}
                          onChange={onChange}
                          className="sp-input"
                          placeholder="+383..."
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Email</label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={partneri.email ?? ""}
                          onChange={onChange}
                          className="sp-input"
                          placeholder="email@example.com"
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Lloji i Partnerit <span className="text-danger">*</span></label>
                        <div className="sp-select-container">
                          <Form.Select
                            value={llojiPartnerit}
                            onChange={handleLlojiPartneritChange}
                            className="sp-input">
                            <option hidden disabled value={0}>
                              Zgjedhni Llojin
                            </option>
                            <option value="B">Blerës</option>
                            <option value="F">Furnitorë</option>
                            <option value="B/F">Blerës & Furnitorë</option>
                          </Form.Select>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Tab>
            <Tab eventKey="kartelaRabati" title="Kartela & Rabati">
              <div className="sp-form-container p-2">
                <Row className="g-4">
                  <Col md="6">
                    <div className="sp-input-group">
                      <label className="sp-label">Kodi i Kartelës</label>
                      <Form.Control
                        type="text"
                        value={partneri?.kartela?.kodiKartela ?? ""}
                        disabled
                        className="sp-input"
                        style={{ opacity: 0.6 }}
                      />
                    </div>
                  </Col>
                  <Col md="6">
                    <div className="sp-input-group">
                      <label className="sp-label">Rabati (%)</label>
                      <Form.Control
                        type="number"
                        name="rabati"
                        value={rabati}
                        onChange={handleRabatiChange}
                        className="sp-input"
                        placeholder="0"
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-cancel" onClick={() => props.largo()}>
            Anulo
          </Button>
          <Button
            className="btn-save px-4"
            onClick={(e) =>
              key == "teDhenat" ? handleKontrolli() : PerditesoKartelen()
            }>
            Përditëso Partnerin
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditoKompanin;
