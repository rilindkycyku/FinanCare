import { useState } from "react";
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";
import { Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTags,
  faFilePdf,
  faXmark,
  faCalendarDays,
  faPercent,
  faArrowDown,
  faLayerGroup
} from "@fortawesome/free-solid-svg-icons";

/* ─── Inline styles ─────────────────────────────────────────────── */
const S = {
  overlay: { background: "linear-gradient(180deg,#0f1827 0%,#080f1a 100%)" },
  statsBar: { display: "flex", gap: "0.85rem", marginBottom: "1.25rem", flexWrap: "wrap" },
  statChip: {
    flex: "1 1 110px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px",
    padding: "0.7rem 0.9rem",
    display: "flex", alignItems: "center", gap: "0.6rem", minWidth: "100px",
  },
  statIcon: (bg) => ({
    width: 34, height: 34, borderRadius: 9, background: bg, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.85rem", color: "#fff",
  }),
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "0.75rem", maxHeight: "400px", overflowY: "auto", paddingRight: "4px",
  },
  card: {
    background: "#0f1827", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "13px", padding: "0.9rem", display: "flex",
    flexDirection: "column", gap: "0.45rem",
    transition: "border-color 0.2s ease, transform 0.2s ease", cursor: "default",
  },
  cardTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" },
  productName: { fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9", lineHeight: 1.3, flex: 1 },
  discountBadge: {
    background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff",
    fontWeight: 800, fontSize: "0.78rem", padding: "0.22rem 0.55rem",
    borderRadius: "8px", whiteSpace: "nowrap", flexShrink: 0,
    boxShadow: "0 4px 12px rgba(239,68,68,0.35)",
  },
  priceRow: { display: "flex", alignItems: "center", gap: "0.45rem", marginTop: "0.15rem" },
  oldPrice: { fontSize: "0.83rem", color: "#94a3b8", textDecoration: "line-through" },
  arrow: { color: "#10b981", fontSize: "0.68rem" },
  newPrice: { fontSize: "1.05rem", fontWeight: 800, color: "#10b981" },
  datePill: {
    display: "inline-flex", alignItems: "center", gap: "0.35rem",
    background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.18)",
    borderRadius: "7px", padding: "0.18rem 0.5rem",
    fontSize: "0.68rem", color: "#67e8f9", fontWeight: 600,
  },
  barcodePill: {
    display: "inline-flex", alignItems: "center", gap: "0.35rem",
    background: "rgba(148,163,184,0.07)", border: "1px solid rgba(148,163,184,0.12)",
    borderRadius: "6px", padding: "0.15rem 0.45rem",
    fontSize: "0.65rem", color: "#94a3b8", fontFamily: "monospace",
  },
  emptyState: { gridColumn: "1 / -1", textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" },
};

const pct = (normal, sale) => {
  if (!normal || normal === 0) return "0";
  return (((normal - sale) / normal) * 100).toFixed(1);
};

