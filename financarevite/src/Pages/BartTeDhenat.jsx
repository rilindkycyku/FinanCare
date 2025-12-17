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
          await addLog(`✅ ${name} transfer completed. Total: ${res.data.total ?? "-"} items.`, 500);
          setData({ ...results }); // update cards dynamically
        } catch (err) {
          await addLog(`❌ Error transferring ${name}: ${err.message}`, 500);
        }
      }

      await addLog("All transfers finished.", 500);
      setLoading(false);
    };

    fetchData();
  }, [API_BASE_URL]);

  const renderCard = (title, info) => (
    <Card className="mb-3 shadow-sm text-center">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>
          {info?.total ?? "-"} items
          <br />
          File: {info?.file ?? "-"}
          <br />
          Generated at: {info?.generatedAt ? new Date(info.generatedAt).toLocaleString() : "-"}
        </Card.Text>
      </Card.Body>
    </Card>
  );

  return (
    <>
      <Titulli titulli={"Bart të Dhënat"} />
      <NavBar />

      <Container className="py-4">
        <h2 className="mb-4 text-center">Dashboard: Bart të Dhënat</h2>

        {/* CONSOLE PANEL ON TOP */}
        <div
          ref={logRef}
          style={{
            background: "#000",
            color: "#0f0",
            fontFamily: "monospace",
            height: "250px",
            overflowY: "auto",
            padding: "1rem",
            borderRadius: "5px",
            border: "1px solid #333",
            marginBottom: "2rem",
          }}
        >
          {logs.map((log, idx) => (
            <div key={idx}>{log}</div>
          ))}
          {loading && <div>...</div>}
        </div>

        {/* CARDS */}
        <Row>
          <Col md={3}>{renderCard("Products", data.products)}</Col>
          <Col md={3}>{renderCard("Users", data.users)}</Col>
          <Col md={3}>{renderCard("Categories", data.categories)}</Col>
          <Col md={3}>{renderCard("Business", data.business)}</Col>
        </Row>
      </Container>
    </>
  );
};

export default BartTeDhenat;
