import { useEffect, useState } from "react";
import "../../Styles/LogIn.css";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Shield, Key, ArrowLeft, CheckCircle2,
  AlertTriangle, Calendar, Building, RefreshCw, Clock
} from "lucide-react";
import Titulli from "../../../Components/TeTjera/Titulli";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import { useTheme } from "../../../Context/ThemeContext";

const AktivizoSistemin = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const navigate = useNavigate();
  const { isLight } = useTheme();

  // Status State
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({
    isLicensed: false,
    message: "",
    expiryDate: null,
    daysRemaining: null,
    biznesi: ""
  });

  // Form State
  const [username, setUsername]       = useState("");
  const [licenseKey, setLicenseKey]   = useState("");
  const [shfaqFormen, setShfaqFormen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake]             = useState(false);

  // Inline feedback
  const [usernameError, setUsernameError]   = useState("");
  const [licenseError, setLicenseError]     = useState("");
  const [successMsg, setSuccessMsg]         = useState("");
  const [errorMsg, setErrorMsg]             = useState("");

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/Licenca/status`);
      if (response.status === 200) {
        setStatus(response.data);
        localStorage.setItem("isLicensed", response.data.isLicensed ? "true" : "false");
        if (!response.data.isLicensed) setShfaqFormen(true);
      }
    } catch (error) {
      setStatus({
        isLicensed: false,
        message: "Nuk u arrit të lexohet statusi i licencës nga serveri.",
        expiryDate: null,
        daysRemaining: null,
        biznesi: ""
      });
      localStorage.setItem("isLicensed", "false");
      setShfaqFormen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleActivation = async (e) => {
    if (e) e.preventDefault();
    setUsernameError(""); setLicenseError(""); setErrorMsg(""); setSuccessMsg("");

    let hasError = false;
    if (!username.trim()) { setUsernameError("Emri i biznesit nuk mund të jetë bosh."); hasError = true; }
    if (!licenseKey.trim()) { setLicenseError("Kodi i licencës nuk mund të jetë bosh."); hasError = true; }
    if (hasError) { triggerShake(); return; }

    try {
      setIsSubmitting(true);
      const response = await axios.post(`${API_BASE_URL}/api/Licenca/aktivizo`, { username, licenseKey });

      if (response.status === 200) {
        setSuccessMsg(`Sistemi u aktivizua me sukses për ${response.data.biznesi} deri më ${response.data.expiryDate}.`);
        setUsername("");
        setLicenseKey("");
        setShfaqFormen(false);
        fetchStatus();
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Ndodhi një gabim gjatë aktivizimit. Provoni përsëri.";
      setErrorMsg(msg);
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Badge color helper
  const getDaysBadgeClass = (days) => {
    if (days === null) return "";
    if (days < 0)  return "expired";
    if (days <= 15) return "warning";
    return "active";
  };

  return (
    <div className="auth-wrapper">
      <Titulli titulli={"Aktivizimi i Sistemit"} />

      {/* 🔒 Only Menaxher and 1 Euro Menaxher can access this page */}
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "1 Euro Menaxher"]} />

      <div className={`auth-card ${shake ? "shake" : ""}`} style={{ maxWidth: '540px' }}>

        {/* Logo */}
        <div className="auth-logo-container" style={{ marginBottom: '1.5rem' }}>
          <img 
            src={isLight ? "/img/web/LogoBlack.svg" : "/img/web/LogoWhite.svg"} 
            alt="FinanCare Logo" 
            className="auth-logo" 
          />
        </div>

        {/* Header */}
        <div className="auth-header" style={{ marginBottom: '1.25rem' }}>
          <h1 className="auth-title">Licencimi i Sistemit</h1>
          <p className="auth-subtitle">Menaxhoni licencën tuaj FinanCare në mënyrë të sigurt.</p>
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
            <div style={{
              width: 40, height: 40,
              border: '3px solid rgba(99,102,241,0.15)',
              borderTopColor: '#6366f1',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Duke verifikuar statusin e licencës...</p>
          </div>
        ) : (
          <>
            {/* ── Success banner ── */}
            {successMsg && (
              <div style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.22)',
                borderRadius: '14px',
                padding: '0.9rem 1.1rem',
                marginBottom: '1.25rem',
                display: 'flex', alignItems: 'flex-start', gap: '0.65rem'
              }}>
                <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: '#34d399', fontSize: '0.88rem', fontWeight: 600 }}>{successMsg}</span>
              </div>
            )}

            {/* ── Error banner ── */}
            {errorMsg && (
              <div style={{
                background: 'rgba(244,63,94,0.08)',
                border: '1px solid rgba(244,63,94,0.22)',
                borderRadius: '14px',
                padding: '0.9rem 1.1rem',
                marginBottom: '1.25rem',
                display: 'flex', alignItems: 'flex-start', gap: '0.65rem'
              }}>
                <AlertTriangle size={18} color="#fb7185" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: '#fb7185', fontSize: '0.88rem', fontWeight: 600 }}>{errorMsg}</span>
              </div>
            )}

            {/* ── Status Card ── */}
            <div className={`license-status-card ${status.isLicensed ? 'licensed' : 'unlicensed'}`}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                {status.isLicensed
                  ? <CheckCircle2 size={36} color="#34d399" />
                  : <AlertTriangle size={36} color="#fb7185" />
                }
                <h4 style={{
                  margin: 0,
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: status.isLicensed ? '#34d399' : '#fb7185'
                }}>
                  {status.isLicensed ? "Sistemi i Licencuar ✓" : "Licencë e Pavlefshme"}
                </h4>
              </div>

              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                {status.message}
              </p>

              {status.isLicensed && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                  <span className="license-badge active">
                    <Building size={13} />
                    {status.biznesi}
                  </span>
                  <span className="license-badge active">
                    <Calendar size={13} />
                    {status.expiryDate}
                  </span>
                  {status.daysRemaining !== null && (
                    <span className={`license-badge ${getDaysBadgeClass(status.daysRemaining)}`}>
                      <Clock size={13} />
                      {status.daysRemaining > 0
                        ? `${status.daysRemaining} ditë mbetur`
                        : "Skaduar"
                      }
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ── Activation Form ── */}
            {shfaqFormen ? (
              <>
                {/* Divider */}
                <div className="auth-divider">Aktivizimi i Licencës së Re</div>

                <form onSubmit={handleActivation} noValidate>
                  {/* Username */}
                  <div className="auth-input-group">
                    <label className="auth-label">Emri i Biznesit (Username)</label>
                    <div className="auth-input-wrapper">
                      <Building className="auth-icon-left" size={18} />
                      <input
                        type="text"
                        className={`auth-input${usernameError ? " error" : ""}`}
                        placeholder="p.sh. Biznesi SH.P.K."
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setUsernameError(""); }}
                        disabled={isSubmitting}
                      />
                    </div>
                    {usernameError && <p className="auth-input-error">⚠ {usernameError}</p>}
                  </div>

                  {/* License Key */}
                  <div className="auth-input-group">
                    <label className="auth-label">Kodi i Licencës (Base64)</label>
                    <div className="auth-input-wrapper">
                      <Key className="auth-icon-left" size={18} style={{ top: '1.1rem', alignSelf: 'flex-start' }} />
                      <textarea
                        className={`auth-input${licenseError ? " error" : ""}`}
                        placeholder="Shënoni kodin e gjatë të licencës këtu..."
                        style={{
                          height: '100px',
                          resize: 'none',
                          paddingLeft: '2.75rem',
                          paddingTop: '0.85rem',
                          fontFamily: 'monospace',
                          fontSize: '0.82rem',
                          letterSpacing: '0.02em'
                        }}
                        value={licenseKey}
                        onChange={(e) => { setLicenseKey(e.target.value); setLicenseError(""); }}
                        disabled={isSubmitting}
                      />
                    </div>
                    {licenseError && <p className="auth-input-error">⚠ {licenseError}</p>}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="auth-submit-btn d-flex align-items-center justify-content-center gap-2"
                    disabled={isSubmitting}
                    style={{ marginBottom: '0.75rem' }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="auth-btn-spinner" />
                        <span>Duke u aktivizuar...</span>
                      </>
                    ) : (
                      <>
                        <Shield size={20} />
                        <span>Aktivizo Sistemin</span>
                      </>
                    )}
                  </button>

                  {/* Cancel (only when already licensed) */}
                  {status.isLicensed && (
                    <button
                      type="button"
                      onClick={() => { setShfaqFormen(false); setErrorMsg(""); }}
                      style={{
                        width: '100%',
                        padding: '0.8rem',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.04)',
                        color: '#64748b',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: 'Outfit, sans-serif'
                      }}
                    >
                      Anulo
                    </button>
                  )}
                </form>
              </>
            ) : (
              /* Renew button */
              <button
                type="button"
                className="auth-submit-btn d-flex align-items-center justify-content-center gap-2"
                onClick={() => setShfaqFormen(true)}
                style={{ marginTop: '0.5rem' }}
              >
                <RefreshCw size={18} />
                <span>Rinovoni Licencën</span>
              </button>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '1rem',
          marginTop: '1.5rem'
        }}>
          <Link to="/LogIn" className="auth-link d-flex align-items-center gap-1" style={{ fontSize: '0.88rem' }}>
            <ArrowLeft size={15} />
            <span>Kthehu</span>
          </Link>
          <span style={{ fontSize: '0.78rem', color: 'var(--sp-text-muted)' }}>
            &copy; 2023 - {new Date().getFullYear()} FinanCare - POS, eOrder &amp; More by{" "}
            <a
              href="https://rilindkycyku.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--sp-emerald)', textDecoration: 'none', fontWeight: 600 }}
            >
              Rilind Kyçyku
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AktivizoSistemin;
