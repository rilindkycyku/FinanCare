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
import { Form, Container, Row, Col, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Tabela from "../../../TeTjera/Tabela/Tabela";
import PrintLabels from "../../../TeTjera/PrintLabels";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function RegjistroFaturen(props) {
  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false); // For initial loading
  const [isLoadingKartela, setIsLoadingKartela] = useState(false); // For VendosKartelenMenaxherit
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
  const [kartelaMenaxherit, setKartelaMenaxherit] = useState("");
  const [vendosKartelenMenaxherit, setVendosKartelenMenaxherit] =
    useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  const [numriPerditesimeve, setNumriPerditesimeve] = useState("");

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
          setLoading(true);
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
          setLoading(true);
          const teDhenatKalkulimit = await axios.get(
            `https://localhost:7285/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${props.idKalkulimitEdit}`,
            authentikimi
          );
          console.log(teDhenatKalkulimit.data);

          const teDhenatFatures = await axios.get(
            `https://localhost:7285/api/Faturat/shfaqRegjistrimetNgaID?id=${props.idKalkulimitEdit}`,
            authentikimi
          );
          setproduktetNeKalkulim(
            teDhenatKalkulimit.data.map((k, index) => ({
              ID: k.id,
              "Nr. Rendor": index + 1,
              Barkodi: k.barkodi,
              "Emri Produktit": k.emriProduktit,
              "Numri Perditesmeve": parseInt(k.rabati2),
              "Sasia Aktuale ne Stok": parseFloat(k.sasiaAktualeNeStok).toFixed(
                2
              ),
              "Sasia ne Kalkulim": parseFloat(k.sasiaStokut).toFixed(2),
              "Diferenca Stokut": (
                parseFloat(k.sasiaStokut) - parseFloat(k.sasiaAktualeNeStok)
              ).toFixed(2),
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
            }))
          );
          setProduktetQmimore(
            teDhenatKalkulimit.data.map((k) => ({
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
    if (sasia <= 0) {
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      const existingProduct = produktetNeKalkulim.find(
        (product) => product["Barkodi"] === optionsSelected?.item?.barkodi
      );

      if (existingProduct) {
        const sasiaNeKalkulim =
          parseFloat(existingProduct["Sasia ne Kalkulim"]) || 0;
        const sasiaNumerike = parseFloat(sasia) || 0;
        const sasiaStokut = parseFloat(
          (sasiaNeKalkulim + sasiaNumerike).toFixed(2)
        );

        await axios
          .put(
            `https://localhost:7285/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${existingProduct.ID}`,
            {
              sasiaStokut,
              QmimiBleres: existingProduct["Qmimi Bleres + TVSH €"],
              QmimiShites: existingProduct["Qmimi Shites me Pakic + TVSH €"],
              rabati2: existingProduct["Numri Perditesmeve"] + 1,
              QmimiShitesMeShumic:
                existingProduct["Qmimi Shites me Shumic + TVSH €"],
            },
            authentikimi
          )
          .then(() => {
            setPerditeso(Date.now());
          });
      } else {
        await axios
          .post(
            "https://localhost:7285/api/Faturat/ruajKalkulimin/teDhenat",
            {
              idRegjistrimit: props.nrRendorKalkulimit,
              idProduktit: optionsSelected?.value,
              sasiaStokut: sasia,
              qmimiBleres: optionsSelected?.item.qmimiBleres,
              qmimiShites: optionsSelected?.item.qmimiProduktit,
              qmimiShitesMeShumic: optionsSelected?.item.qmimiMeShumic,
              rabati1: optionsSelected?.item.sasiaNeStok,
            },
            authentikimi
          )
          .then(() => {
            setPerditeso(Date.now());
          });
      }

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
    setPendingAction("closeInvoice");
    setVendosKartelenMenaxherit(true);
  }

  async function VendosKartelenMenaxherit() {
    setIsLoadingKartela(true); // Start spinner
    try {
      const kaKartele = await axios.get(
        `https://localhost:7285/api/Kartelat/shfaqKartelenSipasKodit?kodiKarteles=${kartelaMenaxherit}`,
        authentikimi
      );

      if (kaKartele.data && kaKartele.data.llojiKarteles === "Fshirje") {
        if (pendingAction === "delete") {
          await axios.delete(
            `https://localhost:7285/api/Faturat/ruajKalkulimin/FshijTeDhenat?idTeDhenat=${pendingId}`,
            authentikimi
          );
        } else if (pendingAction === "edit") {
          await axios
            .get(
              `https://localhost:7285/api/Faturat/ruajKalkulimin/getKalkulimi?idKalkulimit=${pendingId}`,
              authentikimi
            )
            .then((p) => {
              console.log(p.data[0]);
              setPerditeso(Date.now());
              setEdito(true);
              setproduktiID(p.data[0].idProduktit);
              setEmriProduktit(p.data[0].emriProduktit);
              setSasia(p.data[0].sasiaStokut);
              setSasiaNeStok(p.data[0].sasiaNeStok);
              setQmimiBleres(p.data[0].qmimiBleres);
              setQmimiShites(p.data[0].qmimiShites);
              setQmimiShitesMeShumic(p.data[0].qmimiShitesMeShumic);
              setNumriPerditesimeve(p.data[0].rabati2);
              let produkti = options.filter(
                (e) => e.value == p.data[0].idProduktit
              );
              handleChange(produkti[0]);
            });
        } else if (pendingAction === "closeInvoice") {
          try {
            if (produktetNeKalkulim.length === 0) {
              props.setPerditeso();
              props.mbyllPerkohesisht();
            } else {
              // Fetch dataRegjistrimit to determine the year
              const response = await axios.get(
                `https://localhost:7285/api/Faturat/shfaqRegjistrimetNgaID?id=${props.idKalkulimitEdit}`,
                authentikimi
              );
              const dataRegjistrimit =
                response.data.regjistrimet.dataRegjistrimit;
              console.log("dataRegjistrimit:", dataRegjistrimit); // Debugging

              // Extract the year and subtract 1
              const year = new Date(dataRegjistrimit).getFullYear();
              const previousYear = year - 1;
              const newDatabaseName = `FinanCareDB${previousYear}`;
              const sourceDatabaseName = "FinanCareDB"; // Assuming this remains static

              console.log("DatabazaeRe:", newDatabaseName); // Debugging

              // Perform the database import with the dynamic name
              await axios.post(
                `https://localhost:7285/api/Database?newDatabaseName=${newDatabaseName}&sourceDatabaseName=${sourceDatabaseName}`,
                null,
                authentikimi
              );

              for (let produkti of produktetNeKalkulim) {
                console.log(produkti);
                var prod = produktet.find(
                  (item) => item.emriProduktit == produkti["Emri Produktit"]
                );

                console.log(produktet);

                await axios.put(
                  `https://localhost:7285/api/Faturat/ruajKalkulimin/kalkulimifillestarvjetor/perditesoStokunQmimin?id=${prod.produktiID}`,
                  {
                    qmimiBleres: produkti["Qmimi Bleres + TVSH €"],
                    qmimiProduktit: produkti["Qmimi Shites me Pakic + TVSH €"],
                    sasiaNeStok: produkti["Sasia ne Kalkulim"],
                    qmimiMeShumic: produkti["Qmimi Shites me Shumic + TVSH €"],
                  },
                  authentikimi
                );
              }

              for (let produkti of produktet) {
                const ekzistonNeKalkulim = produktetNeKalkulim.some(
                  (p) => p["Emri Produktit"] === produkti.emriProduktit
                );

                if (!ekzistonNeKalkulim) {
                  await axios.put(
                    `https://localhost:7285/api/Faturat/ruajKalkulimin/kalkulimifillestarvjetor/perditesoStokunQmimin?id=${produkti.produktiID}`,
                    {
                      qmimiBleres: 0,
                      qmimiProduktit: 0,
                      sasiaNeStok: 0,
                      qmimiMeShumic: 0,
                    },
                    authentikimi
                  );
                }
              }

              props.setPerditeso();
              props.mbyllKalkulimin();
            }
          } catch (error) {
            console.error(
              "Ndodhi nje gabim gjate mbylljes se kalkulimit!:",
              error
            );
            setTipiMesazhit("danger");
            setPershkrimiMesazhit(
              "Ndodhi nje gabim gjate mbylljes se kalkulimit!"
            );
            setShfaqMesazhin(true);
          }
        }

        setVendosKartelenMenaxherit(false);
        setKartelaMenaxherit("");
        setPerditeso(Date.now());
      } else {
        setTipiMesazhit("danger");
        setPershkrimiMesazhit("Kartela nuk eshte valide per kete funksion!");
        setShfaqMesazhin(true);
      }
    } catch (error) {
      console.error("Error in VendosKartelenMenaxherit:", error);
      setTipiMesazhit("danger");
      setPershkrimiMesazhit("Kartela nuk egziston!");
      setShfaqMesazhin(true);
    } finally {
      setIsLoadingKartela(false); // Stop spinner
    }
  }

  async function handleFshij(id) {
    setPendingAction("delete");
    setPendingId(id);
    setVendosKartelenMenaxherit(true);
  }

  async function handleEdit(id) {
    setPendingAction("edit");
    setPendingId(id);
    setVendosKartelenMenaxherit(true);
  }

  async function handleEdito(id) {
    if (sasia <= 0 || qmimiShites <= 0 || qmimiBleres <= 0) {
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      console.log(sasiaNeStok);
      await axios
        .put(
          `https://localhost:7285/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${id}`,
          {
            qmimiBleres: qmimiBleres,
            qmimiShites: qmimiShites,
            sasiaStokut: sasia,
            qmimiShitesMeShumic: qmimiShitesMeShumic,
            rabati1: sasiaNeStok,
            rabati2: numriPerditesimeve + 1,
          },
          authentikimi
        )
        .then(() => {
          setPerditeso(Date.now());
          setproduktiID(0);
          setQmimiBleres("");
          setSasia("");
          setQmimiShites("");
          setQmimiShitesMeShumic("");
          setSasiaNeStok(0);
          setQmimiB(0);
          setQmimiSH(0);
          setQmimiSH2(0);
          setNumriPerditesimeve("");
          setEdito(false);
        });
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
      zIndex: 1050,
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
    if (partneri.item.qmimiProduktit <= 0) {
      setPershkrimiMesazhit(
        "<strong><h5>Ju lutem qe te se pari te caktoni qmimin e produktit! </h5><br>Produkti eshte me qmim <i>0.00€!</i> Si i tille nuk mund te futet ne kalkulim. </strong>"
      );
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
      document.getElementById("produktiSelect").focus();
    } else {
      setOptionsSelected(partneri);
      document.getElementById("sasia").focus();
      console.log(partneri);
    }
  };

  useEffect(() => {
    const vendosTeDhenatBiznesit = async () => {
      try {
        const teDhenat = await axios.get(
          "https://localhost:7285/api/TeDhenatBiznesit/ShfaqTeDhenat",
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
      <div className="containerDashboardP">
        <Modal
          show={vendosKartelenMenaxherit}
          onHide={() => !isLoadingKartela && setVendosKartelenMenaxherit(false)} // Disable close during loading
        >
          <Modal.Header closeButton={!isLoadingKartela}>
            <Modal.Title>Vendosni Kartelen</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {isLoadingKartela ? (
              <div className="text-center">
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
                <p>Duke u procesuar te dhenat... Ju lutem Prisni.</p>
              </div>
            ) : (
              <input
                type="text"
                className="form-control"
                placeholder="Nr. Karteles se Menaxherit per Fshirje/Editim!"
                value={kartelaMenaxherit}
                onChange={(e) => setKartelaMenaxherit(e.target.value)}
                disabled={isLoadingKartela}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setVendosKartelenMenaxherit(false)}
              disabled={isLoadingKartela}>
              Anulo
            </Button>
            <Button
              variant="primary"
              onClick={VendosKartelenMenaxherit}
              disabled={isLoadingKartela}>
              Konfirmo
            </Button>
          </Modal.Footer>
        </Modal>

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
              <strong style={{ fontSize: "15pt" }}>
                A jeni te sigurt qe deshironi ta mbyllni Faturen?
                <br />
                <br />
                Perditesimi i kesaj fature nuk do te jete me i mundur!!!!
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
            <h1 className="title">Kalkulimi i Mallit</h1>
            <Container fluid>
              <Row>
                <Col>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="idDheEmri">
                      <Form.Label>
                        Produkti
                      </Form.Label>
                      <Select
                        value={optionsSelected}
                        onChange={handleChange}
                        options={options}
                        id="produktiSelect"
                        inputId="produktiSelect-input"
                        isDisabled={edito || isLoadingKartela}
                        styles={customStyles}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>
                        Sasia - {njesiaMatese}
                      </Form.Label>
                      <Form.Control
                        id="sasia"
                        type="number"
                        placeholder={"0.00 " + njesiaMatese}
                        value={sasia}
                        onChange={(e) => setSasia(e.target.value)}
                        onKeyDown={handleMenaxhoTastetPagesa}
                        disabled={isLoadingKartela}
                      />
                    </Form.Group>
                    {edito && (
                          <span className="text-danger fw-bold">
                            KUJDES: Ndryshimi aplikohet për të gjithë sasinë
                            në kalkulim
                          </span>
                        )}
                    <br />
                    <div style={{ display: "flex", gap: "0.3em" }}>
                      <Button
                        variant="success"
                        type="submit"
                        disabled={edito || isLoadingKartela}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubmit();
                        }}>
                        Shto Produktin <FontAwesomeIcon icon={faPlus} />
                      </Button>
                      {edito && (
                        <Button
                          variant="warning"
                          onClick={() => handleEdito(idTeDhenatKalk)}
                          disabled={isLoadingKartela}>
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
                        disabled={isLoadingKartela}>
                        Mbyll Faturen <FontAwesomeIcon icon={faPlus} />
                      </Button>
                      <Button
                        className="mb-3 Butoni"
                        onClick={() => KthehuTekFaturat()}
                        disabled={isLoadingKartela}>
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
                  shfaqEksporto
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
