import "./Styles/Fatura.css";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  table: { width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#ccc" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ccc" },
  header: { backgroundColor: "#f0f0f0" },
  cell: { flex: 1, padding: 3, fontSize: 7, textAlign: "center" }, // Smaller font and padding
});
function TeDhenatFatura({ faturaID, ProduktiPare, ProduktiFundit, isPDF, data }) {
  const { produktet } = data || {};

  const rows = produktet?.slice(ProduktiPare, ProduktiFundit).map((produkti, index) => {
    const qmimiShites = parseFloat(produkti.qmimiShites) || 0;
    const sasia = parseFloat(produkti.sasiaStokut) || 0;
    const tvshRate = parseFloat(produkti.llojiTVSH) || 0;
    const rabati1 = parseFloat(produkti.rabati1) || 0;
    const rabati2 = parseFloat(produkti.rabati2) || 0;
    const rabati3 = parseFloat(produkti.rabati3) || 0;
    const totalRabati = (rabati1 + rabati2 + rabati3) / 100;
    const qmimiPaTVSH = qmimiShites / (1 + tvshRate / 100);
    const qmimiMeRabat = qmimiShites * (1 - totalRabati);
    const tvshValue = qmimiMeRabat * (tvshRate / 100) * sasia;
    const shuma = qmimiMeRabat * sasia;

    return { produkti, index, qmimiPaTVSH, rabati1, rabati2, rabati3, tvshRate, qmimiMeRabat, tvshValue, shuma, sasia };
  }) || [];

  if (isPDF) {
    return (
      <View style={styles.table}>
        <View style={[styles.row, styles.header]}>
          <Text style={styles.cell}>Nr.</Text>
          <Text style={styles.cell}>Shifra</Text>
          <Text style={styles.cell}>Emertimi</Text>
          <Text style={styles.cell}>Njm</Text>
          <Text style={styles.cell}>Sasia</Text>
          <Text style={styles.cell}>Qm. - TVSH</Text>
          <Text style={styles.cell}>Rab. 1 %</Text>
          <Text style={styles.cell}>Rab. 2 %</Text>
          <Text style={styles.cell}>Rab. 3 %</Text>
          <Text style={styles.cell}>T %</Text>
          <Text style={styles.cell}>Qm. + TVSH - Rab</Text>
          <Text style={styles.cell}>TVSH €</Text>
          <Text style={styles.cell}>Shuma €</Text>
        </View>
        {rows.map(({ produkti, index, qmimiPaTVSH, rabati1, rabati2, rabati3, tvshRate, qmimiMeRabat, tvshValue, shuma, sasia }) => (
          <View style={styles.row} key={index}>
            <Text style={styles.cell}>{ProduktiPare + index + 1}</Text>
            <Text style={styles.cell}>{produkti.kodiProduktit || ""}</Text>
            <Text style={styles.cell}>{produkti.emriProduktit || ""} {produkti.barkodi || ""}</Text>
            <Text style={styles.cell}>{produkti.emriNjesiaMatese || ""}</Text>
            <Text style={styles.cell}>{sasia.toFixed(2)}</Text>
            <Text style={styles.cell}>{qmimiPaTVSH.toFixed(2)}</Text>
            <Text style={styles.cell}>{rabati1.toFixed(2)}</Text>
            <Text style={styles.cell}>{rabati2.toFixed(2)}</Text>
            <Text style={styles.cell}>{rabati3.toFixed(2)}</Text>
            <Text style={styles.cell}>{tvshRate}</Text>
            <Text style={styles.cell}>{qmimiMeRabat.toFixed(2)}</Text>
            <Text style={styles.cell}>{tvshValue.toFixed(2)}</Text>
            <Text style={styles.cell}>{shuma.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <div className="tabelaETeDhenaveProduktit">
      <table>
        <thead>
          <tr>
            <th>Nr.</th>
            <th>Shifra</th>
            <th>Emertimi</th>
            <th>Njm</th>
            <th>Sasia</th>
            <th>Qm. - TVSH</th>
            <th>Rab. 1 %</th>
            <th>Rab. 2 %</th>
            <th>Rab. 3 %</th>
            <th>T %</th>
            <th>Qm. + TVSH - Rab</th>
            <th>TVSH €</th>
            <th>Shuma €</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ produkti, index, qmimiPaTVSH, rabati1, rabati2, rabati3, tvshRate, qmimiMeRabat, tvshValue, shuma, sasia }) => (
            <tr key={index}>
              <td>{ProduktiPare + index + 1}</td>
              <td>{produkti.kodiProduktit || ""}</td>
              <td>{produkti.emriProduktit || ""} {produkti.barkodi || ""}</td>
              <td>{produkti.emriNjesiaMatese || ""}</td>
              <td>{sasia.toFixed(2)}</td>
              <td>{qmimiPaTVSH.toFixed(2)}</td>
              <td>{rabati1.toFixed(2)}</td>
              <td>{rabati2.toFixed(2)}</td>
              <td>{rabati3.toFixed(2)}</td>
              <td>{tvshRate}</td>
              <td>{qmimiMeRabat.toFixed(2)}</td>
              <td>{tvshValue.toFixed(2)}</td>
              <td>{shuma.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TeDhenatFatura;