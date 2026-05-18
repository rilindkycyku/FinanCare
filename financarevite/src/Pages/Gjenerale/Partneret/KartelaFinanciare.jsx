import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import { darkSelectStyles } from "@/utils/darkSelectStyles";
import exportFromJSON from "export-from-json";
import { downloadKartelaPDF } from "../../../Components/Gjenerale/Partneret/KartelaFinanciarePDF";
import {
  Printer,
  Building2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Search,
  Users,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import "../../Styles/KartelaFinanciare.css";

/* ── Helpers ─────────────────────────────────────────────────── */
const DEBIT_TYPES = ["HYRJE", "FAT", "AS", "PARAGON", "SALDO", "ONLINE"];
const CREDIT_TYPES = ["FL", "KMSH", "KMB", "PAGES"];

function fmt(val) {
  const n = parseFloat(val);
  return isNaN(n) ? "0.00" : n.toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildRows(kalkulimet = []) {
  let saldo = 0;
  return kalkulimet.map((p, i) => {
    const vlera = Math.abs(p.totaliPaTVSH + p.tvsh - p.rabati);
    let faturim = 0, pagese = 0;
    if (DEBIT_TYPES.includes(p.llojiKalkulimit)) { faturim = vlera; saldo += vlera; }
    else if (CREDIT_TYPES.includes(p.llojiKalkulimit)) { pagese = vlera; saldo -= vlera; }
    return {
      "NR.": i + 1,
      "Data": new Date(p.dataRegjistrimit).toLocaleDateString("sq-AL"),
      "Lloji": p.llojiKalkulimit,
      "Nr. Faturës": p.nrFatures,
      "Përshkrimi": p.pershkrimShtese || "-",
      "Faturim €": faturim > 0 ? fmt(faturim) : "-",
      "Pagesë €": pagese > 0 ? fmt(pagese) : "-",
      "Saldo €": fmt(saldo * -1),
      _faturim: faturim,
      _pagese: pagese,
      _saldo: saldo * -1,
    };
  });
}

/* ── Component ───────────────────────────────────────────────── */
function KartelaFinanciare() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const navigate = useNavigate();

  const getToken = localStorage.getItem("token");
  const getID = localStorage.getItem("id");
  const auth = { headers: { Authorization: `Bearer ${getToken}` } };

  const [allPartners, setAllPartners] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [kartela, setKartela] = useState(null);
  const [tableRows, setTableRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [partnerId, setPartnerId] = useState(null);
  const [biznesit, setBiznesit] = useState(null);

  // Redirect if no session
  useEffect(() => { if (!getID) navigate("/login"); }, []);

  // Load business data for PDF header
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`, auth)
      .then(r => setBiznesit(r.data))
      .catch(console.error);
  }, []);

  // Load all partners once
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/Partneri/shfaqPartneret`, auth)
      .then(res => {
        const opts = res.data
          .filter(p => ![1, 2, 3].includes(p.idPartneri))
          .map(p => ({ value: p.idPartneri, label: p.emriBiznesit }));
        setAllPartners(opts);
      })
      .catch(console.error);
  }, []);

  // Filtered options (memoized - min 2 chars)
  const filteredOptions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) return [];
    const lower = inputValue.toLowerCase();
    const out = [];
    for (const o of allPartners) {
      if (o.label.toLowerCase().includes(lower)) { out.push(o); if (out.length >= 50) break; }
    }
    return out;
  }, [inputValue, allPartners]);

  // Load kartela when partner changes
  useEffect(() => {
    if (!partnerId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/Partneri/KartelaFinanciare?id=${partnerId}`, auth);
        setKartela(res.data);
        setTableRows(buildRows(res.data?.kalkulimet));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [partnerId]);

  const handleChange = (selected) => {
    setOptionsSelected(selected);
    setPartnerId(selected?.value ?? null);
    if (!selected) { setKartela(null); setTableRows([]); }
  };

  // PDF download
  const handleDownloadPDF = async () => {
    if (!tableRows.length || saving) return;
    setSaving(true);
    try {
      await downloadKartelaPDF({
        rows: tableRows,
        partner: partner,
        biznesit: biznesit,
        totHyrje: totHyrje,
        totDalje: totDalje,
        saldo: saldo,
        partnerName: optionsSelected?.label,
      });
    } catch (err) { console.error("PDF error:", err); }
    finally { setSaving(false); }
  };

  // Excel export
  const handleExportExcel = () => {
    if (!tableRows.length) return;
    const sanitize = (name = "") => name
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[çÇ]/g, "C").replace(/[ëË]/g, "E")
      .replace(/\./g, "")
      .replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
    const data = tableRows.map(({ _faturim, _pagese, _saldo, ...r }) => r);
    const date = new Date().toLocaleDateString("sq-AL").replace(/\./g, "-");
    exportFromJSON({
      data,
      fileName: `Kartela_${sanitize(optionsSelected?.label)}_${date}`,
      exportType: exportFromJSON.types.xls,
    });
  };

  // Derived
  const totHyrje = parseFloat(kartela?.totaliHyrese || 0);
  const totDalje = parseFloat(kartela?.totaliDalese || 0);
  const saldo = totDalje - totHyrje;
  const partner = kartela?.partneri;
  const hasData = !loading && tableRows.length > 0;

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Financa", "Mbeshtetje e Klientit", "1 Euro Menaxher"]} />
      <NavBar />

      {/* PDF generation overlay */}
      {saving && (
        <div className="kf-pdf-overlay">
          <div className="kf-pdf-overlay-card">
            <div className="kf-pdf-spinner" />
            <div className="kf-pdf-overlay-title">Duke gjeneruar PDF...</div>
            <div className="kf-pdf-overlay-sub">Ju lutem prisni, ky proces mund të zgjasë pak sekonda.</div>
          </div>
        </div>
      )}

      <div className="kf-page">
        <div className="kf-inner">

          {/* Hero */}
          <div className="kf-hero">
            <h1>Kartela Financiare</h1>
            <p>Shiko gjendjen financiare të çdo partneri në kohë reale</p>
          </div>

          {/* Search + Action Buttons Row */}
          <div className="kf-search-row">
            <div className="kf-select-wrap">
              <span className="kf-select-label">Zgjidh Partnerin</span>
              <Select
                value={optionsSelected}
                onChange={handleChange}
                options={filteredOptions}
                onInputChange={(val) => setInputValue(val)}
                inputValue={inputValue}
                id="partnerSelect"
                inputId="partnerSelect-input"
                styles={darkSelectStyles}
                isClearable
                placeholder="Kërko emrin e partnerit..."
                noOptionsMessage={() =>
                  inputValue.length < 2 ? "Shkruani të paktën 2 karaktere..." : "Nuk u gjet partner"
                }
                isLoading={allPartners.length === 0}
              />
              <div className="kf-hint">Shkruani emrin e partnerit për të kërkuar</div>
            </div>

            {hasData && (
              <div className="kf-action-btns">
                <button className="kf-btn-print" onClick={handleDownloadPDF} disabled={saving}>
                  {saving ? <Loader2 size={14} className="kf-spin" /> : <Printer size={14} />}
                  {saving ? "Duke gjeneruar..." : "Shkarko PDF"}
                </button>
                <button className="kf-btn-excel" onClick={handleExportExcel}>
                  <FileSpreadsheet size={14} /> Eksporto Excel
                </button>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          {kartela && !loading && (
            <div className="kf-summary-grid">
              <div className="kf-summary-card income">
                <div className="card-glow" />
                <div className="kf-card-icon"><TrendingUp size={18} /></div>
                <div className="kf-card-label">Totali i Hyrjes</div>
                <div className="kf-card-value">{fmt(totHyrje)}</div>
                <div className="kf-card-currency">EUR €</div>
              </div>
              <div className="kf-summary-card expense">
                <div className="card-glow" />
                <div className="kf-card-icon"><TrendingDown size={18} /></div>
                <div className="kf-card-label">Totali i Daljes</div>
                <div className="kf-card-value">{fmt(totDalje)}</div>
                <div className="kf-card-currency">EUR €</div>
              </div>
              <div className="kf-summary-card balance">
                <div className="card-glow" />
                <div className="kf-card-icon"><Wallet size={18} /></div>
                <div className="kf-card-label">Saldo</div>
                <div className="kf-card-value">{fmt(saldo)}</div>
                <div className="kf-card-currency">EUR €</div>
              </div>
            </div>
          )}

          {/* Partner Info Panel */}
          {partner && !loading && (
            <div className="kf-partner-panel">
              <div className="kf-panel-header">
                <Building2 size={14} />
                Të Dhënat e Partnerit - {partner.emriBiznesit}
              </div>
              <div className="kf-panel-body">
                {[
                  ["Shkurtesa", partner.shkurtesaPartnerit],
                  ["Nr. Unik", partner.nui],
                  ["Nr. Fiskal", partner.nrf],
                  ["Nr. TVSH", partner.tvsh],
                  ["Lloji", partner.llojiPartnerit],
                  ["Adresa", partner.adresa],
                  ["Nr. Kontaktit", partner.nrKontaktit],
                  ["Kodi Kartelës", partner.kartela?.kodiKartela],
                  ["Rabati %", partner.kartela?.rabati != null ? parseFloat(partner.kartela.rabati).toFixed(2) + " %" : null],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div className="kf-info-item" key={label}>
                    <div className="info-label">{label}</div>
                    <div className="info-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Table Card */}
          <div className="kf-table-section">
            <div className="kf-table-header">
              <div>
                <div className="kf-table-title">
                  {optionsSelected ? `Kartela Financiare - ${optionsSelected.label}` : "Kartela Financiare"}
                </div>
                {hasData && <div className="kf-table-subtitle">{tableRows.length} transaksione</div>}
              </div>
            </div>

            {loading && (
              <div className="kf-loading">
                <h5>Duke ngarkuar kartelën...</h5>
                <div className="kf-progress-wrap"><div className="kf-progress-bar" /></div>
              </div>
            )}

            {!loading && !optionsSelected && (
              <div className="kf-empty">
                <Search size={80} />
                <h3>Zgjidh një partner</h3>
                <p>Shkruani emrin e partnerit për të parë kartelën financiare</p>
              </div>
            )}

            {!loading && optionsSelected && tableRows.length === 0 && (
              <div className="kf-empty">
                <Users size={80} />
                <h3>Nuk ka transaksione</h3>
                <p>Ky partner nuk ka asnjë transaksion të regjistruar</p>
              </div>
            )}

            {hasData && (
              <div className="mt-1">
                <Tabela
                  data={tableRows.map(({ _faturim, _pagese, _saldo, ...rest }) => rest)}
                  tableName={`Kartela Financiare - ${optionsSelected?.label}`}
                  dateField="Data"
                  mosShfaqID={true}
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default KartelaFinanciare;
