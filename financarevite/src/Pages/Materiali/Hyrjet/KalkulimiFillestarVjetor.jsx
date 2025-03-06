import { useEffect, useState } from "react";
import "../../Styles/DizajniPergjithshem.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { Form, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import RegjistroFaturen from "../../../Components/Materiali/Hyrjet/KalkulimiFillestarVjetor/RegjistroFaturen";
import TeDhenatKalkulimit from "../../../Components/Materiali/Hyrjet/KalkulimiFillestarVjetor/TeDhenatKalkulimit";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";

function KalkulimiFillestarVjetor(props) {
  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [partneret, setPartneret] = useState([]);

  const [nrRendorKalkulimit, setNrRendorKalkulimit] = useState(0);
  const [Partneri, setPartneri] = useState(0);
  const [nrFatures, setNrFatures] = useState("");
  const today = new Date();
  const initialDate = today.toISOString().split("T")[0]; // Format as 'yyyy-MM-dd'
  const [dataEFatures, setDataEFatures] = useState(initialDate);
  const [llojiIPageses, setLlojiIPageses] = useState("Cash");
  const [statusiIPageses, setStatusiIPageses] = useState("E Paguar");
  const [totPaTVSH, setTotPaTVSH] = useState("0.00");
  const [TVSH, setTVSH] = useState("0.00");

  const [kalkulimet, setKalkulimet] = useState([]);
  const [regjistroKalkulimin, setRegjistroKalkulimin] = useState(false);
  const [shfaqTeDhenat, setShfaqTeDhenat] = useState(false);
  const [mbyllFature, setMbyllFaturen] = useState(true);
  const [id, setId] = useState(0);

  const [idKalkulimitEdit, setIdKalkulimitEdit] = useState(0);

  const [edito, setEdito] = useState(false);

  const [teDhenat, setTeDhenat] = useState([]);

  const [statusiIPagesesValue, setStatusiIPagesesValue] = useState("Pa Paguar");

  const navigate = useNavigate();

  const getID = localStorage.getItem("id");

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  const handleShfaqTeDhenat = (id) => {
    setId(id);
    setShfaqTeDhenat(true);
    setMbyllFaturen(false);
  };

  useEffect(() => {
    const shfaqKalkulimet = async () => {
      try {
        setLoading(true);
        const kalkulimi = await axios.get(
          "https://localhost:7285/api/Faturat/shfaqRegjistrimet",
          authentikimi
        );
        const kalkulimet = kalkulimi.data.filter(
          (item) => item.llojiKalkulimit === "KLFV"
        );
        setKalkulimet(
          kalkulimet.map((k) => ({
            ID: k.idRegjistrimit,
            "Nr. Kalkulimit": k.nrRendorFatures,
            "Nr. Fatures": k.nrFatures,
            "Viti Kalkulimit": new Date(k.dataRegjistrimit)
              .getFullYear()
              .toString(),
            "Gjendja Kalkulimit": k.pershkrimShtese,
            "Statusi Kalkulimit":
              k.statusiKalkulimit === "true" ? "I Mbyllur" : "I Hapur",
          }))
        );
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    shfaqKalkulimet();
  }, [perditeso]);

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
    const vendosPartnerin = async () => {
      try {
        const partneri = await axios.get(
          `https://localhost:7285/api/Partneri/shfaqPartneretFurntiore`,
          authentikimi
        );
        setPartneret(partneri.data);
      } catch (err) {
        console.log(err);
      }
    };

    vendosPartnerin();
  }, [perditeso]);

  useEffect(() => {
    const vendosNrFaturesMeRradhe = async () => {
      try {
        const nrFat = await axios.get(
          `https://localhost:7285/api/Faturat/getNumriFaturesMeRradhe?llojiKalkulimit=KLFV`,
          authentikimi
        );
        setNrRendorKalkulimit(parseInt(nrFat.data));
      } catch (err) {
        console.log(err);
      }
    };

    vendosNrFaturesMeRradhe();
  }, [perditeso]);

  const ndrroField = (e, tjetra) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(tjetra).focus();
    }
  };

  async function handleRegjistroKalkulimin() {
    try {
      if (!dataEFatures) {
        console.error("Data e faturës është e zbrazët!");
        return;
      }

      // Extract the selected year
      const selectedYear = new Date(dataEFatures).getFullYear().toString();

      // Check if a KLFV calculation exists for the selected year
      const exists = kalkulimet.some(
        (k) => k["Viti Kalkulimit"] === selectedYear
      );

      if (exists) {
        // Show modal if an active calculation exists
        setShfaqMesazhin(true);
        setTipiMesazhit("danger");
        setPershkrimiMesazhit("Një kalkulim është aktiv për këtë vit!");
      } else {
        // Proceed with the registration if no active calculation
        const response = await axios.post(
          "https://localhost:7285/api/Faturat/ruajKalkulimin",
          {
            dataRegjistrimit: dataEFatures,
            stafiID: teDhenat.perdoruesi.userID,
            totaliPaTVSH: 0,
            tvsh: 0,
            idPartneri: 1,
            statusiPageses: "E Paguar",
            llojiPageses: "Cash",
            nrFatures: "1/" + selectedYear,
            nrRendorFatures: nrRendorKalkulimit + 1,
            llojiKalkulimit: "KLFV",
          },
          authentikimi
        );

        if (response.status === 200 || response.status === 201) {
          console.log("Kalkulimi u regjistrua me sukses!");
          setPerditeso(Date.now());
          setIdKalkulimitEdit(response.data.idRegjistrimit);
          setRegjistroKalkulimin(true);
          setNrFatures("");
          setDataEFatures(initialDate);
          setLlojiIPageses("Cash");
          setStatusiIPageses("E Paguar");
          setTotPaTVSH("0.00");
          setTVSH("0.00");
        } else {
          console.log("Gabim në regjistrim");
          setPerditeso(Date.now());
        }
      }
    } catch (error) {
      console.error("Gabim:", error);
    }
  }

  function mbyllKalkulimin() {
    try {
      axios
        .put(
          `https://localhost:7285/api/Faturat/ruajKalkulimin/perditesoStatusinKalkulimit?id=${idKalkulimitEdit}&statusi=true`,
          {},
          authentikimi
        )
        .then(async () => {
          setRegjistroKalkulimin(false);
          var r = await axios.get(
            `https://localhost:7285/api/Faturat/shfaqRegjistrimetNgaID?id=${idKalkulimitEdit}`,
            authentikimi
          );
          if (r.data.regjistrimet.llojiPageses !== "Borxh") {
            await axios.post(
              "https://localhost:7285/api/Faturat/ruajKalkulimin",
              {
                dataRegjistrimit: r.data.regjistrimet.dataRegjistrimit,
                stafiID: r.data.regjistrimet.stafiID,
                totaliPaTVSH: parseFloat(
                  r.data.regjistrimet.totaliPaTVSH +
                    r.data.regjistrimet.tvsh -
                    r.data.rabati
                ),
                tvsh: 0,
                idPartneri: r.data.regjistrimet.idPartneri,
                statusiPageses: "E Paguar",
                llojiPageses: r.data.regjistrimet.llojiPageses,
                nrFatures: "PAGES-" + r.data.regjistrimet.nrFatures,
                llojiKalkulimit: "PAGES",
                pershkrimShtese:
                  "Pagese per Faturen: " + r.data.regjistrimet.nrFatures,
                nrRendorFatures: r.data.regjistrimet.nrRendorFatures + 1,
                idBonusKartela: null,
                statusiKalkulimit: "true",
              },
              authentikimi
            );
          }
        });
    } catch (error) {
      console.error(error);
    }
  }

  function ndryshoStatusin(shfaq) {
    if (shfaq === true) {
      setEdito(true);
    } else {
      setEdito(false);
    }
    setPerditeso(Date.now());
  }

  const mbyllTeDhenat = () => {
    setMbyllFaturen(true);
    setShfaqTeDhenat(false);
  };

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
        "https://localhost:7285/api/Partneri/shfaqPartneretFurntiore",
        authentikimi
      )
      .then((response) => {
        const fetchedoptions = response.data
          .filter((item) => item.idPartneri !== 2 && item.idPartneri !== 3)
          .map((item) => ({
            value: item.idPartneri,
            label: item.emriBiznesit,
          }));

        setOptions(fetchedoptions);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);
  const handleChange = async (partneri) => {
    setPartneri(partneri.value);
    setOptionsSelected(partneri);

    document.getElementById("nrFatures").focus();
  };

  const handleMenaxhoTastetPagesa = (event) => {
    if (event.key === "Enter") {
      handleRegjistroKalkulimin();
    }
  };

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Kalkulant"]} />
      <NavBar />
      <div className="containerDashboardP" style={{ width: "90%" }}>
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}
        {shfaqTeDhenat && (
          <TeDhenatKalkulimit setMbyllTeDhenat={mbyllTeDhenat} id={id} />
        )}
        {regjistroKalkulimin && (
          <RegjistroFaturen
            mbyllKalkulimin={mbyllKalkulimin}
            mbyllPerkohesisht={() => setRegjistroKalkulimin(false)}
            nrRendorKalkulimit={idKalkulimitEdit}
            setPerditeso={() => setPerditeso(Date.now())}
            idKalkulimitEdit={idKalkulimitEdit}
          />
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
          !regjistroKalkulimin &&
          !shfaqTeDhenat && (
            <>
              <h1 className="title">Kalkulimi Fillestar Vjetor</h1>

              <Container fluid>
                <Row>
                  <Col>
                    <Form>
                      <Form.Group controlId="idDheEmri">
                        <Form.Label>Nr. Rendor i Kalkulimit</Form.Label>
                        <Form.Control
                          id="nrRendorKalkulimit"
                          type="number"
                          value={
                            nrRendorKalkulimit ? nrRendorKalkulimit + 1 : 1
                          }
                          disabled
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Kalkulimi Vlen per Vitin</Form.Label>
                        <Form.Control
                          id="nrFatures"
                          type="text"
                          disabled
                          value={dataEFatures ? dataEFatures.split("-")[0] : ""}
                        />
                      </Form.Group>
                    </Form>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Data e Fatures</Form.Label>
                      <Form.Control
                        id="dataEFatures"
                        type="date"
                        min={`${new Date().getFullYear()}-01-01`}
                        max={new Date().toISOString().split("T")[0]}
                        value={dataEFatures}
                        onChange={(e) => {
                          setDataEFatures(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          ndrroField(e, "llojiIPageses");
                        }}
                      />
                    </Form.Group>
                    <br />
                    <Button
                      className="mb-3 Butoni"
                      onClick={() => handleRegjistroKalkulimin()}>
                      Regjistro <FontAwesomeIcon icon={faPlus} />
                    </Button>
                  </Col>
                </Row>
                <div className="mt-2">
                  <Tabela
                    data={kalkulimet}
                    tableName="Lista e Kalkulimeve"
                    kaButona={true}
                    funksionShfaqFature={(e) => handleShfaqTeDhenat(e)}
                    funksionButonEdit={(e) => {
                      setIdKalkulimitEdit(e);
                      setNrRendorKalkulimit(e);
                      setRegjistroKalkulimin(true);
                    }}
                    dateField="Data e Fatures" // The field in your data that contains the date values
                    kontrolloStatusin
                    mosShfaqID={true}
                  />
                </div>
              </Container>
            </>
          )
        )}
      </div>
    </>
  );
}

export default KalkulimiFillestarVjetor;
