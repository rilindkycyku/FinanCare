import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { TrendingUp, TrendingDown, Wallet, Lightbulb, X, Building2, Printer, Download, Loader2, CreditCard } from "lucide-react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import PageTitle from "../Components/PageTitle";
import Tabela from "../Components/Tabela/Tabela";
import PagesaModal from "../Components/PagesaModal";
import { getAll, getBusinessDetails, remove, STORES } from "../lib/db";
import { calcInvoiceTotals } from "../lib/invoiceCalc";
import { DEFAULT_DOCUMENT_TYPES } from "../lib/options";
import { useDocumentTypes } from "../lib/useConfigLists";
import { darkSelectStyles } from "../lib/darkSelectStyles";
import { downloadKartelaAnalitikePDF, printKartelaAnalitikePDF } from "../Components/KartelaAnalitikePDF";
import { useDialog } from "../Context/DialogContext";
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

/** A per-client statement — every invoice issued to one client plus every payment recorded
 * against them (see PagesaModal/"Shto Pagesë" below), with running totals. Modeled on
 * FinanCare's Kartela Financiare: "Faturim €" (a positive document type, e.g. Faturë Shitëse)
 * increases the balance, "Pagesë €" (a negative document type like Fletëkthim, or an actual
 * recorded payment) decreases it, and Porosi — not a completed sale — doesn't move the balance
 * at all, same as an order carries no financial weight in FinanCare's own ledger. A client who's
 * paid every invoice in full nets to a 0 saldo instead of sitting at the full invoiced total
 * forever. Invoices/payments only carry a snapshot of the client's data (no foreign key back to
 * the client record), so matching is done by business name. */
