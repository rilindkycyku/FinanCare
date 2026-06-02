import { useEffect, useState } from "react";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import { Table, Card, Form, Row, Col, Button, Modal, Badge } from "react-bootstrap";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import axios from "axios";
import { TailSpin } from "react-loader-spinner";
import Titulli from "../../../Components/TeTjera/Titulli";
import "../../Styles/DizajniPergjithshem.css";
import "../../Styles/SugjerimiPorosise.css";
import { Printer, Calendar, Search } from "lucide-react";
import EksportoTeDhenat from "../../../Components/TeTjera/Tabela/EksportoTeDhenat";

const pdfStyles = StyleSheet.create({
  page: { padding: 50, fontSize: 10, color: "#1e293b", backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40,
    borderBottom: 2,
    borderBottomColor: "#10b981",
    paddingBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#0f172a" },
  date: { fontSize: 10, color: "#64748b" },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#10b981",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: 1,
    borderBottomColor: "rgba(16, 185, 129, 0.1)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottom: 1,
    borderBottomColor: "#f1f5f9",
  },
  label: { color: "#64748b" },
  value: { fontWeight: "bold", color: "#334155" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTop: 2,
    borderTopColor: "#f1f5f9",
  },
  totalLabel: { fontSize: 12, fontWeight: "bold" },
  totalValue: { fontSize: 14, fontWeight: "bold", color: "#10b981" },
  diffBox: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    textAlign: "center",
  },
  diffLabel: { fontSize: 10, textTransform: "uppercase", marginBottom: 5 },
  diffValue: { fontSize: 28, fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 8,
    borderTop: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
  },
  green: { color: "#10b981" },
  red: { color: "#ef4444" },
  bgGreen: { backgroundColor: "rgba(16, 185, 129, 0.05)" },
  bgRed: { backgroundColor: "rgba(239, 68, 68, 0.05)" },
});

