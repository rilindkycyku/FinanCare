import { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Form,
  Modal,
  Row,
  Col,
  InputGroup,
  Tabs,
  Tab,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function EditoPerdorues(props) {
  const [perdoruesi, setPerdoruesi] = useState(null);
  const [rolet, setRolet] = useState([]);
  const [bankaOptions, setBankaOptions] = useState([]);
  const [roletOptions, setRoletOptions] = useState([]);
  const [selectedBanka, setSelectedBanka] = useState(null);
  const [selectedRoli, setSelectedRoli] = useState(null);
  const [key, setKey] = useState("kryesore");

  const getToken = localStorage.getItem("token");
  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const fetchPerdoruesi = async () => {
      try {
        const response = await axios.get(
          `https://localhost:7285/api/Perdoruesi/shfaqSipasID?idUserAspNet=${props.id}`,
          authentikimi
        );
        setPerdoruesi(response.data);
        console.log(response.data);

        // Set selected options based on fetched data
        setSelectedBanka(
          bankaOptions.find(
            (option) =>
              option.value ==
              response.data.perdoruesi.teDhenatPerdoruesit.bankaID
          )
        );
        const filteredRoles = response.data.rolet.filter(
          (role) => role !== "User"
        );
        const lastRole =
          filteredRoles.length > 0
            ? filteredRoles[filteredRoles.length - 1]
            : null;

        setSelectedRoli(
          roletOptions.find((option) => option.value === lastRole)
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchPerdoruesi();
  }, [props.id, bankaOptions, roletOptions]); // Added dependencies to ensure data is fetched correctly

  useEffect(() => {
    const fetchBankat = async () => {
      try {
        const response = await axios.get(
          "https://localhost:7285/api/TeDhenatBiznesit/ShfaqBankat",
          authentikimi
        );
        setBankaOptions(
          response.data.map((item) => ({
            value: item.bankaID,
            label: item.emriBankes,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchBankat();
  }, []); // Fetch bankat only once

  useEffect(() => {
    const fetchRolet = async () => {
      try {
        const response = await axios.get(
          "https://localhost:7285/api/Authenticate/shfaqRolet",
          authentikimi
        );
        setRoletOptions(
          response.data
            .filter((item) => item.name !== "User")
            .map((item) => ({
              value: item.name,
              label: item.name,
            }))
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchRolet();
  }, []); // Fetch rolet only once

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      zIndex: 1050, // Ensure this is higher than the z-index of the thead
    }),
  };

  const handleChange = (field, value) => {
    if (field in perdoruesi.perdoruesi) {
      setPerdoruesi((prev) => ({
        ...prev,
        perdoruesi: {
          ...prev.perdoruesi,
          [field]: value, // Updates top-level fields like 'emri', 'mbiemri'
        },
      }));
    } else {
      setPerdoruesi((prev) => ({
        ...prev,
        perdoruesi: {
          ...prev.perdoruesi,
          teDhenatPerdoruesit: {
            ...prev.perdoruesi.teDhenatPerdoruesit,
            [field]: value, // Updates nested fields inside 'teDhenatPerdoruesit'
          },
        },
      }));
    }
  };

  const handleResetoPasswordin = async () => {
    try {
      await axios.post(
        `https://localhost:7285/api/Authenticate/ResetoFjalekalimin?AspNetID=${props.id}`,
        {},
        authentikimi
      ).then((r) =>  props.setPershkrimiMesazhit(
        "<strong>Password u resetua me sukses</strong>" +
          "<br> </br>" +
          `<p><strong>Email:</strong> ${
            r.data.email
          }</p>` +
          `<p><strong>Username:</strong> ${
            r.data.username
          }</p>` +
          `<p><strong>Password:</strong> ${
            r.data.passwordiGjeneruar
          }</p>`
      ));
      props.perditesoTeDhenat();
      props.largo();
      props.setTipiMesazhit("success");
      props.shfaqmesazhin();
    } catch (error) {
      console.log(error);
      props.perditesoTeDhenat();
      props.largo();
      props.setTipiMesazhit("danger");
      props.setPershkrimiMesazhit(
        "Ndodhi nje gabim gjate perditesimit te aksesit!"
      );
      props.shfaqmesazhin();
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.put(
        `https://localhost:7285/api/Perdoruesi/perditesoPerdorues/${props.id}`,
        perdoruesi.perdoruesi,
        authentikimi
      );
      await axios.put(
        `https://localhost:7285/api/Authenticate/PerditesoAksesin?UserID=${props.id}&roli=${selectedRoli.value}`,
        {},
        authentikimi
      );
      props.perditesoTeDhenat();
      props.largo();
      props.setTipiMesazhit("success");
      props.setPershkrimiMesazhit("Perdoruesi u perditesua!");
      props.shfaqmesazhin();
    } catch (error) {
      console.log(error);
      props.perditesoTeDhenat();
      props.largo();
      props.setTipiMesazhit("danger");
      props.setPershkrimiMesazhit(
        "Ndodhi nje gabim gjate perditesimit te aksesit!"
      );
      props.shfaqmesazhin();
    }
  };

  if (!perdoruesi) {
    return;
  }

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
      <Modal
        size="lg"
        className="modalEditShto"
        show={true}
        onHide={() => props.largo()}>
        <Modal.Header closeButton>
          <Modal.Title>Edito Perdoruesin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            id="shenime-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-3">
            <Tab eventKey="kryesore" title="Shënimet Kryesore">
              <Form>
                <Form.Group className="mb-3" controlId="emriBiznesit">
                  <Row>
                    <Col>
                      <Form.Label>Emri</Form.Label>
                      <Form.Control
                        type="text"
                        value={perdoruesi?.perdoruesi?.emri}
                        onChange={(e) => handleChange("emri", e.target.value)}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Mbiemri</Form.Label>
                      <Form.Control
                        type="text"
                        value={perdoruesi?.perdoruesi?.mbiemri}
                        onChange={(e) =>
                          handleChange("mbiemri", e.target.value)
                        }
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group className="mb-3" controlId="dataKontrates">
                  <Row>
                    <Col>
                      <Form.Label>Data e fillimit te kontrates</Form.Label>
                      <DatePicker
                        selected={
                          new Date(
                            perdoruesi?.perdoruesi?.teDhenatPerdoruesit.dataFillimitKontrates
                          )
                        }
                        onChange={(date) =>
                          handleChange(
                            "dataFillimitKontrates",
                            date.toISOString()
                          )
                        }
                        dateFormat="dd/MM/yyyy"
                        className="custom-datepicker"
                      />
                    </Col>
                    <Col>
                      <Form.Label>Data e mbarimit te kontrates</Form.Label>
                      <DatePicker
                        selected={
                          new Date(
                            perdoruesi?.perdoruesi?.teDhenatPerdoruesit.dataMbarimitKontrates
                          )
                        }
                        onChange={(date) =>
                          handleChange(
                            "dataMbarimitKontrates",
                            date.toISOString()
                          )
                        }
                        dateFormat="dd/MM/yyyy"
                        className="custom-datepicker"
                        minDate={
                          new Date(
                            perdoruesi?.perdoruesi?.teDhenatPerdoruesit.dataFillimitKontrates
                          )
                        }
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group className="mb-3" controlId="nrPersonal">
                  <Row>
                    <Col>
                      <Form.Label>Nr. Leternjoftimit</Form.Label>
                      <Form.Control
                        type="number"
                        value={
                          perdoruesi?.perdoruesi?.teDhenatPerdoruesit.nrPersonal
                        }
                        onChange={(e) =>
                          handleChange("nrPersonal", e.target.value)
                        }
                      />
                    </Col>
                    <Col>
                      <Form.Label>Paga Bruto</Form.Label>
                      <InputGroup className="mb-3">
                        <Form.Control
                          type="number"
                          value={
                            perdoruesi?.perdoruesi?.teDhenatPerdoruesit.paga
                          }
                          onChange={(e) => handleChange("paga", e.target.value)}
                        />
                        <InputGroup.Text id="basic-addon2">€</InputGroup.Text>
                      </InputGroup>
                    </Col>
                    <Col>
                      <Form.Label>Pozita</Form.Label>
                      <Select
                        value={selectedRoli}
                        onChange={(option) => {
                          setSelectedRoli(option);
                        }}
                        options={roletOptions}
                        styles={customStyles}
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Form>
            </Tab>

            <Tab eventKey="ndihmese" title="Shënimet Ndihmëse">
              <Form>
                <Form.Group className="mb-3" controlId="adresa">
                  <Row>
                    <Col>
                      <Form.Label>Adresa</Form.Label>
                      <Form.Control
                        type="text"
                        value={
                          perdoruesi?.perdoruesi?.teDhenatPerdoruesit.adresa
                        }
                        onChange={(e) => handleChange("adresa", e.target.value)}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Datelindja</Form.Label>
                      <DatePicker
                        selected={
                          new Date(
                            perdoruesi?.perdoruesi?.teDhenatPerdoruesit.datelindja
                          )
                        }
                        onChange={(date) =>
                          handleChange("datelindja", date.toISOString())
                        }
                        dateFormat="dd/MM/yyyy"
                        className="custom-datepicker"
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group className="mb-3" controlId="kontaktEmail">
                  <Row>
                    <Col>
                      <Form.Label>Nr. Kontaktit</Form.Label>
                      <Form.Control
                        type="text"
                        value={
                          perdoruesi?.perdoruesi?.teDhenatPerdoruesit
                            .nrKontaktit
                        }
                        onChange={(e) =>
                          handleChange("nrKontaktit", e.target.value)
                        }
                      />
                    </Col>
                    <Col>
                      <Form.Label>Email Privat</Form.Label>
                      <Form.Control
                        type="text"
                        value={
                          perdoruesi?.perdoruesi?.teDhenatPerdoruesit
                            .emailPrivat
                        }
                        onChange={(e) =>
                          handleChange("emailPrivat", e.target.value)
                        }
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group className="mb-3" controlId="kualifikimet">
                  <Row>
                    <Col>
                      <Form.Label>Profesioni</Form.Label>
                      <Form.Control
                        type="text"
                        value={
                          perdoruesi?.perdoruesi?.teDhenatPerdoruesit.profesioni
                        }
                        onChange={(e) =>
                          handleChange("profesioni", e.target.value)
                        }
                      />
                    </Col>
                    <Col>
                      <Form.Label>Specializimi</Form.Label>
                      <Form.Control
                        type="text"
                        value={
                          perdoruesi?.perdoruesi?.teDhenatPerdoruesit
                            .specializimi
                        }
                        onChange={(e) =>
                          handleChange("specializimi", e.target.value)
                        }
                      />
                    </Col>
                    <Col>
                      <Form.Label>Kualifikimi</Form.Label>
                      <Form.Control
                        type="text"
                        value={
                          perdoruesi?.perdoruesi?.teDhenatPerdoruesit
                            .kualifikimi
                        }
                        onChange={(e) =>
                          handleChange("kualifikimi", e.target.value)
                        }
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <Form.Group className="mb-3" controlId="banka">
                  <Row>
                    <Col>
                      <Form.Label>Banka</Form.Label>
                      <Select
                        value={selectedBanka}
                        onChange={(option) => {
                          setSelectedBanka(option);
                          handleChange("bankaID", option.value);
                        }}
                        options={bankaOptions}
                        styles={customStyles}
                      />
                    </Col>
                    <Col>
                      <Form.Label>Nr. Llogaris Bankare</Form.Label>
                      <Form.Control
                        type="number"
                        value={
                          perdoruesi?.perdoruesi?.teDhenatPerdoruesit
                            .numriLlogarisBankare
                        }
                        onChange={(e) =>
                          handleChange("numriLlogarisBankare", e.target.value)
                        }
                      />
                    </Col>
                    <Col>
                      <Form.Label>Statusi Puntorit</Form.Label>
                      <Form.Check
                        type="checkbox"
                        id="eshtePuntorAktiv"
                        label="Eshte puntor aktiv"
                        checked={
                          perdoruesi?.perdoruesi?.teDhenatPerdoruesit
                            ?.eshtePuntorAktive === "true"
                        }
                        onChange={(e) =>
                          handleChange(
                            "eshtePuntorAktive",
                            e.target.checked ? "true" : "false"
                          )
                        }
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Form>
            </Tab>

            <Tab eventKey="fjalekalimi" title="Fjalëkalimi">
              <div>
                <p>
                  Kjo do të rivendosë fjalëkalimin për përdoruesin në një
                  fjalëkalim të paracaktuar. Ju lutemi, sigurohuni që përdoruesi
                  ta ndryshojë fjalëkalimin pas rivendosjes.
                </p>
                <Button
                  variant="danger"
                  onClick={() => handleResetoPasswordin()}>
                  Rivendos Fjalëkalimin
                </Button>
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => props.largo()}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditoPerdorues;
