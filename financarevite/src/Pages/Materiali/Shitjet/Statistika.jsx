import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import { Col, Row, Card, Badge, Container, Tabs, Tab, Button } from "react-bootstrap";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  BarChart3,
  RefreshCw,
  UserCheck,
  Store,
  Receipt,
  Layers
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import ChartComponent from "../../../Components/TeTjera/Chart/ChartComponent";
import Titulli from "../../../Components/TeTjera/Titulli";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import { TailSpin } from "react-loader-spinner";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import "../../Styles/Statistika.css";
import "../../Styles/DizajniPergjithshem.css";

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, delay }) => (
  <Card className="stat-card-modern h-100" data-aos="fade-up" data-aos-delay={delay}>
    <Card.Body>
      <div className={`icon-box bg-${color}-subtle text-${color}`}>
        <Icon size={24} />
      </div>
      <div className="kpi-label mb-1">{title}</div>
      <h3 className="kpi-value mb-2">{value}</h3>
      {trend && (
        <div className={`trend-badge ${trend === "up" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
          {trend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trendValue}</span>
        </div>
      )}
    </Card.Body>
  </Card>
);

const ComparisonCard = ({ title, value, compareValue, suffix, isCurrency, delay }) => {
  const diff = value - compareValue;
  const isPositive = diff >= 0;

  return (
    <Card className="stat-card-modern h-100" data-aos="fade-up" data-aos-delay={delay}>
      <Card.Body>
        <div className="kpi-label mb-1">{title}</div>
        <h3 className="kpi-value mb-3">{isCurrency ? `${parseFloat(value || 0).toFixed(2)} €` : value}</h3>
        <div className={`p-2 rounded-3 d-flex align-items-center gap-2 ${isPositive ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`} style={{ fontSize: "0.85rem" }}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="fw-bold">{Math.abs(diff).toFixed(isCurrency ? 2 : 0)}{isCurrency ? " €" : ""}</span>
          <span className="opacity-75">{suffix}</span>
        </div>
      </Card.Body>
    </Card>
  );
};

function Statistika() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [totaleTeNdryshme, setTotaleTeNdryshme] = useState([]);
  const [top15Bleresit, setTop15Bleresit] = useState([]);
  const [top15Bizneset, setTop15Bizneset] = useState([]);
  const [top15Produktet, setTop15Produktet] = useState([]);
  const [shitjetJavore, setShitjetJavore] = useState([]);
  const [shitjetMeParagon, setShitjetMeParagon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const getToken = localStorage.getItem("token");

  const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        totaletRes,
        bleresitRes,
        biznesetRes,
        produktetRes,
        javoreRes,
        paragonRes,
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/Statistikat/totaleTeNdryshme`, authentikimi),
        axios.get(`${API_BASE_URL}/api/Statistikat/15BleresitQytetarMeSeShumtiBlerje`, authentikimi),
        axios.get(`${API_BASE_URL}/api/Statistikat/15BleresitBiznesorMeSeShumtiBlerje`, authentikimi),
        axios.get(`${API_BASE_URL}/api/Statistikat/15ProduktetMeTeShitura`, authentikimi),
        axios.get(`${API_BASE_URL}/api/Statistikat/TotaletJavore`, authentikimi),
        axios.get(`${API_BASE_URL}/api/Statistikat/ShitjetMeParagonSipasOperatorit`, authentikimi),
      ]);

      setTotaleTeNdryshme(totaletRes.data);
      setTop15Bleresit(bleresitRes.data);
      setTop15Bizneset(biznesetRes.data);
      setTop15Produktet(produktetRes.data);
      setShitjetJavore(javoreRes.data);
      setShitjetMeParagon(paragonRes.data);
    } catch (e) {
      console.error("Error fetching statistics:", e);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, authentikimi]);

  useEffect(() => {
    fetchAllData();
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-quad"
    });
  }, [fetchAllData]);

  const produktetData = useMemo(() => ({
    labels: top15Produktet?.map((k) => k.produkti?.emriProduktit) || [],
    datasets: [
      {
        label: "Sasia e Shitur",
        data: top15Produktet?.map((k) => k.totaliPorosive) || [],
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "#10b981",
        borderRadius: 8,
      },
      {
        label: "Vlera në €",
        data: top15Produktet?.map((k) => parseFloat(k.totaliBlerjeve || 0).toFixed(2)) || [],
        backgroundColor: "rgba(6, 182, 212, 0.7)",
        borderColor: "#06b6d4",
        borderRadius: 8,
      },
    ],
  }), [top15Produktet]);

  const shitjetJavoreData = useMemo(() => ({
    labels: shitjetJavore?.totaletDitore?.map((k) => {
      const d = new Date(k.data);
      const days = ["Dje", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"];
      return days[d.getDay()];
    }) || [],
    datasets: [
      {
        label: "Shitjet €",
        data: shitjetJavore?.totaletDitore?.map((k) => parseFloat(k.totaliShitjeveDitore || 0).toFixed(2)) || [],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  }), [shitjetJavore]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#f1f5f9' } },
    },
    scales: {
      y: { grid: { display: false, color: 'rgba(255,255,255,0.05)' }, beginAtZero: true, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false, color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
    },
  }), []);

  const totalShitjeveGjithsej = parseFloat(
    (totaleTeNdryshme?.totaliShitjeve || 0) +
    (totaleTeNdryshme?.totaliShitjeveParagonEuro || 0)
  ).toFixed(2);

  // ============================================================================
  // Loading State
  // ============================================================================
  if (loading) {
    return (
      <div className="stat-dashboard-container">
        <KontrolloAksesinNeFaqe roletELejuara={["Menaxher"]} />
        <Titulli titulli={"Statistika | Dashboard"} />
        <NavBar />
        <Container className="py-4 d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="d-flex flex-column align-items-center gap-3">
            <TailSpin height="60" width="60" color="#10b981" ariaLabel="tail-spin-loading" radius="1" visible={true} />
            <span className="text-muted fw-bold">Duke ngarkuar të dhënat...</span>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="stat-dashboard-container">
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher"]} />
      <Titulli titulli={"Statistika | Dashboard"} />
      <NavBar />

      <Container className="py-4">
        <header className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3" data-aos="fade-down">
          <div>
            <h2 className="fw-bold text-white mb-1">Qendra e Statistikave</h2>
            <p className="text-secondary mb-0">Monitoroni performancën në kohë reale.</p>
          </div>
          <Button variant="outline-light" className="btn-white shadow-sm rounded-pill px-4 d-flex align-items-center gap-2 py-2" onClick={fetchAllData}>
            <RefreshCw size={18} className={loading ? "spin" : ""} />
            Përditëso
          </Button>
        </header>

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="custom-tabs mb-5 border-0" id="statistikat-tabs">
          <Tab eventKey="overview" title={<div className="d-flex align-items-center gap-2"><Layers size={18} /> Përmbledhja</div>}>
            <div className="mt-4">
              <Row className="g-4 mb-5">
                <Col lg={3} sm={6}>
                  <StatCard title="Shitjet Totale" value={`${totalShitjeveGjithsej} €`} icon={DollarSign} color="primary" delay={0} />
                </Col>
                <Col lg={3} sm={6}>
                  <StatCard title="Stoku Total" value={totaleTeNdryshme.totaliProdukteve} icon={Package} color="info" delay={100} />
                </Col>
                <Col lg={3} sm={6}>
                  <StatCard title="Klientë" value={totaleTeNdryshme.totaliKlient} icon={Users} color="success" delay={200} />
                </Col>
                <Col lg={3} sm={6}>
                  <StatCard title="Paragonë" value={totaleTeNdryshme.totaliShitjeveParagon} icon={Receipt} color="warning" delay={300} />
                </Col>
              </Row>

              <Row className="g-4 mb-5">
                <Col lg={8} data-aos="fade-right">
                  <Card className="stat-card-modern border-0">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <h5 className="fw-bold mb-0 text-white">Trendi i Shitjeve Javore</h5>
                        <Badge bg="primary-subtle" text="primary" className="rounded-pill px-3">7 Ditët e Fundit</Badge>
                      </div>
                      <div style={{ height: "350px" }}>
                        <ChartComponent chartType="line" chartData={shitjetJavoreData} chartOptions={chartOptions} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={4}>
                  <h6 className="kpi-label mb-3 px-1">Performanca Ditore vs Mujore</h6>
                  <div className="d-flex flex-column gap-3">
                    <ComparisonCard
                      title="Sot"
                      value={totaleTeNdryshme.totaliShitjeveSotme}
                      compareValue={totaleTeNdryshme.totaliShitjeveDjeshme}
                      suffix="vs dje"
                      isCurrency={true}
                      delay={0}
                    />
                    <ComparisonCard
                      title="Këtë Muaj"
                      value={totaleTeNdryshme.totaliShitjeveKeteMuaj}
                      compareValue={totaleTeNdryshme.totaliShitjeveMuajinKaluar}
                      suffix="vs kaluar"
                      isCurrency={true}
                      delay={100}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </Tab>

          <Tab eventKey="operations" title={<div className="d-flex align-items-center gap-2"><UserCheck size={18} /> Operimet</div>}>
            <Row className="g-4 mt-2">
              {[
                { title: "Shitjet Ditore", data: shitjetMeParagon?.shitjetDitore, opKey: "shitjetDitoreSipasOperatorit", totalPar: "shitjetDitoreParagon", totalEur: "shitjetDitoreEuro" },
                { title: "Shitjet Javore", data: shitjetMeParagon?.shitjetJavore, opKey: "shitjetJavoreSipasOperatorit", totalPar: "shitjetJavoreParagon", totalEur: "shitjetJavoreEuro" },
                { title: "Shitjet Mujore", data: shitjetMeParagon?.shitjetMujore, opKey: "shitjetMujoreSipasOperatorit", totalPar: "shitjetMujoreParagon", totalEur: "shitjetMujoreEuro" }
              ].map((period, idx) => (
                <Col key={idx} lg={4} data-aos="zoom-in" data-aos-delay={idx * 100}>
                  <Card className="stat-card-modern border-0">
                    <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-2">
                      <h6 className="fw-bold text-white mb-0">{period.title}</h6>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="premium-table-container">
                        <MDBTable hover striped small className="mb-0 text-center">
                          <MDBTableHead >
                            <tr className="small text-muted text-uppercase">
                              <th className="py-3">Stafi</th>
                              <th className="py-3">Par.</th>
                              <th className="py-3">Vlera</th>
                            </tr>
                          </MDBTableHead>
                          <MDBTableBody>
                            {period.data?.[period.opKey]?.map((k) => (
                              <tr key={k?.stafi?.userID}>
                                <td className="py-3 fw-semibold">{k?.stafi?.username}</td>
                                <td className="py-3">{k.numriBlerjeve}</td>
                                <td className="py-3 text-info fw-bold">{parseFloat(k.totaliBlerjeveEuro || 0).toFixed(2)} €</td>
                              </tr>
                            ))}
                            <tr className="table-light fw-bold border-top">
                              <td className="py-3">TOTALI</td>
                              <td className="py-3">{period.data?.[period.totalPar]}</td>
                              <td className="py-3 text-danger">{parseFloat(period.data?.[period.totalEur] || 0).toFixed(2)} €</td>
                            </tr>
                          </MDBTableBody>
                        </MDBTable>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Tab>

          <Tab eventKey="insights" title={<div className="d-flex align-items-center gap-2"><BarChart3 size={18} /> Analitika</div>}>
            <div className="mt-4">
              <Row className="g-4 mb-5">
                <Col lg={7} data-aos="fade-right">
                  <Card className="stat-card-modern border-0">
                    <Card.Body className="p-4">
                      <h5 className="fw-bold mb-4 text-white">Top 15 Produktet më të Shitura</h5>
                      <div style={{ height: "400px" }}>
                        <ChartComponent chartType="bar" chartData={produktetData} chartOptions={chartOptions} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col lg={5}>
                  <div className="d-flex flex-column gap-4">
                    <Card className="stat-card-modern border-0" data-aos="fade-left">
                      <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between">
                        <h6 className="fw-bold mb-0 text-white">Top Blerësit Qytetarë</h6>
                        <UserCheck size={18} className="text-info" />
                      </Card.Header>
                      <Card.Body className="p-4 pt-2">
                        <div className="table-responsive" style={{ maxHeight: "300px" }}>
                          <MDBTable hover small striped className="mb-0">
                            <MDBTableBody>
                              {top15Bleresit.slice(0, 8).map((k, i) => (
                                <tr key={i} className="border-0">
                                  <td className="border-0 py-2"><div className="fw-bold">{k?.partneri?.emriBiznesit}</div><small className="text-muted">{k?.partneri?.kartela?.kodiKartela || "Pa Kartelë"}</small></td>
                                  <td className="border-0 text-end py-2 align-middle text-primary fw-bold">{parseFloat(k?.totaliBlerjeveEuro || 0).toFixed(2)} €</td>
                                </tr>
                              ))}
                            </MDBTableBody>
                          </MDBTable>
                        </div>
                      </Card.Body>
                    </Card>

                    <Card className="stat-card-modern border-0" data-aos="fade-left" data-aos-delay="100">
                      <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between">
                        <h6 className="fw-bold mb-0 text-white">Partnerët Biznesorë Top</h6>
                        <Store size={18} className="text-primary" />
                      </Card.Header>
                      <Card.Body className="p-4 pt-2">
                        <div className="table-responsive" style={{ maxHeight: "300px" }}>
                          <MDBTable hover small striped className="mb-0">
                            <MDBTableBody>
                              {top15Bizneset.slice(0, 8).map((k, i) => (
                                <tr key={i} className="border-0">
                                  <td className="border-0 py-2"><div className="fw-bold">{k?.partneri?.emriBiznesit}</div></td>
                                  <td className="border-0 text-end py-2 align-middle text-primary fw-bold">{parseFloat(k?.totaliBlerjeveEuro || 0).toFixed(2)} €</td>
                                </tr>
                              ))}
                            </MDBTableBody>
                          </MDBTable>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </Col>
              </Row>
            </div>
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
}

export default Statistika;
