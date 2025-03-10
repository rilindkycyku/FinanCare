import { useEffect, useState } from "react";
import "../../Styles/DizajniPergjithshem.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { Form, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import RegjistroFaturen from "../../../Components/Materiali/Hyrjet/KalkulimiIMallit/RegjistroFaturen";
import PerditesoStatusinKalk from "../../../Components/Materiali/Hyrjet/KalkulimiIMallit/PerditesoStatusinKalk";
import TeDhenatKalkulimit from "../../../Components/Materiali/Hyrjet/KalkulimiIMallit/TeDhenatKalkulimit";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import Select from "react-select";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";

function KalkulimiIMallit(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
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
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimet`,
          authentikimi
        );
        const kalkulimet = kalkulimi.data.filter(
          (item) => item.llojiKalkulimit === "HYRJE"
        );
        setKalkulimet(
          kalkulimet.map((k) => ({
            ID: k.idRegjistrimit,
            "Nr. Kalkulimit": k.nrRendorFatures,
            "Nr. Fatures": k.nrFatures,
            Partneri: k.emriBiznesit,
            "Totali Pa TVSH €": parseFloat(k.totaliPaTVSH).toFixed(2),
            "TVSH €": parseFloat(k.tvsh).toFixed(2),
            "Totali €": parseFloat(k.totaliPaTVSH + k.tvsh).toFixed(2),
            "Tot. nga Regjistrimi": k.pershkrimShtese,
            "Data e Fatures": new Date(k.dataRegjistrimit).toISOString(),
            "Statusi Pageses": k.statusiPageses,
            "Lloji Pageses": k.llojiPageses,
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
    const vendosPartnerin = async () => {
      try {
        const partneri = await axios.get(
          `${API_BASE_URL}/api/Partneri/shfaqPartneretFurntiore`,
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
          `${API_BASE_URL}/api/Faturat/getNumriFaturesMeRradhe?llojiKalkulimit=HYRJE`,
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
          `${API_BASE_URL}/api/Faturat/ruajKalkulimin`,
          {
            dataRegjistrimit: dataEFatures,
            stafiID: teDhenat.perdoruesi.userID,
            totaliPaTVSH: totPaTVSH,
            tvsh: TVSH,
            idPartneri: Partneri,
            statusiPageses: statusiIPageses,
            llojiPageses: llojiIPageses,
            nrFatures: nrFatures,
            nrRendorFatures: nrRendorKalkulimit + 1,
            llojiKalkulimit: "HYRJE",
          },
          authentikimi
        )
        .then((response) => {
          console.log(response);
          if (response.status === 200 || response.status === 201) {
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
          `${API_BASE_URL}/api/Faturat/ruajKalkulimin/perditesoStatusinKalkulimit?id=${idKalkulimitEdit}&statusi=true`,
          {},
          authentikimi
        )
        .then(async () => {
          setRegjistroKalkulimin(false);
          var r = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${idKalkulimitEdit}`,
            authentikimi
          );
          if (r.data.regjistrimet.llojiPageses !== "Borxh") {
            await axios.post(
              `${API_BASE_URL}/api/Faturat/ruajKalkulimin`,
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
        `${API_BASE_URL}/api/Partneri/shfaqPartneretFurntiore`,
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
              <h1 className="title">Kalkulimi i Mallit</h1>

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
                      <Form.Group>
                        <Form.Label>Nr. Fatures</Form.Label>
                        <Form.Control
                          id="nrFatures"
                          type="text"
                          value={nrFatures}
                          onChange={(e) => {
                            setNrFatures(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            ndrroField(e, "dataEFatures");
                          }}
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
                        value={dataEFatures}
                        onChange={(e) => {
                          setDataEFatures(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          ndrroField(e, "llojiIPageses");
                        }}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Lloji i Pageses</Form.Label>
                      <select
                        id="llojiIPageses"
                        placeholder="LlojiIPageses"
                        className="form-select"
                        value={llojiIPageses ? llojiIPageses : 0}
                        onChange={(e) => {
                          setLlojiIPageses(e.target.value);
                          if (e.target.value == "Borxh") {
                            setStatusiIPageses("Pa Paguar");
                          }
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
                        <option key={3} value="Borxh">
                          Borxh
                        </option>
                      </select>
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Statusi i Pageses</Form.Label>
                      <select
                        id="statusiIPageses"
                        placeholder="Statusi i Pageses"
                        className="form-select"
                        value={statusiIPageses}
                        onChange={(e) => {
                          setStatusiIPageses(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          ndrroField(e, "totPaTVSH");
                        }}
                        disabled={llojiIPageses === "Borxh" ? true : false}>
                        <option defaultValue value={0} key={0} disabled>
                          Zgjedhni Statusin e Pageses
                        </option>
                        <option key={1} value="E Paguar">
                          E Paguar
                        </option>
                        <option key={2} value="Pa Paguar">
                          Pa Paguar
                        </option>
                      </select>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <Form.Label>Totali Pa TVSH</Form.Label>
                      <Form.Control
                        id="totPaTVSH"
                        type="number"
                        value={totPaTVSH}
                        onChange={(e) => {
                          setTotPaTVSH(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          ndrroField(e, "TVSH");
                        }}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>TVSH</Form.Label>
                      <Form.Control
                        id="TVSH"
                        type="number"
                        value={TVSH}
                        onChange={(e) => {
                          setTVSH(e.target.value);
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
                    tableName="Lista e Kalkulimeve"
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

export default KalkulimiIMallit;
