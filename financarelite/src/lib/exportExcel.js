import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getBusinessDetails } from "./db";

// Colours matching FinanCare's dark-green brand theme — same palette as the original
// exportInvoiceExcel.js's exportListExcel(), just ported to read the business profile from
// IndexedDB instead of an API call (there is no backend in FinanCareLite).
const CLR = {
  headerBg: "FF0D2137",
  titleBg: "FF0A6640",
  titleFg: "FFFFFFFF",
  labelFg: "FF94A3B8",
  valueFg: "FFF1F5F9",
  rowAlt: "FF111D2E",
  rowEven: "FF0D1520",
  totBg: "FF059669",
  totFg: "FFFFFFFF",
  border: "FF1E3A5F",
  tableHead: "FF10B981",
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
  bold,
  color: { argb: color },
  size,
  name: "Calibri",
});

/** Reusable utility to export any flat list of display-row objects into a styled ExcelJS workbook. */
export async function exportListExcel(title, headers, data, filename = "Eksport.xlsx") {
  const biz = await getBusinessDetails();
  const shopName = biz?.emriIBiznesit || "FinanCareLite";
  const shopNUI = `NUI: ${biz?.nui || "–"} / NF: ${biz?.nf || "–"} / TVSH: ${biz?.nrTVSH || "–"}`;
  const shopContact = `${biz?.adresa || "–"} / ${biz?.nrKontaktit || "–"}`;

  const wb = new ExcelJS.Workbook();
  wb.creator = "FinanCareLite";
  wb.created = new Date();

  const safeSheetName = (title || "Sheet").replace(/[*?:[\]\\/]/g, "-").substring(0, 31);

  const ws = wb.addWorksheet(safeSheetName, {
    views: [{ state: "frozen", ySplit: 6 }],
    properties: { tabColor: { argb: CLR.tableHead } },
  });

  // 1. Title row
  const titleRow = ws.addRow([title, ...new Array(headers.length - 1).fill("")]);
  ws.mergeCells(1, 1, 1, headers.length);
  titleRow.height = 32;
  const titleCell = titleRow.getCell(1);
  titleCell.font = { bold: true, color: { argb: CLR.titleFg }, size: 14, name: "Calibri" };
  titleCell.fill = fill(CLR.titleBg);
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  // 2. Metadata rows (business name/registry on one row, contact/date on the next)
  ws.addRow([]).height = 6;

  const dateStr = new Date().toLocaleString("sq-AL");
  const row3 = ws.addRow([]);
  row3.height = 20;
  const row4 = ws.addRow([]);
  row4.height = 20;

  const safeMerge = (rowNum, startCol, endCol) => {
    if (endCol > startCol) {
      try {
        ws.mergeCells(rowNum, startCol, rowNum, endCol);
      } catch {
        /* header too narrow to merge — value still gets written to the first cell */
      }
    }
  };

  const half = Math.max(1, Math.floor(headers.length / 2));
  safeMerge(3, 1, half);
  safeMerge(3, half + 1, headers.length);
  row3.getCell(1).value = `Biznesi: ${shopName}`;
  row3.getCell(half + 1).value = `Data: ${dateStr}`;
  row3.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
  row3.getCell(half + 1).alignment = { horizontal: "right", vertical: "middle" };

  safeMerge(4, 1, half);
  safeMerge(4, half + 1, headers.length);
  row4.getCell(1).value = `Regjistri: ${shopNUI}`;
  row4.getCell(half + 1).value = `Adresa/Tel: ${shopContact}`;
  row4.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
  row4.getCell(half + 1).alignment = { horizontal: "right", vertical: "middle" };

  [row3, row4].forEach((row) => {
    for (let c = 1; c <= headers.length; c++) {
      row.getCell(c).font = { size: 9, italic: true, color: { argb: CLR.labelFg }, name: "Calibri" };
      row.getCell(c).fill = fill(CLR.headerBg);
    }
  });

  ws.addRow([]).height = 6;

  // 3. Header row
  const tHead = ws.addRow(headers);
  tHead.height = 24;
  headers.forEach((h, idx) => {
    const cell = tHead.getCell(idx + 1);
    cell.fill = fill(CLR.tableHead);
    cell.font = font(true, CLR.tableHeadFg, 11);
    cell.border = border(CLR.border);
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // 4. Data rows
  data.forEach((r, idx) => {
    const bgArgb = idx % 2 === 0 ? CLR.rowEven : CLR.rowAlt;
    const values = headers.map((h) => (r[h] !== undefined && r[h] !== null ? r[h] : ""));
    const row = ws.addRow(values);
    row.height = 19;
    headers.forEach((h, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.fill = fill(bgArgb);
      cell.font = font(false, CLR.valueFg);
      cell.border = border();
      const valStr = String(values[colIdx]);
      cell.alignment = { horizontal: !isNaN(Number(valStr.replace("€", "").trim())) ? "right" : "left" };
    });
  });

  // 4.5 Totals row for any € columns
  let hasTotals = false;
  const totals = {};
  headers.forEach((h) => {
    if (h.includes("€")) {
      let sum = 0;
      data.forEach((r) => {
        const valStr = String(r[h] || "").replace(/€/g, "").trim();
        if (!isNaN(Number(valStr)) && valStr !== "") {
          sum += Number(valStr);
          hasTotals = true;
        }
      });
      totals[h] = sum.toFixed(2);
    }
  });

  if (hasTotals) {
    const totValues = headers.map((h, idx) => {
      if (idx === 1 && headers.length > 1) return "TOTALI";
      if (idx === 0 && headers.length === 1) return "TOTALI";
      return totals[h] !== undefined ? totals[h] : "";
    });
    const totRow = ws.addRow(totValues);
    totRow.height = 22;
    headers.forEach((h, colIdx) => {
      const cell = totRow.getCell(colIdx + 1);
      cell.fill = fill(CLR.totBg);
      cell.font = font(true, CLR.totFg, 11);
      cell.border = border("FF047857");
      cell.alignment = { horizontal: totals[h] !== undefined ? "right" : "center" };
    });
  }

  // Auto-fit column widths
  ws.columns.forEach((col, colIdx) => {
    let maxLen = headers[colIdx].length;
    data.forEach((r) => {
      const val = String(r[headers[colIdx]] || "");
      if (val.length > maxLen) maxLen = val.length;
    });
    col.width = Math.min(Math.max(maxLen + 4, 12), 45);
  });

  // Branding row
  ws.addRow([]);
  const brandRowData = new Array(headers.length).fill("");
  brandRowData[0] = `© ${new Date().getFullYear()} FinanCareLite`;
  const brandRow = ws.addRow(brandRowData);
  brandRow.height = 20;
  const leftCell = brandRow.getCell(1);
  leftCell.font = { italic: true, size: 9, color: { argb: "FF94A3B8" }, name: "Calibri" };
  leftCell.alignment = { horizontal: "left", vertical: "middle" };

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    filename
  );
}
