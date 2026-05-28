import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { Container, Row, Col, Badge } from "react-bootstrap";
import ReactSelect from "react-select";
import { Package, Tag, Search, TrendingUp, Info } from "lucide-react";
import Titulli from "../Components/TeTjera/Titulli";
import NavBar from "../Components/TeTjera/layout/NavBar";
import Mesazhi from "../Components/TeTjera/layout/Mesazhi";
import KontrolloAksesinNeFaqe from "../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";

function ShikimiQmimeve() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [produktiID, setproduktiID] = useState(0);
  const [kartelaEProduktit, setKartelaEProduktit] = useState(null);
  const [options, setOptions] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const selectRef = useRef(null);

  const getToken = localStorage.getItem("token");
  const authentikimi = useMemo(() => ({
    headers: { Authorization: `Bearer ${getToken}` }
  }), [getToken]);

  useEffect(() => {
    let active = true;
    const fetchProduktet = async () => {
      try {
        console.log("Fetching products started...");
        setIsLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`, authentikimi);

        if (!active) return;

        console.log("Products received from server:", res.status);

        // Robust data detection ($values wrapper, nested .data, or direct array)
        let rawData = res.data;
        if (rawData && rawData.$values) rawData = rawData.$values;
        if (rawData && rawData.data && Array.isArray(rawData.data)) rawData = rawData.data;
        if (!Array.isArray(rawData)) {
          console.warn("API did not return an array. Data received:", rawData);
          rawData = [];
        }

        const formatted = rawData.map(item => {
          // Flexible mapping to handle both camelCase and PascalCase
          const id = item.produktiID || item.ProduktiID || 0;
          const barkodi = item.barkodi || item.Barkodi || "Pa barkod";
          const emri = item.emriProduktit || item.EmriProduktit || "Pa emër";

          return {
            value: id,
            label: `${barkodi} - ${emri}`,
            data: item
          };
        });

        console.log(`Successfully formatted ${formatted.length} products.`);
        setOptions(formatted);
      } catch (err) {
        console.error("Fetch products failed in ShikimiQmimeve:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchProduktet();
    return () => { active = false; };
  }, [API_BASE_URL, authentikimi]);

  useEffect(() => {
    if (produktiID) {
      const fetchKartela = async () => {
        try {
          setIsFetchingDetail(true);
          const res = await axios.get(`${API_BASE_URL}/api/Produkti/KartelaArtikullit?id=${produktiID}`, authentikimi);
          setKartelaEProduktit(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsFetchingDetail(false);
        }
      };
      fetchKartela();
    }
  }, [produktiID, API_BASE_URL, authentikimi]);

  const filteredOptions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) return [];

    const lower = inputValue.toLowerCase();
    const results = [];
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      if (option && option.label && option.label.toLowerCase().includes(lower)) {
        results.push(option);
        if (results.length >= 50) break;
      }
    }
    return results;
  }, [inputValue, options]);

  const handleChange = (selected) => {
    setOptionsSelected(selected);
    if (selected) {
      setproduktiID(selected.value);
    } else {
      setproduktiID(0);
      setKartelaEProduktit(null);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      const currentInput = document.getElementById("barkodiSelect-input")?.value || "";
      if (currentInput.trim().length > 0) {
        let lookupBarcode = currentInput.trim();
        if (lookupBarcode.startsWith("2") && lookupBarcode.length === 13) {
          const pluCode = lookupBarcode.substring(0, 7);
          const matched = options.find(opt => opt.label.includes(pluCode));
          if (matched) {
            lookupBarcode = pluCode;
          }
        }

        const matches = options.filter(opt => opt.label.toLowerCase().includes(lookupBarcode.toLowerCase()));
        if (matches.length === 0) {
          setTipiMesazhit("danger");
          setPershkrimiMesazhit(`Produkti me këtë barkod nuk u gjet! (${currentInput})`);
          setShfaqMesazhin(true);
          setInputValue("");
          setTimeout(() => selectRef.current?.focus(), 10);
        } else {
          event.preventDefault();
          handleChange(matches[0]);
        }
      }
    }
  };

  const product = kartelaEProduktit?.produkti;
  const qmimiPakic = parseFloat(product?.qmimiProduktit || 0).toFixed(2);
  const qmimiShitesMeShumic = parseFloat(product?.qmimiMeShumic || 0).toFixed(2);
  const rabati = parseFloat(product?.rabati || 0);
  const qmimiMeZbritje = rabati > 0 ? (qmimiPakic - (qmimiPakic * (rabati / 100))).toFixed(2) : null;

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: '16px',
      padding: '8px 12px',
      border: '1px solid var(--sp-border)',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : 'none',
      background: 'var(--sp-surface)',
      backdropFilter: 'blur(8px)',
      '&:hover': { borderColor: '#4f46e5' }
    }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--sp-text-muted)',
      fontWeight: '500'
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--sp-text)'
    }),
    input: (base) => ({
      ...base,
      color: 'var(--sp-text)'
    }),
    option: (base, { isSelected, isFocused }) => ({
      ...base,
      backgroundColor: isSelected ? '#4f46e5' : isFocused ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
      color: isSelected ? 'white' : 'var(--sp-text)',
      padding: '12px 16px',
      fontWeight: '500',
      cursor: 'pointer'
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
      border: '1px solid var(--sp-border)',
      background: 'var(--sp-surface)'
    })
  };

  return (
    <div className="price-checker-wrapper">
      <KontrolloAksesinNeFaqe roletELejuara={["User"]} />
      {shfaqMesazhin && (
        <Mesazhi
          setShfaqMesazhin={setShfaqMesazhin}
          pershkrimi={pershkrimiMesazhit}
          tipi={tipiMesazhit}
        />
      )}
      <Titulli titulli={"Shikimi i Çmimeve"} />
      <NavBar />

      <Container className="py-5">
        <header className="page-header text-center mb-5" data-aos="fade-down">
          <div className="search-icon-container mb-3">
            <div className="icon-ring"></div>
            <Search size={32} className="header-icon" />
          </div>
          <h1 className="main-title mb-2">Kontrollo Çmimin</h1>
          <p className="subtitle">Mënyra më e shpejtë për të kërkuar çmimet dhe stokun e produkteve tuaja.</p>
        </header>

        <Row className="justify-content-center mb-5">
          <Col lg={7} xl={6}>
            <div className="glass-card shadow-ultra animate-float">
              <div className="p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="badge-dot pulse"></div>
                  <span className="section-tag">Zgjidhni Produktin</span>
                </div>
                <ReactSelect
                  ref={selectRef}
                  value={optionsSelected}
                  onChange={handleChange}
                  onInputChange={(val) => setInputValue(val)}
                  options={filteredOptions}
                  styles={selectStyles}
                  placeholder={isLoading ? "Duke u ngarkuar..." : "Kërko emrin ose barkodin..."}
                  isClearable
                  isLoading={isLoading}
                  inputId="barkodiSelect-input"
                  onKeyDown={handleKeyDown}
                  noOptionsMessage={() =>
                    inputValue.length < 2
                      ? "Shkruani të paktën 2 karaktere..."
                      : "Nuk u gjet asnjë produkt"
                  }
                />
                <div className="mt-3 d-flex align-items-center gap-2 text-muted-premium">
                  <Info size={14} />
                  <span>Shtypni Enter ose zgjidhni nga lista për të parë detajet</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {isFetchingDetail && (
          <div className="loading-state text-center py-5" data-aos="fade">
            <div className="spinner-premium mb-3"></div>
            <p className="text-indigo fw-600">Duke marrë të dhënat e produktit...</p>
          </div>
        )}

        {!isFetchingDetail && product && (
          <Row className="g-4 product-details-view" data-aos="fade-up">
            <Col xl={6}>
              <div className="glass-card h-100 shadow-ultra overflow-hidden">
                <div className="card-accent-line bg-indigo"></div>
                <div className="p-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="icon-box-premium bg-indigo-soft text-indigo">
                        <Package size={24} />
                      </div>
                      <h4 className="section-title mb-0">Informacioni i Produktit</h4>
                    </div>
                  </div>

                  <div className="stok-display-box mb-4">
                    <span className="premium-label">Sasia Aktuale ne Stok</span>
                    <div className="sasia-wrapper">
                      <h2 className={`sasia-value ${product.sasiaNeStok <= 0 ? 'text-danger' : ''}`}>
                        {parseFloat(product.sasiaNeStok || 0).toLocaleString()}
                      </h2>
                      <span className="njesia-tag">{product.emriNjesiaMatese}</span>
                    </div>
                  </div>

                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="premium-label">Sasia e Shumicës</span>
                      <div className="d-flex align-items-center gap-2">
                        <TrendingUp size={16} className="text-emerald" />
                        <span className="detail-value">{product.sasiaShumices || 0}</span>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="premium-label">Barkodi i Produktit</span>
                      <span className="detail-value text-monospace">{product.barkodi}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            <Col xl={6}>
              <div className="glass-card h-100 shadow-ultra overflow-hidden price-focus-card">
                <div className="card-accent-line bg-emerald"></div>
                <div className="p-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-3">
                      <div className="icon-box-premium bg-emerald-soft text-emerald">
                        <Tag size={24} />
                      </div>
                      <h4 className="section-title mb-0">Detajet e Çmimit</h4>
                    </div>
                    {rabati > 0 && (
                      <Badge className="discount-badge">
                        <TrendingUp size={12} className="me-1" />
                        -{rabati}% Zbritje
                      </Badge>
                    )}
                  </div>

                  <div className="price-main-section mb-4 text-center text-xl-start">
                    <span className="premium-label">Çmimi Pakicë me TVSH</span>
                    <div className="price-stack">
                      {rabati > 0 && <span className="old-price-line">{qmimiPakic} €</span>}
                      <h2 className="price-value-primary">
                        {rabati > 0 ? qmimiMeZbritje : qmimiPakic} €
                      </h2>
                    </div>
                  </div>

                  <div className="modern-divider mb-4"></div>

                  <div className="shumica-section">
                    <div className="d-flex align-items-center justify-content-between px-3 py-3 rounded-4 bg-slate-50 border-slate-100 border">
                      <span className="premium-label mb-0">Çmimi i Shumicës</span>
                      <span className="price-value-secondary text-indigo">{qmimiShitesMeShumic} €</span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        )}


      </Container>

      <style>{`
        .price-checker-wrapper {
          background: var(--sp-bg);
          min-height: 100vh;
          font-family: 'Inter', -apple-system, blinkmacsystemfont, 'Segoe UI', roboto, oxygen, ubuntu, cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .main-title {
          font-weight: 900;
          color: var(--sp-text);
          letter-spacing: -0.04em;
          font-size: 3.5rem;
        }

        .subtitle {
          color: var(--sp-text-soft);
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .search-icon-container {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto;
        }

        .icon-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 4px solid #4f46e5;
          border-radius: 50%;
          border-left-color: transparent;
          border-bottom-color: transparent;
          animation: spin 3s linear infinite;
        }

        .header-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #4f46e5;
        }

        .glass-card {
          background: var(--sp-surface);
          backdrop-filter: blur(12px);
          border: 1px solid var(--sp-border);
          border-radius: 28px;
          position: relative;
        }

        .shadow-ultra {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .section-tag {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          color: #6366f1;
          letter-spacing: 0.1em;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6366f1;
        }

        .pulse {
          box-shadow: 0 0 0 rgba(99, 102, 241, 0.4);
          animation: pulse 2s infinite;
        }

        .text-muted-premium {
          color: var(--sp-text-muted);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .card-accent-line {
          height: 6px;
          width: 100%;
        }

        .icon-box-premium {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .section-title {
          color: var(--sp-text);
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        .premium-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--sp-text-muted);
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .sasia-value {
          font-size: 4.5rem;
          font-weight: 900;
          letter-spacing: -0.05em;
          line-height: 1;
          margin-bottom: 0;
          color: var(--sp-text);
        }

        .njesia-tag {
          background: var(--sp-surface-2);
          padding: 4px 12px;
          border-radius: 10px;
          font-weight: 700;
          color: var(--sp-text-soft);
          font-size: 0.9rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .detail-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--sp-text);
        }

        .price-stack {
          display: flex;
          flex-direction: column;
        }

        .price-value-primary {
          font-size: 5.5rem;
          font-weight: 950;
          color: var(--sp-text);
          letter-spacing: -0.06em;
          line-height: 1;
        }

        .old-price-line {
          font-size: 1.75rem;
          color: var(--sp-text-muted);
          text-decoration: line-through;
          font-weight: 600;
          margin-bottom: -0.75rem;
        }

        .price-value-secondary {
          font-size: 2rem;
          font-weight: 800;
        }

        .discount-badge {
          background: #ef4444;
          color: white;
          padding: 8px 16px;
          border-radius: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
        }

        .bg-indigo-soft { background: rgba(79, 70, 229, 0.15); }
        .text-indigo { color: #818cf8; }
        .bg-indigo { background: #4f46e5; }
        
        .bg-emerald-soft { background: rgba(16, 185, 129, 0.15); }
        .text-emerald { color: #34d399; }
        .bg-emerald { background: #10b981; }

        .spinner-premium {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(79, 70, 229, 0.1);
          border-top-color: #4f46e5;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }

        .modern-divider {
          height: 1px;
          background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.1), rgba(255,255,255,0));
        }
        
        .bg-slate-50 {
          background: var(--sp-surface-2) !important;
        }
        
        .border-slate-100 {
          border-color: var(--sp-border) !important;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }

        @media (max-width: 1200px) {
          .price-value-primary { font-size: 4rem; }
          .sasia-value { font-size: 3.5rem; }
        }

        @media (max-width: 768px) {
          .main-title { font-size: 2.5rem; }
          .price-value-primary { font-size: 3.5rem; }
          .detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default ShikimiQmimeve;
