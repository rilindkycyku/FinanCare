import { useCallback, useEffect, useMemo, useState } from "react";
﻿import axios from "axios";
import { Modal, Button, Row, Col, Form, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const KALKULIM_TYPE = "FAT";
const STATUS_CLOSED = "true";
const STATUS_OPEN = "false";
const DEBOUNCE_DELAY = 500;

function PerditesoStatusinKalk(props) {
  // Date initialization
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  }, []);

  // Date range state
  const [dataFillim, setDataFillim] = useState(new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  const [dataMbarim, setDataMbarim] = useState(new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);

  // Data state
  const [kalkulimet, setKalkulimet] = useState([]);
  const [kalkulimetEFiltruara, setKalkulimetEFiltruara] = useState([]);
  const [statusiIFiltrimit, setStatusiIFiltrimit] = useState("");

  // Selected kalkulim state
  const [selectedKalkulim, setSelectedKalkulim] = useState({
    emriBiznesit: "",
    nrFatures: "",
    nrKalkulimit: "",
    dataFatures: "",
    llojiFatures: "",
  });

  // Modal state
  const [modals, setModals] = useState({
    hapKalkulimin: false,
    fshijKalkulimin: false,
  });

  // Loading states
  const [loading, setLoading] = useState({
    table: false,
    filteredTable: false,
    action: false,
  });

  // Auth configuration
  const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }), []);

  // Fetch main kalkulimet with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchKalkulimet = async () => {
        try {
          setLoading(prev => ({ ...prev, table: true }));
          const response = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimet?dataFillim=${dataFillim}&dataMbarim=${dataMbarim}`,
            authentikimi
          );
          const filtered = response.data.filter(
            (item) => item.llojiKalkulimit === KALKULIM_TYPE
          );
          setKalkulimet(filtered);
        } catch (err) {
          console.error("Error fetching kalkulimet:", err);
        } finally {
          setLoading(prev => ({ ...prev, table: false }));
        }
      };

      fetchKalkulimet();
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [dataFillim, dataMbarim, authentikimi]);

  // Fetch filtered kalkulimet with debounce
  useEffect(() => {
    if (!statusiIFiltrimit) {
      setKalkulimetEFiltruara([]);
      setLoading(prev => ({ ...prev, filteredTable: false }));
      return;
    }

    const timer = setTimeout(() => {
      const fetchFilteredKalkulimet = async () => {
        try {
          setLoading(prev => ({ ...prev, filteredTable: true }));
          const response = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetSipasStatusit?statusi=${statusiIFiltrimit}&dataFillim=${dataFillim}&dataMbarim=${dataMbarim}`,
            authentikimi
          );
          const filtered = response.data.filter(
            (item) => item.llojiKalkulimit === KALKULIM_TYPE
          );
          setKalkulimetEFiltruara(filtered);
        } catch (err) {
          console.error("Error fetching filtered kalkulimet:", err);
        } finally {
          setLoading(prev => ({ ...prev, filteredTable: false }));
        }
      };

      fetchFilteredKalkulimet();
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [statusiIFiltrimit, dataFillim, dataMbarim, authentikimi]);

  // Update kalkulim status with parallel API calls
  const ndryshoStatusinKalkulimit = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, action: true }));

      await axios.put(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/perditesoStatusinKalkulimit?id=${selectedKalkulim.nrKalkulimit}&statusi=false`,
        {},
        authentikimi
      );

      const { data: teDhenat } = await axios.get(
        `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${selectedKalkulim.nrKalkulimit}`,
        authentikimi
      );

      // Parallel stock updates
      const updatePromises = teDhenat.map((p) =>
        axios.get(
          `${API_BASE_URL}/api/Faturat/hapAsgjesiminKthimin/perditesoStokunQmimin?idProdukti=${p.idProduktit}&idTeDhenatKalkulimit=${p.id}&lloji=AS`,
          authentikimi
        )
      );

      await Promise.allSettled(updatePromises);

      setModals(prev => ({ ...prev, hapKalkulimin: false }));
      setStatusiIFiltrimit(STATUS_CLOSED);
    } catch (error) {
      console.error("Error updating kalkulim:", error);
      alert("Gabim gjatë përditesimit të kalkulimit");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, [selectedKalkulim.nrKalkulimit, authentikimi]);

  // Delete kalkulim
  const fshijKalkuliminFunksioni = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      await axios.delete(
        `${API_BASE_URL}/api/Faturat/fshijKalkulimin?idKalkulimi=${selectedKalkulim.nrKalkulimit}`,
        authentikimi
      );
      setModals(prev => ({ ...prev, fshijKalkulimin: false }));
      setStatusiIFiltrimit(STATUS_OPEN);
    } catch (error) {
      console.error("Error deleting kalkulim:", error);
      alert("Gabim gjatë fshrjes së kalkulimit");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, [selectedKalkulim.nrKalkulimit, authentikimi]);

  // Open modal with selected kalkulim
  const handleOpenModal = useCallback((kalkulim, modalType) => {
    setSelectedKalkulim({
      emriBiznesit: kalkulim.emriBiznesit,
      nrFatures: kalkulim.nrFatures,
      nrKalkulimit: kalkulim.idRegjistrimit,
      dataFatures: kalkulim.dataRegjistrimit,
      llojiFatures: kalkulim.llojiKalkulimit,
    });
    setModals(prev => ({ ...prev, [modalType]: true }));
  }, []);

  // Filter kalkulimet
  const filtroKalkulimet = useCallback((lloji) => {
    const statusMap = {
      hapKalkulimet: STATUS_CLOSED,
      fshijKalkulimet: STATUS_OPEN,
      teGjitha: "",
    };
    setStatusiIFiltrimit(statusMap[lloji] ?? "");
  }, []);

  // Reset to today
  const resetToToday = useCallback(() => {
    setDataFillim(new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
    setDataMbarim(new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  }, [today, tomorrow]);

  // Format date helper
  const formatDate = useCallback((date) => 
    new Date(date).toLocaleDateString("en-GB", { dateStyle: "short" })
  , []);

  // Computed values
  const isLoading = loading.action || loading.table || loading.filteredTable;
  const displayedKalkulimet = statusiIFiltrimit ? kalkulimetEFiltruara : kalkulimet;
  
  const modalTitle = useMemo(() => {
    if (statusiIFiltrimit === STATUS_CLOSED) return "Lista e Kalkulimeve te Mbyllura";
    if (statusiIFiltrimit === STATUS_OPEN) return "Lista e Kalkulimeve te Hapura";
    return "Lista e Kalkulimeve";
  }, [statusiIFiltrimit]);

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

      {/* Confirmation Modals */}
      <ConfirmModal
        show={modals.hapKalkulimin}
        onHide={() => setModals(prev => ({ ...prev, hapKalkulimin: false }))}
        onConfirm={ndryshoStatusinKalkulimit}
        title="Konfirmo Hapjen e Kalkulimit"
        message="A jeni te sigurt qe deshironi ta hapni kete kalkulim?"
        kalkulim={selectedKalkulim}
        formatDate={formatDate}
        loading={loading.action}
      />

      <ConfirmModal
        show={modals.fshijKalkulimin}
        onHide={() => setModals(prev => ({ ...prev, fshijKalkulimin: false }))}
        onConfirm={fshijKalkuliminFunksioni}
        title="Konfirmo Fshrijen e Kalkulimit"
        message="A jeni te sigurt qe deshironi ta fshini kete kalkulim?"
        kalkulim={selectedKalkulim}
        formatDate={formatDate}
        loading={loading.action}
      />

      {/* Main Modal */}
      <Modal size="xl"
        style={{ marginTop: "3em" }}
        show={props.show}
        onHide={props.hide}
        centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
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
                onClick={resetToToday}
                disabled={isLoading}
                className="w-100">
                Sot
              </Button>
            </Col>
          </Row>

          {/* Filter Buttons */}
          <FilterButtons
            statusiIFiltrimit={statusiIFiltrimit}
            filtroKalkulimet={filtroKalkulimet}
            isLoading={isLoading}
          />

          {/* Loading Spinner */}
          {isLoading && (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="me-2" />
              <span>Po ngarkohet...</span>
            </div>
          )}

          {/* Data Table */}
          {!isLoading && (
            <KalkulimetTable
              kalkulimet={displayedKalkulimet}
              statusiIFiltrimit={statusiIFiltrimit}
              handleOpenModal={handleOpenModal}
              formatDate={formatDate}
              loadingAction={loading.action}
            />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

// Reusable Confirm Modal Component
function ConfirmModal({ show, onHide, onConfirm, title, message, kalkulim, formatDate, loading }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <strong style={{ fontSize: "10pt" }}>{message}</strong>
        <hr />
        <div style={{ fontSize: "10pt" }}>
          <div className="mb-2">
            <strong>Nr. Kalkulimit:</strong> {kalkulim.nrKalkulimit}
          </div>
          <div className="mb-2">
            <strong>Partneri:</strong> {kalkulim.emriBiznesit}
          </div>
          <div className="mb-2">
            <strong>Nr. Fatures:</strong> {kalkulim.nrFatures}
          </div>
          <div className="mb-2">
            <strong>Data Fatures:</strong> {formatDate(kalkulim.dataFatures)}
          </div>
          <div>
            <strong>Lloji Fatures:</strong> {kalkulim.llojiFatures}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="secondary" onClick={onHide} disabled={loading}>
          Anulo <FontAwesomeIcon icon={faXmark} />
        </Button>
        <Button size="sm" onClick={onConfirm} disabled={loading}>
          {loading && <Spinner animation="border" size="sm" className="me-2" />}
          Konfirmo <FontAwesomeIcon icon={faCheck} />
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Filter Buttons Component
function FilterButtons({ statusiIFiltrimit, filtroKalkulimet, isLoading }) {
  const buttons = [
    { label: "Hap Kalkulimet", key: "hapKalkulimet", status: STATUS_CLOSED },
    { label: "Fshij Kalkulimet", key: "fshijKalkulimet", status: STATUS_OPEN },
    { label: "Te gjitha Kalkulimet", key: "teGjitha", status: "" },
  ];

  return (
    <div className="mb-3">
      {buttons.map(({ label, key, status }) => (
        <Button
          key={key}
          style={{ marginRight: "0.5em", marginBottom: "0.5em" }}
          variant={statusiIFiltrimit === status ? "success" : "outline-success"}
          size="sm"
          onClick={() => filtroKalkulimet(key)}
          disabled={isLoading}>
          {label}
        </Button>
      ))}
    </div>
  );
}

// Kalkulimet Table Component
function KalkulimetTable({ kalkulimet, statusiIFiltrimit, handleOpenModal, formatDate, loadingAction }) {
  return (
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
            <th scope="col">{statusiIFiltrimit ? "Funksione" : "Statusi"}</th>
          </tr>
        </MDBTableHead>
        <MDBTableBody>
          {kalkulimet.length > 0 ? (
            kalkulimet.map((k) => (
              <tr key={k.idRegjistrimit}>
                <td>{k.idRegjistrimit}</td>
                <td>{k.nrFatures}</td>
                <td>{k.emriBiznesit}</td>
                <td>{Number(k.totaliPaTVSH).toFixed(2)} €</td>
                <td>{Number(k.tvsh).toFixed(2)} €</td>
                <td>{formatDate(k.dataRegjistrimit)}</td>
                <td>{k.llojiKalkulimit}</td>
                <td>
                  {statusiIFiltrimit ? (
                    <Button
                      variant={statusiIFiltrimit === STATUS_CLOSED ? "warning" : "danger"}
                      size="sm"
                      onClick={() =>
                        handleOpenModal(
                          k,
                          statusiIFiltrimit === STATUS_CLOSED
                            ? "hapKalkulimin"
                            : "fshijKalkulimin"
                        )
                      }
                      disabled={loadingAction}>
                      <FontAwesomeIcon
                        icon={statusiIFiltrimit === STATUS_CLOSED ? faPenToSquare : faXmark}
                      />
                    </Button>
                  ) : (
                    <span className="badge bg-info">
                      {k.statusiKalkulimit === STATUS_CLOSED ? "M" : "H"}
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
  );
}

export default PerditesoStatusinKalk;
