// src/components/InvoicePDF.tsx
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import businessData from "../data/business.json";

const business = businessData.business;

// Stilet (të njëjta siç i ke – kopjoji krejt)
const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 28,
    paddingTop: 30,
    paddingBottom: 40,
    fontFamily: "Quicksand",
    fontSize: 9.3,
    backgroundColor: "#fff",
    lineHeight: 1.4,
  },

  // === ULTRA COMPACT 3-COLUMN HEADER ===
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    gap: 16,
  },

  logo: {
    width: 78,
    height: 78,
    borderRadius: 10,
    objectFit: "contain",
    backgroundColor: "#f8f9ff",
    padding: 6,
    borderWidth: 1.4,
    borderColor: "#cbd5e1",
  },

  // Center block: Furnitori + Klienti side by side
  centerInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
  },

  infoBlock: {
    flex: 1,
  },

  label: {
    fontSize: 7.8,
    color: "#64748b",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    fontWeight: "600",
  },

  title: {
    fontSize: 11.2,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 3,
  },

  text: {
    fontSize: 8.9,
    color: "#475569",
    lineHeight: 1.38,
  },

  // Right: Invoice Box
  invoiceBox: {
    backgroundColor: "transparent",
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 10,
    minWidth: 152,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.4,
    borderColor: "#475569",
  },

  invoiceTitle: {
    fontSize: 8.6,
    fontWeight: "700",
    letterSpacing: 1.9,
    textTransform: "uppercase",
    color: "#94a3b8",
  },

  invoiceNumber: {
    fontSize: 12.4,
    fontWeight: "900",
    marginVertical: 3.5,
    letterSpacing: 0.6,
    color: "#60a5fa",
  },

  invoiceDate: {
    fontSize: 8.6,
    color: "#94a3b8",
  },

  // === TIGHT TABLE ===
  table: {
    marginTop: 0,
  },

  headerRow: {
    flexDirection: "row",
    backgroundColor: "transparent",
    paddingVertical: 8,
    borderBottomWidth: 2.1,
    borderBottomColor: "#60a5fa",
    fontWeight: "bold",
    fontSize: 9.6,
  },

  row: {
    flexDirection: "row",
    paddingVertical: 6.5,
    borderBottomWidth: 0.8,
    borderBottomColor: "#e2e8f0",
    fontSize: 9.3,
  },

  colNr: { width: "5.5%", textAlign: "center" },
  colItem: { width: "37%", paddingLeft: 6 },
  colQty: { width: "9%", textAlign: "center" },
  colUnit: { width: "13%", textAlign: "right" },
  colVatRate: { width: "9%", textAlign: "center" },
  colVatAmount: { width: "13%", textAlign: "right" },
  colTotal: {
    width: "13.5%",
    textAlign: "right",
    fontWeight: "700",
    color: "#1e40af",
  },

  // === FOOTER ===
  footer: {
    marginTop: 36,
    textAlign: "center",
    fontSize: 8.8,
    color: "#94a3b8",
  },
  discountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8.5,
    paddingHorizontal: 14,
    borderBottomWidth: 0.9,
    borderBottomColor: "#e2e8f0",
  },
  discountLabel: {
    fontSize: 10.6,
    color: "#b91c1c",
    fontWeight: "600",
  },
  discountValue: {
    fontSize: 10.8,
    color: "#b91c1c",
    fontWeight: "700",
  },
});

export type InvoiceItem = {
  ProduktiID: string | number;
  EmriProduktit: string;
  Barkodi?: string;
  quantity: number;
  QmimiProduktit: number;
  LlojiTVSH: string;
  netPrice: number;
  totalVat: number;
  lineTotal: number;
};

type InvoicePDFProps = {
  invoiceNumber: string;
  clientName: string;
  user: any;
  items: InvoiceItem[];
  subtotalNet: number;
  totalVAT: number;
  grandTotal: number;
  paymentMethod: "cash" | "card" ;
  transporti: number;
  rabati: number;
};

