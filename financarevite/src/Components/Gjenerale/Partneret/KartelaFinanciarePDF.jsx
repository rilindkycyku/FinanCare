import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";

Font.register({
  family: "Quicksand",
  fonts: [
    { src: "/fonts/Quicksand-Regular.ttf" },
    { src: "/fonts/Quicksand-Bold.ttf", fontWeight: "bold" },
  ],
});

const C = {
  emerald: "#10b981",
  emeraldDk: "#059669",
  emeraldBg: "#f0fdf4",
  red: "#dc2626",
  redBg: "#fef2f2",
  blue: "#0284c7",
  blueBg: "#f0f9ff",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  headerBg: "#111827",
  rowAlt: "#f9fafb",
  white: "#ffffff",
};

const FIRST_PAGE_ITEMS = 28; // fewer rows on page 1 (partner info + summary cards take space)
const CONT_PAGE_ITEMS = 38; // more rows on continuation pages (no header info)

const s = StyleSheet.create({
  page: {
    fontFamily: "Quicksand",
    fontSize: 9,
    color: C.text,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: C.white,
  },

  /* ── Page header (repeats on every page) ─── */
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: C.emerald,
  },
  bizName: { fontSize: 16, fontWeight: "bold", color: C.emerald, letterSpacing: -0.3 },
  bizSub: { fontSize: 7.5, color: C.muted, marginTop: 2 },
  docTitle: { fontSize: 14, fontWeight: "bold", textAlign: "right" },
  docSub: { fontSize: 7.5, color: C.muted, textAlign: "right", marginTop: 2 },

  /* ── Partner info box ─── */
  infoBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: C.emeraldBg,
    borderWidth: 1,
    borderColor: "#86efac",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    gap: 4,
  },
  infoItem: { width: "32%", marginBottom: 4 },
  infoLabel: { fontSize: 6.5, fontWeight: "bold", color: C.muted, textTransform: "uppercase" },
  infoValue: { fontSize: 8, color: C.text },

  /* ── Summary cards row ─── */
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    alignItems: "center",
  },
  summaryCardIncome: { backgroundColor: C.emeraldBg, borderColor: "#86efac" },
  summaryCardExpense: { backgroundColor: C.redBg, borderColor: "#fca5a5" },
  summaryCardBalance: { backgroundColor: C.blueBg, borderColor: "#7dd3fc" },
  summaryLabel: { fontSize: 6.5, fontWeight: "bold", textTransform: "uppercase", marginBottom: 3 },
  summaryLabelIncome: { color: C.emeraldDk },
  summaryLabelExpense: { color: C.red },
  summaryLabelBalance: { color: C.blue },
  summaryValue: { fontSize: 16, fontWeight: "bold" },
  summaryValueIncome: { color: "#15803d" },
  summaryValueExpense: { color: C.red },
  summaryValueBalance: { color: C.blue },
  summaryUnit: { fontSize: 7, color: C.muted, marginTop: 1 },

  /* ── Table ─── */
  tableSectionTitle: {
    fontSize: 7.5, fontWeight: "bold", textTransform: "uppercase",
    letterSpacing: 0.5, color: C.muted, marginBottom: 4,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: C.headerBg,
    borderRadius: 2,
    marginBottom: 1,
  },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border },
  tableRowAlt: { backgroundColor: C.rowAlt },
  tableFooter: {
    flexDirection: "row",
    backgroundColor: C.headerBg,
    borderRadius: 2,
    marginTop: 1,
  },

  // Column widths
  cNr: { width: "5%", paddingHorizontal: 3, paddingVertical: 4 },
  cData: { width: "9%", paddingHorizontal: 3, paddingVertical: 4 },
  cLloji: { width: "8%", paddingHorizontal: 3, paddingVertical: 4 },
  cNrFat: { width: "12%", paddingHorizontal: 3, paddingVertical: 4 },
  cPersh: { width: "36%", paddingHorizontal: 3, paddingVertical: 4 },
  cFat: { width: "10%", paddingHorizontal: 3, paddingVertical: 4, textAlign: "right" },
  cPag: { width: "10%", paddingHorizontal: 3, paddingVertical: 4, textAlign: "right" },
  cSaldo: { width: "10%", paddingHorizontal: 3, paddingVertical: 4, textAlign: "right" },

  thText: { fontSize: 6.5, fontWeight: "bold", color: C.white, textTransform: "uppercase" },
  tdText: { fontSize: 7.5, color: C.text },
  tdMuted: { fontSize: 7.5, color: C.muted },
  tdGreen: { fontSize: 7.5, color: "#15803d", fontWeight: "bold" },
  tdRed: { fontSize: 7.5, color: C.red, fontWeight: "bold" },
  tdBlue: { fontSize: 7.5, color: C.blue, fontWeight: "bold" },
  tdBold: { fontSize: 7.5, fontWeight: "bold" },
  tfText: { fontSize: 7.5, fontWeight: "bold", color: C.white },
  tfGreen: { fontSize: 7.5, fontWeight: "bold", color: "#4ade80" },
  tfRed: { fontSize: 7.5, fontWeight: "bold", color: "#f87171" },
  tfBlue: { fontSize: 7.5, fontWeight: "bold", color: "#60a5fa" },

  /* ── Page footer ─── */
  pageFooter: {
    position: "absolute",
    bottom: 12, left: 20, right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 5,
  },
  pageFooterText: { fontSize: 6.5, color: C.muted },
});

