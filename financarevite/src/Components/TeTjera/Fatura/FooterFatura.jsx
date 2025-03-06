import "./Styles/Fatura.css";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  column: { width: "48%", fontSize: 9 }, // Adjusted
  bold: { fontWeight: "bold" },
  hr: { borderBottomWidth: 1, borderColor: "black", marginVertical: 5 },
  signatures: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  signature: { textAlign: "center", fontSize: 7 }, // Adjusted
});

function FooterFatura({ faturaID, Barkodi, isPDF, data }) {
  const { teDhenatFat, produktet } = data || {};
  const bankat = []; // Mocked for now; fetch this data if needed
  const konvertimiValutave = { USD: 1.1, CHF: 0.95 }; // Mocked; fetch via API if needed

  const llojiKalkulimit = teDhenatFat?.regjistrimet?.llojiKalkulimit;
  const totaliMeTVSH = parseFloat(teDhenatFat?.totaliMeTVSH) || 0;
  const rabati = parseFloat(teDhenatFat?.rabati) || 0;

  if (isPDF) {
    return (
      <View style={{ marginTop: "auto" }}>
        <View style={styles.footer}>
          <View style={styles.column}>
            {["FAT", "FL", "KMB", "HYRJE"].includes(llojiKalkulimit) && (
              <>
                <Text style={styles.text}>Gjate pageses ju lutem te shkruani numrin e Fatures: <Text style={styles.bold}>{Barkodi}</Text></Text>
                <Text style={styles.text}><Text style={styles.bold}>Pagesa duhet te behet ne nje nga llogarit e cekura me poshte:</Text></Text>
                {/* Add bank table if bankat data is available */}
              </>
            )}
          </View>
          <View style={styles.column}>
            <Text style={styles.text}><Text style={styles.bold}>Nentotali: </Text>{(totaliMeTVSH + rabati).toFixed(2)} €</Text>
            <Text style={styles.text}><Text style={styles.bold}>Rabati: </Text>{(-rabati).toFixed(2)} €</Text>
            <Text style={styles.text}><Text style={styles.bold}>Totali Pa TVSH: </Text>{parseFloat(teDhenatFat?.totaliPaTVSH || 0).toFixed(2)} €</Text>
            <Text style={styles.text}><Text style={styles.bold}>TVSH 8%: </Text>{parseFloat(teDhenatFat?.tvsH8 || 0).toFixed(2)} €</Text>
            <Text style={styles.text}><Text style={styles.bold}>TVSH 18%: </Text>{parseFloat(teDhenatFat?.tvsH18 || 0).toFixed(2)} €</Text>
            <Text style={styles.text}><Text style={styles.bold}>Qmimi Total: </Text><Text style={{ fontSize: 12 }}>{totaliMeTVSH.toFixed(2)} €</Text></Text>
            <Text style={styles.text}>{(totaliMeTVSH * (konvertimiValutave?.USD || 1)).toFixed(2)} $</Text>
            <Text style={styles.text}>{(totaliMeTVSH * (konvertimiValutave?.CHF || 1)).toFixed(2)} CHF</Text>
          </View>
        </View>
        <View style={styles.hr} />
        <View style={styles.signatures}>
          <View style={styles.signature}>
            <Text>_________________________________________________</Text>
            <Text>(Emri, Mbiemri, Nenshkrimi & Vula)</Text>
            <Text>(Personi Përgjegjës)</Text>
            <Text style={styles.bold}>© FinanCare - POS, eOrder & More by Rilind Kyçyku</Text>
          </View>
          <View style={styles.signature}>
            <Text>_________________________________________________</Text>
            <Text>(Emri, Mbiemri, Nenshkrimi)</Text>
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
              <p>Gjate pageses ju lutem te shkruani numrin e Fatures: <strong>{Barkodi}</strong></p>
              <p><strong>Pagesa duhet te behet ne nje nga llogarit e cekura me poshte:</strong></p>
              {/* Add bank table if needed */}
            </>
          )}
        </div>
        <div className="data">
          <p><strong>Nentotali: </strong>{(totaliMeTVSH + rabati).toFixed(2)} €</p>
          <p><strong>Rabati: </strong>{(-rabati).toFixed(2)} €</p>
          <p><strong>Totali Pa TVSH: </strong>{parseFloat(teDhenatFat?.totaliPaTVSH || 0).toFixed(2)} €</p>
          <p><strong>TVSH 8%: </strong>{parseFloat(teDhenatFat?.tvsH8 || 0).toFixed(2)} €</p>
          <p><strong>TVSH 18%: </strong>{parseFloat(teDhenatFat?.tvsH18 || 0).toFixed(2)} €</p>
          <p><strong style={{ fontSize: "14pt" }}>Qmimi Total: </strong><strong style={{ fontSize: "14pt" }}>{totaliMeTVSH.toFixed(2)} €</strong></p>
          <p style={{ fontSize: "10pt" }}>{(totaliMeTVSH * (konvertimiValutave?.USD || 1)).toFixed(2)} $</p>
          <p style={{ fontSize: "10pt" }}>{(totaliMeTVSH * (konvertimiValutave?.CHF || 1)).toFixed(2)} CHF</p>
        </div>
      </div>
      <hr style={{ height: "1px", borderWidth: "0", backgroundColor: "black", margin: "0.5em 0" }} />
      <div className="nenshkrimet">
        <div className="nenshkrimi">
          <span>_________________________________________________</span>
          <span>(Emri, Mbiemri, Nenshkrimi & Vula)</span>
          <span>(Personi Përgjegjës)</span>
          <br />
          <strong>© FinanCare - POS, eOrder & More by Rilind Kyçyku</strong>
        </div>
        <div className="nenshkrimi">
          <span>_________________________________________________</span>
          <span>(Emri, Mbiemri, Nenshkrimi)</span>
          <span>(Klienti)</span>
        </div>
      </div>
    </div>
  );
}

export default FooterFatura;