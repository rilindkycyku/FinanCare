import { useEffect, useState } from "react";
import "./Styles/LogIn.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { Mail, Lock, LogIn as LoginIcon, Eye, EyeOff } from "lucide-react";
import Titulli from "../Components/TeTjera/Titulli";

const LogIn = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const navigate = useNavigate();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake]         = useState(false);

  const [emailError, setEmailError]       = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [globalError, setGlobalError]     = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const clearErrors = () => {
    setEmailError("");
    setPasswordError("");
    setGlobalError("");
  };

  async function handleLogIn(e) {
    if (e) e.preventDefault();
    clearErrors();

    let hasError = false;
    if (!email) {
      setEmailError("E-mail adresa nuk mund të jetë bosh.");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Fjalëkalimi nuk mund të jetë bosh.");
      hasError = true;
    }
    if (hasError) {
      triggerShake();
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/api/Authenticate/login`,
        { email, password }
      );

      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem("token", token);
        const decodedToken = jwt_decode(token);
        localStorage.setItem("id", decodedToken.Id);
        navigate("/");
      }
    } catch (error) {
      const errors = error.response?.data?.errors;
      const msg = (errors && errors.length > 0)
        ? errors[0]
        : "Të dhënat janë gabim. Provoni përsëri.";

      setGlobalError(msg);
      setPasswordError(" ");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <Titulli titulli={"Login"} />

      <div className={`auth-card ${shake ? "shake" : ""}`}>
        {/* Logo */}
        <div className="auth-logo-container">
          <img src="/img/web/Logo.svg" alt="FinanCare Logo" className="auth-logo" />
        </div>

        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">Mirësevini!</h1>
          <p className="auth-subtitle">Shënoni të dhënat tuaja për t'u kyçur.</p>
        </div>

        {/* Global error */}
        {globalError && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            color: '#fb7185',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1rem' }}>⚠</span>
            {globalError}
          </div>
        )}

        <form onSubmit={handleLogIn} noValidate>
          {/* Email */}
          <div className="auth-input-group">
            <label className="auth-label">E-mail Adresa</label>
            <div className="auth-input-wrapper">
              <Mail className="auth-icon-left" size={18} />
              <input
                id="login-email"
                type="email"
                className={`auth-input${emailError ? " error" : ""}`}
                placeholder="emri@shembull.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            {emailError && <p className="auth-input-error">⚠ {emailError}</p>}
          </div>

          {/* Password */}
          <div className="auth-input-group">
            <label className="auth-label">Fjalëkalimi</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-icon-left" size={18} />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className={`auth-input has-right-icon${passwordError ? " error" : ""}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(""); setGlobalError(""); }}
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="auth-icon-right"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? "Fshih fjalëkalimin" : "Shfaq fjalëkalimin"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {passwordError && passwordError.trim() && (
              <p className="auth-input-error">⚠ {passwordError}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="login-submit"
            className="auth-submit-btn d-flex align-items-center justify-content-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="auth-btn-spinner" />
                <span>Duke u kyçur...</span>
              </>
            ) : (
              <>
                <LoginIcon size={20} />
                <span>Kyçu në Sistem</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer mt-4 text-center">
          <span style={{ fontSize: '0.78rem', color: '#334155' }}>© FinanCare. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
