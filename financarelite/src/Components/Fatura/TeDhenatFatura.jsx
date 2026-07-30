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
  // Used instead of cellEmertimi when nothing on the invoice has a code/barcode: the whole
  // "Shifra / Barkodi" column is dropped and the item name takes over its width.
  cellEmertimiGjere: { width: "44%", padding: 3, fontSize: 7, textAlign: "left" },
  cellNjm: { width: "6%" },
  cellSasia: { width: "7%" },
  cellQmPaTVSH: { width: "9%" },
  cellRab: { width: "6%" },
  cellTVSHRate: { width: "5%" },
  cellQmMeRabat: { width: "10%" },
  cellTVSHValue: { width: "8%" },
  cellShuma: { width: "9%" },
});

function TeDhenatFatura({ ProduktiPare, ProduktiFundit, data }) {
  const { produktet } = data || {};

  // Businesses that don't work with product codes (services, hourly work, anything typed
  // straight onto the invoice) were left with an empty "Shifra / Barkodi" column taking up a
  // sixth of the table — so it's only drawn when at least one item actually has a code. Checked
  // against every item on the invoice, not just this page's, so all pages keep the same columns.
  const shfaqShifren = (produktet || []).some((p) => p?.kodiProduktit || p?.barkodi);
  const emertimiStyle = shfaqShifren ? styles.cellEmertimi : styles.cellEmertimiGjere;

  const rows = (produktet || []).slice(ProduktiPare, ProduktiFundit).map((produkti, index) => ({
    produkti,
    index,
    ...calcLineItem(produkti),
  }));

  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.header]}>
        <Text style={[styles.cell, styles.cellNr]}>Nr.</Text>
        {shfaqShifren && <Text style={[styles.cell, styles.cellShifraBarkodi]}>Shifra / Barkodi</Text>}
        <Text style={[styles.cell, emertimiStyle]}>Emërtimi</Text>
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
          {shfaqShifren && (
            <View style={[styles.cell, styles.cellShifraBarkodi]}>
              <Text>{produkti.kodiProduktit || ""}</Text>
              <Text>{produkti.barkodi || ""}</Text>
            </View>
          )}
          <Text style={[styles.cell, emertimiStyle]}>{produkti.emriProduktit || ""}</Text>
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

export default TeDhenatFatura;
