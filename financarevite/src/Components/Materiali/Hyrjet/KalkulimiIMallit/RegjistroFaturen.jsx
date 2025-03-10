import { useEffect, useState } from "react";
import "../../../../Pages/Styles/DizajniPergjithshem.css"; // Fixed import for plain CSS
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { Form, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import Tabela from "../../../TeTjera/Tabela/Tabela";
import PrintLabels from "../../../TeTjera/PrintLabels";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function RegjistroFaturen(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [produktetNeKalkulim, setproduktetNeKalkulim] = useState([]);
  const [emriProduktit, setEmriProduktit] = useState("");
  const [produktiID, setproduktiID] = useState(0);
  const [produktet, setProduktet] = useState([]);
  const [sasia, setSasia] = useState("");
  const [qmimiBleres, setQmimiBleres] = useState("");
  const [qmimiShites, setQmimiShites] = useState("");
  const [qmimiShitesMeShumic, setQmimiShitesMeShumic] = useState("");
  const [njesiaMatese, setNjesiaMatese] = useState("Cope");
  const [sasiaNeStok, setSasiaNeStok] = useState(0);
  const [qmimiB, setQmimiB] = useState(0);
  const [qmimiSH, setQmimiSH] = useState(0);
  const [llojiTVSH, setLlojiTVSH] = useState(0);
  const [qmimiSH2, setQmimiSH2] = useState(0);

  const [idTeDhenatKalk, setIdTeDhenatKalk] = useState(0);

  const [edito, setEdito] = useState(false);
  const [konfirmoMbylljenFatures, setKonfirmoMbylljenFatures] = useState(false);
  const [konfirmoProduktin, setKonfirmoProduktin] = useState(false);

  const [teDhenat, setTeDhenat] = useState([]);
  const [teDhenatFatures, setTeDhenatFatures] = useState([]);

  const [siteName, setSiteName] = useState("FinanCare");
  const [produktetQmimore, setProduktetQmimore] = useState([]);

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
              Barkodi: k.barkodi,
              "Emri Produktit": k.emriProduktit,
              Sasia: parseFloat(k.sasiaStokut).toFixed(2),
              "Qmimi Bleres + TVSH €": parseFloat(k.qmimiBleres).toFixed(2),
              "Qmimi Shites me Pakic + TVSH €": parseFloat(
                k.qmimiShites
              ).toFixed(2),
              "Qmimi Shites me Shumic + TVSH €": parseFloat(
                k.qmimiShitesMeShumic
              ).toFixed(2),
              "Totali Bleres €": parseFloat(
                k.sasiaStokut * k.qmimiBleres
              ).toFixed(2),
              "Totali Shites €": parseFloat(
                k.sasiaStokut * k.qmimiShites
              ).toFixed(2),
              "Mazha %": parseFloat(
                ((k.sasiaStokut *
                  k.qmimiShites *
                  (1 - k.llojiTVSH / 100 / (1 + k.llojiTVSH / 100)) -
                  k.sasiaStokut * k.qmimiBleres) /
                  (k.sasiaStokut * k.qmimiBleres)) *
                  100
              ).toFixed(2),
            }))
          );
          setProduktetQmimore(
            teDhenatKalkulimit.data.map((k, index) => ({
              name: k.emriProduktit,
              price: k.qmimiShites,
              wholesalePrice: k.qmimiShitesMeShumic,
              barcode: k.barkodi,
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
                dataRegjistrimit: r.data.regjistrimet.dataRegjistrimit,
                stafiID: r.data.regjistrimet.stafiID,
                totaliPaTVSH: r.data.regjistrimet.totaliPaTVSH,
                tvsh: r.data.regjistrimet.tvsh,
                idPartneri: r.data.regjistrimet.idPartneri,
                statusiPageses: r.data.regjistrimet.statusiPageses,
                llojiPageses: r.data.regjistrimet.llojiPageses,
                llojiKalkulimit: r.data.regjistrimet.llojiKalkulimit,
                nrFatures: r.data.regjistrimet.nrFatures,
                statusiKalkulimit: r.data.regjistrimet.statusiKalkulimit,
                pershkrimShtese:
                  "Tot - TVSH: " +
                  parseFloat(r.data.totaliPaTVSH).toFixed(2) +
                  "€, TVSH: " +
                  parseFloat(r.data.tvsH18 + r.data.tvsH8).toFixed(2) +
                  "€, Tot Fat: " +
                  parseFloat(
                    r.data.totaliPaTVSH + r.data.tvsH18 + r.data.tvsH8
                  ).toFixed(2) +
                  "€",
                rabati: r.data.regjistrimet.rabati,
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

  const handleSubmit = async (event) => {
    if (sasia <= 0 || qmimiShites <= 0 || qmimiBleres <= 0) {
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      await axios
        .post(
          `${API_BASE_URL}/api/Faturat/ruajKalkulimin/teDhenat`,
          {
            idRegjistrimit: props.nrRendorKalkulimit,
            idProduktit: optionsSelected?.value,
            sasiaStokut: sasia,
            qmimiBleres: qmimiBleres,
            qmimiShites: qmimiShites,
            qmimiShitesMeShumic: qmimiShitesMeShumic,
          },
          authentikimi
        )
        .then(async () => {
          setPerditeso(Date.now());
        });

      setproduktiID(0);
      setQmimiBleres("");
      setSasia("");
      setQmimiShites("");
      setQmimiShitesMeShumic("");
      setSasiaNeStok(0);
      setQmimiB(0);
      setQmimiSH(0);
      setQmimiSH2(0);
      setPerditeso(Date.now());
      document.getElementById("produktiSelect-input").focus();
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
          console.log(produkti);
          var prod = produktet.find(
            (item) => item.emriProduktit == produkti["Emri Produktit"]
          );

          console.log(produktet);

          await axios.put(
            `${API_BASE_URL}/api/Faturat/ruajKalkulimin/perditesoStokunQmimin?id=${prod.produktiID}`,
            {
              qmimiBleres: produkti["Qmimi Bleres + TVSH €"],
              qmimiProduktit: produkti["Qmimi Shites me Pakic + TVSH €"],
              sasiaNeStok: produkti["Sasia"],
              qmimiMeShumic: produkti["Qmimi Shites me Shumic + TVSH €"],
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
    const produkti = await axios
      .get(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/getKalkulimi?idKalkulimit=${id}`,
        authentikimi
      )
      .then((p) => {
        setPerditeso(Date.now);

        setEdito(true);
        setproduktiID(p.data[0].idProduktit);
        setEmriProduktit(p.data[0].emriProduktit);
        setSasia(p.data[0].sasiaStokut);
        setQmimiBleres(p.data[0].qmimiBleres);
        setQmimiShites(p.data[0].qmimiShites);
        setQmimiShitesMeShumic(p.data[0].qmimiShitesMeShumic);
      });
  }

  async function handleEdito(id) {
    if (sasia <= 0 || qmimiShites <= 0 || qmimiBleres <= 0) {
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      await axios
        .put(
          `${API_BASE_URL}/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${id}`,
          {
            qmimiBleres: qmimiBleres,
            qmimiShites: qmimiShites,
            sasiaStokut: sasia,
            qmimiShitesMeShumic: qmimiShitesMeShumic,
          },
          authentikimi
        )
        .then(async () => {
          setPerditeso(Date.now());
        });

      setproduktiID(0);
      setQmimiBleres("");
      setSasia("");
      setQmimiShites("");
      setQmimiShitesMeShumic("");
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
  const customStyles = {
    menu: (provided) => ({
      ...provided,
      zIndex: 1050, // Ensure this is higher than the z-index of the thead
    }),
  };
  useEffect(() => {
    axios
      .get(
        `${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`,
        authentikimi
      )
      .then((response) => {
        const fetchedoptions = response.data.map((item) => ({
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
      });
  }, []);

  const handleChange = async (partneri) => {
    setOptionsSelected(partneri);
    document.getElementById("sasia").focus();
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

  const handleMenaxhoTastetPagesa = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!edito) {
        handleSubmit();
      } else {
        handleEdito(idTeDhenatKalk);
      }
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
      <div className="containerDashboardP"> {/* Updated to plain class name */}
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
            onHide={() => setKonfirmoMbylljenFatures(false)}
          >
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
                onClick={() => setKonfirmoMbylljenFatures(false)}
              >
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
            <h1 className="title">Kalkulimi i Mallit</h1>

            <Container fluid>
              <Row>
                <Col>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="idDheEmri">
                      <Form.Label>Produkti</Form.Label>
                      <Select
                        value={optionsSelected}
                        onChange={handleChange}
                        options={options}
                        id="produktiSelect"
                        inputId="produktiSelect-input"
                        isDisabled={edito}
                        styles={customStyles}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Sasia - {njesiaMatese}</Form.Label>
                      <Form.Control
                        id="sasia"
                        type="number"
                        placeholder={"0.00 " + njesiaMatese}
                        value={sasia}
                        onChange={(e) => {
                          setSasia(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          ndrroField(e, "qmimiBleres");
                        }}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Qmimi Bleres + TVSH €</Form.Label>
                      <Form.Control
                        id="qmimiBleres"
                        type="number"
                        value={qmimiBleres}
                        placeholder="0.00 €"
                        onChange={(e) => {
                          const qmimbleres = parseFloat(e.target.value);
                          setQmimiBleres(qmimbleres);
                          const qmimishites =
                            qmimbleres +
                            qmimbleres *
                              ((optionsSelected.item.llojiTVSH + 8) / 100);
                          setQmimiShites(qmimishites.toFixed(2));
                          setQmimiShitesMeShumic(qmimishites.toFixed(2));
                        }}
                        onKeyDown={(e) => {
                          ndrroField(e, "qmimiShites");
                        }}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Qmimi Shites me Pakic + TVSH €</Form.Label>
                      <Form.Control
                        id="qmimiShites"
                        type="number"
                        value={qmimiShites}
                        placeholder="0.00 €"
                        onChange={(e) => {
                          const qmimishites = parseFloat(e.target.value);
                          setQmimiShites(qmimishites);
                        }}
                        onKeyDown={(e) => {
                          ndrroField(e, "qmimiShitesMeShumic");
                        }}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Qmimi Shites me Shumic + TVSH €</Form.Label>
                      <Form.Control
                        id="qmimiShitesMeShumic"
                        type="number"
                        value={qmimiShitesMeShumic}
                        placeholder="0.00 €"
                        onChange={(e) => {
                          const qmimishitesmeshumic = parseFloat(
                            e.target.value
                          );
                          setQmimiShitesMeShumic(qmimishitesmeshumic);
                        }}
                        onKeyDown={handleMenaxhoTastetPagesa}
                      />
                    </Form.Group>

                    <br />
                    <div style={{ display: "flex", gap: "0.3em" }}>
                      <Button
                        variant="success"
                        type="submit"
                        disabled={edito}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubmit();
                        }}
                      >
                        Shto Produktin <FontAwesomeIcon icon={faPlus} />
                      </Button>
                      {edito && (
                        <Button
                          variant="warning"
                          onClick={() => handleEdito(idTeDhenatKalk)}
                        >
                          Edito Produktin{" "}
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </Button>
                      )}
                    </div>
                  </Form>
                </Col>
                <Col>
                  <p>
                    <strong>Sasia aktuale ne Stok:</strong>{" "}
                    {Array.isArray(optionsSelected)
                      ? optionsSelected
                          .map((option) => option.item.sasiaNeStok)
                          .join(", ")
                      : optionsSelected?.item?.sasiaNeStok ?? 0}{" "}
                    {Array.isArray(optionsSelected)
                      ? optionsSelected
                          .map((option) => option.item.emriNjesiaMatese)
                          .join(", ")
                      : optionsSelected?.item?.emriNjesiaMatese ?? "Copë"}
                  </p>
                  <p>
                    <strong>Qmimi Bleres + TVSH:</strong>{" "}
                    {parseFloat(
                      Array.isArray(optionsSelected)
                        ? optionsSelected
                            .map((option) => option.item.qmimiBleres)
                            .join(", ")
                        : optionsSelected?.item?.qmimiBleres ?? 0
                    ).toFixed(2)}{" "}
                    €
                  </p>
                  <p>
                    <strong>Qmimi Shites me Pakic + TVSH:</strong>{" "}
                    {parseFloat(
                      Array.isArray(optionsSelected)
                        ? optionsSelected
                            .map((option) => option.item.qmimiProduktit)
                            .join(", ")
                        : optionsSelected?.item?.qmimiProduktit ?? 0
                    ).toFixed(2)}{" "}
                    €
                  </p>
                  <p>
                    <strong>Qmimi Shites me Shumic + TVSH:</strong>{" "}
                    {parseFloat(
                      Array.isArray(optionsSelected)
                        ? optionsSelected
                            .map((option) => option.item.qmimiMeShumic)
                            .join(", ")
                        : optionsSelected?.item?.qmimiMeShumic ?? 0
                    ).toFixed(2)}{" "}
                    €
                  </p>
                </Col>
                <Col>
                  <Row>
                    <h5>
                      <strong>Nr. Kalkulimit:</strong>{" "}
                      {teDhenatFatures.regjistrimet &&
                        teDhenatFatures.regjistrimet.idRegjistrimit}
                    </h5>
                    <h5>
                      <strong>Partneri:</strong>{" "}
                      {teDhenatFatures.regjistrimet &&
                        teDhenatFatures.regjistrimet.emriBiznesit}
                    </h5>
                    <h5>
                      <strong>Nr. Fat:</strong>{" "}
                      {teDhenatFatures.regjistrimet &&
                        teDhenatFatures.regjistrimet.nrFatures}
                    </h5>
                    <h5>
                      <strong>Totali Fatures pa TVSH:</strong>{" "}
                      {parseFloat(
                        teDhenatFatures.regjistrimet &&
                          teDhenatFatures.regjistrimet.totaliPaTVSH
                      ).toFixed(2)}{" "}
                      €
                    </h5>
                    <h5>
                      <strong>TVSH:</strong>{" "}
                      {parseFloat(
                        teDhenatFatures.regjistrimet &&
                          teDhenatFatures.regjistrimet.tvsh
                      ).toFixed(2)}{" "}
                      €
                    </h5>
                    <h5>
                      <strong>Totali Fatures:</strong>{" "}
                      {parseFloat(
                        teDhenatFatures.regjistrimet &&
                          teDhenatFatures.regjistrimet.totaliPaTVSH +
                            teDhenatFatures.regjistrimet &&
                          teDhenatFatures.regjistrimet.tvsh
                      ).toFixed(2)}{" "}
                      €
                    </h5>
                    <h5>
                      <strong>Totalet Nga Regjistrimi:</strong>{" "}
                      {teDhenatFatures.regjistrimet &&
                        teDhenatFatures.regjistrimet.pershkrimShtese}
                    </h5>

                    <hr />
                    <Col>
                      <Button
                        className="mb-3 Butoni"
                        onClick={() => setKonfirmoMbylljenFatures(true)}
                      >
                        Mbyll Faturen <FontAwesomeIcon icon={faPlus} />
                      </Button>
                      <Button
                        className="mb-3 Butoni"
                        onClick={() => KthehuTekFaturat()}
                      >
                        <FontAwesomeIcon icon={faArrowLeft} /> Kthehu Mbrapa
                      </Button>
                      <PrintLabels
                        storeName={siteName}
                        products={produktetQmimore}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <div className="mt-2">
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
              </div>
            </Container>
          </>
        )}
      </div>
    </>
  );
}

export default RegjistroFaturen;