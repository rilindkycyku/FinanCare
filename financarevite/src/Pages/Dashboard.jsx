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
  Scale, Coins, RefreshCw, PlusCircle, History, Truck
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import jwtDecode from "jwt-decode";
import NavBar from "../Components/TeTjera/layout/NavBar";
import Titulli from "../Components/TeTjera/Titulli";
import KontrolloAksesinNeFaqe from "../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import { roleBasedDropdowns } from "../Components/TeTjera/layout/roleBasedDropdowns";
import "./Styles/Dashboard.css";
import "../Pages/Styles/DizajniPergjithshem.css";

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
  const navigate = useNavigate();

  const getID = localStorage.getItem("id");
  const token = localStorage.getItem("token");

  const authentikimi = useMemo(() => ({
    headers: { Authorization: `Bearer ${token} ` }
  }), [token]);

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

      const fetchData = async () => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
            authentikimi
          );
          setTeDhenat(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      navigate("/login");
    }
  }, [getID, token, navigate, API_BASE_URL, authentikimi]);

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

  return (
    <div className="dashboard-wrapper">
      <KontrolloAksesinNeFaqe roletELejuara={["Financa", "Mbeshtetje e Klientit", "Faturist", "Puntor i Thjeshte", "Burime Njerzore", "Komercialist", "Kalkulant", "Menaxher", "Arkatar", "Pergjegjes i Porosive", "1 Euro Menaxher", "1 Euro Staff"]} />
      <Titulli titulli={"Dashboard"} />
      <NavBar />

      <div className="welcome-hero" data-aos="fade-down">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="fw-bold mb-2">Mirësevini, {user?.emri}! 👋</h1>
              <p className="opacity-75 mb-0 text-capitalize">
                {dataAktuale}.
              </p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <Badge className="bg-white text-primary rounded-pill px-3 py-2 shadow-sm fs-6">
                <UserCircle size={18} className="me-2" />
                {userRoles[0] || "Përdorues"}
              </Badge>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
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
          src="/img/web/Logo.svg"
          alt="FinanCare Logo"
          style={{ height: "32px", width: "auto", opacity: 0.85 }}
        />

        {/* Center — matching invoice footer text */}
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.45)", textAlign: "center" }}>
          &copy; FinanCare - POS, eOrder &amp; More by Rilind Kyçyku
        </span>

        {/* Right — version badge */}
        <span style={{
          fontSize: "0.65rem", color: "rgba(255,255,255,0.3)",
          background: "rgba(255,255,255,0.06)", borderRadius: "6px",
          padding: "0.18rem 0.55rem", fontFamily: "monospace",
        }}>
          v2.0.4
        </span>
      </footer>

    </div>
  );
};

export default Dashboard;
