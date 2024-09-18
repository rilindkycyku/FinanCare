import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Col, Button, Form, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { MDBRow, MDBCol, MDBInput, MDBTooltip } from "mdb-react-ui-kit";
import useKeyboardNavigation from "../../../../Context/useKeyboardNavigation";
import Select from "react-select";

function EditoProduktin(props) {
  const [produkti, setProdukti] = useState([]);

  const [perditeso, setPerditeso] = useState("");
  const [produktet, setProduktet] = useState([]);
  const [grupetEProduktev, setGrupetEProduktev] = useState([]);
  const [partneret, setPartneret] = useState([]);
  const [njesitMatese, setNjesitMatese] = useState([]);
  const [kontrolloProduktin, setKontrolloProduktin] = useState(false);
  const [konfirmoProduktin, setKonfirmoProduktin] = useState(false);
  const [fushatEZbrazura, setFushatEZbrazura] = useState(false);

  const [inputGrupiProduktit, setInputGrupiProduktit] = useState("");
  const [inputPartneri, setInputPartneri] = useState("");
  const [inputNjesiaMatese, setInputNjesiaMatese] = useState("");
  const [filtrimiGrupiProduktit, setFiltrimiGrupiProduktit] =
    useState(produktet);
  const [filtrimiPartneri, setFiltrimiPartneri] = useState(partneret);
  const [filtrimiNjesiaMatese, setFiltrimiNjesiaMatese] =
    useState(njesitMatese);

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const vendosTeDhenat = async () => {
      try {
        const produktet = await axios.get(
          `https://localhost:7285/api/Produkti/Products`,
          authentikimi
        );
        setProduktet(produktet.data);
      } catch (err) {
        console.log(err);
      }
    };

    vendosTeDhenat();
  }, [perditeso]);

  const [optionsGrupiProduktit, setOptionsGrupiProduktit] = useState([]);
  const [optionsSelectedGrupiProduktit, setOptionsSelectedGrupiProduktit] =
    useState(null);
  const [optionsPartneri, setOptionsPartneri] = useState([]);
  const [optionsSelectedPartneri, setOptionsSelectedPartneri] = useState(null);
  const [optionsNjesiaMatese, setOptionsNjesiaMatese] = useState([]);
  const [optionsSelectedNjesiaMatese, setOptionsSelectedNjesiaMatese] =
    useState(null);
  const [optionsLlojiTVSH, setOptionsLlojiTVSH] = useState([]);
  const [optionsSelectedLlojiTVSH, setOptionsSelectedLlojiTVSH] =
    useState(null);
  const customStyles = {
    menu: (provided) => ({
      ...provided,
      zIndex: 1050, // Ensure this is higher than the z-index of the thead
    }),
  };
  useEffect(() => {
    axios
      .get(
        "https://localhost:7285/api/GrupiProduktit/shfaqGrupetEProduktit",
        authentikimi
      )
      .then((response) => {
        console.log(response);
        const fetchedoptions = response.data.map((item) => ({
          value: item.idGrupiProduktit,
          label: item.grupiIProduktit,
        }));
        setOptionsGrupiProduktit(fetchedoptions);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
    axios
      .get(
        "https://localhost:7285/api/Partneri/shfaqPartneretFurntiore",
        authentikimi
      )
      .then((response) => {
        console.log(response);
        const fetchedoptions = response.data.map((item) => ({
          value: item.idPartneri,
          label: item.emriBiznesit,
        }));
        setOptionsPartneri(fetchedoptions);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
    axios
      .get(
        "https://localhost:7285/api/NjesiaMatese/shfaqNjesiteMatese",
        authentikimi
      )
      .then((response) => {
        console.log(response);
        const fetchedoptions = response.data.map((item) => ({
          value: item.idNjesiaMatese,
          label: item.njesiaMatese,
        }));
        setOptionsNjesiaMatese(fetchedoptions);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
    setOptionsLlojiTVSH([
      { label: "0%", value: "0" },
      { label: "8%", value: "8" },
      { label: "18%", value: "18" },
    ]);
  }, []);

  useEffect(() => {
    const shfaqProduktin = async () => {
      try {
        const produkti = await axios.get(
          `https://localhost:7285/api/Produkti/ShfaqProduktinNgaID?id=${props.id}`,
          authentikimi
        );
        setProdukti(produkti.data);
        console.log(produkti);
        setOptionsSelectedGrupiProduktit(
          optionsGrupiProduktit.filter(
            (item) => item.value == produkti?.data?.idGrupiProduktit
          )
        );
        setOptionsSelectedNjesiaMatese(
          optionsNjesiaMatese.filter(
            (item) => item.value == produkti?.data?.idNjesiaMatese
          )
        );
        setOptionsSelectedPartneri(
          optionsPartneri.filter(
            (item) => item.value == produkti?.data?.idPartneri
          )
        );
        setOptionsSelectedLlojiTVSH(
          optionsLlojiTVSH.filter(
            (item) => item.value == produkti?.data?.llojiTVSH
          )
        );
      } catch (err) {
        console.log(err);
      }
    };

    shfaqProduktin();
  }, [
    optionsLlojiTVSH,
    optionsPartneri,
    optionsNjesiaMatese,
    optionsGrupiProduktit,
  ]);

  const onChange = (e) => {
    setProdukti({ ...produkti, [e.target.name]: e.target.value });
  };

  function isNullOrEmpty(value) {
    return value === null || value === "" || value === undefined;
  }

  async function handleSubmit() {
    try {
      console.log(produkti);
      await axios
        .put(
          `https://localhost:7285/api/Produkti/` + props.id,
          produkti,
          authentikimi
        )
        .then((x) => {
          props.setTipiMesazhit("success");
          props.setPershkrimiMesazhit("Produkti u Perditesua me sukses!");
          props.perditesoTeDhenat();
          props.hide();
          props.shfaqmesazhin();
        })
        .catch((error) => {
          console.error("Error saving the product:", error);
          props.setTipiMesazhit("danger");
          props.setPershkrimiMesazhit(
            "Ndodhi nje gabim gjate perditesimit te produktit!"
          );
          props.perditesoTeDhenat();
          props.shfaqmesazhin();
        });
    } catch (error) {
      console.error(error);
    }
  }

  const handleKontrolli = () => {
    if (isNullOrEmpty(produkti.emriProduktit)) {
      setFushatEZbrazura(true);
    } else {
      if (
        konfirmoProduktin == false &&
        produktet.filter(
          (item) => item.emriProduktit === produkti.emriProduktit
        ).length !== 0
      ) {
        setKontrolloProduktin(true);
      } else {
        handleSubmit();
      }
    }
  };

  const ndrroField = (e, tjetra) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(tjetra).focus();
    }
  };

  const handleChangeGrupiProduktit = async (partneri) => {
    setOptionsSelectedGrupiProduktit(partneri);
    setProdukti({ ...produkti, idGrupiProduktit: partneri.value });
    document.getElementById("partneriSelect-input").focus();
  };
  const handleChangePartneri = async (partneri) => {
    setOptionsSelectedPartneri(partneri);

    await axios
      .get(
        `https://localhost:7285/api/Produkti/GetKodiProduktitPerRegjistrim?idPartneri=${partneri.value}`,
        authentikimi
      )
      .then((response) => {
        setProdukti({
          ...produkti,
          idPartneri: partneri.value,
          kodiProduktit: response.data,
        });
      });

    document.getElementById("njesiaMateseSelect-input").focus();
  };
  const handleChangeNjesiaMatese = async (partneri) => {
    setOptionsSelectedNjesiaMatese(partneri);
    setProdukti({ ...produkti, idNjesiaMatese: partneri.value });
    document.getElementById("llojiTVSHSelect-input").focus();
  };
  const handleChangeLlojiTVSH = async (partneri) => {
    setOptionsSelectedLlojiTVSH(partneri);
    setProdukti({ ...produkti, llojiTVSH: partneri.value });
    document.getElementById("sasiaShumices").focus();
  };

  return (
    <>
      {fushatEZbrazura && (
        <Modal
          size="sm"
          show={fushatEZbrazura}
          onHide={() => setFushatEZbrazura(false)}>
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "red" }} as="h6">
              Ndodhi nje gabim
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <strong style={{ fontSize: "10pt" }}>
              Ju lutemi plotesoni te gjitha fushat me{" "}
              <span style={{ color: "red" }}>*</span>
            </strong>
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="sm"
              onClick={() => setFushatEZbrazura(false)}
              variant="secondary">
              Mbylle <FontAwesomeIcon icon={faXmark} />
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      {kontrolloProduktin && (
        <Modal
          size="sm"
          show={kontrolloProduktin}
          onHide={() => setKontrolloProduktin(false)}>
          <Modal.Header closeButton>
            <Modal.Title as="h6">Konfirmo vendosjen</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <span style={{ fontSize: "10pt" }}>
              Nje produkt me te njejtin emer ekziston ne sistem!
            </span>
            <br />
            <strong style={{ fontSize: "10pt" }}>
              A jeni te sigurt qe deshironi te vazhdoni?
            </strong>
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setKontrolloProduktin(false)}>
              Korrigjo <FontAwesomeIcon icon={faXmark} />
            </Button>
            <Button
              size="sm"
              variant="warning"
              onClick={() => {
                handleSubmit();
              }}>
              Vazhdoni
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      <Modal
        className="modalEditShto"
        size="lg"
        style={{ marginTop: "3em" }}
        show={props.show}
        onHide={props.hide}>
        <Modal.Header closeButton>
          <Modal.Title>Edito Produktin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MDBRow className="g-3">
            <MDBCol md="6">
              <MDBInput
                onChange={onChange}
                value={produkti.barkodi}
                name="barkodi"
                id="barkodi"
                type="text"
                placeholder="Barkodi"
                autoFocus
                onKeyDown={(e) => ndrroField(e, "emriProduktit")}
                label={
                  <span>
                    Barkodi<span style={{ color: "red" }}>*</span>
                  </span>
                }
                autoComplete={false}
              />
            </MDBCol>
            <MDBCol md="6">
              <MDBInput
                onChange={onChange}
                value={produkti.emriProduktit}
                name="emriProduktit"
                id="emriProduktit"
                type="text"
                placeholder="Emri Produktit"
                onKeyDown={(e) => ndrroField(e, "grupiproduktit")}
                label={
                  <span>
                    Emri Produktit<span style={{ color: "red" }}>*</span>
                  </span>
                }
                autoComplete={false}
              />
            </MDBCol>
            <Form.Group as={Col} controlId="grupiProduktit" md="4">
              <Select
                value={optionsSelectedGrupiProduktit}
                onChange={handleChangeGrupiProduktit}
                options={optionsGrupiProduktit}
                id="grupiProduktitSelect" // Setting the id attribute
                inputId="grupiProduktitSelect-input" // Setting the input id attribute
                styles={customStyles}
              />

              <Form.Label>
                Grupi Produktit<span style={{ color: "red" }}>*</span>
              </Form.Label>
            </Form.Group>

            <Form.Group as={Col} controlId="partneri" md="4">
              <Select
                value={optionsSelectedPartneri}
                onChange={handleChangePartneri}
                options={optionsPartneri}
                id="partneriSelect" // Setting the id attribute
                inputId="partneriSelect-input" // Setting the input id attribute
                styles={customStyles}
              />

              <Form.Label>
                Partneri<span style={{ color: "red" }}>*</span>
              </Form.Label>
            </Form.Group>
            <Form.Group as={Col} controlId="njesiaMatese" md="4">
              <Select
                value={optionsSelectedNjesiaMatese}
                onChange={handleChangeNjesiaMatese}
                options={optionsNjesiaMatese}
                id="njesiaMateseSelect" // Setting the id attribute
                inputId="njesiaMateseSelect-input" // Setting the input id attribute
                styles={customStyles}
              />

              <Form.Label>
                Njesia Matese<span style={{ color: "red" }}>*</span>
              </Form.Label>
            </Form.Group>
            <Form.Group as={Col} controlId="partneri" md="4">
              <Select
                value={optionsSelectedLlojiTVSH}
                onChange={handleChangeLlojiTVSH}
                options={optionsLlojiTVSH}
                id="llojiTVSHSelect" // Setting the id attribute
                inputId="llojiTVSHSelect-input" // Setting the input id attribute
                styles={customStyles}
              />

              <Form.Label>
                TVSH %<span style={{ color: "red" }}>*</span>
              </Form.Label>
            </Form.Group>
            <MDBCol md="4">
              <MDBInput
                onChange={onChange}
                name="sasiaShumices"
                id="sasiaShumices"
                value={produkti.sasiaShumices}
                type="text"
                placeholder="Sasia e Shumices"
                label={
                  <span>
                    Sasia e Shumices<span style={{ color: "red" }}>*</span>
                  </span>
                }
                autoComplete={false}
              />
            </MDBCol>
            <MDBCol md="4" id="kodiProduktit">
              <MDBTooltip
                placement="bottom"
                title="Gjenerohet automatikisht pas zgjedhjes se partnerit"
                wrapperClass="mdb-tooltip mdb-tooltip-content">
                <MDBInput
                  onChange={onChange}
                  value={produkti.kodiProduktit}
                  name="kodiProduktit"
                  type="text"
                  placeholder="Kodi Produktit"
                  onKeyDown={(e) => ndrroField(e, "llojiTVSH")}
                  label={
                    <span>
                      Kodi Produktit<span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  disabled
                />
              </MDBTooltip>
            </MDBCol>
          </MDBRow>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.hide}>
            Anulo <FontAwesomeIcon icon={faXmark} />
          </Button>
          <Button
            style={{ backgroundColor: "#009879", border: "none" }}
            onClick={handleKontrolli}>
            Edito Produktin <FontAwesomeIcon icon={faPenToSquare} />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditoProduktin;
