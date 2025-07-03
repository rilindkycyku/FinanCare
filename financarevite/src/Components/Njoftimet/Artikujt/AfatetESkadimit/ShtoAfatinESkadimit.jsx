import { useState } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";
import { useEffect } from "react";

import Select from "react-select";
function ShtoAfatinESkadimit(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [dataSkadimit, setDataSkadimit] = useState("");

  const [perditeso, setPerditeso] = useState("");
  const [njesiteMatese, setNjesiteMatese] = useState([]);
  const [kontrolloNjesineMatese, setKontrolloNjesineMatese] = useState(false);
  const [konfirmoNjesineMatese, setKonfirmoNjesineMatese] = useState(false);
  const [fushatEZbrazura, setFushatEZbrazura] = useState(false);

  const [teDhenat, setTeDhenat] = useState([]);

  const getToken = localStorage.getItem("token");

  const getID = localStorage.getItem("id");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  function isNullOrEmpty(value) {
    return value === null || value === "" || value === undefined;
  }

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

  function handleSubmit() {
    axios
      .post(
        `${API_BASE_URL}/api/Njoftimet/shtoAfatetESkadimit`,
        {
          dataSkadimit: dataSkadimit,
          stafiID: teDhenat.perdoruesi.userID,
          idProduktit: optionsSelected.value,
        },
        authentikimi
      )
      .then((response) => {
        props.setTipiMesazhit("success");
        props.setPershkrimiMesazhit("Afati i Skadimit u insertua me sukses!");
        props.perditesoTeDhenat();
        props.largo();
        props.shfaqmesazhin();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handleKontrolli = () => {
    if (isNullOrEmpty(dataSkadimit) || isNullOrEmpty(optionsSelected)) {
      setFushatEZbrazura(true);
    } else {
      handleSubmit();
    }
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
      .get(`${API_BASE_URL}/api/Produkti/Products`, authentikimi)
      .then((response) => {
        console.log(response);
        const fetchedoptions = response.data.map((item) => ({
          value: item.produktiID,
          label: item.emriProduktit,
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
    const element = document.getElementById("dataSkadimit");
    element.focus();
  };

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={[
          "Menaxher",
          "Puntor i Thjeshte",
          "Pergjegjes i Porosive",
        ]}
        largo={() => props.largo()}
        shfaqmesazhin={() => props.shfaqmesazhin()}
        perditesoTeDhenat={() => props.perditesoTeDhenat()}
        setTipiMesazhit={(e) => props.setTipiMesazhit(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit(e)}
      />
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
      <Modal
        className="modalEditShto"
        show={props.shfaq}
        onHide={() => props.largo()}>
        <Modal.Header closeButton>
          <Modal.Title>Shto Kategorine</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="idDheEmri">
              <Form.Label>Produkti<span style={{ color: "red" }}>*</span></Form.Label>
              <Select
                value={optionsSelected}
                onChange={handleChange}
                options={options}
                id="produktiSelect" // Setting the id attribute
                inputId="produktiSelect-input" // Setting the input id attribute
                styles={customStyles}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="dataSkadimit">
              <Form.Label>Afati i Skadimit<span style={{ color: "red" }}>*</span></Form.Label>
              <Form.Control
                onChange={(e) => setDataSkadimit(e.target.value)}
                onFocus={(e) => e.target.select()}
                value={dataSkadimit}
                type="date"
                min={new Date().toISOString().substring(0, 10)}
                onInput={(e) => {
                  const minDate = new Date().toISOString().substring(0, 10); // get today's date
                  if (e.target.value < minDate) {
                    e.target.value = minDate; // set the date input value to today
                  }
                }}
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => props.largo()}>
            Anulo <FontAwesomeIcon icon={faXmark} />
          </Button>
          <Button className="Butoni" onClick={handleKontrolli}>
            Shto Njesine Matese <FontAwesomeIcon icon={faPlus} />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ShtoAfatinESkadimit;
