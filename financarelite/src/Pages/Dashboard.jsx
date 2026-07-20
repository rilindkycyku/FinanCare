import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FileText, Users, Package, Building2, Plus } from "lucide-react";
import NavBar from "../Components/NavBar";
import PageTitle from "../Components/PageTitle";
import { getAll, getBusinessDetails, STORES } from "../lib/db";
import { calcInvoiceTotals } from "../lib/invoiceCalc";
import { DOCUMENT_TYPES } from "../lib/options";
import "./Styles/PremiumTheme.css";
import "./Styles/DizajniPergjithshem.css";

function Dashboard() {
  const [stats, setStats] = useState({ invoices: 0, clients: 0, products: 0, total: 0 });
  const [businessName, setBusinessName] = useState("");
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    Promise.all([getAll(STORES.invoices), getAll(STORES.clients), getAll(STORES.products), getBusinessDetails()]).then(
      ([invoices, clients, products, biz]) => {
        const total = invoices.reduce((sum, inv) => sum + calcInvoiceTotals(inv.items, inv.transporti).totaliFinal, 0);
        setStats({ invoices: invoices.length, clients: clients.length, products: products.length, total });
        setBusinessName(biz?.emriIBiznesit || "");
        setRecent(invoices.sort((a, b) => (b.dataRegjistrimit || "").localeCompare(a.dataRegjistrimit || "")).slice(0, 5));
      }
    );
  }, []);

  return (
    <>
      <PageTitle title="Paneli" />
      <NavBar />
      <div className="containerDashboardP">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h1 className="titulliPerditeso mb-0">{businessName || "FinanCareLite"}</h1>
            <p className="text-muted mb-0">Gjeneratori i faturave, lokalisht në shfletuesin tuaj.</p>
          </div>
          <Link to="/faturat/re">
            <Button className="btn-primary">
              <Plus size={16} className="me-1" /> Faturë e Re
            </Button>
          </Link>
        </div>

        <div className="row g-3 mb-4">
          {[
            { icon: FileText, label: "Fatura", value: stats.invoices, to: "/faturat" },
            { icon: Users, label: "Klientë", value: stats.clients, to: "/klientet" },
            { icon: Package, label: "Produkte", value: stats.products, to: "/produktet" },
            { icon: Building2, label: "Totali i Shitjeve €", value: stats.total.toFixed(2), to: "/faturat" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div className="col-6 col-md-3" key={card.label}>
                <Link to={card.to} className="text-decoration-none">
                  <div className="p-3 rounded-4" style={{ background: "var(--sp-surface-2)", border: "1px solid var(--sp-border)" }}>
                    <Icon size={20} className="mb-2 text-emerald" style={{ color: "var(--sp-emerald)" }} />
                    <div className="fs-4 fw-bold">{card.value}</div>
                    <div className="text-muted small">{card.label}</div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <h5 className="mb-3">Faturat e Fundit</h5>
        {recent.length === 0 ? (
          <p className="text-muted">Nuk keni krijuar ende asnjë faturë.</p>
        ) : (
          <ul className="list-unstyled">
            {recent.map((inv) => {
              const dokumenti = DOCUMENT_TYPES.find((d) => d.value === inv.llojiDokumentit) || DOCUMENT_TYPES[0];
              return (
                <li key={inv.id} className="mb-2">
                  <Link to={`/faturat/${inv.id}`}>{inv.nrFatures}</Link> — {inv.klienti?.emriBiznesit}
                  <span className="text-muted small ms-2">({dokumenti.label})</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

export default Dashboard;
