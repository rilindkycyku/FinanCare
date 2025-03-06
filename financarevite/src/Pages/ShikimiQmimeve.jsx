import { useEffect, useState } from "react";
import axios from "axios";
import { Form, Container, Row, Col } from "react-bootstrap";
import Select from "react-select";
import Titulli from "../Components/TeTjera/Titulli";
import NavBar from "../Components/TeTjera/layout/NavBar";

function ShikimiQmimeve(props) {
  const [produktiID, setproduktiID] = useState(0);
  const [kartelaEProduktit, setKartelaEProduktit] = useState([]);
  const [options, setOptions] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const vendosProduktet = async () => {
      try {
        const produktet = await axios.get(
          `https://localhost:7285/api/Produkti/ProduktetPerKalkulim`,
          authentikimi
        );
        setOptions(
          produktet.data.map((item) => ({
            value: item.produktiID,
            label: item.barkodi + " - " + item.emriProduktit,
          }))
        );
      } catch (err) {
        console.log(err);
      }
    };

    vendosProduktet();
  }, []);

  useEffect(() => {
    if (produktiID) {
      const kartelaEProduktit = async () => {
        try {
          const kartela = await axios.get(
            `https://localhost:7285/api/Produkti/KartelaArtikullit?id=${produktiID}`,
            authentikimi
          );
          setKartelaEProduktit(kartela.data);
        } catch (err) {
          console.log(err);
        }
      };

      kartelaEProduktit();
    }
  }, [produktiID]);

  const handleChange = async (partneri) => {
    setOptionsSelected(partneri);
    setproduktiID(partneri.value);
  };

  const qmimiPakic = parseFloat(
    kartelaEProduktit?.produkti?.qmimiProduktit ?? 0
  ).toFixed(2);

  const rabati = parseFloat(kartelaEProduktit?.produkti?.rabati ?? 0);
  const qmimiMeZbritje = rabati
    ? (qmimiPakic - qmimiPakic * (rabati / 100)).toFixed(2)
    : null;

  return (
    <>
      <Titulli titulli={"Kontrollo Qmimin e Produktit"} />
      <NavBar />

      <div className="containerDashboardP">
        <div className="kartela">
          <h1 className="title text-center">Kontrollo Qmimin e Produktit</h1>

          <Container fluid>
            {/* Section 1: Search */}
            <Row className="mb-4">
              <Col>
                <Form>
                  <Form.Group controlId="idDheEmri">
                    <Form.Label>Produkti</Form.Label>
                    <Select
                      value={optionsSelected}
                      onChange={handleChange}
                      options={options}
                    />
                  </Form.Group>
                </Form>
              </Col>
            </Row>

            {/* Section 2: Main Section */}
            <Row>
              {/* Sasia Section */}
              <Col md={6}>
                <div className="sasia-section">
                  <h4 className="section-title">Sasia</h4>
                  <Row className="mb-3">
                    <Col>
                      <strong>Sasia ne Stok:</strong>
                    </Col>
                    <Col>
                      <span style={{ fontSize: "1.8rem" }}>
                        {kartelaEProduktit?.produkti?.sasiaNeStok ?? 0}{" "}
                        {kartelaEProduktit?.produkti?.emriNjesiaMatese ?? ""}
                      </span>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col>
                      <strong>Sasia e Shumice:</strong>
                    </Col>
                    <Col>
                      <span style={{ fontSize: "1.8rem" }}>
                        {kartelaEProduktit?.produkti?.sasiaShumices ?? 0}
                      </span>
                    </Col>
                  </Row>
                </div>
              </Col>

              {/* Qmimi Section */}
              <Col md={6}>
                <div className="qmimi-section">
                  <h4 className="section-title">Qmimi</h4>

                  <Row className="mb-3">
                    <Col>
                      <strong>Qmimi Shites me Pakic + TVSH:</strong>
                    </Col>
                    <Col>
                      <span
                        style={{
                          fontSize: "2.5rem",
                          fontWeight: "bold",
                        }}>
                        {qmimiPakic} €
                      </span>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col>
                      <strong>Qmimi Shites me Shumic + TVSH:</strong>
                    </Col>
                    <Col>
                      <span
                        style={{
                          fontSize: "2.5rem",
                          fontWeight: "bold",
                        }}>
                        {parseFloat(
                          kartelaEProduktit?.produkti?.qmimiMeShumic ?? 0
                        ).toFixed(2)}{" "}
                        €
                      </span>
                    </Col>
                  </Row>

                  {rabati !== null && rabati > 0 && (
                    <Row className="mb-3">
                      <Col>
                        <strong>Qmimi me Zbritje:</strong>
                      </Col>
                      <Col>
                        <span
                          style={{
                            fontSize: "3rem",
                            fontWeight: "bold",
                            color: "green",
                          }}>
                          {qmimiMeZbritje} €
                        </span>
                      </Col>
                    </Row>
                  )}
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </>
  );
}

export default ShikimiQmimeve;