/* ── Helpers ─────────────────────────────────────────────────── */
function fmt(val) {
  const n = parseFloat(val);
  return isNaN(n) ? "0.00" : n.toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── Repeating page header ────────────────────────────────────── */
function PDFHeader({ biznesit, partnerName, pageNum, totalPages }) {
  const today = new Date().toLocaleDateString("sq-AL", { dateStyle: "medium" });
  return (
    <View style={s.pageHeader} fixed>
      <View>
        <Text style={s.bizName}>{biznesit?.emriIBiznesit || "FinanCare"}</Text>
        <Text style={s.bizSub}>
          {[biznesit?.adresa, biznesit?.nrKontaktit ? `Tel: ${biznesit.nrKontaktit}` : null, biznesit?.nui ? `NUI: ${biznesit.nui}` : null]
            .filter(Boolean).join("  ·  ")}
        </Text>
      </View>
      <View>
        <Text style={s.docTitle}>KARTELA FINANCIARE</Text>
        <Text style={s.docSub}>{partnerName}  ·  {today}  ·  Faqe {pageNum}/{totalPages}</Text>
      </View>
    </View>
  );
}

/* ── Partner info ─────────────────────────────────────────────── */
function PDFPartnerInfo({ partner }) {
  const fields = [
    ["Shkurtesa", partner?.shkurtesaPartnerit],
    ["NUI", partner?.nui],
    ["Nr. Fiskal", partner?.nrf],
    ["Nr. TVSH", partner?.tvsh],
    ["Lloji", partner?.llojiPartnerit],
    ["Adresa", partner?.adresa],
    ["Kontakti", partner?.nrKontaktit],
    ["Kodi Kartelës", partner?.kartela?.kodiKartela],
    ["Rabati", partner?.kartela?.rabati != null ? `${parseFloat(partner.kartela.rabati).toFixed(2)} %` : null],
  ].filter(([, v]) => v);

  return (
    <View style={s.infoBox}>
      {fields.map(([label, value]) => (
        <View key={label} style={s.infoItem}>
          <Text style={s.infoLabel}>{label}</Text>
          <Text style={s.infoValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

/* ── Summary cards ────────────────────────────────────────────── */
function PDFSummary({ totHyrje, totDalje, saldo }) {
  return (
    <View style={s.summaryRow}>
      <View style={[s.summaryCard, s.summaryCardIncome]}>
        <Text style={[s.summaryLabel, s.summaryLabelIncome]}>Totali i Hyrjes</Text>
        <Text style={[s.summaryValue, s.summaryValueIncome]}>{fmt(totHyrje)}</Text>
        <Text style={s.summaryUnit}>EUR €</Text>
      </View>
      <View style={[s.summaryCard, s.summaryCardExpense]}>
        <Text style={[s.summaryLabel, s.summaryLabelExpense]}>Totali i Daljes</Text>
        <Text style={[s.summaryValue, s.summaryValueExpense]}>{fmt(totDalje)}</Text>
        <Text style={s.summaryUnit}>EUR €</Text>
      </View>
      <View style={[s.summaryCard, s.summaryCardBalance]}>
        <Text style={[s.summaryLabel, s.summaryLabelBalance]}>Saldo</Text>
        <Text style={[s.summaryValue, s.summaryValueBalance]}>{fmt(saldo)}</Text>
        <Text style={s.summaryUnit}>EUR €</Text>
      </View>
    </View>
  );
}

/* ── Table header row ─────────────────────────────────────────── */
function TableHead() {
  return (
    <View style={s.tableHead}>
      <Text style={[s.cNr, s.thText]}>NR.</Text>
      <Text style={[s.cData, s.thText]}>DATA</Text>
      <Text style={[s.cLloji, s.thText]}>LLOJI</Text>
      <Text style={[s.cNrFat, s.thText]}>NR. FATURËS</Text>
      <Text style={[s.cPersh, s.thText]}>PËRSHKRIMI</Text>
      <Text style={[s.cFat, s.thText]}>FATURIM €</Text>
      <Text style={[s.cPag, s.thText]}>PAGESË €</Text>
      <Text style={[s.cSaldo, s.thText]}>SALDO €</Text>
    </View>
  );
}

/* ── Full PDF Document ────────────────────────────────────────── */
function KartelaFinanciarePDFDoc({ rows, partner, biznesit, totHyrje, totDalje, saldo, partnerName }) {
  const today = new Date().toLocaleDateString("sq-AL", { dateStyle: "medium" });

  // Split rows into pages
  const pages = [];
  if (rows.length > 0) {
    // First page gets fewer rows (partner info + summary take vertical space)
    pages.push(rows.slice(0, FIRST_PAGE_ITEMS));
    // Continuation pages get more rows
    for (let i = FIRST_PAGE_ITEMS; i < rows.length; i += CONT_PAGE_ITEMS) {
      pages.push(rows.slice(i, i + CONT_PAGE_ITEMS));
    }
  }
  if (pages.length === 0) pages.push([]);

  const totalPages = pages.length;

  return (
    <Document>
      {pages.map((pageRows, pageIndex) => {
        const pageNum = pageIndex + 1;
        const isFirst = pageIndex === 0;
        const isLast = pageIndex === pages.length - 1;
        return (
          <Page key={pageNum} size="A4" style={s.page}>

            {/* Repeating header on every page */}
            <PDFHeader biznesit={biznesit} partnerName={partnerName} pageNum={pageNum} totalPages={totalPages} />

            {/* First page only: partner info + summary */}
            {isFirst && (
              <>
                <PDFPartnerInfo partner={partner} />
                <PDFSummary totHyrje={totHyrje} totDalje={totDalje} saldo={saldo} />
                <Text style={s.tableSectionTitle}>Transaksionet</Text>
              </>
            )}

            {/* Subsequent pages: small continuation label */}
            {!isFirst && (
              <Text style={[s.tableSectionTitle, { marginBottom: 6 }]}>
                Transaksionet (vazhdim - faqe {pageNum})
              </Text>
            )}

            {/* Table header on every page */}
            <TableHead />

            {/* Rows */}
            {pageRows.length === 0 ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ color: C.muted, fontSize: 9 }}>Nuk ka transaksione</Text>
              </View>
            ) : (
              pageRows.map((r, i) => {
                const globalIdx = pageIndex === 0
                  ? i
                  : FIRST_PAGE_ITEMS + (pageIndex - 1) * CONT_PAGE_ITEMS + i;
                const isAlt = globalIdx % 2 !== 0;
                const saldoNeg = r._saldo < 0;
                return (
                  <View key={globalIdx} style={[s.tableRow, isAlt && s.tableRowAlt]}>
                    <Text style={[s.cNr, s.tdMuted]}>{r["NR."]}</Text>
                    <Text style={[s.cData, s.tdText]}>{r["Data"]}</Text>
                    <Text style={[s.cLloji, s.tdBold]}>{r["Lloji"]}</Text>
                    <Text style={[s.cNrFat, s.tdText]}>{r["Nr. Faturës"]}</Text>
                    <Text style={[s.cPersh, s.tdMuted]} numberOfLines={1}>{r["Përshkrimi"]}</Text>
                    <Text style={[s.cFat, r["Faturim €"] !== "-" ? s.tdGreen : s.tdMuted]}>{r["Faturim €"]}</Text>
                    <Text style={[s.cPag, r["Pagesë €"] !== "-" ? s.tdRed : s.tdMuted]}>{r["Pagesë €"]}</Text>
                    <Text style={[s.cSaldo, saldoNeg ? s.tdRed : s.tdBlue]}>{r["Saldo €"]}</Text>
                  </View>
                );
              })
            )}

            {/* Totals footer only on last page */}
            {isLast && rows.length > 0 && (
              <View style={s.tableFooter}>
                <Text style={[s.cNr, s.tfText]}> </Text>
                <Text style={[s.cData, s.tfText]}> </Text>
                <Text style={[s.cLloji, s.tfText]}> </Text>
                <Text style={[s.cNrFat, s.tfText]}> </Text>
                <Text style={[s.cPersh, s.tfText]}>TOTALI</Text>
                <Text style={[s.cFat, s.tfGreen]}>{fmt(totHyrje)}</Text>
                <Text style={[s.cPag, s.tfRed]}>{fmt(totDalje)}</Text>
                <Text style={[s.cSaldo, saldo < 0 ? s.tfRed : s.tfBlue]}>{fmt(saldo)}</Text>
              </View>
            )}

            {/* Page footer */}
            <View style={s.pageFooter} fixed>
              <Text style={s.pageFooterText}>
                {"© FinanCare - POS, eOrder & More by Rilind Kyçyku  ·  Kartela Financiare - "}{partnerName}{"  ·  "}{today}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={s.pageFooterText}>Faqe {pageNum}/{totalPages}</Text>
                <Text style={[s.pageFooterText, { fontWeight: "bold" }]}>WWW.RILINDKYCYKU.DEV</Text>
              </View>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}

/* ── Export function ──────────────────────────────────────────── */
function sanitizeFilename(name = "") {
  return name
    .normalize("NFD")                        // decompose accents
    .replace(/[\u0300-\u036f]/g, "")         // strip accent marks
    .replace(/[çÇ]/g, "C")
    .replace(/[ëË]/g, "E")
    .replace(/\./g, "")                      // remove dots (SH.P.K. -> SHPK)
    .replace(/[^a-zA-Z0-9]/g, "_")          // replace anything else with _
    .replace(/_+/g, "_")                     // collapse multiple underscores
    .replace(/^_|_$/g, "");                  // trim leading/trailing
}

export async function downloadKartelaPDF({ rows, partner, biznesit, totHyrje, totDalje, saldo, partnerName }) {
  const blob = await pdf(
    <KartelaFinanciarePDFDoc
      rows={rows}
      partner={partner}
      biznesit={biznesit}
      totHyrje={totHyrje}
      totDalje={totDalje}
      saldo={saldo}
      partnerName={partnerName}
    />
  ).toBlob();
  const date = new Date().toLocaleDateString("sq-AL").replace(/\./g, "-");
  saveAs(blob, `Kartela_${sanitizeFilename(partnerName)}_${date}.pdf`);
}

