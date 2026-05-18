import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Button,
  Form,
  Modal,
  Row,
  Col,
  Tabs,
  Tab
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function EditoPerdorues(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [perdoruesi, setPerdoruesi] = useState(null);
  const [rolet, setRolet] = useState([]);
  const [bankaOptions, setBankaOptions] = useState([]);
  const [roletOptions, setRoletOptions] = useState([]);
  const [selectedBanka, setSelectedBanka] = useState(null);
  const [selectedRoli, setSelectedRoli] = useState(null);
  const [key, setKey] = useState("kryesore");

  const getToken = localStorage.getItem("token");
  const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

  useEffect(() => {
    const fetchPerdoruesi = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${props.id}`,
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
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqBankat`,
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
          `${API_BASE_URL}/api/Authenticate/shfaqRolet`,
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
        `${API_BASE_URL}/api/Authenticate/ResetoFjalekalimin?AspNetID=${props.id}`,
        {},
        authentikimi
      ).then((r) => props.setPershkrimiMesazhit(
        "<strong>Password u resetua me sukses</strong>" +
        "<br> </br>" +
        `<p><strong>Email:</strong> ${r.data.email
        }</p>` +
        `<p><strong>Username:</strong> ${r.data.username
        }</p>` +
        `<p><strong>Password:</strong> ${r.data.passwordiGjeneruar
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
        `${API_BASE_URL}/api/Perdoruesi/perditesoPerdorues/${props.id}`,
        perdoruesi.perdoruesi,
        authentikimi
      );
      await axios.put(
        `${API_BASE_URL}/api/Authenticate/PerditesoAksesin?UserID=${props.id}&roli=${selectedRoli.value}`,
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
        roletELejuara={["Menaxher", "Burime Njerzore", "1 Euro Menaxher"]}
        largo={() => props.largo()}
        shfaqmesazhin={() => props.shfaqmesazhin()}
        perditesoTeDhenat={() => props.perditesoTeDhenat()}
        setTipiMesazhit={(e) => props.setTipiMesazhit(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit(e)}
      />
      <Modal
        size="lg"
        show={true}
        onHide={() => props.largo()}
        className="sp-modal">
        <Modal.Header closeButton>
          <Modal.Title>Edito Përdoruesin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            id="shenime-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="sp-tabs mb-4">
            <Tab eventKey="kryesore" title="Shënimet Kryesore">
              <div className="sp-form-container p-2">
                <Form>
                  <Row className="g-4 mb-3">
                    <Col md="6">
                      <div className="sp-input-group">
                        <label className="sp-label">Emri <span className="text-danger">*</span></label>
                        <Form.Control
                          type="text"
                          value={perdoruesi?.perdoruesi?.emri}
                          onChange={(e) => handleChange("emri", e.target.value)}
                          className="sp-input"
                        />
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="sp-input-group">
                        <label className="sp-label">Mbiemri <span className="text-danger">*</span></label>
                        <Form.Control
                          type="text"
                          value={perdoruesi?.perdoruesi?.mbiemri}
                          onChange={(e) =>
                            handleChange("mbiemri", e.target.value)
                          }
                          className="sp-input"
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row className="g-4 mb-3">
                    <Col md="6">
                      <div className="sp-input-group">
                        <label className="sp-label">Fillimi i Kontratës</label>
                        <div className="sp-datepicker-wrapper">
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
                            className="sp-input w-100"
                            popperClassName="sp-datepicker-popper"
                          />
                        </div>
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="sp-input-group">
                        <label className="sp-label">Mbarimi i Kontratës</label>
                        <div className="sp-datepicker-wrapper">
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
                            className="sp-input w-100"
                            popperClassName="sp-datepicker-popper"
                            minDate={
                              new Date(
                                perdoruesi?.perdoruesi?.teDhenatPerdoruesit.dataFillimitKontrates
                              )
                            }
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Row className="g-4 mb-1">
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Nr. Letërnjoftimit</label>
                        <Form.Control
                          type="number"
                          value={
                            perdoruesi?.perdoruesi?.teDhenatPerdoruesit.nrPersonal
                          }
                          onChange={(e) =>
                            handleChange("nrPersonal", e.target.value)
                          }
                          className="sp-input"
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Paga Bruto (€)</label>
                        <Form.Control
                          type="number"
                          value={
                            perdoruesi?.perdoruesi?.teDhenatPerdoruesit.paga
                          }
                          onChange={(e) => handleChange("paga", e.target.value)}
                          className="sp-input"
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Pozita / Roli <span className="text-danger">*</span></label>
                        <div className="sp-select-container">
                          <Select
                            value={selectedRoli}
                            onChange={(option) => {
                              setSelectedRoli(option);
                            }}
                            options={roletOptions}
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
                </Form>
              </div>
            </Tab>

            <Tab eventKey="ndihmese" title="Shënimet Ndihmëse">
              <div className="sp-form-container p-2">
                <Form>
                  <Row className="g-4 mb-3">
                    <Col md="8">
                      <div className="sp-input-group">
                        <label className="sp-label">Adresa</label>
                        <Form.Control
                          type="text"
                          value={
                            perdoruesi?.perdoruesi?.teDhenatPerdoruesit.adresa
                          }
                          onChange={(e) => handleChange("adresa", e.target.value)}
                          className="sp-input"
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Datëlindja</label>
                        <div className="sp-datepicker-wrapper">
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
                            className="sp-input w-100"
                            popperClassName="sp-datepicker-popper"
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Row className="g-4 mb-3">
                    <Col md="6">
                      <div className="sp-input-group">
                        <label className="sp-label">Nr. Kontaktit</label>
                        <Form.Control
                          type="text"
                          value={
                            perdoruesi?.perdoruesi?.teDhenatPerdoruesit
                              .nrKontaktit
                          }
                          onChange={(e) =>
                            handleChange("nrKontaktit", e.target.value)
                          }
                          className="sp-input"
                        />
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="sp-input-group">
                        <label className="sp-label">Email Privat</label>
                        <Form.Control
                          type="text"
                          value={
                            perdoruesi?.perdoruesi?.teDhenatPerdoruesit
                              .emailPrivat
                          }
                          onChange={(e) =>
                            handleChange("emailPrivat", e.target.value)
                          }
                          className="sp-input"
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row className="g-4 mb-3">
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Profesioni</label>
                        <Form.Control
                          type="text"
                          value={
                            perdoruesi?.perdoruesi?.teDhenatPerdoruesit.profesioni
                          }
                          onChange={(e) =>
                            handleChange("profesioni", e.target.value)
                          }
                          className="sp-input"
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Specializimi</label>
                        <Form.Control
                          type="text"
                          value={
                            perdoruesi?.perdoruesi?.teDhenatPerdoruesit
                              .specializimi
                          }
                          onChange={(e) =>
                            handleChange("specializimi", e.target.value)
                          }
                          className="sp-input"
                        />
                      </div>
                    </Col>
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Kualifikimi</label>
                        <Form.Control
                          type="text"
                          value={
                            perdoruesi?.perdoruesi?.teDhenatPerdoruesit
                              .kualifikimi
                          }
                          onChange={(e) =>
                            handleChange("kualifikimi", e.target.value)
                          }
                          className="sp-input"
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row className="g-4 align-items-end">
                    <Col md="5">
                      <div className="sp-input-group">
                        <label className="sp-label">Banka</label>
                        <div className="sp-select-container">
                          <Select
                            value={selectedBanka}
                            onChange={(option) => {
                              setSelectedBanka(option);
                              handleChange("bankaID", option.value);
                            }}
                            options={bankaOptions}
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
                        <label className="sp-label">Nr. Llogarisë Bankare</label>
                        <Form.Control
                          type="number"
                          value={
                            perdoruesi?.perdoruesi?.teDhenatPerdoruesit
                              .numriLlogarisBankare
                          }
                          onChange={(e) =>
                            handleChange("numriLlogarisBankare", e.target.value)
                          }
                          className="sp-input"
                        />
                      </div>
                    </Col>
                    <Col md="3">
                      <div className="sp-input-group pb-2">
                        <Form.Check
                          type="checkbox"
                          id="eshtePuntorAktiv"
                          label="Punëtor Aktiv"
                          className="sp-checkbox-custom"
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
                      </div>
                    </Col>
                  </Row>
                </Form>
              </div>
            </Tab>

            <Tab eventKey="fjalekalimi" title="Fjalëkalimi">
              <div className="p-3 text-center">
                <div className="mb-4 text-warning">
                  <i className="fas fa-key fa-3x"></i>
                </div>
                <p className="text-white mb-4">
                  Kjo do të rivendosë fjalëkalimin për përdoruesin në një
                  fjalëkalim të paracaktuar.
                  <br />
                  <span className="text-muted small">Ju lutemi, sigurohuni që përdoruesi ta ndryshojë fjalëkalimin pas rivendosjes.</span>
                </p>
                <Button
                  variant="warning"
                  className="px-5 py-2 fw-bold shadow-sm"
                  onClick={() => handleResetoPasswordin()}>
                  Rivendos Fjalëkalimin
                </Button>
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-cancel" onClick={() => props.largo()}>
            Anulo
          </Button>
          <Button className="btn-save px-4" onClick={handleSubmit}>
            Ruaj Ndryshimet
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditoPerdorues;
