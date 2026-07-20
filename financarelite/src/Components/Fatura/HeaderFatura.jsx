import "./Styles/Fatura.css";
import { View, Text, StyleSheet, Image, Font } from "@react-pdf/renderer";
import Barcode from "react-barcode";
import JsBarcode from "jsbarcode";

Font.register({
  family: "Quicksand",
  fonts: [
    { src: "/fonts/Quicksand-Regular.ttf" },
    { src: "/fonts/Quicksand-Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Quicksand",
  },
  column: { width: "48%" },
  title: { fontSize: 16, textAlign: "left", marginTop: 2 },
  text: { fontSize: 10, marginBottom: 2 },
  bold: { fontWeight: "bold" },
  barcodeImage: { marginTop: 5 },
  barcodeContainer: { alignItems: "center" },
});

const TITLE_MAP = {
  FAT: "FATURË SHITËSE",
  POR: "POROSI",
  KTHIM: "FLETËKTHIM",
  PARAGON: "PARAGON",
  OFERTE: "OFERTË",
};

function logoSrc(teDhenatBiznesit) {
  return teDhenatBiznesit?.logo || "/img/web/PaLogo.png";
}

function HeaderFatura({ Barkodi, NrFaqes, NrFaqeve, isPDF, data }) {
  const { teDhenatFat, teDhenatBiznesit } = data || {};
  const llojiKalkulimit = teDhenatFat?.regjistrimet?.llojiKalkulimit || "FAT";

  const generateBarcodeDataUrl = () => {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, Barkodi || " ", {
      width: 2,
      height: 40,
      fontSize: 15,
      margin: 6,
      displayValue: true,
    });
    return canvas.toDataURL("image/png");
  };

  if (isPDF) {
    const barcodeDataUrl = generateBarcodeDataUrl();

    return (
      <View style={styles.header}>
        <View style={styles.column}>
          <Image src={logoSrc(teDhenatBiznesit)} style={{ width: 100, height: 50 }} />
          <Text style={[styles.title, styles.bold]}>
            {teDhenatBiznesit?.emriIBiznesit || ""}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Adresa: </Text>
            {teDhenatBiznesit?.adresa || ""}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>NUI: </Text>
            {teDhenatBiznesit?.nui || ""} / <Text style={styles.bold}>NF: </Text>
            {teDhenatBiznesit?.nf || ""} / <Text style={styles.bold}>TVSH: </Text>
            {teDhenatBiznesit?.nrTVSH || ""}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Kontakti: </Text>
            {teDhenatBiznesit?.nrKontaktit || ""} - {teDhenatBiznesit?.email || ""}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Data e Faturës: </Text>
            {new Date(teDhenatFat?.regjistrimet?.dataRegjistrimit || Date.now()).toLocaleDateString("en-GB")}
          </Text>
          {teDhenatFat?.regjistrimet?.pershkrimShtese ? (
            <Text style={styles.text}>
              <Text style={styles.bold}>Shënime Shtesë: </Text>
              {teDhenatFat.regjistrimet.pershkrimShtese}
            </Text>
          ) : null}
          <Text style={styles.bold}>
            Faqe: {NrFaqes} / {NrFaqeve}
          </Text>
        </View>
        <View style={styles.column}>
          <View style={styles.barcodeContainer}>
            <Text style={[styles.title, styles.bold]}>{TITLE_MAP[llojiKalkulimit] || "FATURË"}</Text>
            <Image src={barcodeDataUrl} style={styles.barcodeImage} />
          </View>
          <Text style={styles.text}>
            <Text style={styles.bold}>{teDhenatFat?.regjistrimet?.emriBiznesit || ""}</Text>
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>NUI: </Text>
            {teDhenatFat?.regjistrimet?.nui || ""} / <Text style={styles.bold}>NF: </Text>
            {teDhenatFat?.regjistrimet?.nrf || ""} / <Text style={styles.bold}>TVSH: </Text>
            {teDhenatFat?.regjistrimet?.partneriTVSH || ""}
          </Text>
          <Text style={styles.text}>{teDhenatFat?.regjistrimet?.adresa || ""}</Text>
          <Text style={styles.text}>
            {teDhenatFat?.regjistrimet?.nrKontaktit || ""} - {teDhenatFat?.regjistrimet?.email || ""}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <div className="header">
      <div className="teDhenatKompanis">
        <img src={logoSrc(teDhenatBiznesit)} alt="Logo" style={{ width: "100px", height: "50px", objectFit: "contain" }} />
        <h2>{teDhenatBiznesit?.emriIBiznesit || ""}</h2>
        <p>
          <strong>Adresa: </strong>
          {teDhenatBiznesit?.adresa || ""}
        </p>
        <p>
          <strong>NUI: </strong>
          {teDhenatBiznesit?.nui || ""} / <strong>NF: </strong>
          {teDhenatBiznesit?.nf || ""} / <strong>TVSH: </strong>
          {teDhenatBiznesit?.nrTVSH || ""}
        </p>
        <p>
          <strong>Kontakti: </strong>
          {teDhenatBiznesit?.nrKontaktit || ""} - {teDhenatBiznesit?.email || ""}
        </p>
        <p>
          <strong>Data e Faturës: </strong>
          {new Date(teDhenatFat?.regjistrimet?.dataRegjistrimit || Date.now()).toLocaleDateString("en-GB")}
        </p>
        {teDhenatFat?.regjistrimet?.pershkrimShtese ? (
          <p>
            <strong>Shënime Shtesë: </strong>
            {teDhenatFat.regjistrimet.pershkrimShtese}
          </p>
        ) : null}
      </div>
      <div className="data">
        <div className="barkodi">
          <h3>{TITLE_MAP[llojiKalkulimit] || "FATURË"}</h3>
          <Barcode value={Barkodi || " "} height={50} width={1} fontSize={12} />
        </div>
        <div className="teDhenatEKlientit">
          <p>
            <strong>{teDhenatFat?.regjistrimet?.emriBiznesit || ""}</strong>
          </p>
          <p>
            <strong>NUI: </strong>
            {teDhenatFat?.regjistrimet?.nui || ""} / <strong>NF: </strong>
            {teDhenatFat?.regjistrimet?.nrf || ""} / <strong>TVSH: </strong>
            {teDhenatFat?.regjistrimet?.partneriTVSH || ""}
          </p>
          <p>{teDhenatFat?.regjistrimet?.adresa || ""}</p>
          <p>
            {teDhenatFat?.regjistrimet?.nrKontaktit || ""} - {teDhenatFat?.regjistrimet?.email || ""}
          </p>
        </div>
      </div>
    </div>
  );
}

export default HeaderFatura;
