import { useEffect, useState, useRef } from "react";
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

  const logRef = useRef(null);

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
          await addLog(`âœ… ${name} transfer completed. Total: ${res.data.total ?? "-"} items.`, 500);
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

  const renderCard = (title, info) => (
    <Card className="sp-card mb-3 text-center h-100 border-0">
      <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
        <Card.Title className="text-emerald fw-bold mb-3">{title}</Card.Title>
        <Card.Text className="text-soft small">
          <span className="h4 d-block text-white fw-900 mb-2">{info?.total ?? "0"}</span>
          <span className="opacity-75">Items Transferred</span>
        </Card.Text>
        <hr className="w-50 opacity-10 my-3" />
        <div className="text-muted extra-small">
          {info?.generatedAt ? new Date(info.generatedAt).toLocaleDateString() : "-"}
        </div>
      </Card.Body>
    </Card>
  );

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
          <Col md={3}>{renderCard("Produktet", data.products)}</Col>
          <Col md={3}>{renderCard("Përdoruesit", data.users)}</Col>
          <Col md={3}>{renderCard("Kategoritë", data.categories)}</Col>
          <Col md={3}>{renderCard("Biznesi", data.business)}</Col>
        </Row>
      </div>
    </>
  );
};

export default BartTeDhenat;
