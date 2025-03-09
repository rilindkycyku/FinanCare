import "./Styles/Fatura.css";
import { useRef } from "react";
import { View, Text, StyleSheet, Image, Font } from "@react-pdf/renderer";
import Barcode from "react-barcode"; // For UI
import JsBarcode from "jsbarcode"; // For PDF

Font.register({
  family: "Quicksand",
  fonts: [
    { src: "/fonts/Quicksand-Regular.ttf" }, // Regular weight
    { src: "/fonts/Quicksand-Bold.ttf", fontWeight: "bold" }, // Bold weight (if used)
    // Add other weights/styles if needed (e.g., italic, light)
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

function HeaderFatura({ faturaID, Barkodi, NrFaqes, NrFaqeve, isPDF, data }) {
  const { teDhenatFat, teDhenatBiznesit } = data || {};
  const llojiKalkulimit = teDhenatFat?.regjistrimet?.llojiKalkulimit;
  const titleMap = {
    KMB: "FLETKTHIM",
    AS: "ASGJESIM I STOKUT",
    HYRJE: "KALKULIM I MALLIT",
    FL: "FLETLEJIM",
    FAT: "FATURE",
    KMSH: "KTHIM I MALLIT TE SHITUR",
    KLFV: "KALKULIMI FILLESTAR VJETORE",
    OFERTE: "OFERTE",
    PAGES: "PAGES FATURE",
    PARAGON: "PARAGON",
  };

  // Generate barcode as data URL for PDF
  const barcodeRef = useRef(null);
  const generateBarcodeDataUrl = () => {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, Barkodi, {
      width: 2, // 4 pixels per bar for good scanner readability
      height: 40, // Taller barcode for better scan detection
      fontSize: 15, // Readable text size
      margin: 6, // Quiet zones around barcode
      displayValue: true, // Show barcode value below
    });
    return canvas.toDataURL("image/png");
  };

  if (isPDF) {
    const barcodeDataUrl = generateBarcodeDataUrl();

    return (
      <View style={styles.header}>
        <View style={styles.column}>
          <Image
            src={`/img/web/${teDhenatBiznesit?.logo || "default.png"}`}
            style={{ width: 100, height: 50 }}
          />
          <Text style={[styles.title, styles.bold]}>
            {teDhenatBiznesit?.emriIBiznesit || ""}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Adresa: </Text>
            {teDhenatBiznesit?.adresa || ""}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>NUI: </Text>
            {teDhenatBiznesit?.nui || ""} /{" "}
            <Text style={styles.bold}>NF: </Text>
            {teDhenatBiznesit?.nf || ""} /{" "}
            <Text style={styles.bold}>TVSH: </Text>
            {teDhenatBiznesit?.nrTVSH || ""}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Kontakti: </Text>
            {teDhenatBiznesit?.nrKontaktit || ""} -{" "}
            {teDhenatBiznesit?.email || ""}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Data e Fatures: </Text>
            {new Date(
              teDhenatFat?.regjistrimet?.dataRegjistrimit || Date.now()
            ).toLocaleDateString("en-GB")}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Shenime Shtese: </Text>
            {teDhenatFat?.regjistrimet?.pershkrimShtese || ""}
          </Text>
          <Text style={styles.bold}>
            Faqe: {NrFaqes} / {NrFaqeve}
          </Text>
        </View>
        <View style={styles.column}>
          <View style={styles.barcodeContainer}>
            <Text style={[styles.title, styles.bold]}>
              {titleMap[llojiKalkulimit] || ""}
            </Text>
            <Image src={barcodeDataUrl} style={styles.barcodeImage} />
          </View>
          {llojiKalkulimit === "AS" || llojiKalkulimit === "KMSH" ? (
            <>
              <Text style={styles.text}>
                <Text style={styles.bold}>Personi Pergjegjes: </Text>
                {teDhenatFat?.regjistrimet?.username || ""}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.bold}>
                  {llojiKalkulimit === "AS"
                    ? "Nr. Asgjesimit"
                    : "Nr. Referencues"}
                  :{" "}
                </Text>
                {teDhenatFat?.regjistrimet?.[
                  llojiKalkulimit === "AS" ? "nrRendorFatures" : "nrFatures"
                ] || ""}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.text}>
                <Text style={styles.bold}>
                  {teDhenatFat?.regjistrimet?.idPartneri || ""} -{" "}
                  {teDhenatFat?.regjistrimet?.shkurtesaPartnerit || ""} /{" "}
                  {teDhenatFat?.regjistrimet?.emriBiznesit || ""}
                </Text>
              </Text>
              <Text style={styles.text}>
                <Text style={styles.bold}>NUI: </Text>
                {teDhenatFat?.regjistrimet?.nui || ""} /{" "}
                <Text style={styles.bold}>NF: </Text>
                {teDhenatFat?.regjistrimet?.nrf || ""} /{" "}
                <Text style={styles.bold}>TVSH: </Text>
                {teDhenatFat?.regjistrimet?.partneriTVSH || ""}
              </Text>
              <Text style={styles.text}>
                {teDhenatFat?.regjistrimet?.adresa || ""}
              </Text>
              <Text style={styles.text}>
                {teDhenatFat?.regjistrimet?.nrKontaktit || ""} -{" "}
                {teDhenatFat?.regjistrimet?.email || ""}
              </Text>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <div className="header">
      <div className="teDhenatKompanis">
        <img
          src={`/img/web/${teDhenatBiznesit?.logo || "default.png"}`}
          alt="Logo"
          style={{ width: "100px", height: "50px" }}
        />
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
          {teDhenatBiznesit?.nrKontaktit || ""} -{" "}
          {teDhenatBiznesit?.email || ""}
        </p>
        <p>
          <strong>Data e Fatures: </strong>
          {new Date(
            teDhenatFat?.regjistrimet?.dataRegjistrimit || Date.now()
          ).toLocaleDateString("en-GB")}
        </p>
        <p>
          <strong>Shenime Shtese: </strong>
          <span
            dangerouslySetInnerHTML={{
              __html: teDhenatFat?.regjistrimet?.pershkrimShtese || "",
            }}
          />
        </p>
      </div>
      <div className="data">
        <div className="barkodi">
          <h3>{titleMap[llojiKalkulimit] || ""}</h3>
          <Barcode
            value={Barkodi}
            height={50}
            width={1}
            fontSize={12}
            ref={barcodeRef}
          />
        </div>
        <div className="teDhenatEKlientit">
          {llojiKalkulimit === "AS" || llojiKalkulimit === "KMSH" ? (
            <>
              <p>
                <strong>Personi Pergjegjes: </strong>
                {teDhenatFat?.regjistrimet?.username || ""}
              </p>
              <p>
                <strong>
                  {llojiKalkulimit === "AS"
                    ? "Nr. Asgjesimit"
                    : "Nr. Referencues"}
                  :{" "}
                </strong>
                {teDhenatFat?.regjistrimet?.[
                  llojiKalkulimit === "AS" ? "nrRendorFatures" : "nrFatures"
                ] || ""}
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>
                  {teDhenatFat?.regjistrimet?.idPartneri || ""} -{" "}
                  {teDhenatFat?.regjistrimet?.shkurtesaPartnerit || ""} /{" "}
                  {teDhenatFat?.regjistrimet?.emriBiznesit || ""}
                </strong>
              </p>
              <p>
                <strong>NUI: </strong>
                {teDhenatFat?.regjistrimet?.nui || ""} / <strong>NF: </strong>
                {teDhenatFat?.regjistrimet?.nrf || ""} / <strong>TVSH: </strong>
                {teDhenatFat?.regjistrimet?.partneriTVSH || ""}
              </p>
              <p>{teDhenatFat?.regjistrimet?.adresa || ""}</p>
              <p>
                {teDhenatFat?.regjistrimet?.nrKontaktit || ""} -{" "}
                {teDhenatFat?.regjistrimet?.email || ""}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeaderFatura;
