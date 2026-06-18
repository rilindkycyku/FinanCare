import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { List } from "react-window";
import NavBar from "../../Components/TeTjera/layout/NavBar";
import KontrolloAksesinNeFaqe from "../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import { exportListExcel } from "@/utils/exportInvoiceExcel";
import ChartComponent from "../../Components/TeTjera/Chart/ChartComponent";
import {
  FileText, ArrowUpDown, ArrowUp, ArrowDown,
  Search, RotateCcw, Sheet, TrendingUp, Lock, Unlock, X,
  User, Calendar, CreditCard, Percent, Truck, BarChart3, PieChart,
  Package, AlertCircle
} from "lucide-react";
import "../Styles/ListaFaturave.css";

// ── Helpers ───────────────────────────────────────────────────────
const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
};

const fmt = (v) =>
  parseFloat(v || 0).toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "—";
  }
};

// Map llojiKalkulimit → human label
const TYPE_LABELS = {
  FAT: "Porosi",
  HYRJE: "Kalkulim",
  OFERTE: "Ofertë",
  KMSH: "Kth. Shitjeje",
  KMB: "Kth. Blerje",
  AS: "Asgjësim",
  PARAGON: "Paragon",
  FL: "Flete Lej.",
  PAGES: "Pagesë",
  KLFV: "Kalk. Vjetor",
};

const ALL_TYPES = Object.keys(TYPE_LABELS);

// KPI accent classes
const TYPE_ACCENT = { FAT: "emerald", HYRJE: "indigo", OFERTE: "cyan", KMSH: "amber", KMB: "red" };

