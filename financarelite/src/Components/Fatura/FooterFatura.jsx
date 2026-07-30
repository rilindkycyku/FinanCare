import { View, Text, Link, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { calcInvoiceTotals } from "../../lib/invoiceCalc";

const FINANCARELITE_DOMAIN = "lite.financare.rilindkycyku.dev";
const FINANCARELITE_URL = `https://${FINANCARELITE_DOMAIN}`;

Font.register({
  family: "Quicksand",
  fonts: [
    { src: "/fonts/Quicksand-Regular.ttf" },
    { src: "/fonts/Quicksand-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 10, fontFamily: "Quicksand" },
  column: { width: "38%", fontSize: 9 },
  text: { fontSize: 9 },
  bold: { fontWeight: "bold", marginTop: 6 },
  hr: { borderBottomWidth: 1, borderColor: "black", marginVertical: 5 },
  signatures: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  signature: { textAlign: "center", fontSize: 7, marginTop: 20 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  // Printed, not just viewed: 6pt grey (#666) and a green link come off a laser printer as pale
  // smudges, and off a low-toner one as nothing at all. Black, a touch larger, bold where it's a
  // line someone actually reads.
  brandText: { fontSize: 6.5, color: "#000000" },
  brandDomain: { fontSize: 6.5, fontWeight: "bold", letterSpacing: 0.5 },
  qrSection: { width: "20%", alignItems: "center", fontSize: 7 },
  qrBlock: { textAlign: "center", fontSize: 7, alignItems: "center" },
  // Printed size matters more than screen size here: a full invoice is a dense, high-version
  // code, and at 85pt (~30 mm) its modules land around a quarter of a millimetre — right at the
  // edge of what a phone can pick off paper. 105pt buys back the margin, and buys the room for
  // the payload to carry a logo without the printed copy becoming unscannable.
  qrImage: { width: 105, height: 105, marginBottom: 4 },
  bankTable: { width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#999", marginTop: 5 },
  bankRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#999" },
  bankHeader: { backgroundColor: "#f0f0f0" },
  bankCell: { flex: 1, padding: 3, fontSize: 7, textAlign: "center" },
  // The account details are what someone actually has to read off the invoice to pay it, so
  // they're set bold (and the number a touch larger) rather than left at the same weight as
  // the column headings above them.
  bankValue: { fontWeight: "bold" },
  bankAccount: { fontWeight: "bold", fontSize: 8 },
  table: { width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#999" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#999" },
  header: { backgroundColor: "#f0f0f0" },
  cell: { flex: 1, padding: 3, fontSize: 7, textAlign: "center" },
  boldT: { fontWeight: "bold" },
  // Still a clickable link in the PDF, just not printed in a colour that disappears in
  // greyscale — the domain is the one thing on this row worth reading off paper.
  link: { color: "#000000", textDecoration: "none" },
});

function FooterFatura({ Barkodi, data }) {
  const { produktet, bankat, teDhenatFat, currencies, qrCodeDataUrl } = data || {};
  // No hardcoded rates/API — the business configures its own currencies (and rates) in
  // Settings; an empty list simply means the invoice shows only the € total.
  const activeCurrencies = (currencies || []).filter((c) => c.code && parseFloat(c.rate) > 0);

  const transporti = parseFloat(teDhenatFat?.regjistrimet?.transporti) || 0;
  // Repeated here, next to the account numbers, because this is the line someone reads when
  // they're actually about to pay — the header states it as a fact, this states it as a deadline.
  const afatiPageses = teDhenatFat?.regjistrimet?.afatiPageses;
  const { totaliMeTVSH, totaliPaTVSH, tvshBreakdown, rabati, totaliFinal } = calcInvoiceTotals(produktet, transporti);

  // Checked on the absolute value: a Fletëkthim (or any type flagged negateAmounts) carries
  // negative amounts throughout, so a discount there lands as a negative number too.
  const kaRabat = Math.abs(rabati) >= 0.005;
  const kaTransport = Math.abs(transporti) >= 0.005;

  const activeBanks = (bankat || []).filter((b) => b.emriBankes);

  const bankTable = () => {
    if (activeBanks.length === 0) {
      return <Text style={styles.text}>Nuk ka të dhëna për bankat.</Text>;
    }
    return (
      <View style={styles.bankTable}>
        <View style={[styles.bankRow, styles.bankHeader]}>
          <Text style={[styles.bankCell, styles.boldT]}>Emri i Bankës</Text>
          <Text style={[styles.bankCell, styles.boldT]}>Numri i Llogarisë</Text>
          <Text style={[styles.bankCell, styles.boldT]}>Valuta</Text>
        </View>
        {activeBanks.map((banka, index) => (
          <View style={styles.bankRow} key={banka.id || index}>
            <Text style={[styles.bankCell, styles.bankValue]}>{banka.emriBankes || ""}</Text>
            <Text style={[styles.bankCell, styles.bankAccount]}>{banka.numriLlogaris || ""}</Text>
            <Text style={[styles.bankCell, styles.bankValue]}>{banka.valuta || ""}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={{ marginTop: "auto" }}>
      <View style={styles.footer}>
        <View style={styles.column}>
          <Text style={styles.text}>
            Gjatë pagesës ju lutem të shkruani numrin e Faturës: <Text style={styles.bold}>{Barkodi}</Text>
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>
              Pagesa duhet të bëhet
              {afatiPageses ? ` deri më ${new Date(afatiPageses).toLocaleDateString("en-GB")}` : ""} në një nga llogaritë e
              cekura më poshtë:
            </Text>
          </Text>
          {bankTable()}
        </View>
        {qrCodeDataUrl && (
          <View style={styles.qrSection}>
            <Image src={qrCodeDataUrl} style={styles.qrImage} />
            <Text>Skano për ta hapur online</Text>
          </View>
        )}
        <View style={styles.column}>
          <View style={styles.table}>
            {/* With no discount and no transport, "Nëntotali" is the same number as "Çmimi
                Total" and "Rabati" is a row of zeroes — an invoice that never carries a discount
                shouldn't have to print either. */}
            {(kaRabat || kaTransport) && (
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>Nëntotali</Text>
                <Text style={[styles.cell, styles.boldT]}>{(totaliMeTVSH + rabati).toFixed(2)} €</Text>
              </View>
            )}
            {kaRabat && (
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>Rabati</Text>
                <Text style={[styles.cell, styles.boldT]}>{(-rabati).toFixed(2)} €</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={[styles.cell, styles.boldT, styles.header]}>Totali Pa TVSH</Text>
              <Text style={[styles.cell, styles.boldT]}>{totaliPaTVSH.toFixed(2)} €</Text>
            </View>
            {tvshBreakdown.map(({ rate, value }) => (
              <View style={styles.row} key={rate}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>TVSH {rate}%</Text>
                <Text style={[styles.cell, styles.boldT]}>{value.toFixed(2)} €</Text>
              </View>
            ))}
            {kaTransport && (
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>Transporti</Text>
                <Text style={[styles.cell, styles.boldT]}>{transporti.toFixed(2)} €</Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={[styles.cell, styles.boldT, styles.header]}>Çmimi Total</Text>
              <Text style={[styles.cell, styles.header, styles.boldT]}>{totaliFinal.toFixed(2)} €</Text>
            </View>
            {activeCurrencies.map((c) => (
              <View style={styles.row} key={c.id || c.code}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>Çmimi Total {c.code}</Text>
                <Text style={[styles.cell, styles.header, styles.boldT]}>
                  {(totaliFinal * parseFloat(c.rate)).toFixed(2)} {c.code}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.hr} />
      <View style={styles.signatures}>
        <View style={styles.signature}>
          <Text>_________________________________________________</Text>
          <Text>(Emri, Mbiemri, Nënshkrimi &amp; Vula)</Text>
          <Text>(Personi Përgjegjës)</Text>
        </View>
        <View style={styles.signature}>
          <Text>_________________________________________________</Text>
          <Text>(Emri, Mbiemri, Nënshkrimi &amp; Vula)</Text>
          <Text>(Klienti)</Text>
        </View>
      </View>
      <View style={styles.brandRow}>
        <Text style={styles.brandText}>
          © 2023 - {new Date().getFullYear()} FinanCareLite - Versioni Bazë i FinanCare, për Faturat, Klientët &amp; Produktet
        </Text>
        <Link src={FINANCARELITE_URL} style={[styles.link, styles.brandDomain]}>
          {FINANCARELITE_DOMAIN.toUpperCase()}
        </Link>
      </View>
    </View>
  );
}

export default FooterFatura;
