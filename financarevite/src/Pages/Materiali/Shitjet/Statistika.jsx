import NavBar from "../../../Components/TeTjera/layout/NavBar";
import "../../Styles/Statistika.css";
import "../../Styles/DizajniPergjithshem.css";
import Card from "react-bootstrap/Card";
import axios from "axios";
import { useState, useEffect } from "react";
import { MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import ChartComponent from "../../../Components/TeTjera/Chart/ChartComponent";
import { Col, Row } from "react-bootstrap";
import Titulli from "../../../Components/TeTjera/Titulli";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";

function Statistika() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [totaleTeNdryshme, setTotaleTeNdryshme] = useState([]);
  const [top15Bleresit, setTop15Bleresit] = useState([]);
  const [top15Bizneset, setTop15Bizneset] = useState([]);
  const [top15Produktet, setTop15Produktet] = useState([]);
  const [shitjetJavore, setShitjetJavore] = useState([]);
  const [shitjetMeParagon, setShitjetMeParagon] = useState([]);

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const vendosTotalinPerdoruesve = async () => {
      try {
        const totalet = await axios.get(
          `${API_BASE_URL}/api/Statistikat/totaleTeNdryshme`,
          authentikimi
        );
        setTotaleTeNdryshme(totalet.data);
      } catch (e) {
        console.error(e);
      }
    };

    const vendosTop15Bleresit = async () => {
      try {
        const bleresit = await axios.get(
          `${API_BASE_URL}/api/Statistikat/15BleresitQytetarMeSeShumtiBlerje`,
          authentikimi
        );
        setTop15Bleresit(bleresit.data);
      } catch (e) {
        console.error(e);
      }
    };

    const vendosTop15Bizneset = async () => {
      try {
        const bleresit = await axios.get(
          `${API_BASE_URL}/api/Statistikat/15BleresitBiznesorMeSeShumtiBlerje`,
          authentikimi
        );
        setTop15Bizneset(bleresit.data);
      } catch (e) {
        console.error(e);
      }
    };

    const vendosTop15Produktet = async () => {
      try {
        const produktet = await axios.get(
          `${API_BASE_URL}/api/Statistikat/15ProduktetMeTeShitura`,
          authentikimi
        );
        setTop15Produktet(produktet.data);
      } catch (e) {
        console.error(e);
      }
    };

    const vendosShitjetJavore = async () => {
      try {
        const dita = await axios.get(
          `${API_BASE_URL}/api/Statistikat/TotaletJavore`,
          authentikimi
        );
        setShitjetJavore(dita.data);
      } catch (e) {
        console.error(e);
      }
    };

    const vendosShitjetMeParagon = async () => {
      try {
        const dita = await axios.get(
          `${API_BASE_URL}/api/Statistikat/ShitjetMeParagonSipasOperatorit`,
          authentikimi
        );
        setShitjetMeParagon(dita.data);
      } catch (e) {
        console.error(e);
      }
    };

    vendosTotalinPerdoruesve();
    vendosTop15Bleresit();
    vendosTop15Produktet();
    vendosTop15Bizneset();
    vendosShitjetJavore();
    vendosShitjetMeParagon();
  }, []);

  function shfaqDiten(data) {
    const options = { weekday: "long" };
    const dataAktuale = new Date(data);
    const emriDites = dataAktuale.toLocaleDateString("sq-AL", options);

    const shkronjatEPara = emriDites.slice(0, 3).toUpperCase();

    const emriDitesIKonvertuar = shkronjatEPara + emriDites.slice(3);

    return emriDitesIKonvertuar;
  }

  const produktetData = {
    labels:
      top15Produktet && top15Produktet.map((k) => k.produkti.emriProduktit),
    datasets: [
      {
        label: "Totali Porosive",
        data: top15Produktet && top15Produktet.map((k) => k.totaliPorosive),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        fill: false,
      },
      {
        label: "Totali Shitjeve €",
        data:
          top15Produktet &&
          top15Produktet.map((k) => parseFloat(k.totaliBlerjeve).toFixed(2)),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Data for Weekly Sales Chart
  const shitjetJavoreData = {
    labels:
      shitjetJavore &&
      shitjetJavore.totaletDitore &&
      shitjetJavore.totaletDitore.map((k) =>
        new Date(k.data).toLocaleDateString("en-GB", { dateStyle: "short" })
      ),
    datasets: [
      {
        label: "Shitjet Ditore €",
        data:
          shitjetJavore &&
          shitjetJavore.totaletDitore &&
          shitjetJavore.totaletDitore.map((k) =>
            parseFloat(k.totaliShitjeveDitore).toFixed(2)
          ),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        fill: false,
      },
      {
        label: "Porosite Ditore",
        data:
          shitjetJavore &&
          shitjetJavore.totaletDitore &&
          shitjetJavore.totaletDitore.map((k) => k.totaliPorosiveDitore),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        fill: false,
      },
    ],
  };

  // Chart options (you can customize this further)
  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <>
      <KontrolloAksesinNeFaqe
        roletELejuara={["Menaxher"]}
      />
      <Titulli titulli={"Statistika"} />
      <NavBar />
      <div className="containerDashboardP">
        <h1 className="title">Statistikat e Dyqanit</h1>
        <hr />
        <h1 className="title">Statistikat e Pergjithshme</h1>
        <div className="cardStatisitkat">
          <Card className="KartaStatistikave" border="dark">
            <Card.Header>Totali Shitjeve</Card.Header>
            <Card.Body>
              <Card.Text>
                <span className="TekstiStatistika">
                  {parseFloat(
                    totaleTeNdryshme?.totaliShitjeve +
                      totaleTeNdryshme?.totaliShitjeveParagonEuro
                  ).toFixed(2)}{" "}
                  €
                </span>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card className="KartaStatistikave" border="dark">
            <Card.Header>Totali Produkteve</Card.Header>
            <Card.Body>
              <Card.Text>
                <span className="TekstiStatistika">
                  {totaleTeNdryshme.totaliProdukteve}
                </span>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card className="KartaStatistikave" border="dark">
            <Card.Header>Totali Bleresve Qytetar</Card.Header>
            <Card.Body>
              <Card.Text>
                <span className="TekstiStatistika">
                  {totaleTeNdryshme.totaliKlient}
                </span>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card className="KartaStatistikave" border="dark">
            <Card.Header>Totali Bleresve Biznesor</Card.Header>
            <Card.Body>
              <Card.Text>
                <span className="TekstiStatistika">
                  {totaleTeNdryshme.totaliKlientBiznesi}
                </span>
              </Card.Text>
            </Card.Body>
          </Card>
        </div>

        <div className="cardStatisitkat">
          <Card className="KartaStatistikave" border="dark">
            <Card.Header>Totali Shitjeve me Fatura</Card.Header>
            <Card.Body>
              <Card.Text>
                <span className="TekstiStatistika">
                  {parseFloat(totaleTeNdryshme.totaliShitjeve).toFixed(2)} €
                </span>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card className="KartaStatistikave" border="dark">
            <Card.Header>Totali Porosive me Fatura</Card.Header>
            <Card.Body>
              <Card.Text>
                <span className="TekstiStatistika">
                  {totaleTeNdryshme.totaliPorosive}
                </span>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card className="KartaStatistikave" border="dark">
            <Card.Header>Totali Shitjeve me Paragon</Card.Header>
            <Card.Body>
              <Card.Text>
                <span className="TekstiStatistika">
                  {parseFloat(
                    totaleTeNdryshme?.totaliShitjeveParagonEuro
                  ).toFixed(2)}{" "}
                  €
                </span>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card className="KartaStatistikave" border="dark">
            <Card.Header>Totali Paragonave</Card.Header>
            <Card.Body>
              <Card.Text>
                <span className="TekstiStatistika">
                  {totaleTeNdryshme.totaliShitjeveParagon}
                </span>
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
        <hr />
        <h1 className="title">Statistikat Ditore dhe Mujore</h1>
        <div className="cardStatisitkat">
          <Card
            className="KartaStatistikave"
            bg={
              totaleTeNdryshme.totaliShitjeveSotme >
              totaleTeNdryshme.totaliShitjeveDjeshme
                ? "success"
                : totaleTeNdryshme.totaliShitjeveDjeshme ===
                  totaleTeNdryshme.totaliShitjeveSotme
                ? "light"
                : "danger"
            }
            text={
              totaleTeNdryshme.totaliShitjeveSotme ===
              totaleTeNdryshme.totaliShitjeveDjeshme
                ? "dark"
                : "white"
            }>
            <Card.Header>Totali Shitjev Sotme</Card.Header>
            <Card.Body>
              <Card.Text>
                <span className="TekstiStatistika">
                  {parseFloat(totaleTeNdryshme.totaliShitjeveSotme).toFixed(2)}{" "}
                  €
                </span>
                <p>
                  {totaleTeNdryshme.totaliShitjeveSotme >
                  totaleTeNdryshme.totaliShitjeveDjeshme
                    ? (
                        totaleTeNdryshme.totaliShitjeveSotme -
                        totaleTeNdryshme.totaliShitjeveDjeshme
                      ).toFixed(2) + "€ Shitje me shume se Dje"
                    : totaleTeNdryshme.totaliShitjeveDjeshme ===
                      totaleTeNdryshme.totaliShitjeveSotme
                    ? "Njesoj si Dje"
                    : (
                        totaleTeNdryshme.totaliShitjeveDjeshme -
                        totaleTeNdryshme.totaliShitjeveSotme
                      ).toFixed(2) + "€ Shitje me pak se Dje"}
                </p>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card
            className="KartaStatistikave"
            bg={
              totaleTeNdryshme.totaliPorosiveSotme >
              totaleTeNdryshme.totaliPorosiveDjeshme
                ? "success"
                : totaleTeNdryshme.totaliPorosiveDjeshme ===
                  totaleTeNdryshme.totaliPorosiveSotme
                ? "light"
                : "danger"
            }
            text={
              totaleTeNdryshme.totaliPorosiveSotme ===
              totaleTeNdryshme.totaliPorosiveDjeshme
                ? "dark"
                : "white"
            }>
            <Card.Header>Totali Porosive Sotme</Card.Header>
            <Card.Body>
              <Card.Text>
                <span className="TekstiStatistika">
                  {totaleTeNdryshme.totaliPorosiveSotme}
                </span>
                <p>
                  {totaleTeNdryshme.totaliPorosiveSotme >
                  totaleTeNdryshme.totaliPorosiveDjeshme
                    ? totaleTeNdryshme.totaliPorosiveSotme -
                      totaleTeNdryshme.totaliPorosiveDjeshme +
                      " Porosi me shume se Dje"
                    : totaleTeNdryshme.totaliPorosiveDjeshme ===
                      totaleTeNdryshme.totaliPorosiveSotme
                    ? "Njesoj si Dje"
                    : totaleTeNdryshme.totaliPorosiveDjeshme -
                      totaleTeNdryshme.totaliPorosiveSotme +
                      " Porosi me pak se Dje"}
                </p>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card
            className=".KartaStatistikave"
            bg={
              totaleTeNdryshme.totaliShitjeveKeteMuaj >
              totaleTeNdryshme.totaliShitjeveMuajinKaluar
                ? "success"
                : totaleTeNdryshme.totaliShitjeveMuajinKaluar ===
                  totaleTeNdryshme.totaliShitjeveKeteMuaj
                ? "light"
                : "danger"
            }
            text={
              totaleTeNdryshme.totaliShitjeveKeteMuaj ===
              totaleTeNdryshme.totaliShitjeveMuajinKaluar
                ? "dark"
                : "white"
            }>
            <Card.Header>Totali Shitjev Kete muaj</Card.Header>
            <Card.Body>
              <Card.Text>
                <span className="TekstiStatistika">
                  {parseFloat(totaleTeNdryshme.totaliShitjeveKeteMuaj).toFixed(
                    2
                  )}{" "}
                  €
                </span>
                <p>
                  {totaleTeNdryshme.totaliShitjeveKeteMuaj >
                  totaleTeNdryshme.totaliShitjeveMuajinKaluar
                    ? (
                        totaleTeNdryshme.totaliShitjeveKeteMuaj -
                        totaleTeNdryshme.totaliShitjeveMuajinKaluar
                      ).toFixed(2) + "€ Shitje me shume se muajin e Kaluar"
                    : totaleTeNdryshme.totaliShitjeveMuajinKaluar ===
                      totaleTeNdryshme.totaliShitjeveKeteMuaj
                    ? "Njesoj si muajin e kaluar"
                    : (
                        totaleTeNdryshme.totaliShitjeveMuajinKaluar -
                        totaleTeNdryshme.totaliShitjeveKeteMuaj
                      ).toFixed(2) + "€ Shitje me pak se muajin e Kaluar"}
                </p>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card
            className="KartaStatistikave"
            bg={
              totaleTeNdryshme.totaliPorosiveKeteMuaj >
              totaleTeNdryshme.totaliPorosiveMuajinKaluar
                ? "success"
                : totaleTeNdryshme.totaliPorosiveMuajinKaluar ===
                  totaleTeNdryshme.totaliPorosiveKeteMuaj
                ? "light"
                : "danger"
            }
            text={
              totaleTeNdryshme.totaliPorosiveKeteMuaj ===
              totaleTeNdryshme.totaliPorosiveMuajinKaluar
                ? "dark"
                : "white"
            }>
            <Card.Header>Totali Porosive Kete muaj</Card.Header>
            <Card.Body>
              <Card.Text>
                <span className="TekstiStatistika">
                  {totaleTeNdryshme.totaliPorosiveKeteMuaj}
                </span>
                <p>
                  {totaleTeNdryshme.totaliPorosiveKeteMuaj >
                  totaleTeNdryshme.totaliPorosiveMuajinKaluar
                    ? totaleTeNdryshme.totaliPorosiveKeteMuaj -
                      totaleTeNdryshme.totaliPorosiveMuajinKaluar +
                      " Porosi me shume se muajin e Kaluar"
                    : totaleTeNdryshme.totaliPorosiveMuajinKaluar ===
                      totaleTeNdryshme.totaliPorosiveKeteMuaj
                    ? "Njesoj si muajin e kaluar"
                    : totaleTeNdryshme.totaliPorosiveMuajinKaluar -
                      totaleTeNdryshme.totaliPorosiveKeteMuaj +
                      " Porosi me pak se muajin e Kaluar"}
                </p>
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
        <div className="cardStatisitkat">
          <Card border="dark">
            <Card.Header>
              Shitjet Ditore |{" "}
              {new Date(shitjetMeParagon?.today).toLocaleDateString("en-GB", {
                dateStyle: "short",
              })}
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <MDBTable align="middle">
                  <MDBTableHead>
                    <tr>
                      <th scope="col">Operatori</th>
                      <th scope="col">Totali Paragonave</th>
                      <th scope="col">Totali Shitjeve €</th>
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody>
                    {shitjetMeParagon?.shitjetDitore?.shitjetDitoreSipasOperatorit.map(
                      (k) => (
                        <tr key={k?.stafi?.userID}>
                          <td>{k?.stafi?.username}</td>
                          <td>{k.numriBlerjeve}</td>
                          <td>
                            {parseFloat(k.totaliBlerjeveEuro).toFixed(2)} €
                          </td>
                        </tr>
                      )
                    )}
                    <tr>
                      <td>
                        <strong>-</strong>
                      </td>
                      <td>
                        <strong>
                          {
                            shitjetMeParagon?.shitjetDitore
                              ?.shitjetDitoreParagon
                          }
                        </strong>
                      </td>
                      <td>
                        <strong>
                          {parseFloat(
                            shitjetMeParagon?.shitjetDitore?.shitjetDitoreEuro
                          ).toFixed(2)}{" "}
                          €
                        </strong>
                      </td>
                    </tr>
                  </MDBTableBody>
                </MDBTable>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card border="dark">
            <Card.Header>
              Shitjet Javore |{" "}
              {new Date(shitjetMeParagon?.startOfWeek).toLocaleDateString(
                "en-GB",
                { dateStyle: "short" }
              )}{" "}
              -{" "}
              {new Date(shitjetMeParagon?.endOfWeek).toLocaleDateString(
                "en-GB",
                { dateStyle: "short" }
              )}
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <MDBTable align="middle">
                  <MDBTableHead>
                    <tr>
                      <th scope="col">Operatori</th>
                      <th scope="col">Totali Paragonave</th>
                      <th scope="col">Totali Shitjeve €</th>
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody>
                    {shitjetMeParagon?.shitjetJavore?.shitjetJavoreSipasOperatorit?.map(
                      (k) => (
                        <tr key={k?.stafi?.userID}>
                          <td>{k?.stafi?.username}</td>
                          <td>{k.numriBlerjeve}</td>
                          <td>
                            {parseFloat(k.totaliBlerjeveEuro).toFixed(2)} €
                          </td>
                        </tr>
                      )
                    )}
                    <tr>
                      <td>
                        <strong>-</strong>
                      </td>
                      <td>
                        <strong>
                          {
                            shitjetMeParagon?.shitjetJavore
                              ?.shitjetJavoreParagon
                          }
                        </strong>
                      </td>
                      <td>
                        <strong>
                          {parseFloat(
                            shitjetMeParagon?.shitjetJavore?.shitjetJavoreEuro
                          ).toFixed(2)}{" "}
                          €
                        </strong>
                      </td>
                    </tr>
                  </MDBTableBody>
                </MDBTable>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card border="dark">
            <Card.Header>
              Shitjet Mujore |{" "}
              {new Date(shitjetMeParagon?.startOfMonth).toLocaleDateString(
                "en-GB",
                { dateStyle: "short" }
              )}{" "}
              -{" "}
              {new Date(shitjetMeParagon?.endOfMonth).toLocaleDateString(
                "en-GB",
                { dateStyle: "short" }
              )}
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <MDBTable align="middle">
                  <MDBTableHead>
                    <tr>
                      <th scope="col">Operatori</th>
                      <th scope="col">Totali Paragonave</th>
                      <th scope="col">Totali Shitjeve €</th>
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody>
                    {shitjetMeParagon?.shitjetMujore?.shitjetMujoreSipasOperatorit?.map(
                      (k) => (
                        <tr key={k?.stafi?.userID}>
                          <td>{k?.stafi?.username}</td>
                          <td>{k.numriBlerjeve}</td>
                          <td>
                            {parseFloat(k.totaliBlerjeveEuro).toFixed(2)} €
                          </td>
                        </tr>
                      )
                    )}
                    <tr>
                      <td>
                        <strong>-</strong>
                      </td>
                      <td>
                        <strong>
                          {
                            shitjetMeParagon?.shitjetMujore
                              ?.shitjetMujoreParagon
                          }
                        </strong>
                      </td>
                      <td>
                        <strong>
                          {parseFloat(
                            shitjetMeParagon?.shitjetMujore?.shitjetMujoreEuro
                          ).toFixed(2)}{" "}
                          €
                        </strong>
                      </td>
                    </tr>
                  </MDBTableBody>
                </MDBTable>
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
        <hr />
        <h1 className="title">Statistikat Tabelare</h1>

        <div className="cardStatisitkat"></div>
        <div className="cardStatisitkat">
          <Card border="dark">
            <Card.Header>
              Bleresit Qytetar me se Shumti Blerje{" "}
              <span style={{ fontStyle: "italic", fontWeight: "bold" }}>
                (Nuk zbriten Kthimet)
              </span>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <MDBTable align="middle">
                  <MDBTableHead>
                    <tr>
                      <th scope="col">Kartela Klientit</th>
                      <th scope="col">Partneri</th>
                      <th scope="col">Totali Blerjeve</th>
                      <th scope="col">Shuma Totale Blerjes</th>
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody>
                    {top15Bleresit.map((k) => (
                      <tr key={k?.partneri?.kartela?.kodiKartela}>
                        <td>{k?.partneri?.kartela?.kodiKartela}</td>
                        <td>{k?.partneri?.emriBiznesit}</td>
                        <td>{k?.numriBlerjeve}</td>
                        <td>
                          {parseFloat(k?.totaliBlerjeveEuro).toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </MDBTableBody>
                </MDBTable>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card border="dark">
            <Card.Header>
              Bizneset me se Shumti Blerje{" "}
              <span style={{ fontStyle: "italic", fontWeight: "bold" }}>
                (Nuk zbriten Flete Lejimet)
              </span>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                <MDBTable align="middle">
                  <MDBTableHead>
                    <tr>
                      <th scope="col">Partneri</th>
                      <th scope="col">Totali Porosive</th>
                      <th scope="col">Shuma Totale Porosive</th>
                    </tr>
                  </MDBTableHead>
                  <MDBTableBody>
                    {top15Bizneset.map((k) => (
                      <tr key={k?.partneri?.idPartneri}>
                        <td>{k?.partneri?.emriBiznesit}</td>
                        <td>{k?.numriBlerjeve}</td>
                        <td>
                          {parseFloat(k?.totaliBlerjeveEuro).toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </MDBTableBody>
                </MDBTable>
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
        <h1 className="title">Statistikat Charts</h1>
        <Row className="mb-3">
          <Col md="6">
            {/* Card for Top 15 Products */}
            <Card border="dark">
              <Card.Header>Produktet me Te Shitura</Card.Header>
              <Card.Body>
                <ChartComponent
                  chartType="bar"
                  chartData={produktetData}
                  chartOptions={chartOptions}
                />
              </Card.Body>
            </Card>
          </Col>

          <Col md="6">
            {/* Card for Weekly Sales */}
            <Card border="dark">
              <Card.Header>Statistikat Javore</Card.Header>
              <Card.Body>
                <ChartComponent
                  chartType="line"
                  chartData={shitjetJavoreData}
                  chartOptions={chartOptions}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Statistika;