// ── Row component (memoized for react-window) ─────────────────────
const Row = ({ index, style, items, onRowClick }) => {
  const k = items[index];
  const isEven = index % 2 === 0;

  return (
    <div
      style={{ ...style, cursor: "pointer" }}
      className={`lf-vrow${isEven ? " even" : ""}`}
      onClick={() => onRowClick?.(k)}
    >
      <div className="lf-td lf-col-nr muted mono">{k.nrRendorFatures ?? "—"}</div>
      <div className="lf-td lf-col-data muted">{fmtDate(k.dataRegjistrimit)}</div>
      <div className="lf-td">
        <span className={`lf-type-badge ${k.llojiKalkulimit || 'N/A'}`}>
          {TYPE_LABELS[k.llojiKalkulimit] ?? k.llojiKalkulimit ?? "N/A"}
        </span>
      </div>
      <div className="lf-td bold" style={{ overflow: "hidden" }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {k.emriBiznesit || "—"}
        </span>
      </div>
      <div className="lf-td muted mono">{k.nrFatures || "—"}</div>
      <div className="lf-td right mono">{fmt(k.totaliPaTVSH)} €</div>
      <div className="lf-td right mono">{fmt(k.tvsh)} €</div>
      <div className="lf-td right mono bold" style={{ color: "var(--sp-emerald,#10b981)" }}>
        {fmt(k.totaliPaTVSH + k.tvsh)} €
      </div>
      <div className="lf-td">
        {k.statusiKalkulimit === "true" ? (
          <span className="lf-status closed"><Lock size={11} /> I Mbyllur</span>
        ) : (
          <span className="lf-status open"><Unlock size={11} /> I Hapur</span>
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
function ListaFaturave() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const getToken = localStorage.getItem("token");
  const auth = useMemo(
    () => ({ headers: { Authorization: `Bearer ${getToken}` } }),
    [getToken]
  );

  // ─ State ─────────────────────────────────────────────────────
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(false);

  // Date filters (API level)
  const [dataFillim, setDataFillim] = useState(today());
  const [dataMbarim, setDataMbarim] = useState(today());

  // Client-side filters
  const [activeTypes, setActiveTypes] = useState(new Set(ALL_TYPES));
  const [searchText, setSearchText] = useState("");
  const [filterLlojiPageses, setFilterLlojiPageses] = useState("Te Gjitha");
  const [filterStatusi, setFilterStatusi] = useState("Te Gjitha");

  // Sort
  const [sortKey, setSortKey] = useState("dataRegjistrimit");
  const [sortDir, setSortDir] = useState("desc");

  // Excel export loading
  const [exporting, setExporting] = useState(false);

  // Tab views and drawer state
  const [activeTab, setActiveTab] = useState("lista");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState(false);

  // List ref for scroll
  const listRef = useRef();
  const containerRef = useRef();
  const [listHeight, setListHeight] = useState(500);

  // ─ Fetch ─────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!dataFillim || !dataMbarim) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/Faturat/shfaqRegjistrimet?dataFillim=${dataFillim}&dataMbarim=${dataMbarim}`,
        auth
      );
      setRaw(res.data ?? []);
    } catch (err) {
      console.error("ListaFaturave fetch error:", err);
      setRaw([]);
    } finally {
      setLoading(false);
    }
  }, [dataFillim, dataMbarim, auth, API_BASE_URL]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─ Fetch invoice line items when a row is selected ─────────────
  useEffect(() => {
    if (!selectedInvoice?.idRegjistrimit) {
      setInvoiceItems([]);
      return;
    }
    let cancelled = false;
    setItemsLoading(true);
    setItemsError(false);
    axios
      .get(
        `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${selectedInvoice.idRegjistrimit}`,
        auth
      )
      .then((res) => {
        if (cancelled) return;
        setInvoiceItems(res.data ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Invoice items fetch error:", err);
        setInvoiceItems([]);
        setItemsError(true);
      })
      .finally(() => {
        if (!cancelled) setItemsLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedInvoice, API_BASE_URL, auth]);

  // ─ Derived invoice item rows (price/discount/VAT breakdown) ────
  const invoiceItemRows = useMemo(() => {
    return invoiceItems.map((produkti) => {
      const qmimiShites = parseFloat(produkti.qmimiShites) || 0;
      const sasia = parseFloat(produkti.sasiaStokut) || 0;
      const tvshRate = parseFloat(produkti.llojiTVSH) || 0;
      const rabati1 = parseFloat(produkti.rabati1) || 0;
      const rabati2 = parseFloat(produkti.rabati2) || 0;
      const rabati3 = parseFloat(produkti.rabati3) || 0;
      const totalRabati = (rabati1 + rabati2 + rabati3) / 100;
      const qmimiPaTVSH = qmimiShites / (1 + tvshRate / 100);
      const qmimiMeRabat = qmimiShites * (1 - totalRabati);
      const tvshValue = qmimiMeRabat * (tvshRate / 100) * sasia;
      const shuma = qmimiMeRabat * sasia;
      return {
        produkti,
        qmimiPaTVSH,
        rabatiTotal: rabati1 + rabati2 + rabati3,
        tvshRate,
        qmimiMeRabat,
        tvshValue,
        shuma,
        sasia,
      };
    });
  }, [invoiceItems]);

  const invoiceItemsTotal = useMemo(
    () => invoiceItemRows.reduce((s, r) => s + r.shuma, 0),
    [invoiceItemRows]
  );

  // ─ Debounced search ───────────────────────────────────────────
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), 280);
    return () => clearTimeout(t);
  }, [searchText]);

  // ─ Available Types based on fetched raw data ──────────────────
  const availableTypes = useMemo(() => {
    const types = new Set();
    raw.forEach((k) => {
      if (k.llojiKalkulimit) {
        types.add(k.llojiKalkulimit);
      }
    });
    return ALL_TYPES.filter((t) => types.has(t));
  }, [raw]);

  const isAllActive = useMemo(() => {
    if (availableTypes.length === 0) return true;
    return availableTypes.every((t) => activeTypes.has(t));
  }, [availableTypes, activeTypes]);

  // Auto-align active types when available types change to avoid empty state
  useEffect(() => {
    if (availableTypes.length === 0) return;
    setActiveTypes((prev) => {
      const hasAnyAvailableActive = availableTypes.some((t) => prev.has(t));
      if (!hasAnyAvailableActive) {
        return new Set(ALL_TYPES);
      }
      return prev;
    });
  }, [availableTypes]);

  // ─ Filtered + Sorted list ─────────────────────────────────────
  const filtered = useMemo(() => {
    let items = raw.filter((k) => {
      // Invoice type
      if (!isAllActive && !activeTypes.has(k.llojiKalkulimit)) return false;
      // Payment type
      if (filterLlojiPageses !== "Te Gjitha" && k.llojiPageses !== filterLlojiPageses) return false;
      // Status
      if (filterStatusi !== "Te Gjitha") {
        const closed = k.statusiKalkulimit === "true";
        if (filterStatusi === "I Mbyllur" && !closed) return false;
        if (filterStatusi === "I Hapur" && closed) return false;
      }
      // Text search
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const hit =
          (k.emriBiznesit ?? "").toLowerCase().includes(q) ||
          (k.nrFatures ?? "").toLowerCase().includes(q) ||
          (k.pershkrimShtese ?? "").toLowerCase().includes(q) ||
          String(k.nrRendorFatures ?? "").includes(q);
        if (!hit) return false;
      }
      return true;
    });

    // Sort
    items = [...items].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === "dataRegjistrimit") {
        av = new Date(av ?? 0).getTime();
        bv = new Date(bv ?? 0).getTime();
      } else if (typeof av === "string") {
        av = av.toLowerCase();
        bv = (bv ?? "").toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return items;
  }, [raw, activeTypes, filterLlojiPageses, filterStatusi, debouncedSearch, sortKey, sortDir, isAllActive]);



  // ─ KPIs ──────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalValue = filtered.reduce(
      (s, k) => s + parseFloat(k.totaliPaTVSH || 0) + parseFloat(k.tvsh || 0), 0
    );
    const byType = {};
    filtered.forEach((k) => {
      byType[k.llojiKalkulimit] = (byType[k.llojiKalkulimit] ?? 0) + 1;
    });
    return { count: filtered.length, totalValue, byType };
  }, [filtered]);

  // ─ Analytics Aggregations ────────────────────────────────────
  const dailyData = useMemo(() => {
    const map = {};
    filtered.forEach(k => {
      if (!k.dataRegjistrimit) return;
      const dateStr = fmtDate(k.dataRegjistrimit);
      const total = parseFloat(k.totaliPaTVSH || 0) + parseFloat(k.tvsh || 0);
      map[dateStr] = (map[dateStr] || 0) + total;
    });

    const sortedDates = Object.keys(map).sort((a, b) => {
      const parseDate = (dStr) => {
        const parts = dStr.split('.');
        if (parts.length === 3) {
          return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
        }
        return 0;
      };
      return parseDate(a) - parseDate(b);
    });

    return {
      labels: sortedDates,
      datasets: [
        {
          label: "Vlera e Faturave (€)",
          data: sortedDates.map(d => map[d]),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.08)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        }
      ]
    };
  }, [filtered]);

  const typeChartData = useMemo(() => {
    const map = {};
    filtered.forEach(k => {
      const typeLabel = TYPE_LABELS[k.llojiKalkulimit] ?? k.llojiKalkulimit;
      const total = parseFloat(k.totaliPaTVSH || 0) + parseFloat(k.tvsh || 0);
      map[typeLabel] = (map[typeLabel] || 0) + total;
    });

    const labels = Object.keys(map);
    const data = Object.values(map);

    return {
      labels,
      datasets: [
        {
          label: "Vlera Totale (€)",
          data,
          backgroundColor: [
            "rgba(16, 185, 129, 0.75)",
            "rgba(99, 102, 241, 0.75)",
            "rgba(6, 182, 212, 0.75)",
            "rgba(245, 158, 11, 0.75)",
            "rgba(248, 113, 113, 0.75)",
            "rgba(139, 92, 246, 0.75)",
            "rgba(14, 165, 233, 0.75)",
            "rgba(236, 72, 153, 0.75)",
            "rgba(100, 116, 139, 0.75)",
          ].slice(0, labels.length),
          borderWidth: 0,
          borderRadius: 6,
        }
      ]
    };
  }, [filtered]);

  const paymentChartData = useMemo(() => {
    const map = {};
    filtered.forEach(k => {
      const pm = k.llojiPageses || "Tjetër";
      const total = parseFloat(k.totaliPaTVSH || 0) + parseFloat(k.tvsh || 0);
      map[pm] = (map[pm] || 0) + total;
    });

    const labels = Object.keys(map);
    const data = Object.values(map);

    return {
      labels,
      datasets: [
        {
          label: "Vlera (€)",
          data,
          backgroundColor: [
            "rgba(16, 185, 129, 0.75)",
            "rgba(59, 130, 246, 0.75)",
            "rgba(239, 68, 68, 0.75)",
            "rgba(156, 163, 175, 0.75)",
          ].slice(0, labels.length),
          borderWidth: 0,
          borderRadius: 6,
        }
      ]
    };
  }, [filtered]);

  const topPartners = useMemo(() => {
    const map = {};
    filtered.forEach(k => {
      const name = k.emriBiznesit || "Partner i Panjohur";
      const total = parseFloat(k.totaliPaTVSH || 0) + parseFloat(k.tvsh || 0);
      if (!map[name]) {
        map[name] = { name, count: 0, value: 0 };
      }
      map[name].count += 1;
      map[name].value += total;
    });
    return Object.values(map)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filtered]);

  const topOperators = useMemo(() => {
    const map = {};
    filtered.forEach(k => {
      const name = k.username || "I panjohur";
      const total = parseFloat(k.totaliPaTVSH || 0) + parseFloat(k.tvsh || 0);
      if (!map[name]) {
        map[name] = { name, count: 0, value: 0 };
      }
      map[name].count += 1;
      map[name].value += total;
    });
    return Object.values(map)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filtered]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0d1520",
        titleColor: "#f8fafc",
        bodyColor: "#f1f5f9",
        borderColor: "rgba(255, 255, 255, 0.08)",
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        grid: { color: "rgba(255, 255, 255, 0.04)" },
        ticks: { color: "#94a3b8", font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 10 } }
      }
    }
  }), []);

  // ─ Sort toggle ────────────────────────────────────────────────
  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ArrowUpDown size={11} style={{ opacity: 0.4 }} />;
    return sortDir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />;
  };

  // ─ Type pill toggle ───────────────────────────────────────────
  const toggleType = (type) => {
    setActiveTypes((prev) => {
      // If "Të Gjitha" is active, clicking any individual pill isolates that specific type
      if (isAllActive) {
        return new Set([type]);
      }

      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size === 1) {
          // If toggling off the last selected type, toggle "Të Gjitha" back ON to prevent zero results
          return new Set(ALL_TYPES);
        }
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  // ─ Reset filters ──────────────────────────────────────────────
  const resetFilters = () => {
    setActiveTypes(new Set(ALL_TYPES));
    setSearchText("");
    setFilterLlojiPageses("Te Gjitha");
    setFilterStatusi("Te Gjitha");
    setSortKey("dataRegjistrimit");
    setSortDir("desc");
    setDataFillim(today());
    setDataMbarim(today());
  };

  // ─ List height (fills remaining viewport) ─────────────────────
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const remaining = window.innerHeight - rect.top - 16;
      setListHeight(Math.max(300, Math.min(remaining, window.innerHeight * 0.55)));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [loading]);

  // ─ Excel export ───────────────────────────────────────────────
  const handleExport = async () => {
    if (!filtered.length || exporting) return;
    setExporting(true);
    
    // Yield to the browser's render loop to show "Duke eksportuar..." before freezing
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const headers = [
        "Nr. Rendor", "Data", "Lloji", "Partneri",
        "Nr. Faturës", "Tot. Pa TVSH (€)", "TVSH (€)", "Totali (€)", "Statusi"
      ];
      const data = filtered.map((k) => ({
        "Nr. Rendor": k.nrRendorFatures ?? "",
        "Data": fmtDate(k.dataRegjistrimit),
        "Lloji": TYPE_LABELS[k.llojiKalkulimit] ?? k.llojiKalkulimit,
        "Partneri": k.emriBiznesit ?? "",
        "Nr. Faturës": k.nrFatures ?? "",
        "Tot. Pa TVSH (€)": `${fmt(k.totaliPaTVSH)} €`,
        "TVSH (€)": `${fmt(k.tvsh)} €`,
        "Totali (€)": `${fmt(k.totaliPaTVSH + k.tvsh)} €`,
        "Statusi": k.statusiKalkulimit === "true" ? "I Mbyllur" : "I Hapur",
      }));
      await exportListExcel(
        "Lista e Gjitha Faturave",
        headers,
        data,
        `Faturat_${dataFillim}_${dataMbarim}.xlsx`
      );
    } catch (e) {
      console.error("Export error:", e);
    } finally {
      setExporting(false);
    }
  };

  // ─ Render ─────────────────────────────────────────────────────
  return (
    <>
      <KontrolloAksesinNeFaqe
        roletELejuara={["Menaxher", "Kalkulant", "Financa", "1 Euro Menaxher"]}
      />
      <NavBar />

      <div className="lf-page">
        <div className="lf-inner">

          {/* Hero */}
          <div className="lf-hero">
            <h1>Lista e Gjitha Faturave</h1>
            <p>Pasqyrë e plotë e të gjitha regjistrimeve në sistem</p>
          </div>

          {/* Tab Navigation Pills */}
          <div className="lf-tabs">
            <button
              className={`lf-tab-btn ${activeTab === "lista" ? "active" : ""}`}
              onClick={() => setActiveTab("lista")}
            >
              <FileText size={14} /> Lista e Faturave
            </button>
            <button
              className={`lf-tab-btn ${activeTab === "analitika" ? "active" : ""}`}
              onClick={() => setActiveTab("analitika")}
            >
              <TrendingUp size={14} /> Grafikët & Analitika
            </button>
          </div>

          {/* Filters (Global) */}
          <div className="lf-filters">
            <div className="lf-filter-row" style={{ marginBottom: "0.9rem" }}>
              {/* Date range */}
              <div className="lf-filter-group" style={{ flex: "0 1 150px" }}>
                <label className="lf-filter-label">Data Fillim</label>
                <input
                  type="date"
                  className="lf-input"
                  value={dataFillim}
                  onChange={(e) => setDataFillim(e.target.value)}
                />
              </div>
              <div className="lf-filter-group" style={{ flex: "0 1 150px" }}>
                <label className="lf-filter-label">Data Mbarim</label>
                <input
                  type="date"
                  className="lf-input"
                  value={dataMbarim}
                  onChange={(e) => setDataMbarim(e.target.value)}
                />
              </div>

              {/* Quick date shortcuts */}
              <div className="lf-filter-group" style={{ flex: "0 0 auto", justifyContent: "flex-end" }}>
                <label className="lf-filter-label">&nbsp;</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[
                    { label: "Sot", fn: () => { setDataFillim(today()); setDataMbarim(today()); } },
                    {
                      label: "7 Ditë", fn: () => {
                        const d = new Date(); d.setDate(d.getDate() - 6);
                        setDataFillim(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0]);
                        setDataMbarim(today());
                      }
                    },
                    {
                      label: "30 Ditë", fn: () => {
                        const d = new Date(); d.setDate(d.getDate() - 29);
                        setDataFillim(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0]);
                        setDataMbarim(today());
                      }
                    },
                  ].map((b) => (
                    <button key={b.label} className="lf-btn lf-btn-reset" onClick={b.fn}
                      style={{ padding: "0.5rem 0.75rem", fontSize: "0.72rem" }}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Global text search */}
              <div className="lf-filter-group" style={{ flex: "1 1 220px" }}>
                <label className="lf-filter-label">Kërko</label>
                <div style={{ position: "relative" }}>
                  <Search size={14} style={{
                    position: "absolute", left: "10px", top: "50%",
                    transform: "translateY(-50%)", color: "var(--sp-text-muted,#94a3b8)", pointerEvents: "none"
                  }} />
                  <input
                    type="text"
                    className="lf-input lf-input-search"
                    placeholder="Partneri, nr. fature, pershkrim..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>

              {/* Payment type */}
              <div className="lf-filter-group" style={{ flex: "0 1 140px" }}>
                <label className="lf-filter-label">Lloji Pagesës</label>
                <select
                  className="lf-input"
                  value={filterLlojiPageses}
                  onChange={(e) => setFilterLlojiPageses(e.target.value)}
                  style={{ appearance: "none", cursor: "pointer" }}
                >
                  <option value="Te Gjitha">Të gjitha</option>
                  <option value="Cash">Cash</option>
                  <option value="Banke">Bankë</option>
                  <option value="Borxh">Borxh</option>
                </select>
              </div>

              {/* Status */}
              <div className="lf-filter-group" style={{ flex: "0 1 130px" }}>
                <label className="lf-filter-label">Statusi</label>
                <select
                  className="lf-input"
                  value={filterStatusi}
                  onChange={(e) => setFilterStatusi(e.target.value)}
                  style={{ appearance: "none", cursor: "pointer" }}
                >
                  <option value="Te Gjitha">Të gjitha</option>
                  <option value="I Hapur">I Hapur</option>
                  <option value="I Mbyllur">I Mbyllur</option>
                </select>
              </div>
            </div>

            {/* Type pills */}
            {availableTypes.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
                <span className="lf-filter-label" style={{ marginBottom: 0 }}>Lloji:</span>
                <div className="lf-type-pills">
                  <button
                    className={`lf-type-pill FAT ${isAllActive ? "active" : ""}`}
                    onClick={() => {
                      if (isAllActive) {
                        if (availableTypes.length > 0) {
                          setActiveTypes(new Set([availableTypes[0]]));
                        }
                      } else {
                        setActiveTypes(new Set(ALL_TYPES));
                      }
                    }}
                  >
                    Të Gjitha
                  </button>
                  {availableTypes.map((type) => (
                    <button
                      key={type}
                      className={`lf-type-pill ${type}${activeTypes.has(type) ? " active" : ""}`}
                      onClick={() => toggleType(type)}
                    >
                      {TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tab 1: Clean Tabular Listing */}
          {activeTab === "lista" && (
            <>
              {/* Table actions */}
              <div className="lf-table-actions">
                <div className="lf-result-count">
                  Shfaqen <span>{kpis.count.toLocaleString()}</span> regjistrime
                  {raw.length !== filtered.length && (
                    <> (nga {raw.length.toLocaleString()} gjithsej)</>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <button className="lf-btn lf-btn-reset" onClick={resetFilters}>
                    <RotateCcw size={13} /> Pastro Filtrat
                  </button>
                  <button
                    className="lf-btn lf-btn-excel"
                    onClick={handleExport}
                    disabled={!filtered.length || exporting}
                  >
                    <Sheet size={14} />
                    {exporting ? "Duke eksportuar..." : "Eksporto Excel"}
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="lf-table-wrap">
                {/* Sticky header */}
                <div className="lf-thead">
                  {[
                    { key: "nrRendorFatures", label: "Nr.", cls: "lf-col-nr" },
                    { key: "dataRegjistrimit", label: "Data", cls: "lf-col-data" },
                    { key: "llojiKalkulimit", label: "Lloji" },
                    { key: "emriBiznesit", label: "Partneri", cls: "lf-col-partneri" },
                    { key: "nrFatures", label: "Nr. Faturës" },
                    { key: "totaliPaTVSH", label: "Pa TVSH", cls: "lf-col-totali" },
                    { key: "tvsh", label: "TVSH", cls: "lf-col-tvsh" },
                    { key: "_total", label: "Totali", cls: "lf-col-totali" },
                    { key: "statusiKalkulimit", label: "Statusi" },
                  ].map(({ key, label, cls }) => (
                    <div
                      key={key}
                      className={`lf-th${sortKey === key ? " sorted" : ""}${cls ? ` ${cls}` : ""}`}
                      onClick={() => key !== "_total" && toggleSort(key)}
                    >
                      {label}
                      {key !== "_total" && <SortIcon col={key} />}
                    </div>
                  ))}
                </div>

                {/* Body */}
                {loading ? (
                  <div className="lf-center">
                    <div className="lf-progress-wrap"><div className="lf-progress-bar" /></div>
                    <p>Duke ngarkuar të dhënat...</p>
                  </div>
                ) : (!dataFillim || !dataMbarim) ? (
                  <div className="lf-center">
                    <FileText size={48} style={{ opacity: 0.1 }} />
                    <h3>Vendosni të dyja datat</h3>
                    <p>Ju lutem plotësoni datën e fillimit dhe të mbarimit për të shfaqur faturat.</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="lf-center">
                    <FileText size={48} style={{ opacity: 0.1 }} />
                    <h3>Nuk u gjetën regjistrime</h3>
                    <p>Ndryshoni filtrat ose zgjeroni intervalin e datave.</p>
                  </div>
                ) : (
                  <div ref={containerRef} className="lf-scroll-outer">
                    <List
                      listRef={listRef}
                      rowCount={filtered.length}
                      rowHeight={46}
                      rowProps={{ items: filtered, onRowClick: setSelectedInvoice }}
                      rowComponent={Row}
                      style={{ height: listHeight, width: "100%" }}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tab 2: Dashboard and Interactive Charts */}
          {activeTab === "analitika" && (
            <div className="lf-analytics-view">
              {/* KPI Strip */}
              <div className="lf-kpi-strip">
                <div className="lf-kpi-card emerald">
                  <div className="lf-kpi-label">Totali i Rekordeve</div>
                  <div className="lf-kpi-value">{kpis.count.toLocaleString()}</div>
                </div>
                <div className="lf-kpi-card cyan">
                  <div className="lf-kpi-label">Vlera Totale</div>
                  <div className="lf-kpi-value cyan" style={{ fontSize: "1.15rem" }}>
                    {fmt(kpis.totalValue)} €
                  </div>
                </div>
                {Object.entries(kpis.byType)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([type, count]) => (
                    <div key={type} className={`lf-kpi-card ${TYPE_ACCENT[type] ?? "indigo"}`}>
                      <div className="lf-kpi-label">{TYPE_LABELS[type] ?? type}</div>
                      <div className="lf-kpi-value">{count}</div>
                    </div>
                  ))}
              </div>

              {/* Charts Grid */}
              <div className="lf-charts-grid">
                {/* Daily invoice totals line chart */}
                <div className="lf-chart-card lf-col-8">
                  <div className="lf-chart-header">
                    <h4><TrendingUp size={14} style={{ marginRight: 6, color: "#10b981" }} /> Trendi i Vlerës Ditore (€)</h4>
                    <span className="lf-chart-badge">Koha</span>
                  </div>
                  <div className="lf-chart-container" style={{ height: "260px" }}>
                    {filtered.length === 0 ? (
                      <div className="lf-chart-empty">Nuk ka të dhëna për grafikun</div>
                    ) : (
                      <ChartComponent chartType="line" chartData={dailyData} chartOptions={chartOptions} />
                    )}
                  </div>
                </div>

                {/* Payment methods bar chart */}
                <div className="lf-chart-card lf-col-4">
                  <div className="lf-chart-header">
                    <h4><PieChart size={14} style={{ marginRight: 6, color: "#06b6d4" }} /> Mënyrat e Pagesës</h4>
                    <span className="lf-chart-badge">Vlera</span>
                  </div>
                  <div className="lf-chart-container" style={{ height: "260px" }}>
                    {filtered.length === 0 ? (
                      <div className="lf-chart-empty">Nuk ka të dhëna për grafikun</div>
                    ) : (
                      <ChartComponent chartType="bar" chartData={paymentChartData} chartOptions={chartOptions} />
                    )}
                  </div>
                </div>

                {/* Invoice Type bar chart */}
                <div className="lf-chart-card lf-col-6">
                  <div className="lf-chart-header">
                    <h4><BarChart3 size={14} style={{ marginRight: 6, color: "#6366f1" }} /> Vlera sipas Llojit të Kalkulimit</h4>
                    <span className="lf-chart-badge">Llojet</span>
                  </div>
                  <div className="lf-chart-container" style={{ height: "280px" }}>
                    {filtered.length === 0 ? (
                      <div className="lf-chart-empty">Nuk ka të dhëna për grafikun</div>
                    ) : (
                      <ChartComponent chartType="bar" chartData={typeChartData} chartOptions={chartOptions} />
                    )}
                  </div>
                </div>

                {/* Top lists breakdown */}
                <div className="lf-chart-card lf-col-6">
                  <div className="lf-chart-header">
                    <h4><User size={14} style={{ marginRight: 6, color: "#f59e0b" }} /> Top Partnerët & Operatorët</h4>
                    <span className="lf-chart-badge">Performanca</span>
                  </div>
                  <div className="lf-top-lists-container">
                    <div className="lf-top-list-sec">
                      <h5>Top 5 Partnerët (sipas vlerës)</h5>
                      <div className="lf-top-list">
                        {topPartners.length === 0 ? (
                          <div className="lf-top-list-empty">Nuk ka partnerë në këtë periudhë</div>
                        ) : (
                          topPartners.map((item, idx) => (
                            <div key={idx} className="lf-top-list-item">
                              <span className="lf-item-rank">{idx + 1}</span>
                              <span className="lf-item-name">{item.name}</span>
                              <span className="lf-item-count">{item.count} fat.</span>
                              <span className="lf-item-val">{fmt(item.value)} €</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="lf-top-list-sec">
                      <h5>Top 5 Operatorët (sipas vlerës)</h5>
                      <div className="lf-top-list">
                        {topOperators.length === 0 ? (
                          <div className="lf-top-list-empty">Nuk ka operatorë aktivë</div>
                        ) : (
                          topOperators.map((item, idx) => (
                            <div key={idx} className="lf-top-list-item">
                              <span className="lf-item-rank">{idx + 1}</span>
                              <span className="lf-item-name">{item.name}</span>
                              <span className="lf-item-count">{item.count} regj.</span>
                              <span className="lf-item-val">{fmt(item.value)} €</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Note */}
          {filtered.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "1rem", color: "var(--sp-text-muted,#94a3b8)", fontSize: "0.75rem" }}>
              <TrendingUp size={12} style={{ marginRight: "4px" }} />
              Kjo faqe është vetëm-lexim. Për veprime, navigoni tek faqet specifike të secilit tip.
            </div>
          )}

        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      {selectedInvoice && (
        <div className="lf-drawer-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="lf-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="lf-drawer-header">
              <h3>Detajet e Faturës</h3>
              <button className="lf-drawer-close" onClick={() => setSelectedInvoice(null)}>
                <X size={18} />
              </button>
            </div>

             <div className="lf-drawer-body">

              {/* Top identity + meta strip */}
              <div className="lf-invoice-topbar">
                <div className="lf-invoice-topbar-id">
                  <span className={`lf-type-badge ${selectedInvoice.llojiKalkulimit}`}>
                    {TYPE_LABELS[selectedInvoice.llojiKalkulimit] ?? selectedInvoice.llojiKalkulimit}
                  </span>
                  <div>
                    <h4 className="lf-drawer-title">{selectedInvoice.emriBiznesit || "Partner i Panjohur"}</h4>
                    {selectedInvoice.idPartneri && <div className="lf-drawer-meta">ID e Partnerit: {selectedInvoice.idPartneri}</div>}
                  </div>
                </div>
                <div className="lf-invoice-topbar-status">
                  {selectedInvoice.statusiKalkulimit === "true" ? (
                    <span className="lf-status closed"><Lock size={12} /> I Mbyllur</span>
                  ) : (
                    <span className="lf-status open"><Unlock size={12} /> I Hapur</span>
                  )}
                </div>
              </div>

              <div className="lf-meta-chip-row">
                <div className="lf-meta-chip">
                  <Sheet size={12} /><span>Nr. Faturës</span>
                  <strong className="mono">{selectedInvoice.nrFatures || "—"}</strong>
                </div>
                <div className="lf-meta-chip">
                  <TrendingUp size={12} /><span>Nr. Rendor</span>
                  <strong className="mono">{selectedInvoice.nrRendorFatures ?? "—"}</strong>
                </div>
                <div className="lf-meta-chip">
                  <Calendar size={12} /><span>Data &amp; Ora</span>
                  <strong>
                    {fmtDate(selectedInvoice.dataRegjistrimit)}
                    {selectedInvoice.dataRegjistrimit &&
                      ` ${new Date(selectedInvoice.dataRegjistrimit).toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" })}`}
                  </strong>
                </div>
                <div className="lf-meta-chip">
                  <CreditCard size={12} /><span>Pagesa</span>
                  <strong className="text-info">{selectedInvoice.llojiPageses || "Tjetër"}</strong>
                </div>
                <div className="lf-meta-chip">
                  <User size={12} /><span>Operatori</span>
                  <strong>{selectedInvoice.username || "—"}</strong>
                </div>
              </div>

              {/* Main content: items table + financial summary side by side */}
              {/* Items table — full width so all columns are visible without clipping */}
              <div className="lf-drawer-section lf-items-section">
                <h5 className="lf-drawer-sec-title">
                  <Package size={13} style={{ marginRight: 6, verticalAlign: "-2px" }} />
                  Artikujt e Faturës {invoiceItemRows.length > 0 && `(${invoiceItemRows.length})`}
                </h5>

                {itemsLoading ? (
                  <div className="lf-items-state">
                    <div className="lf-progress-wrap"><div className="lf-progress-bar" /></div>
                    <p>Duke ngarkuar artikujt...</p>
                  </div>
                ) : itemsError ? (
                  <div className="lf-items-state">
                    <AlertCircle size={28} style={{ opacity: 0.4 }} />
                    <p>Nuk u arrit të ngarkohen artikujt e faturës.</p>
                  </div>
                ) : invoiceItemRows.length === 0 ? (
                  <div className="lf-items-state">
                    <Package size={28} style={{ opacity: 0.15 }} />
                    <p>Kjo faturë nuk ka artikuj të regjistruar.</p>
                  </div>
                ) : (
                  <div className="lf-items-table-wrap">
                    <table className="lf-items-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Emërtimi</th>
                          <th>Njm</th>
                          <th className="right">Sasia</th>
                          <th className="right">Çmimi (pa TVSH)</th>
                          <th className="right">Rabati</th>
                          <th className="right">TVSH %</th>
                          <th className="right">TVSH €</th>
                          <th className="right">Shuma €</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceItemRows.map((row, idx) => (
                          <tr key={idx}>
                            <td className="muted">{idx + 1}</td>
                            <td className="bold">{row.produkti.emriProduktit || "—"}</td>
                            <td className="muted">{row.produkti.emriNjesiaMatese || "—"}</td>
                            <td className="right mono">{fmt(row.sasia)}</td>
                            <td className="right mono">{fmt(row.qmimiPaTVSH)} €</td>
                            <td className="right mono">
                              {row.rabatiTotal > 0 ? `${fmt(row.rabatiTotal)} %` : "—"}
                            </td>
                            <td className="right mono">{fmt(row.tvshRate)} %</td>
                            <td className="right mono">{fmt(row.tvshValue)} €</td>
                            <td className="right mono bold emerald">{fmt(row.shuma)} €</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={8} className="right bold">Totali Artikujve:</td>
                          <td className="right mono bold emerald">{fmt(invoiceItemsTotal)} €</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Financial summary + notes, side by side below the items table */}
              <div className="lf-modal-columns">
                <div className="lf-modal-col-left">
                  <div className="lf-drawer-section">
                    <h5 className="lf-drawer-sec-title">Shënime / Përshkrim Shtesë</h5>
                    <p className="lf-drawer-desc">{selectedInvoice.pershkrimShtese || "Nuk ka shënime shtesë për këtë faturë."}</p>
                  </div>
                </div>

                <div className="lf-modal-col-right">
                  <div className="lf-drawer-section" style={{ height: "100%" }}>
                    <h5 className="lf-drawer-sec-title">Përmbledhja Financiare</h5>
                    <div className="lf-drawer-financials">
                      <div className="lf-fin-row">
                        <span>Totali Pa TVSH:</span>
                        <span className="mono">{fmt(selectedInvoice.totaliPaTVSH)} €</span>
                      </div>
                      <div className="lf-fin-row">
                        <span>TVSH:</span>
                        <span className="mono">{fmt(selectedInvoice.tvsh)} €</span>
                      </div>
                      {parseFloat(selectedInvoice.rabati || 0) > 0 && (
                        <div className="lf-fin-row text-warning">
                          <span><Percent size={11} style={{ marginRight: 4 }} /> Rabati (Zbritje):</span>
                          <span className="mono">-{fmt(selectedInvoice.rabati)} %</span>
                        </div>
                      )}
                      {parseFloat(selectedInvoice.transporti || 0) > 0 && (
                        <div className="lf-fin-row text-info">
                          <span><Truck size={11} style={{ marginRight: 4 }} /> Kostot e Transportit:</span>
                          <span className="mono">+{fmt(selectedInvoice.transporti)} €</span>
                        </div>
                      )}
                      <div className="lf-fin-row lf-fin-total">
                        <span>Totali i Faturës:</span>
                        <span className="mono">{fmt(parseFloat(selectedInvoice.totaliPaTVSH || 0) + parseFloat(selectedInvoice.tvsh || 0))} €</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ListaFaturave;
