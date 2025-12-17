import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Table,
  Badge,
  Alert,
  Form,
  Modal,
  Button,
} from "react-bootstrap";
import Titulli from "../../../Components/TeTjera/Titulli";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";

function SugjerimiPorosiseSipasFurnitorit() {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://localhost:7285";

  const [furnitoret, setFurnitoret] = useState([]);
  const [selectedFurnitor, setSelectedFurnitor] = useState(null);
  const [produktetOrigjinale, setProduktetOrigjinale] = useState([]);
  const [produktet, setProduktet] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingFurnitoret, setLoadingFurnitoret] = useState(true);
  const [loadingProduktet, setLoadingProduktet] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedProduktDetaje, setSelectedProduktDetaje] = useState(null);

  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  // Ngarko furnitorët
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/Partneri/shfaqPartneretFurntiore`, auth)
      .then((res) => {
        const options = res.data
          .filter((f) => ![1, 2, 3].includes(f.idPartneri))
          .map((f) => ({
            value: f.idPartneri,
            label: `${f.emriBiznesit} ${
              f.shkurtesaPartnerit ? `(${f.shkurtesaPartnerit})` : ""
            }`.trim(),
          }));
        setFurnitoret(options);
        setLoadingFurnitoret(false);
      })
      .catch((err) => {
        console.error("Gabim në ngarkimin e furnitorëve:", err);
        setLoadingFurnitoret(false);
      });
  }, []);

  // Ngarko produktet për furnitorin
  useEffect(() => {
    if (!selectedFurnitor) {
      setProduktetOrigjinale([]);
      setProduktet([]);
      return;
    }

    setLoadingProduktet(true);

    axios
      .get(`${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`, auth)
      .then(async (res) => {
        const produktetEFurnitorit = res.data.filter(
          (p) => p.idPartneri === selectedFurnitor.value
        );

        const sugjerimet = await Promise.all(
          produktetEFurnitorit.map(async (p) => {
            try {
              const sug = await axios.post(
                `${API_BASE_URL}/api/Njoftimet/suggest-order/${p.produktiID}`,
                {
                  leadTimeWeeks: 1,
                  desiredWeeksCoverage: 2,
                  safetyStockWeeks: 1,
                },
                auth
              );
              return { ...p, suggestion: sug.data };
            } catch {
              return {
                ...p,
                suggestion: {
                  currentStock: p.stokuAktual || 0,
                  averageWeeklySales: 0,
                  recommendedOrderQuantity: 0,
                  currentWeeksCoverage: 0,
                  projectedWeeksCoverage: 0,
                  message: "Gabim në llogaritje",
                  moq: 0,
                  packSize: 1,
                  lastPurchasePrice: 0,
                  lastSupplier: selectedFurnitor.label,
                },
              };
            }
          })
        );

        setProduktetOrigjinale(sugjerimet);
        setProduktet(sugjerimet);
        setLoadingProduktet(false);
      })
      .catch((err) => {
        console.error(err);
        setProduktetOrigjinale([]);
        setProduktet([]);
        setLoadingProduktet(false);
      });
  }, [selectedFurnitor]);

  // Kërkimi live
  useEffect(() => {
    if (!searchTerm.trim()) {
      setProduktet(produktetOrigjinale);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtruar = produktetOrigjinale.filter(
      (p) =>
        p.barkodi.toLowerCase().includes(term) ||
        p.emriProduktit.toLowerCase().includes(term)
    );
    setProduktet(filtruar);
  }, [searchTerm, produktetOrigjinale]);

  const handleFurnitorChange = (selected) => {
    setSelectedFurnitor(selected);
    setSearchTerm("");
  };

  const handleRowClick = (produkt) => {
    setSelectedProduktDetaje(produkt);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <Titulli titulli="Sugjerim Porosie sipas Furnitorit" />
      <KontrolloAksesinNeFaqe
        roletELejuara={["Menaxher", "Kalkulant", "Pergjegjes i Porosive"]}
      />
      <NavBar />

      <Container className="py-4 py-md-5">
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-primary mb-3">
            Porosi javore dhe mujore sipas Furnitorit
          </h1>
          <p className="lead text-muted">
            Zgjidh furnitorin, kërko produktet dhe kliko për detaje
          </p>
        </div>

        {/* Zgjidh Furnitorin */}
        <Row className="justify-content-center mb-4">
          <Col lg={8} xl={6}>
            <Select
              value={selectedFurnitor}
              onChange={handleFurnitorChange}
              options={furnitoret}
              placeholder="Zgjidh furnitorin..."
              isClearable
              isLoading={loadingFurnitoret}
              className="shadow-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "12px",
                  padding: "8px",
                  fontSize: "1.1rem",
                }),
              }}
            />
          </Col>

          {/* Kërkimi */}
          {selectedFurnitor && (
            <Col lg={8} xl={6}>
              <Form.Control
                type="text"
                placeholder="Kërko me barkod ose emër produkti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shadow-sm"
                style={{
                  borderRadius: "12px",
                  padding: "12px",
                  fontSize: "1.1rem",
                }}
                autoFocus
              />
            </Col>
          )}
        </Row>
        {/* Loading */}
        {loadingProduktet && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-4 fs-4 text-muted">
              Duke llogaritur sugjerimet për të gjithë produktet...
            </p>
          </div>
        )}

        {/* Tabela */}
        {selectedFurnitor && !loadingProduktet && produktet.length > 0 && (
          <Card className="shadow border-0">
            <Card.Header className="bg-primary text-white text-center py-4">
              <h3 className="mb-0">
                Sugjerime për: <strong>{selectedFurnitor.label}</strong>
                {searchTerm && (
                  <span className="ms-3 small opacity-90">
                    (Rezultate për: "{searchTerm}")
                  </span>
                )}
              </h3>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table
                  hover
                  className="mb-0 align-middle"
                  style={{ cursor: "pointer" }}>
                  <thead className="table-light">
                    <tr>
                      <th>Barkodi</th>
                      <th>Emri Produktit</th>
                      <th className="text-center">Stoku Aktual</th>
                      <th className="text-center">Shitje Javore</th>
                      <th className="text-center text-success">Për 1 Javë</th>
                      <th className="text-center text-success">Për 4 Javë</th>
                      <th className="text-center text-primary">
                        Sugjerim Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {produktet.map((p) => {
                      const s = p.suggestion;
                      const avgWeekly = Math.round(s.averageWeeklySales || 0);
                      const for1Week = avgWeekly;
                      const for4Weeks = avgWeekly * 4;
                      const recommended = Math.max(
                        0,
                        s.recommendedOrderQuantity || 0
                      );

                      return (
                        <tr
                          key={p.produktiID}
                          onClick={() => handleRowClick(p)}>
                          <td>
                            <Badge bg="secondary">{p.barkodi}</Badge>
                          </td>
                          <td className="fw-medium">{p.emriProduktit}</td>
                          <td className="text-center">
                            <span
                              className={
                                s.currentStock < avgWeekly
                                  ? "text-danger fw-bold"
                                  : ""
                              }>
                              {s.currentStock?.toLocaleString() || 0}
                            </span>
                          </td>
                          <td className="text-center">
                            {avgWeekly.toLocaleString()}
                          </td>
                          <td className="text-center text-success fw-bold">
                            {for1Week.toLocaleString()}
                          </td>
                          <td className="text-center text-success fw-bold">
                            {for4Weeks.toLocaleString()}
                          </td>
                          <td className="text-center text-primary fw-bold">
                            {recommended > 0
                              ? recommended.toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Modal për detaje */}
        <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
          {selectedProduktDetaje && (
            <>
              <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                  {selectedProduktDetaje.emriProduktit}
                  <br />
                  <small className="opacity-90">
                    Barkodi: <strong>{selectedProduktDetaje.barkodi}</strong>
                  </small>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="py-5">
                {(() => {
                  const p = selectedProduktDetaje;
                  const s = p.suggestion;
                  const avgWeekly = Math.round(s.averageWeeklySales || 0);
                  const for1Week = avgWeekly;
                  const for4Weeks = avgWeekly * 4;
                  const recommended = Math.max(
                    0,
                    s.recommendedOrderQuantity || 0
                  );

                  const packs1Week =
                    s.packSize > 1 ? Math.ceil(for1Week / s.packSize) : 0;
                  const packs4Weeks =
                    s.packSize > 1 ? Math.ceil(for4Weeks / s.packSize) : 0;
                  const packsRecommended =
                    s.packSize > 1 ? Math.ceil(recommended / s.packSize) : 0;

                  return (
                    <>
                      {/* Header me emrin dhe barkodin */}
                      <div className="text-center mb-5">
                        <h2 className="fw-bold">{p.emriProduktit}</h2>
                        <Badge bg="secondary" className="fs-5 px-4 py-2">
                          {p.barkodi}
                        </Badge>
                      </div>

                      {/* Statistikat kryesore */}
                      <Row className="g-4 text-center mb-5">
                        <Col xs={6} md={3}>
                          <div className="bg-light rounded py-4 border">
                            <p className="text-muted small mb-1">
                              Stoku Aktual
                            </p>
                            <h3
                              className={
                                s.currentStock < avgWeekly
                                  ? "text-danger"
                                  : "text-dark"
                              }>
                              {s.currentStock?.toLocaleString() || 0}
                            </h3>
                            <small>copë</small>
                          </div>
                        </Col>
                        <Col xs={6} md={3}>
                          <div className="bg-light rounded py-4 border">
                            <p className="text-muted small mb-1">
                              Shitje Javore
                            </p>
                            <h3 className="text-primary">
                              {avgWeekly.toLocaleString()}
                            </h3>
                            <small>copë/javë</small>
                          </div>
                        </Col>
                        <Col xs={6} md={3}>
                          <div className="bg-light rounded py-4 border">
                            <p className="text-muted small mb-1">
                              Mbulim Aktual
                            </p>
                            <h3>{s.currentWeeksCoverage.toFixed(1)}</h3>
                            <small>javë</small>
                          </div>
                        </Col>
                        <Col xs={6} md={3}>
                          <div className="bg-light rounded py-4 border">
                            <p className="text-muted small mb-1">
                              Mbulim Pas Porosisë
                            </p>
                            <h3 className="text-success">
                              {s.projectedWeeksCoverage.toFixed(1)}
                            </h3>
                            <small>javë</small>
                          </div>
                        </Col>
                      </Row>

                      {/* POROSITË – SHTESA KRYESORE E RE! */}
                      <div className="text-center mb-5">
                        <h3 className="fw-bold text-dark mb-4">
                          Sasitë e Sugjeruara për Porosi
                        </h3>
                        <Row className="g-4 justify-content-center">
                          {/* 1 Javë */}
                          <Col xs={12} md={4}>
                            <div className="border rounded-4 py-4 bg-success bg-opacity-10">
                              <p className="text-success small fw-bold mb-2">
                                PËR 1 JAVË
                              </p>
                              <h1 className="text-success fw-bold">
                                {for1Week.toLocaleString()} copë
                              </h1>
                              {packs1Week > 0 && (
                                <p className="text-success mb-0">
                                  <strong>{packs1Week} pako</strong> ×{" "}
                                  {s.packSize} copë/pako
                                </p>
                              )}
                            </div>
                          </Col>

                          {/* 4 Javë (Mujore) */}
                          <Col xs={12} md={4}>
                            <div className="border rounded-4 py-4 bg-primary bg-opacity-10">
                              <p className="text-primary small fw-bold mb-2">
                                PËR 4 JAVË (MUJORE)
                              </p>
                              <h1 className="text-primary fw-bold">
                                {for4Weeks.toLocaleString()} copë
                              </h1>
                              {packs4Weeks > 0 && (
                                <p className="text-primary mb-0">
                                  <strong>{packs4Weeks} pako</strong> ×{" "}
                                  {s.packSize} copë/pako
                                </p>
                              )}
                            </div>
                          </Col>
                        </Row>

                        {/* Sugjerimi Total (i sistemit) */}
                        <div className="mt-5 p-4 bg-primary text-white rounded-4">
                          <p className="small mb-2 opacity-90">
                            SUGJERIMI INTELIGJENT I SISTEMIT
                          </p>
                          <h1 className="fw-bold mb-2">
                            {recommended > 0
                              ? `${recommended.toLocaleString()} copë`
                              : "STOK I MJAFTUESHËM"}
                          </h1>
                          {packsRecommended > 0 && (
                            <h4 className="mb-0">
                              <strong>{packsRecommended} pako</strong> ×{" "}
                              {s.packSize} copë/pako
                            </h4>
                          )}
                          <p className="lead mt-3 mb-0">{s.message}</p>
                        </div>
                      </div>

                      {/* Info shtesë */}
                      <div className="border-top pt-4 text-muted small">
                        <Row>
                          <Col md={6}>
                            <strong>MOQ:</strong> {s.moq || 0} copë
                            <br />
                            <strong>Pako:</strong> {s.packSize || 1} copë/pako
                            <br />
                            <strong>Çmimi i fundit:</strong>{" "}
                            {s.lastPurchasePrice || 0} €
                          </Col>
                          <Col md={6} className="text-md-end">
                            <strong>Furnitori:</strong>{" "}
                            {s.lastSupplier || selectedFurnitor.label}
                          </Col>
                        </Row>

                        {s.dataQualityWarning && (
                          <Alert variant="warning" className="mt-4 small">
                            {s.dataQualityWarning}
                          </Alert>
                        )}
                      </div>
                    </>
                  );
                })()}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Mbyll
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal>

        {/* Asnjë rezultat */}
        {selectedFurnitor &&
          !loadingProduktet &&
          searchTerm &&
          produktet.length === 0 && (
            <Alert variant="warning" className="text-center">
              Nuk u gjet asnjë produkt për "<strong>{searchTerm}</strong>"
            </Alert>
          )}

        {/* Asnjë produkt */}
        {selectedFurnitor &&
          !loadingProduktet &&
          !searchTerm &&
          produktet.length === 0 && (
            <Alert variant="info" className="text-center">
              <strong>{selectedFurnitor.label}</strong> nuk ka produkte aktive.
            </Alert>
          )}

        {/* Empty state */}
        {!selectedFurnitor && !loadingFurnitoret && (
          <div className="text-center py-5">
            <i className="bi bi-truck display-1 text-muted mb-4"></i>
            <h3 className="text-muted">
              Zgjidh një furnitor për të parë sugjerimet
            </h3>
          </div>
        )}
      </Container>
    </>
  );
}

export default SugjerimiPorosiseSipasFurnitorit;
