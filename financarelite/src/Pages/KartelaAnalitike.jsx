import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { TrendingUp, TrendingDown, Wallet, Lightbulb, X, Building2 } from "lucide-react";
import NavBar from "../Components/NavBar";
import PageTitle from "../Components/PageTitle";
import Tabela from "../Components/Tabela/Tabela";
import { getAll, STORES } from "../lib/db";
import { calcInvoiceTotals } from "../lib/invoiceCalc";
import { DOCUMENT_TYPES } from "../lib/options";
import { darkSelectStyles } from "../lib/darkSelectStyles";
import "./Styles/PremiumTheme.css";
import "./Styles/DizajniPergjithshem.css";

const PARTNER_FIELDS = [
  { key: "shkurtesaPartnerit", label: "Shkurtesa" },
  { key: "nui", label: "NUI" },
  { key: "nrf", label: "Nr. Fiskal (NF)" },
  { key: "tvsh", label: "Nr. TVSH" },
  { key: "llojiPartnerit", label: "Lloji", format: (v) => (v === "biznes" ? "Biznesor" : "Privat") },
  { key: "adresa", label: "Adresa" },
  { key: "nrKontaktit", label: "Nr. Kontaktit" },
  { key: "email", label: "Email" },
];

/** A per-client invoice statement — every invoice issued to one client, with running totals.
 * Modeled visually on FinanCare's Kartela Financiare, but FinanCareLite has no payments-received
 * tracking, so this stays a statement of what's been invoiced rather than a true debit/credit
 * ledger: "Faturim €" (Faturë Shitëse) increases the balance, "Pagesë €" (Fletëkthim/Kredit
 * Notë) decreases it, and Porosi — not a completed sale — doesn't move the balance at all, same
 * as an order carries no financial weight in FinanCare's own ledger. Invoices only carry a
 * snapshot of the client's data (no foreign key back to the client record), so matching is done
 * by business name. */
