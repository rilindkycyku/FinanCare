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
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ccc",
    fontFamily: "Quicksand",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  header: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  cell: {
    padding: 3,
    fontSize: 7,
    textAlign: "center",
  },
  // Specific styles for each column in PDF
  cellNr: { width: "5%" },
  cellShifraBarkodi: {
    width: "20%", // Combined width for Shifra and Barkodi
    padding: 3,
    fontSize: 7,
    textAlign: "center",
    flexDirection: "column", // Stack Shifra and Barkodi vertically
  },
  cellEmertimi: {
    width: "25%", // Increased from 20% since Barkodi is merged
    padding: 3,
    fontSize: 7,
    textAlign: "left",
    numberOfLines: 2,
    textOverflow: "ellipsis",
  },
  cellNjm: { width: "5%" },
  cellSasia: { width: "6%" },
  cellQmPaTVSH: { width: "8%" }, // Back to 8%
  cellRab1: { width: "6%" }, // Back to 6%
  cellRab2: { width: "6%" }, // Back to 6%
  cellRab3: { width: "6%" }, // Back to 6%
  cellTVSHRate: { width: "5%" },
  cellQmMeRabat: { width: "10%" }, // Back to 10%
  cellTVSHValue: { width: "8%" },
  cellShuma: { width: "10%" },
});

function TeDhenatFatura({
  faturaID,
  ProduktiPare,
  ProduktiFundit,
  isPDF,
  data,
}) {
  const { produktet } = data || {};

  const rows =
    produktet?.slice(ProduktiPare, ProduktiFundit).map((produkti, index) => {
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

      return {
        produkti,
        index,
        qmimiPaTVSH,
        rabati1,
        rabati2,
        rabati3,
        tvshRate,
        qmimiMeRabat,
        tvshValue,
        shuma,
        sasia,
      };
    }) || [];

  if (isPDF) {
    return (
      <View style={styles.table}>
        <View style={[styles.row, styles.header]}>
          <Text style={[styles.cell, styles.cellNr]}>Nr.</Text>
          <Text style={[styles.cell, styles.cellShifraBarkodi]}>
            Shifra / Barkodi
          </Text>
          <Text style={[styles.cell, styles.cellEmertimi]}>Emertimi</Text>
          <Text style={[styles.cell, styles.cellNjm]}>Njm</Text>
          <Text style={[styles.cell, styles.cellSasia]}>Sasia</Text>
          <Text style={[styles.cell, styles.cellQmPaTVSH]}>Qm. - TVSH</Text>
          <Text style={[styles.cell, styles.cellRab1]}>Rab. 1 %</Text>
          <Text style={[styles.cell, styles.cellRab2]}>Rab. 2 %</Text>
          <Text style={[styles.cell, styles.cellRab3]}>Rab. 3 %</Text>
          <Text style={[styles.cell, styles.cellTVSHRate]}>T %</Text>
          <Text style={[styles.cell, styles.cellQmMeRabat]}>
            Qm. + TVSH - Rab
          </Text>
          <Text style={[styles.cell, styles.cellTVSHValue]}>TVSH €</Text>
          <Text style={[styles.cell, styles.cellShuma]}>Shuma €</Text>
        </View>
        {rows.map(
          ({
            produkti,
            index,
            qmimiPaTVSH,
            rabati1,
            rabati2,
            rabati3,
            tvshRate,
            qmimiMeRabat,
            tvshValue,
            shuma,
            sasia,
          }) => (
            <View style={styles.row} key={index}>
              <Text style={[styles.cell, styles.cellNr]}>
                {ProduktiPare + index + 1}
              </Text>
              <View style={[styles.cell, styles.cellShifraBarkodi]}>
                <Text>{produkti.kodiProduktit || ""}</Text>
                <Text>{produkti.barkodi || ""}</Text>
              </View>
              <Text style={[styles.cell, styles.cellEmertimi]}>
                {produkti.emriProduktit || ""}
              </Text>
              <Text style={[styles.cell, styles.cellNjm]}>
                {produkti.emriNjesiaMatese || ""}
              </Text>
              <Text style={[styles.cell, styles.cellSasia]}>
                {sasia.toFixed(2)}
              </Text>
              <Text style={[styles.cell, styles.cellQmPaTVSH]}>
                {qmimiPaTVSH.toFixed(2)}
              </Text>
              <Text style={[styles.cell, styles.cellRab1]}>
                {rabati1.toFixed(2)}
              </Text>
              <Text style={[styles.cell, styles.cellRab2]}>
                {rabati2.toFixed(2)}
              </Text>
              <Text style={[styles.cell, styles.cellRab3]}>
                {rabati3.toFixed(2)}
              </Text>
              <Text style={[styles.cell, styles.cellTVSHRate]}>{tvshRate}</Text>
              <Text style={[styles.cell, styles.cellQmMeRabat]}>
                {qmimiMeRabat.toFixed(2)}
              </Text>
              <Text style={[styles.cell, styles.cellTVSHValue]}>
                {tvshValue.toFixed(2)}
              </Text>
              <Text style={[styles.cell, styles.cellShuma]}>
                {shuma.toFixed(2)}
              </Text>
            </View>
          )
        )}
      </View>
    );
  }

  return (
    <div className="tabelaETeDhenaveProduktit">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th className="col-nr">Nr.</th>
              <th className="col-shifra">Shifra</th>
              <th className="col-emertimi">Emertimi</th>
              <th className="col-njm">Njm</th>
              <th className="col-sasia">Sasia</th>
              <th className="col-qm-pa-tvsh">Qm. - TVSH</th>
              <th className="col-rab1">Rab. 1 %</th>
              <th className="col-rab2">Rab. 2 %</th>
              <th className="col-rab3">Rab. 3 %</th>
              <th className="col-tvsh-rate">T %</th>
              <th className="col-qm-me-rabat">Qm. + TVSH - Rab</th>
              <th className="col-tvsh-value">TVSH €</th>
              <th className="col-shuma">Shuma €</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(
              ({
                produkti,
                index,
                qmimiPaTVSH,
                rabati1,
                rabati2,
                rabati3,
                tvshRate,
                qmimiMeRabat,
                tvshValue,
                shuma,
                sasia,
              }) => (
                <tr key={index}>
                  <td className="col-nr">{ProduktiPare + index + 1}</td>
                  <td className="col-shifra">{produkti.kodiProduktit || ""}</td>
                  <td className="col-emertimi">
                    {produkti.emriProduktit || ""} {produkti.barkodi || ""}
                  </td>
                  <td className="col-njm">{produkti.emriNjesiaMatese || ""}</td>
                  <td className="col-sasia">{sasia.toFixed(2)}</td>
                  <td className="col-qm-pa-tvsh">{qmimiPaTVSH.toFixed(2)}</td>
                  <td className="col-rab1">{rabati1.toFixed(2)}</td>
                  <td className="col-rab2">{rabati2.toFixed(2)}</td>
                  <td className="col-rab3">{rabati3.toFixed(2)}</td>
                  <td className="col-tvsh-rate">{tvshRate}</td>
                  <td className="col-qm-me-rabat">{qmimiMeRabat.toFixed(2)}</td>
                  <td className="col-tvsh-value">{tvshValue.toFixed(2)}</td>
                  <td className="col-shuma">{shuma.toFixed(2)}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeDhenatFatura;
