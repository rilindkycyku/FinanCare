import { useEffect, useMemo, useState } from "react";
﻿import { AlertCircle, Home, LogOut } from "lucide-react";
import {
  Button,
  Container,
  Row,
  Col,
  Form,
  Pagination,
  Table,
  Card
} from "react-bootstrap";
import axios from "axios";
import useSortableData from "../Context/useSortableData";
import SortIcon from "../Components/TeTjera/Tabela/SortIcon";
import CustomDatePicker from "../Components/TeTjera/layout/CustomDatePicker";
import EksportoTeDhenat from "../Components/TeTjera/Tabela/EksportoTeDhenat";
import { format, parseISO } from "date-fns";
import NavBar from "../Components/TeTjera/layout/NavBar";
import KontrolloAksesinNeFaqe from "../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import "./Styles/PremiumTheme.css";

export default function Gjurmimet() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [gjurmimet, setGjurmimet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [perditeso, setPerditeso] = useState(Date.now());
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearDays, setClearDays] = useState("");
  const [isClearing, setIsClearing] = useState(false);

  const getToken = localStorage.getItem("token");

    const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

  const { items, requestSort, sortConfig, currentPage, pageCount, goToPage } =
    useSortableData(
      gjurmimet,
      perditeso,
      searchQuery,
      itemsPerPage,
      "Koha",
      startDate,
      endDate,
    );

  // Fetch data on mount
  useEffect(() => {
    fetchGjurmimet();
  }, []);

  const fetchGjurmimet = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_BASE_URL}/api/AdminLogs/ShfaqGjurmimet`,
        authentikimi,
      );

      const data = response.data;
      const transformedData = data.map((k) => ({
        ID: k.id,
        Stafi: k.stafi
          ? `${k.stafi.emri} ${k.stafi.mbiemri} - ${k.stafi.email}`
          : "N/A",
        Koha: k.koha,
        Veprimi: k.veprimi,
        Entiteti: k.entiteti,
        "Entiteti ID": k.entitetiId,
        Detajet: k.detaje,
      }));
      setGjurmimet(transformedData);
    } catch (err) {
      setError(err.message || "Gabim në marrjen e të dhënave");
      console.error("Error fetching gjurmimet:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };

  const formatDate = (dateStr) => {
    try {
      const date = parseISO(dateStr);
      return format(date, "dd/MM/yyyy");
    } catch (e) {
      return dateStr;
    }
  };

  const headeri = gjurmimet.length > 0 ? Object.keys(gjurmimet[0]) : [];
  const filteredHeaders = headeri.filter((header) => header !== "ID");

  const filteredItems = items.filter((item) => {
    const itemDate = item["Koha"] ? parseISO(item["Koha"]) : null;

    if (startDate && itemDate && itemDate < startDate) {
      return false;
    }
    if (endDate && itemDate && itemDate > endDate) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    const tabelaDiv = document.querySelector(".tabelaDiv");
    if (tabelaDiv) {
      // tabelaDiv.style.zoom = "80%";
    }
  }, []);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    goToPage(0);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    requestSort(null);
    goToPage(0);
    setStartDate(null);
    setEndDate(null);
  };

  const handleClearAllLogs = async () => {
    if (!window.confirm("Jeni i sigurt? Kjo veprim nuk mund të rikthehet!")) {
      return;
    }

    try {
      setIsClearing(true);
      await axios.delete(
        `${API_BASE_URL}/api/AdminLogs/FshijGjurmimetEGjitha`,
        authentikimi
      );

      setShowClearModal(false);
      await fetchGjurmimet();
      setError(null);
    } catch (err) {
      setError("Gabim në fshirjen e gjurmimeve: " + (err.response?.data?.message || err.message));
      console.error("Error clearing logs:", err);
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearOldLogs = async () => {
    if (!clearDays || clearDays < 1) {
      setError("Ju lutemi vendosni numrin e ditëve (minimum 1)");
      return;
    }

    if (!window.confirm(`Jeni i sigurt që doni të fshirni gjurmimet më të vjetra se ${clearDays} ditë?`)) {
      return;
    }

    try {
      setIsClearing(true);
      await axios.delete(
        `${API_BASE_URL}/api/AdminLogs/FshijGjurmimetEVjetra/${clearDays}`,
        authentikimi
      );

      setShowClearModal(false);
      setClearDays("");
      await fetchGjurmimet();
      setError(null);
    } catch (err) {
      setError("Gabim në fshirjen e gjurmimeve: " + (err.response?.data?.message || err.message));
      console.error("Error clearing old logs:", err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <KontrolloAksesinNeFaqe
        roletELejuara={["Menaxher", "Kalkulant", "Komercialist", "Faturist"]}
      />
      <NavBar />

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 999 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`position-fixed start-0 top-0 h-100 border-end border-secondary ${sidebarOpen ? "d-block" : "d-none"} d-lg-none`}
        style={{ width: "250px", zIndex: 1000, marginTop: "56px", background: "var(--sp-surface)" }}>
        <nav className="p-3">
          <a
            href="/"
            className="d-flex align-items-center gap-2 text-decoration-none text-soft p-3 rounded hover-dark-soft mb-2">
            <Home className="w-5 h-5 text-emerald" />
            <span>Shtëpi</span>
          </a>
          <Button
            variant="link"
            onClick={handleLogout}
            className="w-100 text-start text-danger p-3 rounded text-decoration-none">
            <LogOut className="w-5 h-5 me-2" />
            Dil
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="tabelaDiv">
        {/* Error Message */}
        {error && (
          <Container className="mt-4">
            <div className="alert alert-danger d-flex gap-3" role="alert">
              <AlertCircle
                className="w-5 h-5 flex-shrink-0"
                style={{ width: "20px", height: "20px", marginTop: "2px" }}
              />
              <div>
                <h5 className="alert-heading">Gabim</h5>
                <p className="mb-2">{error}</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={fetchGjurmimet}
                  className="p-0">
                  Provo përsëri
                </Button>
              </div>
            </div>
          </Container>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="d-flex align-items-center justify-content-center py-5">
            <div className="spinner-border text-emerald me-3" role="status">
              <span className="visually-hidden">Duke ngarkuar...</span>
            </div>
            <span className="text-soft">Duke ngarkuar...</span>
          </div>
        ) : gjurmimet.length > 0 ? (
          <>
            <div className="containerDashboardP py-3">
              <div className="text-center mb-4">
                <h1 className="h2 fw-bold text-white mb-1">Gjurmimi i Sistemit</h1>
                <p className="text-soft opacity-75 small">Monitoroni të gjitha veprimet e kryera në platformë</p>
              </div>

              <Row className="mb-4 g-4">
                <Col lg={8}>
                  <Card className="sp-card h-100">
                    <div className="sp-card-header">
                      <h3>Filtrimi & Kërkimi</h3>
                    </div>
                    <Card.Body className="p-4">
                      <Row className="g-3 align-items-end">
                        <Col md={3}>
                          <Form.Label className="sp-label small">Data Fillimit</Form.Label>
                          <CustomDatePicker
                            selectedDate={startDate}
                            onDateChange={setStartDate}
                            placeholderText="Nga data"
                            maxDate={endDate}
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Label className="sp-label small">Data Mbarimit</Form.Label>
                          <CustomDatePicker
                            selectedDate={endDate}
                            onDateChange={setEndDate}
                            minDate={startDate}
                            placeholderText="Deri më"
                          />
                        </Col>
                        <Col md={4}>
                          <Form.Label className="sp-label small">Kërko në të dhëna</Form.Label>
                          <Form.Control
                            className="sp-input"
                            type="text"
                            placeholder="Kërko arkëtar, veprim..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </Col>
                        <Col md={2}>
                          <Button
                            variant="outline-secondary"
                            className="w-100 py-2"
                            onClick={handleResetFilters}
                          >
                            Pastro
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={4}>
                  <Card className="sp-card h-100">
                    <div className="sp-card-header">
                      <h3>Veprime Rapide</h3>
                    </div>
                    <Card.Body className="p-4 d-flex flex-column justify-content-between h-100">
                      <div className="d-flex gap-2 mb-3">
                        {gjurmimet.length > 0 && (
                          <EksportoTeDhenat
                            teDhenatJSON={gjurmimet}
                            emriDokumentit="Gjurmimet"
                          />
                        )}
                        <Button
                          variant="outline-danger"
                          className="flex-grow-1"
                          onClick={() => setShowClearModal(true)}
                          disabled={gjurmimet.length === 0}
                        >
                          Fshi Log-et
                        </Button>
                      </div>
                      <div className="mt-auto">
                        <Form.Select
                          className="sp-input mt-2"
                          value={itemsPerPage}
                          onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                        >
                          <option value={20}>20 rreshta per faqe</option>
                          <option value={50}>50 rreshta per faqe</option>
                          <option value={100}>100 rreshta per faqe</option>
                        </Form.Select>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="sp-card border-0 shadow-none bg-transparent">
                <div className="table-responsive">
                  <Table className="sp-table align-middle mb-0">
                    <thead>
                      <tr>
                        {filteredHeaders.map((header) => (
                          <th
                            key={header}
                            onClick={() => requestSort(header)}
                            className={header === "Koha" ? "ps-4" : ""}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="d-flex align-items-center gap-2">
                              {header}
                              {sortConfig.key === header ? (
                                <SortIcon direction={sortConfig.direction} type="text" />
                              ) : (
                                <SortIcon opacity={0.3} />
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.ID}>
                          {filteredHeaders.map((header) => (
                            <td key={`${item.ID}-${header}`} className={header === "Koha" ? "ps-4" : ""}>
                              {header === "Koha" ? (
                                <div className="fw-bold">{formatDate(item[header])}</div>
                              ) : header === "Veprimi" ? (
                                <span className={`badge ${item[header] === "Shto" ? "bg-success-subtle text-success" :
                                  item[header] === "Fshij" ? "bg-danger-subtle text-danger" :
                                    "bg-info-subtle text-info"
                                  } px-2 py-1`}>
                                  {item[header]}
                                </span>
                              ) : header === "Detajet" ? (
                                <div className="text-white-50 small" style={{ maxWidth: '350px', whiteSpace: 'normal' }}>
                                  {item[header]}
                                </div>
                              ) : (
                                item[header]
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card>

              {pageCount > 1 && (
                <Pagination className="justify-content-center mt-4">
                  <Pagination.First onClick={() => goToPage(0)} disabled={currentPage === 0} />
                  <Pagination.Prev onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0} />

                  {/* Always show first page */}
                  <Pagination.Item active={currentPage === 0} onClick={() => goToPage(0)}>1</Pagination.Item>

                  {/* Left ellipsis */}
                  {currentPage > 2 && <Pagination.Ellipsis disabled />}

                  {/* Middle pages */}
                  {Array.from({ length: pageCount }, (_, i) => {
                    // Show middle pages around current
                    if (i > 0 && i < pageCount - 1 && i >= currentPage - 1 && i <= currentPage + 1) {
                      return (
                        <Pagination.Item
                          key={i}
                          active={i === currentPage}
                          onClick={() => goToPage(i)}>
                          {i + 1}
                        </Pagination.Item>
                      );
                    }
                    return null;
                  })}

                  {/* Right ellipsis */}
                  {currentPage < pageCount - 3 && <Pagination.Ellipsis disabled />}

                  {/* Always show last page */}
                  {pageCount > 1 && (
                    <Pagination.Item active={currentPage === pageCount - 1} onClick={() => goToPage(pageCount - 1)}>
                      {pageCount}
                    </Pagination.Item>
                  )}

                  <Pagination.Next onClick={() => goToPage(currentPage + 1)} disabled={currentPage === pageCount - 1} />
                  <Pagination.Last onClick={() => goToPage(pageCount - 1)} disabled={currentPage === pageCount - 1} />
                </Pagination>
              )}

              <div className="text-center mt-3 mb-5">
                <Button
                  variant="primary"
                  className="btn-save px-4 py-2"
                  onClick={fetchGjurmimet}
                  disabled={loading}>
                  <svg
                    className="me-2"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                  </svg>
                  Përditeso Gjurmimet
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Container className="mt-4">
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>
                    <h5 className="text-center mb-0">Gjurmimi</h5>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-center text-muted">Nuk ka të dhëna</td>
                </tr>
              </tbody>
            </Table>
          </Container>
        )}

        {/* Clear Logs Modal */}
        {showClearModal && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center"
            style={{ zIndex: 2000 }}>
            <div className="bg-dark border border-secondary rounded-3 p-4" style={{ maxWidth: "450px", width: "95%", color: "white" }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 text-white">Fshi Gjurmimet</h4>
                <Button variant="link" className="text-white p-0" onClick={() => setShowClearModal(false)}>âœ•</Button>
              </div>

              <div className="mb-4">
                <p className="text-white-50 small mb-2">OPSIONET E FSHIRJES:</p>
                <div className="d-grid gap-2">
                  <Button
                    variant="danger"
                    className="py-3 fw-bold"
                    onClick={handleClearAllLogs}
                    disabled={isClearing}>
                    FSHI TË GJITHA LOG-ET
                  </Button>
                  <p className="text-danger small text-center mt-1">
                    âš  Kjo veprim është i pakthyeshëm.
                  </p>
                </div>
              </div>

              <div className="mb-4 pt-3 border-top border-secondary">
                <p className="text-white-50 small mb-2">FSHI SIPAS KOHËS:</p>
                <div className="d-flex gap-2">
                  <Form.Control
                    className="sp-input"
                    type="number"
                    min="1"
                    placeholder="Ditët (p.sh. 30)"
                    value={clearDays}
                    onChange={(e) => setClearDays(e.target.value)}
                    disabled={isClearing}
                  />
                  <Button
                    variant="warning"
                    className="px-4"
                    onClick={handleClearOldLogs}
                    disabled={isClearing || !clearDays}>
                    Fshi
                  </Button>
                </div>
                <p className="text-muted small mt-2">
                  Fshin log-et më të vjetra se numri i ditëve të caktuar.
                </p>
              </div>

              <div className="d-grid">
                <Button
                  variant="outline-light"
                  onClick={() => {
                    setShowClearModal(false);
                    setClearDays("");
                  }}
                  disabled={isClearing}>
                  Anulo
                </Button>
              </div>

              {isClearing && (
                <div className="mt-3 text-center">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Duke fshirë...</span>
                  </div>
                  <p className="text-muted mt-2 mb-0">Duke fshirë...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
