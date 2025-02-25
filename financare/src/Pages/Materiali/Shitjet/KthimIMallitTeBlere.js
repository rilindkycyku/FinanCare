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
import RegjistroFaturen from "../../../Components/Materiali/Shitjet/KthimIMallitTeBlere//RegjistroFaturen";
import PerditesoStatusinKalk from "../../../Components/Materiali/Shitjet/KthimIMallitTeBlere/PerditesoStatusinKalk";
import TeDhenatKalkulimit from "../../../Components/Materiali/Shitjet/KthimIMallitTeBlere/TeDhenatKalkulimit";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import Select from "react-select";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";

function KthimIMallitTeBlere(props) {
  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [partneret, setPartneret] = useState([]);

  const [nrRendorKalkulimit, setNrRendorKalkulimit] = useState(0);
  const [pershkrimShtese, setPershkrimShtese] = useState("");
  const [Partneri, setPartneri] = useState(0);
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

  const [statusiIPagesesValue, setStatusiIPagesesValue] = useState("Borxh");

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
        const kthimet = kalkulimi.data.filter(
          (item) => item.llojiKalkulimit === "KMB"
        );
        setKalkulimet(
          kthimet.map((k) => ({
            ID: k.idRegjistrimit,
            "Nr. Kthimit": k.nrRendorFatures,
            Partneri: k.emriBiznesit,
            "Pershkrimi Shtese": k.pershkrimShtese,
            "Data e Fatures": new Date(k.dataRegjistrimit).toISOString(),
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
          `https://localhost:7285/api/Faturat/getNumriFaturesMeRradhe?llojiKalkulimit=KMB`,
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
      await axios
        .post(
          "https://localhost:7285/api/Faturat/ruajKalkulimin",
          {
            dataRegjistrimit: dataEFatures,
            stafiID: teDhenat.perdoruesi.userID,
            totaliPaTVSH: totPaTVSH,
            tvsh: TVSH,
            idpartneri: Partneri,
            statusiPageses: statusiIPageses,
            llojiPageses: llojiIPageses,
            nrFatures: parseInt(nrRendorKalkulimit + 1).toString(),
            llojiKalkulimit: "KMB",
            pershkrimShtese: pershkrimShtese,
            nrRendorFatures: nrRendorKalkulimit + 1,
            idBonusKartela: null,
          },
          authentikimi
        )
        .then((response) => {
          if (response.status === 200 || response.status === 201) {
            setPerditeso(Date.now());
            setIdKalkulimitEdit(response.data.idRegjistrimit);
            setRegjistroKalkulimin(true);
          } else {
            console.log("gabim");
            setPerditeso(Date.now());
          }
        });
    } catch (error) {
      console.error(error);
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
        .then(() => {
          setRegjistroKalkulimin(false);
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

  useEffect(() => {
    if (llojiIPageses === "Borxh") {
      setStatusiIPagesesValue("Borxh");
    } else {
      setStatusiIPagesesValue(statusiIPageses ? statusiIPageses : 0);
    }
  }, [llojiIPageses, statusiIPageses]);

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
  };

  const handleMenaxhoTastetPagesa = (event) => {
    if (event.key === "Enter") {
      handleRegjistroKalkulimin();
    }
  };

  return (
    <>
      <KontrolloAksesinNeFaqe
        roletELejuara={["Menaxher", "Kalkulant"]}
      />
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
        {edito && (
          <PerditesoStatusinKalk
            show={() => ndryshoStatusin(true)}
            hide={() => ndryshoStatusin(false)}
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
              <h1 className="title">Kthimi i Mallit te Blere</h1>

              <Container fluid>
                <Row>
                  <Col>
                    <Form.Group controlId="idDheEmri">
                      <Form.Group>
                        <Form.Label>Nr. Rendor i Kthimit</Form.Label>
                        <Form.Control
                          id="nrRendorKalkulimit"
                          type="number"
                          value={
                            nrRendorKalkulimit ? nrRendorKalkulimit + 1 : 1
                          }
                          disabled
                        />
                      </Form.Group>
                    </Form.Group>
                    <Form.Group controlId="idDheEmri">
                      <Form.Label>Partneri</Form.Label>
                      <Select
                        value={optionsSelected}
                        onChange={handleChange}
                        options={options}
                        id="produktiSelect" // Setting the id attribute
                        inputId="produktiSelect-input" // Setting the input id attribute
                        isDisabled={edito}
                        styles={customStyles}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="pershkrimShtese">
                      <Form.Group>
                        <Form.Label>Pershkrim Shtese</Form.Label>
                        <Form.Control
                          id="pershkrimShtese"
                          type="text"
                          value={pershkrimShtese}
                          onChange={(e) => {
                            setPershkrimShtese(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            ndrroField(e, "dataEFatures");
                          }}
                        />
                      </Form.Group>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Data e Kthimit te Mallit</Form.Label>
                      <Form.Control
                        id="dataEFatures"
                        type="date"
                        value={dataEFatures}
                        onChange={(e) => {
                          setDataEFatures(e.target.value);
                        }}
                        onKeyDown={handleMenaxhoTastetPagesa}
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
                    tableName="Lista e Kthimeve te Mallit te Blere"
                    kaButona={true}
                    funksionShfaqFature={(e) => handleShfaqTeDhenat(e)}
                    funksionNdryshoStatusinEFatures={() => setEdito(true)}
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

export default KthimIMallitTeBlere;
