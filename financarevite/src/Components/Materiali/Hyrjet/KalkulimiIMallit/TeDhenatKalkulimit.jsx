import { useEffect, useMemo, useState } from "react";
import classes from "./Styles/TabelaEKompanive.module.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { Table, Container, Row, Col } from "react-bootstrap";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";
import { exportInvoiceExcel } from "@/utils/exportInvoiceExcel";

function TeDhenatKalkulimit(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [perditeso, setPerditeso] = useState("");
  const [loading, setLoading] = useState(false);
  const [produktet, setProduktet] = useState([]);
  const [teDhenatFat, setTeDhenatFat] = useState("");

  const getToken = localStorage.getItem("token");

  const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

  useEffect(() => {
    const vendosTeDhenat = async () => {
      try {
        setLoading(true);
        const produktet = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${props.id}`,
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
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.id}`,
          authentikimi
        );
        setTeDhenatFat(teDhenat.data);
        setLoading(false);
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

  const exportExcel = async () => {
    await exportInvoiceExcel(teDhenatFat, produktet);
  };

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant", "1 Euro Menaxher"]}
        largo={() => props.largo?.()}
        shfaqmesazhin={() => props.shfaqmesazhin?.()}
        perditesoTeDhenat={() => props.perditesoTeDhenat?.()}
        setTipiMesazhit={(e) => props.setTipiMesazhit?.(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit?.(e)}
      />
      <div className={classes.containerDashboardP}>
        {loading ? (
          <div className="Loader">
            <TailSpin
              height="80"
              width="80"
              color="#10b981"
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
              {/* Header bar */}
              <Row>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 w-100">
                  <h1 className="title mb-0">Te Dhenat e Fatures</h1>
                  <div className="d-flex gap-2 align-items-center">
                    <Button
                      variant="success"
                      onClick={exportExcel}
                      disabled={produktet.length === 0}
                    >
                      <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                      Eksporto Excel
                    </Button>
                    <Button className="Butoni" onClick={handleSave}>
                      Mbyll Te Dhenat <FontAwesomeIcon icon={faXmark} />
                    </Button>
                  </div>
                </div>
              </Row>

              {/* Invoice details */}
              <Row>
                <Col className={classes.mobileResponsive}>
                  <h4>Partneri: {teDhenatFat && teDhenatFat.regjistrimet?.emriBiznesit}</h4>
                  <h4>Nr. Fatures: {teDhenatFat && teDhenatFat.regjistrimet?.nrFatures}</h4>
                  <h4>
                    Data Fatures:{" "}
                    {teDhenatFat && new Date(teDhenatFat.regjistrimet?.dataRegjistrimit).toLocaleDateString("en-GB", { dateStyle: "short" })}
                  </h4>
                  <h4>Rabati: {parseFloat(teDhenatFat.rabati || 0).toFixed(2)} €</h4>
                  <h4>Totali Pa TVSH: {parseFloat(teDhenatFat.totaliPaTVSH || 0).toFixed(2)} €</h4>
                  <h4>Totali Me TVSH: {parseFloat(teDhenatFat.totaliMeTVSH || 0).toFixed(2)} €</h4>
                </Col>
                <Col className={classes.mobileResponsive}>
                  <p><strong>Totali Pa TVSH 8 %:</strong> {parseFloat(teDhenatFat.totaliPaTVSH8 || 0).toFixed(2)} €</p>
                  <p><strong>Totali Pa TVSH 18 %:</strong> {parseFloat(teDhenatFat.totaliPaTVSH18 || 0).toFixed(2)} €</p>
                  <p><strong>TVSH-ja 8% :</strong> {parseFloat(teDhenatFat.tvsH8 || 0).toFixed(2)} €</p>
                  <p><strong>TVSH-ja 18% :</strong> {parseFloat(teDhenatFat.tvsH18 || 0).toFixed(2)} €</p>
                  <p><strong>Pagesa behet me:</strong> {teDhenatFat && teDhenatFat.regjistrimet?.llojiPageses}</p>
                  <p><strong>Statusi i Pageses:</strong> {teDhenatFat && teDhenatFat.regjistrimet?.statusiPageses}</p>
                </Col>
                <Col className={classes.mobileResponsive}>
                  <p>
                    <strong>Personi Pergjegjes:</strong>{" "}
                    {teDhenatFat && teDhenatFat.regjistrimet?.username}
                  </p>
                  <p><strong>Nr. Kalkulimit: </strong>{teDhenatFat && teDhenatFat.regjistrimet?.nrRendorFatures}</p>
                  <p><strong>Lloji Fatures:</strong> Hyrje</p>
                  <p>
                    <strong>Statusi i kalkulimit:</strong>{" "}
                    {teDhenatFat && teDhenatFat.regjistrimet?.statusiKalkulimit === "true" ? "I Mbyllur" : "I Hapur"}
                  </p>
                </Col>
              </Row>

              {/* Products table */}
              <Table striped bordered hover responsive className="table-responsive text-nowrap" style={{ whiteSpace: "nowrap" }}>
                <thead>
                  <tr>
                    <th>Nr. Rendore</th>
                    <th>ID dhe Emri</th>
                    <th>Sasia</th>
                    <th>Qmimi Bleres</th>
                    <th>Qmimi Shites</th>
                    <th>Shuma Totale Blerese</th>
                    <th>Shuma Totale Shitese</th>
                  </tr>
                </thead>
                <tbody>
                  {produktet.map((produkti, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{produkti.idProduktit + " - " + produkti.emriProduktit}</td>
                      <td>{produkti.sasiaStokut}</td>
                      <td>{parseFloat(produkti.qmimiBleres).toFixed(2)} €</td>
                      <td>{parseFloat(produkti.qmimiShites).toFixed(2)} €</td>
                      <td>{(produkti.sasiaStokut * produkti.qmimiBleres).toFixed(2)} €</td>
                      <td>{(produkti.sasiaStokut * produkti.qmimiShites).toFixed(2)} €</td>
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