function KartelaAnalitike() {
  const navigate = useNavigate();
  const dialog = useDialog();
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [showTip, setShowTip] = useState(true);
  const [showPagesaModal, setShowPagesaModal] = useState(false);
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState({});
  const [savingPdf, setSavingPdf] = useState(false);
  const [printingPdf, setPrintingPdf] = useState(false);
  const documentTypesLoaded = useDocumentTypes();
  const documentTypes = documentTypesLoaded.length > 0 ? documentTypesLoaded : DEFAULT_DOCUMENT_TYPES;

  const loadData = () =>
    Promise.all([getAll(STORES.clients), getAll(STORES.invoices), getAll(STORES.payments), getBusinessDetails()]).then(
      ([clientList, invoiceList, paymentList, biz]) => {
        setClients(clientList);
        setInvoices(invoiceList);
        setPayments(paymentList);
        setTeDhenatBiznesit(biz || {});
      }
    );

  useEffect(() => {
    loadData();
  }, []);

  const clientOptions = useMemo(() => clients.map((c) => ({ value: c.id, label: c.emriBiznesit })), [clients]);
  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  const ledger = useMemo(() => {
    if (!selectedClient) return { rows: [], hyrje: 0, dalje: 0, saldo: 0 };
    const emri = (selectedClient.emriBiznesit || "").trim().toLowerCase();

    const invoiceEntries = invoices
      .filter((inv) => (inv.klienti?.emriBiznesit || "").trim().toLowerCase() === emri)
      .map((inv) => ({ kind: "invoice", record: inv, date: inv.dataRegjistrimit }));
    const paymentEntries = payments
      .filter((p) => (p.klienti?.emriBiznesit || "").trim().toLowerCase() === emri)
      .map((p) => ({ kind: "payment", record: p, date: p.dataRegjistrimit }));

    const sorted = [...invoiceEntries, ...paymentEntries].sort((a, b) => (a.date || "").localeCompare(b.date || ""));

    let saldo = 0;
    let hyrje = 0;
    let dalje = 0;
    const rows = sorted.map((entry, i) => {
      if (entry.kind === "payment") {
        const p = entry.record;
        const pagese = Math.abs(parseFloat(p.shuma) || 0);
        saldo -= pagese;
        dalje += pagese;
        const menyraLabel = p.menyra === "banke" ? "Bankë" : p.menyra === "tjeter" ? "Tjetër" : "Kesh";
        return {
          ID: p.id,
          "NR.": i + 1,
          Data: p.dataRegjistrimit,
          Lloji: "PAGESË",
          "Nr. Faturës": "-",
          Përshkrimi: p.pershkrimi || `Pagesë (${menyraLabel})`,
          "Faturim €": "-",
          "Pagesë €": pagese.toFixed(2),
          "Saldo €": saldo.toFixed(2),
        };
      }

      const inv = entry.record;
      const dokumenti = documentTypes.find((d) => d.value === inv.llojiDokumentit) || documentTypes[0];
      const totali = calcInvoiceTotals(inv.items, inv.transporti).totaliFinal;
      // Porosi is just a pending order, not a completed sale — it lists here but doesn't touch
      // the balance, mirroring how FinanCare's own ledger skips document types outside its
      // debit/credit lists. Every other type — FAT, KTHIM, and any custom type added from
      // "Llojet e Faturave" — moves the balance based on its own Pozitive/Negative choice: a
      // positive type adds to what's owed (faturim), a negative one reduces it (pagese), so a
      // brand-new custom type behaves correctly without needing its own special case here. Actual
      // payments received (see PagesaModal/"Shto Pagesë" above) are the other, more common way
      // the balance comes back down to 0 once a client has paid.
      let faturim = 0;
      let pagese = 0;
      if (dokumenti.value !== "POR") {
        if (dokumenti.negateAmounts) pagese = Math.abs(totali);
        else faturim = totali;
      }
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
  }, [invoices, payments, selectedClient, documentTypes]);

  const kartelaPdfArgs = () => ({
    rows: ledger.rows,
    client: selectedClient,
    teDhenatBiznesit,
    hyrje: ledger.hyrje,
    dalje: ledger.dalje,
    saldo: ledger.saldo,
    clientName: selectedClient.emriBiznesit,
  });

  const handlePrint = async () => {
    if (!selectedClient || printingPdf) return;
    setPrintingPdf(true);
    try {
      await printKartelaAnalitikePDF(kartelaPdfArgs());
    } catch (err) {
      console.error("Gabim gjatë krijimit të PDF-së për printim:", err);
    } finally {
      setPrintingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedClient || savingPdf) return;
    setSavingPdf(true);
    try {
      await downloadKartelaAnalitikePDF(kartelaPdfArgs());
    } catch (err) {
      console.error("Gabim gjatë krijimit të PDF-së:", err);
    } finally {
      setSavingPdf(false);
    }
  };

  const handleDeletePayment = async (id) => {
    if (!(await dialog.confirm("Ta fshij këtë pagesë?", { title: "Fshi Pagesën" }))) return;
    await remove(STORES.payments, id);
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

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

        <div className="d-flex align-items-end justify-content-between flex-wrap gap-3 mb-4">
          <div style={{ maxWidth: 420, width: "100%" }}>
            <label className="ka-select-label">Zgjidh Klientin</label>
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
            <div className="d-flex gap-2">
              <button type="button" className="ka-action-btn ka-action-btn-primary" onClick={() => setShowPagesaModal(true)}>
                <CreditCard size={14} />
                Shto Pagesë
              </button>
              <button type="button" className="ka-action-btn" onClick={handlePrint} disabled={printingPdf}>
                {printingPdf ? <Loader2 size={14} className="ka-spin" /> : <Printer size={14} />}
                {printingPdf ? "Duke përgatitur..." : "Printo"}
              </button>
              <button type="button" className="ka-action-btn" onClick={handleDownloadPdf} disabled={savingPdf}>
                {savingPdf ? <Loader2 size={14} className="ka-spin" /> : <Download size={14} />}
                {savingPdf ? "Duke gjeneruar..." : "Shkarko PDF"}
              </button>
            </div>
          )}
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
                <div className="ka-stat-label">Totali i Pagesave</div>
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
              funksionEshteShikimDisabled={(id) => id.startsWith("pay_")}
              funksionButonFshij={(id) => handleDeletePayment(id)}
              funksionEshteFshirjeDisabled={(id) => !id.startsWith("pay_")}
              mosShfaqID
            />
          </>
        )}
      </div>

      <PagesaModal
        show={showPagesaModal}
        onHide={() => setShowPagesaModal(false)}
        klienti={selectedClient}
        onSaved={(record) => setPayments((prev) => [...prev, record])}
      />

      <Footer />

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
        .ka-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--sp-surface-2);
          border: 1px solid var(--sp-border);
          color: var(--sp-text);
          border-radius: 10px;
          padding: 0.6rem 1.1rem;
          font-weight: 700;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }
        .ka-action-btn:hover:not(:disabled) { border-color: var(--sp-emerald); color: var(--sp-emerald); background: var(--sp-surface-3); }
        .ka-action-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .ka-action-btn-primary {
          background: var(--sp-emerald);
          border-color: var(--sp-emerald);
          color: #06281d;
        }
        .ka-action-btn-primary:hover:not(:disabled) { background: var(--sp-emerald); color: #06281d; filter: brightness(1.08); }
        .ka-spin { animation: ka-spin 0.8s linear infinite; }
        @keyframes ka-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
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
        .ka-partner-value { font-weight: 600; color: var(--sp-text); font-size: 0.85rem; }
        @media (max-width: 575.98px) {
          .ka-action-btn { padding: 0.5rem 0.8rem; font-size: 0.75rem; }
          .ka-stat-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
          .ka-stat-card { padding: 0.65rem 0.7rem; border-radius: 10px; border-top-width: 2px; }
          .ka-stat-icon { width: 24px; height: 24px; border-radius: 7px; margin-bottom: 0.35rem; }
          .ka-stat-icon svg { width: 13px; height: 13px; }
          .ka-stat-label { font-size: 0.52rem; margin-bottom: 0.2rem; }
          .ka-stat-value { font-size: 1rem; }
          .ka-stat-unit { font-size: 0.6rem; }
          .ka-partner-header { padding: 0.6rem 0.75rem; font-size: 0.65rem; }
          .ka-partner-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; padding: 0.75rem; }
          .ka-partner-label { font-size: 0.58rem; }
          .ka-partner-value { font-size: 0.75rem; }
        }
      `}</style>
    </>
  );
}

export default KartelaAnalitike;
