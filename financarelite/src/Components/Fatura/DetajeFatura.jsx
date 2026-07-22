import { View, StyleSheet, Font } from "@react-pdf/renderer";
import HeaderFatura from "./HeaderFatura";
import TeDhenatFatura from "./TeDhenatFatura";
import FooterFatura from "./FooterFatura";

Font.register({
  family: "Quicksand",
  fonts: [
    { src: "/fonts/Quicksand-Regular.ttf" },
    { src: "/fonts/Quicksand-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 11, fontFamily: "Quicksand" },
  hr: { borderBottomWidth: 1, borderColor: "black", marginVertical: 5 },
});

function DetajeFatura({ nrFatures, Barkodi, ProduktiPare, ProduktiFundit, LargoFooter, NrFaqes, NrFaqeve, data, forceFooterNewPage = false }) {
  const { produktet } = data;
  const pageItems = produktet.slice(ProduktiPare, ProduktiFundit);

  if (pageItems.length === 0) return null;

  return (
    <View style={styles.page}>
      <HeaderFatura faturaID={nrFatures} Barkodi={Barkodi} NrFaqes={NrFaqes} NrFaqeve={NrFaqeve} data={data} />
      <View style={styles.hr} />
      <TeDhenatFatura faturaID={nrFatures} ProduktiPare={ProduktiPare} ProduktiFundit={ProduktiFundit} data={data} />
      {!LargoFooter && !forceFooterNewPage ? (
        <View>
          <View style={styles.hr} />
          <FooterFatura faturaID={nrFatures} Barkodi={Barkodi} data={data} />
        </View>
      ) : null}
    </View>
  );
}

export default DetajeFatura;
