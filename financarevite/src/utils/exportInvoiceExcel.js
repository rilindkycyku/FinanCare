import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import axios from "axios";

// ── Colours (matching the app's dark-green theme) ────────────────
const CLR = {
  headerBg: "FF0D2137", // dark navy  (--pos-surface-2)
  headerFg: "FFFFFFFF", // white
  titleBg: "FF0A6640", // deep green (--pos-emerald-dark-ish)
  titleFg: "FFFFFFFF",
  labelFg: "FF94A3B8", // soft grey
  valueFg: "FFF1F5F9", // near-white
  rowAlt: "FF111D2E", // surface-2
  rowEven: "FF0D1520", // surface
  totBg: "FF059669", // emerald
  totFg: "FFFFFFFF",
  border: "FF1E3A5F",
  tableHead: "FF10B981", // emerald green
  tableHeadFg: "FF000000",
};

const border = (color = CLR.border) => ({
  top: { style: "thin", color: { argb: color } },
  left: { style: "thin", color: { argb: color } },
  bottom: { style: "thin", color: { argb: color } },
  right: { style: "thin", color: { argb: color } },
});

const fill = (argb) => ({ type: "pattern", pattern: "solid", fgColor: { argb } });

const font = (bold = false, color = CLR.valueFg, size = 11) => ({
  bold, color: { argb: color }, size, name: "Calibri",
});

/**
 * Exports a styled invoice + products Excel using ExcelJS.
 * Mirrors the "Te Dhenat e Fatures" UI layout.
 */
