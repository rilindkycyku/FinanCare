import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// ── Colours (matching the app's dark-green theme) ────────────────
const CLR = {
  headerBg:   "FF0D2137", // dark navy  (--pos-surface-2)
  headerFg:   "FFFFFFFF", // white
  titleBg:    "FF0A6640", // deep green (--pos-emerald-dark-ish)
  titleFg:    "FFFFFFFF",
  labelFg:    "FF94A3B8", // soft grey
  valueFg:    "FFF1F5F9", // near-white
  rowAlt:     "FF111D2E", // surface-2
  rowEven:    "FF0D1520", // surface
  totBg:      "FF059669", // emerald
  totFg:      "FFFFFFFF",
  border:     "FF1E3A5F",
  tableHead:  "FF10B981", // emerald green
  tableHeadFg:"FF000000",
};

const border = (color = CLR.border) => ({
  top:    { style: "thin", color: { argb: color } },
  left:   { style: "thin", color: { argb: color } },
  bottom: { style: "thin", color: { argb: color } },
  right:  { style: "thin", color: { argb: color } },
});

const fill = (argb) => ({ type: "pattern", pattern: "solid", fgColor: { argb } });

const font = (bold = false, color = CLR.valueFg, size = 11) => ({
  bold, color: { argb: color }, size, name: "Calibri",
});

/**
 * Exports a styled invoice + products Excel using ExcelJS.
 * Mirrors the "Te Dhenat e Fatures" UI layout.
 */
export async function exportInvoiceExcel(teDhenatFat, produktet) {
  const reg       = teDhenatFat?.regjistrimet ?? {};
  const nrFat     = reg.nrFatures    || "–";
  const partneri  = reg.emriBiznesit || "–";
  const dataFat   = reg.dataRegjistrimit
    ? new Date(reg.dataRegjistrimit).toLocaleDateString("en-GB")
    : "–";
  const llojiPag  = reg.llojiPageses    || "–";
  const statPag   = reg.statusiPageses  || "–";
  const person    = reg.username        || "–";
  const nrKalk    = reg.nrRendorFatures ?? "–";
  const statKalk  = reg.statusiKalkulimit === "true" ? "I Mbyllur" : "I Hapur";

  const fmt = (v) => `${parseFloat(v || 0).toFixed(2)} €`;
  const totPaTVSH  = fmt(teDhenatFat?.totaliPaTVSH);
  const totMeTVSH  = fmt(teDhenatFat?.totaliMeTVSH);
  const rabati     = fmt(teDhenatFat?.rabati);
  const totPa8     = fmt(teDhenatFat?.totaliPaTVSH8);
  const totPa18    = fmt(teDhenatFat?.totaliPaTVSH18);
  const tvsh8      = fmt(teDhenatFat?.tvsH8);
  const tvsh18     = fmt(teDhenatFat?.tvsH18);

  // ── Workbook ─────────────────────────────────────────────────
  const wb = new ExcelJS.Workbook();
  wb.creator = "FinanCare";
  wb.created = new Date();

  const ws = wb.addWorksheet(`Fatura ${nrFat}`, {
    views: [{ state: "frozen", ySplit: 10 }],   // freeze above products table
    properties: { tabColor: { argb: CLR.tableHead } },
  });

  // Column widths  A  B  C  D  E  F  G  H  I
  ws.columns = [
    { width: 6  }, // A  Nr.
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
  titleCell.font  = { bold: true, color: { argb: CLR.titleFg }, size: 16, name: "Calibri" };
  titleCell.fill  = fill(CLR.titleBg);
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  // ── ROW 2: blank ─────────────────────────────────────────────
  ws.addRow([]).height = 6;

  // ── ROWS 3–8: Info block (3 columns of label/value pairs) ────
  const infoData = [
    // [colA-label, colA-value, colD-label, colD-value, colH-label, colH-value]
    ["Partneri:",       partneri,  "Totali Pa TVSH 8 %:", totPa8,   "Personi Pergjegjes:", person ],
    ["Nr. Fatures:",    nrFat,     "Totali Pa TVSH 18 %:",totPa18,  "Nr. Kalkulimit:",     nrKalk ],
    ["Data Fatures:",   dataFat,   "TVSH-ja 8%:",         tvsh8,    "Lloji Fatures:",      "Hyrje"],
    ["Rabati:",         rabati,    "TVSH-ja 18%:",         tvsh18,   "Statusi kalkulimit:", statKalk],
    ["Totali Pa TVSH:", totPaTVSH, "Pagesa behet me:",    llojiPag, "",                    ""     ],
    ["Totali Me TVSH:", totMeTVSH, "Statusi i Pageses:",  statPag,  "",                    ""     ],
  ];

  infoData.forEach(([lA, vA, lD, vD, lH, vH]) => {
    const row = ws.addRow([lA, vA, "", lD, vD, "", "", lH, vH]);
    row.height = 20;
    row.getCell("A").fill = fill(CLR.headerBg);
    row.getCell("A").font = font(true,  CLR.labelFg);
    row.getCell("B").fill = fill(CLR.headerBg);
    row.getCell("B").font = font(false, CLR.valueFg);
    row.getCell("D").fill = fill(CLR.headerBg);
    row.getCell("D").font = font(true,  CLR.labelFg);
    row.getCell("E").fill = fill(CLR.headerBg);
    row.getCell("E").font = font(false, CLR.valueFg);
    row.getCell("H").fill = fill(CLR.headerBg);
    row.getCell("H").font = font(true,  CLR.labelFg);
    row.getCell("I").fill = fill(CLR.headerBg);
    row.getCell("I").font = font(false, CLR.valueFg);
    // Fill remaining cols same bg
    ["C","F","G"].forEach(c => {
      row.getCell(c).fill = fill(CLR.headerBg);
    });
  });

  // ── ROW 9: blank ─────────────────────────────────────────────
  const blankRow = ws.addRow([]);
  blankRow.height = 8;
  ["A","B","C","D","E","F","G","H","I"].forEach(c => blankRow.getCell(c).fill = fill(CLR.headerBg));

  // ── ROW 10: Table header ──────────────────────────────────────
  const tHead = ws.addRow([
    "Nr.", "ID dhe Emri", "Sasia",
    "Çm. Bleres (€)", "Çm. Shites (€)",
    "Tot. Bleres (€)", "Tot. Shites (€)", "", "",
  ]);
  tHead.height = 22;
  ["A","B","C","D","E","F","G"].forEach(c => {
    const cell = tHead.getCell(c);
    cell.fill      = fill(CLR.tableHead);
    cell.font      = font(true, CLR.tableHeadFg, 11);
    cell.border    = border(CLR.border);
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
    ["A","B","C","D","E","F","G"].forEach(c => {
      const cell = row.getCell(c);
      cell.fill   = fill(bgArgb);
      cell.font   = font(false, CLR.valueFg);
      cell.border = border();
      if (["C","D","E","F","G"].includes(c)) {
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
  ["A","B","C","D","E","F","G"].forEach(c => {
    const cell = totRow.getCell(c);
    cell.fill   = fill(CLR.totBg);
    cell.font   = font(true, CLR.totFg, 11);
    cell.border = border("FF047857");
    if (["F","G"].includes(c)) cell.alignment = { horizontal: "right" };
  });

  // ── Save ─────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  }), `Fatura_${nrFat}_Produktet.xlsx`);
}
