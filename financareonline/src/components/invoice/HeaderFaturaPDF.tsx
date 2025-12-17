// src/components/invoice/HeaderFaturaPDF.tsx
import { View, Text, StyleSheet, Image, Font } from "@react-pdf/renderer";

Font.register({
  family: "Quicksand",
  fonts: [
    { src: "/fonts/Quicksand-Regular.ttf" },
    { src: "/fonts/Quicksand-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", fontFamily: "Quicksand", marginBottom: 20 },
  column: { width: "48%" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#1d4ed8" },
  text: { fontSize: 10, marginBottom: 3 },
  bold: { fontWeight: "bold" },
  barcodeImage: { width: 180, height: 60, marginTop: 10 },
  barcodeContainer: { alignItems: "center" },
});

export default function HeaderFaturaPDF({ invoiceNumber, business, user }: any) {


  const titleMap: any = {
    FAT: "FATURE",
    PARAGON: "PARAGON",
    OFERTE: "OFERTE",
  };

  return (
    <View style={styles.header}>
      <View style={styles.column}>
        {business.Logo && <Image src={business.Logo} style={{ width: 100, height: 80, marginBottom: 10 }} />}
        <Text style={styles.title}>{business.EmriIBiznesit}</Text>
        <Text style={styles.text}><Text style={styles.bold}>Adresa: </Text>{business.Adresa}</Text>
        <Text style={styles.text}><Text style={styles.bold}>NUI: </Text>{business.NUI} / <Text style={styles.bold}>NF: </Text>{business.NF} / <Text style={styles.bold}>TVSH: </Text>{business.NrTVSH}</Text>
        <Text style={styles.text}><Text style={styles.bold}>Tel: </Text>{business.NrKontaktit} • {business.Email}</Text>
        <Text style={styles.text}><Text style={styles.bold}>Data: </Text>{new Date().toLocaleDateString("sq-AL")}</Text>
      </View>

      <View style={styles.column}>
        <View style={styles.barcodeContainer}>
          <Text style={styles.title}>{titleMap.FAT || "FATURE"}</Text>
          <Text style={{ marginTop: 5, fontSize: 12 }}>{invoiceNumber}</Text>
        </View>

        <Text style={[styles.text, styles.bold, { marginTop: 15 }]}>Klienti:</Text>
        <Text style={styles.text}>{user?.EmriBiznesit || user?.Username || "Klient i përgjithshëm"}</Text>
        <Text style={styles.text}>Kategori: {user?.EmriKategoris || "Pa kategori"}</Text>
      </View>
    </View>
  );
}