import { useMemo, useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import NavBar from "../layout/NavBar";
import Titulli from "../Titulli";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

function NukKeniAkses() {
  const navigate = useNavigate();

  return (
    <div className="ep-wrapper">
      <Titulli titulli={"Nuk Keni Akses | 403"} />
      <NavBar />

      <Container className="ep-container">
        <div className="ep-card" data-aos="zoom-in">

          {/* Animated glowing orb behind icon */}
          <div className="ep-orb ep-orb--red" />

          {/* Icon */}
          <div className="ep-icon-ring ep-icon-ring--red">
            <ShieldAlert size={52} strokeWidth={1.5} />
          </div>

          {/* Error code */}
          <h1 className="ep-code ep-code--red">403</h1>
          <h2 className="ep-title">Qasja e Ndaluar</h2>
          <p className="ep-message">
            Më vjen keq, por ju nuk keni autorizimin e duhur për të parë këtë faqe.
            Kontaktoni administratorin nëse mendoni se ky është një gabim.
          </p>

          {/* Divider */}
          <div className="ep-divider" />

          {/* Buttons */}
          <div className="ep-actions">
            <button className="ep-btn ep-btn--ghost" onClick={() => navigate(-1)}>
              <ArrowLeft size={17} /> Mbrapa
            </button>
            <button className="ep-btn ep-btn--danger" onClick={() => navigate("/")}>
              <Home size={17} /> Ballina
            </button>
          </div>

          {/* Logo */}
          <div className="ep-logo">
            <img src="/img/web/Logo.svg" alt="FinanCare" height="28" />
          </div>

        </div>
      </Container>

      <style>{`
        .ep-wrapper {
          background: #0d0f14;
          min-height: 100vh;
        }
        .ep-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 82vh;
          padding: 2rem 1rem;
        }
        .ep-card {
          position: relative;
          overflow: hidden;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 3.5rem 3rem 2.5rem;
          max-width: 520px;
          width: 100%;
          text-align: center;
          box-shadow: 0 32px 64px rgba(0,0,0,0.4);
        }
        /* Glowing orb */
        .ep-orb {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.12;
          top: -80px;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        }
        .ep-orb--red   { background: #ef4444; }
        .ep-orb--blue  { background: #6366f1; }

        /* Icon ring */
        .ep-icon-ring {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.6rem;
          position: relative;
          z-index: 1;
        }
        .ep-icon-ring--red {
          background: rgba(239,68,68,0.12);
          color: #f87171;
          box-shadow: 0 0 0 1px rgba(239,68,68,0.25), 0 0 32px rgba(239,68,68,0.15);
        }
        .ep-icon-ring--blue {
          background: rgba(99,102,241,0.12);
          color: #818cf8;
          box-shadow: 0 0 0 1px rgba(99,102,241,0.25), 0 0 32px rgba(99,102,241,0.15);
        }

        /* Code */
        .ep-code {
          font-size: 5.5rem;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -4px;
          margin-bottom: 0.4rem;
          position: relative;
          z-index: 1;
        }
        .ep-code--red {
          background: linear-gradient(135deg, #f87171 0%, #fb923c 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .ep-code--blue {
          background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ep-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 0.75rem;
          letter-spacing: -0.3px;
        }
        .ep-message {
          color: #64748b;
          font-size: 0.95rem;
          line-height: 1.65;
          max-width: 380px;
          margin: 0 auto;
        }
        .ep-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 2rem 0 1.75rem;
        }

        /* Buttons */
        .ep-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .ep-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 22px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        .ep-btn--ghost {
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .ep-btn--ghost:hover {
          background: rgba(255,255,255,0.09);
          color: #e2e8f0;
          transform: translateY(-1px);
        }
        .ep-btn--danger {
          background: linear-gradient(135deg, #ef4444, #f97316);
          color: #fff;
          box-shadow: 0 4px 14px rgba(239,68,68,0.35);
        }
        .ep-btn--danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239,68,68,0.45);
        }

        /* Logo */
        .ep-logo {
          margin-top: 2rem;
          opacity: 0.35;
          transition: opacity 0.2s;
        }
        .ep-logo:hover { opacity: 0.6; }
      `}</style>
    </div>
  );
}

export default NukKeniAkses;
