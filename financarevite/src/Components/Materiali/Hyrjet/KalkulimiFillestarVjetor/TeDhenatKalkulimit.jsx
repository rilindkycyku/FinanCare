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
                    Nr. Fatures:{" "}
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
                </Col>
                <Col className={classes.mobileResponsive}>
                  <p>
                    <strong>Personi Pergjegjes:</strong>{" "}
                    {teDhenatFat &&
                      teDhenatFat.regjistrimet.stafiId + " - " + teDhenatFat &&
                      teDhenatFat.regjistrimet.username}
                  </p>
                  <p>
                    <strong>Lloji Fatures:</strong> Kalkulimi Fillestar Vjetor
                  </p>
                  <p>
                    <strong>Viti Kalkulimit:</strong>{" "}
                    {new Date(
                      teDhenatFat && teDhenatFat.regjistrimet.dataRegjistrimit
                    ).getFullYear()}
                  </p>
                  <p>
                    <strong>Statusi i kalkulimit:</strong>{" "}
                    {teDhenatFat &&
                    teDhenatFat.regjistrimet.statusiKalkulimit === "true"
                      ? "I Mbyllur"
                      : "I Hapur"}
                  </p>

                </Col>
                <Col className={classes.mobileResponsive}>
                <h4>
                    Totali Pa TVSH:{" "}
                    {parseFloat(teDhenatFat.totaliPaTVSH).toFixed(2)} €
                  </h4>
                  <h4>
                    Totali Me TVSH:{" "}
                    {parseFloat(teDhenatFat.totaliMeTVSH).toFixed(2)} €
                  </h4>
                  
                  <h4>
                    Qmimi Shites:{" "}
                    {parseFloat(teDhenatFat.qmimiTotalShites).toFixed(2)} €
                  </h4>
                  <h4>
                    Diferenca:{" "}
                    {parseFloat(
                      teDhenatFat.qmimiTotalShites - teDhenatFat.totaliMeTVSH
                    ).toFixed(2)}{" "}
                    €
                  </h4>
                </Col>
              </Row>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Nr. Rendore</th>
                    <th>Barkodi dhe Emri</th>
                    <th>Numri Perditesmeve</th>
                    <th>Sasia e Vjeter ne Stok</th>
                    <th>Sasia ne Kalkulim</th>
                    <th>Diferenca Stokut</th>
                    <th>Qmimi Bleres + TVSH €</th>
                    <th>Qmimi Shites me Pakic + TVSH € </th>
                    <th>Qmimi Shites me Shumic + TVSH € </th>
                    <th>Totali Bleres €</th>
                    <th>Totali Shites €</th>
                    <th>Diferneca Shites - Bleres €</th>
                  </tr>
                </thead>
                <tbody>
                  {produktet.map((produkti, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        {produkti.barkodi + " - " + produkti.emriProduktit}
                      </td>
                      <td>{parseInt(produkti.rabati2)}</td>
                      <td>{parseFloat(produkti.rabati1).toFixed(2)}</td>
                      <td>{parseFloat(produkti.sasiaStokut).toFixed(2)}</td>
                      <td>{parseFloat(produkti.sasiaStokut - produkti.rabati1).toFixed(2)}</td>
                      <td>{parseFloat(produkti.qmimiBleres).toFixed(2)} €</td>
                      <td>{parseFloat(produkti.qmimiShites).toFixed(2)} €</td>
                      <td>
                        {parseFloat(produkti.qmimiShitesMeShumic).toFixed(2)} €
                      </td>
                      <td>
                        {(produkti.sasiaStokut * produkti.qmimiBleres).toFixed(
                          2
                        )}{" "}
                        €
                      </td>
                      <td>
                        {(produkti.sasiaStokut * produkti.qmimiShites).toFixed(
                          2
                        )}{" "}
                        €
                      </td>
                      <td>
                        {(
                          produkti.sasiaStokut * produkti.qmimiShites -
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
    </>
  );
}

export default TeDhenatKalkulimit;
