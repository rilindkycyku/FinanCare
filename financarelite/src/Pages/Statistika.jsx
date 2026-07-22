import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Package,
  FileText, Receipt, ArrowUpRight,
} from "lucide-react";
import NavBar from "../Components/NavBar";
import PageTitle from "../Components/PageTitle";
import Footer from "../Components/Footer";
import { getAll, STORES } from "../lib/db";
import { calcInvoiceTotals } from "../lib/invoiceCalc";
import { useDocumentTypes } from "../lib/useConfigLists";
import "./Styles/PremiumTheme.css";
import "./Styles/DizajniPergjithshem.css";

const MUAJT = ["Jan", "Shk", "Mar", "Pri", "Maj", "Qer", "Kor", "Gus", "Sht", "Tet", "Nën", "Dhj"];

const KpiCard = ({ label, value, icon, color }) => {
  const Icon = icon;
  return (
    <Col xs={6} md={4} lg={3} className="st-kpi-col">
      <div className={`st-kpi-card st-kpi-${color}`}>
        <div className="st-kpi-icon">
          <Icon size={20} />
        </div>
        <div className="st-kpi-label">{label}</div>
        <div className="st-kpi-value">{value}</div>
      </div>
    </Col>
  );
};

const RankedRow = ({ rank, name, sub, value, barWidth, shareText }) => (
  <div className="d-flex align-items-center gap-2 mb-2 py-1">
    <span className="st-rank">#{rank}</span>
    <div className="flex-grow-1 min-w-0">
      <div className="fw-semibold text-truncate" style={{ fontSize: "0.85rem" }}>{name}</div>
      {sub && <div className="text-muted" style={{ fontSize: "0.7rem" }}>{sub}</div>}
    </div>
    <span className="st-rank-value">{value}</span>
    <div style={{ minWidth: 55 }}>
      <div className="st-bar-track">
        <div className="st-bar-fill" style={{ width: `${barWidth}%` }} />
      </div>
    </div>
    <span className="text-muted" style={{ fontSize: "0.7rem", minWidth: 32 }}>{shareText.toFixed(1)}%</span>
  </div>
);