function ListaBarazimeve() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const getToken = localStorage.getItem("token");
  const authentikimi = { headers: { Authorization: `Bearer ${getToken}` } };

  const [perditeso, setPerditeso] = useState("");

  const [barazimet, setBarazimet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedBarazim, setSelectedBarazim] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchBarazimet = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/api/BarazoArken/shfaqTeGjithaBarazimet`,
          authentikimi
        );
        setBarazimet(res.data);
      } catch (err) {
        alert("Gabim gjatë ngarkimit të barazimeve.");
      } finally {
        setLoading(false);
      }
    };
    fetchBarazimet();
  }, [perditeso]);

  const filtered = barazimet.filter((b) => {
    const date = new Date(b.kohaBarazimit);
    if (fromDate && date < new Date(fromDate)) return false;
    if (toDate && date > new Date(toDate + "T23:59:59")) return false;
    return true;
  });

  const parseAmount = (v) => parseFloat(v) || 0;

  const openDetails = (barazim) => {
    setSelectedBarazim(barazim);
    setShowModal(true);
  };

  const RaportiPDF = ({ barazim }) => {
    const hyrje =
      parseAmount(barazim.totaliShitjeve) +
      parseAmount(barazim.fillimiArkes) +
      parseAmount(barazim.teShtuaraNeArke);

    const dalje =
      parseAmount(barazim.cash) +
      parseAmount(barazim.monedha) +
      parseAmount(barazim.borxhe) +
      parseAmount(barazim.banka) +
      parseAmount(barazim.pagesFatura) +
      parseAmount(barazim.tjera);

    const dallimi = dalje - hyrje;

    return (
      <Document>
        <Page size="A4" style={pdfStyles.page}>
          <View style={pdfStyles.header}>
            <View>
              <Text style={pdfStyles.title}>FinanCare</Text>
              <Text style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                Raport Barazimi i Arkës
              </Text>
            </View>
            <View style={{ textAlign: "right" }}>
              <Text style={pdfStyles.date}>
                {new Date(barazim.kohaBarazimit).toLocaleDateString("sq-AL")}
              </Text>
              <Text style={pdfStyles.date}>
                {new Date(barazim.kohaBarazimit).toLocaleTimeString("sq-AL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>

          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Përmbledhja e Stafit</Text>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>Arkëtari:</Text>
              <Text style={pdfStyles.value}>
                {barazim.arkatari?.emri} {barazim.arkatari?.mbiemri}
              </Text>
            </View>
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>Përgjegjësi:</Text>
              <Text style={pdfStyles.value}>
                {barazim.personiPergjejes?.emri}{" "}
                {barazim.personiPergjejes?.mbiemri}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={pdfStyles.sectionTitle}>Hyrjet</Text>
              <View style={pdfStyles.row}>
                <Text style={pdfStyles.label}>Shitjet:</Text>
                <Text style={pdfStyles.value}>
                  {parseAmount(barazim.totaliShitjeve).toFixed(2)} €
                </Text>
              </View>
              <View style={pdfStyles.row}>
                <Text style={pdfStyles.label}>Fillimi:</Text>
                <Text style={pdfStyles.value}>
                  {parseAmount(barazim.fillimiArkes).toFixed(2)} €
                </Text>
              </View>
              <View style={pdfStyles.row}>
                <Text style={pdfStyles.label}>Shtesat:</Text>
                <Text style={pdfStyles.value}>
                  {parseAmount(barazim.teShtuaraNeArke).toFixed(2)} €
                </Text>
              </View>
              <View style={pdfStyles.totalRow}>
                <Text style={pdfStyles.totalLabel}>Totali:</Text>
                <Text style={pdfStyles.totalValue}>
                  {hyrje.toFixed(2)} €
                </Text>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={pdfStyles.sectionTitle}>Daljet</Text>
              <View style={pdfStyles.row}>
                <Text style={pdfStyles.label}>Cash:</Text>
                <Text style={pdfStyles.value}>
                  {parseAmount(barazim.cash).toFixed(2)} €
                </Text>
              </View>
              <View style={pdfStyles.row}>
                <Text style={pdfStyles.label}>Monedha:</Text>
                <Text style={pdfStyles.value}>
                  {parseAmount(barazim.monedha).toFixed(2)} €
                </Text>
              </View>
              <View style={pdfStyles.row}>
                <Text style={pdfStyles.label}>Borxhe:</Text>
                <Text style={pdfStyles.value}>
                  {parseAmount(barazim.borxhe).toFixed(2)} €
                </Text>
              </View>
              <View style={pdfStyles.row}>
                <Text style={pdfStyles.label}>Banka:</Text>
                <Text style={pdfStyles.value}>
                  {parseAmount(barazim.banka).toFixed(2)} €
                </Text>
              </View>
              <View style={pdfStyles.row}>
                <Text style={pdfStyles.label}>Fatura:</Text>
                <Text style={pdfStyles.value}>
                  {parseAmount(barazim.pagesFatura).toFixed(2)} €
                </Text>
              </View>
              <View style={pdfStyles.row}>
                <Text style={pdfStyles.label}>Tjera:</Text>
                <Text style={pdfStyles.value}>
                  {parseAmount(barazim.tjera).toFixed(2)} €
                </Text>
              </View>
              <View style={pdfStyles.totalRow}>
                <Text style={pdfStyles.totalLabel}>Totali:</Text>
                <Text style={[pdfStyles.totalValue, { color: "#06b6d4" }]}>
                  {dalje.toFixed(2)} €
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              pdfStyles.diffBox,
              dallimi >= 0 ? pdfStyles.bgGreen : pdfStyles.bgRed,
              { marginTop: 40 },
            ]}
          >
            <Text style={[pdfStyles.diffLabel, dallimi >= 0 ? pdfStyles.green : pdfStyles.red]}>
              Dallimi Final i Arkës
            </Text>
            <Text style={[pdfStyles.diffValue, dallimi >= 0 ? pdfStyles.green : pdfStyles.red]}>
              {dallimi > 0 ? "+" : ""}
              {dallimi.toFixed(2)} €
            </Text>
            <Text style={{ fontSize: 10, color: "#64748b", marginTop: 5 }}>
              Statusi:{" "}
              {dallimi === 0
                ? "Balancë"
                : dallimi > 0
                  ? "Tepricë"
                  : "Mungesë"}
            </Text>
          </View>

          <Text style={pdfStyles.footer}>
            FinanCare Management System - Gjeneruar më: {new Date().toLocaleDateString("sq-AL")} {new Date().toLocaleTimeString("sq-AL")}
          </Text>
        </Page>
      </Document>
    );
  };

    const exportData = filtered.map((b) => {
    const hyrje =
      parseAmount(b.totaliShitjeve) +
      parseAmount(b.fillimiArkes) +
      parseAmount(b.teShtuaraNeArke);
    const dalje =
      parseAmount(b.cash) +
      parseAmount(b.monedha) +
      parseAmount(b.borxhe) +
      parseAmount(b.banka) +
      parseAmount(b.pagesFatura) +
      parseAmount(b.tjera);
    const diff = dalje - hyrje;
    return {
      "Data": new Date(b.kohaBarazimit).toLocaleDateString("sq-AL") + " " + new Date(b.kohaBarazimit).toLocaleTimeString("sq-AL", { hour: '2-digit', minute: '2-digit' }),
      "Arkëtari": `${b.arkatari?.emri} ${b.arkatari?.mbiemri}`,
      "Total Shitje (€)": parseAmount(b.totaliShitjeve),
      "Fillimi Arkës (€)": parseAmount(b.fillimiArkes),
      "Të Shtuara (€)": parseAmount(b.teShtuaraNeArke),
      "Hyrjet Qarkullimi (€)": hyrje,
      "Cash (karta) (€)": parseAmount(b.cash),
      "Monedha (€)": parseAmount(b.monedha),
      "Borxhe (€)": parseAmount(b.borxhe),
      "Banka POS (€)": parseAmount(b.banka),
      "Paguar Fatura (€)": parseAmount(b.pagesFatura),
      "Daljet Pagesat (€)": dalje,
      "Dallimi Final (€)": diff,
      "Përgjegjësi": `${b.personiPergjejes?.emri} ${b.personiPergjejes?.mbiemri}`
    };
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <TailSpin height="100" width="100" color="#10b981" />
      </div>
    );
  }

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "1 Euro Menaxher"]} />
      <NavBar />
      <Titulli titulli={"Lista e Barazimeve"} />

      <div className="tabelaDiv">
        <div className="containerDashboardP py-4">
        <div className="text-center mb-5">
          <h1 className="h2 fw-bold text-white mb-2">Historiku i Barazimeve</h1>
          <p className="text-muted small">Monitoroni mbylljet e arkës dhe performancën e arkëtarëve</p>
        </div>

        <Row className="mb-4 g-4">
          <Col lg={8}>
            <Card className="sp-card h-100">
              <div className="sp-card-header">
                <h3>Filtrimi i Historikut</h3>
              </div>
              <Card.Body className="p-4">
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Label className="sp-label">Data Fillimit</Form.Label>
                    <Form.Control
                      className="sp-input"
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label className="sp-label">Data Mbarimit</Form.Label>
                    <Form.Control
                      className="sp-input"
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </Col>
                  <Col md={2}>
                    <Button
                      className="btn-cancel w-100 py-2"
                      onClick={() => {
                        setFromDate("");
                        setToDate("");
                      }}>
                      Pastro
                    </Button>
                  </Col>
                  <Col md={2}>
                    {filtered.length > 0 && (
                      <EksportoTeDhenat
                        teDhenatJSON={exportData}
                        emriDokumentit="Historiku i Barazimeve"
                      />
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <div className="sp-recommend-box h-100 mb-0 d-flex flex-column justify-content-center">
              <div className="rec-label">Gjithsej Barazime</div>
              <div className="rec-qty text-white">{filtered.length}</div>
              <div className="rec-msg">për periudhën e zgjedhur</div>
            </div>
          </Col>
        </Row>

        <Card className="sp-card">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover variant="dark" className="sp-table mb-0">
                <thead>
                  <tr>
                    <th className="ps-4">Data</th>
                    <th>Arkëtari</th>
                    <th className="text-end">Total Shitje</th>
                    <th className="text-end">Cash + Monedha</th>
                    <th className="text-end">Dallimi</th>
                    <th className="pe-4">Përgjegjësi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-white-50 italic">
                        Nuk u gjet asnjë barazim për këtë periudhë.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((b) => {
                      const hyrje =
                        parseAmount(b.totaliShitjeve) +
                        parseAmount(b.fillimiArkes) +
                        parseAmount(b.teShtuaraNeArke);
                      const dalje =
                        parseAmount(b.cash) +
                        parseAmount(b.monedha) +
                        parseAmount(b.borxhe) +
                        parseAmount(b.banka) +
                        parseAmount(b.pagesFatura) +
                        parseAmount(b.tjera);
                      const diff = dalje - hyrje;

                      return (
                        <tr
                          key={b.iDBarazoArken}
                          onClick={() => openDetails(b)}
                          style={{ cursor: "pointer" }}
                          className="align-middle">
                          <td className="ps-4 py-3">
                            <div className="fw-bold">{new Date(b.kohaBarazimit).toLocaleDateString("sq-AL")}</div>
                            <div className="text-white-50 small" style={{ fontSize: '0.7rem' }}>
                              {new Date(b.kohaBarazimit).toLocaleTimeString("sq-AL", { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="text-white fw-semibold">{b.arkatari?.emri} {b.arkatari?.mbiemri}</div>
                            <div className="text-white-50 small" style={{ fontSize: '0.75rem' }}>@{b.arkatari?.username}</div>
                          </td>
                          <td className="py-3 text-end fw-bold text-info">
                            {parseAmount(b.totaliShitjeve).toFixed(2)} €
                          </td>
                          <td className="py-3 text-end text-white-50">
                            {(parseAmount(b.cash) + parseAmount(b.monedha)).toFixed(2)} €
                          </td>
                          <td className="py-3 text-end">
                            <Badge
                              bg={diff > 0 ? "success" : diff < 0 ? "danger" : "secondary"}
                              className={`p-2 rounded-3 fs-6 ${diff === 0 ? "opacity-50" : ""}`}
                              style={{ minWidth: '80px' }}>
                              {diff > 0 ? "+" : ""}{diff.toFixed(2)} €
                            </Badge>
                          </td>
                          <td className="pe-4 py-3">
                            <div className="text-white-50 small">
                              {b.personiPergjejes?.emri} {b.personiPergjejes?.mbiemri}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Enhanced Details Modal */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          centered
          className="sp-modal">
          <Modal.Header closeButton>
            <Modal.Title>
              Detajet e Barazimit -{" "}
              <span className="text-white-50 small fw-normal">
                {selectedBarazim &&
                  new Date(selectedBarazim.kohaBarazimit).toLocaleDateString("sq-AL")}
              </span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedBarazim &&
              (() => {
                const hyrje =
                  parseAmount(selectedBarazim.totaliShitjeve) +
                  parseAmount(selectedBarazim.fillimiArkes) +
                  parseAmount(selectedBarazim.teShtuaraNeArke);

                const dalje =
                  parseAmount(selectedBarazim.cash) +
                  parseAmount(selectedBarazim.monedha) +
                  parseAmount(selectedBarazim.borxhe) +
                  parseAmount(selectedBarazim.banka) +
                  parseAmount(selectedBarazim.pagesFatura) +
                  parseAmount(selectedBarazim.tjera);

                const dallimi = dalje - hyrje;

                return (
                  <>
                    <div className="text-center mb-4 pb-3 border-bottom border-secondary border-opacity-25">
                      <p className="mb-1">
                        <span className="text-white-50 me-2">Arkëtari:</span>
                        <strong className="text-white">
                          {selectedBarazim.arkatari?.emri} {selectedBarazim.arkatari?.mbiemri}
                        </strong>
                      </p>
                      <p className="mb-0">
                        <span className="text-white-50 me-2">Përgjegjësi:</span>
                        <strong className="text-white">
                          {selectedBarazim.personiPergjejes?.emri}{" "}
                          {selectedBarazim.personiPergjejes?.mbiemri}
                        </strong>
                      </p>
                    </div>

                    <Row className="g-4">
                      <Col md={6}>
                        <div className="sp-order-box green h-100">
                          <div className="box-label mb-3">HYRJE (QARKULLIMI)</div>
                          <ul className="list-unstyled mb-0 d-grid gap-2">
                            <li className="d-flex justify-content-between align-items-center">
                              <span className="text-white-50 small">Totali Shitjeve:</span>
                              <strong className="text-white">{parseAmount(selectedBarazim.totaliShitjeve).toFixed(2)} €</strong>
                            </li>
                            <li className="d-flex justify-content-between align-items-center">
                              <span className="text-white-50 small">Fillimi Arkës:</span>
                              <strong className="text-white">{parseAmount(selectedBarazim.fillimiArkes).toFixed(2)} €</strong>
                            </li>
                            <li className="d-flex justify-content-between align-items-center">
                              <span className="text-white-50 small">Të Shtuara:</span>
                              <strong className="text-white">{parseAmount(selectedBarazim.teShtuaraNeArke).toFixed(2)} €</strong>
                            </li>
                            <li className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary border-opacity-25">
                              <span className="fw-bold text-success small">TOTALI HYRJEVE:</span>
                              <strong className="text-success fs-5">{hyrje.toFixed(2)} €</strong>
                            </li>
                          </ul>
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className="sp-order-box blue h-100">
                          <div className="box-label mb-3">DALJE (PAGESAT)</div>
                          <ul className="list-unstyled mb-0 d-grid gap-2">
                            <li className="d-flex justify-content-between align-items-center">
                              <span className="text-white-50 small">Cash (karta):</span>
                              <strong className="text-white">{parseAmount(selectedBarazim.cash).toFixed(2)} €</strong>
                            </li>
                            <li className="d-flex justify-content-between align-items-center">
                              <span className="text-white-50 small">Monedha:</span>
                              <strong className="text-white">{parseAmount(selectedBarazim.monedha).toFixed(2)} €</strong>
                            </li>
                            <li className="d-flex justify-content-between align-items-center">
                              <span className="text-white-50 small">Borxhe:</span>
                              <strong className="text-white">{parseAmount(selectedBarazim.borxhe).toFixed(2)} €</strong>
                            </li>
                            <li className="d-flex justify-content-between align-items-center">
                              <span className="text-white-50 small">Banka (POS):</span>
                              <strong className="text-white">{parseAmount(selectedBarazim.banka).toFixed(2)} €</strong>
                            </li>
                            <li className="d-flex justify-content-between align-items-center">
                              <span className="text-white-50 small">Paguar Fatura:</span>
                              <strong className="text-white">{parseAmount(selectedBarazim.pagesFatura).toFixed(2)} €</strong>
                            </li>
                            <li className="d-flex justify-content-between align-items-center">
                              <span className="text-white-50 small">Tjera:</span>
                              <strong className="text-white">{parseAmount(selectedBarazim.tjera).toFixed(2)} €</strong>
                            </li>
                            <li className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary border-opacity-25">
                              <span className="fw-bold text-info small">TOTALI DALJEVE:</span>
                              <strong className="text-info fs-5">{dalje.toFixed(2)} €</strong>
                            </li>
                          </ul>
                          {selectedBarazim.pershkrimiTjera && (
                            <div className="mt-2 text-start p-2 bg-dark bg-opacity-25 rounded small text-white-50 italic">
                              <span className="fw-bold text-white small me-1">Shënim:</span> {selectedBarazim.pershkrimiTjera}
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>

                    <div className="mt-5">
                      <div className="sp-recommend-box mb-0">
                        <div className="rec-label">DALLIMI FINAL I ARKËS</div>
                        <div className={`rec-qty ${dallimi > 0 ? "text-success" : dallimi < 0 ? "text-danger" : "text-white"}`}>
                          {dallimi > 0 ? "+" : ""}{dallimi.toFixed(2)} €
                        </div>
                        <div className="rec-msg mt-1">
                          {dallimi === 0 ? "Arka është në balancë të plotë." : dallimi > 0 ? "Keni tepricë në arkë." : "Keni mungesë në arkë."}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-cancel px-4" onClick={() => setShowModal(false)}>
              Mbyll
            </Button>

            {selectedBarazim && (
              <PDFDownloadLink
                document={<RaportiPDF barazim={selectedBarazim} />}
                fileName={`Barazimi_${new Date(selectedBarazim.kohaBarazimit)
                  .toLocaleDateString("sq-AL")
                  .replace(/\//g, "-")}.pdf`}>
                {({ loading }) => (
                  <Button className="btn-save px-4 d-flex align-items-center gap-2" disabled={loading}>
                    {loading ? "Duke gjeneruar..." : <><Printer size={16} /> Shkarko PDF</>}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
          </Modal.Footer>
        </Modal>
        </div>
      </div>
    </>
  );
}

export default ListaBarazimeve;
