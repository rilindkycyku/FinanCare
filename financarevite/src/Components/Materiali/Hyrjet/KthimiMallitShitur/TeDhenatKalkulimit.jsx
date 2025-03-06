import { useEffect, useState } from "react";
import classes from "./Styles/TabelaEKompanive.module.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { Table, Container, Row, Col } from "react-bootstrap";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function TeDhenatKalkulimit(props) {
  const [perditeso, setPerditeso] = useState("");
  const [loading, setLoading] = useState(false);
  const [produktet, setProduktet] = useState([]);
  const [teDhenatFat, setTeDhenatFat] = useState("");

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const vendosTeDhenat = async () => {
      try {
        setLoading(true);
        const produktet = await axios.get(
          `https://localhost:7285/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${props.id}`,
          authentikimi
        );
        setProduktet(produktet.data);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    vendosTeDhenat();
  }, [perditeso]);

  useEffect(() => {
    const shfaqTeDhenatFature = async () => {
      try {
        setLoading(true);
        const teDhenat = await axios.get(
          `https://localhost:7285/api/Faturat/shfaqRegjistrimetNgaID?id=${props.id}`,
          authentikimi
        );
        setTeDhenatFat(teDhenat.data);
        setLoading(false);

        console.log(teDhenat.data);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    shfaqTeDhenatFature();
  }, [perditeso]);

  const handleSave = () => {
    props.setMbyllTeDhenat();
  };

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant"]}
        largo={() => props.largo()}
        shfaqmesazhin={() => props.shfaqmesazhin()}
        perditesoTeDhenat={() => props.perditesoTeDhenat()}
        setTipiMesazhit={(e) => props.setTipiMesazhit(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit(e)}
      />
      <div className={classes.containerDashboardP}>
        {loading ? (
          <div className="Loader">
            <TailSpin
              height="80"
              width="80"
              color="#009879"
              ariaLabel="tail-spin-loading"
              radius="1"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
            />
          </div>
        ) : (
          <>
            <Container fluid>
              <Row>
                <h1 className="title">
                  Te Dhenat e Fatures
                  <Button className="mb-3 Butoni" onClick={handleSave}>
                    Mbyll Te Dhenat <FontAwesomeIcon icon={faXmark} />
                  </Button>
                </h1>
              </Row>
              <Row>
                <Col className={classes.mobileResponsive}>
                  <h4>
                    Nr. Referencues:{" "}
                    {teDhenatFat && teDhenatFat.regjistrimet.nrFatures}
                  </h4>
                  <h4>
                    Data Fatures:{" "}
                    {new Date(
                      teDhenatFat && teDhenatFat.regjistrimet.dataRegjistrimit
                    ).toLocaleDateString("en-GB", { dateStyle: "short" })}
                  </h4>
                </Col>
                <Col className={classes.mobileResponsive}>
                  <p>
                    <strong>Personi Pergjegjes:</strong>{" "}
                    {teDhenatFat &&
                      teDhenatFat.regjistrimet.stafiId + " - " + teDhenatFat &&
                      teDhenatFat.regjistrimet.username}
                  </p>
                  <p>
                    <strong>Nr. Kalkulimit: </strong>
                    {teDhenatFat && teDhenatFat.regjistrimet.nrRendorFatures}
                  </p>
                  <p>
                    <strong>Lloji Fatures:</strong> Kthim i Mallit te Shitur
                  </p>
                  <p>
                    <strong>Statusi i kalkulimit:</strong>{" "}
                    {teDhenatFat &&
                    teDhenatFat.regjistrimet.statusiKalkulimit === "true"
                      ? "I Mbyllur"
                      : "I Hapur"}
                  </p>
                </Col>
              </Row>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Nr. Rendore</th>
                    <th>ID dhe Emri</th>
                    <th>Sasia</th>
                  </tr>
                </thead>
                <tbody>
                  {produktet.map((produkti, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        {produkti.idProduktit + " - " + produkti.emriProduktit}
                      </td>
                      <td>{produkti.sasiaStokut}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Container>
          </>
        )}
      </div>
    </>
  );
}

export default TeDhenatKalkulimit;
