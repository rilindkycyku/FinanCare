import "./Styles/Fatura.css";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  column: { width: "48%", fontSize: 9 },
  bold: { fontWeight: "bold", marginTop: 6 },
  hr: { borderBottomWidth: 1, borderColor: "black", marginVertical: 5 },
  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  signature: { textAlign: "center", fontSize: 7, marginTop:20 },
  bankTable: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 5,
  },
  bankRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ccc" },
  bankHeader: { backgroundColor: "#f0f0f0" },
  bankCell: { flex: 1, padding: 3, fontSize: 7, textAlign: "center" },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ccc" },
  header: { backgroundColor: "#f0f0f0" },
  cell: { flex: 1, padding: 3, fontSize: 7, textAlign: "center" },
  boldT: {
    fontWeight: "bold",
  },
  total: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
  },
});

function FooterFatura({ faturaID, Barkodi, isPDF, data }) {
  const { teDhenatFat, produktet, bankat } = data || {};
  const konvertimiValutave = { USD: 1.1, CHF: 0.95 };

  const llojiKalkulimit = teDhenatFat?.regjistrimet?.llojiKalkulimit;
  const totaliMeTVSH = parseFloat(teDhenatFat?.totaliMeTVSH) || 0;
  const rabati = parseFloat(teDhenatFat?.rabati) || 0;

  const activeBanks = bankat.filter(
    (banka) => banka.banka && banka.banka.isDeleted !== "true"
  );

  const bankTable = (isPDF) => {
    if (activeBanks.length === 0) {
      return isPDF ? (
        <Text style={styles.text}>Nuk ka të dhëna për bankat.</Text>
      ) : (
        <p>Nuk ka të dhëna për bankat.</p>
      );
    }

    return isPDF ? (
      <View style={styles.bankTable}>
        <View style={[styles.bankRow, styles.bankHeader]}>
          <Text style={styles.bankCell}>Emri i Bankës</Text>
          <Text style={styles.bankCell}>Numri i Llogarisë</Text>
          <Text style={styles.bankCell}>Valuta</Text>
        </View>
        {activeBanks.map((banka, index) => (
          <View style={styles.bankRow} key={banka.idLlogariaBankare || index}>
            <Text style={styles.bankCell}>{banka.banka.emriBankes || ""}</Text>
            <Text style={styles.bankCell}>{banka.numriLlogaris || ""}</Text>
            <Text style={styles.bankCell}>{banka.valuta || ""}</Text>
          </View>
        ))}
      </View>
    ) : (
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "9pt",
          marginTop: "5px",
        }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ccc", padding: "4px" }}>
              Emri i Bankës
            </th>
            <th style={{ border: "1px solid #ccc", padding: "4px" }}>
              Numri i Llogarisë
            </th>
            <th style={{ border: "1px solid #ccc", padding: "4px" }}>Valuta</th>
          </tr>
        </thead>
        <tbody>
          {activeBanks.map((banka, index) => (
            <tr key={banka.idLlogariaBankare || index}>
              <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                {banka.banka.emriBankes || ""}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                {banka.numriLlogaris || ""}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "4px" }}>
                {banka.valuta || ""}
              </td>
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
            <>
              <Text style={styles.text}>
                Gjatë pagesës ju lutem të shkruani numrin e Faturës:{" "}
                <Text style={styles.bold}>{Barkodi}</Text>
              </Text>
              <Text style={styles.text}>
                <Text style={styles.bold}>
                  Pagesa duhet të bëhet në një nga llogaritë e cekura më poshtë:
                </Text>
              </Text>
              {bankTable(true)}
            </>
          </View>
          <View style={styles.column}>
            <View style={styles.table}>
              {/* Row 1 */}
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>
                  Nëntotali
                </Text>
                <Text style={styles.cell}>
                  {(totaliMeTVSH + rabati).toFixed(2)} €
                </Text>
              </View>

              {/* Row 2 */}
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>
                  Rabati
                </Text>
                <Text style={styles.cell}>{(-rabati).toFixed(2)} €</Text>
              </View>

              {/* Row 3 */}
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>
                  Totali Pa TVSH
                </Text>
                <Text style={styles.cell}>
                  {parseFloat(teDhenatFat?.totaliPaTVSH || 0).toFixed(2)} €
                </Text>
              </View>

              {/* Row 4 */}
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>
                  TVSH 8%
                </Text>
                <Text style={styles.cell}>
                  {parseFloat(teDhenatFat?.tvsH8 || 0).toFixed(2)} €
                </Text>
              </View>

              {/* Row 5 */}
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>
                  TVSH 18%
                </Text>
                <Text style={styles.cell}>
                  {parseFloat(teDhenatFat?.tvsH18 || 0).toFixed(2)} €
                </Text>
              </View>

              {/* Total Price */}
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>
                  Çmimi Total
                </Text>
                <Text style={[styles.cell, styles.header, styles.boldT]}>
                  {totaliMeTVSH.toFixed(2)} €
                </Text>
              </View>

              {/* Converted Prices */}
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>
                  Çmimi Total $
                </Text>
                <Text style={[styles.cell, styles.header, styles.boldT]}>
                  {(totaliMeTVSH * (konvertimiValutave?.USD || 1)).toFixed(2)} $
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>
                  Çmimi Total CHF
                </Text>
                <Text style={[styles.cell, styles.header, styles.boldT]}>
                  {(totaliMeTVSH * (konvertimiValutave?.CHF || 1)).toFixed(2)}{" "}
                  CHF
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.hr} />
        <View style={styles.signatures}>
          <View style={styles.signature}>
            <Text>_________________________________________________</Text>
            <Text>(Emri, Mbiemri, Nënshkrimi & Vula)</Text>
            <Text>(Personi Përgjegjës)</Text>
            <Text style={styles.bold}>
              © FinanCare - POS, eOrder & More by Rilind Kyçyku
            </Text>
          </View>
          <View style={styles.signature}>
            <Text>_________________________________________________</Text>
            <Text>(Emri, Mbiemri, Nënshkrimi & Vula)</Text>
            <Text>(Klienti)</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <div style={{ marginTop: "auto" }}>
      <div className="header">
        <div className="teDhenatKompanis">
          {["FAT", "FL", "KMB", "HYRJE"].includes(llojiKalkulimit) && (
            <>
              <p>
                Gjatë pagesës ju lutem të shkruani numrin e Faturës:{" "}
                <strong>{Barkodi}</strong>
              </p>
              <p>
                <strong>
                  Pagesa duhet të bëhet në një nga llogaritë e cekura më poshtë:
                </strong>
              </p>
              {bankTable(false)}
            </>
          )}
        </div>
        <div className="data">
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
            {parseFloat(teDhenatFat?.totaliPaTVSH || 0).toFixed(2)} €
          </p>
          <p>
            <strong>TVSH 8%: </strong>
            {parseFloat(teDhenatFat?.tvsH8 || 0).toFixed(2)} €
          </p>
          <p>
            <strong>TVSH 18%: </strong>
            {parseFloat(teDhenatFat?.tvsH18 || 0).toFixed(2)} €
          </p>
          <p>
            <strong style={{ fontSize: "14pt" }}>Çmimi Total: </strong>
            <strong style={{ fontSize: "14pt" }}>
              {totaliMeTVSH.toFixed(2)} €
            </strong>
          </p>
          <p style={{ fontSize: "10pt" }}>
            {(totaliMeTVSH * (konvertimiValutave?.USD || 1)).toFixed(2)} $
          </p>
          <p style={{ fontSize: "10pt" }}>
            {(totaliMeTVSH * (konvertimiValutave?.CHF || 1)).toFixed(2)} CHF
          </p>
        </div>
      </div>
      <hr
        style={{
          height: "1px",
          borderWidth: "0",
          backgroundColor: "black",
          margin: "0.5em 0",
        }}
      />
      <div className="nenshkrimet">
        <div className="nenshkrimi">
          <span>_________________________________________________</span>
          <span>(Emri, Mbiemri, Nëënshkrimi & Vula)</span>
          <span>(Personi Përgjegjës)</span>
          <br />
          <strong>© FinanCare - POS, eOrder & More by Rilind Kyçyku</strong>
        </div>
        <div className="nenshkrimi">
          <span>_________________________________________________</span>
          <span>(Emri, Mbiemri, Nëënshkrimi)</span>
          <span>(Klienti)</span>
        </div>
      </div>
    </div>
  );
}

export default FooterFatura;
