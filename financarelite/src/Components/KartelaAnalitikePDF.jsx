import { Document, Page, View, Text, StyleSheet, Font, pdf } from "@react-pdf/renderer";
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

const FIRST_PAGE_ITEMS = 28;
const CONT_PAGE_ITEMS = 38;

const s = StyleSheet.create({
  page: { fontFamily: "Quicksand", fontSize: 9, color: C.text, paddingTop: 20, paddingBottom: 30, paddingHorizontal: 20, backgroundColor: C.white },
  pageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: C.emerald },
  bizName: { fontSize: 16, fontWeight: "bold", color: C.emerald, letterSpacing: -0.3 },
  bizSub: { fontSize: 7.5, color: C.muted, marginTop: 2 },
  docTitle: { fontSize: 14, fontWeight: "bold", textAlign: "right" },
  docSub: { fontSize: 7.5, color: C.muted, textAlign: "right", marginTop: 2 },
  infoBox: { flexDirection: "row", flexWrap: "wrap", backgroundColor: C.emeraldBg, borderWidth: 1, borderColor: "#86efac", borderRadius: 4, padding: 8, marginBottom: 8, gap: 4 },
  infoItem: { width: "32%", marginBottom: 4 },
  infoLabel: { fontSize: 6.5, fontWeight: "bold", color: C.muted, textTransform: "uppercase" },
  infoValue: { fontSize: 8, color: C.text },
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  summaryCard: { flex: 1, borderWidth: 1, borderRadius: 4, padding: 8, alignItems: "center" },
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
  tableSectionTitle: { fontSize: 7.5, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5, color: C.muted, marginBottom: 4 },
  tableHead: { flexDirection: "row", backgroundColor: C.headerBg, borderRadius: 2, marginBottom: 1 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border },
  tableRowAlt: { backgroundColor: C.rowAlt },
  tableFooter: { flexDirection: "row", backgroundColor: C.headerBg, borderRadius: 2, marginTop: 1 },
  cNr: { width: "5%", paddingHorizontal: 3, paddingVertical: 4 },
  cData: { width: "10%", paddingHorizontal: 3, paddingVertical: 4 },
  cLloji: { width: "8%", paddingHorizontal: 3, paddingVertical: 4 },
  cNrFat: { width: "15%", paddingHorizontal: 3, paddingVertical: 4 },
  cPersh: { width: "32%", paddingHorizontal: 3, paddingVertical: 4 },
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
  pageFooter: { position: "absolute", bottom: 12, left: 20, right: 20, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.border, paddingTop: 5 },
  pageFooterText: { fontSize: 6.5, color: C.muted },
});

function fmt(val) {
  const n = parseFloat(val);
  return isNaN(n) ? "0.00" : n.toLocaleString("sq-AL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("sq-AL");
  } catch {
    return dateStr || "-";
  }
}

function PDFHeader({ teDhenatBiznesit, clientName, pageNum, totalPages }) {
  const today = new Date().toLocaleDateString("sq-AL", { dateStyle: "medium" });
  return (
    <View style={s.pageHeader} fixed>
      <View>
        <Text style={s.bizName}>{teDhenatBiznesit?.emriIBiznesit || "FinanCareLite"}</Text>
        <Text style={s.bizSub}>
          {[teDhenatBiznesit?.adresa, teDhenatBiznesit?.nrKontaktit ? `Tel: ${teDhenatBiznesit.nrKontaktit}` : null, teDhenatBiznesit?.nui ? `NUI: ${teDhenatBiznesit.nui}` : null]
            .filter(Boolean)
            .join("  ·  ")}
        </Text>
      </View>
      <View>
        <Text style={s.docTitle}>KARTELA ANALITIKE</Text>
        <Text style={s.docSub}>
          {clientName} · {today} · Faqe {pageNum}/{totalPages}
        </Text>
      </View>
    </View>
  );
}