function KartelaAnalitike() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [showTip, setShowTip] = useState(true);

  useEffect(() => {
    Promise.all([getAll(STORES.clients), getAll(STORES.invoices)]).then(([clientList, invoiceList]) => {
      setClients(clientList);
      setInvoices(invoiceList);
    });
  }, []);

  const clientOptions = useMemo(() => clients.map((c) => ({ value: c.id, label: c.emriBiznesit })), [clients]);
  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  const ledger = useMemo(() => {
    if (!selectedClient) return { rows: [], hyrje: 0, dalje: 0, saldo: 0 };
    const emri = (selectedClient.emriBiznesit || "").trim().toLowerCase();
    const sorted = invoices
      .filter((inv) => (inv.klienti?.emriBiznesit || "").trim().toLowerCase() === emri)
      .sort((a, b) => (a.dataRegjistrimit || "").localeCompare(b.dataRegjistrimit || ""));

    let saldo = 0;
    let hyrje = 0;
    let dalje = 0;
    const rows = sorted.map((inv, i) => {
      const dokumenti = DOCUMENT_TYPES.find((d) => d.value === inv.llojiDokumentit) || DOCUMENT_TYPES[0];
      const totali = calcInvoiceTotals(inv.items, inv.transporti).totaliFinal;
      // Porosi is just a pending order, not a completed sale — it lists here but doesn't touch
      // the balance, mirroring how FinanCare's own ledger skips document types outside its
      // debit/credit lists.
      let faturim = 0;
      let pagese = 0;
      if (dokumenti.value === "FAT") faturim = totali;
      else if (dokumenti.value === "KTHIM") pagese = Math.abs(totali);
      saldo += faturim - pagese;
      hyrje += faturim;
      dalje += pagese;
      return {
        ID: inv.id,
        "NR.": i + 1,
        Data: inv.dataRegjistrimit,
        Lloji: dokumenti.value,
        "Nr. Faturës": inv.nrFatures,
        Përshkrimi: inv.pershkrimShtese || "-",
        "Faturim €": faturim > 0 ? faturim.toFixed(2) : "-",
        "Pagesë €": pagese > 0 ? pagese.toFixed(2) : "-",
        "Saldo €": saldo.toFixed(2),
      };
    });
    return { rows, hyrje, dalje, saldo };
  }, [invoices, selectedClient]);

  return (
    <>
      <PageTitle title="Kartela Analitike" />
      <NavBar />

      <div className="containerDashboardP text-center">
        <h1 className="titulliPerditeso">Kartela Analitike</h1>
        <p className="text-muted">Shikoni gjendjen financiare të çdo klienti në kohë reale</p>
      </div>

      <div className="containerDashboardP">
        {showTip && (
          <div className="ka-tip mb-4">
            <Lightbulb size={18} className="text-emerald flex-shrink-0 mt-1" />
            <div className="flex-grow-1">
              <div className="fw-bold mb-1">Kartela Analitike</div>
              <div className="text-muted small">
                Zgjidhni një klient për të parë historikun e tij financiar: faturat, fletëkthimet dhe saldon
                aktuale, me mundësi eksportimi në Excel.
              </div>
            </div>
            <button type="button" className="btn-close-ka" onClick={() => setShowTip(false)} aria-label="Mbyll">
              <X size={16} />
            </button>
          </div>
        )}

        <label className="ka-select-label">Zgjidh Klientin</label>
        <div style={{ maxWidth: 420 }} className="mb-4">
          <Select
            styles={darkSelectStyles}
            classNamePrefix="react-select"
            options={clientOptions}
            isClearable
            placeholder="— zgjidh klientin —"
            value={clientOptions.find((o) => o.value === selectedClientId) || null}
            onChange={(opt) => setSelectedClientId(opt?.value || "")}
          />
        </div>

        {selectedClient && (
          <>
            <div className="ka-stat-grid mb-4">
              <div className="ka-stat-card ka-stat-in">
                <div className="ka-stat-icon">
                  <TrendingUp size={20} />
                </div>
                <div className="ka-stat-label">Totali i Faturimit</div>
                <div className="ka-stat-value">{ledger.hyrje.toFixed(2)}</div>
                <div className="ka-stat-unit">EUR €</div>
              </div>
              <div className="ka-stat-card ka-stat-out">
                <div className="ka-stat-icon">
                  <TrendingDown size={20} />
                </div>
                <div className="ka-stat-label">Totali i Fletëkthimeve</div>
                <div className="ka-stat-value">{ledger.dalje.toFixed(2)}</div>
                <div className="ka-stat-unit">EUR €</div>
              </div>
              <div className="ka-stat-card ka-stat-saldo">
                <div className="ka-stat-icon">
                  <Wallet size={20} />
                </div>
                <div className="ka-stat-label">Saldo</div>
                <div className="ka-stat-value">{ledger.saldo.toFixed(2)}</div>
                <div className="ka-stat-unit">EUR €</div>
              </div>
            </div>

            <div className="ka-partner-panel mb-4">
              <div className="ka-partner-header">
                <Building2 size={14} className="me-2" />
                TË DHËNAT E KLIENTIT — {selectedClient.emriBiznesit?.toUpperCase()}
              </div>
              <div className="ka-partner-grid">
                {PARTNER_FIELDS.map((f) => (
                  <div key={f.key}>
                    <div className="ka-partner-label">{f.label}</div>
                    <div className="ka-partner-value">
                      {f.format ? f.format(selectedClient[f.key]) : selectedClient[f.key] || "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Tabela
              data={ledger.rows}
              tableName={`Kartela Analitike — ${selectedClient.emriBiznesit}`}
              dateField="Data"
              kaButona
              funksionShfaqFature={(id) => navigate(`/faturat/${id}`)}
              mosShfaqID
            />
          </>
        )}
      </div>

      <style>{`
        .ka-tip {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: var(--sp-emerald-glow);
          border: 1px solid var(--sp-border-glow);
          border-radius: 16px;
          padding: 1rem 1.25rem;
        }
        .btn-close-ka {
          background: none;
          border: none;
          color: var(--sp-text-muted);
          flex-shrink: 0;
        }
        .btn-close-ka:hover { color: var(--sp-text); }
        .ka-select-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--sp-text-muted);
          margin-bottom: 0.5rem;
        }
        .ka-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .ka-stat-card {
          background: var(--sp-surface-2);
          border: 1px solid var(--sp-border);
          border-radius: 16px;
          padding: 1.25rem;
          border-top: 3px solid var(--sp-border);
        }
        .ka-stat-in { border-top-color: var(--sp-emerald); }
        .ka-stat-out { border-top-color: var(--sp-red); }
        .ka-stat-saldo { border-top-color: var(--sp-cyan); }
        .ka-stat-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
          background: var(--sp-surface-3);
        }
        .ka-stat-in .ka-stat-icon { color: var(--sp-emerald); }
        .ka-stat-out .ka-stat-icon { color: var(--sp-red); }
        .ka-stat-saldo .ka-stat-icon { color: var(--sp-cyan); }
        .ka-stat-label {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--sp-text-muted);
          margin-bottom: 0.4rem;
        }
        .ka-stat-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--sp-text);
        }
        .ka-stat-unit { font-size: 0.75rem; color: var(--sp-text-muted); margin-top: 0.15rem; }
        .ka-partner-panel {
          background: var(--sp-surface-2);
          border: 1px solid var(--sp-border);
          border-radius: 16px;
          overflow: hidden;
        }
        .ka-partner-header {
          display: flex;
          align-items: center;
          padding: 0.9rem 1.25rem;
          background: var(--sp-surface-3);
          border-bottom: 1px solid var(--sp-border);
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: var(--sp-cyan);
        }
        .ka-partner-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1.25rem;
          padding: 1.25rem;
        }
        .ka-partner-label {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--sp-text-muted);
          margin-bottom: 0.25rem;
        }
        .ka-partner-value { font-weight: 600; color: var(--sp-text); }
      `}</style>
    </>
  );
}

export default KartelaAnalitike;
