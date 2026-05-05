// src/components/InvoicePDF.tsx
import { Document, Page, View, Text, StyleSheet, Image } from "@react-pdf/renderer";
import businessData from "../data/business.json";

const business = businessData.business;

// ─── Brand Palette ─────────────────────────────────────────────────────────
const C = {
  emerald:    "#10b981",
  emeraldDim: "#059669",
  cyan:       "#06b6d4",
  cyanLight:  "rgba(6,182,212,0.10)",
  emeraldBg:  "rgba(16,185,129,0.07)",
  slate900:   "#0f172a",
  slate800:   "#1e293b",
  slate700:   "#334155",
  slate500:   "#64748b",
  slate400:   "#94a3b8",
  slate200:   "#e2e8f0",
  slate100:   "#f1f5f9",
  white:      "#ffffff",
  red:        "#dc2626",
  redLight:   "#fef2f2",
};

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 38,
    fontFamily: "Quicksand",
    fontSize: 9.2,
    backgroundColor: C.white,
    lineHeight: 1.4,
  },

  // ── Top accent bar ──────────────────────────────────────────────────────
  accentBar: {
    height: 3.5,
    backgroundColor: C.emerald,
    marginBottom: 18,
    borderRadius: 2,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.slate200,
    gap: 14,
  },

  logo: {
    width: 74,
    height: 74,
    borderRadius: 10,
    objectFit: "contain",
    backgroundColor: C.slate100,
    padding: 6,
    borderWidth: 1.2,
    borderColor: C.slate200,
  },

  centerInfo: { flex: 1, paddingHorizontal: 8 },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },

  infoBlock: { flex: 1 },

  infoLabel: {
    fontSize: 7.5,
    color: C.emerald,
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "700",
  },

  infoTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: C.slate900,
    marginBottom: 3,
  },

  infoText: {
    fontSize: 8.6,
    color: C.slate500,
    lineHeight: 1.4,
  },

  // ── Invoice box (top-right) ─────────────────────────────────────────────
  invoiceBox: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    minWidth: 150,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.emerald,
    backgroundColor: C.emeraldBg,
  },

  invoiceFlag: {
    fontSize: 7.8,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: C.emerald,
  },

  invoiceNumber: {
    fontSize: 11.5,
    fontWeight: "900",
    marginVertical: 4,
    letterSpacing: 0.4,
    color: C.slate800,
  },

  invoiceDate: {
    fontSize: 8.4,
    color: C.slate500,
  },

  invoicePayment: {
    marginTop: 6,
    fontSize: 9,
    color: C.slate700,
    textAlign: "center",
  },

  // ── Table ────────────────────────────────────────────────────────────────
  table: { marginTop: 2 },

  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 7.5,
    borderBottomWidth: 2,
    borderBottomColor: C.emerald,
    fontWeight: "bold",
    fontSize: 9.4,
    color: C.slate700,
  },

  row: {
    flexDirection: "row",
    paddingVertical: 6.5,
    borderBottomWidth: 0.7,
    borderBottomColor: C.slate200,
    fontSize: 9.2,
  },

  rowAlt: {
    backgroundColor: C.emeraldBg,
  },

  colNr:        { width: "5.5%",  textAlign: "center" },
  colItem:      { width: "37%",   paddingLeft: 6 },
  colQty:       { width: "9%",    textAlign: "center" },
  colUnit:      { width: "13%",   textAlign: "right" },
  colVatRate:   { width: "9%",    textAlign: "center" },
  colVatAmount: { width: "13%",   textAlign: "right" },
  colTotal: {
    width: "13.5%",
    textAlign: "right",
    fontWeight: "700",
    color: C.emeraldDim,
  },

  // ── Totals block ─────────────────────────────────────────────────────────
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8.5,
    paddingHorizontal: 14,
    borderBottomWidth: 0.8,
    borderBottomColor: C.slate200,
  },

  totalLabel: { fontSize: 10.5, color: C.slate500, fontWeight: "600" },
  totalValue: { fontSize: 10.5, color: C.slate800, fontWeight: "bold" },

  totalDiscountLabel: { fontSize: 10.5, color: C.red, fontWeight: "600" },
  totalDiscountValue: { fontSize: 10.5, color: C.red, fontWeight: "700" },

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: C.emeraldBg,
    borderTopWidth: 1.8,
    borderTopColor: C.emerald,
  },

  grandTotalLabel: { fontSize: 13, fontWeight: "900", color: C.emeraldDim },
  grandTotalValue: { fontSize: 15, fontWeight: "900", color: C.emeraldDim },

  totalsBox: {
    borderWidth: 1.4,
    borderColor: C.emerald,
    borderRadius: 9,
    overflow: "hidden",
  },

  // ── Bank accounts ─────────────────────────────────────────────────────────
  bankBox: {
    borderWidth: 1.3,
    borderColor: C.cyan,
    borderRadius: 9,
    overflow: "hidden",
  },

  bankHeaderRow: {
    flexDirection: "row",
    backgroundColor: C.cyanLight,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },

  bankHeaderText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: C.cyan,
  },

  bankRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderTopWidth: 0.8,
    borderTopColor: C.slate200,
  },

  bankName: { flex: 3,   fontSize: 9.6, fontWeight: "bold",  color: C.slate800 },
  bankIban: { flex: 3.2, fontSize: 9.6, fontWeight: "600",   color: C.slate700 },
  bankCcy:  { flex: 0.9, fontSize: 11,  fontWeight: "800",   color: C.cyan, textAlign: "right" },

  // ── Signature ─────────────────────────────────────────────────────────────
  signatureRow: {
    flexDirection: "row",
    gap: 150,
    paddingTop: 20,
    paddingHorizontal: 20,
    borderTopWidth: 0.9,
    borderTopColor: C.slate200,
  },

  signatureLine: {
    width: 180,
    height: 1.4,
    backgroundColor: C.slate700,
  },

  signatureText: {
    fontSize: 9,
    fontWeight: "600",
    color: C.slate500,
    marginBottom: 4,
    textAlign: "center",
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    marginTop: 32,
    fontSize: 8.5,
    color: C.slate400,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopWidth: 0.9,
    borderTopColor: C.slate200,
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type InvoiceItem = {
  ProduktiID: string | number;
  EmriProduktit: string;
  Barkodi?: string;
  quantity: number;
  QmimiProduktit: number;
  LlojiTVSH: string;
  netPrice: number;
  totalVat: number;
  lineTotal: number;
};

type InvoicePDFProps = {
  invoiceNumber: string;
  clientName: string;
  user: any;
  items: InvoiceItem[];
  subtotalNet: number;
  totalVAT: number;
  grandTotal: number;
  paymentMethod: "cash" | "card";
  transporti: number;
  rabati: number;
};

// ─── Reusable sub-components ──────────────────────────────────────────────────
function PageHeader({ invoiceNumber, clientName, user, paymentMethod }: any) {
  const payLabel = paymentMethod === "card" ? "BANKË" : "CASH";
  return (
    <>
      {/* Accent bar */}
      <View style={styles.accentBar} />

      <View style={styles.header}>
        {/* Logo */}
        <View style={{ alignItems: "center" }}>
          {business.Logo && (
            <Image src={"/img/web/" + business.Logo} style={styles.logo} />
          )}
        </View>

        {/* Center: Furnitori + Klienti */}
        <View style={styles.centerInfo}>
          <View style={styles.infoRow}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Furnitori</Text>
              <Text style={styles.infoTitle}>{business.EmriIBiznesit}</Text>
              <Text style={styles.infoText}>
                {business.Adresa}
                {business.NUI ? ` | NUI: ${business.NUI}` : ""}
                {business.NrKontaktit ? ` | ${business.NrKontaktit}` : ""}
                {business.Email ? ` | ${business.Email}` : ""}
              </Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Klienti</Text>
              <Text style={styles.infoTitle}>{clientName}</Text>
              <Text style={styles.infoText}>
                {user?.Adresa ? user.Adresa : ""}
                {user?.NUI && user.NUI !== "0" ? ` | NUI: ${user.NUI}` : ""}
                {user?.NrKontaktit ? ` | ${user.NrKontaktit}` : ""}
                {user?.Email ? ` | ${user.Email}` : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Right: Invoice box */}
        <View style={styles.invoiceBox}>
          <Text style={styles.invoiceFlag}>Faturë Tatimore</Text>
          <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
          <Text style={styles.invoiceDate}>
            {new Date().toLocaleDateString("sq-AL")}
          </Text>
          <Text style={styles.invoicePayment}>
            Pagesa:{" "}
            <Text style={{ fontWeight: "bold", color: C.slate800 }}>
              {payLabel}
            </Text>
          </Text>
        </View>
      </View>
    </>
  );
}

function TableHeader() {
  return (
    <View style={styles.tableHeaderRow}>
      <Text style={styles.colNr}>Nr.</Text>
      <Text style={styles.colItem}>Emri — Barkodi</Text>
      <Text style={styles.colQty}>Sasia</Text>
      <Text style={styles.colUnit}>Ç. pa TVSH</Text>
      <Text style={styles.colVatRate}>TVSH %</Text>
      <Text style={styles.colVatAmount}>TVSH €</Text>
      <Text style={styles.colTotal}>Totali €</Text>
    </View>
  );
}

function BankAccounts() {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 10.5, fontWeight: "bold", color: C.slate800, marginBottom: 9 }}>
        Të Dhënat Bankare
      </Text>
      <View style={styles.bankBox}>
        <View style={styles.bankHeaderRow}>
          <Text style={[styles.bankHeaderText, { flex: 3 }]}>Banka</Text>
          <Text style={[styles.bankHeaderText, { flex: 3.2 }]}>Llogaria</Text>
          <Text style={[styles.bankHeaderText, { flex: 0.9, textAlign: "right" }]}>Val.</Text>
        </View>
        {businessData.bankAccounts.map((acc, i) => {
          const icon = acc.Valuta.includes("Euro") ? "€"
            : acc.Valuta.includes("Dollar") ? "$"
            : acc.Valuta.includes("Franga") ? "CHF"
            : acc.Valuta[0];
          return (
            <View
              key={acc.IDLlogariaBankare}
              style={[styles.bankRow, i === 0 ? { borderTopWidth: 0 } : {}]}
            >
              <Text style={styles.bankName}>{acc.EmriBankes}</Text>
              <Text style={styles.bankIban}>{acc.NumriLlogaris}</Text>
              <Text style={styles.bankCcy}>{icon}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function TotalsBox({ subtotalNet, totalVAT, transporti, rabati, grandTotal, user }: any) {
  return (
    <View style={{ width: "42%" }}>
      <Text style={{ fontSize: 10.5, fontWeight: "bold", color: C.slate800, marginBottom: 9 }}>
        Totalet
      </Text>
      <View style={styles.totalsBox}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Totali pa TVSH</Text>
          <Text style={styles.totalValue}>{subtotalNet.toFixed(2)} €</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TVSH totale</Text>
          <Text style={styles.totalValue}>{totalVAT.toFixed(2)} €</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Transporti</Text>
          <Text style={styles.totalValue}>{transporti.toFixed(2)} €</Text>
        </View>
        {rabati > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalDiscountLabel}>Rabat (−{user?.Rabati ?? 0}%)</Text>
            <Text style={styles.totalDiscountValue}>−{rabati.toFixed(2)} €</Text>
          </View>
        )}
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>TOTALI PËR PAGESË</Text>
          <Text style={styles.grandTotalValue}>{grandTotal.toFixed(2)} €</Text>
        </View>
      </View>
    </View>
  );
}

function SignatureLines() {
  return (
    <View style={styles.signatureRow}>
      {(["Dorezoi", "Pranoi"] as const).map((label) => (
        <View key={label} style={{ alignItems: "center" }}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function PageFooter({ pageNum, totalPagesDisplay }: { pageNum: number; totalPagesDisplay: number }) {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerRow}>
        <Text style={{ fontSize: 8, color: C.slate500, fontWeight: "500" }}>
          Faleminderit për blerjen! • {business.EmriIBiznesit} © {new Date().getFullYear()}
        </Text>
        <Text style={{ fontSize: 8.2, color: C.slate500, fontWeight: "600" }}>
          Faqja {pageNum} nga {totalPagesDisplay}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InvoicePDF({
  invoiceNumber,
  clientName,
  user,
  items,
  subtotalNet,
  totalVAT,
  grandTotal,
  paymentMethod = "cash",
  transporti = 1.5,
  rabati = 0,
}: InvoicePDFProps) {
  const ITEMS_PER_PAGE = 22;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const lastPageCount = items.length % ITEMS_PER_PAGE || ITEMS_PER_PAGE;
  const moveTotalsToNewPage = lastPageCount > 13;
  const totalPagesDisplay = moveTotalsToNewPage ? totalPages + 1 : totalPages;

  return (
    <Document>
      {/* ── PRODUCT PAGES ─────────────────────────────────────────────────── */}
      {Array.from({ length: totalPages }, (_, pageIndex) => {
        const start = pageIndex * ITEMS_PER_PAGE;
        const end = Math.min(start + ITEMS_PER_PAGE, items.length);
        const pageItems = items.slice(start, end);
        const isLastItemPage = pageIndex === totalPages - 1;

        return (
          <Page key={`page-${pageIndex}`} size="A4" style={styles.page}>
            <PageHeader
              invoiceNumber={invoiceNumber}
              clientName={clientName}
              user={user}
              paymentMethod={paymentMethod}
            />

            {/* Table */}
            <View style={styles.table}>
              <TableHeader />
              {pageItems.map((item, i) => (
                <View
                  key={item.ProduktiID}
                  style={[styles.row, i % 2 === 1 ? styles.rowAlt : {}]}
                >
                  <Text style={styles.colNr}>{start + i + 1}</Text>
                  <Text style={styles.colItem}>
                    {item.EmriProduktit}{item.Barkodi ? ` — ${item.Barkodi}` : ""}
                  </Text>
                  <Text style={styles.colQty}>{item.quantity}</Text>
                  <Text style={styles.colUnit}>{item.netPrice.toFixed(2)} €</Text>
                  <Text style={styles.colVatRate}>{item.LlojiTVSH}%</Text>
                  <Text style={styles.colVatAmount}>{item.totalVat.toFixed(2)} €</Text>
                  <Text style={styles.colTotal}>{item.lineTotal.toFixed(2)} €</Text>
                </View>
              ))}
            </View>

            {/* Totals on last page (if fits) */}
            {isLastItemPage && !moveTotalsToNewPage && (
              <View style={{ marginTop: 28 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 20, alignItems: "flex-start", marginBottom: 28 }}>
                  <BankAccounts />
                  <TotalsBox subtotalNet={subtotalNet} totalVAT={totalVAT} transporti={transporti} rabati={rabati} grandTotal={grandTotal} user={user} />
                </View>
                <SignatureLines />
              </View>
            )}

            <PageFooter pageNum={pageIndex + 1} totalPagesDisplay={totalPagesDisplay} />
          </Page>
        );
      })}

      {/* ── OVERFLOW TOTALS PAGE ───────────────────────────────────────────── */}
      {moveTotalsToNewPage && (
        <Page size="A4" style={styles.page}>
          <PageHeader
            invoiceNumber={invoiceNumber}
            clientName={clientName}
            user={user}
            paymentMethod={paymentMethod}
          />

          {/* Empty table header to keep layout consistent */}
          <View style={styles.table}>
            <TableHeader />
          </View>

          {/* Totals summary centred on the page */}
          <View style={{ marginTop: 52 }}>
            <Text style={{ fontSize: 15, fontWeight: "900", color: C.slate800, textAlign: "center", marginBottom: 28 }}>
              Përmbledhje Përfundimtare
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 20, alignItems: "flex-start", marginBottom: 28 }}>
              <BankAccounts />
              <TotalsBox subtotalNet={subtotalNet} totalVAT={totalVAT} transporti={transporti} rabati={rabati} grandTotal={grandTotal} user={user} />
            </View>
            <SignatureLines />
          </View>

          <PageFooter pageNum={totalPagesDisplay} totalPagesDisplay={totalPagesDisplay} />
        </Page>
      )}
    </Document>
  );
}
