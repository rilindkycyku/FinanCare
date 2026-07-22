import "./Styles/Fatura.css";
import { View, Text, Link, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { calcInvoiceTotals } from "../../lib/invoiceCalc";

const FINANCARELITE_URL = "https://rilindkycyku.com";

Font.register({
  family: "Quicksand",
  fonts: [
    { src: "/fonts/Quicksand-Regular.ttf" },
    { src: "/fonts/Quicksand-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 10, fontFamily: "Quicksand" },
  column: { width: "40%", fontSize: 9 },
  text: { fontSize: 9 },
  bold: { fontWeight: "bold", marginTop: 6 },
  hr: { borderBottomWidth: 1, borderColor: "black", marginVertical: 5 },
  signatures: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  signature: { textAlign: "center", fontSize: 7, marginTop: 20 },
  qrSection: { width: "16%", alignItems: "center", fontSize: 6 },
  qrBlock: { textAlign: "center", fontSize: 7, alignItems: "center" },
  qrImage: { width: 85, height: 85, marginBottom: 4 },
  bankTable: { width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#ccc", marginTop: 5 },
  bankRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ccc" },
  bankHeader: { backgroundColor: "#f0f0f0" },
  bankCell: { flex: 1, padding: 3, fontSize: 7, textAlign: "center" },
  table: { width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#ccc" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ccc" },
  header: { backgroundColor: "#f0f0f0" },
  cell: { flex: 1, padding: 3, fontSize: 7, textAlign: "center" },
  boldT: { fontWeight: "bold" },
  link: { color: "#10b981", textDecoration: "none" },
});

function FooterFatura({ Barkodi, isPDF, data }) {
  const { produktet, banks, teDhenatFat, currencies, qrCodeDataUrl } = data || {};
  // No hardcoded rates/API — the business configures its own currencies (and rates) in
  // Settings; an empty list simply means the invoice shows only the € total.
  const activeCurrencies = (currencies || []).filter((c) => c.code && parseFloat(c.rate) > 0);

  const transporti = parseFloat(teDhenatFat?.regjistrimet?.transporti) || 0;
  const { totaliMeTVSH, totaliPaTVSH, tvshBreakdown, rabati, totaliFinal } = calcInvoiceTotals(produktet, transporti);

  const activeBanks = (banks || []).filter((b) => b.emriBankes);

  const bankTable = (pdf) => {
    if (activeBanks.length === 0) {
      return pdf ? <Text style={styles.text}>Nuk ka të dhëna për bankat.</Text> : <p>Nuk ka të dhëna për bankat.</p>;
    }
    return pdf ? (
      <View style={styles.bankTable}>
        <View style={[styles.bankRow, styles.bankHeader]}>
          <Text style={styles.bankCell}>Emri i Bankës</Text>
          <Text style={styles.bankCell}>Numri i Llogarisë</Text>
          <Text style={styles.bankCell}>Valuta</Text>
        </View>
        {activeBanks.map((banka, index) => (
          <View style={styles.bankRow} key={banka.id || index}>
            <Text style={styles.bankCell}>{banka.emriBankes || ""}</Text>
            <Text style={styles.bankCell}>{banka.numriLlogaris || ""}</Text>
            <Text style={styles.bankCell}>{banka.valuta || ""}</Text>
          </View>
        ))}
      </View>
    ) : (
      <table className="tabela-bankave">
        <thead>
          <tr>
            <th>Emri i Bankës</th>
            <th>Numri i Llogarisë</th>
            <th>Valuta</th>
          </tr>
        </thead>
        <tbody>
          {activeBanks.map((banka, index) => (
            <tr key={banka.id || index}>
              <td>{banka.emriBankes || ""}</td>
              <td>{banka.numriLlogaris || ""}</td>
              <td>{banka.valuta || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (isPDF) {
    return (
      <View style={{ marginTop: "auto" }}>
        <View style={styles.footer}>
          <View style={styles.column}>
            <Text style={styles.text}>
              Gjatë pagesës ju lutem të shkruani numrin e Faturës: <Text style={styles.bold}>{Barkodi}</Text>
            </Text>
            <Text style={styles.text}>
              <Text style={styles.bold}>Pagesa duhet të bëhet në një nga llogaritë e cekura më poshtë:</Text>
            </Text>
            {bankTable(true)}
          </View>
          {qrCodeDataUrl && (
            <View style={styles.qrSection}>
              <Image src={qrCodeDataUrl} style={styles.qrImage} />
              <Text>Skano për ta hapur online</Text>
            </View>
          )}
          <View style={styles.column}>
            <View style={styles.table}>
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>Nëntotali</Text>
                <Text style={styles.cell}>{(totaliMeTVSH + rabati).toFixed(2)} €</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>Rabati</Text>
                <Text style={styles.cell}>{(-rabati).toFixed(2)} €</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>Totali Pa TVSH</Text>
                <Text style={styles.cell}>{totaliPaTVSH.toFixed(2)} €</Text>
              </View>
              {tvshBreakdown.map(({ rate, value }) => (
                <View style={styles.row} key={rate}>
                  <Text style={[styles.cell, styles.boldT, styles.header]}>TVSH {rate}%</Text>
                  <Text style={styles.cell}>{value.toFixed(2)} €</Text>
                </View>
              ))}
              {transporti > 0 && (
                <View style={styles.row}>
                  <Text style={[styles.cell, styles.boldT, styles.header]}>Transporti</Text>
                  <Text style={styles.cell}>{transporti.toFixed(2)} €</Text>
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
            <Text style={styles.bold}>
              © 2023 - {new Date().getFullYear()} <Link src={FINANCARELITE_URL} style={styles.link}>FinanCareLite</Link>
            </Text>
          </View>
          <View style={styles.signature}>
            <Text>_________________________________________________</Text>
            <Text>(Emri, Mbiemri, Nënshkrimi &amp; Vula)</Text>
            <Text>(Klienti)</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <div style={{ marginTop: "auto" }}>
      <div className="header" style={{ alignItems: "flex-start" }}>
        <div className={`teDhenatKompanis${qrCodeDataUrl ? " with-qr" : ""}`}>
          <p>
            Gjatë pagesës ju lutem të shkruani numrin e Faturës: <strong>{Barkodi}</strong>
          </p>
          <p>
            <strong>Pagesa duhet të bëhet në një nga llogaritë e cekura më poshtë:</strong>
          </p>
          {bankTable(false)}
        </div>
        {qrCodeDataUrl && (
          <div className="footer-qr-block">
            <img src={qrCodeDataUrl} alt="QR e faturës" style={{ width: 90, height: 90, marginBottom: 4 }} />
            <span style={{ fontSize: "7pt", fontWeight: "bold", textAlign: "center" }}>Skano për ta hapur online</span>
          </div>
        )}
        <div className={`data${qrCodeDataUrl ? " with-qr" : ""}`}>
          <p>
            <strong>Nëntotali: </strong>
            {(totaliMeTVSH + rabati).toFixed(2)} €
          </p>
          <p>
            <strong>Rabati: </strong>
            {(-rabati).toFixed(2)} €
          </p>
          <p>
            <strong>Totali Pa TVSH: </strong>
            {totaliPaTVSH.toFixed(2)} €
          </p>
          {tvshBreakdown.map(({ rate, value }) => (
            <p key={rate}>
              <strong>TVSH {rate}%: </strong>
              {value.toFixed(2)} €
            </p>
          ))}
          {transporti > 0 && (
            <p>
              <strong>Transporti: </strong>
              {transporti.toFixed(2)} €
            </p>
          )}
          <p>
            <strong style={{ fontSize: "14pt" }}>Çmimi Total: </strong>
            <strong style={{ fontSize: "14pt" }}>{totaliFinal.toFixed(2)} €</strong>
          </p>
          {activeCurrencies.map((c) => (
            <p style={{ fontSize: "10pt" }} key={c.id || c.code}>
              {(totaliFinal * parseFloat(c.rate)).toFixed(2)} {c.code}
            </p>
          ))}
        </div>
      </div>
      <hr style={{ height: "1px", borderWidth: "0", backgroundColor: "black", margin: "0.5em 0" }} />
      <div className="nenshkrimet">
        <div className="nenshkrimi">
          <span>_________________________________________________</span>
          <span>(Emri, Mbiemri, Nënshkrimi &amp; Vula)</span>
          <span>(Personi Përgjegjës)</span>
          <br />
          <strong>
            © 2023 - {new Date().getFullYear()}{" "}
            <a href={FINANCARELITE_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#10b981", textDecoration: "none" }}>
              FinanCareLite
            </a>
          </strong>
        </div>
        <div className="nenshkrimi">
          <span>_________________________________________________</span>
          <span>(Emri, Mbiemri, Nënshkrimi &amp; Vula)</span>
          <span>(Klienti)</span>
        </div>
      </div>
    </div>
  );
}

export default FooterFatura;