/* ─── PDF Generator ──────────────────────────────────────────────── */
const generatePDF = (storeName, products) => {
  const doc = new jsPDF("p", "mm", "a4");

  // 2 columns x 4 rows = 8 large labels per page
  const columns = 2;
  const rows = 4;
  const margin = 4;
  const gutter = 3;

  const lw = (210 - margin * 2 - gutter * (columns - 1)) / columns; // ~99.5mm
  const lh = (297 - margin * 2 - gutter * (rows - 1)) / rows;       // ~70mm
  const p = 3;

  // Left section = 75%, right section = 25%
  const leftW = lw * 0.75;  // ~74.6mm
  const rightW = lw - leftW; // ~24.9mm

  let xPos = margin;
  let yPos = margin;
  let count = 0;

  // Helper to get optimal font size for a single line
  const getOptimalFontSize = (text, maxWidth, maxFontSize, minFontSize) => {
    const scaleFactor = doc.internal.scaleFactor;
    let fontSize = maxFontSize;
    while (fontSize >= minFontSize) {
      const textWidth = (doc.getStringUnitWidth(text) * fontSize) / scaleFactor;
      if (textWidth <= maxWidth) {
        return fontSize;
      }
      fontSize -= 0.5;
    }
    return minFontSize;
  };

  // Helper to get optimal font size for multi-line product name
  const getOptimalFontSizeForName = (text, maxWidth, maxHeight, maxFontSize = 16, minFontSize = 8) => {
    const scaleFactor = doc.internal.scaleFactor;
    let fontSize = maxFontSize;
    while (fontSize >= minFontSize) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      
      const totalHeight = lines.length * (fontSize / scaleFactor) * 1.25;
      if (lines.length <= 2 && totalHeight <= maxHeight) {
        let fits = true;
        for (const line of lines) {
          const lineWidth = (doc.getStringUnitWidth(line) * fontSize) / scaleFactor;
          if (lineWidth > maxWidth) {
            fits = false;
            break;
          }
        }
        if (fits) {
          return { fontSize, lines };
        }
      }
      fontSize -= 0.5;
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(minFontSize);
    const lines = doc.splitTextToSize(text, maxWidth).slice(0, 2);
    return { fontSize: minFontSize, lines };
  };

  products.forEach((product) => {
    if (count !== 0 && count % (columns * rows) === 0) {
      doc.addPage();
      xPos = margin;
      yPos = margin;
    }

    const cx = xPos;
    const cy = yPos;

    /* ── White fill + border ── */
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cx, cy, lw, lh, 2, 2, "F");
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.25);
    doc.roundedRect(cx, cy, lw, lh, 2, 2);

    /* ── Red header (full width, 9mm) ── */
    doc.setFillColor(210, 20, 20);
    doc.roundedRect(cx, cy, lw, 9, 2, 2, "F");
    doc.rect(cx, cy + 5, lw, 4, "F"); // flatten bottom corners

    /* ── "ZBRITJE" — plain ASCII, no unicode symbols ── */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text("ZBRITJE", cx + lw / 2, cy + 6.3, { align: "center" });

    /* ── Vertical divider between left/right sections ── */
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(cx + leftW, cy + 10, cx + leftW, cy + lh - 2);

    /* ════ LEFT SECTION (75%) ════ */

    /* Product name — wrapped and scaled dynamically (no store name to save vertical space) */
    const nameMaxWidth = leftW - p * 2;
    const nameMaxHeight = 15;
    const { fontSize: nameFontSize, lines: nameLines } = getOptimalFontSizeForName(
      product.name,
      nameMaxWidth,
      nameMaxHeight,
      15, // maxFontSize
      8   // minFontSize
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(nameFontSize);
    doc.setTextColor(15, 15, 15);
    doc.text(nameLines, cx + p, cy + 15.5);

    /* Separator under name */
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.18);
    doc.line(cx + p, cy + 30, cx + leftW - p, cy + 30);

    /* Old price (strikethrough, red) */
    const oldStr = `${parseFloat(product.normalPrice).toFixed(2)} €`;
    const oldPriceMaxWidth = leftW - p * 2;
    const oldFontSize = getOptimalFontSize(oldStr, oldPriceMaxWidth, 32, 16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(oldFontSize);
    doc.setTextColor(180, 20, 20);
    doc.text(oldStr, cx + p, cy + 42);

    // Draw strikethrough line dynamically over the text
    const oldW = doc.getTextWidth(oldStr);
    doc.setDrawColor(180, 20, 20);
    doc.setLineWidth(0.9);
    doc.line(cx + p, cy + 42, cx + p + oldW, cy + 36);

    /* New price — HUGE green, scaled dynamically */
    const newStr = `${parseFloat(product.salePrice).toFixed(2)} €`;
    const newPriceMaxWidth = leftW - p * 2;
    const newFontSize = getOptimalFontSize(newStr, newPriceMaxWidth, 62, 28);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(newFontSize);
    doc.setTextColor(5, 130, 55);
    doc.text(newStr, cx + p, cy + lh - p - 3);

    /* ════ RIGHT SECTION (25%) ════ */
    const rx = cx + leftW;
    const rcx = rx + rightW / 2; // center x of right section

    /* "RABAT" label */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(140, 140, 140);
    doc.text("ZBRITJE", rcx, cy + 15, { align: "center" });

    /* Discount % — large red, scaled dynamically */
    const discount = pct(product.normalPrice, product.salePrice);
    const discountStr = `-${discount}%`;
    const discountMaxWidth = rightW - 4;
    const discountFontSize = getOptimalFontSize(discountStr, discountMaxWidth, 20, 11);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(discountFontSize);
    doc.setTextColor(200, 15, 15);
    doc.text(discountStr, rcx, cy + 26, { align: "center" });

    /* Separator */
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.15);
    doc.line(rx + 2, cy + 29, rx + rightW - 2, cy + 29);

    /* Barcode */
    const barcodeVal = product.barcode ? product.barcode.toString().trim() : null;
    if (barcodeVal) {
      try {
        const canvas = document.createElement("canvas");
        JsBarcode(canvas, barcodeVal, {
          format: "CODE128",
          width: 3,
          height: 90,
          displayValue: false,
          margin: 0,
          background: "#ffffff",
        });
        const imgData = canvas.toDataURL("image/png");
        const bcW = rightW - 4;  // fill available width
        const bcH = 23;
        const bcX = rx + 2;
        const bcY = cy + 33;
        doc.addImage(imgData, "PNG", bcX, bcY, bcW, bcH);

        // Barcode digits
        doc.setFont("courier", "bold");
        doc.setFontSize(6);
        doc.setTextColor(50, 50, 50);
        doc.text(barcodeVal, rcx, cy + lh - p - 3, { align: "center" });
      } catch { /* skip */ }
    }

    // Advance
    count++;
    if (count % columns === 0) {
      xPos = margin;
      yPos += lh + gutter;
    } else {
      xPos += lw + gutter;
    }
  });

  doc.save("EtiketatZbritjes.pdf");
};

