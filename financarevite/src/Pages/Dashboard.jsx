import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import { Tab, Tabs, Row, Col, Container, Card, Badge } from "react-bootstrap";
import {
  User, Mail, UserCircle, Calendar, IdCard, Wallet,
  MapPin, Phone, Briefcase, GraduationCap, Building2,
  CreditCard, LayoutDashboard, Clock, ShoppingCart,
  Package, Tag, Printer, Calculator, ClipboardCheck,
  ClipboardList, Percent, Globe, BarChart3, Receipt,
  Scale, Coins, RefreshCw, PlusCircle, History, Truck,
  Shield, AlertTriangle, Lock
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import jwtDecode from "jwt-decode";
import NavBar from "../Components/TeTjera/layout/NavBar";
import Titulli from "../Components/TeTjera/Titulli";
import KontrolloAksesinNeFaqe from "../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import { roleBasedDropdowns } from "../Components/TeTjera/layout/roleBasedDropdowns";
import { useTheme } from "../Context/ThemeContext";
import "./Styles/Dashboard.css";
import "../Pages/Styles/DizajniPergjithshem.css";
import "../Pages/Styles/PremiumTheme.css";


const DataItem = ({ label, value, icon: Icon, delay }) => (
  <Col md={6} lg={4} className="mb-4" data-aos="fade-up" data-aos-delay={delay}>
    <div className="data-group">
      <div className="data-label">
        <Icon size={14} className="text-primary" />
        {label}
      </div>
      <div className="data-value">{value || "---"}</div>
    </div>
  </Col>
);

const Dashboard = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [teDhenat, setTeDhenat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState("kryesore");
  const [userRoles, setUserRoles] = useState([]);
  const [licenseStatus, setLicenseStatus] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const getID = localStorage.getItem("id");
  const token = localStorage.getItem("token");

  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    if (getID && token) {
      try {
        const decodedToken = jwtDecode(token);
        const kohaAktive = new Date(decodedToken.exp * 1000);
        if (kohaAktive < new Date()) {
          localStorage.clear();
          navigate("/login");
          return;
        }
        setUserRoles(decodedToken.role || []);
      } catch (e) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const fetchLicenseStatus = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/Licenca/status`);
          setLicenseStatus(res.data);
          localStorage.setItem("isLicensed", res.data.isLicensed ? "true" : "false");
        } catch (err) {
          console.error("Gabim gjatë leximit të statusit të licencës:", err);
        }
      };

      const fetchData = async () => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setTeDhenat(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchLicenseStatus();
      fetchData();
    } else {
      navigate("/login");
    }
  }, [getID, token, navigate, API_BASE_URL]);

  const getShortcutIcon = (path) => {
    switch (path) {
      case "/Produktet":
        return Package;
      case "/ShikimiQmimeve":
        return Tag;
      case "/Qmimore":
        return Printer;
      case "/KalkulimiIMallit":
        return Calculator;
      case "/PranimiIMallit":
        return ClipboardCheck;
      case "/Porosite":
        return ClipboardList;
      case "/Ofertat":
        return Percent;
      case "/PorositeOnline":
        return Globe;
      case "/Statistika":
        return BarChart3;
      case "/ListaShitjeveMeParagon":
        return Receipt;
      case "/POS":
        return ShoppingCart;
      case "/ListaBarazimeve":
        return Scale;
      case "/BarazoArken":
        return Coins;
      case "/BartTeDhenat":
        return RefreshCw;
      case "/ShtoPagesat":
        return PlusCircle;
      case "/Gjurmimi":
        return History;
      case "/DitetEFurnizimit":
        return Truck;
      default:
        return ShoppingCart;
    }
  };

  const dataAktuale = useMemo(() => {
    const d = new Date();
    const days = ["e diel", "e hënë", "e martë", "e mërkurë", "e enjte", "e premte", "e shtunë"];
    const months = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

  const categorizedQuickActions = useMemo(() => {
    const categoriesMap = {};
    roleBasedDropdowns.forEach(cat => {
      const catActions = [];
      cat.items.forEach(item => {
        if (item.roles.some(r => userRoles.includes(r))) {
          item.subItems.forEach(sub => {
            if (sub.shfaqNeDashboard && sub.roles.some(r => userRoles.includes(r))) {
              catActions.push(sub);
            }
          });
        }
      });
      if (catActions.length > 0) {
        categoriesMap[cat.label] = catActions;
      }
    });
    return Object.entries(categoriesMap).map(([category, actions]) => ({
      category,
      actions
    }));
  }, [userRoles]);

  if (loading) {
    return (
      <div className="Loader" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <TailSpin height="80" width="80" color="#6366f1" ariaLabel="tail-spin-loading" radius="1" visible={true} />
      </div>
    );
  }

  const user = teDhenat?.perdoruesi;
  const extra = user?.teDhenatPerdoruesit;

  const eshteMenaxher = Array.isArray(userRoles) 
    ? (userRoles.includes("Menaxher") || userRoles.includes("1 Euro Menaxher"))
    : (userRoles === "Menaxher" || userRoles === "1 Euro Menaxher");

  return (
    <div className="dashboard-wrapper">
      <KontrolloAksesinNeFaqe roletELejuara={["Financa", "Mbeshtetje e Klientit", "Faturist", "Puntor i Thjeshte", "Burime Njerzore", "Komercialist", "Kalkulant", "Menaxher", "Arkatar", "Pergjegjes i Porosive", "1 Euro Menaxher", "1 Euro Staff"]} />
      <Titulli titulli={"Dashboard"} />
      <NavBar />

      <div className="welcome-hero" data-aos="fade-down">
        <Container>
          <Row className="align-items-center">
            <Col>
              <h1 className="fw-bold mb-2">Mirësevini, {user?.emri}! 👋</h1>
              <p className="opacity-75 mb-0 text-capitalize">
                {dataAktuale}.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* ── License Banner — MANAGER: full management UI ── */}
        {licenseStatus && eshteMenaxher && (
          <div className="mb-4" data-aos="fade-up">
            {licenseStatus.isLicensed ? (
              licenseStatus.daysRemaining <= 15 ? (
                <div 
                  className="p-3 d-flex align-items-center justify-content-between flex-wrap gap-3"
                  style={{
                    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(251, 146, 60, 0.05) 100%)",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    borderRadius: "16px",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 8px 32px 0 rgba(245, 158, 11, 0.08)"
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        background: "rgba(245, 158, 11, 0.2)",
                        borderRadius: "12px",
                        width: "42px",
                        height: "42px",
                        color: "#fb923c"
                      }}
                    >
                      <AlertTriangle size={22} className="animate-pulse" />
                    </div>
                    <div>
                      <h6 className="m-0 fw-bold text-warning" style={{ fontSize: "0.95rem" }}>
                        Vëmendje: Licenca e Sistemit po skadon së shpejti!
                      </h6>
                      <p className="m-0 text-white-50 small">
                        Sistemi i licencuar për <strong>{licenseStatus.biznesi}</strong> do të skadojë pas <strong>{licenseStatus.daysRemaining} ditësh</strong> ({licenseStatus.expiryDate}).
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate("/AktivizoSistemin")}
                    className="btn btn-warning btn-sm fw-bold px-3 py-2 rounded-3 shadow-sm text-dark"
                    style={{ border: "none", fontSize: "0.85rem" }}
                  >
                    Rinovo Licencën
                  </button>
                </div>
              ) : null
            ) : (
              <div 
                className="p-3 d-flex align-items-center justify-content-between flex-wrap gap-3"
                style={{
                  background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.05) 100%)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  borderRadius: "16px",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 8px 32px 0 rgba(239, 68, 68, 0.08)"
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      borderRadius: "12px",
                      width: "42px",
                      height: "42px",
                      color: "#f87171"
                    }}
                  >
                    <AlertTriangle size={22} className="animate-bounce" />
                  </div>
                  <div>
                    <h6 className="m-0 fw-bold text-danger" style={{ fontSize: "0.95rem" }}>
                      Sistemi nuk është i licencuar!
                    </h6>
                    <p className="m-0 text-white-50 small">
                      Kontaktoni menaxherin tuaj për të aktivizuar licencën e sistemit.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate("/AktivizoSistemin")}
                  className="btn btn-danger btn-sm fw-bold px-3 py-2 rounded-3 shadow-sm text-white"
                  style={{ border: "none", fontSize: "0.85rem" }}
                >
                  Aktivizo Tani
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── License Banner — NON-MANAGER: read-only warning (no button) ── */}
        {licenseStatus && !eshteMenaxher && !licenseStatus.isLicensed && (
          <div className="mb-4" data-aos="fade-up">
            <div
              className="p-3 d-flex align-items-center gap-3"
              style={{
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.03) 100%)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "16px",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  borderRadius: "12px",
                  width: "42px",
                  height: "42px",
                  color: "#f87171"
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h6 className="m-0 fw-bold text-danger" style={{ fontSize: "0.9rem" }}>
                  Licenca e sistemit nuk është aktive.
                </h6>
                <p className="m-0 text-white-50 small">
                  Disa funksione mund të mos jenë të disponueshme. Kontaktoni menaxherin tuaj.
                </p>
              </div>
            </div>
          </div>
        )}

        {licenseStatus && !licenseStatus.isLicensed ? (
          <div 
            className="text-center p-5 my-5 shadow-lg rounded-4 position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(20, 20, 35, 0.85) 0%, rgba(10, 10, 15, 0.95) 100%)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 50px rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
            data-aos="zoom-in"
          >
            {/* Ambient red glow behind */}
            <div 
              style={{
                position: "absolute",
                top: "-50px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "250px",
                height: "250px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.15)",
                filter: "blur(80px)",
                pointerEvents: "none",
                zIndex: 0
              }}
            />

            <div className="position-relative" style={{ zIndex: 1 }}>
              <div 
                className="d-inline-flex align-items-center justify-content-center mb-4"
                style={{
                  background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.05) 100%)",
                  borderRadius: "24px",
                  width: "80px",
                  height: "80px",
                  color: "#f87171",
                  border: "1px solid rgba(239, 68, 68, 0.35)",
                  boxShadow: "0 10px 30px rgba(239, 68, 68, 0.2)",
                }}
              >
                <Lock size={38} className="animate-pulse" />
              </div>

              <h2 className="fw-black text-white mb-3 tracking-wide" style={{ fontSize: "2.1rem", textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                Sistemi është i Bllokuar! 🔒
              </h2>

              <p className="mx-auto text-white-50 mb-4" style={{ maxWidth: "580px", fontSize: "1.05rem", lineHeight: "1.6" }}>
                Për të vazhuduar përdorimin e platformës <strong>FinanCare</strong>, duhet të aktivizoni një licencë të vlefshme. Të gjitha funksionet dhe veprimet e shpejta janë bllokuar përkohësisht.
              </p>

              {eshteMenaxher ? (
                <div className="d-flex flex-column align-items-center gap-3">
                  <div className="p-3 mb-2 rounded-3 text-start small border border-warning border-opacity-10" style={{ background: "rgba(245, 158, 11, 0.05)", maxWidth: "480px" }}>
                    <div className="d-flex gap-2 align-items-center mb-1 text-warning fw-bold">
                      <AlertTriangle size={15} />
                      Udhëzim për Menaxherin:
                    </div>
                    <span className="text-white-50">
                      Klikoni butonin e mëposhtëm për të hapur faqen e licencimit ku mund të vendosni emrin e biznesit dhe kodin e ri të licencës për të zhbllokuar sistemin.
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => navigate("/AktivizoSistemin")}
                    className="btn btn-danger btn-lg fw-bold px-5 py-3 rounded-pill shadow-lg text-white d-flex align-items-center gap-2 hover-lift"
                    style={{ 
                      border: "none", 
                      fontSize: "1.05rem", 
                      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      boxShadow: "0 8px 24px rgba(239, 68, 68, 0.35)"
                    }}
                  >
                    <RefreshCw size={18} />
                    <span>Aktivizo Tani</span>
                  </button>
                </div>
              ) : (
                <div 
                  className="mx-auto p-4 rounded-3 text-start border border-danger border-opacity-10" 
                  style={{ background: "rgba(239, 68, 68, 0.03)", maxWidth: "480px" }}
                >
                  <div className="d-flex gap-2 align-items-center mb-1 text-danger fw-bold">
                    <Shield size={16} />
                    Njoftim për Stafin:
                  </div>
                  <span className="text-white-50 small">
                    Ju lutemi kontaktoni menaxherin tuaj të biznesit për të aktivizuar ose rinovuar licencën e platformës në mënyrë që të rikthehet aksesi në të gjitha modulet.
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <section className="mb-5">
              <h4 className="section-title">
                <LayoutDashboard size={24} className="text-primary" />
                Veprimet e Shpejta
              </h4>
              <div className="categorized-quick-actions">
                {categorizedQuickActions.map((group, groupIdx) => (
                  <div key={groupIdx} className="mb-4" data-aos="fade-up">
                    <h5 className="category-subtitle">
                      <span className="category-bullet"></span>
                      {group.category}
                    </h5>
                    <div className="quick-actions-grid">
                      {group.actions.map((action, idx) => {
                        const IconComponent = getShortcutIcon(action.path);
                        return (
                          <div key={idx} data-aos="zoom-in" data-aos-delay={idx * 30}>
                            <Link to={action.path} className="quick-action-card">
                              <div className="icon-wrapper">
                                <IconComponent size={22} />
                              </div>
                              <span>{action.label}</span>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {categorizedQuickActions.length === 0 && (
                <div className="text-center p-5 bg-white rounded-4 shadow-sm text-muted"> Nuk ka veprime të disponueshme për rolin tuaj. </div>
              )}
            </section>

            <section className="mb-5">
              <h4 className="section-title">
                <User size={24} className="text-primary" />
                Profili Personal
              </h4>
              <Card className="profile-card border-0 p-4">
                <Tabs id="profile-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="modern-tabs border-0">
                  <Tab eventKey="kryesore" title="Shënimet Kryesore">
                    <Row className="mt-2">
                      <DataItem icon={User} label="Emri" value={user?.emri} delay={0} />
                      <DataItem icon={User} label="Mbiemri" value={user?.mbiemri} delay={100} />
                      <DataItem icon={Mail} label="Email Zyrtar" value={user?.email} delay={200} />
                      <DataItem icon={UserCircle} label="Username" value={user?.username} delay={300} />
                      <DataItem icon={Calendar} label="Fillimi i Kontratës" value={extra?.dataFillimitKontrates && new Date(extra.dataFillimitKontrates).toLocaleDateString("en-GB")} delay={400} />
                      <DataItem icon={Clock} label="Fundi i Kontratës" value={extra?.dataMbarimitKontrates && new Date(extra.dataMbarimitKontrates).toLocaleDateString("en-GB")} delay={500} />
                      <DataItem icon={IdCard} label="Nr. Personal" value={extra?.nrPersonal} delay={600} />
                      <DataItem icon={Wallet} label="Paga Bruto" value={extra?.paga ? `${parseFloat(extra.paga).toFixed(2)} €` : null} delay={700} />
                    </Row>
                  </Tab>
                  <Tab eventKey="ndihmese" title="Informacione Ndihmëse">
                    <Row className="mt-2">
                      <DataItem icon={MapPin} label="Adresa" value={extra?.adresa} delay={0} />
                      <DataItem icon={IdCard} label="Datëlindja" value={extra?.datelindja && new Date(extra.datelindja).toLocaleDateString("en-GB")} delay={100} />
                      <DataItem icon={Phone} label="Nr. Kontaktit" value={extra?.nrKontaktit} delay={200} />
                      <DataItem icon={Mail} label="Email Privat" value={extra?.emailPrivat} delay={300} />
                      <DataItem icon={Briefcase} label="Profesioni" value={extra?.profesioni} delay={400} />
                      <DataItem icon={GraduationCap} label="Specializimi" value={extra?.specializimi} delay={500} />
                      <DataItem icon={Building2} label="Banka" value={extra?.banka?.emriBankes} delay={600} />
                      <DataItem icon={CreditCard} label="Nr. Llogarisë Bankare" value={extra?.numriLlogarisBankare} delay={700} />
                      <Col md={6} lg={4} className="mb-4" data-aos="fade-up" data-aos-delay={800}>
                        <div className="data-group">
                          <div className="data-label">Statusi i Punëtorit</div>
                          <div>
                            {extra?.eshtePuntorAktive == "true" ? (
                              <span className="badge-active">Aktiv</span>
                            ) : (
                              <span className="badge-inactive">Jo Aktiv</span>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Tab>
                </Tabs>
              </Card>
            </section>
          </>
        )}
      </Container>

      {/* ── Branding footer ── */}
      <footer style={{
        marginTop: "2rem",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "0.9rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.5rem",
      }}>
        {/* Left — logo */}
        <img
          src={theme === "light" ? "/img/web/LogoBlack.svg" : "/img/web/LogoWhite.svg"}
          alt="FinanCare Logo"
          style={{ height: "32px", width: "auto", opacity: 0.85 }}
        />

        {/* Center — matching invoice footer text */}
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.45)", textAlign: "center" }}>
          &copy; 2023 - {new Date().getFullYear()} FinanCare - POS, eOrder &amp; More by{" "}
          <a
            href="https://rilindkycyku.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--sp-emerald)', textDecoration: 'none', fontWeight: '600' }}
          >
            Rilind Kyçyku
          </a>
        </span>

        {/* Right — version badge */}
        <span style={{
          fontSize: "0.65rem", color: "rgba(255,255,255,0.3)",
          background: "rgba(255,255,255,0.06)", borderRadius: "6px",
          padding: "0.18rem 0.55rem", fontFamily: "monospace",
        }}>
          v2.0.8
        </span>
      </footer>

    </div>
  );
};

export default Dashboard;