function Statistika() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const documentTypes = useDocumentTypes();

  useEffect(() => {
    Promise.all([getAll(STORES.invoices), getAll(STORES.clients), getAll(STORES.products)]).then(
      ([inv, cl, pr]) => {
        setInvoices(inv);
        setClients(cl);
        setProducts(pr);
        setLoading(false);
      }
    );
  }, []);

  const stats = useMemo(() => {
    // Real sales invoices only — used for the client/product rankings and monthly trend below.
    const faturat = invoices.filter((inv) => inv.llojiDokumentit === "FAT");
    const totali = (list) => list.reduce((sum, inv) => sum + calcInvoiceTotals(inv.items, inv.transporti).totaliFinal, 0);
    const totaliFaturave = totali(faturat);

    // Dashboard KPI totals: the business can add as many document types as it wants (Cilësimet →
    // Llojet e Faturave), so instead of a card per type, every type reduces to positive or
    // negative via its own negateAmounts flag — the same flag already used to flip invoice
    // amounts when saving. This way custom types are always reflected, not just FAT/KTHIM/POR.
    const negatedTypes = new Set(documentTypes.filter((dt) => dt.negateAmounts).map((dt) => dt.value));
    const pozitivet = invoices.filter((inv) => !negatedTypes.has(inv.llojiDokumentit));
    const negativet = invoices.filter((inv) => negatedTypes.has(inv.llojiDokumentit));
    const totaliPozitiv = totali(pozitivet);
    const totaliNegativ = Math.abs(totali(negativet));
    const totaliNeto = totaliPozitiv - totaliNegativ;

    const byClient = new Map();
    faturat.forEach((inv) => {
      const emri = inv.klienti?.emriBiznesit || "Klient i panjohur";
      const val = calcInvoiceTotals(inv.items, inv.transporti).totaliFinal;
      byClient.set(emri, (byClient.get(emri) || 0) + val);
    });
    const topKlientet = Array.from(byClient.entries())
      .map(([emri, vlera]) => ({ emri, vlera }))
      .sort((a, b) => b.vlera - a.vlera)
      .slice(0, 5);

    const byProduct = new Map();
    faturat.forEach((inv) => {
      (inv.items || []).forEach((it) => {
        if (!it.emriProduktit) return;
        const sasia = parseFloat(it.sasiaStokut ?? it.sasia) || 0;
        const vlera = calcInvoiceTotals([it]).totaliFinal;
        const prev = byProduct.get(it.emriProduktit) || { sasia: 0, vlera: 0 };
        byProduct.set(it.emriProduktit, { sasia: prev.sasia + sasia, vlera: prev.vlera + vlera });
      });
    });
    const topProduktet = Array.from(byProduct.entries())
      .map(([emri, v]) => ({ emri, ...v }))
      .sort((a, b) => b.vlera - a.vlera)
      .slice(0, 5);

    const muajtHarta = new Map();
    faturat.forEach((inv) => {
      if (!inv.dataRegjistrimit) return;
      const d = new Date(inv.dataRegjistrimit);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const val = calcInvoiceTotals(inv.items, inv.transporti).totaliFinal;
      muajtHarta.set(key, (muajtHarta.get(key) || 0) + val);
    });
    const sotMuaji = new Date();
    const trendiMujor = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(sotMuaji.getFullYear(), sotMuaji.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      return { label: MUAJT[d.getMonth()], vlera: muajtHarta.get(key) || 0 };
    });

    return {
      totaliFaturave, totaliPozitiv, totaliNegativ, totaliNeto,
      nrPozitive: pozitivet.length, nrNegative: negativet.length,
      topKlientet, topProduktet, trendiMujor,
    };
  }, [invoices, documentTypes]);

  if (loading) {
    return (
      <div className="st-wrapper">
        <PageTitle title="Statistikat" />
        <NavBar />
        <Container className="py-5 text-center text-muted">Duke ngarkuar statistikat...</Container>
      </div>
    );
  }

  const maxTrend = Math.max(...stats.trendiMujor.map((m) => m.vlera), 1);
  const maxKlient = stats.topKlientet[0]?.vlera || 1;
  const maxProdukt = stats.topProduktet[0]?.vlera || 1;

  return (
    <div className="st-wrapper">
      <PageTitle title="Statistikat" />
      <NavBar />

      <Container className="py-4">
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1">Statistikat e Shitjeve</h2>
            <p className="text-muted mb-0">Përmbledhje e performancës së biznesit tuaj.</p>
          </div>
        </div>

        <Row className="g-2 g-md-4">
          <KpiCard label="Shitjet Neto" value={`${stats.totaliNeto.toFixed(2)} €`} icon={DollarSign} color="emerald" />
          <KpiCard label="Dokumente Pozitive" value={stats.nrPozitive} icon={FileText} color="info" />
          <KpiCard label="Dokumente Negative" value={stats.nrNegative} icon={Receipt} color="danger" />
          <KpiCard label="Klientë Gjithsej" value={clients.length} icon={Users} color="info" />
          <KpiCard label="Produkte Gjithsej" value={products.length} icon={Package} color="emerald" />
          <KpiCard label="Totali Pozitiv" value={`${stats.totaliPozitiv.toFixed(2)} €`} icon={TrendingUp} color="emerald" />
          <KpiCard label="Totali Negativ" value={`${stats.totaliNegativ.toFixed(2)} €`} icon={TrendingDown} color="danger" />
        </Row>

        <Row className="g-4 mt-1">
          <Col xl={6}>
            <div className="st-panel h-100">
              <div className="st-panel-header">
                <BarChart3 size={18} className="text-emerald" />
                Trendi Mujor i Shitjeve — 6 Muajt e Fundit
              </div>
              <div className="st-panel-body">
                {maxTrend <= 1 && stats.trendiMujor.every((m) => m.vlera === 0) ? (
                  <p className="text-muted text-center py-4 mb-0">Nuk ka të dhëna ende.</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {stats.trendiMujor.map((m, i) => (
                      <div key={i} className="d-flex align-items-center gap-3">
                        <span className="text-muted" style={{ minWidth: 34, fontSize: "0.78rem" }}>{m.label}</span>
                        <div className="flex-grow-1 st-bar-track" style={{ height: 8 }}>
                          <div className="st-bar-fill" style={{ width: `${(m.vlera / maxTrend) * 100}%`, height: 8 }} />
                        </div>
                        <span className="fw-bold text-emerald" style={{ minWidth: 90, fontSize: "0.8rem", textAlign: "right" }}>
                          {m.vlera.toFixed(2)} €
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Col>

          <Col xl={6}>
            <div className="st-panel h-100">
              <div className="st-panel-header">
                <Users size={18} className="text-emerald" />
                Top 5 Klientët sipas Shitjeve
              </div>
              <div className="st-panel-body">
                {stats.topKlientet.length === 0 ? (
                  <p className="text-muted text-center py-4 mb-0">Nuk ka fatura ende.</p>
                ) : (
                  stats.topKlientet.map((k, i) => (
                    <RankedRow
                      key={k.emri}
                      rank={i + 1}
                      name={k.emri}
                      value={`${k.vlera.toFixed(2)} €`}
                      barWidth={(k.vlera / maxKlient) * 100}
                      shareText={stats.totaliFaturave > 0 ? (k.vlera / stats.totaliFaturave) * 100 : 0}
                    />
                  ))
                )}
              </div>
            </div>
          </Col>

          <Col xl={6}>
            <div className="st-panel h-100">
              <div className="st-panel-header">
                <Package size={18} className="text-emerald" />
                Top 5 Produktet e Shitura
              </div>
              <div className="st-panel-body">
                {stats.topProduktet.length === 0 ? (
                  <p className="text-muted text-center py-4 mb-0">Nuk ka fatura ende.</p>
                ) : (
                  stats.topProduktet.map((p, i) => (
                    <RankedRow
                      key={p.emri}
                      rank={i + 1}
                      name={p.emri}
                      sub={`Sasia: ${p.sasia}`}
                      value={`${p.vlera.toFixed(2)} €`}
                      barWidth={(p.vlera / maxProdukt) * 100}
                      shareText={stats.totaliFaturave > 0 ? (p.vlera / stats.totaliFaturave) * 100 : 0}
                    />
                  ))
                )}
              </div>
            </div>
          </Col>

          <Col xl={6}>
            <div className="st-panel h-100">
              <div className="st-panel-header">
                <FileText size={18} className="text-emerald" />
                Veprime
              </div>
              <div className="st-panel-body d-flex flex-column gap-2">
                <Link to="/faturat" className="st-action-link">
                  Shiko të gjitha faturat <ArrowUpRight size={14} />
                </Link>
                <Link to="/kartela-analitike" className="st-action-link">
                  Kartela Analitike e klientëve <ArrowUpRight size={14} />
                </Link>
                <Link to="/faturat/re" className="st-action-link">
                  Krijo faturë të re <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <Footer />

      <style>{`
        .st-wrapper { background-color: var(--sp-bg); min-height: 100vh; }
        .st-kpi-card {
          background: var(--sp-surface-2);
          border: 1px solid var(--sp-border);
          border-radius: 16px;
          padding: 1.25rem;
          height: 100%;
          border-top: 3px solid var(--sp-border);
          transition: all 0.2s ease;
        }
        .st-kpi-card:hover { border-color: var(--sp-emerald); }
        .st-kpi-emerald { border-top-color: var(--sp-emerald); }
        .st-kpi-info { border-top-color: var(--sp-cyan, #06b6d4); }
        .st-kpi-danger { border-top-color: var(--sp-red, #ef4444); }
        .st-kpi-icon {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.75rem; background: var(--sp-surface-3); color: var(--sp-emerald);
        }
        .st-kpi-label {
          font-size: 0.7rem; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.06em; color: var(--sp-text-muted); margin-bottom: 0.35rem;
        }
        .st-kpi-value { font-size: 1.4rem; font-weight: 700; color: var(--sp-text); }
        .st-kpi-col { margin-bottom: 1rem; }
        @media (max-width: 575.98px) {
          .st-kpi-col { margin-bottom: 0.4rem; }
          .st-kpi-card { padding: 0.6rem 0.65rem; border-radius: 10px; border-top-width: 2px; }
          .st-kpi-icon {
            width: 22px; height: 22px; border-radius: 6px; margin-bottom: 0.35rem;
          }
          .st-kpi-icon svg { width: 12px; height: 12px; }
          .st-kpi-label { font-size: 0.5rem; margin-bottom: 0.15rem; }
          .st-kpi-value { font-size: 0.85rem; }
        }
        .st-panel {
          background: var(--sp-surface-2);
          border: 1px solid var(--sp-border);
          border-radius: 16px;
          overflow: hidden;
        }
        .st-panel-header {
          display: flex; align-items: center; gap: 10px;
          padding: 1rem 1.25rem;
          background: var(--sp-surface-3);
          border-bottom: 1px solid var(--sp-border);
          font-size: 0.85rem; font-weight: 800;
        }
        .st-panel-body { padding: 1.25rem; }
        .st-rank { color: var(--sp-text-muted); font-weight: 700; min-width: 22px; font-size: 0.8rem; }
        .st-rank-value { font-weight: 700; color: var(--sp-cyan, #06b6d4); font-size: 0.85rem; min-width: 85px; text-align: right; }
        .st-bar-track {
          height: 5px; border-radius: 999px; background: var(--sp-surface-3); overflow: hidden;
        }
        .st-bar-fill {
          height: 100%; border-radius: 999px;
          background: linear-gradient(90deg, var(--sp-emerald), var(--sp-emerald));
          opacity: 0.85;
        }
        .st-action-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.85rem 1rem; border-radius: 12px;
          background: var(--sp-surface-3); border: 1px solid var(--sp-border);
          color: var(--sp-text); text-decoration: none !important; font-weight: 600;
          transition: all 0.2s ease;
        }
        .st-action-link:hover { border-color: var(--sp-emerald); color: var(--sp-emerald); }
      `}</style>
    </div>
  );
}

export default Statistika;
