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
  InputGroup,
  Row,
  Col
} from "react-bootstrap";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Styles/costumStyles.css";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function ShtoPerdorues(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [emri, setEmri] = useState(null);
  const [mbiemri, setMbiemri] = useState(null);
  const [dataFillimitKontrates, setDataFillimitKontrates] = useState(null);
  const [dataMbarimitKontrates, setDataMbarimitKontrates] =  useState(null);
  const [nrLeternjoftimit, setNrLeternjoftimit] = useState("1122334455");
  const [pagaBruto, setPagaBruto] = useState(99999.99);
  const [adresa, setAdresa] = useState("P.A.");
  const [dataLindjes, setDataLindjes] =  useState(null);
  const [nrKontaktit, setNrKontaktit] = useState("+38344123456");
  const [emailPrivat, setEmailPrivat] = useState("email@domain.com");
  const [profesioni, setProfesioni] = useState("P.P.");
  const [specializimi, setSpecializimi] = useState("P.S.");
  const [kualifikimi, setKualifikimi] = useState("P.K.");
  const [bankaID, setBankaID] = useState(0);
  const [nrLlogarisBankare, setNrLlogarisBankare] = useState("1290012345678900");
  const [eshtePuntorAktiv, setEshtePuntorAktiv] = useState(true);
  const [roli, setRoli] = useState();

  const [key, setKey] = useState("kryesore");

  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState([]);
  const [perditeso, setPerditeso] = useState("");

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

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

  const [options, setOptions] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
  const [optionsRolet, setOptionsRolet] = useState([]);
  const [optionsSelectedRolet, setOptionsSelectedRolet] = useState(null);
  const customStyles = {
    menu: (provided) => ({
      ...provided,
      zIndex: 1050, // Ensure this is higher than the z-index of the thead
    }),
  };
  useEffect(() => {
    axios
      .get(
        `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqBankat`,
        authentikimi
      )
      .then((response) => {
        const fetchedoptions = response.data.map((item) => ({
          value: item.bankaID,
          label: item.emriBankes,
        }));
        setOptions(fetchedoptions);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });

    axios
      .get(`${API_BASE_URL}/api/Authenticate/shfaqRolet`, authentikimi)
      .then((response) => {
        const fetchedoptions = response.data
          .filter((item) => item.name != "User")
          .map((item) => ({
            value: item.name,
            label: item.name,
          }));
        setOptionsRolet(fetchedoptions);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleChangeBanka = async (partneri) => {
    setBankaID(partneri.value);
    setOptionsSelected(partneri);
  };

  const handleChangeRolet = async (partneri) => {
    setRoli(partneri.value);
    setOptionsSelectedRolet(partneri);
  };

  function isNullOrEmpty(value) {
    return value === null || value === "" || value === undefined;
  }

  function PastroTeDhenat() {
    setEmri(null);
    setMbiemri(null);
    setDataFillimitKontrates(null);
    setDataMbarimitKontrates(null);
    setNrLeternjoftimit(null);
    setPagaBruto(null);
    setAdresa(null);
    setDataLindjes(null);
    setNrKontaktit(null);
    setEmailPrivat(null);
    setProfesioni(null);
    setSpecializimi(null);
    setKualifikimi(null);
    setBankaID(0);
    setNrLlogarisBankare(null);
    setEshtePuntorAktiv(false);
    setRoli(null);
  }

  async function CreateAcc(e) {
    e.preventDefault();

    if (isNullOrEmpty(emri) || isNullOrEmpty(mbiemri)) {
      props.setPershkrimiMesazhit(
        "<strong>Ju lutemi plotesoni te gjitha fushat me *</strong>"
      );
      props.setTipiMesazhit("danger");
      props.shfaqmesazhin();
    } else {
      const gjeneroTeDhenatPerHyrje = await axios.get(
        `${API_BASE_URL}/api/Perdoruesi/GjeneroTeDhenatPerHyrje?e=${emri}&m=${mbiemri}&domain=${
          teDhenatBiznesit && teDhenatBiznesit.emailDomain
        }`,
        authentikimi
      );
      const telefoniREGEX = /^(?:\+\d{11}|\d{9})$/;

      console.log(teDhenatBiznesit);
      console.log(gjeneroTeDhenatPerHyrje);
      if (!isNullOrEmpty(nrKontaktit) && !telefoniREGEX.test(nrKontaktit)) {
        props.setPershkrimiMesazhit(
          "Numri telefonit duhet te jete ne formatin: <strong>045123123 ose +38343123132</strong>"
        );
        props.setTipiMesazhit("danger");
        props.shfaqmesazhin();
      } else {
        console.log({
          name: emri,
          lastName: mbiemri,
          email:
            gjeneroTeDhenatPerHyrje &&
            gjeneroTeDhenatPerHyrje.data.emailGjeneruar,
          username:
            gjeneroTeDhenatPerHyrje &&
            gjeneroTeDhenatPerHyrje.data.usernameGjeneruar,
          password:
            gjeneroTeDhenatPerHyrje &&
            gjeneroTeDhenatPerHyrje.data.passwordiGjeneruar,
          nrTelefonit: nrKontaktit,
          adresa: adresa,
          emailPrivat: emailPrivat,
          datelindja: dataLindjes.toISOString(),
          dataFillimitKontrates: dataFillimitKontrates.toISOString(),
          dataMbarimitKontrates: dataMbarimitKontrates.toISOString(),
          paga: pagaBruto,
          profesioni: profesioni,
          specializimi: specializimi,
          kualifikimi: kualifikimi,
          bankaID: bankaID,
          numriLlogarisBankare: nrLlogarisBankare,
          nrPersonal: nrLeternjoftimit,
          eshtePuntorAktive: eshtePuntorAktiv.toString(),
          roli: roli,
        });
        axios
          .post(
            `${API_BASE_URL}/api/Authenticate/register`,
            {
              name: emri,
              lastName: mbiemri,
              email:
                gjeneroTeDhenatPerHyrje &&
                gjeneroTeDhenatPerHyrje.data.emailGjeneruar,
              username:
                gjeneroTeDhenatPerHyrje &&
                gjeneroTeDhenatPerHyrje.data.usernameGjeneruar,
              password:
                gjeneroTeDhenatPerHyrje &&
                gjeneroTeDhenatPerHyrje.data.passwordiGjeneruar,
              nrTelefonit: nrKontaktit,
              adresa: adresa,
              emailPrivat: emailPrivat,
              datelindja: dataLindjes.toISOString(),
              dataFillimitKontrates: dataFillimitKontrates.toISOString(),
              dataMbarimitKontrates: dataMbarimitKontrates.toISOString(),
              paga: pagaBruto,
              profesioni: profesioni,
              specializimi: specializimi,
              kualifikimi: kualifikimi,
              bankaID: bankaID,
              numriLlogarisBankare: nrLlogarisBankare,
              nrPersonal: nrLeternjoftimit,
              eshtePuntorAktive: eshtePuntorAktiv.toString(),
              roli: roli,
            },
            authentikimi
          )
          .then(() => {
            PastroTeDhenat();
            props.largo();
            props.setPershkrimiMesazhit(
              "<strong>Llogaria u krijua me sukses</strong>" +
                "<br> </br>" +
                `<p><strong>Email:</strong> ${
                  gjeneroTeDhenatPerHyrje &&
                  gjeneroTeDhenatPerHyrje.data.emailGjeneruar
                }</p>` +
                `<p><strong>Username:</strong> ${
                  gjeneroTeDhenatPerHyrje &&
                  gjeneroTeDhenatPerHyrje.data.usernameGjeneruar
                }</p>` +
                `<p><strong>Password:</strong> ${
                  gjeneroTeDhenatPerHyrje &&
                  gjeneroTeDhenatPerHyrje.data.passwordiGjeneruar
                }</p>`
            );
            props.setTipiMesazhit("success");
            props.shfaqmesazhin();
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

  useEffect(() => {
    console.log(dataFillimitKontrates)
  }, [dataFillimitKontrates]);

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Burime Njerzore"]}
        largo={() => props.largo()}
        shfaqmesazhin={() => props.shfaqmesazhin()}
        perditesoTeDhenat={() => props.perditesoTeDhenat()}
        setTipiMesazhit={(e) => props.setTipiMesazhit(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit(e)}
      />
      <Modal size="lg" show={true} onHide={() => props.largo()}>
        <Modal.Header closeButton>
          <Modal.Title>Shto Perdoruesin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            id="shenime-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3">
            {/* Shënimet Kryesore */}
            <Tab eventKey="kryesore" title="Shënimet Kryesore">
              <Form>
                <Form.Group className="mb-3" controlId="emriBiznesit">
                  <Row>
                    <Col>
                      <Form.Label>Emri</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Filan"
                        onChange={(e) => setEmri(e.target.value)}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Mbiemri</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Fisteku"
                        onChange={(e) => setMbiemri(e.target.value)}
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group className="mb-3" controlId="adresa">
                  <Row>
                    <Col>
                      <Form.Label>Data e fillimit te kontrates</Form.Label>
                      <DatePicker
                        selected={dataFillimitKontrates}
                        onChange={setDataFillimitKontrates}
                        dateFormat="dd/MM/yyyy"
                        className="custom-datepicker"
                        popperClassName="custom-datepicker-popper"
                        maxDate={dataMbarimitKontrates}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Data e mbarimit te kontrates</Form.Label>
                      <DatePicker
                        selected={dataMbarimitKontrates}
                        onChange={setDataMbarimitKontrates}
                        dateFormat="dd/MM/yyyy"
                        className="custom-datepicker"
                        popperClassName="custom-datepicker-popper"
                        minDate={dataFillimitKontrates}
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="mb-3" controlId="adresa">
                  <Row>
                    <Col>
                      <Form.Label>Nr. Leternjoftimit</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="1173127843"
                        onChange={(e) => setNrLeternjoftimit(e.target.value)}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Paga Bruto</Form.Label>
                      <InputGroup className="mb-3">
                        <Form.Control
                          type="number"
                          placeholder="750.00"
                          onChange={(e) => setPagaBruto(e.target.value)}
                        />
                        <InputGroup.Text id="basic-addon2">€</InputGroup.Text>
                      </InputGroup>
                    </Col>
                    <Col>
                      <Form.Label>Pozita</Form.Label>
                      <Select
                        value={optionsSelectedRolet}
                        onChange={handleChangeRolet}
                        options={optionsRolet}
                        id="produktiSelect" // Setting the id attribute
                        inputId="produktiSelect-input" // Setting the input id attribute
                        styles={customStyles}
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Form>
            </Tab>

            {/* Shënimet Ndihmëse */}
            <Tab eventKey="ndihmese" title="Shënimet Ndihmëse">
              <Form>
                <Form.Group className="mb-3" controlId="nui">
                  <Row>
                    <Col>
                      <Form.Label>Adresa</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Rr. B, Lagjja Kalabria, Nr. 56, 10000 Prishtina, Kosovo"
                        onChange={(e) => setAdresa(e.target.value)}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Datelindja</Form.Label>
                      <br />
                      <DatePicker
                        selected={dataLindjes}
                        onChange={setDataLindjes}
                        dateFormat="dd/MM/yyyy"
                        className="custom-datepicker"
                        popperClassName="custom-datepicker-popper"
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="mb-3" controlId="nui">
                  <Row>
                    <Col>
                      <Form.Label>Nr. Kontaktit</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="+38344111222"
                        onChange={(e) => setNrKontaktit(e.target.value)}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Email Privat</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="example@email.com"
                        onChange={(e) => setEmailPrivat(e.target.value)}
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="mb-3" controlId="nui">
                  <Row>
                    <Col>
                      <Form.Label>Profesioni</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Menaxher Dyqani"
                        onChange={(e) => setProfesioni(e.target.value)}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Specializimi</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Menaxhim në Shitje me Pakicë"
                        onChange={(e) => setSpecializimi(e.target.value)}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Kualifikimi</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Diplomë në Menaxhim Biznesi, Certifikim në Operacione të Shitjes me Pakicë"
                        onChange={(e) => setKualifikimi(e.target.value)}
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="mb-3" controlId="nui">
                  <Row>
                    <Col>
                      <Form.Label>Banka</Form.Label>
                      <Select
                        value={optionsSelected}
                        onChange={handleChangeBanka}
                        options={options}
                        id="produktiSelect" // Setting the id attribute
                        inputId="produktiSelect-input" // Setting the input id attribute
                        styles={customStyles}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Nr. Llogaris Bankare</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="1300001500005275"
                        onChange={(e) => setNrLlogarisBankare(e.target.value)}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Statusi Puntorit</Form.Label>
                      <Form.Check // prettier-ignore
                        type="checkbox"
                        id={`eshtePuntorAktiv`}
                        label="Eshte puntor aktiv"
                        checked={eshtePuntorAktiv}
                        onChange={(e) => setEshtePuntorAktiv(e.target.checked)}
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
          <Button className="Butoni" onClick={CreateAcc}>
            Shto Perdoruesin <FontAwesomeIcon icon={faPenToSquare} />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ShtoPerdorues;
