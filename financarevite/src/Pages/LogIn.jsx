import "./Styles/LogIn.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { Mail, Lock, LogIn as LoginIcon } from "lucide-react";
import Mesazhi from "../Components/TeTjera/layout/Mesazhi";
import Titulli from "../Components/TeTjera/Titulli";

const LogIn = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");

  const getToken = localStorage.getItem("token");

  useEffect(() => {
    if (getToken) {
      navigate("/");
    }
  }, [getToken, navigate]);

  async function handleLogIn(e) {
    if (e) e.preventDefault();

    if (!email || !password) {
      setPershkrimiMesazhit("Ju lutem plotësoni të gjitha fushat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
      return;
    }

    try {
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
      setPershkrimiMesazhit("<strong>Të dhënat janë gabim!</strong> Provoni përsëri.");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
      console.error(error.response?.data?.message || error.message);

    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogIn();
    }
  };

  return (
    <div className="auth-wrapper">
      <Titulli titulli={"Login"} />

      {shfaqMesazhin && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: '90%', maxWidth: '400px' }}>
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        </div>
      )}

      <div className="auth-card">
        <div className="auth-logo-container">
          <img
            src="/img/web/Logo.png"
            alt="FinanCare Logo"
            className="auth-logo"
          />
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Mirësevini!</h1>
          <p className="auth-subtitle">Ju lutem shënoni të dhënat tuaja për t'u kyçur.</p>
        </div>

        <form onSubmit={handleLogIn}>
          <div className="auth-input-group">
            <label className="auth-label">E-mail Adresa</label>
            <div className="auth-input-wrapper">
              <Mail className="auth-icon-left" size={18} />
              <input
                type="email"
                className="auth-input"
                placeholder="emri@shembull.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Fjalëkalimi</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-icon-left" size={18} />
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn d-flex align-items-center justify-content-center gap-2">
            <LoginIcon size={20} />
            <span>Kyçu në Sistem</span>
          </button>
        </form>


      </div>
    </div>
  );
};

export default LogIn;
