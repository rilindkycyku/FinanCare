// src/components/SignupPDF.tsx
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import businessData from "../data/business.json";

const business = businessData.business;

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 35,
    paddingTop: 30,
    paddingBottom: 50,
    fontSize: 10,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1.6,
    borderBottomColor: "#60a5fa",
  },

  logo: {
    width: 82,
    height: 82,
    borderRadius: 12,
    objectFit: "contain",
    borderWidth: 1.8,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8f9ff",
    padding: 6,
  },

  companyInfo: {
    flex: 1,
    marginLeft: 20,
    marginTop: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1e40af",
    marginBottom: 6,
    letterSpacing: 0.5,
  },

  subtitle: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 10,
  },

  infoText: {
    fontSize: 9.8,
    color: "#475569",
    lineHeight: 1.5,
  },

  requestBox: {
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#60a5fa",
  },

  requestTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1e40af",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  requestDate: {
    fontSize: 10.5,
    color: "#2563eb",
    marginTop: 4,
  },

  table: {
    marginTop: 25,
    borderWidth: 1.4,
    borderColor: "#60a5fa",
    borderRadius: 10,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 0.8,
    borderBottomColor: "#e2e8f0",
  },

  rowAlt: {
    backgroundColor: "#ffffff",
  },

  cellLabel: {
    width: "38%",
    padding: 11,
    fontSize: 10.5,
    fontWeight: "700",
    color: "#1e40af",
    backgroundColor: "rgba(96,165,250,0.08)",
  },

  cellValue: {
    width: "62%",
    padding: 11,
    fontSize: 10.8,
    color: "#1e293b",
    fontWeight: "600",
  },

  passwordRow: {
    backgroundColor: "#fef3c7",
  },

  passwordText: {
    color: "#92400e",
    fontWeight: "900",
  },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 35,
    right: 35,
    textAlign: "center",
    fontSize: 9,
    color: "#64748b",
    borderTopWidth: 0.8,
    borderTopColor: "#cbd5e1",
    paddingTop: 10,
  },
});

type SignupPDFProps = {
  data: {
    emriBiznesit: string;
    username: string;
    password: string; // tani e tregojmë
    email: string;
    nrKontaktit: string;
    nui: string;
    nrf: string;
    tvsh: string;
    adresa: string;
  };
};

export default function SignupPDF({ data }: SignupPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER – IDENTIK ME FATURËN */}
        <View style={styles.header}>
          <View>
            {business.Logo && (
              <Image src={"/img/web/" + business.Logo} style={styles.logo} />
            )}
          </View>

          <View style={styles.companyInfo}>
            <Text style={styles.title}>{business.EmriIBiznesit}</Text>
            <Text style={styles.subtitle}>Kërkesë për Regjistrim në Sistem</Text>
            <Text style={styles.infoText}>
              {business.Adresa} • NUI: {business.NUI} • TVSH: {business.NrTVSH}
            </Text>
            <Text style={styles.infoText}>Tel: {business.NrKontaktit}</Text>
          </View>

          <View style={styles.requestBox}>
            <Text style={styles.requestTitle}>Kërkesë Regjistrimi</Text>
            <Text style={styles.requestDate}>
              {new Date().toLocaleDateString("sq-AL")} ora{" "}
              {new Date().toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>

        {/* TABELA KOMPakte ME TË GJITHA TË DHËNAT */}
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.cellLabel}>Emri i Biznesit</Text>
            <Text style={styles.cellValue}>{data.emriBiznesit || "-"}</Text>
          </View>
          <View style={[styles.row, styles.rowAlt]}>
            <Text style={styles.cellLabel}>Username</Text>
            <Text style={styles.cellValue}>{data.username}</Text>
          </View>
          <View style={[styles.row, styles.passwordRow]}>
            <Text style={styles.cellLabel}>Fjalëkalimi</Text>
            <Text style={[styles.cellValue, styles.passwordText]}>{data.password}</Text>
          </View>
          <View style={[styles.row, styles.rowAlt]}>
            <Text style={styles.cellLabel}>Email</Text>
            <Text style={styles.cellValue}>{data.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cellLabel}>Nr. Kontaktit</Text>
            <Text style={styles.cellValue}>{data.nrKontaktit || "-"}</Text>
          </View>
          <View style={[styles.row, styles.rowAlt]}>
            <Text style={styles.cellLabel}>NUI</Text>
            <Text style={styles.cellValue}>{data.nui || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cellLabel}>NRF / NF</Text>
            <Text style={styles.cellValue}>{data.nrf || "-"}</Text>
          </View>
          <View style={[styles.row, styles.rowAlt]}>
            <Text style={styles.cellLabel}>Numri TVSH</Text>
            <Text style={styles.cellValue}>{data.tvsh || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cellLabel}>Adresa</Text>
            <Text style={styles.cellValue}>{data.adresa || "-"}</Text>
          </View>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          Kërkesa u gjenerua automatikisht nga platforma • {business.EmriIBiznesit} ©{" "}
          {new Date().getFullYear()} • Ju lutemi aktivizoni brenda 48 orëve
        </Text>
      </Page>
    </Document>
  );
}