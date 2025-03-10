import { useEffect, useState } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { Form, Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import Select from "react-select";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";

function ShtoPagesat(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [produktiID, setproduktiID] = useState(0);
  const [kartelaEProduktit, setKartelaEProduktit] = useState([]);
  const [kartelaEProduktitDetaje, setKartelaEProduktitDetaje] = useState([]);
  const [produktet, setProduktet] = useState([]);

  const [teDhenat, setTeDhenat] = useState([]);

  const [pershkrimiPageses, setPershkrimiPageses] = useState("");
  const [shumaPageses, setShumaPageses] = useState(0);
  const [llojiIPageses, setLlojiIPageses] = useState("Cash");
  const [lloji, setLloji] = useState("PAGES");

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
    const vendosProduktet = async () => {
      try {
        const produktet = await axios.get(
          `${API_BASE_URL}/api/Partneri/shfaqPartneret`,
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
    const kartelaEProduktit = async () => {
      try {
        setLoading(true); // Show loading indicator
        const response = await axios.get(
          `${API_BASE_URL}/api/Partneri/KartelaFinanciare?id=${produktiID}`,
          authentikimi
        );

        const kalkulimet = response.data.kalkulimet || [];
        let saldo = 0;

        const formattedData = kalkulimet.map((p, index) => {
          // Calculate price with discounts
          const qmimiMeTVSHRab = parseFloat(
            p.qmimiShites -
              p.qmimiShites * (p.rabati1 / 100) -
              (p.qmimiShites - p.qmimiShites * (p.rabati1 / 100)) *
                (p.rabati2 / 100) -
              (p.qmimiShites -
                p.qmimiShites * (p.rabati1 / 100) -
                (p.qmimiShites - p.qmimiShites * (p.rabati1 / 100)) *
                  (p.rabati2 / 100)) *
                (p.rabati3 / 100)
          ).toFixed(3);

          const shumaTotale = parseFloat(
            qmimiMeTVSHRab * p.sasiaStokut
          ).toFixed(3);

          let faturimValue = 0;
          const vlera =
            p.totaliPaTVSH + p.tvsh - p.rabati < 0
              ? (p.totaliPaTVSH + p.tvsh - p.rabati) * -1
              : p.totaliPaTVSH + p.tvsh - p.rabati;

          if (["FAT", "AS", "KMB", "PARAGON", "FATURIM"].includes(p.llojiKalkulimit)) {
            faturimValue = parseFloat(vlera).toFixed(2);
            saldo += parseFloat(faturimValue);
          } else if (
            ["HYRJE", "FL", "KMSH", "PAGES"].includes(p.llojiKalkulimit)
          ) {
            faturimValue = parseFloat(vlera).toFixed(2);
            saldo -= parseFloat(faturimValue);
          }

          return {
            "NR.": index + 1,
            "Data Fat.": new Date(p.dataRegjistrimit).toLocaleDateString(
              "en-GB",
              { dateStyle: "short" }
            ),
            "Lloji Fat.": p.llojiKalkulimit,
            "Nr. Fat": p.nrRendorFatures,
            Pershkrimi: p.pershkrimShtese,
            "Faturim €": ["FAT", "AS", "KMB", "PARAGON", "FATURIM"].includes(
              p.llojiKalkulimit
            )
              ? faturimValue
              : "-",
            "Pagese €": ["HYRJE", "FL", "KMSH", "PAGES"].includes(
              p.llojiKalkulimit
            )
              ? faturimValue
              : "-",
            "Saldo €": (saldo * -1).toFixed(2),
          };
        });

        setKartelaEProduktit(response.data);
        setKartelaEProduktitDetaje(formattedData); // Set the formatted data to state
        setLoading(false); // Hide loading indicator
      } catch (err) {
        console.error("Error fetching kartela e produktit:", err);
        setLoading(false);
      }
    };

    kartelaEProduktit();
  }, [perditeso, produktiID]);

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
            stafiID: teDhenat.perdoruesi.userID,
            totaliPaTVSH: shumaPageses,
            idPartneri: produktiID,
            llojiPageses: llojiIPageses,
            pershkrimShtese: pershkrimiPageses,
            llojiKalkulimit: lloji,
            statusiKalkulimit: "true",
          },
          authentikimi
        )
        .then((response) => {
          if (response.status === 200 || response.status === 201) {
            setPerditeso(Date.now());
            setPershkrimiPageses("");
            setShumaPageses(0);
            setLlojiIPageses("Cash");
          } else {
            console.log("gabim");
            setPerditeso(Date.now());
          }
        });
    } catch (error) {
      console.error(error);
    }
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
      .get(`${API_BASE_URL}/api/Partneri/shfaqPartneret`, authentikimi)
      .then((response) => {
        const fetchedoptions = response.data.map((item) => ({
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
    setproduktiID(partneri.value);
    setOptionsSelected(partneri);
    document.getElementById("pershkrimiPageses").focus();
  };

  const handleMenaxhoTastet = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleRegjistroKalkulimin();
    }
  };

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Financa"]} />
      <NavBar />

      <div className="containerDashboardP">
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
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
          <div className="kartela">
            <h1 className="title">Pagesat e Fatures</h1>

            <Container fluid>
              <Row>
                <Col>
                  <h3>Te dhenat e Partnerit</h3>
                  <Form>
                    <Form.Group controlId="idDheEmri">
                      <Form.Label>Partneri</Form.Label>
                      <Select
                        value={optionsSelected}
                        onChange={handleChange}
                        options={options}
                        id="produktiSelect" // Setting the id attribute
                        inputId="produktiSelect-input" // Setting the input id attribute
                        styles={customStyles}
                      />
                    </Form.Group>
                  </Form>
                  <br />
                  <p>
                    <strong>Totali Hyres :</strong>{" "}
                    {parseFloat(
                      kartelaEProduktit && kartelaEProduktit?.totaliHyrese
                    ).toFixed(2) ?? parseFloat(0).toFixed(2)}{" "}
                    €
                  </p>
                  <p>
                    <strong>Totali Dales :</strong>{" "}
                    {parseFloat(
                      kartelaEProduktit && kartelaEProduktit?.totaliDalese
                    ).toFixed(2) ?? parseFloat(0).toFixed(2)}{" "}
                    €
                  </p>
                  <p>
                    <strong>Saldo :</strong>{" "}
                    {parseFloat(
                      (kartelaEProduktit && kartelaEProduktit?.totaliDalese) -
                        (kartelaEProduktit && kartelaEProduktit?.totaliHyrese)
                    ).toFixed(2) ?? parseFloat(0).toFixed(2)}{" "}
                    €
                  </p>
                </Col>
                <Col>
                  <h3>Pagesa</h3>
                  <Form.Group>
                    <Form.Label>Pershkrimi Pageses</Form.Label>
                    <Form.Control
                      id="pershkrimiPageses"
                      type="text"
                      value={pershkrimiPageses}
                      onChange={(e) => {
                        setPershkrimiPageses(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        ndrroField(e, "lloji");
                      }}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Lloji</Form.Label>
                    <select
                      id="lloji"
                      placeholder="Lloji"
                      className="form-select"
                      value={lloji ? lloji : ""}
                      onChange={(e) => {
                        setLloji(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        ndrroField(e, "llojiIPageses");
                      }}>
                      <option defaultValue value={0} key={0} disabled>
                        Zgjedhni Llojin
                      </option>
                      <option key={1} value="PAGES">
                        Pages
                      </option>
                      <option key={2} value="FATURIM">
                        Faturim
                      </option>
                    </select>
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
                      }}
                      onKeyDown={(e) => {
                        ndrroField(e, "shumaPageses");
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

                  <Form.Group>
                    <Form.Label>Shuma Pageses</Form.Label>
                    <Form.Control
                      id="shumaPageses"
                      type="number"
                      value={shumaPageses}
                      onChange={(e) => {
                        setShumaPageses(e.target.value);
                      }}
                      onKeyDown={handleMenaxhoTastet}
                    />
                  </Form.Group>
                  <br />
                </Col>
                <Col>
                  <Row>
                    <h3>Funksione</h3>
                    <hr />
                    <Col
                      style={{
                        display: "flex",
                        justifyContent: "left",
                      }}>
                      <Link to="/TabelaEPartnereve">
                        <Button className="mb-3 Butoni">Partneret</Button>
                      </Link>

                      <Button
                        className="mb-3 Butoni"
                        onClick={() => handleRegjistroKalkulimin()}>
                        Regjistro <FontAwesomeIcon icon={faPlus} />
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <hr />
              <div className="mt-2">
                <Tabela
                  data={kartelaEProduktitDetaje}
                  tableName={"Kartela Financiare per " + optionsSelected?.label}
                  dateField="Data Fat." // The field in your data that contains the date values
                  kontrolloStatusin
                  mosShfaqID={true}
                />
              </div>
            </Container>
          </div>
        )}
      </div>
    </>
  );
}

export default ShtoPagesat;