export async function exportInvoiceExcel(teDhenatFat, produktet, biznesit) {
  let biz = biznesit;
  if (!biz) {
    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
      const res = await axios.get(`${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      biz = res.data;
    } catch (err) {
      console.error("Error fetching business info inside export utility:", err);
    }
  }

  const shopName = biz?.emriIBiznesit || "FinanCare POS";
  const shopNUI = `NUI: ${biz?.nui || "–"} / NF: ${biz?.nf || "–"} / TVSH: ${biz?.nrTVSH || "–"}`;
  const shopContact = `${biz?.adresa || "–"} / ${biz?.nrKontaktit || "–"}`;

  const reg = teDhenatFat?.regjistrimet ?? {};
  const nrFat = reg.nrFatures || "–";
  const partneri = reg.emriBiznesit || "–";
  const dataFat = reg.dataRegjistrimit
    ? new Date(reg.dataRegjistrimit).toLocaleDateString("en-GB")
    : "–";
  const llojiPag = reg.llojiPageses || "–";
  const statPag = reg.statusiPageses || "–";
  const person = reg.username || "–";
  const nrKalk = reg.nrRendorFatures ?? "–";
  const statKalk = reg.statusiKalkulimit === "true" ? "I Mbyllur" : "I Hapur";

  const fmt = (v) => `${parseFloat(v || 0).toFixed(2)} €`;
  const totPaTVSH = fmt(teDhenatFat?.totaliPaTVSH);
  const totMeTVSH = fmt(teDhenatFat?.totaliMeTVSH);
  const rabati = fmt(teDhenatFat?.rabati);
  const totPa8 = fmt(teDhenatFat?.totaliPaTVSH8);
  const totPa18 = fmt(teDhenatFat?.totaliPaTVSH18);
  const tvsh8 = fmt(teDhenatFat?.tvsH8);
  const tvsh18 = fmt(teDhenatFat?.tvsH18);

  // ── Workbook ─────────────────────────────────────────────────
  const wb = new ExcelJS.Workbook();
  wb.creator = "FinanCare";
  wb.created = new Date();

  const ws = wb.addWorksheet(`Fatura ${nrFat}`, {
    views: [{ state: "frozen", ySplit: 9 }],   // freeze above products table
    properties: { tabColor: { argb: CLR.tableHead } },
  });

  // Column widths  A  B  C  D  E  F  G  H  I
  ws.columns = [
    { width: 6 }, // A  Nr.
    { width: 28 }, // B  ID & Emri
    { width: 10 }, // C  Sasia
    { width: 16 }, // D  Çm. Bleres
    { width: 16 }, // E  Çm. Shites
    { width: 20 }, // F  Tot. Bleres
    { width: 20 }, // G  Tot. Shites
    { width: 14 }, // H  (spare / right info col 2)
    { width: 22 }, // I  (spare / right info col value)
  ];

  // ── ROW 1: Title ─────────────────────────────────────────────
  const titleRow = ws.addRow(["Te Dhenat e Faturës", "", "", "", "", "", "", "", ""]);
  ws.mergeCells("A1:I1");
  titleRow.height = 32;
  const titleCell = titleRow.getCell("A");
  titleCell.value = "Te Dhenat e Faturës";
  titleCell.font = { bold: true, color: { argb: CLR.titleFg }, size: 16, name: "Calibri" };
  titleCell.fill = fill(CLR.titleBg);
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  // ── ROW 2: blank ─────────────────────────────────────────────
  ws.addRow([]).height = 6;

  // ── ROWS 3–7: Info block (3 columns of label/value pairs) ────
  const infoData = [
    // [colA-label, colA-value, colD-label, colD-value, colH-label, colH-value]
    ["Faturuesi:", shopName, "Partneri:", partneri, "Totali Pa TVSH:", totPaTVSH],
    ["NUI/NF/TVSH:", shopNUI, "Nr. Faturës:", nrFat, "Totali Me TVSH:", totMeTVSH],
    ["Adresa/Tel:", shopContact, "Data Faturës:", dataFat, "Mënyra Pagesës:", `${llojiPag} (${statPag})`],
    ["Personi:", person, "Nr. Rendor:", nrKalk, "Statusi:", statKalk],
    ["Rabati:", rabati, "TVSH 8% (Pa/Vlerë):", `${totPa8} / ${tvsh8}`, "TVSH 18% (Pa/Vlerë):", `${totPa18} / ${tvsh18}`],
  ];

  infoData.forEach(([lA, vA, lD, vD, lH, vH]) => {
    const row = ws.addRow([lA, vA, "", lD, vD, "", "", lH, vH]);
    row.height = 20;
    row.getCell("A").fill = fill(CLR.headerBg);
    row.getCell("A").font = font(true, CLR.labelFg);
    row.getCell("B").fill = fill(CLR.headerBg);
    row.getCell("B").font = font(false, CLR.valueFg);
    row.getCell("D").fill = fill(CLR.headerBg);
    row.getCell("D").font = font(true, CLR.labelFg);
    row.getCell("E").fill = fill(CLR.headerBg);
    row.getCell("E").font = font(false, CLR.valueFg);
    row.getCell("H").fill = fill(CLR.headerBg);
    row.getCell("H").font = font(true, CLR.labelFg);
    row.getCell("I").fill = fill(CLR.headerBg);
    row.getCell("I").font = font(false, CLR.valueFg);
    // Fill remaining cols same bg
    ["C", "F", "G"].forEach(c => {
      row.getCell(c).fill = fill(CLR.headerBg);
    });
  });

  // ── ROW 8: blank ─────────────────────────────────────────────
  const blankRow = ws.addRow([]);
  blankRow.height = 8;
  ["A", "B", "C", "D", "E", "F", "G", "H", "I"].forEach(c => blankRow.getCell(c).fill = fill(CLR.headerBg));

  // ── ROW 10: Table header ──────────────────────────────────────
  const tHead = ws.addRow([
    "Nr.", "ID dhe Emri", "Sasia",
    "Çm. Bleres (€)", "Çm. Shites (€)",
    "Tot. Bleres (€)", "Tot. Shites (€)", "", "",
  ]);
  tHead.height = 22;
  ["A", "B", "C", "D", "E", "F", "G"].forEach(c => {
    const cell = tHead.getCell(c);
    cell.fill = fill(CLR.tableHead);
    cell.font = font(true, CLR.tableHeadFg, 11);
    cell.border = border(CLR.border);
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // ── Product rows ──────────────────────────────────────────────
  let sumBleres = 0, sumShites = 0;

  produktet.forEach((p, idx) => {
    const totB = p.sasiaStokut * parseFloat(p.qmimiBleres || 0);
    const totS = p.sasiaStokut * parseFloat(p.qmimiShites || 0);
    sumBleres += totB;
    sumShites += totS;

    const bgArgb = idx % 2 === 0 ? CLR.rowEven : CLR.rowAlt;
    const row = ws.addRow([
      idx + 1,
      `${p.idProduktit} - ${p.emriProduktit}`,
      p.sasiaStokut,
      parseFloat(p.qmimiBleres).toFixed(2),
      parseFloat(p.qmimiShites).toFixed(2),
      totB.toFixed(2),
      totS.toFixed(2),
      "", "",
    ]);
    row.height = 18;
    ["A", "B", "C", "D", "E", "F", "G"].forEach(c => {
      const cell = row.getCell(c);
      cell.fill = fill(bgArgb);
      cell.font = font(false, CLR.valueFg);
      cell.border = border();
      if (["C", "D", "E", "F", "G"].includes(c)) {
        cell.alignment = { horizontal: "right" };
      }
    });
  });

  // ── Totals row ────────────────────────────────────────────────
  const totRow = ws.addRow([
    "", "TOTALI", "",
    "", "",
    sumBleres.toFixed(2),
    sumShites.toFixed(2),
    "", "",
  ]);
  totRow.height = 22;
  ["A", "B", "C", "D", "E", "F", "G"].forEach(c => {
    const cell = totRow.getCell(c);
    cell.fill = fill(CLR.totBg);
    cell.font = font(true, CLR.totFg, 11);
    cell.border = border("FF047857");
    if (["F", "G"].includes(c)) cell.alignment = { horizontal: "right" };
  });

  // ── Branding & Copyright ─────────────────────────────────────
  ws.addRow([]);
  const brandRow = ws.addRow([
    "© FinanCare - POS, eOrder & More by Rilind Kyçyku",
    "", "", "", "", "",
    "WWW.RILINDKYCYKU.DEV"
  ]);
  brandRow.height = 20;
  ws.mergeCells(brandRow.number, 1, brandRow.number, 4);
  ws.mergeCells(brandRow.number, 5, brandRow.number, 7);

  const leftCell = brandRow.getCell(1);
  leftCell.font = { italic: true, size: 9, color: { argb: "FF94A3B8" }, name: "Calibri" };
  leftCell.alignment = { horizontal: "left", vertical: "middle" };

  const rightCell = brandRow.getCell(7);
  rightCell.font = { bold: true, size: 9, color: { argb: "FF10B981" }, name: "Calibri" };
  rightCell.alignment = { horizontal: "right", vertical: "middle" };

  // ── Save ─────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  }), `Fatura_${nrFat}_Produktet.xlsx`);
}

/**
 * Exports a styled Kartela Financiare Excel using ExcelJS.
 */
export async function exportKartelaExcel(partner, tableRows, totals, partnerName, biznesit) {
  let biz = biznesit;
  if (!biz) {
    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
      const res = await axios.get(`${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      biz = res.data;
    } catch (err) {
      console.error("Error fetching business info inside export utility:", err);
    }
  }

  const shopName = biz?.emriIBiznesit || "FinanCare POS";
  const shopNUI = `NUI: ${biz?.nui || "–"} / NF: ${biz?.nf || "–"} / TVSH: ${biz?.nrTVSH || "–"}`;
  const shopContact = `${biz?.adresa || "–"} / ${biz?.nrKontaktit || "–"}`;

  const sanitize = (name = "") => name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[çÇ]/g, "C").replace(/[ëË]/g, "E")
    .replace(/\./g, "")
    .replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

  const fileNamePartner = sanitize(partnerName || partner?.emriBiznesit || "Partneri");
  const dateStr = new Date().toLocaleDateString("sq-AL").replace(/\./g, "-");

  const fmt = (v) => `${parseFloat(v || 0).toFixed(2)} €`;

  const wb = new ExcelJS.Workbook();
  wb.creator = "FinanCare";
  wb.created = new Date();

  const ws = wb.addWorksheet(`Kartela Financiare`, {
    views: [{ state: "frozen", ySplit: 7 }],
    properties: { tabColor: { argb: CLR.tableHead } },
  });

  // Column widths A B C D E F G H
  ws.columns = [
    { width: 8 }, // A NR.
    { width: 14 }, // B Data
    { width: 10 }, // C Lloji
    { width: 16 }, // D Nr. Faturës
    { width: 32 }, // E Përshkrimi
    { width: 18 }, // F Faturim €
    { width: 18 }, // G Pagesë €
    { width: 18 }, // H Saldo €
  ];

  // Title Row
  const titleRow = ws.addRow(["Kartela Financiare", "", "", "", "", "", "", ""]);
  ws.mergeCells("A1:H1");
  titleRow.height = 32;
  const titleCell = titleRow.getCell("A");
  titleCell.font = { bold: true, color: { argb: CLR.titleFg }, size: 16, name: "Calibri" };
  titleCell.fill = fill(CLR.titleBg);
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  // Blank row
  ws.addRow([]).height = 6;

  // Metadata Info rows
  const nuiNrf = `${partner?.nui || "–"} / ${partner?.nrf || "–"}`;
  const address = partner?.adresa || "–";
  const contact = partner?.nrKontaktit || "–";

  const infoData = [
    ["Kompani:", shopName, "Partneri:", partner?.emriBiznesit || partnerName || "–", "Tot. Hyrje:", fmt(totals.totHyrje)],
    ["Regjistri:", shopNUI, "NUI / NRF:", nuiNrf, "Tot. Dalje:", fmt(totals.totDalje)],
    ["Adresa/Tel:", shopContact, "Adresa/Tel:", `${address} / ${contact}`, "Saldo:", fmt(totals.saldo)],
  ];

  infoData.forEach(([lA, vA, lD, vD, lG, vG]) => {
    const row = ws.addRow([lA, vA, "", lD, vD, "", lG, vG]);
    row.height = 20;
    row.getCell("A").fill = fill(CLR.headerBg);
    row.getCell("A").font = font(true, CLR.labelFg);
    row.getCell("B").fill = fill(CLR.headerBg);
    row.getCell("B").font = font(false, CLR.valueFg);
    row.getCell("D").fill = fill(CLR.headerBg);
    row.getCell("D").font = font(true, CLR.labelFg);
    row.getCell("E").fill = fill(CLR.headerBg);
    row.getCell("E").font = font(false, CLR.valueFg);
    row.getCell("G").fill = fill(CLR.headerBg);
    row.getCell("G").font = font(true, CLR.labelFg);
    row.getCell("H").fill = fill(CLR.headerBg);
    row.getCell("H").font = font(false, CLR.valueFg);

    ["C", "F"].forEach(c => {
      row.getCell(c).fill = fill(CLR.headerBg);
    });
  });

  // Blank Row
  const blankRow = ws.addRow([]);
  blankRow.height = 8;
  ["A", "B", "C", "D", "E", "F", "G", "H"].forEach(c => blankRow.getCell(c).fill = fill(CLR.headerBg));

  // Table header
  const tHead = ws.addRow([
    "Nr.", "Data", "Lloji", "Nr. Faturës", "Përshkrimi", "Faturim (€)", "Pagesë (€)", "Saldo (€)"
  ]);
  tHead.height = 22;
  ["A", "B", "C", "D", "E", "F", "G", "H"].forEach(c => {
    const cell = tHead.getCell(c);
    cell.fill = fill(CLR.tableHead);
    cell.font = font(true, CLR.tableHeadFg, 11);
    cell.border = border(CLR.border);
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Table rows
  tableRows.forEach((r, idx) => {
    const bgArgb = idx % 2 === 0 ? CLR.rowEven : CLR.rowAlt;
    const row = ws.addRow([
      r["NR."],
      r["Data"],
      r["Lloji"],
      r["Nr. Faturës"] || "-",
      r["Përshkrimi"] || "-",
      r["Faturim €"] || "-",
      r["Pagesë €"] || "-",
      r["Saldo €"] || "-"
    ]);
    row.height = 18;
    ["A", "B", "C", "D", "E", "F", "G", "H"].forEach(c => {
      const cell = row.getCell(c);
      cell.fill = fill(bgArgb);
      cell.font = font(false, CLR.valueFg);
      cell.border = border();
      if (["F", "G", "H"].includes(c)) {
        cell.alignment = { horizontal: "right" };
      } else {
        cell.alignment = { horizontal: "center" };
      }
    });
  });

  // Totals row at the bottom
  const totRow = ws.addRow([
    "", "TOTALI", "", "", "",
    fmt(totals.totHyrje),
    fmt(totals.totDalje),
    fmt(totals.saldo)
  ]);
  totRow.height = 22;
  ["A", "B", "C", "D", "E", "F", "G", "H"].forEach(c => {
    const cell = totRow.getCell(c);
    cell.fill = fill(CLR.totBg);
    cell.font = font(true, CLR.totFg, 11);
    cell.border = border("FF047857");
    if (["F", "G", "H"].includes(c)) {
      cell.alignment = { horizontal: "right" };
    }
  });

  // Branding & Copyright
  ws.addRow([]);
  const brandRow = ws.addRow([
    "© FinanCare - POS, eOrder & More by Rilind Kyçyku",
    "", "", "", "", "", "",
    "WWW.RILINDKYCYKU.DEV"
  ]);
  brandRow.height = 20;
  ws.mergeCells(brandRow.number, 1, brandRow.number, 5);
  ws.mergeCells(brandRow.number, 6, brandRow.number, 8);

  const leftCell = brandRow.getCell(1);
  leftCell.font = { italic: true, size: 9, color: { argb: "FF94A3B8" }, name: "Calibri" };
  leftCell.alignment = { horizontal: "left", vertical: "middle" };

  const rightCell = brandRow.getCell(8);
  rightCell.font = { bold: true, size: 9, color: { argb: "FF10B981" }, name: "Calibri" };
  rightCell.alignment = { horizontal: "right", vertical: "middle" };

  // Save
  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  }), `Kartela_${fileNamePartner}_${dateStr}.xlsx`);
}

