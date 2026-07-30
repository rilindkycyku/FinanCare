import { View, Text, StyleSheet } from "@react-pdf/renderer";
import "./pdfFonts";
import { calcLineItem } from "../../lib/invoiceCalc";

const styles = StyleSheet.create({
  table: { width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: "#999", fontFamily: "Quicksand" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#999" },
  header: { backgroundColor: "#f0f0f0", fontWeight: "bold" },
  cell: { padding: 3, fontSize: 7, textAlign: "center" },
  cellNr: { width: "6%" },
  cellShifraBarkodi: { width: "16%", padding: 3, fontSize: 7, textAlign: "center", flexDirection: "column" },
  cellEmertimi: { width: "28%", padding: 3, fontSize: 7, textAlign: "left" },
  // The item name absorbs whatever the dropped columns leave behind (see `emertimiWidth`).
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
  // Same for the discount: plenty of invoices never carry one, and "Rab. %" full of 0.00 (plus a
  // "- Rab" in the price heading that means nothing) is just noise on those.
  const shfaqRabatin = (produktet || []).some(
    (p) => (parseFloat(p?.rabati1) || 0) + (parseFloat(p?.rabati2) || 0) + (parseFloat(p?.rabati3) || 0) > 0
  );
  // Whatever the dropped columns free up goes to the item name, which is the column that
  // actually runs out of room.
  const emertimiWidth = 28 + (shfaqShifren ? 0 : 16) + (shfaqRabatin ? 0 : 6);
  const emertimiStyle = [styles.cellEmertimi, { width: `${emertimiWidth}%` }];

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
        <Text style={[styles.cell, ...emertimiStyle]}>Emërtimi</Text>
        <Text style={[styles.cell, styles.cellNjm]}>Njm</Text>
        <Text style={[styles.cell, styles.cellSasia]}>Sasia</Text>
        <Text style={[styles.cell, styles.cellQmPaTVSH]}>Qm. - TVSH</Text>
        {shfaqRabatin && <Text style={[styles.cell, styles.cellRab]}>Rab. %</Text>}
        <Text style={[styles.cell, styles.cellTVSHRate]}>T %</Text>
        <Text style={[styles.cell, styles.cellQmMeRabat]}>{shfaqRabatin ? "Qm. + TVSH - Rab" : "Qm. + TVSH"}</Text>
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
          <Text style={[styles.cell, ...emertimiStyle]}>{produkti.emriProduktit || ""}</Text>
          <Text style={[styles.cell, styles.cellNjm]}>{produkti.emriNjesiaMatese || ""}</Text>
          <Text style={[styles.cell, styles.cellSasia]}>{sasia.toFixed(2)}</Text>
          <Text style={[styles.cell, styles.cellQmPaTVSH]}>{qmimiPaTVSH.toFixed(2)}</Text>
          {shfaqRabatin && <Text style={[styles.cell, styles.cellRab]}>{(rabati1 + rabati2 + rabati3).toFixed(2)}</Text>}
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
