import { useEffect, useState } from "react";
import "../../../../Pages/Styles/DizajniPergjithshem.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faArrowLeft,
  faFileInvoice,
  faCookieBite,
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { Form, Container, Row, Col, Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Tabela from "../../../TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";
import FaturatEShitjesPartnerit from "./FaturatEShitjesPartnerit";
import FaturatEShitjesProdukti from "./FaturatEShitjesProdukti";

function RegjistroFaturen(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [produktetNeKalkulim, setproduktetNeKalkulim] = useState([]);
  const [emriProduktit, setEmriProduktit] = useState("");
  const [produktiID, setProduktiID] = useState(0);
  const [produktet, setProduktet] = useState([]);
  const [sasia, setSasia] = useState("");
  const [qmimiShites, setQmimiShites] = useState("");
  const [rabati1, setRabati1] = useState(null);
  const [rabati2, setRabati2] = useState(null);
  const [rabati3, setRabati3] = useState(null);
  const [njesiaMatese, setNjesiaMatese] = useState("Cope");
  const [totProdukteve, setTotProdukteve] = useState(0);
  const [totStokut, setTotStokut] = useState(0);
  const [totQmimi, setTotQmimi] = useState(0);
  const [totFat, setTotFat] = useState(0);
  const [qmimiB, setQmimiB] = useState(0);
  const [qmimiSH, setQmimiSH] = useState(0);
  const [qmimiSH2, setQmimiSH2] = useState(0);
  const [idTeDhenatKalk, setIdTeDhenatKalk] = useState(0);

  const [edito, setEdito] = useState(false);
  const [konfirmoMbylljenFatures, setKonfirmoMbylljenFatures] = useState(false);
  const [shikoFaturatEShitjesPartneri, setShikoFaturatEShitjesPartneri] =
    useState(false);
  const [shikoFaturatEShitjesProdukti, setShikoFaturatEShitjesProdukti] =
    useState(false);

  const [teDhenat, setTeDhenat] = useState([]);
  const [teDhenatFatures, setTeDhenatFatures] = useState([]);

  const navigate = useNavigate();

  const getID = localStorage.getItem("id");

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    if (getID) {
      const vendosTeDhenat = async () => {
        try {
          const perdoruesi = await axios.get(
            `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
            authentikimi
          );
          setTeDhenat(perdoruesi.data);
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      };

      vendosTeDhenat();
    } else {
      navigate("/login");
    }
  }, [perditeso]);

  useEffect(() => {
    if (props.idKalkulimitEdit != 0) {
      const vendosTeDhenat = async () => {
        try {
          const teDhenatKalkulimit = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${props.idKalkulimitEdit}`,
            authentikimi
          );

          const teDhenatFatures = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.idKalkulimitEdit}`,
            authentikimi
          );

          setproduktetNeKalkulim(
            teDhenatKalkulimit.data.map((k, index) => ({
              ID: k.id,
              "Nr. Rendor": index + 1,
              "Emri Produktit": k.emriProduktit,
              Sasia: parseFloat(k.sasiaStokut).toFixed(2),
              "Qmimi Shites €": parseFloat(k.qmimiShites).toFixed(2),
              "R. 1 %": parseFloat(k.rabati1).toFixed(2),
              "R. 2 %": parseFloat(k.rabati2).toFixed(2),
              "R. 3 %": parseFloat(k.rabati3).toFixed(2),
              "Qmimi Shites - Rabati": parseFloat(
                k.qmimiShites -
                  k.qmimiShites * (k.rabati1 / 100) -
                  (k.qmimiShites - k.qmimiShites * (k.rabati1 / 100)) *
                    (k.rabati2 / 100) -
                  (k.qmimiShites -
                    k.qmimiShites * (k.rabati1 / 100) -
                    (k.qmimiShites - k.qmimiShites * (k.rabati1 / 100)) *
                      (k.rabati2 / 100)) *
                    (k.rabati3 / 100)
              ).toFixed(2),
              "Totali €": parseFloat(
                (k.qmimiShites -
                  k.qmimiShites * (k.rabati1 / 100) -
                  (k.qmimiShites - k.qmimiShites * (k.rabati1 / 100)) *
                    (k.rabati2 / 100) -
                  (k.qmimiShites -
                    k.qmimiShites * (k.rabati1 / 100) -
                    (k.qmimiShites - k.qmimiShites * (k.rabati1 / 100)) *
                      (k.rabati2 / 100)) *
                    (k.rabati3 / 100)) *
                  k.sasiaStokut
              ).toFixed(2),
            }))
          );
          setTeDhenatFatures(teDhenatFatures.data);
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      };

      vendosTeDhenat();
    }
  }, [perditeso, produktiID]);

  useEffect(() => {
    const vendosProduktet = async () => {
      try {
        const produktet = await axios.get(
          `${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`,
          authentikimi
        );
        setProduktet(produktet.data);
      } catch (err) {
        console.log(err);
      }
    };

    vendosProduktet();
  }, [perditeso]);

  useEffect(() => {
    let totalProdukteve = 0;
    let totalStokut = 0;
    let totalQmimi = 0;
    let totalFat = 0;

    produktetNeKalkulim.forEach((produkti) => {
      totalProdukteve += 1;
      totalStokut += parseFloat(produkti.Sasia);
      totalQmimi +=
        parseFloat(produkti.Sasia) * parseFloat(produkti["Qmimi Shites €"]);
      totalFat += parseFloat(produkti["Totali €"]);
    });

    setTotProdukteve(totalProdukteve);
    setTotStokut(totalStokut.toFixed(2));
    setTotQmimi(totalQmimi.toFixed(2));
    setTotFat(totalFat.toFixed(3));
  }, [produktetNeKalkulim]);

  useEffect(() => {
    const perditesoFaturen = async () => {
      try {
        await axios
          .get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.idKalkulimitEdit}`,
            authentikimi
          )
          .then(async (r) => {
            console.log(r.data);
            await axios.put(
              `${API_BASE_URL}/api/Faturat/perditesoFaturen?idKalulimit=${props.nrRendorKalkulimit}`,
              {
                llojiPageses: r.data.regjistrimet.llojiPageses,
                statusiKalkulimit: r.data.regjistrimet.statusiKalkulimit,
                idPartneri: r.data.regjistrimet.idPartneri,
                dataRegjistrimit: r.data.regjistrimet.dataRegjistrimit,
                stafiID: r.data.regjistrimet.stafiID,
                totaliPaTVSH: parseFloat(r.data.totaliPaTVSH),
                tvsh: parseFloat(r.data.totaliMeTVSH - r.data.totaliPaTVSH),
                statusiPageses: r.data.statusiPageses,
                llojiKalkulimit: r.data.regjistrimet.llojiKalkulimit,
                nrFatures: r.data.regjistrimet.nrFatures,
                pershkrimShtese: r.data.regjistrimet.pershkrimShtese,
                rabati: parseFloat(r.data.rabati),
                nrRendorFatures: r.data.regjistrimet.nrRendorFatures,
                idBonusKartela: r.data.regjistrimet.idBonusKartela,
              },
              authentikimi
            );
          });
      } catch (err) {
        console.log(err);
      }
    };

    perditesoFaturen();
  }, [perditeso]);

  const ndrroField = (e, tjetra) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(tjetra).focus();
    }
  };

  async function handleMbyllFature() {
    try {
      if (produktetNeKalkulim.length === 0) {
        props.setPerditeso();
        props.mbyllPerkohesisht();
      } else {
        for (let produkti of produktetNeKalkulim) {
          var prod = produktet.find(
            (item) => item.emriProduktit == produkti["Emri Produktit"]
          );

          await axios.put(
            `${API_BASE_URL}/api/Faturat/ruajKalkulimin/asgjesoStokun/perditesoStokunQmimin?id=${prod?.produktiID}`,
            {
              sasiaNeStok: -produkti["Sasia"],
            },
            authentikimi
          );
        }

        props.setPerditeso();
        props.mbyllKalkulimin();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleFshij(id) {
    await axios
      .delete(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/FshijTeDhenat?idTeDhenat=${id}`,
        authentikimi
      )
      .then(async () => {
        setPerditeso(Date.now());
      });
  }

  async function handleEdit(id, index) {
    await axios
      .get(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/getKalkulimi?idKalkulimit=${id}`,
        authentikimi
      )
      .then((p) => {
        console.log(p.data[0]);
        setPerditeso(Date.now);

        setEdito(true);
        setProduktiID(p.data[0].idProduktit);
        setEmriProduktit(p.data[0].emriProduktit);
        setSasia(p.data[0].sasiaStokut);
        setQmimiB(p.data[0].qmimiBleres);
        setQmimiSH(p.data[0].qmimiProduktit);
        setQmimiSH2(p.data[0].qmimiShitesMeShumic);
        setQmimiShites(p.data[0].qmimiShites);
        setRabati1(p.data[0].rabati1);
        setRabati2(p.data[0].rabati2);
        setRabati3(p.data[0].rabati3);
      });
  }

  async function handleEdito(id) {
    if (produktiID === 0 || sasia <= 0) {
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      await axios
        .put(
          `${API_BASE_URL}/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${id}`,
          {
            qmimiBleres: qmimiB,
            qmimiShites: qmimiShites,
            sasiaStokut: sasia,
            qmimiShitesMeShumic: qmimiSH2,
            rabati1: rabati1,
            rabati2: rabati2,
            rabati3: rabati3,
          },
          authentikimi
        )
        .then(async () => {
          setPerditeso(Date.now());
        });

      setProduktiID(0);
      setSasia("");
      setQmimiB(0);
      setQmimiSH(0);
      setQmimiSH2(0);
      setQmimiShites("");
      setRabati3(0);
      setEdito(false);
      setEmriProduktit("Emri Produktit");
    }
  }

  function KthehuTekFaturat() {
    props.setPerditeso();
    props.mbyllPerkohesisht();
  }

  function kontrolloQmimin(e) {
    setSasia(e.target.value);
  }

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant", "Faturist", "Komercialist"]}
        largo={() => props.largo()}
        shfaqmesazhin={() => props.shfaqmesazhin()}
        perditesoTeDhenat={() => props.perditesoTeDhenat()}
        setTipiMesazhit={(e) => props.setTipiMesazhit(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit(e)}
      />
      <div className="containerDashboardP">
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}
        {konfirmoMbylljenFatures && (
          <Modal
            show={konfirmoMbylljenFatures}
            onHide={() => setKonfirmoMbylljenFatures(false)}>
            <Modal.Header closeButton>
              <Modal.Title as="h6">Konfirmo Mbylljen e Fatures</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <strong style={{ fontSize: "10pt" }}>
                A jeni te sigurt qe deshironi ta mbyllni Faturen?
              </strong>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setKonfirmoMbylljenFatures(false)}>
                Edito Faturen <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
              <Button variant="warning" onClick={handleMbyllFature}>
                Konfirmo <FontAwesomeIcon icon={faPlus} />
              </Button>
            </Modal.Footer>
          </Modal>
        )}
        {shikoFaturatEShitjesPartneri && (
          <FaturatEShitjesPartnerit
            show={() => setShikoFaturatEShitjesPartneri(true)}
            hide={() => setShikoFaturatEShitjesPartneri(false)}
            perditeso={() => setPerditeso(Date.now())}
            id={props.idKalkulimitEdit}
            pID={props.pId}
          />
        )}
        {shikoFaturatEShitjesProdukti && (
          <FaturatEShitjesProdukti
            show={() => setShikoFaturatEShitjesProdukti(true)}
            hide={() => setShikoFaturatEShitjesProdukti(false)}
            perditeso={() => setPerditeso(Date.now())}
            id={props.idKalkulimitEdit}
            pID={props.pId}
          />
        )}
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
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <div>
                <h1 className="title mb-1">Flete Lejimet Automatike</h1>
                <div className="text-muted" style={{ fontSize: "10pt" }}>
                  Përditëso sasiat e produkteve në fletën e lejimit automatik.
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShikoFaturatEShitjesPartneri(true)}>
                  <FontAwesomeIcon icon={faFileInvoice} /> Faturat
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShikoFaturatEShitjesProdukti(true)}>
                  <FontAwesomeIcon icon={faCookieBite} /> Produkti
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => KthehuTekFaturat()}>
                  <FontAwesomeIcon icon={faArrowLeft} /> Kthehu mbrapa
                </Button>
              </div>
            </div>

            <Container fluid>
              <Row className="g-3">
                <Col lg={5} xl={4}>
                  <Card className="shadow-sm">
                    <Card.Header className="d-flex align-items-center justify-content-between">
                      <div className="fw-semibold">Edito Produktin</div>
                      <Badge bg="info">Përditësim</Badge>
                    </Card.Header>
                    <Card.Body>
                      <Form>
                        <Form.Group controlId="idDheEmri" className="mb-3">
                          <Form.Label className="fw-semibold">
                            Produkti
                          </Form.Label>
                          <Form.Control
                            id="emriProduktit"
                            type="text"
                            placeholder="Emri Produktit"
                            value={emriProduktit}
                            disabled={true}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Sasia - {njesiaMatese}
                          </Form.Label>
                          <Form.Control
                            id="sasia"
                            type="number"
                            placeholder="0.00"
                            value={sasia}
                            onChange={(e) => {
                              kontrolloQmimin(e);
                            }}
                            onKeyDown={(e) => {
                              ndrroField(e, "butoniEdit");
                            }}
                            disabled={!edito}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">
                            Qmimi Shites €
                          </Form.Label>
                          <Form.Control
                            id="qmimiShites"
                            type="number"
                            placeholder="0.00 €"
                            value={qmimiSH}
                            disabled
                          />
                        </Form.Group>

                        <div className="d-grid gap-2">
                          {edito && (
                            <Button
                              id="butoniEdit"
                              variant="warning"
                              onClick={() => handleEdito(idTeDhenatKalk)}>
                              Përditëso Produktin{" "}
                              <FontAwesomeIcon icon={faPenToSquare} />
                            </Button>
                          )}
                        </div>
                      </Form>
                    </Card.Body>
                    <Card.Footer className="text-muted" style={{ fontSize: "9pt" }}>
                      Zgjidh një produkt nga tabela për të redaktuar.
                    </Card.Footer>
                  </Card>
                </Col>

                <Col lg={7} xl={4}>
                  <Card className="shadow-sm h-100">
                    <Card.Header className="fw-semibold">
                      Informacioni i Fatures
                    </Card.Header>
                    <Card.Body>
                      <Row className="g-2 mb-3">
                        <Col sm={6}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Nr. Lejimit
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures?.regjistrimet?.nrRendorFatures ??
                              "-"}
                          </div>
                        </Col>
                        <Col sm={6}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Nr. Fat
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures?.regjistrimet?.nrFatures ?? "-"}
                          </div>
                        </Col>
                        <Col sm={12}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Partneri
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures?.regjistrimet?.emriBiznesit ?? "-"}
                          </div>
                        </Col>
                        <Col sm={12}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Pershkrim Shtese
                          </div>
                          <div className="fw-semibold" style={{ fontSize: "9pt" }}>
                            {teDhenatFatures?.regjistrimet?.pershkrimShtese ??
                              "-"}
                          </div>
                        </Col>
                        <Col sm={12}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Lloji Pageses
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures?.regjistrimet?.llojiPageses ?? "-"}
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>

                <Col xl={4}>
                  <Card className="shadow-sm h-100" style={{ position: "sticky", top: "1rem" }}>
                    <Card.Header className="fw-semibold">
                      Përmbledhje Fature
                    </Card.Header>
                    <Card.Body>
                      <Row className="g-2">
                        <Col sm={4}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Produkte
                          </div>
                          <div className="fw-semibold">
                            {totProdukteve}
                          </div>
                        </Col>
                        <Col sm={4}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Sasia
                          </div>
                          <div className="fw-semibold">
                            {parseFloat(totStokut).toFixed(2)}
                          </div>
                        </Col>
                        <Col sm={4}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Totali
                          </div>
                          <div className="fw-bold">
                            {parseFloat(totFat).toFixed(2)} €
                          </div>
                        </Col>
                      </Row>

                      <div className="d-grid gap-2 mt-3">
                        <Button
                          variant="primary"
                          onClick={() => setKonfirmoMbylljenFatures(true)}>
                          Mbyll Faturen <FontAwesomeIcon icon={faPlus} />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="shadow-sm mt-3">
                <Card.Header className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div className="fw-semibold">Tabela e Produkteve</div>
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg="dark">
                      {Array.isArray(produktetNeKalkulim)
                        ? produktetNeKalkulim.length
                        : 0}{" "}
                      rreshta
                    </Badge>
                    <Badge bg="success">
                      Totali: {parseFloat(totFat).toFixed(2)} €
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  {Array.isArray(produktetNeKalkulim) &&
                  produktetNeKalkulim.length === 0 ? (
                    <div className="text-muted">
                      Ende nuk ka produkte në faturë. Shto produkte duke përdorur butonat "Faturat" ose "Produkti" më lart.
                    </div>
                  ) : (
                    <Tabela
                      data={produktetNeKalkulim}
                      tableName="Tabela e Produkteve te Fatures"
                      kaButona={true}
                      funksionButonFshij={(e) => handleFshij(e)}
                      funksionButonEdit={(e) => {
                        handleEdit(e);
                        setIdTeDhenatKalk(e);
                      }}
                      mosShfaqKerkimin
                      mosShfaqID={true}
                    />
                  )}
                </Card.Body>
              </Card>
            </Container>
          </>
        )}
      </div>
    </>
  );
}

export default RegjistroFaturen;
