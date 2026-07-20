import "./Styles/Fatura.css";
import { View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import { calcLineItem } from "../../lib/invoiceCalc";

Font.register({
  family: "Quicksand",
  fonts: [
    { src: "/fonts/Quicksand-Regular.ttf" },
    { src: "/fonts/Quicksand-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  table: { width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#ccc", fontFamily: "Quicksand" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ccc" },
  header: { backgroundColor: "#f0f0f0", fontWeight: "bold" },
  cell: { padding: 3, fontSize: 7, textAlign: "center" },
  cellNr: { width: "6%" },
  cellShifraBarkodi: { width: "16%", padding: 3, fontSize: 7, textAlign: "center", flexDirection: "column" },
  cellEmertimi: { width: "28%", padding: 3, fontSize: 7, textAlign: "left" },
  cellNjm: { width: "6%" },
  cellSasia: { width: "7%" },
  cellQmPaTVSH: { width: "9%" },
  cellRab: { width: "6%" },
  cellTVSHRate: { width: "5%" },
  cellQmMeRabat: { width: "10%" },
  cellTVSHValue: { width: "8%" },
  cellShuma: { width: "9%" },
});

function TeDhenatFatura({ ProduktiPare, ProduktiFundit, isPDF, data }) {
  const { produktet } = data || {};

  const rows = (produktet || []).slice(ProduktiPare, ProduktiFundit).map((produkti, index) => ({
    produkti,
    index,
    ...calcLineItem(produkti),
  }));

  if (isPDF) {
    return (
      <View style={styles.table}>
        <View style={[styles.row, styles.header]}>
          <Text style={[styles.cell, styles.cellNr]}>Nr.</Text>
          <Text style={[styles.cell, styles.cellShifraBarkodi]}>Shifra / Barkodi</Text>
          <Text style={[styles.cell, styles.cellEmertimi]}>Emërtimi</Text>
          <Text style={[styles.cell, styles.cellNjm]}>Njm</Text>
          <Text style={[styles.cell, styles.cellSasia]}>Sasia</Text>
          <Text style={[styles.cell, styles.cellQmPaTVSH]}>Qm. - TVSH</Text>
          <Text style={[styles.cell, styles.cellRab]}>Rab. %</Text>
          <Text style={[styles.cell, styles.cellTVSHRate]}>T %</Text>
          <Text style={[styles.cell, styles.cellQmMeRabat]}>Qm. + TVSH - Rab</Text>
          <Text style={[styles.cell, styles.cellTVSHValue]}>TVSH €</Text>
          <Text style={[styles.cell, styles.cellShuma]}>Shuma €</Text>
        </View>
        {rows.map(({ produkti, index, qmimiPaTVSH, rabati1, rabati2, rabati3, tvshRate, qmimiMeRabat, tvshValue, shuma, sasia }) => (
          <View style={styles.row} key={index}>
            <Text style={[styles.cell, styles.cellNr]}>{ProduktiPare + index + 1}</Text>
            <View style={[styles.cell, styles.cellShifraBarkodi]}>
              <Text>{produkti.kodiProduktit || ""}</Text>
              <Text>{produkti.barkodi || ""}</Text>
            </View>
            <Text style={[styles.cell, styles.cellEmertimi]}>{produkti.emriProduktit || ""}</Text>
            <Text style={[styles.cell, styles.cellNjm]}>{produkti.emriNjesiaMatese || ""}</Text>
            <Text style={[styles.cell, styles.cellSasia]}>{sasia.toFixed(2)}</Text>
            <Text style={[styles.cell, styles.cellQmPaTVSH]}>{qmimiPaTVSH.toFixed(2)}</Text>
            <Text style={[styles.cell, styles.cellRab]}>{(rabati1 + rabati2 + rabati3).toFixed(2)}</Text>
            <Text style={[styles.cell, styles.cellTVSHRate]}>{tvshRate}</Text>
            <Text style={[styles.cell, styles.cellQmMeRabat]}>{qmimiMeRabat.toFixed(2)}</Text>
            <Text style={[styles.cell, styles.cellTVSHValue]}>{tvshValue.toFixed(2)}</Text>
            <Text style={[styles.cell, styles.cellShuma]}>{shuma.toFixed(2)}</Text>
          </View>
        ))}
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
              <th className="col-emertimi">Emërtimi</th>
              <th className="col-njm">Njm</th>
              <th className="col-sasia">Sasia</th>
              <th className="col-qm-pa-tvsh">Qm. - TVSH</th>
              <th className="col-rab1">Rab. %</th>
              <th className="col-tvsh-rate">T %</th>
              <th className="col-qm-me-rabat">Qm. + TVSH - Rab</th>
              <th className="col-tvsh-value">TVSH €</th>
              <th className="col-shuma">Shuma €</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ produkti, index, qmimiPaTVSH, rabati1, rabati2, rabati3, tvshRate, qmimiMeRabat, tvshValue, shuma, sasia }) => (
              <tr key={index}>
                <td className="col-nr">{ProduktiPare + index + 1}</td>
                <td className="col-shifra">{produkti.kodiProduktit || ""}</td>
                <td className="col-emertimi">
                  {produkti.emriProduktit || ""} {produkti.barkodi || ""}
                </td>
                <td className="col-njm">{produkti.emriNjesiaMatese || ""}</td>
                <td className="col-sasia">{sasia.toFixed(2)}</td>
                <td className="col-qm-pa-tvsh">{qmimiPaTVSH.toFixed(2)}</td>
                <td className="col-rab1">{(rabati1 + rabati2 + rabati3).toFixed(2)}</td>
                <td className="col-tvsh-rate">{tvshRate}</td>
                <td className="col-qm-me-rabat">{qmimiMeRabat.toFixed(2)}</td>
                <td className="col-tvsh-value">{tvshValue.toFixed(2)}</td>
                <td className="col-shuma">{shuma.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TeDhenatFatura;
