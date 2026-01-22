import { useEffect, useState } from "react";
import { AlertCircle, Home, LogOut } from "lucide-react";
import {
  Button,
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Pagination,
  Table,
} from "react-bootstrap";
import axios from "axios";
import useSortableData from "../Context/useSortableData";
import SortIcon from "../Components/TeTjera/Tabela/SortIcon";
import CustomDatePicker from "../Components/TeTjera/layout/CustomDatePicker";
import EksportoTeDhenat from "../Components/TeTjera/Tabela/EksportoTeDhenat";
import Titulli from "../Components/TeTjera/Titulli";
import { format, parseISO } from "date-fns";
import NavBar from "../Components/TeTjera/layout/NavBar";
import KontrolloAksesinNeFaqe from "../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";

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

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

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
      tabelaDiv.style.zoom = "80%";
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
        className={`position-fixed start-0 top-0 h-100 bg-white border-end ${sidebarOpen ? "d-block" : "d-none"} d-lg-none`}
        style={{ width: "250px", zIndex: 1000, marginTop: "56px" }}>
        <nav className="p-3">
          <a
            href="/"
            className="d-flex align-items-center gap-2 text-decoration-none text-dark p-3 rounded hover-light mb-2">
            <Home className="w-5 h-5" />
            <span>Shtëpi</span>
          </a>
          <Button
            variant="link"
            onClick={handleLogout}
            className="w-100 text-start text-danger p-3 rounded">
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
            <div className="spinner-border text-primary me-3" role="status">
              <span className="visually-hidden">Duke ngarkuar...</span>
            </div>
            <span className="text-muted">Duke ngarkuar...</span>
          </div>
        ) : gjurmimet.length > 0 ? (
          <>
            <Titulli titulli="Gjurmimi" />
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th colSpan={filteredHeaders.length}>
                    <h5 className="text-center mb-0">Gjurmimi</h5>
                  </th>
                </tr>

                <tr>
                  <th colSpan={filteredHeaders.length}>
                    <Row className="align-items-center g-2">
                      <Col xs="auto">
                        {gjurmimet.length > 0 && (
                          <EksportoTeDhenat
                            teDhenatJSON={gjurmimet}
                            emriDokumentit="Gjurmimet"
                          />
                        )}
                      </Col>
                      <Col xs="auto">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setShowClearModal(true)}
                          disabled={gjurmimet.length === 0}>
                          Fshi Gjurmimet
                        </Button>
                      </Col>
                    </Row>
                  </th>
                </tr>

                <tr>
                  <th colSpan={filteredHeaders.length}>
                    <InputGroup className="gap-2 flex-wrap">
                      <CustomDatePicker
                        selectedDate={startDate}
                        onDateChange={setStartDate}
                        placeholderText="Data fillimit"
                        maxDate={endDate}
                      />
                      <CustomDatePicker
                        selectedDate={endDate}
                        onDateChange={setEndDate}
                        minDate={startDate}
                        placeholderText="Data përfundimit"
                      />
                      <Form.Select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                        style={{ width: "auto" }}>
                        <option value={20}>20 rreshta per faqe</option>
                        <option value={50}>50 rreshta per faqe</option>
                        <option value={100}>100 rreshta per faqe</option>
                      </Form.Select>
                      <Form.Control
                        type="text"
                        placeholder="Kerkoni"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ flex: 1, minWidth: "200px" }}
                      />
                      <Button
                        variant="secondary"
                        onClick={handleResetFilters}>
                        Pastro Filtrat
                      </Button>
                    </InputGroup>
                  </th>
                </tr>

                <tr>
                  {filteredHeaders.map((header) => (
                    <th
                      key={header}
                      onClick={() => requestSort(header)}
                      style={{ cursor: "pointer" }}>
                      {header}{" "}
                      {sortConfig.key === header ? (
                        <SortIcon
                          direction={sortConfig.direction}
                          type="text"
                        />
                      ) : (
                        <SortIcon />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.ID}>
                    {filteredHeaders.map((header) => (
                      <td key={`${item.ID}-${header}`}>
                        {header === "Koha"
                          ? formatDate(item[header])
                          : item[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>

            {pageCount > 1 && (
              <Pagination className="justify-content-center mt-3">
                {Array.from({ length: pageCount }, (_, i) => (
                  <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => goToPage(i)}>
                    {i + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            )}

            <div className="text-center mt-4 mb-4">
              <Button
                variant="primary"
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
                Përditeso
              </Button>
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
            <div className="bg-white rounded-3 p-4" style={{ maxWidth: "400px", width: "90%" }}>
              <h5 className="mb-3">Fshi Gjurmimet</h5>
              
              <div className="mb-3">
                <label className="form-label">Zgjedh opsionin:</label>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="flex-grow-1"
                    onClick={handleClearAllLogs}
                    disabled={isClearing}>
                    Fshi Të Gjitha
                  </Button>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Ose fshi gjurmimet më të vjetra se:</label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="number"
                    min="1"
                    placeholder="Numri i ditëve"
                    value={clearDays}
                    onChange={(e) => setClearDays(e.target.value)}
                    disabled={isClearing}
                  />
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={handleClearOldLogs}
                    disabled={isClearing || !clearDays}>
                    Fshi
                  </Button>
                </div>
              </div>

              <div className="d-flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-grow-1"
                  onClick={() => {
                    setShowClearModal(false);
                    setClearDays("");
                  }}
                  disabled={isClearing}>
                  Mbyll
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