/* ─── Component ─────────────────────────────────────────────────── */
const SalesLabel = ({ storeName, products }) => {
  const [showModal, setShowModal] = useState(false);

  const total = products?.length ?? 0;
  const avgDisc =
    total > 0
      ? (products.reduce((s, p) => s + parseFloat(pct(p.normalPrice, p.salePrice)), 0) / total).toFixed(1)
      : 0;
  const maxSave =
    total > 0
      ? Math.max(...products.map((p) => p.normalPrice - p.salePrice)).toFixed(2)
      : "0.00";

  return (
    <>
      {/* ── Trigger ── */}
      <Button
        className="btn-save px-4 d-flex align-items-center gap-2 mt-3"
        onClick={() => setShowModal(true)}
        style={{ fontWeight: 800 }}
      >
        <FontAwesomeIcon icon={faTags} />
        Shtyp Etiketat e Zbritjes
      </Button>

      {/* ── Modal ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered className="sp-modal">

        {/* Header */}
        <Modal.Header closeButton style={{
          background: "linear-gradient(135deg,#0f1827,#162033)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "1.2rem 1.5rem",
        }}>
          <Modal.Title className="d-flex align-items-center gap-3" style={{ fontWeight: 900, fontSize: "1.05rem" }}>
            <span style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg,#ef4444,#b91c1c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 18px rgba(239,68,68,0.4)",
            }}>
              <FontAwesomeIcon icon={faTags} style={{ color: "#fff", fontSize: "0.95rem" }} />
            </span>
            <div>
              <div style={{ color: "#f1f5f9" }}>Etiketat e Zbritjeve</div>
              <div style={{ fontSize: "0.7rem", fontWeight: 500, color: "#64748b", marginTop: 2 }}>
                Konfirmoni produktet · Formati A4 · 3 × 7 = 21 etiketa / faqe
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>

        {/* Body */}
        <Modal.Body style={{ ...S.overlay, padding: "1.4rem" }}>

          {/* Stats bar */}
          <div style={S.statsBar}>
            {[
              { label: "Produkte", value: total, color: "linear-gradient(135deg,#ef4444,#b91c1c)", icon: faLayerGroup, vColor: "#f1f5f9" },
              { label: "Rab. mesatar", value: `${avgDisc}%`, color: "linear-gradient(135deg,#10b981,#059669)", icon: faPercent, vColor: "#10b981" },
              { label: "Kursimi max", value: `${maxSave}€`, color: "linear-gradient(135deg,#06b6d4,#0891b2)", icon: faArrowDown, vColor: "#06b6d4" },
              { label: "Faqe PDF", value: `~${Math.ceil(total / 21)}`, color: "linear-gradient(135deg,#8b5cf6,#7c3aed)", icon: faFilePdf, vColor: "#c4b5fd" },
            ].map(({ label, value, color, icon, vColor }) => (
              <div key={label} style={S.statChip}>
                <div style={S.statIcon(color)}>
                  <FontAwesomeIcon icon={icon} />
                </div>
                <div>
                  <div style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 900, color: vColor, lineHeight: 1.1 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: "1.1rem" }} />

          {/* Product grid */}
          <div style={S.grid} className="custom-scrollbar">
            {total > 0 ? products.map((item, i) => {
              const disc = pct(item.normalPrice, item.salePrice);
              return (
                <div
                  key={i}
                  style={S.card}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={S.cardTop}>
                    <span style={S.productName}>{item.name}</span>
                    <span style={S.discountBadge}>-{disc}%</span>
                  </div>
                  <div style={S.priceRow}>
                    <span style={S.oldPrice}>{parseFloat(item.normalPrice).toFixed(2)}€</span>
                    <FontAwesomeIcon icon={faArrowDown} style={S.arrow} />
                    <span style={S.newPrice}>{parseFloat(item.salePrice).toFixed(2)}€</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.1rem" }}>
                    <span style={S.datePill}>
                      <FontAwesomeIcon icon={faCalendarDays} />
                      {item.dataZbritjes} → {item.dataSkadimit}
                    </span>
                    {item.barcode && (
                      <span style={S.barcodePill}>{item.barcode}</span>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div style={S.emptyState}>
                <div style={{ fontSize: "2.2rem", opacity: 0.35, marginBottom: "0.65rem" }}>
                  <FontAwesomeIcon icon={faTags} />
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#64748b" }}>Nuk ka oferta aktive</div>
              </div>
            )}
          </div>
        </Modal.Body>

        {/* Footer */}
        <Modal.Footer style={{
          background: "linear-gradient(135deg,#0f1827,#162033)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "0.9rem 1.5rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: "0.72rem", color: "#475569" }}>
            <FontAwesomeIcon icon={faLayerGroup} className="me-1" />
            {total} etiket{total !== 1 ? "a" : "ë"} · {Math.ceil(total / 21)} faqe A4
          </span>

          <div className="d-flex gap-2">
            <Button className="btn-cancel px-4" onClick={() => setShowModal(false)} style={{ fontWeight: 700 }}>
              <FontAwesomeIcon icon={faXmark} className="me-2" />
              Anulo
            </Button>
            <Button
              disabled={total === 0}
              onClick={() => { generatePDF(storeName, products); setShowModal(false); }}
              style={{
                background: total === 0 ? "rgba(239,68,68,0.3)" : "linear-gradient(135deg,#ef4444,#dc2626)",
                border: "none", color: "#fff", fontWeight: 800, borderRadius: 10,
                boxShadow: total > 0 ? "0 6px 20px rgba(239,68,68,0.35)" : "none",
                padding: "0.55rem 1.4rem",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { if (total) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(239,68,68,0.5)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(239,68,68,0.35)"; }}
            >
              <FontAwesomeIcon icon={faFilePdf} className="me-2" />
              Gjenero PDF
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SalesLabel;
