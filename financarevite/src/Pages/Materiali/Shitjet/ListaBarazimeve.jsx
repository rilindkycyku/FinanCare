import NavBar from "../../../Components/TeTjera/layout/NavBar";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import { Table, Card, Form, Row, Col, Button, Modal } from "react-bootstrap";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import axios from "axios";
import { TailSpin } from "react-loader-spinner";
import Titulli from "../../../Components/TeTjera/Titulli";

const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontSize: 12 },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  subtitle: { fontSize: 16, marginBottom: 15, fontWeight: "bold" },
  section: { marginBottom: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bold: { fontWeight: "bold" },
  totalRow: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#000",
    borderTopStyle: "solid",
  },
  green: { color: "green" },
  red: { color: "red" },
  largeText: { fontSize: 18 },
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
          <Text style={pdfStyles.title}>Raport Barazimi i Arkës</Text>

          <View style={pdfStyles.section}>
            <View style={pdfStyles.row}>
              <Text>Arkëtari:</Text>
              <Text>
                {barazim.arkatari?.emri} {barazim.arkatari?.mbiemri}
              </Text>
            </View>
            <View style={pdfStyles.row}>
              <Text>Data:</Text>
              <Text>
                {new Date(barazim.kohaBarazimit).toLocaleDateString("sq-AL")}
              </Text>
            </View>
            <View style={pdfStyles.row}>
              <Text>Përgjegjësi:</Text>
              <Text>
                {barazim.personiPergjejes?.emri}{" "}
                {barazim.personiPergjejes?.mbiemri}
              </Text>
            </View>
          </View>

          <Text style={pdfStyles.subtitle}>HYRJE</Text>
          <View style={pdfStyles.section}>
            <View style={pdfStyles.row}>
              <Text>Totali Shitjeve:</Text>
              <Text>{parseAmount(barazim.totaliShitjeve).toFixed(2)} €</Text>
            </View>
            <View style={pdfStyles.row}>
              <Text>Fillimi Arkës:</Text>
              <Text>{parseAmount(barazim.fillimiArkes).toFixed(2)} €</Text>
            </View>
            <View style={pdfStyles.row}>
              <Text>Të Shtuara:</Text>
              <Text>{parseAmount(barazim.teShtuaraNeArke).toFixed(2)} €</Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.bold}>Totali Hyrjeve:</Text>
              <Text style={pdfStyles.bold}>{hyrje.toFixed(2)} €</Text>
            </View>
          </View>

          <Text style={pdfStyles.subtitle}>DALJE</Text>
          <View style={pdfStyles.section}>
            <View style={pdfStyles.row}>
              <Text>Cash (karta/kuponë):</Text>
              <Text>{parseAmount(barazim.cash).toFixed(2)} €</Text>
            </View>
            <View style={pdfStyles.row}>
              <Text>Monedha (fizike):</Text>
              <Text>{parseAmount(barazim.monedha).toFixed(2)} €</Text>
            </View>
            <View style={pdfStyles.row}>
              <Text>Borxhe:</Text>
              <Text>{parseAmount(barazim.borxhe).toFixed(2)} €</Text>
            </View>
            <View style={pdfStyles.row}>
              <Text>Banka (POS):</Text>
              <Text>{parseAmount(barazim.banka).toFixed(2)} €</Text>
            </View>
            <View style={pdfStyles.row}>
              <Text>Paguar Fatura:</Text>
              <Text>{parseAmount(barazim.pagesFatura).toFixed(2)} €</Text>
            </View>
            <View style={pdfStyles.row}>
              <Text>Tjera:</Text>
              <Text>{parseAmount(barazim.tjera).toFixed(2)} €</Text>
            </View>
            {parseAmount(barazim.tjera) > 0 && (
              <View style={pdfStyles.row}>
                <Text>Përshkrim Tjera:</Text>
                <Text>{barazim.pershkrimiTjera}</Text>
              </View>
            )}
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.bold}>Totali Daljeve:</Text>
              <Text style={pdfStyles.bold}>{dalje.toFixed(2)} €</Text>
            </View>
          </View>

          <View style={[pdfStyles.section, { marginTop: 30 }]}>
            <View style={pdfStyles.row}>
              <Text style={[pdfStyles.bold, pdfStyles.largeText]}>
                DALLIMI:
              </Text>
              <Text
                style={[
                  pdfStyles.bold,
                  pdfStyles.largeText,
                  dallimi > 0
                    ? pdfStyles.green
                    : dallimi < 0
                    ? pdfStyles.red
                    : {},
                ]}>
                {dallimi.toFixed(2)} €
              </Text>
            </View>
          </View>
        </Page>
      </Document>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <TailSpin height="100" width="100" color="#009879" />
      </div>
    );
  }

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher"]} />
      <NavBar />
      <Titulli titulli={"Lista e Barazimeve"} />

      <div className="containerDashboardP py-4">
        <h1 className="h3 text-center mb-4 fw-bold text-primary">
          Lista e Barazimeve të Arkës
        </h1>

        <Card className="shadow mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col md={5}>
                <Form.Label>Nga data</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Col>
              <Col md={5}>
                <Form.Label>Deri data</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                  }}>
                  Pastro
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="shadow">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead className="bg-primary text-white">
                  <tr>
                    <th>Data</th>
                    <th>Arkëtari</th>
                    <th>Total Shitje</th>
                    <th>Cash + Monedha</th>
                    <th>Dallimi</th>
                    <th>Përgjegjësi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => {
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
                        className="table-row-hover">
                        <td>
                          {new Date(b.kohaBarazimit).toLocaleDateString(
                            "sq-AL"
                          )}
                        </td>
                        <td>
                          {b.arkatari?.emri} {b.arkatari?.mbiemri}
                        </td>
                        <td className="text-end fw-bold">
                          {parseAmount(b.totaliShitjeve).toFixed(2)} €
                        </td>
                        <td className="text-end">
                          {(
                            parseAmount(b.cash) + parseAmount(b.monedha)
                          ).toFixed(2)}{" "}
                          €
                        </td>
                        <td
                          className={`text-end fw-bold ${
                            diff > 0
                              ? "text-success"
                              : diff < 0
                              ? "text-danger"
                              : ""
                          }`}>
                          {diff.toFixed(2)} €
                        </td>
                        <td>
                          {b.personiPergjejes?.emri}{" "}
                          {b.personiPergjejes?.mbiemri}
                        </td>
                      </tr>
                    );
                  })}
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
          centered>
          <Modal.Header closeButton>
            <Modal.Title>
              Detajet e Barazimit -{" "}
              {selectedBarazim &&
                new Date(selectedBarazim.kohaBarazimit).toLocaleDateString(
                  "sq-AL"
                )}
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
                    <div className="text-center mb-4">
                      <p className="mb-1">
                        <strong>Arkëtari:</strong>{" "}
                        {selectedBarazim.arkatari?.emri}{" "}
                        {selectedBarazim.arkatari?.mbiemri}
                      </p>
                      <p className="mb-0">
                        <strong>Përgjegjësi:</strong>{" "}
                        {selectedBarazim.personiPergjejes?.emri}{" "}
                        {selectedBarazim.personiPergjejes?.mbiemri}
                      </p>
                    </div>

                    <Row className="g-5">
                      <Col md={6}>
                        <Card className="h-100 border-success shadow-sm">
                          <Card.Header className="bg-success text-white text-center">
                            <h5 className="mb-0">HYRJE</h5>
                          </Card.Header>
                          <Card.Body>
                            <ul className="list-unstyled mb-0">
                              <li className="d-flex justify-content-between">
                                <span>Totali Shitjeve:</span>{" "}
                                <strong>
                                  {parseAmount(
                                    selectedBarazim.totaliShitjeve
                                  ).toFixed(2)}{" "}
                                  €
                                </strong>
                              </li>
                              <li className="d-flex justify-content-between">
                                <span>Fillimi Arkës:</span>{" "}
                                <strong>
                                  {parseAmount(
                                    selectedBarazim.fillimiArkes
                                  ).toFixed(2)}{" "}
                                  €
                                </strong>
                              </li>
                              <li className="d-flex justify-content-between">
                                <span>Të Shtuara:</span>{" "}
                                <strong>
                                  {parseAmount(
                                    selectedBarazim.teShtuaraNeArke
                                  ).toFixed(2)}{" "}
                                  €
                                </strong>
                              </li>
                              <li className="d-flex justify-content-between mt-3 pt-3 border-top">
                                <strong>Totali Hyrjeve:</strong>{" "}
                                <strong className="text-success fs-5">
                                  {hyrje.toFixed(2)} €
                                </strong>
                              </li>
                            </ul>
                          </Card.Body>
                        </Card>
                      </Col>

                      <Col md={6}>
                        <Card className="h-100 border-danger shadow-sm">
                          <Card.Header className="bg-danger text-white text-center">
                            <h5 className="mb-0">DALJE</h5>
                          </Card.Header>
                          <Card.Body>
                            <ul className="list-unstyled mb-0">
                              <li className="d-flex justify-content-between">
                                <span>Cash (karta/kuponë):</span>{" "}
                                <strong>
                                  {parseAmount(selectedBarazim.cash).toFixed(2)}{" "}
                                  €
                                </strong>
                              </li>
                              <li className="d-flex justify-content-between">
                                <span>Monedha (fizike):</span>{" "}
                                <strong>
                                  {parseAmount(selectedBarazim.monedha).toFixed(
                                    2
                                  )}{" "}
                                  €
                                </strong>
                              </li>
                              <li className="d-flex justify-content-between">
                                <span>Borxhe:</span>{" "}
                                <strong>
                                  {parseAmount(selectedBarazim.borxhe).toFixed(
                                    2
                                  )}{" "}
                                  €
                                </strong>
                              </li>
                              <li className="d-flex justify-content-between">
                                <span>Banka (POS):</span>{" "}
                                <strong>
                                  {parseAmount(selectedBarazim.banka).toFixed(
                                    2
                                  )}{" "}
                                  €
                                </strong>
                              </li>
                              <li className="d-flex justify-content-between">
                                <span>Paguar Fatura:</span>{" "}
                                <strong>
                                  {parseAmount(
                                    selectedBarazim.pagesFatura
                                  ).toFixed(2)}{" "}
                                  €
                                </strong>
                              </li>
                              <li className="d-flex justify-content-between">
                                <span>Tjera:</span>{" "}
                                <strong>
                                  {parseAmount(selectedBarazim.tjera).toFixed(
                                    2
                                  )}{" "}
                                  €
                                </strong>
                                {selectedBarazim.pershkrimiTjera && (
                                  <small className="text-muted d-block">
                                    ({selectedBarazim.pershkrimiTjera})
                                  </small>
                                )}
                              </li>
                              <li className="d-flex justify-content-between mt-3 pt-3 border-top">
                                <strong>Totali Daljeve:</strong>{" "}
                                <strong className="text-danger fs-5">
                                  {dalje.toFixed(2)} €
                                </strong>
                              </li>
                            </ul>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <div className="text-center mt-5 p-4 bg-light rounded">
                      <h2 className="mb-0">
                        Dallimi:{" "}
                        <span
                          style={{
                            color:
                              dallimi > 0
                                ? "green"
                                : dallimi < 0
                                ? "red"
                                : "black",
                            fontWeight: "bold",
                          }}>
                          {dallimi.toFixed(2)} €
                        </span>
                      </h2>
                    </div>
                  </>
                );
              })()}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Mbyll
            </Button>

            {selectedBarazim && (
              <PDFDownloadLink
                document={<RaportiPDF barazim={selectedBarazim} />}
                fileName={`Barazimi_${new Date(selectedBarazim.kohaBarazimit)
                  .toLocaleDateString("sq-AL")
                  .replace(/\//g, "-")}.pdf`}>
                {({ loading }) => (
                  <Button variant="primary" disabled={loading}>
                    {loading ? "Duke gjeneruar..." : "🖨️ Shkarko PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

export default ListaBarazimeve;
