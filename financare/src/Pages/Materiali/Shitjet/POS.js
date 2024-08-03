import { useEffect, useState } from "react";
import classes from "../../../Pages/Styles/DizajniPergjithshem.css";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import { Helmet } from "react-helmet";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faXmark,
  faPenToSquare,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { Table, Form, Container, Row, Col, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import useKeyboardNavigation from "../../../Context/useKeyboardNavigation";
import Select from "react-select";

function POS(props) {
  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [produktetNeKalkulim, setproduktetNeKalkulim] = useState([]);
  const [produktiID, setproduktiID] = useState(0);
  const [sasia, setSasia] = useState("1");
  const [njesiaMatese, setNjesiaMatese] = useState("Cope");
  const [sasiaAktualeNeStok, setSasiaAktualeNeStok] = useState(0);

  const [vendosKartelenBleresit, setVendosKartelenBleresit] = useState(false);
  const [kartelaBleresit, setKartelaBleresit] = useState(null);
  const [teDhenatKartelaBleresit, setTeDhenatKartelaBleresit] = useState(null);

  const [rabati1, setRabati1] = useState(0);
  const [rabati2, setRabati2] = useState(0);

  const [qmimiSH, setQmimiSH] = useState(0);
  const [qmimiSH2, setQmimiSH2] = useState(0);
  const [sasiaShumices, setSasiaShumices] = useState(0);
  const [idPartneri, setIDPartneri] = useState(1);

  const [nrFatures, setNrFatures] = useState(0);
  const [idRegjistrimit, setIdRegjistrimit] = useState(0);
  const [llojiPageses, setLlojiPageses] = useState("Cash");
  const [shumaPageses, setShumaPageses] = useState(0);
  const [qmimiTotal, setQmimiTotal] = useState(0);
  const [qmimiPaRabatBonus, setQmimiPaRabatBonus] = useState(0);
  const [totaliTVSH, setTotaliTVSH] = useState(0);
  const [kalkEditID, setKalkEditID] = useState(0);

  const [perditesoFat, setPerditesoFat] = useState("");

  const [edito, setEdito] = useState(false);

  const [optionsBarkodi, setOptionsBarkodi] = useState([]);
  const [optionsBarkodiSelected, setOptionsBarkodiSelected] = useState(null);
  const [optionsProdukti, setOptionsProdukti] = useState([]);
  const [optionsProduktiSelected, setOptionsProduktiSelected] = useState(null);

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

          const nrRendor = await axios.get(
            `https://localhost:7285/api/Faturat/ShfaqNumrinRendorFatures?stafiID=${perdoruesi.data.perdoruesi.userID}`,
            authentikimi
          );
          setNrFatures(nrRendor.data.nrFat);
          setIdRegjistrimit(nrRendor.data.idRegjistrimit);
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
    const timer = setTimeout(() => {
      setPerditesoFat(Date.now());
    }, 1000);
    return () => clearTimeout(timer); // Clean up the timer on component unmount
  }, [perditeso]);

  useEffect(() => {
    const vendosTeDhenat = async () => {
      try {
        const teDhenatKalkulimit = await axios.get(
          `https://localhost:7285/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${idRegjistrimit}`,
          authentikimi
        );

        const teDhenatFatures = await axios.get(
          `https://localhost:7285/api/Faturat/shfaqRegjistrimetNgaID?id=${idRegjistrimit}`,
          authentikimi
        );

        setproduktetNeKalkulim(teDhenatKalkulimit.data);
        setIDPartneri(teDhenatFatures.data.regjistrimet.idPartneri);
        console.log(teDhenatFatures.data);
        console.log(teDhenatKalkulimit.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    vendosTeDhenat();
  }, [perditesoFat, produktiID]);

  useEffect(() => {
    const calculateTotals = async () => {
      let totalQmimiPaTVSH = 0;
      let totalTVSH = 0;
      let qmimiPaRabatBonus = 0;

      produktetNeKalkulim.forEach((produkti) => {
        const qmimiShitesPasRabatit =
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
            (produkti.rabati3 / 100);

        const qmimiShitesPaRabatBonus =
          produkti.qmimiShites -
          produkti.qmimiShites * (produkti.rabati1 / 100);

        const qmimiPaTVSH =
          qmimiShitesPasRabatit / (1 + produkti.llojiTVSH / 100);
        const qmimiTVSH = qmimiPaTVSH * (produkti.llojiTVSH / 100);

        totalQmimiPaTVSH += qmimiPaTVSH * produkti.sasiaStokut;
        totalTVSH += qmimiTVSH * produkti.sasiaStokut;
        qmimiPaRabatBonus += qmimiShitesPaRabatBonus * produkti.sasiaStokut;
      });

      setTotaliTVSH(totalTVSH);
      setQmimiTotal(totalQmimiPaTVSH + totalTVSH);
      setQmimiPaRabatBonus(qmimiPaRabatBonus);

      try {
        const response = await axios.get(
          `https://localhost:7285/api/Faturat/shfaqRegjistrimetNgaID?id=${idRegjistrimit}`,
          authentikimi
        );

        await axios.put(
          `https://localhost:7285/api/Faturat/perditesoFaturen?idKalulimit=${idRegjistrimit}`,
          {
            dataRegjistrimit: response.data.regjistrimet.dataRegjistrimit,
            stafiID: response.data.regjistrimet.stafiID,
            totaliPaTVSH: parseFloat(totalQmimiPaTVSH),
            tvsh: parseFloat(totalTVSH),
            idPartneri: response.data.regjistrimet.idPartneri,
            statusiPageses: response.data.statusiPageses,
            llojiPageses: response.data.regjistrimet.llojiPageses,
            llojiKalkulimit: response.data.regjistrimet.llojiKalkulimit,
            nrFatures: response.data.regjistrimet.nrFatures,
            statusiKalkulimit: response.data.regjistrimet.statusiKalkulimit,
            pershkrimShtese: response.data.regjistrimet.pershkrimShtese,
            rabati: parseFloat(response.data.rabati),
            nrRendorFatures: response.data.regjistrimet.nrRendorFatures,
          },
          authentikimi
        );
      } catch (error) {
        console.error("Error fetching or updating data:", error);
      }
    };

    calculateTotals();
  }, [produktetNeKalkulim, idRegjistrimit, perditesoFat, idPartneri]);

  const ndrroField = (e, tjetra) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(tjetra).focus();
    }
  };

  async function handleFshij(id) {
    await axios.delete(
      `https://localhost:7285/api/Faturat/ruajKalkulimin/FshijTeDhenat?idTeDhenat=${id}`,
      authentikimi
    );

    setPerditesoFat(Date.now());
  }

  async function handleEdit(id, index) {
    await axios
      .get(
        `https://localhost:7285/api/Faturat/ruajKalkulimin/getKalkulimi?idKalkulimit=${id}`,
        authentikimi
      )
      .then((p) => {
        console.log(p.data[0]);

        setEdito(true);
        setproduktiID(p.data[0].idProduktit);
        setSasia(p.data[0].sasiaStokut);
        setSasiaShumices(p.data[0].sasiaShumices);
        setQmimiSH(p.data[0].qmimiShites);
        setQmimiSH2(p.data[0].qmimiShitesMeShumic);
        setRabati1(p.data[0].rabati1);
        setRabati2(p.data[0].rabati2);
        setKalkEditID(p.data[0].id);

        setNjesiaMatese(p.data[0].emriNjesiaMatese);
        setSasiaAktualeNeStok(p.data[0].sasiaNeStok);

        document.getElementById("sasia").focus();
      });
  }

  async function handleEdito(e) {
    console.log(kontrolloQmimin(sasia));

    if (e.key === "Enter") {
      e.preventDefault();
      await axios.put(
        `https://localhost:7285/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${kalkEditID}`,
        {
          sasiaStokut: sasia,
          qmimiShites: qmimiSH,
          qmimiShitesMeShumic: qmimiSH,
          rabati1: rabati1,
          rabati2: rabati2,
        },
        authentikimi
      );

      setproduktiID(0);
      setSasia("");
      setQmimiSH(0);
      setOptionsBarkodiSelected(null);
      setEdito(false);
      setPerditesoFat(Date.now());
    }
  }

  function kontrolloQmimin(e) {
    setSasia((e && e.target && e.target.value) || e);

    console.log(e.target);

    if (e && e.target && e.target.value % sasiaShumices === 0) {
      setQmimiSH(
        (e &&
          e.target &&
          e.target.value &&
          e.target.value.qmimiShitesMeShumic) ||
          qmimiSH2
      );
    } else {
      setQmimiSH(
        (e &&
          e.target &&
          e.target.value &&
          e.target.value &&
          e.target.value.qmimiProduktit) ||
          qmimiSH
      );
    }
  }

  const currentDate = new Date().toLocaleDateString("en-GB", {
    dateStyle: "short",
  });

  useEffect(() => {
    // Simulate setting an initial value for editing
    const initialOptionsBarkodiSelected = optionsBarkodi.find(
      (option) => option.value === produktiID
    );
    setOptionsBarkodiSelected(initialOptionsBarkodiSelected);

    console.log(optionsBarkodiSelected);

    const initialOptionsProduktiSelected = optionsProdukti.find(
      (option) => option.value === produktiID
    );

    setOptionsProduktiSelected(initialOptionsProduktiSelected);

    console.log(
      optionsProdukti.find((option) => option.value === optionsBarkodiSelected)
    );

    document.getElementById("sasia").focus();
  }, [edito, produktiID]);

  useEffect(() => {
    // Replace with your API endpoint
    axios
      .get("https://localhost:7285/api/Produkti/ProduktetPerKalkulim")
      .then((response) => {
        // Assuming the response data is an array of objects with `value` and `label` properties
        const fetchedOptionsBarkodi = response.data.map((item) => ({
          value: item.produktiID,
          label: item.barkodi,
          qmimiProduktit: item.qmimiProduktit,
          qmimiMeShumic: item.qmimiMeShumic,
          rabati: item.rabati,
          sasiaNeStok: item.sasiaNeStok,
          emriNjesiaMatese: item.emriNjesiaMatese,
        }));
        setOptionsBarkodi(fetchedOptionsBarkodi);

        const fetchedOptionsProdukti = response.data.map((item) => ({
          value: item.produktiID,
          label:
            item.emriProduktit +
            " - " +
            item.barkodi +
            " - " +
            item.kodiProduktit,
          qmimiProduktit: item.qmimiProduktit,
          qmimiMeShumic: item.qmimiMeShumic,
          rabati: item.rabati,
          sasiaNeStok: item.sasiaNeStok,
          emriNjesiaMatese: item.emriNjesiaMatese,
        }));
        setOptionsProdukti(fetchedOptionsProdukti);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleChange = async (barkodi) => {
    setOptionsBarkodiSelected(barkodi);
    console.log("Selected option:", barkodi);

    await axios.post(
      "https://localhost:7285/api/Faturat/ruajKalkulimin/teDhenat",
      {
        idRegjistrimit: idRegjistrimit,
        idProduktit: barkodi.value,
        sasiaStokut: 1,
        qmimiShites: barkodi.qmimiProduktit,
        qmimiShitesMeShumic: barkodi.qmimiMeShumic,
        rabati1: barkodi.rabati,
        rabati2: rabati2,
      },
      authentikimi
    );

    setproduktiID(0);
    setSasia("");
    setSasiaShumices(0);
    setNjesiaMatese(barkodi.emriNjesiaMatese);
    setSasiaAktualeNeStok(barkodi.sasiaNeStok);
    setQmimiSH(0);
    setQmimiSH2(0);
    setOptionsBarkodiSelected(null);
    setOptionsProduktiSelected(null);
    setPerditesoFat(Date.now());
  };

  const handleKaloTekPagesa = (event) => {
    if (event.key === "Escape") {
      document.getElementById("shumaPageses").focus();
    }
  };

  const handleMenaxhoTastetPagesa = (event) => {
    if (event.key === "F4") {
      event.preventDefault();
      setVendosKartelenBleresit(true);
    }
    if (event.key === "F5") {
      event.preventDefault();
      mbyllFature();
    }
  };

  const mbyllFature = async (event) => {
    await axios
      .get(
        `https://localhost:7285/api/Faturat/shfaqRegjistrimetNgaID?id=${idRegjistrimit}`,
        authentikimi
      )
      .then(async (r) => {
        console.log(r);
        if (r.data.regjistrimet.totaliPaTVSH <= 0) {
          setTipiMesazhit("danger");
          setPershkrimiMesazhit(
            "Kjo fature nuk mund te mbyllet me qmim 0 ose me te vogel! Ju lutem kontrolloni ate."
          );
          setShfaqMesazhin(true);
        } else {
          await axios
            .put(
              `https://localhost:7285/api/Faturat/perditesoFaturen?idKalulimit=${idRegjistrimit}`,
              {
                llojiPageses: llojiPageses,
                statusiKalkulimit: "true",
                idPartneri: r.data.regjistrimet.idPartneri,
                dataRegjistrimit: r.data.regjistrimet.dataRegjistrimit,
                stafiID: r.data.regjistrimet.stafiID,
                totaliPaTVSH: parseFloat(r.data.regjistrimet.totaliPaTVSH),
                tvsh: parseFloat(r.data.regjistrimet.tvsh),
                statusiPageses: r.data.statusiPageses,
                llojiKalkulimit: r.data.regjistrimet.llojiKalkulimit,
                nrFatures: r.data.regjistrimet.nrFatures,
                pershkrimShtese: r.data.regjistrimet.pershkrimShtese,
                rabati: parseFloat(r.data.rabati),
                nrRendorFatures: r.data.regjistrimet.nrRendorFatures,
              },
              authentikimi
            )
            .then(async () => {
              for (let produkti of produktetNeKalkulim) {
                console.log(produkti);
                await axios.put(
                  `https://localhost:7285/api/Faturat/ruajKalkulimin/asgjesoStokun/perditesoStokunQmimin?id=${produkti.idProduktit}`,
                  {
                    sasiaNeStok: produkti.sasiaStokut,
                  },
                  authentikimi
                );
              }
            });
        }

        document.getElementById("barkodiSelect-input").focus();
        setPerditeso(Date.now());
        setShumaPageses(0);
        setLlojiPageses("Cash");
        setOptionsBarkodiSelected(null);
        setOptionsProduktiSelected(null);
        setIDPartneri(1);
        setTeDhenatKartelaBleresit(null);
      });
  };

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      zIndex: 1050, // Ensure this is higher than the z-index of the thead
    }),
  };

  useEffect(() => {
    const tabelaDiv = document.querySelector(".tabelaDiv"); // Select the element with the class 'tabelaDiv'
    if (tabelaDiv) {
      tabelaDiv.style.zoom = "80%"; // Zoom out to 80% of the normal size
    }
  }, []);

  async function VendosKartelenBleresit() {
    try {
      const kaKartele = await axios.get(
        `https://localhost:7285/api/Kartelat/shfaqKartelenSipasKodit?kodiKarteles=${kartelaBleresit}`,
        authentikimi
      );

      if (kaKartele != null) {
        setRabati2(kaKartele.data.rabati);
        setIDPartneri(kaKartele.data.partneriID);
        setTeDhenatKartelaBleresit(kaKartele.data);

        console.log(kaKartele.data);

        const r = await axios.get(
          `https://localhost:7285/api/Faturat/shfaqRegjistrimetNgaID?id=${idRegjistrimit}`,
          authentikimi
        );

        await axios.put(
          `https://localhost:7285/api/Faturat/perditesoFaturen?idKalulimit=${idRegjistrimit}`,
          {
            llojiPageses: r.data.regjistrimet.llojiPageses,
            statusiKalkulimit: r.data.regjistrimet.statusiKalkulimit,
            idPartneri: kaKartele.data.partneriID,
            dataRegjistrimit: r.data.regjistrimet.dataRegjistrimit,
            stafiID: r.data.regjistrimet.stafiID,
            totaliPaTVSH: parseFloat(r.data.regjistrimet.totaliPaTVSH),
            tvsh: parseFloat(r.data.regjistrimet.tvsh),
            statusiPageses: r.data.statusiPageses,
            llojiKalkulimit: r.data.regjistrimet.llojiKalkulimit,
            nrFatures: r.data.regjistrimet.nrFatures,
            pershkrimShtese: r.data.regjistrimet.pershkrimShtese,
            rabati: parseFloat(r.data.rabati),
            nrRendorFatures: r.data.regjistrimet.nrRendorFatures,
          },
          authentikimi
        );

        for (let produkti of produktetNeKalkulim) {
          console.log(produkti);
          await axios.put(
            `https://localhost:7285/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${produkti.id}`,
            {
              sasiaStokut: produkti.sasiaStokut,
              qmimiShites: produkti.qmimiShites,
              qmimiShitesMeShumic: produkti.qmimiShitesMeShumic,
              rabati1: produkti.rabati1,
              rabati2: kaKartele.data.rabati,
            },
            authentikimi
          );
        }

        setKartelaBleresit(null);
        setVendosKartelenBleresit(false);
        setPerditesoFat(Date.now());
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        document.getElementById("barkodiSelect-input").focus();
        setVendosKartelenBleresit(false);
        setTipiMesazhit("danger");
        setPershkrimiMesazhit("Kartela nuk egziston!");
        setShfaqMesazhin(true);
      }
    }
  }

  return (
    <>
      <Helmet>
        <title>POS | FinanCare</title>
      </Helmet>
      <NavBar />
      <div className="containerDashboardP" style={{ width: "90%" }}>
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}
        {vendosKartelenBleresit && (
          <Modal
            show={vendosKartelenBleresit}
            onHide={() => setVendosKartelenBleresit(false)}>
            <Modal.Header closeButton>
              <Modal.Title as="h6">Vendosni Kartelen</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Nr. Karteles</Form.Label>
                <Form.Control
                  id="nrKarteles"
                  type="text"
                  value={kartelaBleresit}
                  onChange={(e) => setKartelaBleresit(e.target.value)}
                  placeholder="Shkruani kartelen bleresit"
                  autoFocus
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setVendosKartelenBleresit(false)}>
                Anulo <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
              <Button variant="warning" onClick={VendosKartelenBleresit}>
                Vendos Kartelen <FontAwesomeIcon icon={faPlus} />
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
            <h1 className="title">POS</h1>

            <Container fluid>
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Label>Nr. Fatures</Form.Label>
                    <Form.Control
                      id="nrFatures"
                      type="number"
                      placeholder={nrFatures}
                      value={nrFatures}
                      disabled
                    />
                  </Form.Group>
                  <Form.Group className="mt-1" >
                    <Form.Label>Data</Form.Label>
                    <Form.Control
                      id="qmimiShites"
                      type="text"
                      value={currentDate}
                      disabled
                      className="mb-3"
                    />
                  </Form.Group>
                  <h5 className="mt-1">
                    <strong>Sasia ne Stok:</strong>{" "}
                    {parseFloat(sasiaAktualeNeStok).toFixed(4)} {njesiaMatese}
                  </h5>
                  <br />
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Lloji i Pageses</Form.Label>
                    <select
                      id="llojiIPageses"
                      placeholder="LlojiIPageses"
                      className="form-select"
                      value={llojiPageses ? llojiPageses : 0}
                      disabled={edito}
                      onChange={(e) => {
                        setLlojiPageses(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        ndrroField(e, "statusiIPageses");
                      }}>
                      <option defaultValue value={0} key={0} disabled>
                        Zgjedhni Llojin e Pageses
                      </option>
                      <option key={1} value="Cash">
                        Cash
                      </option>
                      <option key={2} value="Banke">
                        Banke
                      </option>
                    </select>
                  </Form.Group>
                  <Form.Group className="mt-1">
                    <Form.Label>Shuma Pageses</Form.Label>
                  </Form.Group>
                  <InputGroup className="mb-3">
                    <Form.Control
                      id="shumaPageses"
                      type="number"
                      placeholder={shumaPageses}
                      value={shumaPageses}
                      disabled={edito}
                      onChange={(e) => {
                        setShumaPageses(e.target.value);
                      }}
                      onKeyDown={handleMenaxhoTastetPagesa}
                    />
                    <InputGroup.Text>€</InputGroup.Text>
                  </InputGroup>
                  <h5 className="mt-1">
                    <strong>Kusuri:</strong>{" "}
                    {parseFloat(shumaPageses - qmimiTotal).toFixed(2)} €
                  </h5>
                  <br />
                </Col>
                <Col>
                  <h1 style={{ fontSize: "3.7em" }}>
                    {parseFloat(qmimiTotal).toFixed(2)} €
                  </h1>
                  {teDhenatKartelaBleresit != null && (
                    <>
                      <p style={{ fontSize: "1.8em" }}>
                        <strong>Klienti: </strong>
                        {teDhenatKartelaBleresit &&
                          teDhenatKartelaBleresit.partneri &&
                          teDhenatKartelaBleresit.partneri.emriBiznesit}
                      </p>
                      <p style={{ fontSize: "1.4em", marginTop: "-0.55em" }}>
                        <strong>Rabati: </strong>
                        {parseFloat(
                          teDhenatKartelaBleresit &&
                            teDhenatKartelaBleresit.rabati
                        ).toFixed(2)}{" "}
                        % -{" "}
                        {parseFloat(qmimiPaRabatBonus - qmimiTotal).toFixed(2)}{" "}
                        €
                      </p>
                      <p style={{ fontSize: "1.4em", marginTop: "-0.55em" }}>
                        <strong>Tot. Pa Rab.: </strong>
                        {parseFloat(qmimiPaRabatBonus).toFixed(2)} €
                      </p>
                    </>
                  )}
                </Col>
              </Row>
              <Row>
                <Col md={3}>
                  <Form.Group controlId="idDheEmri">
                    <Form.Label>Barkodi</Form.Label>
                    <Select
                      value={optionsBarkodiSelected}
                      onChange={handleChange}
                      options={optionsBarkodi}
                      id="barkodiSelect" // Setting the id attribute
                      inputId="barkodiSelect-input" // Setting the input id attribute
                      isDisabled={edito}
                      onKeyDown={handleKaloTekPagesa}
                      styles={customStyles}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="idDheEmri">
                    <Form.Label>Produkti</Form.Label>
                    <Select
                      value={optionsProduktiSelected}
                      onChange={handleChange}
                      options={optionsProdukti}
                      id="produktiSelect" // Setting the id attribute
                      inputId="produktiSelect-input" // Setting the input id attribute
                      isDisabled={edito}
                      styles={customStyles}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
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
                      onKeyDown={(e) => {
                        handleEdito(e);
                      }}
                      disabled={!edito}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Qmimi Shites €</Form.Label>
                    <Form.Control
                      id="qmimiShites"
                      type="number"
                      placeholder={"0.00 €"}
                      value={qmimiSH}
                      disabled
                    />
                  </Form.Group>
                </Col>
              </Row>
              <h1 className="mt-2">Regjistrimi Pozicioneve te Paragonit</h1>

              <div
                className="tabelaDiv"
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                }}>
                <Table striped bordered hover>
                  <thead
                    style={{
                      position: "sticky",
                      top: "0",
                      backgroundColor: "#fff",
                      zIndex: 999,
                    }}>
                    <tr>
                      <th>Nr.</th>
                      <th>Barkodi</th>
                      <th>Emertimi</th>
                      <th>Njm</th>
                      <th>Sasia</th>
                      <th>Qmimi Shites</th>
                      <th>Shuma €</th>

                      <th>Funksione</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produktetNeKalkulim
                      .slice() // Create a shallow copy to avoid mutating the original array
                      .map((p, index) => {
                        const qmimiMeTVSHRab = parseFloat(
                          p.qmimiShites -
                            p.qmimiShites * (p.rabati1 / 100) -
                            (p.qmimiShites -
                              p.qmimiShites * (p.rabati1 / 100)) *
                              (p.rabati2 / 100) -
                            (p.qmimiShites -
                              p.qmimiShites * (p.rabati1 / 100) -
                              (p.qmimiShites -
                                p.qmimiShites * (p.rabati1 / 100)) *
                                (p.rabati2 / 100)) *
                              (p.rabati3 / 100)
                        ).toFixed(3);
                        const ShumaToT = parseFloat(
                          qmimiMeTVSHRab * p.sasiaStokut
                        ).toFixed(3);

                        const originalIndex =
                          produktetNeKalkulim.length - 1 - index;

                        return (
                          p && (
                            <tr key={originalIndex}>
                              <td>{originalIndex + 1}</td>
                              <td>{p.barkodi}</td>
                              <td>{p.emriProduktit}</td>
                              <td>{p.emriNjesiaMatese}</td>
                              <td>{p.sasiaStokut}</td>

                              <td>{parseFloat(qmimiMeTVSHRab).toFixed(2)} €</td>
                              <td>{parseFloat(ShumaToT).toFixed(2)} €</td>
                              <td>
                                <div style={{ display: "flex", gap: "0.3em" }}>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    disabled={edito}
                                    onClick={() => handleFshij(p.id)}>
                                    <FontAwesomeIcon icon={faXmark} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="warning"
                                    disabled={edito}
                                    onClick={() => {
                                      setOptionsBarkodiSelected(p.idProduktit);
                                      handleEdit(p.id, index);
                                    }}>
                                    <FontAwesomeIcon icon={faPenToSquare} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        );
                      })}
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              </div>
              <footer
                style={{
                  position: "fixed",
                  width: "100%",
                  bottom: 0,
                  backgroundColor: "#fff",
                  zIndex: 1000,
                  fontWeight: "bold",
                  fontSize: "0.8em",
                }}>
                <p>
                  Me ESC kalohet tek Pagesa. F5 Mbyllet Fatura. F4 Bonus
                  Kartela.
                </p>
              </footer>
            </Container>
          </>
        )}
      </div>
    </>
  );
}

export default POS;
