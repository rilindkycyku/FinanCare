import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Select from "react-select";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import { darkSelectStyles } from "@/utils/darkSelectStyles";
import {
  Users,
  CreditCard,
  Wallet,
  Search,
  CheckCircle,
  Plus,
  ArrowLeft
} from "lucide-react";
import "../../Styles/ShtoPagesat.css";

/* ── Helpers ─────────────────────────────────────────────────── */
// These must match KartelaFinanciare.jsx exactly
const DEBIT_TYPES  = ["HYRJE", "FAT", "FATURIM", "AS", "PARAGON", "SALDO", "ONLINE"];
const CREDIT_TYPES = ["FL", "KMSH", "KMB", "PAGES", "PAGESE"];

function fmt(val) {
  const n = parseFloat(val);
  return isNaN(n) ? "0.00" : n.toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildRows(kalkulimet = []) {
  let saldo = 0;
  return kalkulimet.map((p, i) => {
    const vlera = Math.abs(p.totaliPaTVSH + p.tvsh - p.rabati); // no transporti — matches KartelaFinanciare
    let faturim = 0, pagese = 0;
    if (DEBIT_TYPES.includes(p.llojiKalkulimit))       { faturim = vlera; saldo += vlera; }
    else if (CREDIT_TYPES.includes(p.llojiKalkulimit)) { pagese  = vlera; saldo -= vlera; }
    return {
      "NR.":          i + 1,
      "Data":         new Date(p.dataRegjistrimit).toLocaleDateString("sq-AL"),
      "Lloji":        p.llojiKalkulimit,
      "Nr. Faturës":  p.nrFatures,
      "Përshkrimi":   p.pershkrimShtese || "-",
      "Faturim €":    faturim > 0 ? fmt(faturim) : "-",
      "Pagesë €":     pagese  > 0 ? fmt(pagese)  : "-",
      "Saldo €":      fmt(saldo * -1),
      _faturim: faturim,
      _pagese:  pagese,
      _saldo:   saldo * -1,
    };
  });
}


/* ── Component ───────────────────────────────────────────────── */
function ShtoPagesat() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const navigate = useNavigate();

  const getID = localStorage.getItem("id");
  const getToken = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${getToken}` } };

  // State
  const [allPartners, setAllPartners] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [partnerId, setPartnerId] = useState(null);
  const [kartela, setKartela] = useState(null);
  const [tableRows, setTableRows] = useState([]);
  const [loadingKartela, setLoadingKartela] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [nrRendorKalkulimit, setNrRendorKalkulimit] = useState(0);
  const [stafiID, setStafiID] = useState(null);

  // Form state
  const [pershkrimiPageses, setPershkrimiPageses] = useState("");
  const [shumaPageses, setShumaPageses] = useState("");
  const [llojiIPageses, setLlojiIPageses] = useState("Cash");
  const [lloji, setLloji] = useState("PAGES");

  // Redirect if no session
  useEffect(() => {
    if (!getID) { navigate("/login"); return; }
    axios.get(`${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`, auth)
      .then(r => setStafiID(r.data?.perdoruesi?.userID))
      .catch(console.error);
  }, []);

  // Load partners once
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/Partneri/shfaqPartneret`, auth)
      .then(res => setAllPartners(res.data.map(p => ({ value: p.idPartneri, label: p.emriBiznesit }))))
      .catch(console.error);
  }, []);

  // Fetch next invoice number when lloji changes
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/Faturat/getNumriFaturesMeRradhe?llojiKalkulimit=${lloji}`, auth)
      .then(r => setNrRendorKalkulimit(parseInt(r.data)))
      .catch(console.error);
  }, [lloji]);

  // Load kartela when partner changes
  useEffect(() => {
    if (!partnerId) return;
    setLoadingKartela(true);
    axios.get(`${API_BASE_URL}/api/Partneri/KartelaFinanciare?id=${partnerId}`, auth)
      .then(res => {
        setKartela(res.data);
        setTableRows(buildRows(res.data?.kalkulimet));
      })
      .catch(console.error)
      .finally(() => setLoadingKartela(false));
  }, [partnerId]);

  // Filtered options
  const filteredOptions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) return [];
    const lower = inputValue.toLowerCase();
    const out = [];
    for (const o of allPartners) {
      if (o.label.toLowerCase().includes(lower)) { out.push(o); if (out.length >= 50) break; }
    }
    return out;
  }, [inputValue, allPartners]);

  const handlePartnerChange = (selected) => {
    setOptionsSelected(selected);
    setPartnerId(selected?.value ?? null);
    if (!selected) { setKartela(null); setTableRows([]); }
  };

  // Submit payment
  const handleSubmit = async () => {
    if (!partnerId || !shumaPageses || parseFloat(shumaPageses) <= 0) return;
    setSubmitting(true);
    const nrFatures = `${lloji}-${partnerId}-${nrRendorKalkulimit + 1}`;
    try {
      await axios.post(`${API_BASE_URL}/api/Faturat/ruajKalkulimin`, {
        stafiID,
        totaliPaTVSH: parseFloat(shumaPageses),
        idPartneri: partnerId,
        llojiPageses: llojiIPageses,
        pershkrimShtese: pershkrimiPageses,
        llojiKalkulimit: lloji,
        statusiKalkulimit: "true",
        nrFatures,
        nrRendorKalkulimit: nrRendorKalkulimit + 1,
      }, auth);
      // Reset form
      setPershkrimiPageses("");
      setShumaPageses("");
      setLlojiIPageses("Cash");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
      // Refresh kartela + invoice number
      const [kartelaRes, nrRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/Partneri/KartelaFinanciare?id=${partnerId}`, auth),
        axios.get(`${API_BASE_URL}/api/Faturat/getNumriFaturesMeRradhe?llojiKalkulimit=${lloji}`, auth),
      ]);
      setKartela(kartelaRes.data);
      setTableRows(buildRows(kartelaRes.data?.kalkulimet));
      setNrRendorKalkulimit(parseInt(nrRes.data));
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = partnerId && shumaPageses && parseFloat(shumaPageses) > 0 && !submitting;

  // Derived financials
  const totHyrje = parseFloat(kartela?.totaliHyrese || 0);
  const totDalje = parseFloat(kartela?.totaliDalese || 0);
  const saldo = totDalje - totHyrje;

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Financa", "1 Euro Menaxher"]} />
      <NavBar />

      {/* Success toast */}
      {toastVisible && (
        <div className="sp2-success-flash">
          <CheckCircle size={18} />
          Pagesa u regjistrua me sukses!
        </div>
      )}

      <div className="sp2-page">
        <div className="sp2-inner">

          {/* Hero */}
          <div className="sp2-hero">
            <h1>Regjistro Pagesën</h1>
            <p>Menaxho pagesat dhe saldot e partnerëve në kohë reale</p>
          </div>

          {/* Main two-column grid */}
          <div className="sp2-grid">

            {/* LEFT - Partner & financials */}
            <div className="sp2-panel partner">
              <div className="sp2-panel-header">
                <Users size={13} />
                Partneri &amp; Gjendja Financiare
              </div>
              <div className="sp2-panel-body">
                <span className="sp2-label">Zgjidh Partnerin</span>
                <Select
                  value={optionsSelected}
                  onChange={handlePartnerChange}
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
                <div className="sp2-hint">Shkruani të paktën 2 karaktere për të kërkuar</div>

                {/* Summary cards */}
                {kartela && !loadingKartela && (
                  <div className="sp2-summary">
                    <div className="sp2-stat income">
                      <div className="sp2-stat-label">Hyrjet</div>
                      <div className="sp2-stat-value">{fmt(totHyrje)}</div>
                      <div className="sp2-stat-unit">EUR €</div>
                    </div>
                    <div className="sp2-stat expense">
                      <div className="sp2-stat-label">Daljet</div>
                      <div className="sp2-stat-value">{fmt(totDalje)}</div>
                      <div className="sp2-stat-unit">EUR €</div>
                    </div>
                    <div className="sp2-stat balance">
                      <div className="sp2-stat-label">Saldo</div>
                      <div className="sp2-stat-value">{fmt(saldo)}</div>
                      <div className="sp2-stat-unit">EUR €</div>
                    </div>
                  </div>
                )}

                {loadingKartela && (
                  <div className="sp2-loading" style={{ padding: "2rem 0 0" }}>
                    <div className="sp2-progress-wrap"><div className="sp2-progress-bar" /></div>
                  </div>
                )}

                {!optionsSelected && (
                  <div className="sp2-empty" style={{ padding: "2rem 0 0" }}>
                    <Search size={40} />
                    <p>Zgjidh një partner për të parë gjendjen financiare</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT - Payment form */}
            <div className="sp2-panel form">
              <div className="sp2-panel-header">
                <CreditCard size={13} />
                Detajet e Pagesës
              </div>
              <div className="sp2-panel-body">

                {/* Lloji kalkulimit pills */}
                <div className="sp2-form-group">
                  <span className="sp2-label">Lloji i Kalkulimit</span>
                  <div className="sp2-type-pills">
                    {[
                      { val: "PAGES", label: "Pagesë" },
                      { val: "FATURIM", label: "Faturim" },
                    ].map(opt => (
                      <button
                        key={opt.val}
                        className={`sp2-pill ${lloji === opt.val ? "active" : ""}`}
                        onClick={() => setLloji(opt.val)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lloji pageses pills */}
                <div className="sp2-form-group">
                  <span className="sp2-label">Lloji i Pagesës</span>
                  <div className="sp2-type-pills">
                    {["Cash", "Banke"].map(opt => (
                      <button
                        key={opt}
                        className={`sp2-pill ${llojiIPageses === opt ? "active" : ""}`}
                        onClick={() => setLlojiIPageses(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shuma */}
                <div className="sp2-form-group">
                  <span className="sp2-label">Shuma e Pagesës</span>
                  <div className="sp2-amount-wrap">
                    <span className="sp2-amount-prefix">€</span>
                    <input
                      id="shumaPageses"
                      type="number"
                      className="sp2-input"
                      placeholder="0.00"
                      value={shumaPageses}
                      onChange={e => setShumaPageses(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && canSubmit && handleSubmit()}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Përshkrimi */}
                <div className="sp2-form-group">
                  <span className="sp2-label">Përshkrimi (opsional)</span>
                  <input
                    id="pershkrimiPageses"
                    type="text"
                    className="sp2-input"
                    placeholder="p.sh. Pagesë faturë F1234..."
                    value={pershkrimiPageses}
                    onChange={e => setPershkrimiPageses(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && canSubmit && handleSubmit()}
                  />
                </div>

                {/* Receipt preview */}
                {shumaPageses && parseFloat(shumaPageses) > 0 && (
                  <div className="sp2-receipt">
                    <div className="sp2-receipt-row">
                      <span className="sp2-receipt-key">Partneri</span>
                      <span className="sp2-receipt-val">{optionsSelected?.label || "-"}</span>
                    </div>
                    <div className="sp2-receipt-row">
                      <span className="sp2-receipt-key">Lloji</span>
                      <span className="sp2-receipt-val">{lloji} / {llojiIPageses}</span>
                    </div>
                    <div className="sp2-receipt-row">
                      <span className="sp2-receipt-key">Nr. Faturës</span>
                      <span className="sp2-receipt-val">{lloji}-{partnerId || "?"}-{nrRendorKalkulimit + 1}</span>
                    </div>
                    {pershkrimiPageses && (
                      <div className="sp2-receipt-row">
                        <span className="sp2-receipt-key">Përshkrimi</span>
                        <span className="sp2-receipt-val">{pershkrimiPageses}</span>
                      </div>
                    )}
                    <div className="sp2-receipt-row">
                      <span className="sp2-receipt-key">Shuma</span>
                      <span className="sp2-receipt-val highlight">{fmt(shumaPageses)} €</span>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  className="sp2-btn-submit"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                >
                  {submitting
                    ? <><span className="sp2-btn-spinner" /> Duke regjistruar...</>
                    : <><Plus size={17} /> Regjistro Pagesën</>
                  }
                </button>

                {/* Back link */}
                <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
                  <Link
                    to="/TabelaEPartnereve"
                    style={{ fontSize: "0.78rem", color: "var(--sp2-text-muted)", display: "inline-flex", alignItems: "center", gap: "0.35rem", textDecoration: "none" }}
                  >
                    <ArrowLeft size={13} /> Kthehu te lista e partnerëve
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction history table */}
          <div className="sp2-table-section">
            <div className="sp2-table-header">
              <div>
                <div className="sp2-table-title">
                  {optionsSelected ? `Historiku - ${optionsSelected.label}` : "Historiku i Transaksioneve"}
                </div>
                {tableRows.length > 0 && (
                  <div className="sp2-table-sub">{tableRows.length} transaksione</div>
                )}
              </div>
            </div>

            {!optionsSelected && (
              <div className="sp2-empty">
                <Search size={60} />
                <h3>Nuk është zgjedhur partneri</h3>
                <p>Zgjidh një partner nga paneli i majtë për të parë historikun</p>
              </div>
            )}

            {optionsSelected && loadingKartela && (
              <div className="sp2-loading">
                <div className="sp2-progress-wrap"><div className="sp2-progress-bar" /></div>
              </div>
            )}

            {optionsSelected && !loadingKartela && tableRows.length === 0 && (
              <div className="sp2-empty">
                <Wallet size={60} />
                <h3>Nuk ka transaksione</h3>
                <p>Ky partner nuk ka asnjë transaksion të regjistruar</p>
              </div>
            )}

            {!loadingKartela && tableRows.length > 0 && (
              <div className="mt-1">
                <Tabela
                  data={tableRows.map(({ _faturim, _pagese, _saldo, ...rest }) => rest)}
                  tableName={`Kartela - ${optionsSelected?.label}`}
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

export default ShtoPagesat;
