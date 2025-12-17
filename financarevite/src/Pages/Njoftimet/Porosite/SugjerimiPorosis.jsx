import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import Titulli from "../../../Components/TeTjera/Titulli";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";

function SugjerimiPorosise() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [options, setOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`, auth)
      .then((res) =>
        setOptions(
          res.data.map((p) => ({
            value: p.produktiID,
            label: `${p.barkodi} - ${p.emriProduktit}`,
            data: p,
          }))
        )
      )
      .catch(() => {});
  }, []);

  const handleProductChange = async (selected) => {
    setSelectedProduct(selected);
    if (!selected) {
      setSuggestion(null);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/Njoftimet/suggest-order/${selected.value}`,
        { leadTimeWeeks: 1, desiredWeeksCoverage: 2, safetyStockWeeks: 1 },
        auth
      );
      setSuggestion(res.data);
    } catch {
      alert("Gabim në komunikim me serverin");
      setSuggestion(null);
    } finally {
      setLoading(false);
    }
  };

  // PËRMIRËSIME TË REJA
  const isCritical = suggestion?.suggestionLevel === "CRITICAL";
  const isUrgent = suggestion?.suggestionLevel === "HIGH";
  const noNeedToOrder = suggestion?.recommendedOrderQuantity <= 0;

  return (
    <>
      <Titulli titulli="Sugjerim Inteligjent Porosie" />
      <KontrolloAksesinNeFaqe
        roletELejuara={["Menaxher", "Kalkulant", "Pergjegjes i Porosive"]}
      />
      <NavBar />

      <Container className="py-4 py-md-5">
        {/* TITULLI KRYESOR */}
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-primary mb-3">
            Sa duhet të porosis sot?
          </h1>
          <p className="lead text-muted">
            Zgjidh produktin dhe shiko sugjerimin menjëherë
          </p>
        </div>

        {/* KËRKIMI */}
        <Row className="justify-content-center mb-4">
          <Col lg={8} xl={7}>
            <Select
              placeholder="Kërko me barkod ose emër produkti..."
              options={options}
              value={selectedProduct}
              onChange={handleProductChange}
              isClearable
              isLoading={options.length === 0}
              className="shadow-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "12px",
                  padding: "6px",
                }),
              }}
            />
          </Col>
        </Row>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-4 fs-4 text-muted">
              Duke llogaritur... (1-2 sekonda)
            </p>
          </div>
        )}

        {/* REZULTATI */}
        {suggestion && (
          <>
            {/* BANNER I MADH – SHUMË I DUKSHËM */}
            <div
              className={`text-center py-5 px-4 rounded-4 shadow-lg mb-5 text-white ${
                noNeedToOrder
                  ? "bg-success"
                  : isCritical
                  ? "bg-danger"
                  : isUrgent
                  ? "bg-warning text-dark"
                  : "bg-info"
              }`}>
              {noNeedToOrder ? (
                <>
                  <i className="bi bi-check-circle-fill display-1 mb-3"></i>
                  <h1 className="display-4 fw-bold">STOK I MJAFTUESHËM</h1>
                  <h4 className="opacity-90">Nuk ka nevojë për porosi tani</h4>
                </>
              ) : (
                <>
                  <i className="bi bi-cart-fill display-1 mb-3"></i>
                  <h1 className="display-4 fw-bold mb-2">
                    POROSIT{" "}
                    {suggestion.recommendedOrderQuantity.toLocaleString()} COPË
                  </h1>

                  {/* SHTESA E RE – SHUMË E RËNDËSISHME PËR DEPON! */}
                  {suggestion.packSize > 1 &&
                    suggestion.recommendedOrderQuantity > 0 && (
                      <h3 className="text-white mb-4 opacity-90">
                        <strong>
                          (
                          {Math.ceil(
                            suggestion.recommendedOrderQuantity /
                              suggestion.packSize
                          )}{" "}
                          pako × {suggestion.packSize} copë/pako)
                        </strong>
                      </h3>
                    )}

                  <h5 className={isCritical ? "" : "text-dark opacity-90"}>
                    {suggestion.message}
                  </h5>
                </>
              )}
            </div>

            {/* KARTA KRYESORE */}
            <Row className="justify-content-center">
              <Col lg={10} xl={9}>
                <Card className="border-0 shadow">
                  <Card.Header className="bg-primary text-white text-center py-4 rounded-top">
                    <h3 className="mb-1">{suggestion.productName}</h3>
                    <Badge bg="light" text="dark" className="fs-6">
                      {selectedProduct.data.barkodi}
                    </Badge>
                  </Card.Header>

                  <Card.Body className="p-4 p-md-5">
                    <Row className="text-center g-4">
                      {/* 1. Stoku Aktual */}
                      <Col xs={6} md={{ span: 2, offset: 1 }}>
                        <div className="bg-light rounded-3 py-3">
                          <p className="mb-1 text-muted small">Stoku Aktual</p>
                          <h2
                            className={
                              suggestion.currentStock < 0
                                ? "text-danger"
                                : "text-dark"
                            }>
                            {suggestion.currentStock.toLocaleString()}
                          </h2>
                          <small>copë</small>
                        </div>
                      </Col>

                      {/* 2. Shitje Javore Mesatare – SHTESA E RE! */}
                      <Col xs={6} md={2}>
                        <div className="bg-light rounded-3 py-3">
                          <p className="mb-1 text-muted small">Shitje Javore</p>
                          <h2 className="text-primary">
                            {Math.round(
                              suggestion.averageWeeklySales
                            ).toLocaleString()}
                          </h2>
                          <small>copë/javë</small>
                        </div>
                      </Col>

                      {/* 3. Mbulim Aktual */}
                      <Col xs={6} md={2}>
                        <div className="bg-light rounded-3 py-3">
                          <p className="mb-1 text-muted small">Mbulim Aktual</p>
                          <h2
                            className={
                              suggestion.currentWeeksCoverage < 1
                                ? "text-warning"
                                : ""
                            }>
                            {suggestion.currentWeeksCoverage.toFixed(1)}
                          </h2>
                          <small>javë</small>
                        </div>
                      </Col>

                      {/* 4. Pas Porosisë */}
                      <Col xs={6} md={2}>
                        <div className="bg-light rounded-3 py-3">
                          <p className="mb-1 text-muted small">Pas Porosisë</p>
                          <h2 className="text-success">
                            {suggestion.projectedStockAfterOrder.toLocaleString()}
                          </h2>
                          <small>copë</small>
                        </div>
                      </Col>

                      {/* 5. Mbulim i Ardhshëm */}
                      <Col xs={6} md={2}>
                        <div className="bg-light rounded-3 py-3">
                          <p className="mb-1 text-muted small">
                            Mbulim i Ardhshëm
                          </p>
                          <h2 className="text-success">
                            {suggestion.projectedWeeksCoverage.toFixed(1)}
                          </h2>
                          <small>javë</small>
                        </div>
                      </Col>
                    </Row>

                    {/* INFO TË TJERA */}
                    <div className="mt-5 pt-4 border-top">
                      <Row className="text-muted small">
                        <Col md={6}>
                          <strong>MOQ:</strong> {suggestion.moq} copë
                          <br />
                          <strong>Pako:</strong> {suggestion.packSize} copë/pako
                        </Col>
                        <Col md={6} className="text-end">
                          <strong>Çmimi i fundit:</strong>{" "}
                          {suggestion.lastPurchasePrice} €<br />
                          <strong>Furnitori:</strong> {suggestion.lastSupplier}
                        </Col>
                      </Row>

                      {suggestion.dataQualityWarning && (
                        <Alert variant="warning" className="mt-4 text-center">
                          {suggestion.dataQualityWarning}
                        </Alert>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* EMPTY STATE */}
        {!selectedProduct && !loading && (
          <div className="text-center py-5">
            <i className="bi bi-search display-1 text-muted mb-4"></i>
            <h3 className="text-muted mt-4">
              Zgjidh një produkt për të parë sugjerimin
            </h3>
            <p className="text-muted">Funksionon në çast – pa pritje</p>
          </div>
        )}
      </Container>
    </>
  );
}

export default SugjerimiPorosise;
