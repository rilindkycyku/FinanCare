import { useEffect, useMemo, useState, useRef } from "react";
﻿import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { TailSpin } from "react-loader-spinner";
import { Table, Form, Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import Select from "react-select";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";

import { darkSelectStyles } from "@/utils/darkSelectStyles";

function KartelaEArtikullit(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const selectRef = useRef(null);
  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [produktiID, setproduktiID] = useState(0);
  const [kartelaEProduktit, setKartelaEProduktit] = useState([]);
  const [kalkulimetKartelaProduktit, setKalkulimetKartelaProduktit] = useState(
    []
  );
  const [produktet, setProduktet] = useState([]);

  const [teDhenat, setTeDhenat] = useState([]);

  const navigate = useNavigate();

  const getID = localStorage.getItem("id");

  const getToken = localStorage.getItem("token");

    const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

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
    const kartelaEProduktit = async () => {
      try {
        const kartela = await axios.get(
          `${API_BASE_URL}/api/Produkti/KartelaArtikullit?id=${produktiID}`,
          authentikimi
        );
        setKartelaEProduktit(kartela.data);
        setKalkulimetKartelaProduktit(
          kartela?.data?.kalkulimet?.map((p, index) => ({
            ID: p.id,
            "NR.": index + 1,
            "Data Fatures": new Date(p.dataRegjistrimit).toISOString(),
            "Lloji Fat.": p.llojiKalkulimit,
            "Nr. Fat.": p.nrRendorFatures,
            Partneri: p.emriBiznesit,
            "Sas. Hyrese":
              p.llojiKalkulimit === "HYRJE" ||
                p.llojiKalkulimit === "FL" ||
                p.llojiKalkulimit === "KMSH"
                ? p.sasiaStokut
                : "-",
            "Sas. Dalese":
              p.llojiKalkulimit === "FAT" ||
                p.llojiKalkulimit === "AS" ||
                p.llojiKalkulimit === "KMB" ||
                p.llojiKalkulimit === "PARAGON"
                ? p.sasiaStokut
                : "-",
            "Qmimi Hyres €":
              p.llojiKalkulimit === "HYRJE" ||
                p.llojiKalkulimit === "FL" ||
                p.llojiKalkulimit === "KMSH"
                ? parseFloat(p.qmimiBleres).toFixed(3)
                : "-",
            "Qmimi Dales €":
              p.llojiKalkulimit === "FAT" ||
                p.llojiKalkulimit === "AS" ||
                p.llojiKalkulimit === "KMB" ||
                p.llojiKalkulimit === "PARAGON"
                ? parseFloat(p.qmimiShites).toFixed(3)
                : "-",
            "R. 1 %": parseFloat(p.rabati1 ?? 0).toFixed(2),
            "R. 2 %": parseFloat(p.rabati2 ?? 0).toFixed(2),
            "R. 3 %": parseFloat(p.rabati3 ?? 0).toFixed(2),
          }))
        );
        console.log(kartela.data);
      } catch (err) {
        console.log(err);
      }
    };

    kartelaEProduktit();
  }, [perditeso, produktiID]);

  const [options, setOptions] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
    useEffect(() => {
    axios
      .get(
        `${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`,
        authentikimi
      )
      .then((response) => {
        const fetchedoptions = response.data.map((item) => ({
          value: item.produktiID,
          label: `${item.barkodi || "—"} · ${item.emriProduktit}`,
        }));
        setOptions(fetchedoptions);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);
  const handleChange = async (partneri) => {
    setOptionsSelected(partneri);
    setproduktiID(partneri.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      const currentInput = document.getElementById("produktiSelect-input")?.value || "";
      if (currentInput.trim().length > 0) {
        let lookupBarcode = currentInput.trim();
        if (lookupBarcode.startsWith("2") && lookupBarcode.length === 13) {
          const pluCode = lookupBarcode.substring(0, 7);
          const matched = options.find(opt => opt.label.includes(pluCode));
          if (matched) {
            lookupBarcode = pluCode;
          }
        }

        const matches = options.filter(opt => opt.label.toLowerCase().includes(lookupBarcode.toLowerCase()));
        if (matches.length === 0) {
          setTipiMesazhit("danger");
          setPershkrimiMesazhit(`Produkti me këtë barkod nuk u gjet! (${currentInput})`);
          setShfaqMesazhin(true);
          setInputValue("");
          setTimeout(() => selectRef.current?.focus(), 10);
        } else {
          event.preventDefault();
          handleChange(matches[0]);
        }
      }
    }
  };

  const [inputValue, setInputValue] = useState("");

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

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Kalkulant", "Faturist", "1 Euro Menaxher"]} />
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
              color="#10b981"
              ariaLabel="tail-spin-loading"
              radius="1"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
            />
          </div>
        ) : (
          <div className="kartela">
            <h1 className="title">Kartela e Artikullit</h1>

            <Container fluid>
              <Row>
                <Col>
                  <Form>
                    <Form.Group controlId="idDheEmri">
                      <Form.Label>Produkti</Form.Label>
                      <Select
                        ref={selectRef}
                        value={optionsSelected}
                        onChange={handleChange}
                        onInputChange={(val) => setInputValue(val)}
                        onKeyDown={handleKeyDown}
                        options={filteredOptions}
                        id="produktiSelect" // Setting the id attribute
                        inputId="produktiSelect-input" // Setting the input id attribute
                        styles={darkSelectStyles}
                        placeholder="Kërko produktin (min. 2 shkronja)..."
                        noOptionsMessage={() =>
                          inputValue.length < 2
                            ? "Shkruani të paktën 2 karaktere..."
                            : "Nuk u gjet asnjë produkt"
                        }
                      />
                    </Form.Group>
                  </Form>
                  <br />

                  <p>
                    <strong>Njesia Matese:</strong>{" "}
                    {(kartelaEProduktit &&
                      kartelaEProduktit?.produkti?.emriNjesiaMatese) ??
                      0}
                  </p>
                  <p>
                    <strong>Prodhuesi:</strong>{" "}
                    {(kartelaEProduktit &&
                      kartelaEProduktit?.produkti?.emriBiznesit) ??
                      0}
                  </p>
                </Col>
                <Col>
                  <p>
                    <strong>Sasia aktuale ne Stok:</strong>{" "}
                    {(kartelaEProduktit &&
                      kartelaEProduktit?.produkti?.sasiaNeStok) ??
                      0}{" "}
                    {(kartelaEProduktit &&
                      kartelaEProduktit?.produkti?.emriNjesiaMatese) ??
                      0}
                  </p>
                  <p>
                    <strong>Qmimi Shites me Pakic + TVSH:</strong>{" "}
                    {parseFloat(
                      (kartelaEProduktit &&
                        kartelaEProduktit?.produkti?.qmimiProduktit) ??
                      0
                    ).toFixed(2)}{" "}
                    €
                  </p>
                  <p>
                    <strong>Sasia e Shumice :</strong>{" "}
                    {(kartelaEProduktit &&
                      kartelaEProduktit?.produkti?.sasiaShumices) ??
                      0}
                  </p>
                  <p>
                    <strong>Qmimi Shites me Shumic + TVSH:</strong>{" "}
                    {parseFloat(
                      (kartelaEProduktit &&
                        kartelaEProduktit?.produkti?.qmimiMeShumic) ??
                      0
                    ).toFixed(2)}{" "}
                    €
                  </p>
                  <p>
                    <strong>Sasia Hyrese:</strong>{" "}
                    {(kartelaEProduktit && kartelaEProduktit?.totaliHyrese) ??
                      0}
                  </p>
                  <p>
                    <strong>Sasia Dalese:</strong>{" "}
                    {(kartelaEProduktit && kartelaEProduktit?.totaliDalese) ??
                      0}
                  </p>
                </Col>
                <Col>
                  <Row>
                    <h3>Zbritjet e Produktit</h3>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Data e Zbritjes</th>
                          <th>Data e Skadimit</th>
                          <th>Rabati %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kartelaEProduktit?.hisotriaZbritjes?.map((p) => (
                          <tr>
                            <td>
                              {new Date(p.dataZbritjes).toLocaleDateString(
                                "en-GB",
                                {
                                  dateStyle: "short",
                                }
                              )}
                            </td>
                            <td>
                              {new Date(p.dataSkadimit).toLocaleDateString(
                                "en-GB",
                                {
                                  dateStyle: "short",
                                }
                              )}
                            </td>
                            <td>{parseFloat(p.rabati).toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </Table>
                    <hr />
                    <Col
                      style={{
                        display: "flex",
                        justifyContent: "left",
                      }}>
                      <Link to="/Produktet">
                        <Button className="mb-3 Butoni">Produktet</Button>
                      </Link>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <hr />
              <div className="mt-2">
                <Tabela
                  data={kalkulimetKartelaProduktit}
                  tableName="Lista e Hyrje / Dalje per Artikullin"
                  dateField="Data Fatures" // The field in your data that contains the date values
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

export default KartelaEArtikullit;
