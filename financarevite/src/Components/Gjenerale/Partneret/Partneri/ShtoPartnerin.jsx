import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faXmark, faSearch, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
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

  const [showArbkModal, setShowArbkModal] = useState(false);
  const [arbkJson, setArbkJson] = useState("");
  const [arbkResults, setArbkResults] = useState([]);

  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState([]);

  const [perditeso, setPerditeso] = useState(Date.now());
  const [teDhenat, setTeDhenat] = useState([]);

  const getID = localStorage.getItem("id");

  const getToken = localStorage.getItem("token");

    const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

  const handleAutoParse = (payloadStr) => {
    console.log("Filloi parsingu automatik. Gjatësia e payload:", payloadStr?.length);
    try {
      const parsed = JSON.parse(payloadStr);
      const list = parsed?.tableSearch?.tableList || [];
      const realList = list.filter(item => item.teDhenatBiznesit);
      
      console.log("U gjetën rekorde:", realList.length);
      
      if (realList.length === 1) {
        console.log("Po plotësoj formën për 1 rekord...");
        const biz = realList[0].teDhenatBiznesit;
        setEmriPartnerit(biz.EmriBiznesit || "");
        setShkurtesaEmrit(biz.EmriTregtar || biz.EmriBiznesit?.substring(0, 3)?.toUpperCase() || "");
        setNUI(biz.NUI || "");
        setNF(biz.NumriFiskal || "");
        setAdresa(`${biz.Adresa || ""}, ${biz.Komuna || ""}`.trim().replace(/^,|,$/g, ""));
        setNrKontaktit(biz.Telefoni || "");
        setEmail(biz.Email || "");
        setKey("klientBiznesi");
        
        props.setTipiMesazhit("success");
        props.setPershkrimiMesazhit("Të dhënat u importuan automatikisht nga ARBK!");
        props.shfaqmesazhin(true);
        
        setShowArbkModal(false);
        setArbkJson("");
        setArbkResults([]);
      } else if (realList.length > 1) {
        console.log("Po shfaq listën me shumë rekorde...");
        setArbkResults(realList.map(item => item.teDhenatBiznesit));
      } else {
         console.warn("Nuk u gjet asnjë rekord në JSON!");
      }
    } catch (e) {
      console.error("Gabim në leximin automatik", e);
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "ARBK_BRIDGE_DATA") {
        if (event.data.payload) {
          setArbkJson(event.data.payload);
          setShowArbkModal(true);
          handleAutoParse(event.data.payload);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (showArbkModal) {
      const savedData = localStorage.getItem("arbk_bridge_data");
      if (savedData) {
        setArbkJson(savedData);
        handleAutoParse(savedData);
        localStorage.removeItem("arbk_bridge_data");
      }
    }
  }, [showArbkModal]);

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

  const handleParseJSON = () => {
    try {
      if (!arbkJson) return;
      const parsed = JSON.parse(arbkJson);
      const list = parsed?.tableSearch?.tableList || [];
      const realList = list.filter(item => item.teDhenatBiznesit);
      
      if (realList.length === 0) {
        throw new Error("Nuk u gjet asnjë biznes në këtë JSON.");
      } else if (realList.length === 1) {
        applyArbkData(realList[0].teDhenatBiznesit);
      } else {
        setArbkResults(realList.map(item => item.teDhenatBiznesit));
      }
    } catch (err) {
      props.setTipiMesazhit("danger");
      props.setPershkrimiMesazhit("Gabim gjatë leximit: " + err.message);
      props.shfaqmesazhin(true);
    }
  };

  const applyArbkData = (biz) => {
    if (!biz) return;
    setEmriPartnerit(biz.EmriBiznesit || "");
    setShkurtesaEmrit(biz.EmriTregtar || biz.EmriBiznesit?.substring(0, 3)?.toUpperCase() || "");
    setNUI(biz.NUI || "");
    setNF(biz.NumriFiskal || "");
    setAdresa(`${biz.Adresa || ""}, ${biz.Komuna || ""}`.trim().replace(/^,|,$/g, ""));
    setNrKontaktit(biz.Telefoni || "");
    setEmail(biz.Email || "");
    
    setKey("klientBiznesi");
    props.setTipiMesazhit("success");
    props.setPershkrimiMesazhit("Të dhënat u importuan me sukses nga ARBK!");
    props.shfaqmesazhin(true);
    
    setShowArbkModal(false);
    setArbkJson("");
    setArbkResults([]);
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
          <div className="d-flex align-items-center w-100 justify-content-between">
            <Modal.Title>Shto Partnerin e Ri</Modal.Title>
            <Button variant="outline-info" size="sm" onClick={() => setShowArbkModal(true)} className="rounded-pill px-3 me-3 fw-bold d-flex align-items-center">
              <FontAwesomeIcon icon={faSearch} className="me-2" />
              Importo nga ARBK (JSON)
            </Button>
          </div>
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
                          value={emri || ""}
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
                          value={mbiemri || ""}
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
                          value={adresa || ""}
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
                          value={nrKontaktit || ""}
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
                          value={email || ""}
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
                          value={rabati || ""}
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
                          value={emriPartnerit || ""}
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
                          value={shkurtesaEmrit || ""}
                          onChange={(e) => setShkurtesaEmrit(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "NUIKB")}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row className="g-4 mb-3">
                    <Col md="4">
                      <div className="sp-input-group">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label className="sp-label mb-0">NUI <span className="text-danger">*</span></label>
                          <a href="https://arbk.rks-gov.net/" target="_blank" rel="noreferrer" className="text-emerald small text-decoration-none fw-bold" title="Kërko në ARBK">
                            <FontAwesomeIcon icon={faSearch} className="me-1" /> ARBK
                          </a>
                        </div>
                        <Form.Control
                          id="NUIKB"
                          type="number"
                          className="sp-input"
                          placeholder="81XXXXXXXX"
                          value={NUI || ""}
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
                          value={NF || ""}
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
                          value={NRTVSH || ""}
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
                          value={adresa || ""}
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
                          value={nrKontaktit || ""}
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
                          value={email || ""}
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
                          value={rabati || ""}
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
                          value={emriPartnerit || ""}
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
                          value={shkurtesaEmrit || ""}
                          onChange={(e) => setShkurtesaEmrit(e.target.value)}
                          onKeyDown={(e) => ndrroField(e, "NUIF")}
                        />
                      </div>
                    </Col>
                  </Row>
                  <Row className="g-4 mb-3">
                    <Col md="4">
                      <div className="sp-input-group">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label className="sp-label mb-0">NUI <span className="text-danger">*</span></label>
                          <a href="https://arbk.rks-gov.net/" target="_blank" rel="noreferrer" className="text-emerald small text-decoration-none fw-bold" title="Kërko në ARBK">
                            <FontAwesomeIcon icon={faSearch} className="me-1" /> ARBK
                          </a>
                        </div>
                        <Form.Control
                          id="NUIF"
                          type="number"
                          className="sp-input"
                          placeholder="81XXXXXXXX"
                          value={NUI || ""}
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
                          value={NF || ""}
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
                          value={NRTVSH || ""}
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
                          value={adresa || ""}
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
                          value={nrKontaktit || ""}
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
                          value={email || ""}
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

      {/* ARBK Import Modal */}
      <Modal show={showArbkModal} onHide={() => {setShowArbkModal(false); setArbkResults([]); setArbkJson("");}} centered className="sp-modal">
        <Modal.Header closeButton>
          <Modal.Title as="h6">Importo nga ARBK</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {arbkResults.length === 0 ? (
            <>
              <div className="alert alert-info py-2 small mb-3">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                <strong>Këshillë:</strong> Për rezultate më të pakta e të sakta, kërkoni në ARBK përmes <strong>NUI</strong> në vend të emrit.
              </div>
              <p className="text-white-50 small mb-2">Ngjisni këtu objektin JSON që keni kopjuar nga <code>localStorage.getItem("state")</code> në faqen e ARBK-së.</p>
              <Form.Control
                as="textarea"
                rows={6}
                className="sp-input"
                placeholder='{"version":2,"locale":"sq",...}'
                value={arbkJson}
                onChange={(e) => setArbkJson(e.target.value)}
              />
            </>
          ) : (
            <>
              <p className="text-white small mb-3">U gjetën <strong>{arbkResults.length}</strong> biznese. Zgjidhni njërin prej tyre:</p>
              <div className="list-group" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {arbkResults.map((biz, idx) => (
                  <button key={idx} type="button" className="list-group-item list-group-item-action bg-dark text-white border-secondary mb-2 rounded" onClick={() => applyArbkData(biz)}>
                    <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                      <h6 className="mb-0 text-info" style={{ fontSize: '0.95rem' }}>{biz.EmriBiznesit}</h6>
                      <span className="badge bg-secondary ms-2">{biz.StatusiARBK}</span>
                    </div>
                    <div className="small text-muted mb-1">
                      <strong className="text-light">NUI:</strong> {biz.NUI || "-"} &nbsp;|&nbsp; <strong className="text-light">Lloji:</strong> {biz.LlojiBiznesit}
                    </div>
                    <div className="small text-muted">
                      <strong className="text-light">Adresa:</strong> {biz.Adresa}, {biz.Komuna}
                    </div>
                  </button>
                ))}
              </div>
              <Button variant="outline-secondary" size="sm" className="mt-3 w-100" onClick={() => {setArbkResults([]); setArbkJson("");}}>
                Pastro dhe kthehu mbrapa
              </Button>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {setShowArbkModal(false); setArbkResults([]); setArbkJson("");}}>Anulo</Button>
          {arbkResults.length === 0 && <Button variant="success" onClick={handleParseJSON} disabled={!arbkJson}>Analizo JSON</Button>}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ShtoPartnerin;
