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
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
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
          `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${props.id}`,
          authentikimi
        );
        const teDhenat = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.id}`,
          authentikimi
        );
        setTeDhenatFat(teDhenat.data);
        setProduktet(produktet.data);
        setLoading(false);
        console.log(produktet.data);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    vendosTeDhenat();
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
        roletELejuara={["Menaxher", "Kalkulant", "Faturist"]}
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
        <div className="containerDashboardP" style={{ width: "100%" }}>
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
                      Partneri:{" "}
                      {teDhenatFat && teDhenatFat.regjistrimet.emriBiznesit}
                    </h4>
                    <h4>
                      Nr. Fatures:{" "}
                      {teDhenatFat && teDhenatFat.regjistrimet.nrFatures}
                    </h4>
                    <h4>
                      Data Fatures:{" "}
                      {new Date(
                        teDhenatFat && teDhenatFat.regjistrimet.dataRegjistrimit
                      ).toLocaleDateString("en-GB", { dateStyle: "short" })}
                    </h4>
                    <h4>
                      Rabati: {parseFloat(teDhenatFat.rabati).toFixed(2)} €
                    </h4>
                    <h4>
                      Totali Pa TVSH:{" "}
                      {parseFloat(teDhenatFat.totaliPaTVSH).toFixed(2)} €
                    </h4>
                    <h4>
                      Totali Me TVSH:{" "}
                      {parseFloat(teDhenatFat.totaliMeTVSH).toFixed(2)} €
                    </h4>
                  </Col>
                  <Col className={classes.mobileResponsive}>
                    <p>
                      <strong>Totali Pa TVSH 8 %:</strong>{" "}
                      {parseFloat(teDhenatFat.totaliPaTVSH8).toFixed(2)} €
                    </p>
                    <p>
                      <strong>Totali Pa TVSH 18 %:</strong>{" "}
                      {parseFloat(teDhenatFat.totaliPaTVSH18).toFixed(2)} €
                    </p>
                    <p>
                      <strong>TVSH-ja 8% :</strong>{" "}
                      {parseFloat(teDhenatFat.tvsH8).toFixed(2)} €
                    </p>
                    <p>
                      <strong>TVSH-ja 18% :</strong>{" "}
                      {parseFloat(teDhenatFat.tvsH18).toFixed(2)} €
                    </p>
                    <p>
                      <strong>Pagesa behet me:</strong>{" "}
                      {teDhenatFat && teDhenatFat.regjistrimet.llojiPageses}
                    </p>
                    <p>
                      <strong>Statusi i Pageses:</strong>{" "}
                      {teDhenatFat && teDhenatFat.regjistrimet.statusiPageses}
                    </p>
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
                      <strong>Nr. Kalkulimit: </strong>
                      {teDhenatFat && teDhenatFat.regjistrimet.nrRendorFatures}
                    </p>
                    <p>
                      <strong>Lloji Fatures:</strong> Oferte
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
                      <th>Nr.</th>
                      <th>Shifra</th>
                      <th>Emertimi</th>
                      <th>Njm</th>
                      <th>Sasia</th>
                      <th>Qmimi pa TVSH</th>
                      <th>R. 1 %</th>
                      <th>R. 2 %</th>
                      <th>R. 3 %</th>
                      <th>T %</th>
                      <th>Qmimi me TVSH - Rab</th>
                      <th>TVSH €</th>
                      <th>Shuma €</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produktet.map((produkti, index) => {
                      const qmimiMeTVSHRab = parseFloat(
                        produkti.qmimiShites -
                          produkti.qmimiShites * (produkti.rabati1 / 100) -
                          (produkti.qmimiShites -
                            produkti.qmimiShites * (produkti.rabati1 / 100)) *
                            (produkti.rabati2 / 100) -
                          (produkti.qmimiShites -
                            produkti.qmimiShites * (produkti.rabati1 / 100) -
                            (produkti.qmimiShites -
                              produkti.qmimiShites * (produkti.rabati1 / 100)) *
                              (produkti.rabati2 / 100)) *
                            (produkti.rabati3 / 100)
                      ).toFixed(3);
                      const ShumaToT = parseFloat(
                        qmimiMeTVSHRab * produkti.sasiaStokut
                      ).toFixed(3);

                      return (
                        produkti && (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{produkti.kodiProduktit}</td>
                            <td>
                              {produkti.emriProduktit} {produkti.barkodi}
                            </td>
                            <td>{produkti.njesiaMatese1}</td>
                            <td>{produkti.sasiaStokut}</td>
                            <td>
                              {parseFloat(
                                produkti.qmimiShites -
                                  (produkti.qmimiShites *
                                    ((produkti.llojiTVSH /
                                      100 /
                                      (1 + produkti.llojiTVSH / 100)) *
                                      100)) /
                                    100
                              ).toFixed(3)}
                            </td>
                            <td>{parseFloat(produkti.rabati1).toFixed(2)}</td>
                            <td>{parseFloat(produkti.rabati2).toFixed(2)}</td>
                            <td>{parseFloat(produkti.rabati3).toFixed(2)}</td>
                            <td>{produkti.llojiTVSH}</td>
                            <td>{parseFloat(qmimiMeTVSHRab).toFixed(3)}</td>
                            <td>
                              {parseFloat(
                                ShumaToT *
                                  (produkti.llojiTVSH /
                                    100 /
                                    (1 + produkti.llojiTVSH / 100))
                              ).toFixed(3)}
                            </td>
                            <td>{ShumaToT}</td>
                          </tr>
                        )
                      );
                    })}
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
