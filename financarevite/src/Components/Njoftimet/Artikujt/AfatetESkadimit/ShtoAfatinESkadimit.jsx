import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";


import Select from "react-select";

import { darkSelectStyles } from "@/utils/darkSelectStyles";
import { useNavigate } from "react-router-dom";

function ShtoAfatinESkadimit(props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

    const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

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
        console.log(error.response.data);
      });
  }

  const handleKontrolli = () => {
    if (isNullOrEmpty(dataSkadimit) || isNullOrEmpty(optionsSelected)) {
      setFushatEZbrazura(true);
      return;
    }

    const selectedDate = new Date(dataSkadimit);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      props.setTipiMesazhit("danger");
      props.setPershkrimiMesazhit("Nuk mund të shtoni një afat skadimi në të kaluarën.");
      props.shfaqmesazhin();
      return;
    }

    handleSubmit();
  };

  const [options, setOptions] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
  const [loadingProdukteve, setLoadingProdukteve] = useState(true);

  useEffect(() => {
    let isMounted = true;
    axios
      .get(`${API_BASE_URL}/api/Produkti/Products`, authentikimi)
      .then((response) => {
        if (isMounted) {
          const fetchedoptions = response.data.map((item) => ({
            value: item.produktiID,
            label: item.emriProduktit + (item.barkodi ? ` - ${item.barkodi}` : "") + (item.kodiProduktit ? ` - ${item.kodiProduktit}` : ""),
            item: item,
          }));
          setOptions(fetchedoptions);
          setLoadingProdukteve(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        if (isMounted) setLoadingProdukteve(false);
      });
    return () => { isMounted = false; };
  }, []);

  const handleChange = async (partneri) => {
    setOptionsSelected(partneri);
    const element = document.getElementById("dataSkadimit");
    if (element) element.focus();
  };

  const [inputValue, setInputValue] = useState("");
  const handleInputChange = (val, { action }) => {
    if (action === "input-change") {
      setInputValue(val);
    } else if (action === "set-value" || action === "menu-close") {
      setInputValue("");
    }
  };

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
          <Modal.Title>Shto Afatin e Skadimit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="idDheEmri">
              <Form.Label>Produkti<span style={{ color: "red" }}>*</span></Form.Label>
              <Select
                value={optionsSelected}
                onChange={handleChange}
                options={filteredOptions}
                id="produktiSelect"
                inputId="produktiSelect-input"
                styles={darkSelectStyles}
                onInputChange={handleInputChange}
                inputValue={inputValue}
                isDisabled={loadingProdukteve}
                isLoading={loadingProdukteve}
                placeholder={
                  loadingProdukteve
                    ? "Duke ngarkuar produktet..."
                    : "Kërko produkt..."
                }
                noOptionsMessage={() =>
                  loadingProdukteve
                    ? "Duke ngarkuar..."
                    : inputValue.length < 2
                      ? "Shkruani të paktën 2 karaktere"
                      : "Nuk u gjet produkt"
                }
              />
              <div className="text-muted mt-1" style={{ fontSize: "9pt" }}>
                Këshillë: shkruani barkodin ose emrin e produktit.
              </div>
            </Form.Group>
            <Form.Group className="mb-3" controlId="dataSkadimit">
              <Form.Label>Afati i Skadimit<span style={{ color: "red" }}>*</span></Form.Label>
              <Form.Control
                onChange={(e) => setDataSkadimit(e.target.value)}
                onFocus={(e) => e.target.select()}
                value={dataSkadimit}
                type="date"
                min={new Date().toISOString().substring(0, 10)}
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
            Shto Afatin e Skadimit <FontAwesomeIcon icon={faPlus} />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ShtoAfatinESkadimit;
