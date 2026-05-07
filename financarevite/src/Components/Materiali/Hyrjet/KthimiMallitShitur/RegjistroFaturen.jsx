import { useEffect, useMemo, useState } from "react";
import "../../../../Pages/Styles/DizajniPergjithshem.css"; // Fixed import for plain CSS
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faArrowLeft,
  faCalculator,
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import {
  Form,
  Container,
  Row,
  Col,
  Card,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
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
  const [emriProduktit, setEmriProduktit] = useState("");
  const [produktiID, setProduktiID] = useState(0);
  const [produktet, setProduktet] = useState([]);
  const [sasia, setSasia] = useState("");
  const [njesiaMatese, setNjesiaMatese] = useState("Cope");
  const [totProdukteve, setTotProdukteve] = useState(0);
  const [totStokut, setTotStokut] = useState(0);
  const [sasiaNeStok, setSasiaNeStok] = useState(0);
  const [qmimiB, setQmimiB] = useState(0);
  const [qmimiSH, setQmimiSH] = useState(0);
  const [qmimiSH2, setQmimiSH2] = useState(0);

  const [idTeDhenatKalk, setIdTeDhenatKalk] = useState(0);

  const [edito, setEdito] = useState(false);
  const [konfirmoMbylljenFatures, setKonfirmoMbylljenFatures] = useState(false);

  const [teDhenat, setTeDhenat] = useState([]);
  const [teDhenatFatures, setTeDhenatFatures] = useState([]);
  const [siteName, setSiteName] = useState("FinanCare");

  const navigate = useNavigate();

  const getID = localStorage.getItem("id");

  const getToken = localStorage.getItem("token");

  const authentikimi = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${getToken}`,
      },
    }),
    [getToken],
  );

  const customStyles = useMemo(
    () => ({
      menu: (provided) => ({
        ...provided,
        zIndex: 1050, // Ensure this is higher than the z-index of the thead
      }),
    }),
    [],
  );

  useEffect(() => {
    if (getID) {
      const vendosTeDhenat = async () => {
        try {
          setLoading(true);
          const perdoruesi = await axios.get(
            `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
            authentikimi,
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
  }, [API_BASE_URL, authentikimi, getID, navigate, perditeso]);

  useEffect(() => {
    if (props.idKalkulimitEdit != 0) {
      const vendosTeDhenat = async () => {
        try {
          setLoading(true);
          const teDhenatKalkulimit = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${props.idKalkulimitEdit}`,
            authentikimi,
          );

          const teDhenatFatures = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.idKalkulimitEdit}`,
            authentikimi,
          );

          setproduktetNeKalkulim(
            teDhenatKalkulimit.data.map((k, index) => ({
              ID: k.id,
              "Nr. Rendor": index + 1,
              "Emri Produktit": k.emriProduktit,
              Sasia: parseFloat(k.sasiaStokut).toFixed(2),
            })),
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
  }, [API_BASE_URL, authentikimi, perditeso, props.idKalkulimitEdit]);

  useEffect(() => {
    let totalProdukteve = 0;
    let totalStokut = 0;
    produktetNeKalkulim.forEach((produkti) => {
      totalProdukteve += 1;
      totalStokut += produkti.sasiaStokut;
    });
    setTotProdukteve(totalProdukteve);
    setTotStokut(totalStokut);
  }, [produktetNeKalkulim]);

  useEffect(() => {
    const perditesoFaturen = async () => {
      try {
        if (!props.idKalkulimitEdit || props.idKalkulimitEdit == 0) return;
        await axios
          .get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.idKalkulimitEdit}`,
            authentikimi,
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
              authentikimi,
            );
          });
      } catch (err) {
        console.log(err);
      }
    };

    perditesoFaturen();
  }, [
    API_BASE_URL,
    authentikimi,
    perditeso,
    props.idKalkulimitEdit,
    props.nrRendorKalkulimit,
  ]);

  const handleSubmit = async (event) => {
    const sasiaNum = Number(sasia);
    if (!Number.isFinite(sasiaNum) || sasiaNum <= 0 || !optionsSelected?.value) {
      event.preventDefault();
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      event.preventDefault();
      console.log(optionsSelected);
      await axios.post(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/teDhenat`,
        {
          idRegjistrimit: props.nrRendorKalkulimit,
          idProduktit: optionsSelected?.value,
          sasiaStokut: sasiaNum,
          qmimiBleres: optionsSelected?.item?.qmimiBleres,
          qmimiShites: optionsSelected?.item?.qmimiProduktit,
          qmimiShitesMeShumic: optionsSelected?.item?.qmimiMeShumic,
        },
        authentikimi,
      );
      setPerditeso(Date.now());

      setProduktiID(0);
      setSasia("");
      setSasiaNeStok(0);
      setQmimiB(0);
      setQmimiSH(0);
      setQmimiSH2(0);
      setPerditeso(Date.now());
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
        props.setPerditeso();
        props.mbyllPerkohesisht();
      } else {
        for (let produkti of produktetNeKalkulim) {
          var prod = produktet.find(
            (item) => item.emriProduktit == produkti["Emri Produktit"]
          );

          await axios.put(
            `${API_BASE_URL}/api/Faturat/ruajKalkulimin/perditesoStokunQmimin?id=${prod?.produktiID}`,
            {
              qmimiBleres: prod.qmimiBleres,
              qmimiProduktit: prod.qmimiProduktit,
              sasiaNeStok: parseFloat(produkti["Sasia"]),
              qmimiMeShumic: prod.qmimiMeShumic,
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
        authentikimi,
      )
      .then((p) => {
        setPerditeso(Date.now());

        setEdito(true);
        setProduktiID(p.data[0].idProduktit);
        setEmriProduktit(p.data[0].emriProduktit);
        setSasia(p.data[0].sasiaStokut);
        setQmimiB(p.data[0].qmimiBleres);
        setQmimiSH(p.data[0].qmimiShites);
        setQmimiSH2(p.data[0].qmimiShitesMeShumic);
      });
  }

  async function handleEdito(id) {
    const sasiaNum = Number(sasia);
    if (produktiID === 0 || !Number.isFinite(sasiaNum) || sasiaNum <= 0) {
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      await axios
        .put(
          `${API_BASE_URL}/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${id}`,
          {
            qmimiBleres: qmimiB,
            qmimiShites: qmimiSH,
            sasiaStokut: sasiaNum,
            qmimiShitesMeShumic: qmimiSH2,
          },
          authentikimi,
        )
        .then(async () => {
          setPerditeso(Date.now());
        });

      setProduktiID(0);
      setSasia("");
      setSasiaNeStok(0);
      setQmimiB(0);
      setQmimiSH(0);
      setQmimiSH2(0);
      setEdito(false);
    }
  }

  function KthehuTekFaturat() {
    props.setPerditeso();
    props.mbyllPerkohesisht();
  }

  const [options, setOptions] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
  const [loadingProdukteve, setLoadingProdukteve] = useState(true);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    let isMounted = true;

    const vendosProduktet = async () => {
      setLoadingProdukteve(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`,
          authentikimi,
        );
        if (!isMounted) return;
        const produktetFiltruara = response.data.filter(
          (item) => item.qmimiProduktit > 0,
        );
        setProduktet(produktetFiltruara);
        setOptions(
          produktetFiltruara.map((item) => ({
            value: item.produktiID,
            label:
              item.emriProduktit +
              " - " +
              item.barkodi +
              " - " +
              item.kodiProduktit,
            item: item,
          })),
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (isMounted) setLoadingProdukteve(false);
      }
    };

    vendosProduktet();

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL, authentikimi]);

  const handleInputChange = (val) => {
    setInputValue(val);
    return val;
  };

  const filteredOptions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) return [];

    const lower = inputValue.toLowerCase();
    const results = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].label.toLowerCase().includes(lower)) {
        results.push(options[i]);
        if (results.length >= 50) break;
      }
    }
    return results;
  }, [inputValue, options]);

  const handleChange = async (partneri) => {
    setOptionsSelected(partneri);
    document.getElementById("sasia").focus();
  };

  const canSubmit = Boolean(
    !loadingProdukteve && optionsSelected?.value && Number(sasia) > 0,
  );

  const totaliPaTVSH = teDhenatFatures?.regjistrimet?.totaliPaTVSH ?? 0;
  const tvsh = teDhenatFatures?.regjistrimet?.tvsh ?? 0;
  const totaliFatures = useMemo(
    () => Number(totaliPaTVSH || 0) + Number(tvsh || 0),
    [totaliPaTVSH, tvsh],
  );

  useEffect(() => {
    const vendosTeDhenatBiznesit = async () => {
      try {
        const teDhenat = await axios.get(
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`,
          authentikimi,
        );
        setSiteName(teDhenat?.data?.emriIBiznesit);
      } catch (err) {
        console.log(err);
      }
    };

    vendosTeDhenatBiznesit();
  }, [API_BASE_URL, authentikimi, perditeso]);

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant", "Arkatar"]}
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
                <h1 className="title mb-1">Kthim i Mallit te Shitur</h1>
                <div className="text-muted" style={{ fontSize: "10pt" }}>
                  Zgjidh produktin dhe vendos sasinë e kthimit.
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
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
                            onInputChange={handleInputChange}
                            inputValue={inputValue}
                            placeholder={
                              loadingProdukteve
                                ? "Duke ngarkuar produktet..."
                                : "Kërko produkt..."
                            }
                            noOptionsMessage={() =>
                              loadingProdukteve
                                ? "Duke ngarkuar..."
                                : inputValue.length < 2
                                  ? "Shkruani të paktën 2 karaktere"
                                  : "Nuk u gjet produkt"
                            }
                          />
                          <div
                            className="text-muted mt-1"
                            style={{ fontSize: "9pt" }}>
                            Këshillë: shkruani barkodin ose emrin (min 2
                            shkronja).
                          </div>
                        </Form.Group>

                        <Form.Group className="mb-2">
                          <Form.Label className="fw-semibold">
                            Sasia e kthimit
                          </Form.Label>
                          <InputGroup>
                            <Form.Control
                              id="sasia"
                              type="number"
                              inputMode="decimal"
                              placeholder="0.00"
                              value={sasia}
                              onChange={(e) => setSasia(e.target.value)}
                            />
                            <InputGroup.Text>{njesiaMatese}</InputGroup.Text>
                          </InputGroup>
                        </Form.Group>

                        <div className="d-flex gap-2 flex-wrap mt-3">
                          <Button
                            variant="success"
                            type="submit"
                            disabled={edito || !canSubmit}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSubmit();
                            }}>
                            Shto Produktin <FontAwesomeIcon icon={faPlus} />
                          </Button>
                          {edito && (
                            <Button
                              variant="warning"
                              disabled={!canSubmit}
                              onClick={() => handleEdito(idTeDhenatKalk)}>
                              Ruaj Ndryshimet{" "}
                              <FontAwesomeIcon icon={faPenToSquare} />
                            </Button>
                          )}
                          <div
                            className="text-muted ms-auto"
                            style={{ fontSize: "9pt" }}>
                            {loadingProdukteve
                              ? "Duke ngarkuar produktet..."
                              : "Enter: ruaj"}
                          </div>
                        </div>
                      </Form>
                    </Card.Body>
                    <Card.Footer
                      className="text-muted"
                      style={{ fontSize: "9pt" }}>
                      {edito
                        ? "Po editoni një rresht ekzistues në tabelë."
                        : "Shto rreshta në tabelë dhe më pas mbyll faturën."}
                    </Card.Footer>
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
                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                            <div className="fw-semibold">
                              {optionsSelected.item.emriProduktit}
                            </div>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              {optionsSelected?.item?.kodiProduktit ? (
                                <Badge bg="info" text="dark">
                                  {optionsSelected.item.kodiProduktit}
                                </Badge>
                              ) : null}
                              <Badge bg="secondary">
                                {optionsSelected.item.barkodi}
                              </Badge>
                            </div>
                          </div>
                          <Row className="g-2">
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div
                                    className="text-muted"
                                    style={{ fontSize: "9pt" }}>
                                    Sasia në stok
                                  </div>
                                  <div className="fw-semibold">
                                    {optionsSelected?.item?.sasiaNeStok ?? 0}{" "}
                                    {optionsSelected?.item?.emriNjesiaMatese ??
                                      "Copë"}
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div
                                    className="text-muted"
                                    style={{ fontSize: "9pt" }}>
                                    Blerje
                                  </div>
                                  <div className="fw-semibold">
                                    {parseFloat(
                                      optionsSelected?.item?.qmimiBleres ?? 0,
                                    ).toFixed(2)}{" "}
                                    €
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div
                                    className="text-muted"
                                    style={{ fontSize: "9pt" }}>
                                    Pakic
                                  </div>
                                  <div className="fw-semibold">
                                    {parseFloat(
                                      optionsSelected?.item?.qmimiProduktit ??
                                      0,
                                    ).toFixed(2)}{" "}
                                    €
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div
                                    className="text-muted"
                                    style={{ fontSize: "9pt" }}>
                                    Shumic
                                  </div>
                                  <div className="fw-semibold">
                                    {parseFloat(
                                      optionsSelected?.item?.qmimiMeShumic ?? 0,
                                    ).toFixed(2)}{" "}
                                    €
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
                  <Card
                    className="shadow-sm h-100"
                    style={{ position: "sticky", top: "1rem" }}>
                    <Card.Header className="fw-semibold">
                      Përmbledhje fature
                    </Card.Header>
                    <Card.Body>
                      <Row className="g-2">
                        <Col sm={6}>
                          <div
                            className="text-muted"
                            style={{ fontSize: "9pt" }}>
                            Nr. Kalkulimit
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures?.regjistrimet?.idRegjistrimit ??
                              "-"}
                          </div>
                        </Col>
                        <Col sm={6}>
                          <div
                            className="text-muted"
                            style={{ fontSize: "9pt" }}>
                            Nr. Fat
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures?.regjistrimet?.nrFatures ?? "-"}
                          </div>
                        </Col>
                        <Col sm={12}>
                          <div
                            className="text-muted"
                            style={{ fontSize: "9pt" }}>
                            Partneri
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures?.regjistrimet?.emriBiznesit ?? "-"}
                          </div>
                        </Col>
                      </Row>

                      <hr />

                      <Row className="g-2">
                        <Col sm={4}>
                          <div
                            className="text-muted"
                            style={{ fontSize: "9pt" }}>
                            Pa TVSH
                          </div>
                          <div className="fw-semibold">
                            {parseFloat(totaliPaTVSH).toFixed(2)} €
                          </div>
                        </Col>
                        <Col sm={4}>
                          <div
                            className="text-muted"
                            style={{ fontSize: "9pt" }}>
                            TVSH
                          </div>
                          <div className="fw-semibold">
                            {parseFloat(tvsh).toFixed(2) === "NaN"
                              ? "0.00"
                              : parseFloat(tvsh).toFixed(2)}{" "}
                            €
                          </div>
                        </Col>
                        <Col sm={4}>
                          <div
                            className="text-muted"
                            style={{ fontSize: "9pt" }}>
                            Totali
                          </div>
                          <div className="fw-bold">
                            {parseFloat(totaliFatures).toFixed(2) === "NaN"
                              ? "0.00"
                              : parseFloat(totaliFatures).toFixed(2)}{" "}
                            €
                          </div>
                        </Col>
                        <Col sm={12}>
                          <div
                            className="text-muted"
                            style={{ fontSize: "9pt" }}>
                            Përshkrim
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures?.regjistrimet?.pershkrimShtese ??
                              "-"}
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
                  <div className="fw-semibold">
                    Tabela e Produkteve te Fatures
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg="dark">
                      {Array.isArray(produktetNeKalkulim)
                        ? produktetNeKalkulim.length
                        : 0}{" "}
                      rreshta
                    </Badge>
                    <Badge bg="success">
                      Totali:{" "}
                      {parseFloat(totaliFatures).toFixed(2) === "NaN"
                        ? "0.00"
                        : parseFloat(totaliFatures).toFixed(2)}{" "}
                      €
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  {Array.isArray(produktetNeKalkulim) &&
                    produktetNeKalkulim.length === 0 ? (
                    <div className="text-muted">
                      Ende nuk ka produkte në faturë. Shto një produkt nga forma
                      lart.
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
                      shfaqEksporto
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