function PDFClientInfo({ client }) {
  const fields = [
    ["Shkurtesa", client?.shkurtesaPartnerit],
    ["NUI", client?.nui],
    ["Nr. Fiskal", client?.nrf],
    ["Nr. TVSH", client?.tvsh],
    ["Lloji", client?.llojiPartnerit === "biznes" ? "Biznesor" : "Privat"],
    ["Adresa", client?.adresa],
    ["Kontakti", client?.nrKontaktit],
    ["Email", client?.email],
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

function PDFSummary({ hyrje, dalje, saldo }) {
  return (
    <View style={s.summaryRow}>
      <View style={[s.summaryCard, s.summaryCardIncome]}>
        <Text style={[s.summaryLabel, s.summaryLabelIncome]}>Totali i Faturimit</Text>
        <Text style={[s.summaryValue, s.summaryValueIncome]}>{fmt(hyrje)}</Text>
        <Text style={s.summaryUnit}>EUR €</Text>
      </View>
      <View style={[s.summaryCard, s.summaryCardExpense]}>
        <Text style={[s.summaryLabel, s.summaryLabelExpense]}>Totali i Fletëkthimeve</Text>
        <Text style={[s.summaryValue, s.summaryValueExpense]}>{fmt(dalje)}</Text>
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

function KartelaAnalitikePDFDoc({ rows, client, teDhenatBiznesit, hyrje, dalje, saldo, clientName }) {
  const today = new Date().toLocaleDateString("sq-AL", { dateStyle: "medium" });

  const pages = [];
  if (rows.length > 0) {
    pages.push(rows.slice(0, FIRST_PAGE_ITEMS));
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
            <PDFHeader teDhenatBiznesit={teDhenatBiznesit} clientName={clientName} pageNum={pageNum} totalPages={totalPages} />

            {isFirst && (
              <>
                <PDFClientInfo client={client} />
                <PDFSummary hyrje={hyrje} dalje={dalje} saldo={saldo} />
                <Text style={s.tableSectionTitle}>Transaksionet</Text>
              </>
            )}
            {!isFirst && <Text style={[s.tableSectionTitle, { marginBottom: 6 }]}>Transaksionet (vazhdim - faqe {pageNum})</Text>}

            <TableHead />

            {pageRows.length === 0 ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ color: C.muted, fontSize: 9 }}>Nuk ka transaksione</Text>
              </View>
            ) : (
              pageRows.map((r, i) => {
                const globalIdx = pageIndex === 0 ? i : FIRST_PAGE_ITEMS + (pageIndex - 1) * CONT_PAGE_ITEMS + i;
                const isAlt = globalIdx % 2 !== 0;
                const saldoVal = parseFloat(r["Saldo €"]) || 0;
                return (
                  <View key={r.ID || globalIdx} style={[s.tableRow, isAlt && s.tableRowAlt]}>
                    <Text style={[s.cNr, s.tdMuted]}>{r["NR."]}</Text>
                    <Text style={[s.cData, s.tdText]}>{formatDate(r["Data"])}</Text>
                    <Text style={[s.cLloji, s.tdBold]}>{r["Lloji"]}</Text>
                    <Text style={[s.cNrFat, s.tdText]}>{r["Nr. Faturës"]}</Text>
                    <Text style={[s.cPersh, s.tdMuted]}>{r["Përshkrimi"]}</Text>
                    <Text style={[s.cFat, r["Faturim €"] !== "-" ? s.tdGreen : s.tdMuted]}>{r["Faturim €"]}</Text>
                    <Text style={[s.cPag, r["Pagesë €"] !== "-" ? s.tdRed : s.tdMuted]}>{r["Pagesë €"]}</Text>
                    <Text style={[s.cSaldo, saldoVal < 0 ? s.tdRed : s.tdBlue]}>{r["Saldo €"]}</Text>
                  </View>
                );
              })
            )}

            {isLast && rows.length > 0 && (
              <View style={s.tableFooter}>
                <Text style={[s.cNr, s.tfText]}> </Text>
                <Text style={[s.cData, s.tfText]}> </Text>
                <Text style={[s.cLloji, s.tfText]}> </Text>
                <Text style={[s.cNrFat, s.tfText]}> </Text>
                <Text style={[s.cPersh, s.tfText]}>TOTALI</Text>
                <Text style={[s.cFat, s.tfGreen]}>{fmt(hyrje)}</Text>
                <Text style={[s.cPag, s.tfRed]}>{fmt(dalje)}</Text>
                <Text style={[s.cSaldo, saldo < 0 ? s.tfRed : s.tfBlue]}>{fmt(saldo)}</Text>
              </View>
            )}

            <View style={s.pageFooter} fixed>
              <Text style={s.pageFooterText}>
                {`© 2023 - ${new Date().getFullYear()} FinanCareLite  ·  Kartela Analitike - ${clientName}  ·  ${today}`}
              </Text>
              <Text style={s.pageFooterText}>
                Faqe {pageNum}/{totalPages}
              </Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}

const COMBINING_MARKS = new RegExp("[̀-ͯ]", "g");

function sanitizeFilename(name = "") {
  return name
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[çÇ]/g, "C")
    .replace(/[ëË]/g, "E")
    .replace(/\./g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

async function buildKartelaAnalitikePDFBlob({ rows, client, teDhenatBiznesit, hyrje, dalje, saldo, clientName }) {
  return pdf(
    <KartelaAnalitikePDFDoc rows={rows} client={client} teDhenatBiznesit={teDhenatBiznesit} hyrje={hyrje} dalje={dalje} saldo={saldo} clientName={clientName} />
  ).toBlob();
}

/** Opens the same PDF used for download in a hidden iframe and triggers the browser's native
 * print dialog on it, so "Printo" prints the clean Kartela Analitike PDF layout instead of the
 * on-screen page (navbar, tip banner, select dropdown, etc). */
export async function printKartelaAnalitikePDF(args) {
  const blob = await buildKartelaAnalitikePDFBlob(args);
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };
  // Cleanup well after the print dialog has had time to open/close — there's no reliable
  // cross-browser "print dialog closed" event for iframe-triggered printing.
  setTimeout(() => {
    document.body.removeChild(iframe);
    URL.revokeObjectURL(url);
  }, 60000);
}

export async function downloadKartelaAnalitikePDF(args) {
  const blob = await buildKartelaAnalitikePDFBlob(args);
  const { clientName } = args;
  const date = new Date().toLocaleDateString("sq-AL").replace(/\./g, "-");
  saveAs(blob, `Kartela_${sanitizeFilename(clientName)}_${date}.pdf`);
}
