import "./Styles/Fatura.css";
import { View, StyleSheet } from "@react-pdf/renderer";
import HeaderFatura from "./HeaderFatura";
import TeDhenatFatura from "./TeDhenatFatura";
import FooterFatura from "./FooterFatura";

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 11 },
  hr: { borderBottomWidth: 1, borderColor: "black", marginVertical: 5 },
});

function DetajeFatura({
  nrFatures,
  Barkodi,
  ProduktiPare,
  ProduktiFundit,
  LargoFooter,
  NrFaqes,
  NrFaqeve,
  isPDF,
  data,
  forceFooterNewPage = false,
}) {
  const { produktet } = data;
  const pageItems = produktet.slice(ProduktiPare, ProduktiFundit);

  console.log(
    `DetajeFatura Page ${NrFaqes}: Range ${ProduktiPare}-${ProduktiFundit}, Items: ${pageItems.length}, LargoFooter: ${LargoFooter}, ForceFooterNewPage: ${forceFooterNewPage}`
  );

  if (isPDF) {
    if (pageItems.length === 0) {
      console.log(`Skipping empty PDF page ${NrFaqes}: ${ProduktiPare}-${ProduktiFundit}`);
      return null;
    }

    return (
      <View style={styles.page}>
        <HeaderFatura
          faturaID={nrFatures}
          Barkodi={Barkodi}
          NrFaqes={NrFaqes}
          NrFaqeve={NrFaqeve}
          isPDF={true}
          data={data}
        />
        <View style={styles.hr} />
        <TeDhenatFatura
          faturaID={nrFatures}
          ProduktiPare={ProduktiPare}
          ProduktiFundit={ProduktiFundit}
          isPDF={true}
          data={data}
        />
        {!LargoFooter && !forceFooterNewPage ? (
          <View>
            <View style={styles.hr} />
            <FooterFatura faturaID={nrFatures} Barkodi={Barkodi} isPDF={true} data={data} />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <div style={{ height: "100%" }}>
      <HeaderFatura
        faturaID={nrFatures}
        Barkodi={Barkodi}
        NrFaqes={NrFaqes}
        NrFaqeve={NrFaqeve}
        isPDF={false}
        data={data}
      />
      <hr style={{ height: "1px", borderWidth: "0", backgroundColor: "black", margin: "0.5em 0" }} />
      <TeDhenatFatura
        faturaID={nrFatures}
        ProduktiPare={ProduktiPare}
        ProduktiFundit={ProduktiFundit}
        isPDF={false}
        data={data}
      />
      {!LargoFooter && !forceFooterNewPage ? (
        <div>
          <hr style={{ height: "1px", borderWidth: "0", backgroundColor: "black", margin: "0.5em 0" }} />
          <FooterFatura faturaID={nrFatures} Barkodi={Barkodi} isPDF={false} data={data} />
        </div>
      ) : null}
    </div>
  );
}

export default DetajeFatura;