/**
 * Reusable utility to export ANY flat data list into a beautifully styled ExcelJS workbook.
 */
export async function exportListExcel(title, headers, data, filename = "Eksport.xlsx", biznesit) {
  let biz = biznesit;
  if (!biz) {
    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
      const res = await axios.get(`${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      biz = res.data;
    } catch (err) {
      console.error("Error fetching business info inside exportListExcel:", err);
    }
  }

  const shopName = biz?.emriIBiznesit || "FinanCare POS";
  const shopNUI = `NUI: ${biz?.nui || "–"} / NF: ${biz?.nf || "–"} / TVSH: ${biz?.nrTVSH || "–"}`;
  const shopContact = `${biz?.adresa || "–"} / ${biz?.nrKontaktit || "–"}`;

  const wb = new ExcelJS.Workbook();
  wb.creator = "FinanCare";
  wb.created = new Date();

  const ws = wb.addWorksheet(title.substring(0, 31), {
    views: [{ state: "frozen", ySplit: 6 }],
    properties: { tabColor: { argb: CLR.tableHead } },
  });

  // 1. Title Row
  const titleRow = ws.addRow([title, ...new Array(headers.length - 1).fill("")]);
  ws.mergeCells(1, 1, 1, headers.length);
  titleRow.height = 32;
  const titleCell = titleRow.getCell(1);
  titleCell.font = { bold: true, color: { argb: CLR.titleFg }, size: 14, name: "Calibri" };
  titleCell.fill = fill(CLR.titleBg);
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  // 1.5. Dynamic Metadata Header Rows (Rows 3 & 4)
  ws.addRow([]).height = 6; // Row 2: Blank spacer

  const dateStr = new Date().toLocaleString("sq-AL");
  const username = localStorage.getItem("username") || "Administrator";

  const row3 = ws.addRow([`Biznesi: ${shopName}`, ...new Array(headers.length - 1).fill("")]);
  row3.height = 20;

  const row4 = ws.addRow([`Regjistri: ${shopNUI}`, ...new Array(headers.length - 1).fill("")]);
  row4.height = 20;

  // Helper to safely merge cells only if they span at least 2 cells
  const safeMerge = (rowNum, startCol, endCol) => {
    if (endCol > startCol) {
      try {
        ws.mergeCells(rowNum, startCol, rowNum, endCol);
      } catch (e) {
        console.warn("Cell merge warning:", e);
      }
    }
  };

  if (headers.length >= 3) {
    const half = Math.floor(headers.length / 2);
    safeMerge(3, 1, half);
    safeMerge(3, half + 1, headers.length);
    row3.getCell(1).value = `Biznesi: ${shopName}`;
    row3.getCell(half + 1).value = `Data: ${dateStr}`;
    row3.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    row3.getCell(half + 1).alignment = { horizontal: "right", vertical: "middle" };

    const segment = Math.floor(headers.length / 3);
    safeMerge(4, 1, segment);
    safeMerge(4, segment + 1, segment * 2);
    safeMerge(4, segment * 2 + 1, headers.length);
    row4.getCell(1).value = `Regjistri: ${shopNUI}`;
    row4.getCell(segment + 1).value = `Adresa/Tel: ${shopContact}`;
    row4.getCell(segment * 2 + 1).value = `Operatori: ${username}`;
    row4.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    row4.getCell(segment + 1).alignment = { horizontal: "center", vertical: "middle" };
    row4.getCell(segment * 2 + 1).alignment = { horizontal: "right", vertical: "middle" };
  } else {
    safeMerge(3, 1, headers.length);
    safeMerge(4, 1, headers.length);
    row3.getCell(1).value = `Biznesi: ${shopName} | Data: ${dateStr}`;
    row4.getCell(1).value = `Regjistri: ${shopNUI} | Operatori: ${username}`;
    row3.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    row4.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  }

  [row3, row4].forEach(row => {
    row.eachCell(cell => {
      cell.font = { size: 9, italic: true, color: { argb: CLR.labelFg }, name: "Calibri" };
      cell.fill = fill(CLR.headerBg);
    });
  });

  // 2. Blank Row spacer
  ws.addRow([]).height = 6;

  // 3. Header Row
  const tHead = ws.addRow(headers);
  tHead.height = 24;
  headers.forEach((h, idx) => {
    const cell = tHead.getCell(idx + 1);
    cell.fill = fill(CLR.tableHead);
    cell.font = font(true, CLR.tableHeadFg, 11);
    cell.border = border(CLR.border);
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // 4. Data Rows
  data.forEach((r, idx) => {
    const bgArgb = idx % 2 === 0 ? CLR.rowEven : CLR.rowAlt;
    const values = headers.map(h => r[h] !== undefined && r[h] !== null ? r[h] : "");
    const row = ws.addRow(values);
    row.height = 19;
    headers.forEach((h, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.fill = fill(bgArgb);
      cell.font = font(false, CLR.valueFg);
      cell.border = border();

      const valStr = String(values[colIdx]);
      if (/^-?\d+(\.\d+)?\s*€?$/.test(valStr) || !isNaN(Number(valStr.replace("€", "").trim()))) {
        cell.alignment = { horizontal: "right" };
      } else {
        cell.alignment = { horizontal: "left" };
      }
    });
  });

  // Auto-fit Column Widths
  ws.columns.forEach((col, colIdx) => {
    let maxLen = headers[colIdx].length;
    data.forEach(r => {
      const val = String(r[headers[colIdx]] || "");
      if (val.length > maxLen) maxLen = val.length;
    });
    col.width = Math.min(Math.max(maxLen + 4, 12), 45);
  });

  // Branding & Copyright
  ws.addRow([]);
  const brandRowData = new Array(headers.length).fill("");
  brandRowData[0] = "© FinanCare - POS, eOrder & More by Rilind Kyçyku";
  brandRowData[headers.length - 1] = "WWW.RILINDKYCYKU.DEV";

  const brandRow = ws.addRow(brandRowData);
  brandRow.height = 20;

  if (headers.length >= 4) {
    const leftSpan = Math.floor(headers.length * 0.6);
    ws.mergeCells(brandRow.number, 1, brandRow.number, leftSpan);
    ws.mergeCells(brandRow.number, leftSpan + 1, brandRow.number, headers.length);
  }

  const leftCell = brandRow.getCell(1);
  leftCell.font = { italic: true, size: 9, color: { argb: "FF94A3B8" }, name: "Calibri" };
  leftCell.alignment = { horizontal: "left", vertical: "middle" };

  const rightCell = brandRow.getCell(headers.length);
  rightCell.font = { bold: true, size: 9, color: { argb: "FF10B981" }, name: "Calibri" };
  rightCell.alignment = { horizontal: "right", vertical: "middle" };

  // Save
  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  }), filename);
}
