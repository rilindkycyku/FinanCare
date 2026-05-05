import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Row, Col, Form, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function PerditesoStatusinKalk(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  
  // State variables
  const [kalkulimet, setKalkulimet] = useState([]);
  const [kalkulimetEFiltruara, setKalkulimetEFiltruara] = useState([]);
  const [emriBiznesit, setEmriBiznesit] = useState("");
  const [nrFatures, setNrFatures] = useState("");
  const [nrKalkulimit, setNrKalkulimit] = useState("");
  const [dataFatures, setDataFatures] = useState("");
  const [llojiFatures, setLlojiFatures] = useState("");
  const [perditeso, setPerditeso] = useState("");
  const [hapKalkulimin, setHapKalkulimin] = useState(false);
  const [fshijKalkulimin, setFshijKalkulimin] = useState(false);
  const [statusiIFiltrimit, setStatusiIFiltrimit] = useState("");
  
  // ============================================================================
  // NEW: Loading state variables
  // ============================================================================
  const [loadingTable, setLoadingTable] = useState(false);
  const [loadingFilteredTable, setLoadingFilteredTable] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const getToken = localStorage.getItem("token");
  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [dataFillim, setDataFillim] = useState(today.toISOString().split("T")[0]);
  const [dataMbarim, setDataMbarim] = useState(tomorrow.toISOString().split("T")[0]);

  // ============================================================================
  // OPTIMIZATION 1: Remove unused produktet API call
  // OPTIMIZATION 2: Fetch main table data with debounce & loading state
  // ============================================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      const shfaqKalkulimet = async () => {
        try {
          setLoadingTable(true);
          const kalkulimet = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimet?dataFillim=${dataFillim}&dataMbarim=${dataMbarim}`,
            authentikimi
          );
          const kthimet = kalkulimet.data.filter(
            (item) => item.llojiKalkulimit === "KMB"
          );
          setKalkulimet(kthimet);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingTable(false);
        }
      };

      shfaqKalkulimet();
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [perditeso, dataFillim, dataMbarim]);

  // ============================================================================
  // OPTIMIZATION 3: Fetch filtered table data with debounce & loading state
  // ============================================================================
  useEffect(() => {
    if (!statusiIFiltrimit) {
      setKalkulimetEFiltruara([]);
      setLoadingFilteredTable(false);
      return;
    }

    const timer = setTimeout(() => {
      const shfaqKalkulimetEFiltruara = async () => {
        try {
          setLoadingFilteredTable(true);
          const kalkulimet = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetSipasStatusit?statusi=${statusiIFiltrimit}&dataFillim=${dataFillim}&dataMbarim=${dataMbarim}`,
            authentikimi
          );
          const kthimet = kalkulimet.data.filter(
            (item) => item.llojiKalkulimit === "KMB"
          );
          setKalkulimetEFiltruara(kthimet);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingFilteredTable(false);
        }
      };

      shfaqKalkulimetEFiltruara();
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [statusiIFiltrimit, dataFillim, dataMbarim]);

  // ============================================================================
  // OPTIMIZATION 4: Parallel API calls instead of sequential
  // ============================================================================
  async function ndryshoStatusinKalkulimit() {
    try {
      setLoadingAction(true);

      // Update status
      await axios.put(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/perditesoStatusinKalkulimit?id=${nrKalkulimit}&statusi=false`,
        {},
        authentikimi
      );

      // Fetch items
      const teDhenatRes = await axios.get(
        `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${nrKalkulimit}`,
        authentikimi
      );

      // Update all stock items in parallel instead of sequential
      const updatePromises = teDhenatRes.data.map((p) =>
        axios.get(
          `${API_BASE_URL}/api/Faturat/hapAsgjesiminKthimin/perditesoStokunQmimin?idProdukti=${p.idProduktit}&idTeDhenatKalkulimit=${p.id}&lloji=AS`,
          authentikimi
        )
      );

      await Promise.allSettled(updatePromises);

      setHapKalkulimin(false);
      filtroKalkulimet("hapKalkulimet");
    } catch (error) {
      console.error(error);
      alert("Gabim gjatë përditesimit të kalkulimit");
    } finally {
      setLoadingAction(false);
    }
  }

  async function fshijKalkuliminFunksioni() {
    try {
      setLoadingAction(true);
      await axios.delete(
        `${API_BASE_URL}/api/Faturat/fshijKalkulimin?idKalkulimi=${nrKalkulimit}`,
        authentikimi
      );
      setFshijKalkulimin(false);
      filtroKalkulimet("fshijKalkulimet");
    } catch (error) {
      console.error(error);
      alert("Gabim gjatë fshrjes së kalkulimit");
    } finally {
      setLoadingAction(false);
    }
  }

  function detajetRiKonfrimitKalkulimit(
    emriBiznesit,
    nrFatures,
    nrKalkulimit,
    dataFatures,
    llojiFatures,
    funksioni
  ) {
    setEmriBiznesit(emriBiznesit);
    setNrFatures(nrFatures);
    setNrKalkulimit(nrKalkulimit);
    setDataFatures(dataFatures);
    setLlojiFatures(llojiFatures);

    if (funksioni === "hapKalkulimin") {
      setHapKalkulimin(true);
    } else if (funksioni === "fshijKalkulimin") {
      setFshijKalkulimin(true);
    }
  }

  function filtroKalkulimet(lloji) {
    if (lloji === "hapKalkulimet") {
      setStatusiIFiltrimit("true");
    } else if (lloji === "fshijKalkulimet") {
      setStatusiIFiltrimit("false");
    } else if (lloji === "teGjitha") {
      setStatusiIFiltrimit("");
    }
  }

  // Check if any loading happening
  const isLoading = loadingAction || loadingTable || loadingFilteredTable;
  const dataTablesToShow = statusiIFiltrimit ? kalkulimetEFiltruara : kalkulimet;

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

      {/* Confirmation Modal - Hap Kalkulimin */}
      <Modal
        show={hapKalkulimin}
        onHide={() => setHapKalkulimin(false)}
        centered>
        <Modal.Header closeButton>
          <Modal.Title as="h5">Konfirmo Hapjen e Kalkulimit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <strong style={{ fontSize: "10pt" }}>
            A jeni te sigurt qe deshironi ta hapni kete kalkulim?
          </strong>
          <hr />
          <div style={{ fontSize: "10pt" }}>
            <div className="mb-2">
              <strong>Nr. Kalkulimit:</strong> {nrKalkulimit}
            </div>
            <div className="mb-2">
              <strong>Partneri:</strong> {emriBiznesit}
            </div>
            <div className="mb-2">
              <strong>Nr. Fatures:</strong> {nrFatures}
            </div>
            <div className="mb-2">
              <strong>Data Fatures:</strong>{" "}
              {new Date(dataFatures).toLocaleDateString("en-GB", {
                dateStyle: "short",
              })}
            </div>
            <div>
              <strong>Lloji Fatures:</strong> {llojiFatures}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setHapKalkulimin(false)}
            disabled={loadingAction}>
            Anulo <FontAwesomeIcon icon={faXmark} />
          </Button>
          <Button
            size="sm"
            onClick={() => ndryshoStatusinKalkulimit()}
            disabled={loadingAction}>
            {loadingAction && <Spinner animation="border" size="sm" className="me-2" />}
            Konfirmo <FontAwesomeIcon icon={faCheck} />
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal - Fshij Kalkulimin */}
      <Modal
        show={fshijKalkulimin}
        onHide={() => setFshijKalkulimin(false)}
        centered>
        <Modal.Header closeButton>
          <Modal.Title as="h5">Konfirmo Fshrijen e Kalkulimit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <strong style={{ fontSize: "10pt" }}>
            A jeni te sigurt qe deshironi ta fshini kete kalkulim?
          </strong>
          <hr />
          <div style={{ fontSize: "10pt" }}>
            <div className="mb-2">
              <strong>Nr. Kalkulimit:</strong> {nrKalkulimit}
            </div>
            <div className="mb-2">
              <strong>Partneri:</strong> {emriBiznesit}
            </div>
            <div className="mb-2">
              <strong>Nr. Fatures:</strong> {nrFatures}
            </div>
            <div className="mb-2">
              <strong>Data Fatures:</strong>{" "}
              {new Date(dataFatures).toLocaleDateString("en-GB", {
                dateStyle: "short",
              })}
            </div>
            <div>
              <strong>Lloji Fatures:</strong> {llojiFatures}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setFshijKalkulimin(false)}
            disabled={loadingAction}>
            Anulo <FontAwesomeIcon icon={faXmark} />
          </Button>
          <Button
            size="sm"
            onClick={() => fshijKalkuliminFunksioni()}
            disabled={loadingAction}>
            {loadingAction && <Spinner animation="border" size="sm" className="me-2" />}
            Konfirmo <FontAwesomeIcon icon={faCheck} />
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Main Modal */}
      <Modal
        size="lg"
        style={{ marginTop: "3em" }}
        show={props.show}
        onHide={props.hide}
        centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {statusiIFiltrimit === "true"
              ? "Lista e Kalkulimeve te Mbyllura"
              : statusiIFiltrimit === "false"
              ? "Lista e Kalkulimeve te Hapura"
              : "Lista e Kalkulimeve"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Date Range Filters */}
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Data Fillim</Form.Label>
                <Form.Control
                  type="date"
                  value={dataFillim}
                  onChange={(e) => setDataFillim(e.target.value)}
                  disabled={isLoading}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Data Mbarim</Form.Label>
                <Form.Control
                  type="date"
                  value={dataMbarim}
                  onChange={(e) => setDataMbarim(e.target.value)}
                  disabled={isLoading}
                />
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setDataFillim(today.toISOString().split("T")[0]);
                  setDataMbarim(tomorrow.toISOString().split("T")[0]);
                }}
                disabled={isLoading}
                className="w-100">
                Sot
              </Button>
            </Col>
          </Row>

          {/* Filter Buttons */}
          <div className="mb-3">
            <Button
              style={{ marginRight: "0.5em", marginBottom: "0.5em" }}
              variant={statusiIFiltrimit === "true" ? "success" : "outline-success"}
              size="sm"
              onClick={() => filtroKalkulimet("hapKalkulimet")}
              disabled={isLoading}>
              Hap Kalkulimet
            </Button>
            <Button
              style={{ marginRight: "0.5em", marginBottom: "0.5em" }}
              variant={statusiIFiltrimit === "false" ? "success" : "outline-success"}
              size="sm"
              onClick={() => filtroKalkulimet("fshijKalkulimet")}
              disabled={isLoading}>
              Fshij Kalkulimet
            </Button>
            <Button
              style={{ marginRight: "0.5em", marginBottom: "0.5em" }}
              variant={statusiIFiltrimit === "" ? "success" : "outline-success"}
              size="sm"
              onClick={() => filtroKalkulimet("teGjitha")}
              disabled={isLoading}>
              Te gjitha Kalkulimet
            </Button>
          </div>

          {/* Loading Spinner */}
          {isLoading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="me-2" />
              <span>Po ngarkohet...</span>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && (
            <div style={{ overflowX: "auto" }}>
              <MDBTable small hover>
                <MDBTableHead>
                  <tr>
                    <th scope="col">Nr. Kalkulimit</th>
                    <th scope="col">Nr. Fatures</th>
                    <th scope="col">Partneri</th>
                    <th scope="col">Totali Pa TVSH €</th>
                    <th scope="col">TVSH €</th>
                    <th scope="col">Data e Fatures</th>
                    <th scope="col">Lloji Fatures</th>
                    <th scope="col">
                      {statusiIFiltrimit ? "Funksione" : "Statusi"}
                    </th>
                  </tr>
                </MDBTableHead>
                <MDBTableBody>
                  {dataTablesToShow.length > 0 ? (
                    dataTablesToShow.map((k) => (
                      <tr key={k.idRegjistrimit}>
                        <td>{k.idRegjistrimit}</td>
                        <td>{k.nrFatures}</td>
                        <td>{k.emriBiznesit}</td>
                        <td>{Number(k.totaliPaTVSH).toFixed(2)} €</td>
                        <td>{Number(k.tvsh).toFixed(2)} €</td>
                        <td>
                          {new Date(k.dataRegjistrimit).toLocaleDateString(
                            "en-GB",
                            { dateStyle: "short" }
                          )}
                        </td>
                        <td>{k.llojiKalkulimit}</td>
                        <td>
                          {statusiIFiltrimit ? (
                            <>
                              {statusiIFiltrimit === "true" ? (
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={() =>
                                    detajetRiKonfrimitKalkulimit(
                                      k.emriBiznesit,
                                      k.nrFatures,
                                      k.idRegjistrimit,
                                      k.dataRegjistrimit,
                                      k.llojiKalkulimit,
                                      "hapKalkulimin"
                                    )
                                  }
                                  disabled={loadingAction}>
                                  <FontAwesomeIcon icon={faPenToSquare} />
                                </Button>
                              ) : (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() =>
                                    detajetRiKonfrimitKalkulimit(
                                      k.emriBiznesit,
                                      k.nrFatures,
                                      k.idRegjistrimit,
                                      k.dataRegjistrimit,
                                      k.llojiKalkulimit,
                                      "fshijKalkulimin"
                                    )
                                  }
                                  disabled={loadingAction}>
                                  <FontAwesomeIcon icon={faXmark} />
                                </Button>
                              )}
                            </>
                          ) : (
                            <span className="badge bg-info">
                              {k.statusiKalkulimit === "true" ? "M" : "H"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        Asnjë kalkulim i disponueshëm
                      </td>
                    </tr>
                  )}
                </MDBTableBody>
              </MDBTable>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default PerditesoStatusinKalk;
