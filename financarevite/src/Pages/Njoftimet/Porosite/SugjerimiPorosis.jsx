import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  ShoppingCart,
  Package,
} from "lucide-react";
import Titulli from "../../../Components/TeTjera/Titulli";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import "../../../Pages/Styles/SugjerimiPorosise.css";

/* â”€â”€ Reused helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function LevelBadge({ level }) {
  const icons = {
    CRITICAL: <AlertTriangle size={11} />,
    HIGH: <AlertTriangle size={11} />,
    MEDIUM: <Package size={11} />,
    LOW: <CheckCircle size={11} />,
    OK: <CheckCircle size={11} />,
  };
  const labels = {
    CRITICAL: "KRITIKE",
    HIGH: "E LARTË",
    MEDIUM: "MESME",
    LOW: "E ULËT",
    OK: "OK",
  };
  return (
    <span className={`sp-level sp-level-${level || "OK"}`} style={{ fontSize: "0.75rem", padding: "0.25rem 0.8rem" }}>
      {icons[level] || null}
      {labels[level] || level || "-"}
    </span>
  );
}

function TrendBadge({ trending }) {
  if (trending === true) return <span className="sp-trend up"><TrendingUp size={13} /> Në rritje</span>;
  if (trending === false) return <span className="sp-trend down"><TrendingDown size={13} /> Në rënie</span>;
  return <span className="sp-trend flat"><Minus size={13} /> Stabile</span>;
}

/* â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function SugjerimiPorosise() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [options, setOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`, auth)
      .then((res) =>
        setOptions(
          res.data.map((p) => ({
            value: p.produktiID,
            label: `${p.barkodi} - ${p.emriProduktit}`,
            data: p,
          }))
        )
      )
      .catch(() => { });
  }, []);

  const handleProductChange = async (selected) => {
    setSelectedProduct(selected);
    if (!selected) { setSuggestion(null); return; }
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/Njoftimet/suggest-order/${selected.value}`,
        { leadTimeWeeks: 1, desiredWeeksCoverage: 2, safetyStockWeeks: 1 },
        auth
      );
      setSuggestion(res.data);
    } catch {
      setSuggestion(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredOptions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) return [];
    const lower = inputValue.toLowerCase();
    const results = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].label.toLowerCase().includes(lower)) {
        results.push(options[i]);
        if (results.length >= 50) break;
      }
    }
    return results;
  }, [inputValue, options]);

  // Derived values
  const s = suggestion;
  const avgWeekly = s ? Math.round(s.averageWeeklySales || 0) : 0;
  const recommended = s ? Math.max(0, s.recommendedOrderQuantity || 0) : 0;

  // Week mode toggle
  const [weekMode, setWeekMode] = useState(4);

  const calcSugjerimi = useCallback((sug, weekly, weeks) => {
    const packSize = sug.packSize || 1;
    const needed = weekly * weeks - Math.max(0, sug.currentStock ?? 0);
    if (needed <= 0) return 0;
    return Math.ceil(needed / packSize) * packSize;
  }, []);

  const displayQty = s ? calcSugjerimi(s, avgWeekly, weekMode) : 0;
  const packs = s && s.packSize > 1 ? Math.ceil(displayQty / s.packSize) : null;
  const estimatedCost = s ? displayQty * (s.lastPurchasePrice || 0) : 0;
  const noNeedToOrder = s && displayQty <= 0;

  // Level â†’ accent color for the hero banner
  const levelColor = {
    CRITICAL: "var(--sp-red)",
    HIGH: "var(--sp-amber)",
    MEDIUM: "var(--sp-cyan)",
    LOW: "var(--sp-emerald)",
    OK: "var(--sp-emerald)",
  };
  const bannerAccent = s ? (levelColor[s.suggestionLevel] || "var(--sp-emerald)") : "var(--sp-emerald)";

  return (
    <>
      <Titulli titulli="Sugjerim Inteligjent Porosie" />
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Pergjegjes i Porosive", "Kalkulant", "1 Euro Menaxher", "1 Euro Staff"]} />
      <NavBar />

      <div className="sp-page">
        <div className="sp-inner" style={{ maxWidth: 960 }}>

          {/* Hero */}
          <div className="sp-hero">
            <h1>Sa duhet të porosis sot?</h1>
            <p>Kërko produktin dhe shiko sugjerimin inteligjent menjëherë</p>
          </div>

          {/* Search */}
          <div style={{ maxWidth: 620, margin: "0 auto 2rem" }}>
            <Select
              className="sp-select"
              classNamePrefix="sp-select"
              placeholder="Kërko me barkod ose emër produkti..."
              options={filteredOptions}
              value={selectedProduct}
              onChange={handleProductChange}
              onInputChange={(val) => setInputValue(val)}
              isClearable
              isLoading={options.length === 0}
              noOptionsMessage={() =>
                inputValue.length < 2
                  ? "Shkruani të paktën 2 karaktere..."
                  : "Nuk u gjet asnjë produkt"
              }
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="sp-loading">
              <h5>Duke llogaritur sugjerimin...</h5>
              <div className="sp-progress-wrap">
                <div className="sp-progress-bar" style={{ width: "100%", animation: "pulse 1.2s ease-in-out infinite" }} />
              </div>
            </div>
          )}

          {/* Result */}
          {s && !loading && (
            <>
              {/* Hero banner */}
              <div
                style={{
                  background: noNeedToOrder
                    ? "linear-gradient(145deg, #052010, #0a2d18)"
                    : "linear-gradient(145deg, #050d1a, #080f20)",
                  border: `1px solid ${bannerAccent}33`,
                  borderRadius: "var(--radius-lg)",
                  padding: "2.5rem 2rem",
                  textAlign: "center",
                  marginBottom: "1.25rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Glow blob */}
                <div style={{
                  position: "absolute", bottom: -30, left: "50%", transform: "translateX(-50%)",
                  width: 300, height: 100, background: bannerAccent,
                  borderRadius: "50%", filter: "blur(60px)", opacity: 0.1, pointerEvents: "none",
                }} />

                {/* Top accent line */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, ${bannerAccent}, transparent)`,
                }} />

                <div style={{ marginBottom: "0.75rem" }}>
                  <LevelBadge level={s.suggestionLevel} />
                  {s.isOutOfStock && (
                    <span className="sp-oos" style={{ marginLeft: "0.5rem" }}>
                      <XCircle size={10} /> Jashtë Stok
                    </span>
                  )}
                </div>

                {noNeedToOrder ? (
                  <>
                    <CheckCircle size={48} color="var(--sp-emerald)" style={{ marginBottom: "0.75rem" }} />
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "2.2rem", fontWeight: 900, color: "var(--sp-emerald)", letterSpacing: "-0.03em" }}>
                      STOK I MJAFTUESHËM
                    </div>
                    <p style={{ color: "var(--sp-text-muted)", fontSize: "0.9rem", marginTop: "0.4rem" }}>
                      Nuk ka nevojë për porosi
                    </p>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={42} color={bannerAccent} style={{ marginBottom: "0.75rem" }} />

                    {/* Week toggle */}
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                      <div className="sp-week-toggle">
                        <button
                          className={`sp-week-btn${weekMode === 1 ? " active" : ""}`}
                          onClick={() => setWeekMode(1)}
                        >
                          1 Javë
                        </button>
                        <button
                          className={`sp-week-btn${weekMode === 4 ? " active" : ""}`}
                          onClick={() => setWeekMode(4)}
                        >
                          4 Javë
                        </button>
                      </div>
                    </div>

                    <div style={{ color: "var(--sp-text-muted)", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.3rem" }}>
                      Porosi për {weekMode} {weekMode === 1 ? "javë" : "javë"}
                    </div>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "clamp(2rem, 6vw, 3.5rem)",
                      fontWeight: 900,
                      color: bannerAccent,
                      lineHeight: 1,
                      textShadow: `0 0 40px ${bannerAccent}44`,
                      letterSpacing: "-0.03em",
                      marginBottom: "0.4rem",
                    }}>
                      {displayQty.toLocaleString()} copë
                    </div>
                    {packs && (
                      <div style={{ color: `${bannerAccent}bb`, fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        {packs >= 1000 ? `${(packs / 1000).toFixed(1)}k` : packs} pako - {s.packSize} copë/pako
                      </div>
                    )}
                    {estimatedCost > 0 && (
                      <div style={{ color: "var(--sp-text-muted)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                        Kosto e vlerësuar: <strong style={{ color: "var(--sp-text-soft)" }}>≈ {estimatedCost.toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</strong>
                      </div>
                    )}
                    <div style={{ color: "var(--sp-text-soft)", fontSize: "0.85rem", fontWeight: 600 }}>
                      {s.message}
                    </div>
                  </>
                )}
              </div>

              {/* Product name chip */}
              <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                <span style={{
                  display: "inline-block",
                  background: "var(--sp-surface-2)",
                  border: "1px solid var(--sp-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.5rem 1.25rem",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "var(--sp-text)",
                }}>
                  {s.productName}
                </span>
                <span className="sp-barcode" style={{ marginLeft: "0.75rem", fontSize: "0.8rem" }}>
                  {selectedProduct?.data?.barkodi}
                </span>
              </div>

              {/* Stat grid */}
              <div className="sp-stat-grid" style={{ marginBottom: "1.25rem" }}>
                <div className="sp-stat-card">
                  <div className="label">Stoku Aktual</div>
                  <div className="value" style={{ color: s.currentStock < 0 ? "var(--sp-red)" : s.currentStock < avgWeekly ? "var(--sp-amber)" : "var(--sp-text)" }}>
                    {(s.currentStock ?? 0).toLocaleString()}
                  </div>
                  <div className="unit">copë</div>
                </div>
                <div className="sp-stat-card">
                  <div className="label">Shitje / Javë</div>
                  <div className="value" style={{ color: "var(--sp-cyan)" }}>
                    {avgWeekly.toLocaleString()}
                  </div>
                  <div className="unit"><TrendBadge trending={s.isSalesTrendingUp} /></div>
                </div>
                <div className="sp-stat-card">
                  <div className="label">Mbulim Aktual</div>
                  <div className="value" style={{ color: s.currentWeeksCoverage < 1 ? "var(--sp-red)" : "var(--sp-text)" }}>
                    {(s.currentWeeksCoverage ?? 0).toFixed(1)}
                  </div>
                  <div className="unit">javë</div>
                </div>
                <div className="sp-stat-card">
                  <div className="label">Mbulim Pas Porosisë</div>
                  <div className="value" style={{ color: "var(--sp-emerald)" }}>
                    {(s.projectedWeeksCoverage ?? 0).toFixed(1)}
                  </div>
                  <div className="unit">javë</div>
                </div>
              </div>

              {/* Meta grid */}
              <div className="sp-meta" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
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
                  <div className="mi-value" style={{ fontFamily: "inherit", fontSize: "0.78rem" }}>{s.lastSupplier || "-"}</div>
                </div>
                <div className="sp-meta-item">
                  <div className="mi-label">Blerja e Fundit</div>
                  <div className="mi-value">
                    {s.lastPurchaseDate ? new Date(s.lastPurchaseDate).toLocaleDateString("sq-AL") : "-"}
                  </div>
                </div>
                <div className="sp-meta-item">
                  <div className="mi-label">Shitje Mujore</div>
                  <div className="mi-value">{Math.round(s.averageMonthlySales || 0).toLocaleString()}</div>
                </div>
                <div className="sp-meta-item">
                  <div className="mi-label">Muaj me Shitje</div>
                  <div className="mi-value">{s.monthsWithSales ?? "-"}</div>
                </div>
                <div className="sp-meta-item">
                  <div className="mi-label">Periudha Analizës</div>
                  <div className="mi-value" style={{ fontSize: "0.68rem" }}>{s.analysisPeriod || "-"}</div>
                </div>
                <div className="sp-meta-item">
                  <div className="mi-label">Trendi</div>
                  <div className="mi-value" style={{ fontFamily: "inherit" }}>
                    <TrendBadge trending={s.isSalesTrendingUp} />
                  </div>
                </div>
              </div>

              {s.dataQualityWarning && (
                <div className="sp-modal-warning" style={{ marginTop: "1rem" }}>
                  <AlertTriangle size={13} style={{ marginRight: "0.4rem" }} />
                  {s.dataQualityWarning}
                </div>
              )}
            </>
          )}

          {/* Empty state */}
          {!selectedProduct && !loading && (
            <div className="sp-empty">
              <Search size={90} />
              <h3>Zgjidh një produkt për të parë sugjerimin</h3>
              <p>Funksionon në çast - pa pritje</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SugjerimiPorosise;