export default function InvoicePDF({
  invoiceNumber,
  clientName,
  user,
  items,
  subtotalNet,
  totalVAT,
  grandTotal,
  paymentMethod = "cash",
  transporti = 1.5,
  rabati = 0,
}: InvoicePDFProps) {
  const ITEMS_PER_PAGE = 22;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const lastPageCount = items.length % ITEMS_PER_PAGE || ITEMS_PER_PAGE;
  const moveTotalsToNewPage = lastPageCount > 13;

  return (
    <Document>
      {/* FAQET ME PRODUKTET */}
      {Array.from({ length: totalPages }, (_, pageIndex) => {
        const start = pageIndex * ITEMS_PER_PAGE;
        const end = Math.min(start + ITEMS_PER_PAGE, items.length);
        const pageItems = items.slice(start, end);
        const isLastItemPage = pageIndex === totalPages - 1;

        return (
          <Page key={`page-${pageIndex}`} size="A4" style={styles.page}>
            {/* HEADER START*/}
            {/* HEADER */}
            {/* NEW SUPER COMPACT HEADER – 3 COLUMNS */}
            <View style={styles.header}>
              {/* LEFT: Logo */}
              <View style={{ alignItems: "center" }}>
                {business.Logo && (
                  <Image
                    src={"/img/web/" + business.Logo}
                    style={styles.logo}
                  />
                )}
              </View>

              {/* CENTER: Furnitori + Klienti (now perfectly squeezed in the middle) */}
              <View style={styles.centerInfo}>
                <View style={styles.infoRow}>
                  {/* Furnitori */}
                  <View style={styles.infoBlock}>
                    <Text style={styles.label}>Furnitori</Text>
                    <Text style={styles.title}>{business.EmriIBiznesit}</Text>
                    <Text style={styles.text}>
                      {business?.Adresa && <>{business.Adresa}</>} |{" "}
                      {business?.NUI && <>NUI: {business.NUI}</>} |{" "}
                      {business?.NrKontaktit && <>{business.NrKontaktit}</>} |{" "}
                      {business?.Email && <>{business.Email}</>}
                    </Text>
                  </View>

                  {/* Klienti */}
                  {/* Klienti – TANI ME TË GJITHA TË DHËNAT (si në faturat zyrtare) */}
                  <View style={styles.infoBlock}>
                    <Text style={styles.label}>Klienti</Text>
                    <Text style={styles.title}>{clientName}</Text>

                    <Text style={styles.text}>
                      {user?.Adresa && <>{user.Adresa}</>} |{" "}
                      {user?.NUI && <>NUI: {user.NUI}</>} |{" "}
                      {user?.NrKontaktit && <>{user.NrKontaktit}</>} |{" "}
                      {user?.Email && <>{user.Email}</>}
                    </Text>
                    {/* Të dhënat kryesore të klientit – rreshta të qartë */}
                  </View>
                </View>
              </View>

              {/* RIGHT: Invoice Box */}
              {/* RIGHT: Invoice Box – 100% CLEAN, NO DESIGN */}
              <View style={styles.invoiceBox}>
                <Text style={styles.invoiceTitle}>Faturë Tatimore</Text>
                <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
                <Text style={styles.invoiceDate}>
                  {new Date().toLocaleDateString("en-GB")}
                </Text>

                {/* Lloji i Pagesës – THJESHT TEKST, ASNJË DIZAJN */}
                <Text
                  style={{
                    marginTop: 7,
                    fontSize: 9.2,
                    color: "#475569",
                    textAlign: "center",
                  }}>
                  Pagesa:{" "}
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: "#1e293b",
                    }}>
                    {paymentMethod === "cash"
                      ? "CASH"
                      : paymentMethod === "card"
                      ? "BANK"
                      : "CASH"}
                  </Text>
                </Text>
              </View>
            </View>
            {/* HEADER END*/}

            {/* TABELA */}
            <View style={styles.table}>
              <View style={styles.headerRow}>
                <Text style={styles.colNr}>Nr.</Text>
                <Text style={styles.colItem}>Emri - Barkodi</Text>
                <Text style={styles.colQty}>Sasia</Text>
                <Text style={styles.colUnit}>Ç. pa TVSH</Text>
                <Text style={styles.colVatRate}>TVSH %</Text>
                <Text style={styles.colVatAmount}>TVSH €</Text>
                <Text style={styles.colTotal}>Totali €</Text>
              </View>

              {pageItems.map((item, i) => (
                <View key={item.ProduktiID} style={styles.row}>
                  <Text style={styles.colNr}>{start + i + 1}</Text>
                  <Text style={styles.colItem}>
                    {item.EmriProduktit} - {item.Barkodi || "-"}
                  </Text>
                  <Text style={styles.colQty}>{item.quantity}</Text>
                  <Text style={styles.colUnit}>
                    {item.netPrice.toFixed(2)} €
                  </Text>
                  <Text style={styles.colVatRate}>{item.LlojiTVSH}%</Text>
                  <Text style={styles.colVatAmount}>
                    {item.totalVat.toFixed(2)} €
                  </Text>
                  <Text style={styles.colTotal}>
                    {item.lineTotal.toFixed(2)} €
                  </Text>
                </View>
              ))}
            </View>

            {/* FOOTER START*/}
            {isLastItemPage && !moveTotalsToNewPage && (
              <View style={{ marginTop: 28 }}>
                {/* TOTALS + BANK INFO – SAME AS BEFORE */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 20,
                    alignItems: "flex-start",
                    marginBottom: 32,
                  }}>
                  {/* LEFT: Banking Info */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 10.8,
                        fontWeight: "bold",
                        color: "#1e293b",
                        marginBottom: 9,
                      }}>
                      Të Dhënat Bankare për Pagesë
                    </Text>

                    <View
                      style={{
                        borderWidth: 1.3,
                        borderColor: "#60a5fa",
                        borderRadius: 9,
                        overflow: "hidden",
                      }}>
                      <View
                        style={{
                          flexDirection: "row",
                          backgroundColor: "rgba(96,165,250,0.06)",
                          paddingVertical: 7,
                          paddingHorizontal: 11,
                        }}>
                        <Text
                          style={{
                            flex: 3,
                            fontSize: 9.6,
                            fontWeight: "700",
                            color: "#1e40af",
                          }}>
                          Banka
                        </Text>
                        <Text
                          style={{
                            flex: 3.2,
                            fontSize: 9.6,
                            fontWeight: "700",
                            color: "#1e40af",
                          }}>
                          Llogaria
                        </Text>
                        <Text
                          style={{
                            flex: 0.9,
                            fontSize: 9.6,
                            fontWeight: "700",
                            color: "#1e40af",
                            textAlign: "right",
                          }}>
                          Val.
                        </Text>
                      </View>

                      {businessData.bankAccounts.map((acc, i) => {
                        const icon = acc.Valuta.includes("Euro")
                          ? "€"
                          : acc.Valuta.includes("Dollar")
                          ? "$"
                          : acc.Valuta.includes("Franga")
                          ? "CHF"
                          : acc.Valuta[0];
                        return (
                          <View
                            key={acc.IDLlogariaBankare}
                            style={{
                              flexDirection: "row",
                              paddingVertical: 8,
                              paddingHorizontal: 11,
                              backgroundColor:
                                i % 2 === 0
                                  ? "transparent"
                                  : "rgba(248,250,252,0.6)",
                              borderTopWidth: i === 0 ? 0 : 0.8,
                              borderTopColor: "#e2e8f0",
                            }}>
                            <Text
                              style={{
                                flex: 3,
                                fontSize: 9.7,
                                fontWeight: "bold",
                                color: "#1e40af",
                              }}>
                              {acc.EmriBankes}
                            </Text>
                            <Text
                              style={{
                                flex: 3.2,
                                fontSize: 9.7,
                                color: "#1e293b",
                                fontWeight: "600",
                              }}>
                              {acc.NumriLlogaris}
                            </Text>
                            <Text
                              style={{
                                flex: 0.9,
                                fontSize: 11,
                                fontWeight: "800",
                                color: "#2563eb",
                                textAlign: "right",
                              }}>
                              {icon}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  {/* RIGHT: Totals */}
                  <View style={{ width: "42%" }}>
                    <Text
                      style={{
                        fontSize: 10.8,
                        fontWeight: "bold",
                        color: "#1e293b",
                        marginBottom: 9,
                      }}
                    >
                      Totalet
                    </Text>
                    <View
                      style={{
                        borderWidth: 1.4,
                        borderColor: "#60a5fa",
                        borderRadius: 9,
                        overflow: "hidden",
                      }}
                    >
                      {/* Subtotal pa TVSH */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingVertical: 9,
                          paddingHorizontal: 14,
                          borderBottomWidth: 0.9,
                          borderBottomColor: "#e2e8f0",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#475569",
                            fontWeight: "600",
                          }}
                        >
                          Totali pa TVSH
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#1e293b",
                            fontWeight: "bold",
                          }}
                        >
                          {subtotalNet.toFixed(2)} €
                        </Text>
                      </View>

                      {/* TVSH */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingVertical: 9,
                          paddingHorizontal: 14,
                          borderBottomWidth: 0.9,
                          borderBottomColor: "#e2e8f0",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#475569",
                            fontWeight: "600",
                          }}
                        >
                          TVSH totale
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#1e293b",
                            fontWeight: "bold",
                          }}
                        >
                          {totalVAT.toFixed(2)} €
                        </Text>
                      </View>

                      {/* Transporti */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingVertical: 9,
                          paddingHorizontal: 14,
                          borderBottomWidth: 0.9,
                          borderBottomColor: "#e2e8f0",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#475569",
                            fontWeight: "600",
                          }}
                        >
                          Transporti
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#1e293b",
                            fontWeight: "bold",
                          }}
                        >
                          {transporti.toFixed(2)} €
                        </Text>
                      </View>

                      {/* Rabati - only show if exists */}
                      {rabati > 0 && (
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingVertical: 9,
                            paddingHorizontal: 14,
                            borderBottomWidth: 0.9,
                            borderBottomColor: "#e2e8f0",
                          }}
                        >
                          <Text style={styles.discountLabel}>
                            Rabati (−{user?.Rabati || 0}%)
                          </Text>
                          <Text style={styles.discountValue}>
                            −{rabati.toFixed(2)} €
                          </Text>
                        </View>
                      )}

                      {/* FINAL TOTAL */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingVertical: 12,
                          paddingHorizontal: 14,
                          backgroundColor: "rgba(96,165,250,0.11)",
                          borderTopWidth: 1.8,
                          borderTopColor: "#60a5fa",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13.2,
                            fontWeight: "900",
                            color: "#1e40af",
                          }}
                        >
                          TOTALI PËR PAGESË
                        </Text>
                        <Text
                          style={{
                            fontSize: 15.2,
                            fontWeight: "900",
                            color: "#1e40af",
                          }}
                        >
                          {grandTotal.toFixed(2)} €
                        </Text>
                      </View>
                    </View>
                    </View>
                </View>

                {/* SIGNATURE LINES – ONLY ONCE, AT THE VERY END */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    paddingHorizontal: 20,
                    paddingTop: 20,
                    borderTopWidth: 0.9,
                    borderTopColor: "#cbd5e1",
                  }}>
                  <View style={{ flexDirection: "row", gap: 150 }}>
                    <View style={{ alignItems: "center" }}>
                      <View
                        style={{
                          width: 180,
                          height: 1.4,
                          backgroundColor: "#1e293b",
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight: "600",
                          color: "#475569",
                          marginBottom: 4,
                        }}>
                        Dorezoi
                      </Text>
                    </View>

                    <View style={{ alignItems: "center" }}>
                      <View
                        style={{
                          width: 180,
                          height: 1.4,
                          backgroundColor: "#1e293b",
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight: "600",
                          color: "#475569",
                          marginBottom: 4,
                        }}>
                        Pranoi
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Tiny Elegant Footer Line */}
            <View style={styles.footer} fixed>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderTopWidth: 0.9,
                  borderTopColor: "#cbd5e1",
                }}>
                <Text
                  style={{ fontSize: 8, color: "#64748b", fontWeight: "500" }}>
                  Faleminderit për blerjen! • {business.EmriIBiznesit} ©{" "}
                  {new Date().getFullYear()}
                </Text>
                <Text
                  style={{
                    fontSize: 8.2,
                    color: "#475569",
                    fontWeight: "600",
                  }}>
                  Faqja {pageIndex + 1} nga{" "}
                  {moveTotalsToNewPage ? totalPages + 1 : totalPages}
                </Text>
              </View>
            </View>
            {/* FOOTER END*/}
          </Page>
        );
      })}

      {/* FAQE EKSTRA PËR TOTALET – TANI IDENTIKE ME FATURËN KRYESORE */}
      {moveTotalsToNewPage && (
        <Page size="A4" style={styles.page}>
          {/* SAME COMPACT HEADER */}
          <View style={styles.header}>
            <View>
              {business.Logo && (
                <Image src={"/img/web/" + business.Logo} style={styles.logo} />
              )}
            </View>

            <View style={styles.centerInfo}>
              <View style={styles.infoRow}>
                <View style={styles.infoBlock}>
                  <Text style={styles.label}>Furnitori</Text>
                  <Text style={styles.title}>{business.EmriIBiznesit}</Text>
                  <Text style={styles.text}>{business.Adresa}</Text>
                  <Text style={styles.text}>
                    NUI: {business.NUI} • NF: {business.NF}
                  </Text>
                  <Text style={styles.text}>TVSH: {business.NrTVSH}</Text>
                </View>
                <View style={styles.infoBlock}>
                  <Text style={styles.label}>Klienti</Text>
                  <Text style={styles.title}>{clientName}</Text>
                  <Text style={styles.text}>
                    Kategori: {user?.EmriKategoris || "Pa kategori"}
                  </Text>
                  {user?.NUI && (
                    <Text style={styles.text}>NUI: {user.NUI}</Text>
                  )}
                  {user?.Adresa && (
                    <Text style={styles.text}>Adresa: {user.Adresa}</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.invoiceBox}>
              <Text style={styles.invoiceTitle}>Faturë Tatimore</Text>
              <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
              <Text style={styles.invoiceDate}>
                {new Date().toLocaleDateString("en-GB")}
              </Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.headerRow}>
              <Text style={styles.colNr}>Nr.</Text>
              <Text style={styles.colItem}>Emri - Barkodi</Text>
              <Text style={styles.colQty}>Sasia</Text>
              <Text style={styles.colUnit}>Ç. pa TVSH</Text>
              <Text style={styles.colVatRate}>TVSH %</Text>
              <Text style={styles.colVatAmount}>TVSH €</Text>
              <Text style={styles.colTotal}>Totali €</Text>
            </View>
          </View>

          {/* COMPACT SUMMARY – SAME STYLE AS MAIN INVOICE */}
          <View style={{ marginTop: 60 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "900",
                color: "#1e293b",
                textAlign: "center",
                marginBottom: 32,
              }}>
              Përmbledhje Përfundimtare
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 20,
                marginBottom: 32,
              }}>
              {/* LEFT: Banking Info – IDENTICAL TABLE */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 10.8,
                    fontWeight: "bold",
                    color: "#1e293b",
                    marginBottom: 9,
                  }}>
                  Të Dhënat Bankare për Pagesë
                </Text>

                <View
                  style={{
                    borderWidth: 1.3,
                    borderColor: "#60a5fa",
                    borderRadius: 9,
                    overflow: "hidden",
                  }}>
                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: "rgba(96,165,250,0.06)",
                      paddingVertical: 7,
                      paddingHorizontal: 11,
                    }}>
                    <Text
                      style={{
                        flex: 3,
                        fontSize: 9.6,
                        fontWeight: "700",
                        color: "#1e40af",
                      }}>
                      Banka
                    </Text>
                    <Text
                      style={{
                        flex: 3.2,
                        fontSize: 9.6,
                        fontWeight: "700",
                        color: "#1e40af",
                      }}>
                      Llogaria
                    </Text>
                    <Text
                      style={{
                        flex: 0.9,
                        fontSize: 9.6,
                        fontWeight: "700",
                        color: "#1e40af",
                        textAlign: "right",
                      }}>
                      Val.
                    </Text>
                  </View>

                  {businessData.bankAccounts.map((acc, i) => {
                    const icon = acc.Valuta.includes("Euro")
                      ? "€"
                      : acc.Valuta.includes("Dollar")
                      ? "$"
                      : acc.Valuta.includes("Franga")
                      ? "CHF"
                      : acc.Valuta[0];
                    return (
                      <View
                        key={acc.IDLlogariaBankare}
                        style={{
                          flexDirection: "row",
                          paddingVertical: 8,
                          paddingHorizontal: 11,
                          backgroundColor:
                            i % 2 === 0
                              ? "transparent"
                              : "rgba(248,250,252,0.6)",
                          borderTopWidth: i === 0 ? 0 : 0.8,
                          borderTopColor: "#e2e8f0",
                        }}>
                        <Text
                          style={{
                            flex: 3,
                            fontSize: 9.7,
                            fontWeight: "bold",
                            color: "#1e40af",
                          }}>
                          {acc.EmriBankes}
                        </Text>
                        <Text
                          style={{
                            flex: 3.2,
                            fontSize: 9.7,
                            color: "#1e293b",
                            fontWeight: "600",
                          }}>
                          {acc.NumriLlogaris}
                        </Text>
                        <Text
                          style={{
                            flex: 0.9,
                            fontSize: 11,
                            fontWeight: "800",
                            color: "#2563eb",
                            textAlign: "right",
                          }}>
                          {icon}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* RIGHT: Totals – SAME COMPACT STYLE */}
              <View style={{ width: "42%" }}>
                    <Text
                      style={{
                        fontSize: 10.8,
                        fontWeight: "bold",
                        color: "#1e293b",
                        marginBottom: 9,
                      }}
                    >
                      Totalet
                    </Text>
                    <View
                      style={{
                        borderWidth: 1.4,
                        borderColor: "#60a5fa",
                        borderRadius: 9,
                        overflow: "hidden",
                      }}
                    >
                      {/* Subtotal pa TVSH */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingVertical: 9,
                          paddingHorizontal: 14,
                          borderBottomWidth: 0.9,
                          borderBottomColor: "#e2e8f0",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#475569",
                            fontWeight: "600",
                          }}
                        >
                          Totali pa TVSH
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#1e293b",
                            fontWeight: "bold",
                          }}
                        >
                          {subtotalNet.toFixed(2)} €
                        </Text>
                      </View>

                      {/* TVSH */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingVertical: 9,
                          paddingHorizontal: 14,
                          borderBottomWidth: 0.9,
                          borderBottomColor: "#e2e8f0",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#475569",
                            fontWeight: "600",
                          }}
                        >
                          TVSH totale
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#1e293b",
                            fontWeight: "bold",
                          }}
                        >
                          {totalVAT.toFixed(2)} €
                        </Text>
                      </View>

                      {/* Transporti */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingVertical: 9,
                          paddingHorizontal: 14,
                          borderBottomWidth: 0.9,
                          borderBottomColor: "#e2e8f0",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#475569",
                            fontWeight: "600",
                          }}
                        >
                          Transporti
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#1e293b",
                            fontWeight: "bold",
                          }}
                        >
                          {transporti.toFixed(2)} €
                        </Text>
                      </View>

                      {/* Rabati - only show if exists */}
                      {rabati > 0 && (
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingVertical: 9,
                            paddingHorizontal: 14,
                            borderBottomWidth: 0.9,
                            borderBottomColor: "#e2e8f0",
                          }}
                        >
                          <Text style={styles.discountLabel}>
                            Rabati (−{user?.Rabati || 0}%)
                          </Text>
                          <Text style={styles.discountValue}>
                            −{rabati.toFixed(2)} €
                          </Text>
                        </View>
                      )}

                      {/* FINAL TOTAL */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingVertical: 12,
                          paddingHorizontal: 14,
                          backgroundColor: "rgba(96,165,250,0.11)",
                          borderTopWidth: 1.8,
                          borderTopColor: "#60a5fa",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13.2,
                            fontWeight: "900",
                            color: "#1e40af",
                          }}
                        >
                          TOTALI PËR PAGESË
                        </Text>
                        <Text
                          style={{
                            fontSize: 15.2,
                            fontWeight: "900",
                            color: "#1e40af",
                          }}
                        >
                          {grandTotal.toFixed(2)} €
                        </Text>
                      </View>
                    </View>
                    </View>
            </View>

            {/* SIGNATURE LINES – ONLY ONCE, AT THE VERY END */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-end",
                paddingHorizontal: 20,
                paddingTop: 20,
                borderTopWidth: 0.9,
                borderTopColor: "#cbd5e1",
              }}>
              <View style={{ flexDirection: "row", gap: 150 }}>
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: 180,
                      height: 1.4,
                      backgroundColor: "#1e293b",
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: 4,
                    }}>
                    Dorezoi
                  </Text>
                </View>

                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: 180,
                      height: 1.4,
                      backgroundColor: "#1e293b",
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: 4,
                    }}>
                    Pranoi
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tiny Elegant Footer Line */}
          <View style={styles.footer} fixed>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderTopWidth: 0.9,
                borderTopColor: "#cbd5e1",
              }}>
              <Text
                style={{ fontSize: 8, color: "#64748b", fontWeight: "500" }}>
                Faleminderit për blerjen! • {business.EmriIBiznesit} ©{" "}
                {new Date().getFullYear()}
              </Text>
              <Text
                style={{
                  fontSize: 8.2,
                  color: "#475569",
                  fontWeight: "600",
                }}>
                Faqja {totalPages + 1} nga {totalPages + 1}
              </Text>
            </View>
          </View>
          {/* FOOTER END*/}
        </Page>
      )}
    </Document>
  );
}
