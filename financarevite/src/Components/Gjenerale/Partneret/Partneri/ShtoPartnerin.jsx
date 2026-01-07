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
      <Modal size="lg" show={true} onHide={() => props.largo()}>
        <Modal.Header closeButton>
          <Modal.Title>Shto Partnerin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            id="shenime-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3">
            <Tab eventKey="klientPrivat" title="Klient Privat">
              <Form>
                <Form.Group className="mb-3" controlId="emriBiznesit">
                  <Row>
                    <Col>
                      <Form.Label>
                        Emri<span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Filan"
                        id="emriKP"
                        onChange={(e) => setEmri(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "mbiemriKP");
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>
                        Mbiemri<span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        id="mbiemriKP"
                        type="text"
                        placeholder="Fisteku"
                        onChange={(e) => setMbiemri(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "adresaKP");
                        }}
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="mb-3" controlId="nui">
                  <Row>
                    <Col>
                      <Form.Label>Adresa</Form.Label>
                      <Form.Control
                        type="text"
                        id="adresaKP"
                        placeholder="Rr. B, Lagjja Kalabria, Nr. 56, 10000 Prishtina, Kosovo"
                        onChange={(e) => setAdresa(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "nrKontaktitKP");
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Nr. Kontaktit</Form.Label>
                      <Form.Control
                        id="nrKontaktitKP"
                        type="text"
                        placeholder="+38344111222"
                        onChange={(e) => setNrKontaktit(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "emailKP");
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        id="emailKP"
                        type="text"
                        placeholder="example@email.com"
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "rabatiKP");
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Rabati</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="0"
                        onChange={(e) => setRabati(e.target.value)}
                        onKeyDown={handleMenaxhoTastet}
                        id="rabatiKP"
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Form>
            </Tab>
            <Tab eventKey="klientBiznesi" title="Klient Biznesor">
              <Form>
                <Form.Group className="mb-3" controlId="nui">
                  <Row>
                    <Col>
                      <Form.Label>
                        Emri Biznesit<span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        id="emriKB"
                        type="text"
                        placeholder="FinanCare SH.P.K."
                        onChange={(e) => setEmriPartnerit(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "shkurtesaPartneritKB");
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>
                        Shkurtesa Partnerit
                        <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        id="shkurtesaPartneritKB"
                        type="text"
                        placeholder="FC"
                        onChange={(e) => setShkurtesaEmrit(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "NUIKB");
                        }}
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="mb-3" controlId="nui">
                  <Row>
                    <Col>
                      <Form.Label>
                        Numri Unik Identifikues: NUI
                        <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        id="NUIKB"
                        type="number"
                        placeholder="111222333"
                        onChange={(e) => setNUI(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "NFKB");
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Numri Fiskal: NF / NRF</Form.Label>
                      <Form.Control
                        id="NFKB"
                        type="number"
                        placeholder="111222333"
                        onChange={(e) => setNF(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "TVSHKB");
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Numri TVSH: NRTVSH</Form.Label>
                      <Form.Control
                        id="TVSHKB"
                        type="number"
                        placeholder="111222333"
                        onChange={(e) => setNRTVSH(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "adresaKB");
                        }}
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="mb-3" controlId="nui">
                  <Row>
                    <Col>
                      <Form.Label>
                        Adresa<span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        id="adresaKB"
                        type="text"
                        placeholder="Rr. B, Lagjja Kalabria, Nr. 56, 10000 Prishtina, Kosovo"
                        onChange={(e) => setAdresa(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "nrKontaktitKB");
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Nr. Kontaktit</Form.Label>
                      <Form.Control
                        id="nrKontaktitKB"
                        type="text"
                        placeholder="+38344111222"
                        onChange={(e) => setNrKontaktit(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "emailKB");
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        id="emailKB"
                        type="text"
                        placeholder="example@email.com"
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "rabatiKB");
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Rabati</Form.Label>
                      <Form.Control
                        id="rabatiKB"
                        type="number"
                        placeholder="0"
                        onChange={(e) => setRabati(e.target.value)}
                        onKeyDown={handleMenaxhoTastet}
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Form>
            </Tab>
            <Tab eventKey="furnitor" title="Furnitor">
              <Form>
                <Form.Group className="mb-3" controlId="nui">
                  <Row>
                    <Col>
                      <Form.Label>
                        Emri Biznesit<span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        id="emriF"
                        type="text"
                        placeholder="FinanCare SH.P.K."
                        onChange={(e) => setEmriPartnerit(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "shkurtesaPartneritF");
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>
                        Shkurtesa Partnerit
                        <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        id="shkurtesaPartneritF"
                        type="text"
                        placeholder="FC"
                        onChange={(e) => setShkurtesaEmrit(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "NUIF");
                        }}
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="mb-3" controlId="nui">
                  <Row>
                    <Col>
                      <Form.Label>
                        Numri Unik Identifikues: NUI
                        <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        id="NUIF"
                        type="number"
                        placeholder="111222333"
                        onChange={(e) => setNUI(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "NFF");
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Numri Fiskal: NF / NRF</Form.Label>
                      <Form.Control
                        id="NFF"
                        type="number"
                        placeholder="111222333"
                        onChange={(e) => setNF(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "TVSHF");
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Numri TVSH: NRTVSH</Form.Label>
                      <Form.Control
                        id="TVSHF"
                        type="number"
                        placeholder="111222333"
                        onChange={(e) => setNRTVSH(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "adresaF");
                        }}
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="mb-3" controlId="nui">
                  <Row>
                    <Col>
                      <Form.Label>
                        Adresa<span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        id="adresaF"
                        type="text"
                        placeholder="Rr. B, Lagjja Kalabria, Nr. 56, 10000 Prishtina, Kosovo"
                        onChange={(e) => setAdresa(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "nrKontaktitF");
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Nr. Kontaktit</Form.Label>
                      <Form.Control
                        id="nrKontaktitF"
                        type="text"
                        placeholder="+38344111222"
                        onChange={(e) => setNrKontaktit(e.target.value)}
                        onKeyDown={(e) => {
                          ndrroField(e, "emailF");
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        id="emailF"
                        type="text"
                        placeholder="example@email.com"
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleMenaxhoTastet}
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Form>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => props.largo()}>
            Anulo <FontAwesomeIcon icon={faXmark} />
          </Button>
          <Button
            className="Butoni"
            onClick={(e) =>
              key == "klientPrivat"
                ? ShtoPartnerinBleres(e)
                : ShtoPartnerinFurnitor(e)
            }>
            Shto Partnerin <FontAwesomeIcon icon={faPenToSquare} />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ShtoPartnerin;
