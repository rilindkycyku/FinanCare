import { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  Modal,
  Button,
  Tab,
  Tabs,
  Form,
  Row,
  Col
} from "react-bootstrap";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";
function ShtoPartnerin(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [emri, setEmri] = useState(null);
  const [mbiemri, setMbiemri] = useState(null);
  const [emriPartnerit, setEmriPartnerit] = useState(null);
  const [shkurtesaEmrit, setShkurtesaEmrit] = useState(null);
  const [NUI, setNUI] = useState(null);
  const [NF, setNF] = useState(null);
  const [NRTVSH, setNRTVSH] = useState(null);
  const [adresa, setAdresa] = useState(null);
  const [nrKontaktit, setNrKontaktit] = useState(null);
  const [email, setEmail] = useState(null);
  const [rabati, setRabati] = useState(0);

  const [key, setKey] = useState("klientPrivat");

  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState([]);

  const [perditeso, setPerditeso] = useState(Date.now());
  const [teDhenat, setTeDhenat] = useState([]);

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
        console.log(perdoruesi.data);
      } catch (err) {
        console.log(err);
      }
    };
    vendosTeDhenat();
  }, [perditeso]);

  useEffect(() => {
    const ShfaqTeDhenat = async () => {
      try {
        const teDhenat = await axios.get(
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`,
          authentikimi
        );
        setTeDhenatBiznesit(teDhenat.data);
        console.log(teDhenat.data);
      } catch (err) {
        console.log(err);
      }
    };

    ShfaqTeDhenat();
  }, [perditeso]);

  function isNullOrEmpty(value) {
    return value === null || value === "" || value === undefined;
  }

  function PastroTeDhenat() {
    setEmri(null);
    setMbiemri(null);
    setEmriPartnerit(null);
    setShkurtesaEmrit(null);
    setNUI(null);
    setNF(null);
    setNRTVSH(null);
    setAdresa(null);
    setNrKontaktit(null);
    setEmail(null);
    setRabati(0);
  }

  async function ShtoPartnerinBleres(e) {
    e.preventDefault();

    if (isNullOrEmpty(emri) || isNullOrEmpty(mbiemri)) {
      props.setPershkrimiMesazhit(
        "<strong>Ju lutemi plotesoni te gjitha fushat me *</strong>"
      );
      props.setTipiMesazhit("danger");
      props.shfaqmesazhin();
    } else {
      const telefoniREGEX = /^(?:\+\d{11}|\d{9})$/;

      if (!isNullOrEmpty(nrKontaktit) && !telefoniREGEX.test(nrKontaktit)) {
        props.setPershkrimiMesazhit(
          "Numri telefonit duhet te jete ne formatin: <strong>045123123 ose +38343123132</strong>"
        );
        props.setTipiMesazhit("danger");
        props.shfaqmesazhin();
      } else {
        axios
          .post(
            `${API_BASE_URL}/api/Partneri/shtoPartnerin`,
            {
              emriBiznesit: emri + " " + mbiemri,
              shkurtesaPartnerit: `${emri.charAt(0).toUpperCase()}${mbiemri
                .charAt(0)
                .toUpperCase()}`,
              nui: "0",
              nrf: "0",
              tvsh: "0",
              email: email,
              adresa: adresa,
              nrKontaktit: nrKontaktit,
              llojiPartnerit: "B",
            },
            authentikimi
          )
          .then((response) => {
            axios.post(
              `${API_BASE_URL}/api/Kartelat/ShtoKartelenBonus?idPartneri=${response.data.idPartneri}&stafiID=${teDhenat.perdoruesi.userID}&rabati=${rabati}`,
              {},
              authentikimi
            );
            PastroTeDhenat();
            props.largo();
            props.setPershkrimiMesazhit("Partneri u Shtua me Sukses");
            props.setTipiMesazhit("success");
            props.shfaqmesazhin(true);
            props.perditesoTeDhenat();
          })
          .catch((error) => {
            console.error(error);
            props.setPershkrimiMesazhit(
              "<strong>Ju lutemi kontaktoni me stafin pasi ndodhi nje gabim ne server!</strong>"
            );
            props.setTipiMesazhit("danger");
            props.shfaqmesazhin();
          });
      }
    }
  }

  async function ShtoPartnerinFurnitor(e) {
    e.preventDefault();

    if (
      isNullOrEmpty(emriPartnerit) ||
      isNullOrEmpty(shkurtesaEmrit) ||
      isNullOrEmpty(NUI) ||
      isNullOrEmpty(adresa)
    ) {
      props.setPershkrimiMesazhit(
        "<strong>Ju lutemi plotesoni te gjitha fushat me *</strong>"
      );
      props.setTipiMesazhit("danger");
      props.shfaqmesazhin();
    } else {
      const telefoniREGEX = /^(?:\+\d{11}|\d{9})$/;

      console.log(teDhenatBiznesit);
      if (!isNullOrEmpty(nrKontaktit) && !telefoniREGEX.test(nrKontaktit)) {
        props.setPershkrimiMesazhit(
          "Numri telefonit duhet te jete ne formatin: <strong>045123123 ose +38343123132</strong>"
        );
        props.setTipiMesazhit("danger");
        props.shfaqmesazhin();
      } else {
        axios
          .post(
            `${API_BASE_URL}/api/Partneri/shtoPartnerin`,
            {
              emriBiznesit: emriPartnerit,
              nui: NUI.toString(),
              nrf: NF?.toString() ?? "0",
              tvsh: NRTVSH?.toString() ?? "0",
              email: email,
              adresa: adresa,
              nrKontaktit: nrKontaktit,
              llojiPartnerit: key == "furnitor" ? "F" : "B",
              shkurtesaPartnerit: shkurtesaEmrit,
            },
            authentikimi
          )
          .then((response) => {
            if (key == "klientBiznesi") {
              axios.post(
                `${API_BASE_URL}/api/Kartelat/ShtoKartelenBonus?idPartneri=${response.data.idPartneri}&stafiID=${teDhenat.perdoruesi.userID}&rabati=${rabati}`,
                {},
                authentikimi
              );
            }
            PastroTeDhenat();
            props.largo();
            props.setPershkrimiMesazhit("Partneri u Shtua me Sukses");
            props.setTipiMesazhit("success");
            props.shfaqmesazhin(true);
            props.perditesoTeDhenat();
          })
          .catch((error) => {
            console.error(error);
            props.setPershkrimiMesazhit(
              "<strong>Ju lutemi kontaktoni me stafin pasi ndodhi nje gabim ne server!</strong>"
            );
            props.setTipiMesazhit("danger");
            props.shfaqmesazhin();
          });
      }
    }
  }

  const handleMenaxhoTastet = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      key == "klientPrivat"
        ? ShtoPartnerinBleres(event)
        : ShtoPartnerinFurnitor(event);
    }
  };

  const ndrroField = (e, tjetra) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(tjetra).focus();
    }
  };

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant", "Komercialist", "Pergjegjes i Porosive"]}
        largo={() => props.largo()}
        shfaqmesazhin={() => props.shfaqmesazhin()}
        perditesoTeDhenat={() => props.perditesoTeDhenat()}
        setTipiMesazhit={(e) => props.setTipiMesazhit(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit(e)}
      />
      <Modal size="lg" show={true} onHide={() => props.largo()} className="sp-modal">
        <Modal.Header closeButton>
          <Modal.Title>Shto Partnerin e Ri</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            id="partneri-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="sp-tabs mb-4">
            <Tab eventKey="klientPrivat" title="Klient Privat">
              <div className="sp-form-container p-2">
                <Form>
                  <Row className="g-4 mb-3">
                    <Col md="6">
                      <div className="sp-input-group">
                        <label className="sp-label">Emri <span className="text-danger">*</span></label>
                        <Form.Control
                          type="text"
                          placeholder="Shënoni emrin..."
                          id="emriKP"
                          className="sp-input"
                          onChange={(e) => setEmri(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "mbiemriKP")}
                          autoFocus
                        />
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="sp-input-group">
                        <label className="sp-label">Mbiemri <span className="text-danger">*</span></label>
                        <Form.Control
                          id="mbiemriKP"
                          type="text"
                          placeholder="Shënoni mbiemrin..."
                          className="sp-input"
                          onChange={(e) => setMbiemri(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "adresaKP")}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row className="g-4 mb-3">
                    <Col md="12">
                      <div className="sp-input-group">
                        <label className="sp-label">Adresa</label>
                        <Form.Control
                          type="text"
                          id="adresaKP"
                          className="sp-input"
                          placeholder="Rr. B, Lagjja Kalabria, Nr. 56..."
                          onChange={(e) => setAdresa(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "nrKontaktitKP")}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row className="g-4 mb-2">
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Nr. Kontaktit</label>
                        <Form.Control
                          id="nrKontaktitKP"
                          type="text"
                          className="sp-input"
                          placeholder="+383 4X XXX XXX"
                          onChange={(e) => setNrKontaktit(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "emailKP")}
                        />
                      </div>
                    </Col>
                    <Col md="5">
                      <div className="sp-input-group">
                        <label className="sp-label">Email</label>
                        <Form.Control
                          id="emailKP"
                          type="email"
                          className="sp-input"
                          placeholder="example@email.com"
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "rabatiKP")}
                        />
                      </div>
                    </Col>
                    <Col md="3">
                      <div className="sp-input-group">
                        <label className="sp-label">Rabati %</label>
                        <Form.Control
                          type="number"
                          className="sp-input"
                          placeholder="0"
                          onChange={(e) => setRabati(e.target.value)}
                          onKeyDown={handleMenaxhoTastet}
                          id="rabatiKP"
                        />
                      </div>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Tab>

            <Tab eventKey="klientBiznesi" title="Klient Biznesor">
              <div className="sp-form-container p-2">
                <Form>
                  <Row className="g-4 mb-3">
                    <Col md="8">
                      <div className="sp-input-group">
                        <label className="sp-label">Emri i Biznesit <span className="text-danger">*</span></label>
                        <Form.Control
                          id="emriKB"
                          type="text"
                          className="sp-input"
                          placeholder="Shënoni emrin zyrtar..."
                          onChange={(e) => setEmriPartnerit(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "shkurtesaPartneritKB")}
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Shkurtesa <span className="text-danger">*</span></label>
                        <Form.Control
                          id="shkurtesaPartneritKB"
                          type="text"
                          className="sp-input"
                          placeholder="Psh: FC"
                          onChange={(e) => setShkurtesaEmrit(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "NUIKB")}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row className="g-4 mb-3">
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">NUI <span className="text-danger">*</span></label>
                        <Form.Control
                          id="NUIKB"
                          type="number"
                          className="sp-input"
                          placeholder="81XXXXXXXX"
                          onChange={(e) => setNUI(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "NFKB")}
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Nr. Fiskal (NF)</label>
                        <Form.Control
                          id="NFKB"
                          type="number"
                          className="sp-input"
                          placeholder="NF"
                          onChange={(e) => setNF(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "TVSHKB")}
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Nr. TVSH</label>
                        <Form.Control
                          id="TVSHKB"
                          type="number"
                          className="sp-input"
                          placeholder="Nr. TVSH"
                          onChange={(e) => setNRTVSH(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "adresaKB")}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row className="g-4 mb-3">
                    <Col md="12">
                      <div className="sp-input-group">
                        <label className="sp-label">Adresa <span className="text-danger">*</span></label>
                        <Form.Control
                          id="adresaKB"
                          type="text"
                          className="sp-input"
                          placeholder="Qyteti, Rruga, Nr..."
                          onChange={(e) => setAdresa(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "nrKontaktitKB")}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row className="g-4 mb-2">
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Kontakt</label>
                        <Form.Control
                          id="nrKontaktitKB"
                          type="text"
                          className="sp-input"
                          placeholder="+383 4X XXX XXX"
                          onChange={(e) => setNrKontaktit(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "emailKB")}
                        />
                      </div>
                    </Col>
                    <Col md="5">
                      <div className="sp-input-group">
                        <label className="sp-label">Email</label>
                        <Form.Control
                          id="emailKB"
                          type="email"
                          className="sp-input"
                          placeholder="example@email.com"
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "rabatiKB")}
                        />
                      </div>
                    </Col>
                    <Col md="3">
                      <div className="sp-input-group">
                        <label className="sp-label">Rabati %</label>
                        <Form.Control
                          id="rabatiKB"
                          type="number"
                          className="sp-input"
                          placeholder="0"
                          onChange={(e) => setRabati(e.target.value)}
                          onKeyDown={handleMenaxhoTastet}
                        />
                      </div>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Tab>

            <Tab eventKey="furnitor" title="Furnitorë">
              <div className="sp-form-container p-2">
                <Form>
                  <Row className="g-4 mb-3">
                    <Col md="8">
                      <div className="sp-input-group">
                        <label className="sp-label">Emri i Furnitorit <span className="text-danger">*</span></label>
                        <Form.Control
                          id="emriF"
                          type="text"
                          className="sp-input"
                          placeholder="Emri i Biznesit Furnitor..."
                          onChange={(e) => setEmriPartnerit(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "shkurtesaPartneritF")}
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Shkurtesa <span className="text-danger">*</span></label>
                        <Form.Control
                          id="shkurtesaPartneritF"
                          type="text"
                          className="sp-input"
                          placeholder="Psh: ABC"
                          onChange={(e) => setShkurtesaEmrit(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "NUIF")}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row className="g-4 mb-3">
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">NUI <span className="text-danger">*</span></label>
                        <Form.Control
                          id="NUIF"
                          type="number"
                          className="sp-input"
                          placeholder="81XXXXXXXX"
                          onChange={(e) => setNUI(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "NFF")}
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Nr. Fiskal</label>
                        <Form.Control
                          id="NFF"
                          type="number"
                          className="sp-input"
                          placeholder="NF"
                          onChange={(e) => setNF(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "TVSHF")}
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Nr. TVSH</label>
                        <Form.Control
                          id="TVSHF"
                          type="number"
                          className="sp-input"
                          placeholder="Nr. TVSH"
                          onChange={(e) => setNRTVSH(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "adresaF")}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row className="g-4 mb-3">
                    <Col md="12">
                      <div className="sp-input-group">
                        <label className="sp-label">Adresa <span className="text-danger">*</span></label>
                        <Form.Control
                          id="adresaF"
                          type="text"
                          className="sp-input"
                          placeholder="Adresa e plotë..."
                          onChange={(e) => setAdresa(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "nrKontaktitF")}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row className="g-4 mb-2">
                    <Col md="6">
                      <div className="sp-input-group">
                        <label className="sp-label">Nr. Kontaktit</label>
                        <Form.Control
                          id="nrKontaktitF"
                          type="text"
                          className="sp-input"
                          placeholder="+383 4X XXX XXX"
                          onChange={(e) => setNrKontaktit(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "emailF")}
                        />
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="sp-input-group">
                        <label className="sp-label">Email</label>
                        <Form.Control
                          id="emailF"
                          type="email"
                          className="sp-input"
                          placeholder="example@email.com"
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={handleMenaxhoTastet}
                        />
                      </div>
                    </Col>
                  </Row>
                </Form>
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
              key == "klientPrivat"
                ? ShtoPartnerinBleres(e)
                : ShtoPartnerinFurnitor(e)
            }>
            Shto Partnerin
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ShtoPartnerin;
