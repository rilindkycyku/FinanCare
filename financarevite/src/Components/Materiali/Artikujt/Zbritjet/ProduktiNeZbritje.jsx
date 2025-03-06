import { useState, useEffect } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import Mesazhi from "../../../TeTjera/layout/Mesazhi";
import Select from "react-select";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function ProduktiNeZbritje(props) {
  const [produkti, setProdukti] = useState("");
  const [qmimiBleresProduktit, setQmimiBleresProduktit] = useState(0.0);
  const [qmimiShitesProduktit, setQmimiShitesProduktit] = useState(0.0);
  const [rabati, setRabati] = useState(0.0);
  const [dataSkadimit, setDataSkadimit] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [produktet, setProduktet] = useState([]);
  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [zbritjaNeRregull, setZbritjaNeRregull] = useState(false);
  const [kaZbritje, setKaZbritje] = useState(false);

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const vendosProduktet = async () => {
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

    vendosProduktet();
  }, [perditeso]);

  const handleZbritja = (value) => {
    const element = document.getElementById("rabati");
    if (value <= 0.01) {
      setRabati(0.01);
      setZbritjaNeRregull(false);
      element.focus();
    } else if (value >= 100) {
      setRabati(value);
      setPershkrimiMesazhit("Rabati duhet te jete me i vogel se 100%!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
      setZbritjaNeRregull(false);
      setRabati(0);
      element.focus();
    } else {
      setRabati(value);
      setZbritjaNeRregull(true);
    }
  };

  function handleSubmit() {
    if (zbritjaNeRregull === true && kaZbritje === false) {
      axios
        .post(
          "https://localhost:7285/api/ZbritjaQmimitProduktit/shtoZbritjenProduktit",
          {
            produktiID: optionsSelected.value,
            rabati: rabati,
            dataSkadimit: dataSkadimit,
          },
          authentikimi
        )
        .then(() => {
          props.setTipiMesazhit("success");
          props.setPershkrimiMesazhit("Zbritja u shtua me sukses!");
          props.setPerditeso(Date.now());
          props.mbyllZbritjen();
          props.shfaqmesazhin();
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (kaZbritje === true) {
      setPershkrimiMesazhit("Ky produkt ka Zbritje!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      handleZbritja(rabati);
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
      .get("https://localhost:7285/api/Produkti/Products", authentikimi)
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
    setKaZbritje(false);
    setRabati(0);
    setOptionsSelected(partneri);
    setQmimiBleresProduktit(partneri.item.qmimiBleres.toFixed(2));
    setQmimiShitesProduktit(partneri.item.qmimiProduktit.toFixed(2));
    if (partneri.item.rabati != null) {
      setRabati(partneri.item.rabati);
      setKaZbritje(true);
      setPershkrimiMesazhit("Ky produkt ka Zbritje!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      const element = document.getElementById("dataSkadimit");
      element.focus();
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
      {shfaqMesazhin && (
        <Mesazhi
          setShfaqMesazhin={setShfaqMesazhin}
          pershkrimi={pershkrimiMesazhit}
          tipi={tipiMesazhit}
        />
      )}
      <Modal
        className="modalEditShto"
        show={props.shfaq}
        onHide={() => props.mbyllZbritjen()}
        size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Shto Zbritjen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="idDheEmri">
              <Form.Label>Vlen per</Form.Label>
              <Select
                value={optionsSelected}
                onChange={handleChange}
                options={options}
                id="produktiSelect" // Setting the id attribute
                inputId="produktiSelect-input" // Setting the input id attribute
                styles={customStyles}
              />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1">
              <Form.Label>Qmimi Bleres</Form.Label>
              <Form.Control
                value={qmimiBleresProduktit + " €"}
                type="text"
                placeholder="Qmimi Bleres"
                disabled
              />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1">
              <Form.Label>Qmimi Shites</Form.Label>
              <Form.Control
                value={qmimiShitesProduktit + " €"}
                type="text"
                placeholder="Qmimi Shites"
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="dataSkadimit">
              <Form.Label>Data e Perfundimit te Zbritjes</Form.Label>
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
                disabled={kaZbritje}
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="rabati">
              <Form.Label>Rabati</Form.Label>
              <Form.Control
                onChange={(e) => handleZbritja(e.target.value)}
                onFocus={(e) => e.target.select()}
                value={rabati}
                type="number"
                pattern="[0-9]+([,.][0-9]+)?"
                placeholder="Rabati"
                min={0.01}
                max={100}
                disabled={kaZbritje}
              />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1">
              <Form.Label>Qmimi Shites - Rabati</Form.Label>
              <Form.Control
                value={
                  parseFloat(
                    qmimiShitesProduktit - (rabati / 100) * qmimiShitesProduktit
                  ).toFixed(3) + " €"
                }
                type="text"
                placeholder="Qmimi Shites"
                disabled
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => props.mbyllZbritjen()}>
            Anulo <FontAwesomeIcon icon={faXmark} />
          </Button>
          <Button className="Butoni" onClick={handleSubmit}>
            Vendosni Zbritjen <FontAwesomeIcon icon={faPlus} />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ProduktiNeZbritje;
