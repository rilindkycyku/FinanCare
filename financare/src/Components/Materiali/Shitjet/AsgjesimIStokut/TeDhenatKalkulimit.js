import { useEffect, useState } from "react";
import classes from "./Styles/TabelaEKompanive.module.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileInvoice,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { Table, Container, Row, Col } from "react-bootstrap";
import Fatura from "../../../TeTjera/Fatura/Fatura";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function TeDhenatKalkulimit(props) {
  const [perditeso, setPerditeso] = useState("");
  const [loading, setLoading] = useState(false);
  const [produktet, setProduktet] = useState([]);
  const [teDhenatFat, setTeDhenatFat] = useState("");

  const [shkarkoFaturen, setShkarkoFaturen] = useState(false);

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

  const ndrroField = (e, tjetra) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(tjetra).focus();
    }
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
      {shkarkoFaturen && (
        <Fatura
          nrFatures={props.id}
          mbyllFaturen={() => setShkarkoFaturen(false)}
        />
      )}
      {!shkarkoFaturen && (
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
                    <Button
                      className="mb-3 Butoni"
                      onClick={() => setShkarkoFaturen(true)}>
                      Fatura <FontAwesomeIcon icon={faFileInvoice} />
                    </Button>
                  </h1>
                </Row>
                <Row>
                  <Col className={classes.mobileResponsive}>
                    <h4>
                      Nr. Asgjesimit:{" "}
                      {teDhenatFat && teDhenatFat.regjistrimet.nrRendorFatures}
                    </h4>
                    <h4>
                      Data Fatures:{" "}
                      {new Date(
                        teDhenatFat && teDhenatFat.regjistrimet.dataRegjistrimit
                      ).toLocaleDateString("en-GB", { dateStyle: "short" })}
                    </h4>
                    <h4>
                      Pershkrimi Shtese:{" "}
                      {teDhenatFat && teDhenatFat.regjistrimet.pershkrimShtese}
                    </h4>
                  </Col>
                  <Col className={classes.mobileResponsive}>
                    <p>
                      <strong>Personi Pergjegjes:</strong>{" "}
                      {teDhenatFat &&
                        teDhenatFat.regjistrimet.stafiId +
                          " - " +
                          teDhenatFat &&
                        teDhenatFat.regjistrimet.username}
                    </p>
                    <p>
                      <strong>Lloji Fatures:</strong> Asgjesim i Stokut
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
                      <th>Shuma Totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produktet.map((produkti, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          {produkti.idProduktit +
                            " - " +
                            produkti.emriProduktit}
                        </td>
                        <td>{parseFloat(produkti.sasiaStokut).toFixed(2)}</td>
                        <td>
                          {parseFloat(
                            produkti.sasiaStokut * produkti.qmimiBleres
                          ).toFixed(2)}{" "}
                          €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Container>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default TeDhenatKalkulimit;
