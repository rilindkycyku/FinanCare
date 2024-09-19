import { useEffect, useState } from "react";
import classes from "../../../../Pages/Styles/DizajniPergjithshem.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faXmark,
  faPenToSquare,
  faArrowLeft,
  faFileImport,
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { Table, Form, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import useKeyboardNavigation from "../../../../Context/useKeyboardNavigation";
import Select from "react-select";
import Tabela from "../../../TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function RegjistroFaturen(props) {
  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [produktetNeKalkulim, setProduktetNeKalkulim] = useState([]);
  const [emriProduktit, setEmriProduktit] = useState("");
  const [produktiID, setproduktiID] = useState(0);
  const [produktet, setProduktet] = useState([]);
  const [sasia, setSasia] = useState("");
  const [qmimiShites, setQmimiShites] = useState("");
  const [rabati1, setRabati1] = useState("");
  const [rabati2, setRabati2] = useState("");
  const [rabati3, setRabati3] = useState("");
  const [njesiaMatese, setNjesiaMatese] = useState("Cope");
  const [totProdukteve, setTotProdukteve] = useState(0);
  const [totStokut, setTotStokut] = useState(0);
  const [totQmimi, setTotQmimi] = useState(0);
  const [totFat, setTotFat] = useState(0);
  const [sasiaNeStok, setSasiaNeStok] = useState(0);
  const [qmimiB, setQmimiB] = useState(0);
  const [qmimiSH, setQmimiSH] = useState(0);
  const [qmimiSH2, setQmimiSH2] = useState(0);
  const [sasiaShumices, setSasiaShumices] = useState(0);

  const [idTeDhenatKalk, setIdTeDhenatKalk] = useState(0);

  const [edito, setEdito] = useState(false);
  const [konfirmoMbylljenFatures, setKonfirmoMbylljenFatures] = useState(false);
  const [konfirmoProduktin, setKonfirmoProduktin] = useState(false);

  const [teDhenat, setTeDhenat] = useState([]);
  const [teDhenatFatures, setTeDhenatFatures] = useState([]);

  const [konifirmoProduktinLista, setKonifirmoProduktinLista] = useState([]);

  const [inputValue, setInputValue] = useState("");
  const [filteredItems, setFilteredItems] = useState(produktet);
  const selectedIndex = useKeyboardNavigation(filteredItems); // Use the custom hook

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

          setProduktetNeKalkulim(
            teDhenatKalkulimit.data.map((k, index) => ({
              ID: k.id,
              "Nr. Rendor": index + 1,
              "Emri Produktit": k.emriProduktit,
              Sasia: parseFloat(k.sasiaStokut).toFixed(2),
              "Qmimi €": parseFloat(k.sasiaStokut * k.qmimiBleres).toFixed(2),
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
    let totalQmimi = 0;
    let totalFat = 0;

    produktetNeKalkulim.forEach((produkti) => {
      totalProdukteve += 1;
      totalStokut += parseFloat(produkti.Sasia);
      totalQmimi +=
        parseFloat(produkti.Sasia) * parseFloat(produkti["Qmimi €"]);
    });

    setTotProdukteve(totalProdukteve);
    setTotStokut(totalStokut.toFixed(2));
    setTotQmimi(totalQmimi.toFixed(2));
    setTotFat(totalQmimi.toFixed(2));
  }, [produktetNeKalkulim]);

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

  const handleSubmit = async (event) => {
    console.log(optionsSelected);
    if (sasia <= 0) {
      event.preventDefault();
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      event.preventDefault();
      console.log(optionsSelected);
      await axios
        .post(
          "https://localhost:7285/api/Faturat/ruajKalkulimin/teDhenat",
          {
            idRegjistrimit: props.nrRendorKalkulimit,
            idProduktit: optionsSelected?.value,
            sasiaStokut: sasia,
            qmimiBleres: -optionsSelected?.item?.qmimiBleres,
            qmimiShites: optionsSelected?.item?.qmimiProduktit,
            qmimiShitesMeShumic: optionsSelected?.item?.qmimiMeShumic,
          },
          authentikimi
        )
        .then(async () => {
          setPerditeso(Date.now());
        });

      setproduktiID(0);
      setInputValue("");
      setSasia("");
      setSasiaNeStok(0);
      setQmimiB(0);
      setQmimiSH(0);
      setQmimiSH2(0);
      setRabati3(0);
      setQmimiShites(0);
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
            `https://localhost:7285/api/Faturat/ruajKalkulimin/asgjesoStokun/perditesoStokunQmimin?id=${prod.produktiID}`,
            {
              sasiaNeStok: produkti.sasiaStokut,
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
        `https://localhost:7285/api/Faturat/ruajKalkulimin/FshijTeDhenat?idTeDhenat=${id}`,
        authentikimi
      )
      .then(async () => {
        setPerditeso(Date.now());
      });
  }

  async function handleEdit(id, index) {
    await axios
      .get(
        `https://localhost:7285/api/Faturat/ruajKalkulimin/getKalkulimi?idKalkulimit=${id}`,
        authentikimi
      )
      .then((p) => {
        console.log(p.data[0]);
        setPerditeso(Date.now);

        setEdito(true);
        setproduktiID(p.data[0].idProduktit);
        setInputValue(index + 1 + " - " + p.data[0].emriProduktit);
        setEmriProduktit(p.data[0].emriProduktit);
        setSasiaNeStok(p.data[0].sasiaNeStok);
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
          `https://localhost:7285/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${id}`,
          {
            qmimiBleres: qmimiB,
            qmimiShites: qmimiSH,
            sasiaStokut: sasia,
            qmimiShitesMeShumic: qmimiSH2,
          },
          authentikimi
        )
        .then(async () => {
          setPerditeso(Date.now());
        });

      setproduktiID(0);
      setSasia("");
      setInputValue("");
      setSasiaNeStok(0);
      setQmimiB(0);
      setQmimiSH(0);
      setQmimiSH2(0);
      setQmimiShites("");
      setRabati3("");
      setEdito(false);
    }
  }

  function KthehuTekFaturat() {
    props.setPerditeso();
    props.mbyllPerkohesisht();
  }

  function kontrolloQmimin(e) {
    setSasia(e.target.value);
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
            <h1 className="title">Asgjesimi i Stokut</h1>

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
                      <Form.Label>Sasia - {njesiaMatese}</Form.Label>
                      <Form.Control
                        id="sasia"
                        type="number"
                        placeholder={"0.00 " + njesiaMatese}
                        value={sasia}
                        onChange={(e) => {
                          kontrolloQmimin(e);
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
                    <strong>Qmimi Bleres me Shumic + TVSH:</strong>{" "}
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
                      <strong>Nr. Asgjesimit:</strong>{" "}
                      {teDhenatFatures.regjistrimet &&
                        teDhenatFatures.regjistrimet.nrRendorFatures}
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
