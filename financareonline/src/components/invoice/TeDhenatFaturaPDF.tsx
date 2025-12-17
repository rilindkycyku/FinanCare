// src/components/invoice/TeDhenatFaturaPDF.tsx
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  table: { width: "100%", border: "1px solid #ccc", fontFamily: "Quicksand", fontSize: 9 },
  row: { flexDirection: "row", borderBottom: "1px solid #eee" },
  headerRow: { backgroundColor: "#1d4ed8", color: "white", fontWeight: "bold" },
  cell: { padding: 6, textAlign: "center" },
  cellLeft: { textAlign: "left" },
  cellRight: { textAlign: "right" },
  colNr: { width: "5%" },
  colProd: { width: "35%" },
  colQty: { width: "8%" },
  colPrice: { width: "12%" },
  colVat: { width: "8%" },
  colTotal: { width: "14%" },
});

export default function TeDhenatFaturaPDF({ items }: { items: any[] }) {
  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.colNr]}>Nr.</Text>
        <Text style={[styles.cell, styles.colProd, styles.cellLeft]}>Emërtimi</Text>
        <Text style={[styles.cell, styles.colQty]}>Sasia</Text>
        <Text style={[styles.cell, styles.colPrice, styles.cellRight]}>Çmimi pa TVSH</Text>
        <Text style={[styles.cell, styles.colVat]}>TVSH %</Text>
        <Text style={[styles.cell, styles.colTotal, styles.cellRight]}>Totali €</Text>
      </View>

      {items.map((item, i) => {
        const net = item.QmimiProduktit / (1 + parseFloat(item.LlojiTVSH) / 100);
        return (
          <View key={item.ProduktiID} style={styles.row}>
            <Text style={[styles.cell, styles.colNr]}>{i + 1}</Text>
            <Text style={[styles.cell, styles.colProd, styles.cellLeft]}>{item.EmriProduktit}</Text>
            <Text style={[styles.cell, styles.colQty]}>{item.quantity}</Text>
            <Text style={[styles.cell, styles.colPrice, styles.cellRight]}>{net.toFixed(2)}</Text>
            <Text style={[styles.cell, styles.colVat]}>{item.LlojiTVSH}%</Text>
            <Text style={[styles.cell, styles.colTotal, styles.cellRight]}>
              {(item.QmimiProduktit * item.quantity).toFixed(2)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}