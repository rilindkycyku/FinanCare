import "./Styles/Fatura.css";
import { View, Text, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between" },
  column: { width: "48%" },
  title: { fontSize: 16, marginBottom: 5 },
  text: { fontSize: 10, marginBottom: 2 },
  bold: { fontWeight: "bold" },
});

function HeaderFatura({ faturaID, Barkodi, NrFaqes, NrFaqeve, isPDF, data }) {
  const { teDhenatFat, teDhenatBiznesit } = data || {};
  const llojiKalkulimit = teDhenatFat?.regjistrimet?.llojiKalkulimit;
  const titleMap = {
    "KMB": "FLETKTHIM",
    "AS": "ASGJESIM I STOKUT",
    "HYRJE": "KALKULIM I MALLIT",
    "FL": "FLETLEJIM",
    "FAT": "FATURE",
    "KMSH": "KTHIM I MALLIT TE SHITUR",
  };

  if (isPDF) {
    return (
      <View style={styles.header}>
        <View style={styles.column}>
          <Image src={`/img/web/${teDhenatBiznesit?.logo || "default.png"}`} style={{ width: 100, height: 50 }} />
          <Text style={styles.title}>{teDhenatBiznesit?.emriIBiznesit || "N/A"}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Adresa: </Text>{teDhenatBiznesit?.adresa || "N/A"}</Text>
          <Text style={styles.text}><Text style={styles.bold}>NUI: </Text>{teDhenatBiznesit?.nui || "N/A"} / <Text style={styles.bold}>NF: </Text>{teDhenatBiznesit?.nf || "N/A"} / <Text style={styles.bold}>TVSH: </Text>{teDhenatBiznesit?.nrTVSH || "N/A"}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Kontakti: </Text>{teDhenatBiznesit?.nrKontaktit || "N/A"} - {teDhenatBiznesit?.email || "N/A"}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Data e Fatures: </Text>{new Date(teDhenatFat?.regjistrimet?.dataRegjistrimit || Date.now()).toLocaleDateString("en-GB")}</Text>
          <Text style={styles.text}><Text style={styles.bold}>Shenime Shtese: </Text>{teDhenatFat?.regjistrimet?.pershkrimShtese || "N/A"}</Text>
          <Text style={styles.bold}>Faqe: {NrFaqes} / {NrFaqeve}</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.title}>{titleMap[llojiKalkulimit] || "N/A"}</Text>
          <Text style={styles.text}>{Barkodi}</Text> {/* Barcode as text; see note below */}
          {llojiKalkulimit === "AS" || llojiKalkulimit === "KMSH" ? (
            <>
              <Text style={styles.text}><Text style={styles.bold}>Personi Pergjegjes: </Text>{teDhenatFat?.regjistrimet?.username || "N/A"}</Text>
              <Text style={styles.text}><Text style={styles.bold}>{llojiKalkulimit === "AS" ? "Nr. Asgjesimit" : "Nr. Referencues"}: </Text>{teDhenatFat?.regjistrimet?.[llojiKalkulimit === "AS" ? "nrRendorFatures" : "nrFatures"] || "N/A"}</Text>
            </>
          ) : (
            <>
              <Text style={styles.text}><Text style={styles.bold}>{teDhenatFat?.regjistrimet?.idPartneri || "N/A"} - {teDhenatFat?.regjistrimet?.shkurtesaPartnerit || "N/A"} / {teDhenatFat?.regjistrimet?.emriBiznesit || "N/A"}</Text></Text>
              <Text style={styles.text}><Text style={styles.bold}>NUI: </Text>{teDhenatFat?.regjistrimet?.nui || "N/A"} / <Text style={styles.bold}>NF: </Text>{teDhenatFat?.regjistrimet?.nrf || "N/A"} / <Text style={styles.bold}>TVSH: </Text>{teDhenatFat?.regjistrimet?.partneriTVSH || "N/A"}</Text>
              <Text style={styles.text}>{teDhenatFat?.regjistrimet?.adresa || "N/A"}</Text>
              <Text style={styles.text}>{teDhenatFat?.regjistrimet?.nrKontaktit || "N/A"} - {teDhenatFat?.regjistrimet?.email || "N/A"}</Text>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <div className="header">
      <div className="teDhenatKompanis">
        <img src={`/img/web/${teDhenatBiznesit?.logo || "default.png"}`} alt="Logo" />
        <h2>{teDhenatBiznesit?.emriIBiznesit || "N/A"}</h2>
        <p><strong>Adresa: </strong>{teDhenatBiznesit?.adresa || "N/A"}</p>
        <p><strong>NUI: </strong>{teDhenatBiznesit?.nui || "N/A"} / <strong>NF: </strong>{teDhenatBiznesit?.nf || "N/A"} / <strong>TVSH: </strong>{teDhenatBiznesit?.nrTVSH || "N/A"}</p>
        <p><strong>Kontakti: </strong>{teDhenatBiznesit?.nrKontaktit || "N/A"} - {teDhenatBiznesit?.email || "N/A"}</p>
        <p><strong>Data e Fatures: </strong>{new Date(teDhenatFat?.regjistrimet?.dataRegjistrimit || Date.now()).toLocaleDateString("en-GB")}</p>
        <p><strong>Shenime Shtese: </strong><span dangerouslySetInnerHTML={{ __html: teDhenatFat?.regjistrimet?.pershkrimShtese || "N/A" }} /></p>
        <strong>Faqe: {NrFaqes} / {NrFaqeve}</strong>
      </div>
      <div className="data">
        <div className="barkodi">
          <h3>{titleMap[llojiKalkulimit] || "N/A"}</h3>
          <Barkodi value={Barkodi} />
        </div>
        <div className="teDhenatEKlientit">
          {llojiKalkulimit === "AS" || llojiKalkulimit === "KMSH" ? (
            <>
              <p><strong>Personi Pergjegjes: </strong>{teDhenatFat?.regjistrimet?.username || "N/A"}</p>
              <p><strong>{llojiKalkulimit === "AS" ? "Nr. Asgjesimit" : "Nr. Referencues"}: </strong>{teDhenatFat?.regjistrimet?.[llojiKalkulimit === "AS" ? "nrRendorFatures" : "nrFatures"] || "N/A"}</p>
            </>
          ) : (
            <>
              <p><strong>{teDhenatFat?.regjistrimet?.idPartneri || "N/A"} - {teDhenatFat?.regjistrimet?.shkurtesaPartnerit || "N/A"} / {teDhenatFat?.regjistrimet?.emriBiznesit || "N/A"}</strong></p>
              <p><strong>NUI: </strong>{teDhenatFat?.regjistrimet?.nui || "N/A"} / <strong>NF: </strong>{teDhenatFat?.regjistrimet?.nrf || "N/A"} / <strong>TVSH: </strong>{teDhenatFat?.regjistrimet?.partneriTVSH || "N/A"}</p>
              <p>{teDhenatFat?.regjistrimet?.adresa || "N/A"}</p>
              <p>{teDhenatFat?.regjistrimet?.nrKontaktit || "N/A"} - {teDhenatFat?.regjistrimet?.email || "N/A"}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeaderFatura;