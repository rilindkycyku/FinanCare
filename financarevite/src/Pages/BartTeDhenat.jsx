import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";
import Titulli from "../Components/TeTjera/Titulli";
import NavBar from "../Components/TeTjera/layout/NavBar";

const BartTeDhenat = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [logs, setLogs] = useState([]);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const logRef = useRef(null);

  const handleDownload = (filename, payload) => {
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const addLog = (msg, delay = 300) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
        // Scroll to bottom
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
        resolve();
      }, delay);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLogs([]);
      const results = {};

      const endpoints = [
        { key: "products", name: "Products", route: "BartTeDhenatEProdukteve" },
        { key: "users", name: "Users", route: "BartTeDhenatEPerdorueseve" },
        { key: "categories", name: "Categories", route: "BartTeDhenatEKategorive" },
        { key: "business", name: "Business", route: "BartTeDhenatEBiznesit" },
      ];

      for (let i = 0; i < endpoints.length; i++) {
        const { key, name, route } = endpoints[i];
        await addLog(`Starting transfer for ${name}...`, 500);
        try {
          const res = await axios.post(`${API_BASE_URL}/api/ExportoTeDhenatTekKlienti/${route}`, {}, auth);
          results[key] = res.data;
          await addLog(`✓ ${name} transfer completed. Total: ${res.data.total ?? "-"} items.`, 500);
          setData({ ...results }); // update cards dynamically
        } catch (err) {
          await addLog(`âŒ Error transferring ${name}: ${err.message}`, 500);
        }
      }

      await addLog("All transfers finished.", 500);
      setLoading(false);
    };

    fetchData();
  }, [API_BASE_URL]);

  const renderCard = (title, info, filename) => {
    const hasData = !!info?.data;

    return (
      <Card className="sp-card mb-3 text-center h-100 border-0" style={{ transition: "all 0.3s ease" }}>
        <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
          <Card.Title className="text-emerald fw-bold mb-3">{title}</Card.Title>
          <Card.Text className="text-soft small">
            <span className="h4 d-block text-white fw-900 mb-2">
              {filename === "business.json" && info?.success ? "1" : (info?.total ?? "0")}
            </span>
            <span className="opacity-75">
              {filename === "business.json" ? "Biznes i sinkronizuar" : "Items Transferred"}
            </span>
          </Card.Text>
          <hr className="w-50 opacity-10 my-3" />
          <div className="text-muted extra-small mb-3">
            {info?.generatedAt ? new Date(info.generatedAt).toLocaleDateString() : "-"}
          </div>
          <button
            onClick={() => handleDownload(filename, info?.data)}
            disabled={!hasData}
            onMouseEnter={() => hasData && setHoveredBtn(filename)}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: "600",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              background: hasData 
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                : "rgba(255,255,255,0.05)",
              color: hasData ? "#fff" : "rgba(255,255,255,0.3)",
              border: hasData ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.05)",
              boxShadow: hoveredBtn === filename && hasData 
                ? "0 8px 20px rgba(16,185,129,0.4)" 
                : hasData 
                ? "0 4px 10px rgba(16,185,129,0.15)" 
                : "none",
              transform: hoveredBtn === filename && hasData ? "scale(1.03) translateY(-1px)" : "scale(1)",
              cursor: hasData ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%"
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-download"
              viewBox="0 0 16 16"
            >
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
            </svg>
            {hasData ? "Shkarko JSON" : "S'ka të dhëna"}
          </button>
        </Card.Body>
      </Card>
    );
  };

  return (
    <>
      <Titulli titulli={"Bart të Dhënat"} />
      <NavBar />

      <div className="containerDashboardP py-5">
        <div className="text-center mb-5">
          <h1 className="display-6 fw-900 text-white mb-2">Sinkronizimi i të Dhënave</h1>
          <p className="text-soft opacity-75">Monitoroni dhe barti të dhënat drejt klientit në kohë reale</p>
        </div>

        {/* CONSOLE PANEL */}
        <div className="sp-card p-4 mb-5 border-emerald-glow">
          <div className="d-flex align-items-center mb-3">
            <div className="pulse-emerald me-2"></div>
            <h6 className="text-emerald fw-800 uppercase letter-spacing-1 mb-0">Live Transfer Logs</h6>
          </div>
          <div
            ref={logRef}
            style={{
              background: "rgba(0,0,0,0.3)",
              color: "#10b981",
              fontFamily: "'JetBrains Mono', monospace",
              height: "280px",
              overflowY: "auto",
              padding: "1.25rem",
              borderRadius: "12px",
              border: "1px solid rgba(16,185,129,0.1)",
              fontSize: "0.85rem",
              lineHeight: "1.6"
            }}
          >
            {logs.map((log, idx) => (
              <div key={idx} className="mb-1">
                <span className="opacity-50 me-2">{log.slice(0, 10)}</span>
                <span>{log.slice(10)}</span>
              </div>
            ))}
            {loading && <div className="text-white opacity-50 animate-pulse mt-2">Sinkronizimi në proces...</div>}
          </div>
        </div>

        {/* CARDS */}
        <Row className="g-4">
          <Col md={3}>{renderCard("Produktet", data.products, "products.json")}</Col>
          <Col md={3}>{renderCard("Përdoruesit", data.users, "users.json")}</Col>
          <Col md={3}>{renderCard("Kategoritë", data.categories, "categories.json")}</Col>
          <Col md={3}>{renderCard("Biznesi", data.business, "business.json")}</Col>
        </Row>
      </div>
    </>
  );
};

export default BartTeDhenat;
