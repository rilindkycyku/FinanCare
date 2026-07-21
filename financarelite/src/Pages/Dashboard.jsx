import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import {
  LayoutDashboard, Building2, Users, Package, FileText,
  ClipboardList, Settings, DatabaseBackup, PlusCircle,
  BarChart3, Hash, Receipt, Mail, MapPin, Phone, Tag, UserCircle,
} from "lucide-react";
import NavBar from "../Components/NavBar";
import PageTitle from "../Components/PageTitle";
import Footer from "../Components/Footer";
import { getBusinessDetails } from "../lib/db";
import "./Styles/PremiumTheme.css";
import "./Styles/DizajniPergjithshem.css";
import "./Styles/Dashboard.css";

const QUICK_ACTIONS = [
  { to: "/te-dhenat-biznesit", label: "Të Dhënat e Biznesit", icon: Building2 },
  { to: "/statistikat", label: "Statistikat", icon: BarChart3 },
  { to: "/klientet", label: "Klientët", icon: Users },
  { to: "/produktet", label: "Produktet", icon: Package },
  { to: "/faturat", label: "Faturat", icon: FileText },
  { to: "/kartela-analitike", label: "Kartela Analitike", icon: ClipboardList },
  { to: "/cilesimet", label: "Cilësimet", icon: Settings },
  { to: "/te-dhena", label: "Eksporto / Importo", icon: DatabaseBackup },
];

const BIZ_FIELDS = [
  { key: "emriIBiznesit", label: "Emri i Biznesit", icon: Building2 },
  { key: "shkurtesaEmritBiznesit", label: "Shkurtesa", icon: Tag },
  { key: "menaxheri", label: "Menaxheri / Personi i Autorizuar", icon: UserCircle },
  { key: "nui", label: "NUI", icon: Hash },
  { key: "nf", label: "Numri Fiskal (NF)", icon: Hash },
  { key: "nrTVSH", label: "Numri TVSH", icon: Receipt },
  { key: "email", label: "Email", icon: Mail },
  { key: "adresa", label: "Adresa", icon: MapPin },
  { key: "nrKontaktit", label: "Numri i Kontaktit", icon: Phone },
];

const DataItem = ({ label, value, icon }) => {
  const Icon = icon;
  return (
    <Col md={6} lg={3} className="mb-4">
      <div className="data-group">
        <div className="data-label">
          <Icon size={14} className="text-primary" />
          {label}
        </div>
        <div className="data-value">{value || "-"}</div>
      </div>
    </Col>
  );
};

function Dashboard() {
  const [businessDetails, setBusinessDetails] = useState({});

  useEffect(() => {
    getBusinessDetails().then((biz) => {
      setBusinessDetails(biz || {});
    });
  }, []);

  const businessName = businessDetails.emriIBiznesit || "";
  const pershendetja = businessDetails.menaxheri || businessName || "FinanCareLite";

  const dataAktuale = useMemo(() => {
    const d = new Date();
    const days = ["e diel", "e hënë", "e martë", "e mërkurë", "e enjte", "e premte", "e shtunë"];
    const months = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

  return (
    <div className="dashboard-wrapper">
      <PageTitle title="Paneli" />
      <NavBar />

      <div className="welcome-hero">
        <Container>
          <Row className="align-items-center justify-content-between g-3">
            <Col xs="auto">
              <h1 className="fw-bold mb-2">Mirësevini, {pershendetja} 👋</h1>
              <p className="opacity-75 mb-0 text-capitalize">
                {businessName && businessName !== pershendetja ? `${businessName} · ` : ""}
                {dataAktuale}.
              </p>
            </Col>
            <Col xs="auto">
              <Link to="/faturat/re" className="hero-cta">
                <PlusCircle size={18} /> Faturë e Re
              </Link>
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
          <div className="quick-actions-grid">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link to={action.to} className="quick-action-card" key={action.to}>
                  <div className="icon-wrapper">
                    <Icon size={22} />
                  </div>
                  <span>{action.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-5">
          <h4 className="section-title">
            <Building2 size={24} className="text-primary" />
            Të Dhënat e Biznesit
          </h4>
          <Row>
            {BIZ_FIELDS.map((f) => (
              <DataItem key={f.key} icon={f.icon} label={f.label} value={businessDetails[f.key]} />
            ))}
          </Row>
          <Link to="/te-dhenat-biznesit" className="hero-cta" style={{ display: "inline-flex" }}>
            Ndrysho të Dhënat e Biznesit
          </Link>
        </section>
      </Container>

      <Footer />
    </div>
  );
}

export default Dashboard;
