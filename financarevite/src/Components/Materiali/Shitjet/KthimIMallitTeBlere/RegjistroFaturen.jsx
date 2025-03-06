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
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { Form, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import Tabela from "../../../TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function RegjistroFaturen(props) {
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
    if (getID) {
      const vendosTeDhenat = async () => {
        try {
          const perdoruesi = await axios.get(
            `https://localhost:7285/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
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
            `https://localhost:7285/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${props.idKalkulimitEdit}`,
            authentikimi
          );

          const teDhenatFatures = await axios.get(
            `https://localhost:7285/api/Faturat/shfaqRegjistrimetNgaID?id=${props.idKalkulimitEdit}`,
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
            `https://localhost:7285/api/Faturat/shfaqRegjistrimetNgaID?id=${props.idKalkulimitEdit}`,
            authentikimi
          )
          .then(async (r) => {
            console.log(r.data);
            await axios.put(
              `https://localhost:7285/api/Faturat/perditesoFaturen?idKalulimit=${props.nrRendorKalkulimit}`,
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
    const vendosProduktet = async () => {
      try {
        const produktet = await axios.get(
          `https://localhost:7285/api/Produkti/ProduktetPerKalkulim`,
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
        "https://localhost:7285/api/Faturat/ruajKalkulimin/teDhenat",
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
            `https://localhost:7285/api/Faturat/ruajKalkulimin/asgjesoStokun/perditesoStokunQmimin?id=${prod.produktiID}`,
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
      `https://localhost:7285/api/Faturat/ruajKalkulimin/FshijTeDhenat?idTeDhenat=${id}`,
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
        `https://localhost:7285/api/Faturat/ruajKalkulimin/getKalkulimi?idKalkulimit=${id}`,
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
        `https://localhost:7285/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${id}`,
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
        "https://localhost:7285/api/Produkti/ProduktetPerKalkulim",
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
      });
  }, []);

  const handleChange = async (partneri) => {
    setOptionsSelected(partneri);
    document.getElementById("sasia").focus();
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
            <h1 className="title">Kthimi i Mallit te Blere</h1>

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
                        id="produktiSelect" // Setting the id attribute
                        inputId="produktiSelect-input" // Setting the input id attribute
                        isDisabled={edito}
                        styles={customStyles}
                        autoFocus
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>
                        Sasia -{" "}
                        {Array.isArray(optionsSelected)
                          ? optionsSelected
                              .map((option) => option.item.emriNjesiaMatese)
                              .join(", ")
                          : optionsSelected?.item?.emriNjesiaMatese ?? "Copë"}
                      </Form.Label>
                      <Form.Control
                        id="sasia"
                        type="number"
                        placeholder={"0.00 "}
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
                      <Form.Label>Qmimi Bleres €</Form.Label>
                      <Form.Control
                        id="qmimiBleres"
                        type="number"
                        placeholder={"0.00 €"}
                        value={qmimiBleres}
                        onChange={(e) => {
                          setQmimiBleres(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          ndrroField(e, "rabati");
                        }}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Rabati %</Form.Label>
                      <Form.Control
                        id="rabati"
                        type="number"
                        placeholder={"0.00 %"}
                        value={rabati}
                        onChange={(e) => {
                          setRabati(e.target.value);
                        }}
                      />
                    </Form.Group>
                    <br />
                    <div style={{ display: "flex", gap: "0.3em" }}>
                      <Button variant="success" type="submit" disabled={edito}>
                        Shto Produktin <FontAwesomeIcon icon={faPlus} />
                      </Button>
                      {edito && (
                        <Button
                          variant="warning"
                          onClick={() => handleEdito(idTeDhenatKalk)}>
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
                        teDhenatFatures.regjistrimet.nrRendorFatures}
                    </h5>
                    <h5>
                      <strong>Partneri:</strong>{" "}
                      {teDhenatFatures.regjistrimet &&
                        teDhenatFatures.regjistrimet.emriBiznesit}
                    </h5>
                    <h5>
                      <strong>Pershkrim Shtese:</strong>{" "}
                      {teDhenatFatures.regjistrimet &&
                        teDhenatFatures.regjistrimet.pershkrimShtese}
                    </h5>
                    <h5>
                      <strong>Totali Produkteve ne Kalkulim:</strong>{" "}
                      {totProdukteve}
                    </h5>
                    <h5>
                      <strong>Sasia:</strong> {parseFloat(totStokut).toFixed(2)}
                    </h5>
                    <h5>
                      <strong>Totali:</strong> {parseFloat(totFat).toFixed(2)} €
                    </h5>

                    <hr />
                    <Col>
                      <Button
                        className="mb-3 Butoni"
                        onClick={() => setKonfirmoMbylljenFatures(true)}>
                        Mbyll Faturen <FontAwesomeIcon icon={faPlus} />
                      </Button>
                      <Button
                        className="mb-3 Butoni"
                        onClick={() => KthehuTekFaturat()}>
                        <FontAwesomeIcon icon={faArrowLeft} /> Kthehu Mbrapa
                      </Button>
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
