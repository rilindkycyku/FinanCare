import { useEffect, useMemo, useState } from "react";
﻿import axios from "axios";
import { Modal, Button, Row, Col, Form, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faPenToSquare, faFileInvoice, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";
import TeDhenatKalkulimit from "./TeDhenatKalkulimit";

function PerditesoStatusinKalk(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  // State
  const [kalkulimetEFiltruara, setKalkulimetEFiltruara] = useState([]);
  const [perditeso, setPerditeso] = useState("");
  const [shfaqTeDhenat, setShfaqTeDhenat] = useState(false);
  const [id, setId] = useState(0);
  const [error, setError] = useState(null);

  // Loading states
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const getToken = localStorage.getItem("token");
  const authentikimi = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${getToken}`,
      },
    }),
    [getToken],
  );

  // Date range state
  const today = new Date();
  const [dataFillim, setDataFillim] = useState(new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  const [dataMbarim, setDataMbarim] = useState(new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);

  // Fetch invoices for the partner
  useEffect(() => {
    if (!props.show) return;

    let isMounted = true;

    const shfaqKalkulimet = async () => {
      try {
        if (isMounted) setLoadingInvoices(true);

        const kalkulimi = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetSipasStatusit?statusi=true&dataFillim=${dataFillim}&dataMbarim=${dataMbarim}`,
          authentikimi,
        );

        if (!isMounted) return;

        const kalkulimet = kalkulimi.data.filter(
          (item) =>
            item.llojiKalkulimit === "FAT" && item.idPartneri === props.pID,
        );

        setKalkulimetEFiltruara(kalkulimet);

        if (kalkulimet.length === 0) {
          // Optional: Set a specific info message if you want, or just leave list empty
          // setError({ message: "Nuk u gjetën fatura për këtë partner në datat e zgjedhura." }); 
          // Better to just show empty state in UI
          setError(null);
        } else {
          setError(null);
        }

      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        if (err.response && err.response.status === 404) {
          setError({ message: "Nuk u gjetën të dhëna." });
        } else {
          setError({
            message: "Dështoi marrja e faturave.",
            details: err.response?.data?.message || err.message
          });
        }
      } finally {
        if (isMounted) setLoadingInvoices(false);
      }
    };

    shfaqKalkulimet();

    return () => {
      isMounted = false;
    };
  }, [props.show, perditeso, dataFillim, dataMbarim, API_BASE_URL, authentikimi, props.pID]);

  const mbyllTeDhenat = () => {
    setShfaqTeDhenat(false);
  };

  const handleShfaqTeDhenat = (id) => {
    setId(id);
    setShfaqTeDhenat(true);
  };

  async function vendosProduktetPerFletkthim(id) {
    try {
      setLoadingUpdate(true);
      const kalkulimi = await axios.get(
        `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?IDRegjistrimit=${id}`,
        authentikimi,
      );

      const produktetNeKalkulim = kalkulimi.data;

      // Use Promise.all for parallel execution
      await Promise.all(
        produktetNeKalkulim.map((produkt) =>
          axios.post(
            `${API_BASE_URL}/api/Faturat/ruajKalkulimin/teDhenat`,
            {
              idRegjistrimit: props.id,
              idProduktit: produkt.idProduktit,
              sasiaStokut: produkt.sasiaStokut,
              qmimiBleres: -produkt.qmimiBleres,
              qmimiShites: -produkt.qmimiShites,
              qmimiShitesMeShumic: -produkt.qmimiShitesMeShumic,
              rabati1: -produkt.rabati1,
              rabati2: -produkt.rabati2,
              rabati3: -produkt.rabati3,
            },
            authentikimi,
          ),
        ),
      );

      setPerditeso(Date.now().toString());
      if (props.perditeso) props.perditeso();
      if (props.hide) props.hide();
    } catch (err) {
      setError({ message: "Dështoi përditësimi i të dhënave të faturës." });
      console.error(err);
    } finally {
      setLoadingUpdate(false);
    }
  }

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant", "Faturist"]}
        largo={props.largo}
        shfaqmesazhin={props.shfaqmesazhin}
        perditesoTeDhenat={props.perditesoTeDhenat}
        setTipiMesazhit={props.setTipiMesazhit}
        setPershkrimiMesazhit={props.setPershkrimiMesazhit}
      />

      <Modal
        show={shfaqTeDhenat}
        onHide={mbyllTeDhenat}
        size="xl"
        centered
        scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Të Dhënat e Faturës</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <TeDhenatKalkulimit
            id={id}
            show={shfaqTeDhenat}
            onHide={mbyllTeDhenat}
            largo={props.largo}
            shfaqmesazhin={props.shfaqmesazhin}
            perditesoTeDhenat={props.perditesoTeDhenat}
            setTipiMesazhit={props.setTipiMesazhit}
            setPershkrimiMesazhit={props.setPershkrimiMesazhit}
          />
        </Modal.Body>
      </Modal>

      <Modal size="xl"
        className="mt-12"
        show={props.show}
        onHide={props.hide}>
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold">Lista e Kalkulimeve</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light pt-2">
          {error && (
            <div className={`alert ${error.message?.includes("Nuk u gjetën") ? "alert-info" : "alert-danger"} d-flex align-items-center mb-4 shadow-sm border-0`}>
              <FontAwesomeIcon icon={faCircleInfo} className="me-3 fs-4" />
              <div>
                <p className="mb-0 fw-medium">{error.message}</p>
                {error.details && (
                  <p className="text-sm mb-0 mt-1 opacity-75">Detajet: {error.details}</p>
                )}
              </div>
            </div>
          )}

          {/* Filters Card */}
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-body p-4">
              <Row className="g-3 align-items-end">
                <Col md={12} className="mb-2">
                  <div className="d-flex align-items-center text-muted">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                    <span className="fw-semibold text-uppercase small">Filtro sipas datës</span>
                  </div>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-secondary small text-uppercase">Data Fillim</Form.Label>
                    <Form.Control
                      type="date"
                      value={dataFillim}
                      onChange={(e) => setDataFillim(e.target.value)}
                      disabled={loadingInvoices}
                      className="shadow-sm border-light"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-secondary small text-uppercase">Data Mbarim</Form.Label>
                    <Form.Control
                      type="date"
                      value={dataMbarim}
                      onChange={(e) => setDataMbarim(e.target.value)}
                      disabled={loadingInvoices}
                      className="shadow-sm border-light"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Button
                    variant="primary"
                    disabled={loadingInvoices}
                    onClick={() => {
                      const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                      setDataFillim(todayStr);
                      setDataMbarim(todayStr);
                    }}
                    className="w-100 shadow-sm fw-medium border-0"
                    style={{ height: '38px' }}>
                    Sot
                  </Button>
                </Col>
              </Row>
            </div>
          </div>

          {/* Loading State */}
          {loadingInvoices && (
            <div className="text-center py-5 my-3">
              <Spinner animation="grow" variant="primary" className="mb-3" />
              <p className="text-muted fw-medium">Duke ngarkuar faturat...</p>
            </div>
          )}

          {/* Results Table */}
          {!loadingInvoices && kalkulimetEFiltruara.length > 0 && (
            <div className="card shadow-sm border-0">
              <div className="card-body p-0 rounded overflow-hidden">
                <div className="table-responsive">
                  <MDBTable hover align="middle" className="mb-0">
                    <MDBTableHead >
                      <tr>
                        <th className="fw-bold text-secondary text-uppercase small" scope="col">Nr. Kalk</th>
                        <th className="fw-bold text-secondary text-uppercase small" scope="col">Nr. Fat</th>
                        <th className="fw-bold text-secondary text-uppercase small" scope="col">Partneri</th>
                        <th className="fw-bold text-secondary text-uppercase small text-end" scope="col">Pa TVSH</th>
                        <th className="fw-bold text-secondary text-uppercase small text-end" scope="col">TVSH</th>
                        <th className="fw-bold text-secondary text-uppercase small" scope="col">Data</th>
                        <th className="fw-bold text-secondary text-uppercase small" scope="col">Lloji</th>
                        <th className="fw-bold text-secondary text-uppercase small text-center" scope="col">Veprime</th>
                      </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                      {kalkulimetEFiltruara.map((k) => (
                        <tr key={k.idRegjistrimit}>
                          <td className="fw-medium text-muted">#{k.idRegjistrimit}</td>
                          <td className="fw-bold text-dark">{k.nrFatures}</td>
                          <td className="text-nowrap">{k.emriBiznesit}</td>
                          <td className="text-end font-monospace">{k.totaliPaTVSH?.toFixed(2) ?? "0.00"} €</td>
                          <td className="text-end font-monospace">{k.tvsh?.toFixed(2) ?? "0.00"} €</td>
                          <td className="text-nowrap">
                            {k.dataRegjistrimit
                              ? new Date(k.dataRegjistrimit).toLocaleDateString(
                                "en-GB",
                                { dateStyle: "medium" },
                              )
                              : "N/A"}
                          </td>
                          <td><span className="badge bg-light text-dark border">{k.llojiKalkulimit}</span></td>
                          <td className="text-center text-nowrap">
                            <Button
                              variant="light"
                              size="sm"
                              className="me-2 text-primary border-0 bg-white shadow-sm"
                              onClick={() => handleShfaqTeDhenat(k.idRegjistrimit)}
                              aria-label="View Details"
                              title="Shiko Detajet">
                              <FontAwesomeIcon icon={faCircleInfo} size="lg" />
                            </Button>
                            <Button
                              variant="light"
                              size="sm"
                              className="text-success border-0 bg-white shadow-sm"
                              disabled={loadingUpdate}
                              onClick={() =>
                                vendosProduktetPerFletkthim(k.idRegjistrimit)
                              }
                              aria-label="Update Invoice"
                              title="Përditëso Faturën">
                              {loadingUpdate ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </MDBTableBody>
                  </MDBTable>
                </div>
              </div>
              <div className="card-footer bg-white text-end text-muted small border-top-0">
                Gjetur {kalkulimetEFiltruara.length} rezultate
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loadingInvoices && kalkulimetEFiltruara.length === 0 && !error && (
            <div className="text-center py-5">
              <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 text-muted">
                <FontAwesomeIcon icon={faFileInvoice} size="2x" opacity="0.5" />
              </div>
              <h5 className="fw-bold text-secondary">Nuk u gjet asnjë faturë</h5>
              <p className="text-muted mb-0">Nuk ka fatura për këtë partner në datat e zgjedhura.</p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default PerditesoStatusinKalk;
