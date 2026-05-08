import { useEffect, useMemo, useState } from "react";
﻿import { Col, Image, Row, Container, Button } from "react-bootstrap";
import NavBar from "../layout/NavBar";
import Titulli from "../Titulli";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

function NukKeniAkses() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "";
  const navigate = useNavigate();
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState(null);

  const token = localStorage.getItem("token");
  const authentikimi = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  useEffect(() => {
    const fetchBiznesi = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`, authentikimi);
        setTeDhenatBiznesit(res.data);
      } catch (err) { console.error(err); }
    };
    if (token) fetchBiznesi();
  }, [token, API_BASE_URL, authentikimi]);

  return (
    <div className="error-page-wrapper">
      <Titulli titulli={"Nuk Keni Akses | 403"} />
      <NavBar />

      <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="error-card text-center" data-aos="zoom-in">
          <div className="error-icon-wrapper">
            <ShieldAlert size={64} strokeWidth={1.5} />
          </div>

          <h1 className="error-code">403</h1>
          <h2 className="error-title">Qasja e Ndaluar</h2>
          <p className="error-message">
            Më vjen keq, por ju nuk keni autorizimin e duhur për të parë këtë faqe.
            Ju lutem kontaktoni administratorin nëse mendoni se ky është një gabim.
          </p>

          <div className="d-flex gap-3 justify-content-center mt-4">
            <Button
              variant="outline-primary"
              className="btn-premium-outline"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} className="me-2" /> Mbrapa
            </Button>
            <Button
              variant="primary"
              className="btn-premium-shto"
              onClick={() => navigate("/")}
            >
              <Home size={18} className="me-2" /> Ballina
            </Button>
          </div>

          {teDhenatBiznesit?.logo && (
            <div className="mt-5 opacity-50">
              <Image
                src={`${BASE_URL}/img/web/${teDhenatBiznesit.logo}`}
                height="30"
                alt="Business Logo"
              />
            </div>
          )}
        </div>
      </Container>

      <style>{`
        .error-page-wrapper {
          background: #f8fafc;
          min-height: 100vh;
        }
        .error-card {
          background: white;
          padding: 4rem 3rem;
          border-radius: 32px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          width: 100%;
        }
        .error-icon-wrapper {
          width: 100px;
          height: 100px;
          background: #fef2f2;
          color: #ef4444;
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          box-shadow: 0 8px 16px rgba(239, 68, 68, 0.1);
        }
        .error-code {
          font-size: 5rem;
          font-weight: 900;
          line-height: 1;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
          letter-spacing: -0.05em;
        }
        .error-title {
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        .error-message {
          color: #64748b;
          font-size: 1.1rem;
          line-height: 1.6;
          max-width: 400px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}

export default NukKeniAkses;
