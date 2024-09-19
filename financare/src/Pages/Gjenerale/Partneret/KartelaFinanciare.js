import { useEffect, useState } from "react";
import classes from "../../Styles/DizajniPergjithshem.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faXmark,
  faPenToSquare,
  faArrowLeft,
  faDownload,
  faClose,
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { Table, Form, Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import useKeyboardNavigation from "../../../Context/useKeyboardNavigation";
import { Helmet } from "react-helmet";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Select from "react-select";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import Titulli from "../../../Components/TeTjera/Titulli";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function KartelaFinanciare(props) {
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
    const vendosProduktet = async () => {
      try {
        const produktet = await axios.get(
          `https://localhost:7285/api/Partneri/shfaqPartneret`,
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
          `https://localhost:7285/api/Partneri/KartelaFinanciare?id=${produktiID}`,
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

          if (["FAT", "AS", "KMB", "PARAGON"].includes(p.llojiKalkulimit)) {
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
            "Faturim €": ["FAT", "AS", "KMB", "PARAGON"].includes(
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
      .get("https://localhost:7285/api/Partneri/shfaqPartneret", authentikimi)
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
  };

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Financa", "Mbeshtetje e Klientit"]} />
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
            <h1 className="title">Kartela Financiare</h1>

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
                    <strong>Shkurtesa:</strong>{" "}
                    {(kartelaEProduktit &&
                      kartelaEProduktit.partneri?.shkurtesaPartnerit) ??
                      ""}
                  </p>
                  <p>
                    <strong>Nr. Unik:</strong>{" "}
                    {(kartelaEProduktit && kartelaEProduktit.partneri?.nui) ??
                      0}
                  </p>
                  <p>
                    <strong>Lloji Partnerit:</strong>{" "}
                    {(kartelaEProduktit &&
                      kartelaEProduktit.partneri?.llojiPartnerit) ??
                      ""}
                  </p>
                </Col>
                <Col>
                  <h3>Te dhenat Ndihmese</h3>
                  <p>
                    <strong>Nr. TVSH:</strong>{" "}
                    {(kartelaEProduktit && kartelaEProduktit.partneri?.tvsh) ??
                      0}
                  </p>
                  <p>
                    <strong>Nr. Fiskal:</strong>{" "}
                    {(kartelaEProduktit && kartelaEProduktit.partneri?.nrf) ??
                      0}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {(kartelaEProduktit &&
                      kartelaEProduktit?.produkti?.email) ??
                      0}
                  </p>
                  <p>
                    <strong>Adresa:</strong>{" "}
                    {(kartelaEProduktit &&
                      kartelaEProduktit.partneri?.adresa) ??
                      ""}
                  </p>
                  <p>
                    <strong>Nr. Kontaktit:</strong>{" "}
                    {(kartelaEProduktit &&
                      kartelaEProduktit.partneri?.nrKontaktit) ??
                      0}
                  </p>
                </Col>
                <Col>
                  <Row>
                    <h3>Financat</h3>
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
                    <hr />
                    <Col
                      style={{
                        display: "flex",
                        justifyContent: "left",
                      }}>
                      <Link to="/TabelaEPartnereve">
                        <Button className="mb-3 Butoni">Partneret</Button>
                      </Link>
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

export default KartelaFinanciare;
