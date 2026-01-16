import { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Form, Col, Button, Modal, Tabs, Tab } from "react-bootstrap";
import { MDBRow, MDBCol, MDBInput, MDBTooltip } from "mdb-react-ui-kit";
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
        className="modalEditShto"
        show={true}
        onHide={() => props.largo()}>
        <Modal.Header closeButton>
          <Modal.Title>Edito Partnerin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            id="editoPartnerin"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3">
            <Tab eventKey="teDhenat" title="Te Dhenat Partnerit">
              <MDBRow className="g-3">
                <MDBCol md="6">
                  <MDBInput
                    value={partneri.emriBiznesit ?? ""}
                    name="emriBiznesit"
                    onChange={onChange}
                    id="validationCustom01"
                    label={
                      <span>
                        Emri i Biznesit / Klientit / Parnerit
                        <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                  />
                </MDBCol>
                <MDBCol md="4">
                  <MDBTooltip
                    placement="bottom"
                    title="Perderoni inicialet per klient te thejshte"
                    wrapperClass="mdb-tooltip mdb-tooltip-content">
                    <MDBInput
                      value={partneri.shkurtesaPartnerit ?? ""}
                      name="shkurtesaPartnerit"
                      onChange={onChange}
                      id="validationCustom03"
                      label={
                        <span>
                          Shkurtesa e Partnerit
                          <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                    />
                  </MDBTooltip>
                </MDBCol>
                <MDBCol md="4">
                  <MDBTooltip
                    placement="bottom"
                    title="Vendosni 0 per klient te thejshte"
                    wrapperClass="mdb-tooltip mdb-tooltip-content">
                    <MDBInput
                      value={partneri.nui ?? ""}
                      name="nui"
                      onChange={onChange}
                      id="validationCustom03"
                      label={
                        <span>
                          Numri Unik Identifikues: NUI
                          <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                    />
                  </MDBTooltip>
                </MDBCol>
                <MDBCol md="4">
                  <MDBInput
                    value={partneri.nrf ?? ""}
                    name="nrf"
                    onChange={onChange}
                    id="validationCustom03"
                    label="Numri Fiskal: NF / NRF"
                  />
                </MDBCol>
                <MDBCol md="4">
                  <MDBInput
                    value={partneri.tvsh ?? ""}
                    name="tvsh"
                    onChange={onChange}
                    id="validationCustom03"
                    label="Numri TVSH: NRTVSH"
                  />
                </MDBCol>
                <MDBCol md="4">
                  <MDBInput
                    value={partneri.email ?? ""}
                    name="email"
                    onChange={onChange}
                    id="validationCustom02"
                    label="Email"
                  />
                </MDBCol>
                <MDBCol md="6">
                  <MDBInput
                    value={partneri.adresa ?? ""}
                    name="adresa"
                    onChange={onChange}
                    id="validationCustom03"
                    label={
                      <span>
                        Adresa<span style={{ color: "red" }}>*</span>
                      </span>
                    }
                  />
                </MDBCol>
                <MDBCol md="4">
                  <MDBInput
                    value={partneri.nrKontaktit ?? ""}
                    name="nrKontaktit"
                    onChange={onChange}
                    id="validationCustom05"
                    label="Numri i Kontaktit"
                  />
                </MDBCol>
                <Form.Group as={Col} className="p-0" controlId="formGridState">
                  <Form.Select
                    value={llojiPartnerit}
                    onChange={handleLlojiPartneritChange}>
                    <option hidden disabled value={0}>
                      Zgjedhni Llojin e Partnerit
                    </option>
                    <option value="B">Bleres</option>
                    <option value="F">Furnitore</option>
                    <option value="B/F">Bleres & Furnitore</option>
                  </Form.Select>
                  <Form.Label>
                    {
                      <span>
                        Lloji i Partnerit<span style={{ color: "red" }}>*</span>
                      </span>
                    }
                  </Form.Label>
                </Form.Group>
              </MDBRow>
            </Tab>
            <Tab eventKey="kartelaRabati" title="Kartela - Rabati">
              <MDBRow>
                <MDBCol md="6">
                  <MDBInput
                    value={partneri?.kartela?.kodiKartela ?? ""}
                    name="adresa"
                    id="validationCustom03"
                    disabled
                    label={
                      <span>
                        Kartela<span style={{ color: "red" }}>*</span>
                      </span>
                    }
                  />
                </MDBCol>
                <MDBCol md="6">
                  <MDBInput
                    value={rabati}
                    name="rabati"
                    onChange={handleRabatiChange}
                    id="validationCustom05"
                    label="Rabati %"
                  />
                </MDBCol>
              </MDBRow>
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
              key == "teDhenat" ? handleKontrolli() : PerditesoKartelen()
            }>
            Edito Partnerin <FontAwesomeIcon icon={faPenToSquare} />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditoKompanin;
