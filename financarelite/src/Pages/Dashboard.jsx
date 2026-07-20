import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FileText, Users, Package, Wallet, Plus, ArrowUpRight } from "lucide-react";
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

      <div className="fclite-hero">
        <div>
          <h1 className="mb-1">{businessName || "FinanCareLite"}</h1>
          <p className="mb-0">Gjeneratori i faturave, lokalisht në shfletuesin tuaj.</p>
        </div>
        <Link to="/faturat/re">
          <Button className="btn-primary">
            <Plus size={16} className="me-1" /> Faturë e Re
          </Button>
        </Link>
      </div>

      <div className="containerDashboardP">
        <div className="fclite-stat-grid mb-4">
          {[
            { icon: FileText, label: "Fatura", value: stats.invoices, to: "/faturat" },
            { icon: Users, label: "Klientë", value: stats.clients, to: "/klientet" },
            { icon: Package, label: "Produkte", value: stats.products, to: "/produktet" },
            { icon: Wallet, label: "Totali i Shitjeve €", value: stats.total.toFixed(2), to: "/faturat" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Link to={card.to} className="fclite-stat-card" key={card.label}>
                <div className="fclite-stat-icon">
                  <Icon size={20} />
                </div>
                <div>
                  <div className="fclite-stat-value">{card.value}</div>
                  <div className="fclite-stat-label">{card.label}</div>
                </div>
              </Link>
            );
          })}
        </div>

        <h5 className="mb-3">Faturat e Fundit</h5>
        {recent.length === 0 ? (
          <p className="text-muted">Nuk keni krijuar ende asnjë faturë.</p>
        ) : (
          <div className="fclite-recent-list">
            {recent.map((inv) => {
              const dokumenti = DOCUMENT_TYPES.find((d) => d.value === inv.llojiDokumentit) || DOCUMENT_TYPES[0];
              return (
                <Link to={`/faturat/${inv.id}`} className="fclite-recent-row" key={inv.id}>
                  <div>
                    <div className="fw-bold">{inv.nrFatures}</div>
                    <div className="text-muted small">
                      {inv.klienti?.emriBiznesit} · {dokumenti.label}
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-muted" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .fclite-hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          background: linear-gradient(135deg, var(--sp-surface-2) 0%, var(--sp-bg) 100%);
          border-bottom: 1px solid var(--sp-border);
          padding: 2.5rem 1.75rem;
        }
        .fclite-hero h1 { font-weight: 900; letter-spacing: -0.03em; color: var(--sp-text); }
        .fclite-hero p { color: var(--sp-text-muted); }
        .fclite-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .fclite-stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--sp-surface-2);
          border: 1px solid var(--sp-border);
          border-radius: 16px;
          padding: 1.25rem;
          text-decoration: none !important;
          transition: all 0.2s ease;
        }
        .fclite-stat-card:hover {
          transform: translateY(-2px);
          border-color: var(--sp-emerald);
          box-shadow: 0 6px 18px var(--sp-emerald-glow);
        }
        .fclite-stat-icon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 12px;
          background: var(--sp-surface-3);
          color: var(--sp-emerald);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fclite-stat-value { font-size: 1.4rem; font-weight: 800; color: var(--sp-text); }
        .fclite-stat-label { font-size: 0.8rem; color: var(--sp-text-muted); }
        .fclite-recent-list { display: flex; flex-direction: column; gap: 0.6rem; }
        .fclite-recent-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--sp-surface-2);
          border: 1px solid var(--sp-border);
          border-radius: 12px;
          padding: 0.85rem 1.1rem;
          text-decoration: none !important;
          color: var(--sp-text);
          transition: all 0.2s ease;
        }
        .fclite-recent-row:hover { border-color: var(--sp-emerald); background: var(--sp-surface-3); }
      `}</style>
    </>
  );
}

export default Dashboard;
