import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { Modal, Button } from "react-bootstrap";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Package,
  Truck,
  CheckCircle,
  XCircle
} from "lucide-react";
import Titulli from "../../../Components/TeTjera/Titulli";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import "../../../Pages/Styles/SugjerimiPorosise.css";

/* â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function LevelBadge({ level }) {
  const icons = {
    CRITICAL: <AlertTriangle size={10} />,
    HIGH: <AlertTriangle size={10} />,
    MEDIUM: <Package size={10} />,
    LOW: <CheckCircle size={10} />,
    OK: <CheckCircle size={10} />,
  };
  const labels = {
    CRITICAL: "KRITIKE",
    HIGH: "E LARTÇ‹",
    MEDIUM: "MESME",
    LOW: "E ULÇ‹T",
    OK: "OK",
  };
  return (
    <span className={`sp-level sp-level-${level || "OK"}`}>
      {icons[level] || null}
      {labels[level] || level || "â€”"}
    </span>
  );
}

function TrendBadge({ trending }) {
  if (trending === true)
    return <span className="sp-trend up"><TrendingUp size={13} /> Në rritje</span>;
  if (trending === false)
    return <span className="sp-trend down"><TrendingDown size={13} /> Në rënie</span>;
  return <span className="sp-trend flat"><Minus size={13} /> Stabile</span>;
}

function stockClass(stock, avgWeekly) {
  if (stock <= 0) return "sp-stock-danger";
  if (stock < avgWeekly) return "sp-stock-low";
  return "sp-stock-ok";
}

/* â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function SugjerimiPorosiseSipasFurnitorit() {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://localhost:7285";

  const [furnitoret, setFurnitoret] = useState([]);
  const [selectedFurnitor, setSelectedFurnitor] = useState(null);
  const [produktetOrigjinale, setProduktetOrigjinale] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingFurnitoret, setLoadingFurnitoret] = useState(true);
  const [loadingProduktet, setLoadingProduktet] = useState(false);
  const [progress, setProgress] = useState(0);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedProduktDetaje, setSelectedProduktDetaje] = useState(null);

  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  // Load suppliers
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/Partneri/shfaqPartneretFurntiore`, auth)
      .then((res) => {
        const options = res.data
          .filter((f) => ![1, 2, 3].includes(f.idPartneri))
          .map((f) => ({
            value: f.idPartneri,
            label: `${f.emriBiznesit}${f.shkurtesaPartnerit ? ` (${f.shkurtesaPartnerit})` : ""}`.trim(),
          }));
        setFurnitoret(options);
        setLoadingFurnitoret(false);
      })
      .catch(() => setLoadingFurnitoret(false));
  }, []);

  // Load products for selected supplier
  useEffect(() => {
    if (!selectedFurnitor) {
      setProduktetOrigjinale([]);
      return;
    }
    setLoadingProduktet(true);
    setProgress(0);

    axios
      .get(`${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`, auth)
      .then(async (res) => {
        const produktetEFurnitorit = res.data.filter(
          (p) => p.idPartneri === selectedFurnitor.value
        );
        const totalItems = produktetEFurnitorit.length;
        if (totalItems === 0) {
          setProduktetOrigjinale([]);
          setLoadingProduktet(false);
          return;
        }

        const chunkSize = 100;
        let sugjerimetArray = [];

        for (let i = 0; i < totalItems; i += chunkSize) {
          const chunk = produktetEFurnitorit.slice(i, i + chunkSize);
          const sugjerimetChunk = await Promise.all(
            chunk.map(async (p) => {
              try {
                const sug = await axios.post(
                  `${API_BASE_URL}/api/Njoftimet/suggest-order/${p.produktiID}`,
                  { leadTimeWeeks: 1, desiredWeeksCoverage: 2, safetyStockWeeks: 1 },
                  auth
                );
                return { ...p, suggestion: sug.data };
              } catch {
                return {
                  ...p,
                  suggestion: {
                    currentStock: p.stokuAktual || 0,
                    averageWeeklySales: 0,
                    recommendedOrderQuantity: 0,
                    currentWeeksCoverage: 0,
                    projectedWeeksCoverage: 0,
                    message: "Gabim në llogaritje",
                    moq: 0,
                    packSize: 1,
                    lastPurchasePrice: 0,
                    lastSupplier: selectedFurnitor.label,
                    suggestionLevel: "OK",
                    isOutOfStock: false,
                    isSalesTrendingUp: null,
                  },
                };
              }
            })
          );
          sugjerimetArray.push(...sugjerimetChunk);
          setProgress(Math.round(((i + chunk.length) / totalItems) * 100));
        }

        // Sort: CRITICAL first, then HIGH, MEDIUM, LOW, OK, rest
        const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, OK: 4 };
        sugjerimetArray.sort(
          (a, b) =>
            (order[a.suggestion?.suggestionLevel] ?? 5) -
            (order[b.suggestion?.suggestionLevel] ?? 5)
        );

        setProduktetOrigjinale(sugjerimetArray);
        setLoadingProduktet(false);
      })
      .catch(() => {
        setProduktetOrigjinale([]);
        setLoadingProduktet(false);
      });
  }, [selectedFurnitor]);

  // Live search (memoized)
  const produktet = useMemo(() => {
    if (!searchTerm.trim()) return produktetOrigjinale;
    const term = searchTerm.toLowerCase();
    return produktetOrigjinale.filter(
      (p) =>
        (p.barkodi && p.barkodi.toLowerCase().includes(term)) ||
        (p.emriProduktit && p.emriProduktit.toLowerCase().includes(term))
    );
  }, [searchTerm, produktetOrigjinale]);

  const handleFurnitorChange = (selected) => {
    setSelectedFurnitor(selected);
    setSearchTerm("");
  };

  const handleRowClick = (produkt) => {
    setSelectedProduktDetaje(produkt);
    setShowModal(true);
  };

  // â”€â”€ Custom virtualizer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const ROW_HEIGHT = 52;
  const OVERSCAN = 5;
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(500);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerHeight(el.clientHeight);
    const onScroll = () => setScrollTop(el.scrollTop);
    const onResize = () => setContainerHeight(el.clientHeight);
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [produktet]);

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const end = Math.min(
      produktet.length,
      Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN
    );
    return { start, end };
  }, [scrollTop, containerHeight, produktet.length]);

  // â”€â”€ Week mode toggle (1 or 4 weeks) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [weekMode, setWeekMode] = useState(4);

  // Computes actual ORDER quantity needed to cover `weeks` weeks,
  // accounting for current stock and rounded up to pack size.
  const calcSugjerimi = useCallback((s, avgWeekly, weeks) => {
    const packSize = s.packSize || 1;
    const needed = avgWeekly * weeks - Math.max(0, s.currentStock ?? 0);
    if (needed <= 0) return 0;
    return Math.ceil(needed / packSize) * packSize;
  }, []);


  return (
    <>
      <Titulli titulli="Sugjerim Porosie sipas Furnitorit" />
      <KontrolloAksesinNeFaqe
        roletELejuara={["Menaxher", "Kalkulant", "Pergjegjes i Porosive"]}
      />
      <NavBar />

      <div className="sp-page">
        <div className="sp-inner">

          {/* Hero */}
          <div className="sp-hero">
            <h1>Sugjerim Porosie sipas Furnitorit</h1>
            <p>Zgjidh furnitorin, kërko produktet dhe kliko rreshtin për detaje</p>
          </div>

          {/* Controls */}
          <div className="sp-controls">
            <Select
              className="sp-select"
              classNamePrefix="sp-select"
              value={selectedFurnitor}
              onChange={handleFurnitorChange}
              options={furnitoret}
              placeholder="Zgjidh furnitorin..."
              isClearable
              isLoading={loadingFurnitoret}
            />
            {selectedFurnitor && (
              <input
                className="sp-search"
                type="text"
                placeholder="Kërko me barkod ose emër produkti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            )}
          </div>

          {/* Loading progress */}
          {loadingProduktet && (
            <div className="sp-loading">
              <h5>Duke llogaritur sugjerimet...</h5>
              <div className="sp-progress-wrap">
                <div className="sp-progress-bar" style={{ width: `${progress}%` }}>
                  {progress > 10 ? `${progress}%` : ""}
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          {selectedFurnitor && !loadingProduktet && produktet.length > 0 && (
            <div className="sp-card">
              <div className="sp-card-header">
                <h3>
                  <Truck size={16} style={{ marginRight: "0.5rem", opacity: 0.7 }} />
                  {selectedFurnitor.label}
                  <span style={{ fontWeight: 500, color: "var(--sp-text-muted)", marginLeft: "0.5rem", fontSize: "0.78rem" }}>
                    Â· {produktet.length} produkte
                  </span>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {searchTerm && (
                    <span className="search-hint">Rezultate për: "{searchTerm}"</span>
                  )}
                  {/* Week mode toggle */}
                  <div className="sp-week-toggle">
                    <button
                      className={`sp-week-btn${weekMode === 1 ? ' active' : ''}`}
                      onClick={() => setWeekMode(1)}
                    >
                      1 Javë
                    </button>
                    <button
                      className={`sp-week-btn${weekMode === 4 ? ' active' : ''}`}
                      onClick={() => setWeekMode(4)}
                    >
                      4 Javë
                    </button>
                  </div>
                </div>
              </div>

              {/* Virtualized table */}
              <div className="sp-vtable-wrap">
                {/* Sticky header */}
                <div className="sp-vhead">
                  <div className="sp-vcell sp-vcol-level">Niveli</div>
                  <div className="sp-vcell sp-vcol-barcode">Barkodi</div>
                  <div className="sp-vcell sp-vcol-name">Emri Produktit</div>
                  <div className="sp-vcell sp-vcol-num" style={{ justifyContent: "flex-end" }}>Stoku</div>
                  <div className="sp-vcell sp-vcol-num" style={{ justifyContent: "flex-end" }}>Shitje/Javë</div>
                  <div className="sp-vcell sp-vcol-sug" style={{ justifyContent: "flex-end", color: 'var(--sp-emerald)' }}>Sugjerimi ({weekMode}j)</div>
                  <div style={{ width: '8px', flexShrink: 0 }} />
                </div>
                {/* Scroll container */}
                <div
                  ref={containerRef}
                  style={{ height: Math.min(produktet.length * ROW_HEIGHT, Math.floor(window.innerHeight * 0.6)), overflowY: 'auto', position: 'relative', scrollbarGutter: 'stable' }}
                >
                  {/* Total height spacer */}
                  <div style={{ height: produktet.length * ROW_HEIGHT, position: 'relative' }}>
                    {produktet.slice(visibleRange.start, visibleRange.end).map((p, i) => {
                      const index = visibleRange.start + i;
                      const s = p.suggestion;
                      const avgWeekly = Math.round(s.averageWeeklySales || 0);
                      const suggerimi = calcSugjerimi(s, avgWeekly, weekMode);
                      const packSize = s.packSize || 1;
                      const packs = packSize > 1 ? Math.ceil(suggerimi / packSize) : null;
                      return (
                        <div
                          key={p.produktiID}
                          style={{ position: 'absolute', top: index * ROW_HEIGHT, left: 0, right: 0, height: ROW_HEIGHT, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                          className={`sp-vrow${index % 2 === 0 ? ' sp-vrow-even' : ''}`}
                          onClick={() => handleRowClick(p)}
                        >
                          <div className="sp-vcell sp-vcol-level"><LevelBadge level={s.suggestionLevel} /></div>
                          <div className="sp-vcell sp-vcol-barcode"><span className="sp-barcode">{p.barkodi}</span></div>
                          <div className="sp-vcell sp-vcol-name">
                            <span style={{ fontWeight: 600 }} title={p.emriProduktit}>{p.emriProduktit}</span>
                            {s.isOutOfStock && <span className="sp-oos"><XCircle size={9} /> Jashtë stok</span>}
                          </div>
                          <div className="sp-vcell sp-vcol-num" style={{ justifyContent: 'flex-end' }}>
                            <span className={stockClass(s.currentStock, avgWeekly)}>{(s.currentStock ?? 0).toLocaleString()}</span>
                          </div>
                          <div className="sp-vcell sp-vcol-num" style={{ justifyContent: 'flex-end', color: 'var(--sp-text-soft)' }}>{avgWeekly.toLocaleString()}</div>
                          <div className="sp-vcell sp-vcol-sug" style={{ justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end', gap: 0 }}>
                            <span style={{ fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: suggerimi > 0 ? 'var(--sp-emerald)' : 'var(--sp-text-muted)', lineHeight: 1.2 }}>
                              {suggerimi > 0 ? suggerimi.toLocaleString() : 'â€”'}
                            </span>
                            {packs && suggerimi > 0 && (
                              <span style={{ fontSize: '0.65rem', color: 'var(--sp-text-muted)', lineHeight: 1.2 }}>
                                {packs >= 1000 ? `${(packs / 1000).toFixed(1)}k` : packs} pako
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No search results */}
          {selectedFurnitor && !loadingProduktet && searchTerm && produktet.length === 0 && (
            <div className="sp-alert warning">
              Nuk u gjet asnjë produkt për "<strong>{searchTerm}</strong>"
            </div>
          )}

          {/* No products for supplier */}
          {selectedFurnitor && !loadingProduktet && !searchTerm && produktet.length === 0 && (
            <div className="sp-alert">
              <strong>{selectedFurnitor.label}</strong> nuk ka produkte aktive.
            </div>
          )}

          {/* Empty state */}
          {!selectedFurnitor && !loadingFurnitoret && (
            <div className="sp-empty">
              <Truck size={90} />
              <h3>Zgjidh një furnitor për të parë sugjerimet</h3>
              <p>Pas zgjedhjes, sistemi llogarit automatikisht nevojat e porosisë</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="xl"
        centered
        className="sp-modal"
      >
        {selectedProduktDetaje && (() => {
          const p = selectedProduktDetaje;
          const s = p.suggestion;
          const avgWeekly = Math.round(s.averageWeeklySales || 0);
          const for1Week = avgWeekly;
          const for4Weeks = avgWeekly * 4;
          const recommended = Math.max(0, s.recommendedOrderQuantity || 0);
          const packs1Week = s.packSize > 1 ? Math.ceil(for1Week / s.packSize) : 0;
          const packs4Weeks = s.packSize > 1 ? Math.ceil(for4Weeks / s.packSize) : 0;
          const packsRecommended = s.packSize > 1 ? Math.ceil(recommended / s.packSize) : 0;
          const estimatedCost = recommended * (s.lastPurchasePrice || 0);

          return (
            <>
              <Modal.Header closeButton>
                <Modal.Title>
                  {p.emriProduktit}
                  {s.isOutOfStock && <span className="sp-oos ms-2"><XCircle size={10} /> Jashtë Stok</span>}
                  <br />
                  <small>{p.barkodi} &nbsp;Â·&nbsp; <LevelBadge level={s.suggestionLevel} /></small>
                </Modal.Title>
              </Modal.Header>

              <Modal.Body>
                {/* Stat cards */}
                <div className="sp-stat-grid">
                  <div className="sp-stat-card">
                    <div className="label">Stoku Aktual</div>
                    <div className={`value ${stockClass(s.currentStock, avgWeekly)}`}>
                      {(s.currentStock ?? 0).toLocaleString()}
                    </div>
                    <div className="unit">copë</div>
                  </div>
                  <div className="sp-stat-card">
                    <div className="label">Shitje / Javë</div>
                    <div className="value" style={{ color: "var(--sp-cyan)" }}>
                      {avgWeekly.toLocaleString()}
                    </div>
                    <div className="unit">
                      <TrendBadge trending={s.isSalesTrendingUp} />
                    </div>
                  </div>
                  <div className="sp-stat-card">
                    <div className="label">Mbulim Aktual</div>
                    <div className="value" style={{ color: s.currentWeeksCoverage < 1 ? "var(--sp-red)" : "var(--sp-text)" }}>
                      {(s.currentWeeksCoverage ?? 0).toFixed(1)}
                    </div>
                    <div className="unit">javë mbulim</div>
                  </div>
                  <div className="sp-stat-card">
                    <div className="label">Mbulim Pas Porosisë</div>
                    <div className="value" style={{ color: "var(--sp-emerald)" }}>
                      {(s.projectedWeeksCoverage ?? 0).toFixed(1)}
                    </div>
                    <div className="unit">javë mbulim</div>
                  </div>
                </div>

                {/* Recommended total */}
                <div className="sp-recommend-box">
                  <div className="rec-label">Sugjerimi Inteligjent i Sistemit</div>
                  <span className="rec-qty">
                    {recommended > 0 ? recommended.toLocaleString() : "âœ“"}
                  </span>
                  {recommended > 0 ? (
                    <>
                      <div className="rec-packs">
                        {packsRecommended > 0 && (
                          <span>{packsRecommended} pako Ç— {s.packSize} copë/pako &nbsp;Â·&nbsp; </span>
                        )}
                        <span>copë</span>
                      </div>
                      {s.lastPurchasePrice > 0 && (
                        <div className="rec-packs" style={{ marginBottom: "0.4rem" }}>
                          Kosto e vlerësuar: <strong>≈ {estimatedCost.toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</strong>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rec-packs">STOK I MJAFTUESHÇ‹M</div>
                  )}
                  <div className="rec-msg">{s.message}</div>
                </div>

                {/* 1 week / 4 weeks */}
                <div className="sp-order-grid">
                  <div className="sp-order-box green">
                    <div className="box-label">Për 1 Javë</div>
                    <div className="box-qty">{for1Week.toLocaleString()}</div>
                    <div className="box-packs">
                      {packs1Week > 0
                        ? `${packs1Week} pako Ç— ${s.packSize}`
                        : "copë"}
                    </div>
                  </div>
                  <div className="sp-order-box blue">
                    <div className="box-label">Për 4 Javë (Mujore)</div>
                    <div className="box-qty">{for4Weeks.toLocaleString()}</div>
                    <div className="box-packs">
                      {packs4Weeks > 0
                        ? `${packs4Weeks} pako Ç— ${s.packSize}`
                        : "copë"}
                    </div>
                  </div>
                </div>

                {/* Meta info */}
                <div className="sp-meta">
                  <div className="sp-meta-item">
                    <div className="mi-label">MOQ</div>
                    <div className="mi-value">{s.moq || 0} copë</div>
                  </div>
                  <div className="sp-meta-item">
                    <div className="mi-label">Pako</div>
                    <div className="mi-value">{s.packSize || 1} copë/pako</div>
                  </div>
                  <div className="sp-meta-item">
                    <div className="mi-label">Çmimi i Fundit</div>
                    <div className="mi-value">{s.lastPurchasePrice || 0} €</div>
                  </div>
                  <div className="sp-meta-item">
                    <div className="mi-label">Furnitori</div>
                    <div className="mi-value" style={{ fontFamily: "inherit", fontSize: "0.8rem" }}>
                      {s.lastSupplier || selectedFurnitor?.label || "â€”"}
                    </div>
                  </div>
                  <div className="sp-meta-item">
                    <div className="mi-label">Blerja e Fundit</div>
                    <div className="mi-value">{s.lastPurchaseDate ? new Date(s.lastPurchaseDate).toLocaleDateString("sq-AL") : "â€”"}</div>
                  </div>
                  <div className="sp-meta-item">
                    <div className="mi-label">Periudha Analizës</div>
                    <div className="mi-value" style={{ fontSize: "0.7rem" }}>{s.analysisPeriod || "â€”"}</div>
                  </div>
                  <div className="sp-meta-item">
                    <div className="mi-label">Muaj me Shitje</div>
                    <div className="mi-value">{s.monthsWithSales ?? "â€”"}</div>
                  </div>
                  <div className="sp-meta-item">
                    <div className="mi-label">Trendi</div>
                    <div className="mi-value" style={{ fontFamily: "inherit" }}>
                      <TrendBadge trending={s.isSalesTrendingUp} />
                    </div>
                  </div>
                  <div className="sp-meta-item">
                    <div className="mi-label">Shitje Mujore</div>
                    <div className="mi-value">{Math.round(s.averageMonthlySales || 0).toLocaleString()}</div>
                  </div>
                </div>

                {s.dataQualityWarning && (
                  <div className="sp-modal-warning">
                    <AlertTriangle size={13} style={{ marginRight: "0.4rem" }} />
                    {s.dataQualityWarning}
                  </div>
                )}
              </Modal.Body>

              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Mbyll
                </Button>
              </Modal.Footer>
            </>
          );
        })()}
      </Modal>
    </>
  );
}

export default SugjerimiPorosiseSipasFurnitorit;
