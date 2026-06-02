import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Col, Row, Card, Badge, Container, Tabs, Tab, Button } from "react-bootstrap";
import {
  TrendingUp, TrendingDown, DollarSign, Package, Users, BarChart3,
  RefreshCw, UserCheck, Store, Receipt, Layers, CalendarClock,
  ShoppingCart, Banknote, CreditCard, Activity, PiggyBank, Sparkles
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import ChartComponent from "../../../Components/TeTjera/Chart/ChartComponent";
import Titulli from "../../../Components/TeTjera/Titulli";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import "../../Styles/Statistika.css";
import "../../Styles/DizajniPergjithshem.css";

// --- Shared mini-components ---
const StatCard = ({ title, value, icon: IconComp, color, trend, trendValue, delay }) => ( // eslint-disable-line no-unused-vars
  <Card className="stat-card-modern h-100" data-aos="fade-up" data-aos-delay={delay}>
    <Card.Body>
      <div className={`icon-box bg-${color}-subtle text-${color}`}><IconComp size={24} /></div>
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

// --- Ranked list row ---
const RankedRow = ({ rank, name, sub, value, share, barColor = "#10b981" }) => (
  <div className="d-flex align-items-center gap-2 mb-2 py-1">
    <span className="text-secondary fw-bold" style={{ minWidth: 22, fontSize: "0.8rem" }}>#{rank}</span>
    <div className="flex-grow-1 min-w-0">
      <div className="fw-semibold text-white text-truncate" style={{ fontSize: "0.85rem" }}>{name}</div>
      {sub && <div className="text-secondary" style={{ fontSize: "0.7rem" }}>{sub}</div>}
    </div>
    <span className="fw-bold text-info" style={{ fontSize: "0.85rem", minWidth: 85, textAlign: "right" }}>{value}</span>
    <div style={{ minWidth: 55 }}>
      <div className="op-bar-track" style={{ height: 5 }}>
        <div className="op-bar-fill" style={{ width: `${share}%`, height: 5, background: `linear-gradient(90deg, ${barColor}, ${barColor}aa)` }} />
      </div>
    </div>
    <span className="text-secondary" style={{ fontSize: "0.7rem", minWidth: 32 }}>{share.toFixed(1)}%</span>
  </div>
);

// --- Main Component ---
function Statistika() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [totaleTeNdryshme, setTotaleTeNdryshme] = useState({});
  const [top15Bleresit, setTop15Bleresit] = useState([]);
  const [top15Bizneset, setTop15Bizneset] = useState([]);
  const [top15Produktet, setTop15Produktet] = useState([]);
  const [shitjetJavore, setShitjetJavore] = useState({});
  const [shitjetMeParagon, setShitjetMeParagon] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sot");
  const [sotSubTab, setSotSubTab] = useState("permbledhja");
  const [opSubTab, setOpSubTab] = useState("ditore");
  const [analSubTab, setAnalSubTab] = useState("produktet");

  const getToken = localStorage.getItem("token");
  const authentikimi = useMemo(() => ({ headers: { Authorization: `Bearer ${getToken}` } }), [getToken]);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [totaletRes, bleresitRes, biznesetRes, produktetRes, javoreRes, paragonRes] = await Promise.all([
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
    AOS.init({ duration: 800, once: true, easing: "ease-out-quad" });
  }, [fetchAllData]);

  const produktetData = useMemo(() => ({
    labels: top15Produktet?.map((k) => k.produkti?.emriProduktit) || [],
    datasets: [
      { label: "Sasia e Shitur", data: top15Produktet?.map((k) => k.totaliPorosive) || [], backgroundColor: "rgba(16,185,129,0.7)", borderColor: "#10b981", borderRadius: 8 },
      { label: "Vlera ne €", data: top15Produktet?.map((k) => parseFloat(k.totaliBlerjeve || 0).toFixed(2)) || [], backgroundColor: "rgba(6,182,212,0.7)", borderColor: "#06b6d4", borderRadius: 8 },
    ],
  }), [top15Produktet]);

  const shitjetJavoreData = useMemo(() => ({
    labels: shitjetJavore?.totaletDitore?.map((k) => { const d = new Date(k.data); return ["Die", "Hen", "Mar", "Mer", "Enj", "Pre", "Sht"][d.getDay()]; }) || [],
    datasets: [{
      label: "Shitjet €",
      data: shitjetJavore?.totaletDitore?.map((k) => parseFloat(k.totaliShitjeveDitore || 0).toFixed(2)) || [],
      borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.15)", fill: true, tension: 0.4,
      pointRadius: 6, pointBackgroundColor: "#10b981", pointBorderColor: "#fff", pointBorderWidth: 2,
    }],
  }), [shitjetJavore]);

  const chartOptions = useMemo(() => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { color: "#f1f5f9" } } },
    scales: {
      y: { grid: { color: "rgba(255,255,255,0.05)" }, beginAtZero: true, ticks: { color: "#94a3b8" } },
      x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
    },
  }), []);

  const totalShitjeveGjithsej = parseFloat((totaleTeNdryshme?.totaliShitjeve || 0) + (totaleTeNdryshme?.totaliShitjeveParagonEuro || 0)).toFixed(2);

  const groupByUser = (rows = []) => {
    const map = new Map();
    rows.forEach((k) => {
      const id = k?.stafi?.userID ?? k?.stafi?.username ?? "unknown";
      if (map.has(id)) { const e = map.get(id); e.numriBlerjeve += k.numriBlerjeve || 0; e.totaliBlerjeveEuro += parseFloat(k.totaliBlerjeveEuro || 0); }
      else map.set(id, { stafi: k.stafi, numriBlerjeve: k.numriBlerjeve || 0, totaliBlerjeveEuro: parseFloat(k.totaliBlerjeveEuro || 0) });
    });
    return Array.from(map.values()).sort((a, b) => b.totaliBlerjeveEuro - a.totaliBlerjeveEuro);
  };

  // --- Loading ---
  if (loading) {
    return (
      <div className="stat-dashboard-container">
        <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "1 Euro Menaxher"]} />
        <Titulli titulli={"Statistika | Dashboard"} />
        <NavBar />
        <Container fluid className="py-4 d-flex justify-content-center align-items-center" style={{ minHeight: "75vh" }}>
          <div className="d-flex flex-column align-items-center justify-content-center text-center p-5 stat-card-modern border-0" style={{ maxWidth: "450px" }}>
            <div className="position-relative mb-4" style={{ width: "90px", height: "90px" }}>
              <div className="position-absolute top-0 start-0 w-100 h-100 rounded-circle" style={{ border: "4px solid rgba(16,185,129,0.1)" }} />
              <div className="position-absolute top-0 start-0 w-100 h-100 rounded-circle spin" style={{ border: "4px solid #10b981", borderLeftColor: "transparent", borderBottomColor: "transparent" }} />
              <div className="position-absolute top-50 start-50 translate-middle"><BarChart3 size={32} className="text-emerald" /></div>
            </div>
            <h4 className="fw-bold text-white mb-2">Duke Përgatitur Statistikat</h4>
            <p className="text-secondary mb-0">Ju lutem prisni pak sekonda ndërkohë që po analizojmë të dhënat tuaja të shitjeve.</p>
          </div>
        </Container>
      </div>
    );
  }

  // --- Shared KPI mini-cell ---
  const KpiMini = ({ label, val, note, noteColor, bg = "rgba(255,255,255,0.04)", border = "rgba(255,255,255,0.08)" }) => (
    <div className="p-3 rounded-3" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="kpi-label mb-1" style={{ fontSize: "0.63rem" }}>{label}</div>
      <div className="fw-bold text-white" style={{ fontSize: "1.15rem" }}>{val}</div>
      {note && <div className={`text-${noteColor}`} style={{ fontSize: "0.7rem", marginTop: 2 }}>{note}</div>}
    </div>
  );

  return (
    <div className="stat-dashboard-container">
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "1 Euro Menaxher"]} />
      <Titulli titulli={"Statistika | Dashboard"} />
      <NavBar />

      <Container fluid className="py-4" style={{ paddingLeft: "2rem", paddingRight: "2rem" }}>
        <header className="d-flex align-items-center justify-content-between mb-5 flex-wrap gap-3" data-aos="fade-down">
          <div>
            <h2 className="fw-bold text-white mb-1">Qendra e Statistikave</h2>
            <p className="text-secondary mb-0">Monitoroni performancen ne kohe reale.</p>
          </div>
          <Button variant="outline-light" className="btn-white shadow-sm rounded-pill px-4 d-flex align-items-center gap-2 py-2" onClick={fetchAllData}>
            <RefreshCw size={18} className={loading ? "spin" : ""} />Perditeso
          </Button>
        </header>

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="custom-tabs mb-5 border-0" id="statistikat-tabs">

          {/* ═══════════════ SOT TAB ═══════════════ */}
          <Tab eventKey="sot" title={<div className="d-flex align-items-center gap-2"><CalendarClock size={18} /> Sot</div>}>
            {(() => {
              const ditore = shitjetMeParagon?.shitjetDitore;
              const operators = groupByUser(ditore?.shitjetDitoreSipasOperatorit);
              const totalPar = ditore?.shitjetDitoreParagon || 0;
              const totalEur = parseFloat(ditore?.shitjetDitoreEuro || 0);
              const avgTicket = totalPar > 0 ? totalEur / totalPar : 0;
              const totalDjeshme = parseFloat(totaleTeNdryshme?.totaliShitjeveDjeshme || 0);
              const totalSotme = parseFloat(totaleTeNdryshme?.totaliShitjeveSotme || 0);
              const diff = totalSotme - totalDjeshme;
              const isUp = diff >= 0;
              const pct = totalDjeshme > 0 ? Math.abs(diff / totalDjeshme * 100).toFixed(1) : null;
              const progress = totalDjeshme > 0 ? Math.min(totalSotme / totalDjeshme * 100, 150) : 100;
              const parDjeshme = totaleTeNdryshme?.totaliPorosiveDjeshme || 0;
              const avgDjeshme = parDjeshme > 0 ? totalDjeshme / parDjeshme : 0;
              const fatSotEur = Math.max(totalSotme - totalEur, 0);
              const fatSotPar = totaleTeNdryshme?.totaliPorosiveSotme || 0;
              const fatAvg = fatSotPar > 0 ? fatSotEur / fatSotPar : 0;
              const fatDjeEur = Math.max(totalDjeshme - totalEur, 0);
              const fatDjePar = totaleTeNdryshme?.totaliPorosiveDjeshme || 0;
              const fatDiff = fatSotEur - fatDjeEur;
              const fatUp = fatDiff >= 0;
              const javoreData = shitjetJavore?.totaletDitore || [];
              const fatJavEur = parseFloat(shitjetJavore?.TotaletJavore?.TotaliShitjeveJavore || 0);
              const fatJavPar = shitjetJavore?.TotaletJavore?.TotaliPorosiveJavore || 0;
              return (
                <div className="mt-4">
                  <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="live-dot" />
                      <span className="text-secondary" style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        POS / Paragon - {(() => {
                          const days = ["E Diel", "E Hënë", "E Martë", "E Mërkurë", "E Enjte", "E Premte", "E Shtunë"];
                          const months = ["Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"];
                          const d = new Date();
                          return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
                        })().toUpperCase()}
                      </span>
                    </div>
                    <div className="subtab-pills">
                      {[{ key: "permbledhja", label: "Përmbledhja" }, { key: "operatoret", label: "Operatorët" }, { key: "krahasimi", label: "Krahasimi" }].map(st => (
                        <button key={st.key} className={`subtab-pill ${sotSubTab === st.key ? "active" : ""}`} onClick={() => setSotSubTab(st.key)}>{st.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* SOT: Përmbledhja */}
                  {sotSubTab === "permbledhja" && (() => {
                    return (
                      <>
                        {/* WIDGET: Pasqyra e Profitit Ditor */}
                        <Card className="stat-card-modern border-0 mb-4 overflow-hidden position-relative" style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(20, 184, 166, 0.05) 100%)", border: "1px solid rgba(16, 185, 129, 0.15) !important" }}>
                          <div className="position-absolute" style={{ width: "150px", height: "150px", background: "rgba(16, 185, 129, 0.15)", filter: "blur(60px)", top: "-30px", right: "-30px", borderRadius: "50%", zIndex: 0 }} />
                          <div className="position-absolute" style={{ width: "100px", height: "100px", background: "rgba(20, 184, 166, 0.1)", filter: "blur(40px)", bottom: "-20px", left: "-20px", borderRadius: "50%", zIndex: 0 }} />
                          
                          <Card.Body className="p-4 position-relative" style={{ zIndex: 1 }}>
                            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                              <div className="d-flex align-items-center gap-3">
                                <div className="icon-box bg-success-subtle text-success mb-0" style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <PiggyBank size={22} className="text-success" />
                                </div>
                                <div>
                                  <h5 className="fw-bold text-white mb-0" style={{ letterSpacing: "-0.02em" }}>Pasqyra e Profitit Ditor</h5>
                                  <p className="text-secondary mb-0" style={{ fontSize: "0.75rem" }}>Përllogaritja e saktë e fitimit, blerjeve, shitjeve dhe marzhit për ditën e sotme.</p>
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <Badge bg="success-subtle" text="success" className="rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-1" style={{ fontSize: "0.75rem" }}>
                                  <Activity size={14} /> LIVE P&L
                                </Badge>
                              </div>
                            </div>

                            <Row className="g-4 mb-4">
                              <Col xl={3} lg={6}>
                                <div className="p-3 rounded-4 h-100 position-relative d-flex flex-column justify-content-between" style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                                  <div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <span className="text-secondary" style={{ fontSize: "0.75rem", fontWeight: 600 }}>FITIMI NETO SOT</span>
                                      <Badge bg="success" className="rounded-pill" style={{ fontSize: "0.65rem", padding: "3px 8px" }}>PA TVSH</Badge>
                                    </div>
                                    <h3 className="fw-bold text-success mb-1" style={{ fontSize: "1.85rem", letterSpacing: "-0.03em" }}>
                                      {parseFloat(totaleTeNdryshme?.profitiBrutoSotme || 0).toFixed(2)} €
                                    </h3>
                                  </div>
                                  <div className="text-secondary mt-2" style={{ fontSize: "0.72rem" }}>
                                    Pse pa TVSH? TVSH nuk është fitim, i takon shtetit. Ky është fitimi juaj real!
                                  </div>
                                </div>
                              </Col>

                              <Col xl={3} lg={6}>
                                <div className="p-3 rounded-4 h-100 position-relative d-flex flex-column justify-content-between" style={{ background: "rgba(6, 182, 212, 0.06)", border: "1px solid rgba(6, 182, 212, 0.15)" }}>
                                  <div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <span className="text-secondary" style={{ fontSize: "0.75rem", fontWeight: 600 }}>MARZHI I PROFITIT</span>
                                      <Badge bg="info-subtle" text="info" className="rounded-pill" style={{ fontSize: "0.65rem", padding: "3px 8px" }}>PËRQINDJA</Badge>
                                    </div>
                                    <div className="d-flex align-items-baseline gap-2">
                                      <h3 className="fw-bold text-info mb-1" style={{ fontSize: "1.85rem", letterSpacing: "-0.03em" }}>
                                        {parseFloat(totaleTeNdryshme?.margjinaSotme || 0).toFixed(1)}%
                                      </h3>
                                      <span className="text-secondary" style={{ fontSize: "0.75rem" }}>Mesatare</span>
                                    </div>
                                  </div>
                                  <div className="mt-2" style={{ fontSize: "0.72rem" }}>
                                    <div className="text-secondary mb-1">Kostoja e mallit të shitur (COGS):</div>
                                    <strong className="text-white">{parseFloat(totaleTeNdryshme?.cogsSotme || 0).toFixed(2)} €</strong> (blerje)
                                  </div>
                                </div>
                              </Col>

                              <Col xl={3} lg={6}>
                                <div className="p-3 rounded-4 h-100 position-relative d-flex flex-column justify-content-between" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                  <div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <span className="text-secondary" style={{ fontSize: "0.75rem", fontWeight: 600 }}>GJITHSEJ SHITUR SOT</span>
                                      <Badge bg="secondary-subtle" text="secondary" className="rounded-pill" style={{ fontSize: "0.65rem", padding: "3px 8px" }}>SHITJET</Badge>
                                    </div>
                                    <h3 className="fw-bold text-white mb-1" style={{ fontSize: "1.85rem", letterSpacing: "-0.03em" }}>
                                      {parseFloat(totaleTeNdryshme?.shitjetSotmeGjithsej || 0).toFixed(2)} €
                                    </h3>
                                  </div>
                                  <div className="text-secondary mt-2" style={{ fontSize: "0.72rem" }}>
                                    <div>Neto (pa TVSH): <strong className="text-white">{parseFloat(totaleTeNdryshme?.shitjetSotmePaTVSH || 0).toFixed(2)} €</strong></div>
                                    <div>TVSH e grumbulluar: <strong className="text-success">+{Math.abs(parseFloat(totaleTeNdryshme?.shitjetSotmeVetemTVSH || 0)).toFixed(2)} €</strong></div>
                                  </div>
                                </div>
                              </Col>

                              <Col xl={3} lg={6}>
                                <div className="p-3 rounded-4 h-100 position-relative d-flex flex-column justify-content-between" style={{ background: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.12)" }}>
                                  <div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <span className="text-secondary" style={{ fontSize: "0.75rem", fontWeight: 600 }}>GJITHSEJ BLERË SOT</span>
                                      <Badge bg="danger-subtle" text="danger" className="rounded-pill" style={{ fontSize: "0.65rem", padding: "3px 8px" }}>FURNIZIME</Badge>
                                    </div>
                                    <h3 className="fw-bold text-danger mb-1" style={{ fontSize: "1.85rem", letterSpacing: "-0.03em" }}>
                                      {parseFloat(totaleTeNdryshme?.blerjetSotmeGjithsej || 0).toFixed(2)} €
                                    </h3>
                                  </div>
                                  <div className="text-secondary mt-2" style={{ fontSize: "0.72rem" }}>
                                    <div>Neto (pa TVSH): <strong className="text-white">{parseFloat(totaleTeNdryshme?.blerjetSotmePaTVSH || 0).toFixed(2)} €</strong></div>
                                    <div>TVSH e paguar: <strong className="text-danger">-{Math.abs(parseFloat(totaleTeNdryshme?.blerjetSotmeVetemTVSH || 0)).toFixed(2)} €</strong></div>
                                  </div>
                                </div>
                              </Col>
                            </Row>

                            <hr style={{ borderColor: "rgba(255, 255, 255, 0.07)", margin: "1.5rem 0" }} />

                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                              <div className="d-flex align-items-center gap-3">
                                <div className={`p-2 rounded-3 ${parseFloat(totaleTeNdryshme?.cashFlowSotme || 0) >= 0 ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`} style={{ fontSize: "0.85rem" }}>
                                  {parseFloat(totaleTeNdryshme?.cashFlowSotme || 0) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                </div>
                                <div>
                                  <div className="text-secondary" style={{ fontSize: "0.7rem" }}>NET CASH-FLOW SOT (SHITJET ME TVSH - BLERJET ME TVSH)</div>
                                  <div className="d-flex align-items-baseline gap-2">
                                    <h5 className={`fw-bold mb-0 ${parseFloat(totaleTeNdryshme?.cashFlowSotme || 0) >= 0 ? "text-success" : "text-danger"}`}>
                                      {parseFloat(totaleTeNdryshme?.cashFlowSotme || 0).toFixed(2)} €
                                    </h5>
                                    <span className="text-secondary" style={{ fontSize: "0.75rem" }}>
                                      {parseFloat(totaleTeNdryshme?.cashFlowSotme || 0) >= 0 ? "(Bilanc Pozitiv)" : "(Bilanc Negativ - Keni investuar në stok)"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="p-3 rounded-3 flex-grow-1 flex-md-grow-0" style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)", maxWidth: "550px" }}>
                                <div className="d-flex align-items-start gap-2">
                                  <div className="text-warning mt-0.5" style={{ minWidth: 16 }}><Sparkles size={16} /></div>
                                  <div style={{ fontSize: "0.72rem", lineHeight: "1.4", color: "#cbd5e1" }}>
                                    <span className="text-white fw-bold">Këshillë Financiare:</span>{" "}
                                    {parseFloat(totaleTeNdryshme?.profitiBrutoSotme || 0) > 0 ? (
                                      <>
                                        Sot keni fituar të pastër <strong className="text-success">{parseFloat(totaleTeNdryshme?.profitiBrutoSotme || 0).toFixed(2)} €</strong>.
                                        <span>
                                          {" "}Nga ky fitim, ju sugjerojmë të ndani <strong className="text-info">{parseFloat(totaleTeNdryshme?.profitiBrutoSotme * 0.3).toFixed(2)} € (30%)</strong> për veten apo shpenzime personale, ndërsa pjesën tjetër prej <strong className="text-white">{parseFloat(totaleTeNdryshme?.profitiBrutoSotme * 0.7).toFixed(2)} € (70%)</strong> ta ri-investoni në biznes për furnizime dhe rritje!
                                        </span>
                                      </>
                                    ) : parseFloat(totaleTeNdryshme?.profitiBrutoSotme || 0) < 0 ? (
                                      <>
                                        Sot jeni në humbje prej <strong className="text-danger">{Math.abs(parseFloat(totaleTeNdryshme?.profitiBrutoSotme || 0)).toFixed(2)} €</strong>.
                                        <span> Nuk ka fitim të regjistruar sot për t'u shpenzuar. Kryeni shitje të reja me marzh pozitiv për të dalë në fitim!</span>
                                      </>
                                    ) : (
                                      <>
                                        Sot nuk keni fitim të regjistruar (<strong className="text-secondary">0.00 €</strong>).
                                        <span> Kryeni shitje të reja me marzh pozitiv për të krijuar fitim!</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>

                        <Card className="stat-card-modern border-0 mb-4">
                          <Card.Body className="p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                              <h6 className="fw-bold text-white mb-0">Progresi Total i Ditës - Sot vs Dje</h6>
                              <div className="d-flex gap-4">
                                <span className="text-secondary" style={{ fontSize: "0.82rem" }}>Dje: <strong className="text-white">{totalDjeshme.toFixed(2)} €</strong></span>
                                <span className={isUp ? "text-success" : "text-danger"} style={{ fontSize: "0.82rem" }}>Sot: <strong>{totalSotme.toFixed(2)} €</strong></span>
                                <span className={`fw-bold ${isUp ? "text-success" : "text-danger"}`} style={{ fontSize: "0.82rem" }}>{isUp ? "+" : ""}{diff.toFixed(2)} €</span>
                              </div>
                            </div>
                            <div className="today-progress-track">
                              <div className={`today-progress-fill ${isUp ? "fill-success" : "fill-danger"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                              {progress > 100 && <div className="today-progress-overflow" style={{ width: `${Math.min(progress - 100, 50)}%` }} />}
                            </div>
                            <div className="d-flex justify-content-between mt-2">
                              <span className="text-secondary" style={{ fontSize: "0.75rem" }}>0 €</span>
                              <span className="text-secondary" style={{ fontSize: "0.75rem" }}>Objektivi (Dje): {totalDjeshme.toFixed(2)} €</span>
                            </div>
                          </Card.Body>
                        </Card>
                        <Row className="g-4">
                          {/* Left: POS Paragonëat */}
                          <Col xl={6}>
                            <Card className="stat-card-modern border-0 h-100">
                              <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="icon-box bg-success-subtle text-success mb-0" style={{ width: 36, height: 36, borderRadius: 10 }}><Receipt size={18} /></div>
                                  <div>
                                    <div className="fw-bold text-white" style={{ fontSize: "1rem" }}>Paragonat - POS</div>
                                    <div className="text-secondary" style={{ fontSize: "0.72rem" }}>Shitje me kasa fiskale - Sot</div>
                                  </div>
                                </div>
                                <Badge bg="success-subtle" text="success" className="rounded-pill px-3">PARAGON</Badge>
                              </Card.Header>
                              <Card.Body className="p-4">
                                <Row className="g-3 mb-4">
                                  {[
                                    { label: "Vlera POS Sot", val: `${totalEur.toFixed(2)} €`, note: pct ? `${isUp ? "+" : "-"}${pct}% vs dje` : "Pa ndryshim", noteColor: isUp ? "success" : "danger" },
                                    { label: "Paragon Sot", val: totalPar, note: `Dje: ${parDjeshme}`, noteColor: "secondary" },
                                    { label: "Mesatare / Par.", val: `${avgTicket.toFixed(2)} €`, note: `Dje: ${avgDjeshme.toFixed(2)} €`, noteColor: "secondary" },
                                    { label: "Operatorë Aktiv", val: operators.length, note: "Ka shitur sot", noteColor: "primary" },
                                  ].map(({ label, val, note, noteColor }, i) => (
                                    <Col key={i} xs={6}><KpiMini label={label} val={val} note={note} noteColor={noteColor} bg="rgba(16,185,129,0.06)" border="rgba(16,185,129,0.15)" /></Col>
                                  ))}
                                </Row>
                                <div className="kpi-label mb-3">Top Operatorët POS</div>
                                {operators.length === 0
                                  ? <div className="text-secondary text-center py-3" style={{ fontSize: "0.85rem" }}>Nuk ka shitje POS sot</div>
                                  : operators.slice(0, 6).map((k, i) => {
                                    const share = totalEur > 0 ? k.totaliBlerjeveEuro / totalEur * 100 : 0;
                                    return <RankedRow key={i} rank={i + 1} name={k?.stafi?.username} value={`${k.totaliBlerjeveEuro.toFixed(2)} €`} share={share} />;
                                  })
                                }
                                <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                                  <div className="kpi-label mb-2">Konteksti POS</div>
                                  <div className="d-flex gap-3">
                                    {[
                                      { label: "Jave", val: `${parseFloat(shitjetMeParagon?.shitjetJavore?.shitjetJavoreEuro || 0).toFixed(2)} €`, sub: `${shitjetMeParagon?.shitjetJavore?.shitjetJavoreParagon || 0} par.` },
                                      { label: "Muaj", val: `${parseFloat(shitjetMeParagon?.shitjetMujore?.shitjetMujoreEuro || 0).toFixed(2)} €`, sub: `${shitjetMeParagon?.shitjetMujore?.shitjetMujoreParagon || 0} par.` },
                                    ].map(({ label, val, sub }) => (
                                      <div key={label} className="flex-grow-1 p-3 rounded-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                                        <div className="kpi-label" style={{ fontSize: "0.62rem" }}>{label}</div>
                                        <div className="fw-bold text-success" style={{ fontSize: "1rem" }}>{val}</div>
                                        <div className="text-secondary" style={{ fontSize: "0.72rem" }}>{sub}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                          {/* Right: FAT Porosite */}
                          <Col xl={6}>
                            <Card className="stat-card-modern border-0 h-100">
                              <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="icon-box bg-primary-subtle text-primary mb-0" style={{ width: 36, height: 36, borderRadius: 10 }}><DollarSign size={18} /></div>
                                  <div>
                                    <div className="fw-bold text-white" style={{ fontSize: "1rem" }}>Porosite - Fatura (FAT)</div>
                                    <div className="text-secondary" style={{ fontSize: "0.72rem" }}>Shitje me faturë tatimore - Sot</div>
                                  </div>
                                </div>
                                <Badge bg="primary-subtle" text="primary" className="rounded-pill px-3">FAT</Badge>
                              </Card.Header>
                              <Card.Body className="p-4">
                                <Row className="g-3 mb-4">
                                  {[
                                    { label: "Vlera FAT Sot", val: `${fatSotEur.toFixed(2)} €`, note: `${fatUp ? "+" : ""}${fatDiff.toFixed(2)} € vs dje`, noteColor: fatUp ? "success" : "danger" },
                                    { label: "Porosi Sot", val: fatSotPar, note: `Dje: ${fatDjePar}`, noteColor: "secondary" },
                                    { label: "Mesatare / Por.", val: `${fatAvg.toFixed(2)} €`, note: `Totali: ${totalSotme.toFixed(2)} €`, noteColor: "secondary" },
                                    { label: "Porosi Javore", val: fatJavPar, note: `${fatJavEur.toFixed(2)} € jave`, noteColor: "info" },
                                  ].map(({ label, val, note, noteColor }, i) => (
                                    <Col key={i} xs={6}><KpiMini label={label} val={val} note={note} noteColor={noteColor} bg="rgba(59,130,246,0.06)" border="rgba(59,130,246,0.15)" /></Col>
                                  ))}
                                </Row>
                                <div className="kpi-label mb-3">Trendi Javor FAT - 7 Ditët e Fundit</div>
                                {javoreData.length === 0
                                  ? <div className="text-secondary text-center py-3" style={{ fontSize: "0.85rem" }}>Nuk ka të dhëna javore</div>
                                  : (() => {
                                    const maxVal = Math.max(...javoreData.map(d => parseFloat(d.totaliShitjeveDitore || 0)), 1);
                                    const days = ["Die", "Hen", "Mar", "Mer", "Enj", "Pre", "Sht"];
                                    return (
                                      <div className="d-flex flex-column gap-2">
                                        {[...javoreData].reverse().map((d, i) => {
                                          const v = parseFloat(d.totaliShitjeveDitore || 0);
                                          const p2 = maxVal > 0 ? v / maxVal * 100 : 0;
                                          const dt = new Date(d.Data || d.data);
                                          return (
                                            <div key={i} className="d-flex align-items-center gap-3">
                                              <span className="text-secondary" style={{ minWidth: 30, fontSize: "0.78rem" }}>{days[dt.getDay()]}</span>
                                              <div className="flex-grow-1 op-bar-track" style={{ height: 7 }}>
                                                <div className="op-bar-fill" style={{ width: `${p2}%`, height: 7, background: "linear-gradient(90deg,#3b82f6,#60a5fa)" }} />
                                              </div>
                                              <span className="text-info fw-bold" style={{ minWidth: 90, fontSize: "0.78rem", textAlign: "right" }}>{v.toFixed(2)} €</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    );
                                  })()
                                }
                                <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                                  <div className="kpi-label mb-2">Konteksti FAT</div>
                                  <div className="d-flex gap-3">
                                    {[
                                      { label: "Këtë Muaj", val: `${parseFloat(totaleTeNdryshme?.totaliShitjeveKeteMuaj || 0).toFixed(2)} €`, sub: `${totaleTeNdryshme?.totaliPorosiveKeteMuaj || 0} porosi` },
                                      { label: "Muaji Kaluar", val: `${parseFloat(totaleTeNdryshme?.totaliShitjeveMuajinKaluar || 0).toFixed(2)} €`, sub: `${totaleTeNdryshme?.totaliPorosiveMuajinKaluar || 0} porosi` },
                                    ].map(({ label, val, sub }) => (
                                      <div key={label} className="flex-grow-1 p-3 rounded-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                                        <div className="kpi-label" style={{ fontSize: "0.62rem" }}>{label}</div>
                                        <div className="fw-bold text-primary" style={{ fontSize: "1rem" }}>{val}</div>
                                        <div className="text-secondary" style={{ fontSize: "0.72rem" }}>{sub}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>
                      </>
                    );
                  })()}

                  {/* SOT: Operatorët */}
                  {sotSubTab === "operatoret" && (
                    <Row className="g-4">
                      <Col lg={12}>
                        <Card className="stat-card-modern border-0">
                          <Card.Header className="bg-transparent border-0 pt-4 px-5 pb-2 d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold text-white mb-0">Shitjet POS Sipas Operatorit - Sot</h6>
                            <div className="d-flex gap-3 align-items-center">
                              <span className="text-secondary" style={{ fontSize: "0.82rem" }}>{operators.length} operator{operators.length !== 1 ? "e" : ""} aktiv</span>
                              <Badge bg="success-subtle" text="success" className="rounded-pill px-3">POS Sot</Badge>
                            </div>
                          </Card.Header>
                          <Card.Body className="p-0">
                            <div className="premium-table-container">
                              <table className="table sp-table mb-0">
                                <thead><tr>
                                  <th className="px-5">#</th><th className="px-3">Operatori</th>
                                  <th className="px-3 text-center">Paragon</th><th className="px-3 text-end">Vlera Totale</th>
                                  <th className="px-3 text-end">Mes. / Par.</th><th className="px-4" style={{ minWidth: 160 }}>Pjesëmarrja</th>
                                </tr></thead>
                                <tbody>
                                  {operators.length === 0
                                    ? <tr><td colSpan={6} className="text-center text-secondary py-5">Nuk ka shitje POS sot</td></tr>
                                    : operators.map((k, i) => {
                                      const share = totalEur > 0 ? k.totaliBlerjeveEuro / totalEur * 100 : 0;
                                      const avg = k.numriBlerjeve > 0 ? k.totaliBlerjeveEuro / k.numriBlerjeve : 0;
                                      return (
                                        <tr key={k?.stafi?.userID ?? i}>
                                          <td className="px-5 text-secondary fw-bold">{i + 1}</td>
                                          <td className="px-3 fw-semibold text-white">{k?.stafi?.username}</td>
                                          <td className="px-3 text-center">{k.numriBlerjeve}</td>
                                          <td className="px-3 text-end text-info fw-bold">{k.totaliBlerjeveEuro.toFixed(2)} €</td>
                                          <td className="px-3 text-end text-secondary">{avg.toFixed(2)} €</td>
                                          <td className="px-4">
                                            <div className="d-flex align-items-center gap-2">
                                              <div className="op-bar-track flex-grow-1" style={{ height: 8 }}><div className="op-bar-fill" style={{ width: `${share}%`, height: 8 }} /></div>
                                              <span className="text-secondary" style={{ fontSize: "0.78rem", minWidth: 40 }}>{share.toFixed(1)}%</span>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })
                                  }
                                </tbody>
                                <tfoot><tr className="table-dark fw-bold">
                                  <td className="px-5 text-secondary">-</td><td className="px-3 text-white">TOTALI</td>
                                  <td className="px-3 text-center text-white">{totalPar}</td><td className="px-3 text-end text-danger">{totalEur.toFixed(2)} €</td>
                                  <td className="px-3 text-end text-secondary">{avgTicket.toFixed(2)} €</td><td className="px-4 text-white">100%</td>
                                </tr></tfoot>
                              </table>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  )}

                  {/* SOT: Krahasimi */}
                  {sotSubTab === "krahasimi" && (
                    <Row className="g-4">
                      {[
                        { label: "Shitjet POS (€)", sot: totalEur, djeName: totalDjeshme, fmt: v => `${parseFloat(v).toFixed(2)} €`, icon: Banknote, color: "success" },
                        { label: "Numri Paragoneve", sot: totalPar, djeName: parDjeshme, fmt: v => v, icon: Receipt, color: "warning" },
                        { label: "Mesatarja / Paragon", sot: avgTicket, djeName: avgDjeshme, fmt: v => `${parseFloat(v).toFixed(2)} €`, icon: CreditCard, color: "info" },
                        { label: "Operatorë Aktiv", sot: operators.length, djeName: null, fmt: v => v, icon: UserCheck, color: "primary" },
                        { label: "Shitjet Javore POS", sot: parseFloat(shitjetMeParagon?.shitjetJavore?.shitjetJavoreEuro || 0), djeName: null, fmt: v => `${parseFloat(v || 0).toFixed(2)} €`, icon: Activity, color: "info" },
                        { label: "Shitjet Mujore POS", sot: parseFloat(shitjetMeParagon?.shitjetMujore?.shitjetMujoreEuro || 0), djeName: null, fmt: v => `${parseFloat(v || 0).toFixed(2)} €`, icon: DollarSign, color: "success" },
                      ].map(({ label, sot: s, djeName: d, fmt, icon: IconComp, color }, i) => { // eslint-disable-line no-unused-vars
                        const numS = parseFloat(s) || 0;
                        const numD = typeof d === "number" ? d : null;
                        const dif = numD !== null ? numS - numD : null;
                        const pos = dif !== null ? dif >= 0 : true;
                        return (
                          <Col key={i} lg={4} sm={6}>
                            <Card className="stat-card-modern h-100" data-aos="fade-up" data-aos-delay={i * 60}>
                              <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                  <div className={`icon-box bg-${color}-subtle text-${color} mb-0`}><IconComp size={22} /></div>
                                  {dif !== null && (
                                    <div className={`d-flex align-items-center gap-1 px-2 py-1 rounded-2 ${pos ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`} style={{ fontSize: "0.8rem" }}>
                                      {pos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                                      <span className="fw-bold">{pos ? "+" : ""}{fmt(dif)}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="kpi-label mb-1">{label}</div>
                                <div className="kpi-value mb-2" style={{ fontSize: "1.6rem" }}>{fmt(s)}</div>
                                <div className="text-secondary" style={{ fontSize: "0.78rem" }}>
                                  {numD !== null ? <>Dje: <strong className="text-white">{fmt(d)}</strong></> : <span className="opacity-50">-</span>}
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  )}
                </div>
              );
            })()}
          </Tab>

          {/* ═══════════════ PERMBLEDHJA TAB ═══════════════ */}
          <Tab eventKey="overview" title={<div className="d-flex align-items-center gap-2"><Layers size={18} /> Përmbledhja</div>}>
            <div className="mt-4">
              {/* 8 KPI cards */}
              <Row className="g-4 mb-4">
                {[
                  { title: "Shitjet Totale (FAT+POS)", value: `${totalShitjeveGjithsej} €`, icon: DollarSign, color: "primary", trend: "up", trendValue: "Të gjitha kohërat", delay: 0 },
                  { title: "Shitjet FAT (Totale)", value: `${parseFloat(totaleTeNdryshme?.totaliShitjeve || 0).toFixed(2)} €`, icon: Banknote, color: "info", delay: 80 },
                  { title: "Shitjet POS (Totale)", value: `${parseFloat(totaleTeNdryshme?.totaliShitjeveParagonEuro || 0).toFixed(2)} €`, icon: Receipt, color: "success", delay: 160 },
                  { title: "Porosi FAT (Totale)", value: totaleTeNdryshme?.totaliPorosive || 0, icon: ShoppingCart, color: "warning", delay: 240 },
                  { title: "Paragon POS (Totale)", value: totaleTeNdryshme?.totaliShitjeveParagon || 0, icon: CreditCard, color: "danger", delay: 0 },
                  { title: "Klientë Qytetarë", value: totaleTeNdryshme?.totaliKlient || 0, icon: Users, color: "success", delay: 80 },
                  { title: "Partnerë Biznesorë", value: totaleTeNdryshme?.totaliKlientBiznesi || 0, icon: Store, color: "primary", delay: 160 },
                  { title: "Produkte në Stok", value: totaleTeNdryshme?.totaliProdukteve || 0, icon: Package, color: "info", delay: 240 },
                ].map(({ title, value, icon, color, trend, trendValue, delay }, i) => (
                  <Col key={i} xl={3} lg={4} sm={6}><StatCard title={title} value={value} icon={icon} color={color} trend={trend} trendValue={trendValue} delay={delay} /></Col>
                ))}
              </Row>

              {/* Chart + comparison cards */}
              <Row className="g-4 mb-4">
                <Col xl={8} data-aos="fade-right">
                  <Card className="stat-card-modern border-0">
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <h5 className="fw-bold mb-0 text-white">Trendi i Shitjeve Javore (FAT)</h5>
                        <Badge bg="primary-subtle" text="primary" className="rounded-pill px-3">7 Ditët e Fundit</Badge>
                      </div>
                      <div style={{ height: "320px" }}>
                        <ChartComponent chartType="line" chartData={shitjetJavoreData} chartOptions={chartOptions} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xl={4}>
                  <div className="d-flex flex-column gap-3 h-100">
                    <h6 className="kpi-label mb-1 px-1">Performanca Ditore vs Mujore</h6>
                    <ComparisonCard title="Sot vs Dje" value={totaleTeNdryshme?.totaliShitjeveSotme} compareValue={totaleTeNdryshme?.totaliShitjeveDjeshme} suffix="ndryshim" isCurrency={true} delay={0} />
                    <ComparisonCard title="Këtë Muaj vs Kaluar" value={totaleTeNdryshme?.totaliShitjeveKeteMuaj} compareValue={totaleTeNdryshme?.totaliShitjeveMuajinKaluar} suffix="ndryshim" isCurrency={true} delay={100} />
                    <Card className="stat-card-modern border-0 flex-grow-1">
                      <Card.Body className="p-4">
                        <div className="kpi-label mb-3">Porosi Muajore</div>
                        {[
                          { label: "Këtë Muaj (FAT)", val: totaleTeNdryshme?.totaliPorosiveKeteMuaj || 0, color: "info" },
                          { label: "Muaji Kaluar (FAT)", val: totaleTeNdryshme?.totaliPorosiveMuajinKaluar || 0, color: "secondary" },
                          { label: "Sot (FAT)", val: totaleTeNdryshme?.totaliPorosiveSotme || 0, color: "success" },
                          { label: "Dje (FAT)", val: totaleTeNdryshme?.totaliPorosiveDjeshme || 0, color: "warning" },
                        ].map(({ label, val, color }) => (
                          <div key={label} className="d-flex justify-content-between align-items-center mb-2 pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <span className="text-secondary" style={{ fontSize: "0.82rem" }}>{label}</span>
                            <span className={`fw-bold text-${color}`} style={{ fontSize: "0.95rem" }}>{val}</span>
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </div>
                </Col>
              </Row>

              {/* Top 5 products + top buyers mini preview */}
              <Row className="g-4">
                <Col xl={4}>
                  <Card className="stat-card-modern border-0 h-100">
                    <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between">
                      <h6 className="fw-bold mb-0 text-white">Top Produktet</h6>
                      <Badge bg="success-subtle" text="success" className="rounded-pill px-3">Top 5</Badge>
                    </Card.Header>
                    <Card.Body className="p-4 pt-3">
                      {top15Produktet.slice(0, 5).map((k, i) => {
                        const maxV = parseFloat(top15Produktet[0]?.totaliBlerjeve || 1);
                        const v = parseFloat(k.totaliBlerjeve || 0);
                        return <RankedRow key={i} rank={i + 1} name={k?.produkti?.emriProduktit} sub={`${k.totaliPorosive} njësi`} value={`${v.toFixed(2)} €`} share={maxV > 0 ? v / maxV * 100 : 0} />;
                      })}
                    </Card.Body>
                  </Card>
                </Col>
                <Col xl={4}>
                  <Card className="stat-card-modern border-0 h-100">
                    <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between">
                      <h6 className="fw-bold mb-0 text-white">Top Blerësit Qytetarë</h6>
                      <Badge bg="info-subtle" text="info" className="rounded-pill px-3">Top 5</Badge>
                    </Card.Header>
                    <Card.Body className="p-4 pt-3">
                      {top15Bleresit.slice(0, 5).map((k, i) => {
                        const maxV = parseFloat(top15Bleresit[0]?.totaliBlerjeveEuro || 1);
                        const v = parseFloat(k.totaliBlerjeveEuro || 0);
                        return <RankedRow key={i} rank={i + 1} name={k?.partneri?.emriBiznesit} sub={k?.partneri?.kartela?.kodiKartela || "Pa Kartelë"} value={`${v.toFixed(2)} €`} share={maxV > 0 ? v / maxV * 100 : 0} barColor="#06b6d4" />;
                      })}
                    </Card.Body>
                  </Card>
                </Col>
                <Col xl={4}>
                  <Card className="stat-card-modern border-0 h-100">
                    <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between">
                      <h6 className="fw-bold mb-0 text-white">Top Partnerët Biznesorë</h6>
                      <Badge bg="primary-subtle" text="primary" className="rounded-pill px-3">Top 5</Badge>
                    </Card.Header>
                    <Card.Body className="p-4 pt-3">
                      {top15Bizneset.slice(0, 5).map((k, i) => {
                        const maxV = parseFloat(top15Bizneset[0]?.totaliBlerjeveEuro || 1);
                        const v = parseFloat(k.totaliBlerjeveEuro || 0);
                        return <RankedRow key={i} rank={i + 1} name={k?.partneri?.emriBiznesit} value={`${v.toFixed(2)} €`} share={maxV > 0 ? v / maxV * 100 : 0} barColor="#3b82f6" />;
                      })}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          </Tab>

          {/* ═══════════════ OPERIMET TAB ═══════════════ */}
          <Tab eventKey="operations" title={<div className="d-flex align-items-center gap-2"><UserCheck size={18} /> Operimet</div>}>
            {(() => {
              const periods = [
                {
                  key: "ditore", label: "Ditore", data: shitjetMeParagon?.shitjetDitore, opKey: "shitjetDitoreSipasOperatorit", totalPar: "shitjetDitoreParagon", totalEur: "shitjetDitoreEuro", badge: "Sot", badgeColor: "success",
                  fatPar: totaleTeNdryshme?.totaliPorosiveSotme, fatEur: Math.max((totaleTeNdryshme?.totaliShitjeveSotme || 0) - parseFloat(shitjetMeParagon?.shitjetDitore?.shitjetDitoreEuro || 0), 0)
                },
                {
                  key: "javore", label: "Javore", data: shitjetMeParagon?.shitjetJavore, opKey: "shitjetJavoreSipasOperatorit", totalPar: "shitjetJavoreParagon", totalEur: "shitjetJavoreEuro", badge: "Kjo Javë", badgeColor: "info",
                  fatPar: shitjetJavore?.TotaletJavore?.TotaliPorosiveJavore, fatEur: parseFloat(shitjetJavore?.TotaletJavore?.TotaliShitjeveJavore || 0)
                },
                {
                  key: "mujore", label: "Mujore", data: shitjetMeParagon?.shitjetMujore, opKey: "shitjetMujoreSipasOperatorit", totalPar: "shitjetMujoreParagon", totalEur: "shitjetMujoreEuro", badge: "Ky Muaj", badgeColor: "warning",
                  fatPar: totaleTeNdryshme?.totaliPorosiveKeteMuaj, fatEur: parseFloat(totaleTeNdryshme?.totaliShitjeveKeteMuaj || 0) - parseFloat(shitjetMeParagon?.shitjetMujore?.shitjetMujoreEuro || 0)
                },
              ];
              const active = periods.find(p => p.key === opSubTab) || periods[0];
              const rows = groupByUser(active.data?.[active.opKey]);
              const totPar = active.data?.[active.totalPar] || 0;
              const totEur = parseFloat(active.data?.[active.totalEur] || 0);
              const avgTick = totPar > 0 ? totEur / totPar : 0;
              const fatEur = Math.max(parseFloat(active.fatEur || 0), 0);
              const fatPar = active.fatPar || 0;
              const fatAvg = fatPar > 0 ? fatEur / fatPar : 0;
              return (
                <div className="mt-4">
                  {/* Period picker + summary bar */}
                  <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                    <div className="subtab-pills">
                      {periods.map(p => (
                        <button key={p.key} className={`subtab-pill ${opSubTab === p.key ? "active" : ""}`} onClick={() => setOpSubTab(p.key)}>{p.label}</button>
                      ))}
                    </div>
                    <div className="d-flex gap-3 flex-wrap">
                      {[
                        { label: "POS Paragonë", val: totPar, color: "success" },
                        { label: "POS Vlera", val: `${totEur.toFixed(2)} €`, color: "info" },
                        { label: "POS Mes/Par", val: `${avgTick.toFixed(2)} €`, color: "secondary" },
                        { label: "FAT Porosi", val: fatPar, color: "warning" },
                        { label: "FAT Vlera", val: `${fatEur.toFixed(2)} €`, color: "primary" },
                        { label: "FAT Mes/Por", val: `${fatAvg.toFixed(2)} €`, color: "secondary" },
                      ].map(({ label, val, color }) => (
                        <div key={label} className="text-center px-3 py-2 rounded-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <div className="kpi-label mb-0" style={{ fontSize: "0.62rem" }}>{label}</div>
                          <div className={`fw-bold text-${color}`} style={{ fontSize: "0.9rem" }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Row className="g-4">
                    {/* POS operator table */}
                    <Col xl={8}>
                      <Card className="stat-card-modern border-0">
                        <Card.Header className="bg-transparent border-0 pt-4 px-5 pb-2 d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <div className="icon-box bg-success-subtle text-success mb-0" style={{ width: 32, height: 32, borderRadius: 8 }}><Receipt size={16} /></div>
                            <h6 className="fw-bold text-white mb-0">Paragonat POS Sipas Operatorit - {active.label}</h6>
                          </div>
                          <Badge bg={`${active.badgeColor}-subtle`} text={active.badgeColor} className="rounded-pill px-3">{active.badge}</Badge>
                        </Card.Header>
                        <Card.Body className="p-0">
                          <div className="premium-table-container">
                            <table className="table sp-table mb-0">
                              <thead><tr>
                                <th className="px-5">#</th><th className="px-3">Operatori</th>
                                <th className="px-3 text-center">Paragon</th><th className="px-3 text-end">Vlera</th>
                                <th className="px-3 text-end">Mes./Par.</th><th className="px-4" style={{ minWidth: 150 }}>Pjesëmarrja</th>
                              </tr></thead>
                              <tbody>
                                {rows.length === 0
                                  ? <tr><td colSpan={6} className="text-center text-secondary py-5">Nuk ka të dhëna</td></tr>
                                  : rows.map((k, i) => {
                                    const share = totEur > 0 ? k.totaliBlerjeveEuro / totEur * 100 : 0;
                                    const avg = k.numriBlerjeve > 0 ? k.totaliBlerjeveEuro / k.numriBlerjeve : 0;
                                    return (
                                      <tr key={k?.stafi?.userID ?? i}>
                                        <td className="px-5 text-secondary fw-bold">{i + 1}</td>
                                        <td className="px-3 fw-semibold text-white">{k?.stafi?.username}</td>
                                        <td className="px-3 text-center">{k.numriBlerjeve}</td>
                                        <td className="px-3 text-end text-info fw-bold">{k.totaliBlerjeveEuro.toFixed(2)} €</td>
                                        <td className="px-3 text-end text-secondary">{avg.toFixed(2)} €</td>
                                        <td className="px-4">
                                          <div className="d-flex align-items-center gap-2">
                                            <div className="op-bar-track flex-grow-1" style={{ height: 8 }}><div className="op-bar-fill" style={{ width: `${share}%`, height: 8 }} /></div>
                                            <span className="text-secondary" style={{ fontSize: "0.78rem", minWidth: 38 }}>{share.toFixed(1)}%</span>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })
                                }
                              </tbody>
                              <tfoot><tr className="table-dark fw-bold">
                                <td className="px-5 text-secondary">-</td><td className="px-3 text-white">TOTALI POS</td>
                                <td className="px-3 text-center text-white">{totPar}</td><td className="px-3 text-end text-danger">{totEur.toFixed(2)} €</td>
                                <td className="px-3 text-end text-secondary">{avgTick.toFixed(2)} €</td><td className="px-4 text-white">100%</td>
                              </tr></tfoot>
                            </table>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Right side: FAT summary + period comparison */}
                    <Col xl={4}>
                      <div className="d-flex flex-column gap-4 h-100">
                        {/* FAT Porosite summary for period */}
                        <Card className="stat-card-modern border-0">
                          <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                              <div className="icon-box bg-primary-subtle text-primary mb-0" style={{ width: 32, height: 32, borderRadius: 8 }}><DollarSign size={16} /></div>
                              <h6 className="fw-bold text-white mb-0">Porosite FAT - {active.label}</h6>
                            </div>
                            <Badge bg="primary-subtle" text="primary" className="rounded-pill px-3">FAT</Badge>
                          </Card.Header>
                          <Card.Body className="p-4">
                            <Row className="g-3">
                              {[
                                { label: "Vlera FAT", val: `${fatEur.toFixed(2)} €`, color: "primary" },
                                { label: "Porosi FAT", val: fatPar, color: "warning" },
                                { label: "Mesatare/Por.", val: `${fatAvg.toFixed(2)} €`, color: "info" },
                                { label: "POS vs FAT", val: totEur > 0 ? `${(totEur / (totEur + fatEur) * 100).toFixed(0)}% / ${(fatEur / (totEur + fatEur) * 100).toFixed(0)}%` : "-", color: "secondary" },
                              ].map(({ label, val, color }) => (
                                <Col key={label} xs={6}>
                                  <div className="p-3 rounded-3" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
                                    <div className="kpi-label" style={{ fontSize: "0.63rem" }}>{label}</div>
                                    <div className={`fw-bold text-${color}`} style={{ fontSize: "1.1rem" }}>{val}</div>
                                  </div>
                                </Col>
                              ))}
                            </Row>
                            {/* POS vs FAT split bar */}
                            {(totEur + fatEur) > 0 && (
                              <div className="mt-4">
                                <div className="kpi-label mb-2">Ndarja POS vs FAT</div>
                                <div className="d-flex rounded-pill overflow-hidden" style={{ height: 10 }}>
                                  <div style={{ width: `${totEur / (totEur + fatEur) * 100}%`, background: "linear-gradient(90deg,#10b981,#34d399)", transition: "width 0.8s" }} />
                                  <div style={{ flex: 1, background: "linear-gradient(90deg,#3b82f6,#60a5fa)" }} />
                                </div>
                                <div className="d-flex justify-content-between mt-1">
                                  <span className="text-success" style={{ fontSize: "0.72rem" }}>POS {(totEur / (totEur + fatEur) * 100).toFixed(1)}%</span>
                                  <span className="text-primary" style={{ fontSize: "0.72rem" }}>FAT {(fatEur / (totEur + fatEur) * 100).toFixed(1)}%</span>
                                </div>
                              </div>
                            )}
                          </Card.Body>
                        </Card>

                        {/* Period comparison across all three */}
                        <Card className="stat-card-modern border-0 flex-grow-1">
                          <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
                            <h6 className="fw-bold text-white mb-0">Krahasimi Periudhave</h6>
                          </Card.Header>
                          <Card.Body className="p-4">
                            {periods.map((p) => {
                              const pEur = parseFloat(p.data?.[p.totalEur] || 0);
                              const pPar = p.data?.[p.totalPar] || 0;
                              const maxEur = Math.max(...periods.map(x => parseFloat(x.data?.[x.totalEur] || 0)), 1);
                              const isActive = p.key === opSubTab;
                              return (
                                <div key={p.key} className={`p-3 rounded-3 mb-2 cursor-pointer ${isActive ? "active-period" : ""}`}
                                  style={{ background: isActive ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${isActive ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.06)"}`, cursor: "pointer" }}
                                  onClick={() => setOpSubTab(p.key)}>
                                  <div className="d-flex justify-content-between mb-2">
                                    <span className={`fw-bold ${isActive ? "text-success" : "text-white"}`} style={{ fontSize: "0.85rem" }}>{p.label}</span>
                                    <span className="text-info fw-bold" style={{ fontSize: "0.85rem" }}>{pEur.toFixed(2)} €</span>
                                  </div>
                                  <div className="op-bar-track" style={{ height: 5 }}><div className="op-bar-fill" style={{ width: `${pEur / maxEur * 100}%`, height: 5 }} /></div>
                                  <div className="text-secondary mt-1" style={{ fontSize: "0.7rem" }}>{pPar} paragonë POS</div>
                                </div>
                              );
                            })}
                          </Card.Body>
                        </Card>
                      </div>
                    </Col>
                  </Row>
                </div>
              );
            })()}
          </Tab>

          {/* ═══════════════ ANALITIKA TAB ═══════════════ */}
          <Tab eventKey="insights" title={<div className="d-flex align-items-center gap-2"><BarChart3 size={18} /> Analitika</div>}>
            <div className="mt-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="subtab-pills">
                  {[
                    { key: "produktet", label: "Produktet" },
                    { key: "bleresit", label: "Klientet" },
                    { key: "partnerit", label: "Partneret" },
                  ].map(st => (
                    <button key={st.key} className={`subtab-pill ${analSubTab === st.key ? "active" : ""}`} onClick={() => setAnalSubTab(st.key)}>{st.label}</button>
                  ))}
                </div>
                <Badge bg="secondary-subtle" text="secondary" className="rounded-pill px-3">Top 15</Badge>
              </div>

              {/* ANALITIKA: Produktet */}
              {analSubTab === "produktet" && (
                <Row className="g-4">
                  <Col xl={8}>
                    <Card className="stat-card-modern border-0">
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="fw-bold mb-0 text-white">Top 15 Produktet më të Shitura</h5>
                          <div className="d-flex gap-2">
                            <Badge bg="success-subtle" text="success" className="rounded-pill px-3">Sasi</Badge>
                            <Badge bg="info-subtle" text="info" className="rounded-pill px-3">Vlere €</Badge>
                          </div>
                        </div>
                        <div style={{ height: "420px" }}>
                          <ChartComponent chartType="bar" chartData={produktetData} chartOptions={chartOptions} />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xl={4}>
                    <Card className="stat-card-modern border-0 h-100">
                      <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between">
                        <h6 className="fw-bold mb-0 text-white">Renditja e Produkteve</h6>
                        <Package size={18} className="text-success" />
                      </Card.Header>
                      <Card.Body className="p-4 pt-3" style={{ overflowY: "auto", maxHeight: 480 }}>
                        {top15Produktet.map((k, i) => {
                          const maxV = parseFloat(top15Produktet[0]?.totaliBlerjeve || 1);
                          const v = parseFloat(k.totaliBlerjeve || 0);
                          return <RankedRow key={i} rank={i + 1} name={k?.produkti?.emriProduktit} sub={`${k.totaliPorosive} njësi`} value={`${v.toFixed(2)} €`} share={maxV > 0 ? v / maxV * 100 : 0} />;
                        })}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* ANALITIKA: Bleresit */}
              {analSubTab === "bleresit" && (
                <Row className="g-4">
                  <Col xl={12}>
                    <Card className="stat-card-modern border-0">
                      <Card.Header className="bg-transparent border-0 pt-4 px-5 pb-2 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <div className="icon-box bg-info-subtle text-info mb-0" style={{ width: 32, height: 32, borderRadius: 8 }}><Users size={16} /></div>
                          <h6 className="fw-bold text-white mb-0">Top Blerësit Qytetarë (POS)</h6>
                        </div>
                        <Badge bg="info-subtle" text="info" className="rounded-pill px-3">Top 15</Badge>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <div className="premium-table-container">
                          <table className="table sp-table mb-0">
                            <thead><tr>
                              <th className="px-5">#</th><th className="px-3">Klienti</th><th className="px-3">Kartela</th>
                              <th className="px-3 text-center">Blerje</th><th className="px-3 text-end">Vlera Totale</th>
                              <th className="px-3 text-end">Mesatare</th><th className="px-4" style={{ minWidth: 150 }}>Pjesëmarrja</th>
                            </tr></thead>
                            <tbody>
                              {top15Bleresit.map((k, i) => {
                                const maxV = parseFloat(top15Bleresit[0]?.totaliBlerjeveEuro || 1);
                                const v = parseFloat(k.totaliBlerjeveEuro || 0);
                                const avg = k.numriBlerjeve > 0 ? v / k.numriBlerjeve : 0;
                                return (
                                  <tr key={i}>
                                    <td className="px-5 text-secondary fw-bold">{i + 1}</td>
                                    <td className="px-3 fw-semibold text-white">{k?.partneri?.emriBiznesit}</td>
                                    <td className="px-3 text-secondary" style={{ fontSize: "0.82rem" }}>{k?.partneri?.kartela?.kodiKartela || "-"}</td>
                                    <td className="px-3 text-center">{k.numriBlerjeve}</td>
                                    <td className="px-3 text-end text-info fw-bold">{v.toFixed(2)} €</td>
                                    <td className="px-3 text-end text-secondary">{avg.toFixed(2)} €</td>
                                    <td className="px-4">
                                      <div className="d-flex align-items-center gap-2">
                                        <div className="op-bar-track flex-grow-1" style={{ height: 7 }}>
                                          <div className="op-bar-fill" style={{ width: `${maxV > 0 ? v / maxV * 100 : 0}%`, height: 7, background: "linear-gradient(90deg,#06b6d4,#38bdf8)" }} />
                                        </div>
                                        <span className="text-secondary" style={{ fontSize: "0.75rem", minWidth: 38 }}>{maxV > 0 ? (v / maxV * 100).toFixed(1) : 0}%</span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* ANALITIKA: Partnerit */}
              {analSubTab === "partnerit" && (
                <Row className="g-4">
                  <Col xl={12}>
                    <Card className="stat-card-modern border-0">
                      <Card.Header className="bg-transparent border-0 pt-4 px-5 pb-2 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <div className="icon-box bg-primary-subtle text-primary mb-0" style={{ width: 32, height: 32, borderRadius: 8 }}><Store size={16} /></div>
                          <h6 className="fw-bold text-white mb-0">Top Partnerët Biznesorë (FAT)</h6>
                        </div>
                        <Badge bg="primary-subtle" text="primary" className="rounded-pill px-3">Top 15</Badge>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <div className="premium-table-container">
                          <table className="table sp-table mb-0">
                            <thead><tr>
                              <th className="px-5">#</th><th className="px-3">Biznesi</th>
                              <th className="px-3 text-center">Porosi</th><th className="px-3 text-end">Vlera Totale</th>
                              <th className="px-3 text-end">Mesatare/Porosi</th><th className="px-4" style={{ minWidth: 150 }}>Pjesëmarrja</th>
                            </tr></thead>
                            <tbody>
                              {top15Bizneset.map((k, i) => {
                                const maxV = parseFloat(top15Bizneset[0]?.totaliBlerjeveEuro || 1);
                                const v = parseFloat(k.totaliBlerjeveEuro || 0);
                                const avg = k.numriBlerjeve > 0 ? v / k.numriBlerjeve : 0;
                                return (
                                  <tr key={i}>
                                    <td className="px-5 text-secondary fw-bold">{i + 1}</td>
                                    <td className="px-3">
                                      <div className="fw-semibold text-white">{k?.partneri?.emriBiznesit}</div>
                                      {i === 0 && <span style={{ display: "inline-block", background: "linear-gradient(135deg,#d97706,#f59e0b)", color: "#fff", fontSize: "0.62rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, marginTop: 2, letterSpacing: "0.03em" }}>🏆 Top Partner</span>}
                                    </td>
                                    <td className="px-3 text-center">{k.numriBlerjeve}</td>
                                    <td className="px-3 text-end text-info fw-bold">{v.toFixed(2)} €</td>
                                    <td className="px-3 text-end text-secondary">{avg.toFixed(2)} €</td>
                                    <td className="px-4">
                                      <div className="d-flex align-items-center gap-2">
                                        <div className="op-bar-track flex-grow-1" style={{ height: 7 }}>
                                          <div className="op-bar-fill" style={{ width: `${maxV > 0 ? v / maxV * 100 : 0}%`, height: 7, background: "linear-gradient(90deg,#3b82f6,#60a5fa)" }} />
                                        </div>
                                        <span className="text-secondary" style={{ fontSize: "0.75rem", minWidth: 38 }}>{maxV > 0 ? (v / maxV * 100).toFixed(1) : 0}%</span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
            </div>
          </Tab>

        </Tabs>
      </Container>
    </div>
  );
}

export default Statistika;
