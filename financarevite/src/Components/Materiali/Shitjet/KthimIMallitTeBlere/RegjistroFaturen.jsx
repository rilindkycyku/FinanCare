import { useEffect, useMemo, useState } from "react";
import "../../../../Pages/Styles/DizajniPergjithshem.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import { Modal, Form, Container, Row, Col, Card, Badge, InputGroup } from "react-bootstrap";
import Select from "react-select";
import Tabela from "../../../TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";
import { darkSelectStyles } from "@/utils/darkSelectStyles";

function RegjistroFaturen(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [produktetNeKalkulim, setproduktetNeKalkulim] = useState([]);
  const [produktiID, setProduktiID] = useState(0);
  const [produktet, setProduktet] = useState([]);
  const [sasia, setSasia] = useState(0);
  const [qmimiBleres, setQmimiBleres] = useState(0);
  const [rabati, setRabati] = useState(0);
  const [totProdukteve, setTotProdukteve] = useState(0);
  const [totStokut, setTotStokut] = useState(0);
  const [totFat, setTotFat] = useState(0);

  const [siteName, setSiteName] = useState("FinanCare");

  const [options, setOptions] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
  const [loadingProdukteve, setLoadingProdukteve] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (val) => {
    setInputValue(val);
    return val;
  };

  const filteredOptions = useMemo(() => {
    if (inputValue.length < 2) return [];
    const lower = inputValue.toLowerCase();
    return options
      .filter((o) => o.label.toLowerCase().includes(lower))
      .slice(0, 30);
  }, [inputValue, options]);

    const [idTeDhenatKalk, setIdTeDhenatKalk] = useState(0);

  const [edito, setEdito] = useState(false);
  const [konfirmoMbylljenFatures, setKonfirmoMbylljenFatures] = useState(false);

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
    const vendosTeDhenatBiznesit = async () => {
      try {
        const teDhenat = await axios.get(
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`,
          authentikimi
        );
        setSiteName(teDhenat?.data?.emriIBiznesit);
      } catch (err) {
        console.log(err);
      }
    };
    vendosTeDhenatBiznesit();
  }, [perditeso]);

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
              "Qmimi Bleres €": parseFloat(k.qmimiBleres).toFixed(2),
              "Rabati %": parseFloat(k.rabati3).toFixed(2),
              "Qmimi Bleres - Rabati": parseFloat(
                k.qmimiBleres - k.qmimiBleres * (k.rabati3 / 100)
              ).toFixed(2),
              "Totali €": parseFloat(
                k.sasiaStokut *
                (k.qmimiBleres - k.qmimiBleres * (k.rabati3 / 100))
              ).toFixed(2),
            }))
          );
          setTeDhenatFatures(teDhenatFatures.data);
          console.log(teDhenatFatures.data);
          console.log(teDhenatKalkulimit.data);
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

  useEffect(() => {
    setLoadingProdukteve(true);
    axios
      .get(
        `${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`,
        authentikimi
      )
      .then((response) => {
        const fetchedoptions = response.data.filter((item) => item.qmimiProduktit > 0).map((item) => ({
          value: item.produktiID,
          label:
            item.emriProduktit +
            " - " +
            item.barkodi +
            " - " +
            item.kodiProduktit,
          item: item,
        }));
        setOptions(fetchedoptions);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoadingProdukteve(false);
      });
  }, []);

  useEffect(() => {
    let totalProdukteve = 0;
    let totalStokut = 0;
    let totalFat = 0;

    produktetNeKalkulim.forEach((produkti) => {
      totalProdukteve += 1;

      // Parse the values from the string format
      const sasiaStokut = parseFloat(produkti.Sasia);
      const qmimiBleres = parseFloat(produkti["Qmimi Bleres €"]);
      const rabati3 = parseFloat(produkti["Rabati %"]);

      totalStokut += sasiaStokut;
      totalFat += sasiaStokut * (qmimiBleres - qmimiBleres * (rabati3 / 100));
    });

    setTotProdukteve(totalProdukteve);
    setTotStokut(totalStokut);
    setTotFat(totalFat);
  }, [produktetNeKalkulim]);

  const handleSubmit = async (event) => {
    if (sasia <= 0 || qmimiBleres <= 0) {
      event.preventDefault();
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      event.preventDefault();

      await axios.post(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/teDhenat`,
        {
          idRegjistrimit: props.nrRendorKalkulimit,
          idProduktit: optionsSelected?.value,
          sasiaStokut: sasia,
          qmimiBleres: -qmimiBleres,
          qmimiShites: optionsSelected?.item?.qmimiProduktit,
          qmimiShitesMeShumic: optionsSelected?.item?.qmimiMeShumic,
          rabati1: optionsSelected?.item?.rabati1 ?? 0,
          rabati3: rabati ?? 0,
        },
        authentikimi
      );

      PastroTeDhenat();
      ndrroField("produktiSelect");
    }
  };

  const ndrroField = (e, tjetra) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(tjetra).focus();
    }
  };

  async function handleMbyllFature() {
    try {
      if (produktetNeKalkulim.length === 0) {
        props.setPerditeso(Date.now());
        props.mbyllPerkohesisht();
      } else {
        for (let produkti of produktetNeKalkulim) {
          var prod = produktet.find(
            (item) => item.emriProduktit == produkti["Emri Produktit"]
          );

          await axios.put(
            `${API_BASE_URL}/api/Faturat/ruajKalkulimin/asgjesoStokun/perditesoStokunQmimin?id=${prod?.produktiID}`,
            {
              sasiaNeStok: produkti["Sasia"],
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
    await axios.delete(
      `${API_BASE_URL}/api/Faturat/ruajKalkulimin/FshijTeDhenat?idTeDhenat=${id}`,
      authentikimi
    );

    setPerditeso(Date.now());
  }

  function PastroTeDhenat() {
    setPerditeso(Date.now());
    setProduktiID(0);
    setSasia(0);
    setQmimiBleres(0);
    setRabati(0);
    setOptionsSelected(null);
    document.getElementById("produktiSelect").focus();
    document.getElementById("produktiSelect-input").focus();
  }

  async function handleEdit(id) {
    await axios
      .get(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/getKalkulimi?idKalkulimit=${id}`,
        authentikimi
      )
      .then((p) => {
        setPerditeso(Date.now);

        console.log(p.data);

        setOptionsSelected(
          options.filter((item) => item.value == p.data[0].idProduktit)
        );

        setEdito(true);
        setProduktiID(p.data[0].idProduktit);
        setSasia(p.data[0].sasiaStokut);
        setQmimiBleres(-p.data[0].qmimiBleres);
        setRabati(p.data[0].rabati3);
        console.log(
          options.filter((item) => item.value == p.data[0].idProduktit)
        );
      });
  }

  async function handleEdito(id) {
    console.log(optionsSelected);
    if (produktiID === 0 || sasia <= 0) {
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      await axios.put(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${id}`,
        {
          qmimiBleres: -qmimiBleres,
          qmimiShites: optionsSelected
            .map((option) => option.item.qmimiProduktit)
            .join(", "),
          sasiaStokut: sasia,
          qmimiShitesMeShumic: optionsSelected
            .map((option) => option.item.qmimiMeShumic)
            .join(", "),
          rabati3: rabati ?? 0,
        },
        authentikimi
      );

      PastroTeDhenat();
      setEdito(false);
    }
  }

  function KthehuTekFaturat() {
    props.setPerditeso();
    props.mbyllPerkohesisht();
  }

  const handleChange = async (partneri) => {
    setOptionsSelected(partneri);
    document.getElementById("sasia").focus();
  };


  const canSubmit = Boolean(
    !loadingProdukteve &&
    optionsSelected?.value &&
    Number(sasia) > 0 &&
    Number(qmimiBleres) > 0
  );

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
                <h1 className="title mb-1">Kthimi i Mallit të Blerë</h1>
                <div className="text-muted" style={{ fontSize: "10pt" }}>
                  Regjistro produktet që po i ktheni te furnitori.
                </div>
              </div>
              <Button
                variant="outline-secondary"
                onClick={() => KthehuTekFaturat()}>
                <FontAwesomeIcon icon={faArrowLeft} /> Kthehu mbrapa
              </Button>
            </div>

            <Container fluid>
              <Row className="g-3">
                <Col lg={5} xl={4}>
                  <Card className="shadow-sm">
                    <Card.Header className="d-flex align-items-center justify-content-between">
                      <div className="fw-semibold">Shto / Edito Produkt</div>
                      {edito ? (
                        <Badge bg="warning" text="dark">
                          Editim
                        </Badge>
                      ) : (
                        <Badge bg="success">Shtim</Badge>
                      )}
                    </Card.Header>
                    <Card.Body>
                      <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="idDheEmri" className="mb-3">
                          <Form.Label className="fw-semibold">
                            Produkti
                          </Form.Label>
                          <Select
                            value={optionsSelected}
                            onChange={handleChange}
                            options={filteredOptions}
                            id="produktiSelect"
                            inputId="produktiSelect-input"
                            isDisabled={edito || loadingProdukteve}
                            isLoading={loadingProdukteve}
                            styles={darkSelectStyles}
                            placeholder={
                              loadingProdukteve
                                ? "Duke ngarkuar produktet..."
                                : "Kërko produkt (min. 2 shkronja)..."
                            }
                            onInputChange={handleInputChange}
                            inputValue={inputValue}
                            noOptionsMessage={() =>
                              loadingProdukteve
                                ? "Duke ngarkuar..."
                                : inputValue.length < 2
                                  ? "Shkruani të paktën 2 karaktere"
                                  : "Nuk u gjet asnjë produkt"
                            }
                            autoFocus
                          />
                        </Form.Group>

                        <Row className="g-2">
                          <Col md={6}>
                            <Form.Group className="mb-2">
                              <Form.Label className="fw-semibold">
                                Sasia
                              </Form.Label>
                              <InputGroup>
                                <Form.Control
                                  id="sasia"
                                  type="number"
                                  placeholder="0.00"
                                  value={sasia}
                                  onChange={(e) => setSasia(e.target.value)}
                                  onKeyDown={(e) => ndrroField(e, "qmimiBleres")}
                                />
                                <InputGroup.Text>
                                  {optionsSelected?.item?.emriNjesiaMatese ?? "Cope"}
                                </InputGroup.Text>
                              </InputGroup>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-2">
                              <Form.Label className="fw-semibold">
                                Qmimi Blerë €
                              </Form.Label>
                              <InputGroup>
                                <Form.Control
                                  id="qmimiBleres"
                                  type="number"
                                  placeholder="0.00 €"
                                  value={qmimiBleres}
                                  onChange={(e) => setQmimiBleres(e.target.value)}
                                  onKeyDown={(e) => ndrroField(e, "rabati")}
                                />
                                <InputGroup.Text>€</InputGroup.Text>
                              </InputGroup>
                            </Form.Group>
                          </Col>
                          <Col md={12}>
                            <Form.Group className="mb-2">
                              <Form.Label className="fw-semibold">
                                Rabati %
                              </Form.Label>
                              <InputGroup>
                                <Form.Control
                                  id="rabati"
                                  type="number"
                                  placeholder="0.00 %"
                                  value={rabati}
                                  onChange={(e) => setRabati(e.target.value)}
                                />
                                <InputGroup.Text>%</InputGroup.Text>
                              </InputGroup>
                            </Form.Group>
                          </Col>
                        </Row>

                        <div className="d-grid gap-2 mt-3">
                          <Button
                            variant="success"
                            type="submit"
                            disabled={edito || !canSubmit}>
                            Shto Produktin <FontAwesomeIcon icon={faPlus} />
                          </Button>
                          {edito && (
                            <Button
                              variant="warning"
                              disabled={!canSubmit}
                              onClick={() => handleEdito(idTeDhenatKalk)}>
                              Edito Produktin{" "}
                              <FontAwesomeIcon icon={faPenToSquare} />
                            </Button>
                          )}
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={7} xl={4}>
                  <Card className="shadow-sm h-100">
                    <Card.Header className="fw-semibold">
                      Produkti i zgjedhur
                    </Card.Header>
                    <Card.Body>
                      {!optionsSelected?.item ? (
                        <div className="text-muted">
                          Zgjidh një produkt për të parë detajet.
                        </div>
                      ) : (
                        <>
                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                            <div className="fw-semibold text-primary">
                              {optionsSelected.item.emriProduktit}
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              {optionsSelected.item.kodiProduktit && (
                                <Badge bg="info" text="dark">
                                  {optionsSelected.item.kodiProduktit}
                                </Badge>
                              )}
                              <Badge bg="secondary">
                                {optionsSelected.item.barkodi}
                              </Badge>
                            </div>
                          </div>
                          <Row className="g-2">
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div className="text-muted" style={{ fontSize: "9pt" }}>
                                    Sasia në stok
                                  </div>
                                  <div className="fw-semibold fs-5">
                                    {optionsSelected?.item?.sasiaNeStok ?? 0}{" "}
                                    <small>{optionsSelected?.item?.emriNjesiaMatese ?? "Copë"}</small>
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div className="text-muted" style={{ fontSize: "9pt" }}>
                                    Blerje Aktuale
                                  </div>
                                  <div className="fw-semibold fs-5">
                                    {parseFloat(optionsSelected?.item?.qmimiBleres ?? 0).toFixed(2)} €
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div className="text-muted" style={{ fontSize: "9pt" }}>
                                    Pakicë
                                  </div>
                                  <div className="fw-semibold fs-5 text-success">
                                    {parseFloat(optionsSelected?.item?.qmimiProduktit ?? 0).toFixed(2)} €
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div className="text-muted" style={{ fontSize: "9pt" }}>
                                    Shumicë
                                  </div>
                                  <div className="fw-semibold fs-5 text-info">
                                    {parseFloat(optionsSelected?.item?.qmimiMeShumic ?? 0).toFixed(2)} €
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                          </Row>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                <Col xl={4}>
                  <Card className="shadow-sm h-100" style={{ position: "sticky", top: "1rem" }}>
                    <Card.Header className="fw-semibold bg-primary text-white">
                      Përmbledhje e Kthimit
                    </Card.Header>
                    <Card.Body>
                      <Row className="g-2">
                        <Col sm={6}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Nr. Kalkulimit
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures.regjistrimet?.nrRendorFatures ?? "-"}
                          </div>
                        </Col>
                        <Col sm={6}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Partneri
                          </div>
                          <div className="fw-semibold text-truncate text-uppercase">
                            {teDhenatFatures.regjistrimet?.emriBiznesit ?? siteName}
                          </div>
                        </Col>
                      </Row>

                      <hr />

                      <Row className="g-2">
                        <Col sm={6}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Nr. Produkteve
                          </div>
                          <div className="fw-semibold fs-5 text-dark">
                            {totProdukteve}
                          </div>
                        </Col>
                        <Col sm={6}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Sasia Totale
                          </div>
                          <div className="fw-semibold fs-5 text-dark">
                            {parseFloat(totStokut).toFixed(2)}
                          </div>
                        </Col>
                        <Col sm={12} className="mt-3">
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Vlera Totale e Kthimit
                          </div>
                          <div className="fw-bold fs-3 text-danger">
                            {parseFloat(totFat).toFixed(2)} €
                          </div>
                        </Col>
                      </Row>

                      <div className="d-grid gap-2 mt-4">
                        <Button
                          variant="primary"
                          className="py-2 fw-bold"
                          onClick={() => setKonfirmoMbylljenFatures(true)}>
                          Mbyll Faturën <FontAwesomeIcon icon={faPlus} className="ms-2" />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="shadow-sm mt-3 border-0">
                <Card.Header className="bg-white py-3 border-bottom">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <h5 className="mb-0 fw-bold text-dark">Tabela e Produkteve te Fatures</h5>
                    <Badge bg="danger" className="px-3 py-2 fs-6">
                      Vlera Totale: {parseFloat(totFat).toFixed(2)} €
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
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
