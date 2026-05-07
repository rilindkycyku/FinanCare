import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import axios from "axios";
import Select from "react-select";
import { darkSelectStyles } from "@/utils/darkSelectStyles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import Mesazhi from "../layout/Mesazhi";

// llojiKalkulimit values that use BUYERS (bleres) as partner
const LOJI_ME_BLERES = ["OFERTE", "POROSI", "FAT", "PARAGON", "SHITJE", "ONLINE", "KMB", "AS"];

function EditoDetajetFatures({ show, onHide, idKalkulimit, perditesoTeDhenat }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");

  const [partneretOptions, setPartneretOptions] = useState([]);

  // Editable fields
  const [partneriZgjedhur, setPartneriZgjedhur] = useState(null);
  const [nrFatures, setNrFatures] = useState("");
  const [dataEFatures, setDataEFatures] = useState("");
  const [llojiIPageses, setLlojiIPageses] = useState("");
  const [statusiIPageses, setStatusiIPageses] = useState("");
  const [totPaTVSH, setTotPaTVSH] = useState("");
  const [tvsh, setTvsh] = useState("");

  // Preserved fields — never shown in UI, always re-sent to avoid API defaults overwriting them
  const [llojiKalkulimit, setLlojiKalkulimit] = useState("");
  const [statusiKalkulimit, setStatusiKalkulimit] = useState("");
  const [stafiID, setStafiID] = useState(null);
  const [nrRendorFatures, setNrRendorFatures] = useState(null);
  const [pershkrimShtese, setPershkrimShtese] = useState("");
  const [rabati, setRabati] = useState(null);
  const [eshteFaturuarOferta, setEshteFaturuarOferta] = useState(null);
  const [idBonusKartela, setIdBonusKartela] = useState(null);

  useEffect(() => {
    if (!show || !idKalkulimit) return;

    const ngarkoTeDhenat = async () => {
      setLoading(true);
      try {
        // 1. Fetch invoice data first to know the llojiKalkulimit
        const fRes = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${idKalkulimit}`,
          authentikimi
        );
        const fatura = fRes.data.regjistrimet;

        const loji = fatura.llojiKalkulimit || "";
        const isBleres = LOJI_ME_BLERES.includes(loji.toUpperCase());

        // 2. Fetch the correct partner list based on invoice type
        const partnerEndpoint = isBleres
          ? `${API_BASE_URL}/api/Partneri/shfaqPartneretBleres`
          : `${API_BASE_URL}/api/Partneri/shfaqPartneretFurntiore`;

        const pRes = await axios.get(partnerEndpoint, authentikimi);
        const options = pRes.data
          .filter((item) => item.idPartneri !== 2 && item.idPartneri !== 3)
          .map((item) => ({
            value: item.idPartneri,
            label: item.emriBiznesit,
          }));
        setPartneretOptions(options);

        // 3. Set editable fields
        const pZgjedhur = options.find((o) => o.value === fatura.idPartneri);
        setPartneriZgjedhur(pZgjedhur || null);
        setNrFatures(fatura.nrFatures || "");
        if (fatura.dataRegjistrimit) {
          setDataEFatures(new Date(fatura.dataRegjistrimit).toISOString().split("T")[0]);
        }
        setLlojiIPageses(fatura.llojiPageses || "");
        setStatusiIPageses(fatura.statusiPageses || "");
        setTotPaTVSH(fatura.totaliPaTVSH !== null ? fatura.totaliPaTVSH : "");
        setTvsh(fatura.tvsh !== null ? fatura.tvsh : "");

        // 4. Set ALL preserved fields so re-send is complete
        setLlojiKalkulimit(loji);
        setStatusiKalkulimit(fatura.statusiKalkulimit || "false");
        setStafiID(fatura.stafiID ?? null);
        setNrRendorFatures(fatura.nrRendorFatures ?? null);
        setPershkrimShtese(fatura.pershkrimShtese || "");
        setRabati(fatura.rabati ?? null);
        setEshteFaturuarOferta(fatura.eshteFaturuarOferta ?? null);
        setIdBonusKartela(fatura.idBonusKartela ?? null);

      } catch (err) {
        console.error(err);
        setTipiMesazhit("danger");
        setPershkrimiMesazhit("Ndodhi një gabim gjatë ngarkimit të të dhënave.");
        setShfaqMesazhin(true);
      } finally {
        setLoading(false);
      }
    };

    ngarkoTeDhenat();
  }, [show, idKalkulimit]);

  const handleRuaj = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${API_BASE_URL}/api/Faturat/perditesoFaturen?idKalulimit=${idKalkulimit}`,
        {
          // Editable fields
          idPartneri: partneriZgjedhur?.value ?? null,
          nrFatures: nrFatures,
          dataRegjistrimit: dataEFatures ? new Date(dataEFatures).toISOString() : null,
          llojiPageses: llojiIPageses,
          statusiPageses: statusiIPageses,
          totaliPaTVSH: totPaTVSH !== "" ? parseFloat(totPaTVSH) : 0,
          tvsh: tvsh !== "" ? parseFloat(tvsh) : 0,
          // Preserved fields — always re-sent to prevent API defaults from overwriting
          llojiKalkulimit: llojiKalkulimit,
          statusiKalkulimit: statusiKalkulimit,
          stafiID: stafiID,
          nrRendorFatures: nrRendorFatures,
          pershkrimShtese: pershkrimShtese,
          rabati: rabati,
          eshteFaturuarOferta: eshteFaturuarOferta,
          idBonusKartela: idBonusKartela,
        },
        authentikimi
      );

      if (perditesoTeDhenat) perditesoTeDhenat();
      onHide();
    } catch (err) {
      console.error(err);
      setTipiMesazhit("danger");
      setPershkrimiMesazhit("Ndodhi një gabim gjatë ruajtjes.");
      setShfaqMesazhin(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="sp-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          Edito Detajet e Faturës
          {llojiKalkulimit ? (
            <span className="ms-2 badge bg-secondary" style={{ fontSize: "0.7rem" }}>
              {llojiKalkulimit}
            </span>
          ) : null}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" />
          </div>
        ) : (
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="sp-label">Partneri</Form.Label>
                  <Select
                    className="sp-select-container"
                    classNamePrefix="sp-select"
                    value={partneriZgjedhur}
                    onChange={(val) => setPartneriZgjedhur(val)}
                    options={partneretOptions}
                    styles={darkSelectStyles}
                    placeholder="Zgjidh partnerin..."
                    menuPosition="fixed"
                    isClearable
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="sp-label">Nr. Faturës</Form.Label>
                  <Form.Control
                    className="sp-input"
                    type="text"
                    value={nrFatures}
                    onChange={(e) => setNrFatures(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="sp-label">Data e Faturës</Form.Label>
                  <Form.Control
                    className="sp-input"
                    type="date"
                    value={dataEFatures}
                    onChange={(e) => setDataEFatures(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="sp-label">Lloji i Pagesës</Form.Label>
                  <Form.Select
                    className="sp-input"
                    value={llojiIPageses}
                    onChange={(e) => {
                      setLlojiIPageses(e.target.value);
                      if (e.target.value === "Borxh") setStatusiIPageses("Pa Paguar");
                    }}
                  >
                    <option value="" disabled>Zgjidh...</option>
                    <option value="Cash">Cash</option>
                    <option value="Banke">Banke</option>
                    <option value="Borxh">Borxh</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="sp-label">Statusi i Pagesës</Form.Label>
                  <Form.Select
                    className="sp-input"
                    value={statusiIPageses}
                    onChange={(e) => setStatusiIPageses(e.target.value)}
                    disabled={llojiIPageses === "Borxh"}
                  >
                    <option value="" disabled>Zgjidh...</option>
                    <option value="Pa Paguar">Pa Paguar</option>
                    <option value="E Paguar">E Paguar</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="sp-label">Totali Pa TVSH</Form.Label>
                  <Form.Control
                    className="sp-input"
                    type="number"
                    value={totPaTVSH}
                    onChange={(e) => setTotPaTVSH(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="sp-label">TVSH</Form.Label>
                  <Form.Control
                    className="sp-input"
                    type="number"
                    value={tvsh}
                    onChange={(e) => setTvsh(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Mbyll
        </Button>
        <Button className="btn-premium-shto" onClick={handleRuaj} disabled={loading || saving}>
          {saving ? <Spinner size="sm" /> : <><FontAwesomeIcon icon={faSave} className="me-2" /> Ruaj Ndryshimet</>}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditoDetajetFatures;
