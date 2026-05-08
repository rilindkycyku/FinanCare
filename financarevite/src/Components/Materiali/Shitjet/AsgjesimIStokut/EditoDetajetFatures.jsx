import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import Mesazhi from "../../../TeTjera/layout/Mesazhi";

function EditoDetajetFatures({ show, onHide, idKalkulimit, perditesoTeDhenat }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const getToken = localStorage.getItem("token");
  const authentikimi = { headers: { Authorization: `Bearer ${getToken}` } };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");

  const [dataEFatures, setDataEFatures] = useState("");

  // Preserved (never shown in UI, always re-sent to prevent API defaults overwriting)
  const [llojiKalkulimit, setLlojiKalkulimit] = useState("");
  const [statusiKalkulimit, setStatusiKalkulimit] = useState("");
  const [stafiID, setStafiID] = useState(null);
  const [nrRendorFatures, setNrRendorFatures] = useState(null);
  const [pershkrimShtese, setPershkrimShtese] = useState("");
  const [rabati, setRabati] = useState(null);
  const [eshteFaturuarOferta, setEshteFaturuarOferta] = useState(null);
  const [idBonusKartela, setIdBonusKartela] = useState(null);
  const [nrFatures, setNrFatures] = useState("");
  const [llojiIPageses, setLlojiIPageses] = useState("");
  const [statusiIPageses, setStatusiIPageses] = useState("");
  const [totPaTVSH, setTotPaTVSH] = useState(""); const [tvsh, setTvsh] = useState("");
  

  useEffect(() => {
    if (!show || !idKalkulimit) return;
    const ngarkoTeDhenat = async () => {
      setLoading(true);
      try {
        const fRes = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${idKalkulimit}`,
          authentikimi
        );
        const fatura = fRes.data.regjistrimet;

        if (fatura.dataRegjistrimit) {
          setDataEFatures(new Date(fatura.dataRegjistrimit).toISOString().split("T")[0]);
        }
        // Preserved fields
        setLlojiKalkulimit(fatura.llojiKalkulimit || "");
        setStatusiKalkulimit(fatura.statusiKalkulimit || "false");
        setStafiID(fatura.stafiID ?? null);
        setNrRendorFatures(fatura.nrRendorFatures ?? null);
        setPershkrimShtese(fatura.pershkrimShtese || "");
        setRabati(fatura.rabati ?? null);
        setEshteFaturuarOferta(fatura.eshteFaturuarOferta ?? null);
        setIdBonusKartela(fatura.idBonusKartela ?? null);
        setNrFatures(fatura.nrFatures || "");
        setLlojiIPageses(fatura.llojiPageses || "");
        setStatusiIPageses(fatura.statusiPageses || "");
        setTotPaTVSH(fatura.totaliPaTVSH !== null ? fatura.totaliPaTVSH : ""); setTvsh(fatura.tvsh !== null ? fatura.tvsh : "");
        
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
          // Editable
          dataRegjistrimit: dataEFatures ? new Date(dataEFatures).toISOString() : null,
          pershkrimShtese: pershkrimShtese,
          // Preserved — always re-sent
          llojiKalkulimit,
          statusiKalkulimit,
          stafiID,
          nrRendorFatures,
          rabati,
          eshteFaturuarOferta,
          idBonusKartela,
          nrFatures: nrFatures,
          llojiPageses: llojiIPageses,
          statusiPageses: statusiIPageses,
          totaliPaTVSH: totPaTVSH !== "" ? parseFloat(totPaTVSH) : 0,
          tvsh: tvsh !== "" ? parseFloat(tvsh) : 0,
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
        <Modal.Title>Edito Detajet e Faturës</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {shfaqMesazhin && (
          <Mesazhi setShfaqMesazhin={setShfaqMesazhin} pershkrimi={pershkrimiMesazhit} tipi={tipiMesazhit} />
        )}
        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="light" /></div>
        ) : (
          <Form>
            <Row className="g-3">

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="sp-label">Pershkrim Shtese</Form.Label>
                  <Form.Control
                    className="sp-input"
                    type="text"
                    value={pershkrimShtese}
                    onChange={(e) => setPershkrimShtese(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="sp-label">Data e Asgjesimit te Mallit</Form.Label>
                  <Form.Control
                    className="sp-input"
                    type="date"
                    value={dataEFatures}
                    onChange={(e) => setDataEFatures(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>Mbyll</Button>
        <Button className="btn-premium-shto" onClick={handleRuaj} disabled={loading || saving}>
          {saving ? <Spinner size="sm" /> : <><FontAwesomeIcon icon={faSave} className="me-2" /> Ruaj Ndryshimet</>}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditoDetajetFatures;
