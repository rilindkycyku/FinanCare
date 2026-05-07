import "./Styles/Fatura.css";
import { View, Text, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
  family: "Quicksand",
  fonts: [
    { src: "/fonts/Quicksand-Regular.ttf" }, // Regular weight
    { src: "/fonts/Quicksand-Bold.ttf", fontWeight: "bold" }, // Bold weight (if used)
    // Add other weights/styles if needed (e.g., italic, light)
  ],
});

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    fontFamily: "Quicksand",
  },
  column: { width: "48%", fontSize: 9 },
  bold: { fontWeight: "bold", marginTop: 6 },
  hr: { borderBottomWidth: 1, borderColor: "black", marginVertical: 5 },
  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  signature: { textAlign: "center", fontSize: 7, marginTop: 20 },
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

  let calcTotaliMeTVSH = 0;
  let calcTotaliPaTVSH = 0;
  let calcTvsH8 = 0;
  let calcTvsH18 = 0;
  let calcRabati = 0;

  if (produktet && produktet.length > 0) {
    produktet.forEach(p => {
      const sasia = p.sasiaStokut || p.sasia || 0;
      const cmimi = p.qmimiShites || p.qmimi || 0;
      const tvshPerc = p.llojiTVSH || p.produkti?.llojiTVSH || 0;
      const rabatPerc = (p.rabati1 || p.rabati || 0) + (p.rabati2 || 0) + (p.rabati3 || 0);

      const totalBeforeDiscount = sasia * cmimi;
      const discountAmount = totalBeforeDiscount * (rabatPerc / 100);
      const totalAfterDiscount = totalBeforeDiscount - discountAmount;

      const paTvsh = totalAfterDiscount / (1 + tvshPerc / 100);
      const tvshVal = totalAfterDiscount - paTvsh;

      calcTotaliMeTVSH += totalAfterDiscount;
      calcTotaliPaTVSH += paTvsh;
      calcRabati += discountAmount;

      if (tvshPerc === 8) {
        calcTvsH8 += tvshVal;
      } else if (tvshPerc === 18) {
        calcTvsH18 += tvshVal;
      }
    });
  }

  const totaliMeTVSH = parseFloat(teDhenatFat?.totaliMeTVSH) || calcTotaliMeTVSH || 0;
  const rabati = parseFloat(teDhenatFat?.rabati) || calcRabati || 0;
  const totaliPaTVSHVal = parseFloat(teDhenatFat?.totaliPaTVSH) || calcTotaliPaTVSH || 0;
  const tvsH8Val = parseFloat(teDhenatFat?.tvsH8) || calcTvsH8 || 0;
  const tvsH18Val = parseFloat(teDhenatFat?.tvsH18) || calcTvsH18 || 0;
  const transporti = parseFloat(teDhenatFat?.regjistrimet?.transporti) || 0;
  const finalPrice = totaliMeTVSH + transporti;

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
            <tr key={banka.idLlogariaBankare || index}>
              <td>{banka.banka.emriBankes || ""}</td>
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
                  {totaliPaTVSHVal.toFixed(2)} €
                </Text>
              </View>

              {/* Row 4 */}
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>
                  TVSH 8%
                </Text>
                <Text style={styles.cell}>
                  {tvsH8Val.toFixed(2)} €
                </Text>
              </View>

              {/* Row 5 */}
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>
                  TVSH 18%
                </Text>
                <Text style={styles.cell}>
                  {tvsH18Val.toFixed(2)} €
                </Text>
              </View>

              {/* Transporti */}
              {transporti > 0 && (
                <View style={styles.row}>
                  <Text style={[styles.cell, styles.boldT, styles.header]}>
                    Transporti
                  </Text>
                  <Text style={styles.cell}>
                    {transporti.toFixed(2)} €
                  </Text>
                </View>
              )}

              {/* Total Price */}
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>
                  Çmimi Total
                </Text>
                <Text style={[styles.cell, styles.header, styles.boldT]}>
                  {finalPrice.toFixed(2)} €
                </Text>
              </View>

              {/* Converted Prices */}
              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>
                  Çmimi Total $
                </Text>
                <Text style={[styles.cell, styles.header, styles.boldT]}>
                  {(finalPrice * (konvertimiValutave?.USD || 1)).toFixed(2)} $
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={[styles.cell, styles.boldT, styles.header]}>
                  Çmimi Total CHF
                </Text>
                <Text style={[styles.cell, styles.header, styles.boldT]}>
                  {(finalPrice * (konvertimiValutave?.CHF || 1)).toFixed(2)}{" "}
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
            <Text style={[styles.bold, { alignSelf: "flex-end", textAlign: "right" }]}>WWW.RILINDKYCYKU.DEV</Text>
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
            {totaliPaTVSHVal.toFixed(2)} €
          </p>
          <p>
            <strong>TVSH 8%: </strong>
            {tvsH8Val.toFixed(2)} €
          </p>
          <p>
            <strong>TVSH 18%: </strong>
            {tvsH18Val.toFixed(2)} €
          </p>
          {transporti > 0 && (
            <p>
              <strong>Transporti: </strong>
              {transporti.toFixed(2)} €
            </p>
          )}
          <p>
            <strong style={{ fontSize: "14pt" }}>Çmimi Total: </strong>
            <strong style={{ fontSize: "14pt" }}>
              {finalPrice.toFixed(2)} €
            </strong>
          </p>
          <p style={{ fontSize: "10pt" }}>
            {(finalPrice * (konvertimiValutave?.USD || 1)).toFixed(2)} $
          </p>
          <p style={{ fontSize: "10pt" }}>
            {(finalPrice * (konvertimiValutave?.CHF || 1)).toFixed(2)} CHF
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
          <span>(Emri, Mbiemri, Nënshkrimi & Vula)</span>
          <span>(Personi Përgjegjës)</span>
          <br />
          <strong>© FinanCare - POS, eOrder & More by Rilind Kyçyku</strong>
        </div>
        <div className="nenshkrimi">
          <span>_________________________________________________</span>
          <span>(Emri, Mbiemri, Nënshkrimi & Vula)</span>
          <span>(Klienti)</span>
          <br />
          <strong style={{ display: "block", textAlign: "right", width: "100%" }}>WWW.RILINDKYCYKU.DEV</strong>
        </div>
      </div>
    </div>
  );
}

export default FooterFatura;
