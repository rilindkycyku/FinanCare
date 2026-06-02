import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import Mesazhi from "../../../TeTjera/layout/Mesazhi";
import Select from "react-select";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";
import BarcodeScannerModal from "../../../TeTjera/BarcodeScannerModal";
import { Camera } from "lucide-react";

function ProduktiNeZbritje(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const selectRef = useRef(null);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      const currentInput = document.getElementById("produktiSelect-input")?.value || "";
      if (currentInput.trim().length > 0) {
        let lookupBarcode = currentInput.trim();
        if (lookupBarcode.startsWith("2") && lookupBarcode.length === 13) {
          const pluCode = lookupBarcode.substring(0, 7);
          const matched = allOptions.find(opt => opt.label.includes(pluCode));
          if (matched) {
            lookupBarcode = pluCode;
          }
        }

        const matches = allOptions.filter(opt => opt.label.toLowerCase().includes(lookupBarcode.toLowerCase()));
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
  const [qmimiBleresProduktit, setQmimiBleresProduktit] = useState(0.0);
  const [qmimiShitesProduktit, setQmimiShitesProduktit] = useState(0.0);
  const [rabati, setRabati] = useState(0.0);
  const [dataSkadimit, setDataSkadimit] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [zbritjaNeRregull, setZbritjaNeRregull] = useState(false);
  const [kaZbritje, setKaZbritje] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleScanResult = (scannedCode) => {
    setShowScanner(false);
    setInputValue(scannedCode);
    setTimeout(() => {
       const selectElement = document.getElementById("produktiSelect-input");
       if (selectElement) {
         selectElement.focus();
         const match = allOptions.find(opt => opt.label && opt.label.includes(scannedCode));
         if (match) {
            handleChange(match);
         }
       }
    }, 400);
  };

  // ── Optimized product search ──────────────────────────────────────────────
  const [allOptions, setAllOptions] = useState([]);   // full list loaded once
  const [optionsSelected, setOptionsSelected] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getToken = localStorage.getItem("token");
  const authentikimi = useMemo(() => ({
    headers: { Authorization: `Bearer ${getToken}` }
  }), [getToken]);

  // Single fetch on mount
  useEffect(() => {
    let active = true;
    const fetchProduktet = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/Produkti/Products`, authentikimi);
        if (!active) return;
        let raw = res.data;
        if (raw?.$values) raw = raw.$values;
        if (!Array.isArray(raw)) raw = [];
        setAllOptions(raw.map(item => ({
          value: item.produktiID,
          label: `${item.barkodi || "—"} · ${item.emriProduktit}`,
          item,
        })));
      } catch (err) {
        console.error("Fetch produktet failed:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchProduktet();
    return () => { active = false; };
  }, [API_BASE_URL, authentikimi]);

  // Client-side filter capped at 50 — fast even with 10 000+ products
  const filteredOptions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) return [];
    const lower = inputValue.toLowerCase();
    const results = [];
    for (let i = 0; i < allOptions.length; i++) {
      if (allOptions[i].label.toLowerCase().includes(lower)) {
        results.push(allOptions[i]);
        if (results.length >= 50) break;
      }
    }
    return results;
  }, [inputValue, allOptions]);

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "42px",
      background: "#162033",
      borderColor: state.isFocused ? "#10b981" : "rgba(255,255,255,0.10)",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(16,185,129,0.15)" : "none",
      borderRadius: "8px",
      "&:hover": { borderColor: "#10b981" },
    }),
    input: (base) => ({ ...base, color: "#f1f5f9" }),
    placeholder: (base) => ({ ...base, color: "#94a3b8" }),
    singleValue: (base) => ({ ...base, color: "#f1f5f9" }),
    menu: (base) => ({
      ...base,
      background: "#162033",
      border: "1px solid rgba(255,255,255,0.10)",
      borderRadius: "10px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      zIndex: 1060,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      background: isSelected ? "#10b981" : isFocused ? "#1e2d45" : "transparent",
      color: isSelected ? "#fff" : "#e2e8f0",
      cursor: "pointer",
      borderRadius: "6px",
      padding: "0.6rem 1rem",
    }),
    loadingIndicator: (base) => ({ ...base, color: "#10b981" }),
    loadingMessage: (base) => ({ ...base, color: "#94a3b8" }),
    noOptionsMessage: (base) => ({ ...base, color: "#94a3b8" }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({ ...base, color: "#94a3b8" }),
    clearIndicator: (base) => ({ ...base, color: "#94a3b8", "&:hover": { color: "#ef4444" } }),
  };


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

  // Function to check if the selected date is valid
  const kontrolloDaten = () => {
    const selectedDate = new Date(dataSkadimit);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison

    return selectedDate >= today;
  };

  function handleSubmit() {
    // Check if date is valid
    if (!kontrolloDaten()) {
      setPershkrimiMesazhit("Data e skadimit nuk mund të jetë në të kaluarën!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);

      // Focus on close button
      setTimeout(() => {
        const closeButton = document.querySelector(".btn-outline-danger");
        if (closeButton) {
          closeButton.focus();
        }
      }, 100);

      const dateElement = document.getElementById("dataSkadimit");
      if (dateElement) {
        dateElement.focus();
      }

      return;
    }

    // Focus on date field

    if (zbritjaNeRregull === true && kaZbritje === false) {
      axios
        .post(
          `${API_BASE_URL}/api/ZbritjaQmimitProduktit/shtoZbritjenProduktit`,
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



  const handleChange = async (partneri) => {
    // isClearable fires null when user clears the selection
    if (!partneri) {
      setOptionsSelected(null);
      setQmimiBleresProduktit(0);
      setQmimiShitesProduktit(0);
      setRabati(0);
      setKaZbritje(false);
      setZbritjaNeRregull(false);
      return;
    }
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
      if (element) element.focus();
    }
  };

  const ndrroField = (e, tjetra) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const el = document.getElementById(tjetra);
      if (el) { el.focus(); setTimeout(() => el.select(), 0); }
    }
  };

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant", "1 Euro Menaxher"]}
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
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Form.Label className="mb-0">Vlen per</Form.Label>
                <button 
                  type="button"
                  onClick={() => setShowScanner(true)}
                  style={{ color: '#10b981', padding: '0', background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Camera size={14} /> Skano
                </button>
              </div>
              <Select
                ref={selectRef}
                value={optionsSelected}
                onChange={handleChange}
                onInputChange={(val) => setInputValue(val)}
                onKeyDown={handleKeyDown}
                options={filteredOptions}
                isLoading={isLoading}
                id="produktiSelect"
                inputId="produktiSelect-input"
                styles={selectStyles}
                placeholder={isLoading ? "Duke u ngarkuar..." : "Kërko barkodin ose emrin..."}
                isClearable
                noOptionsMessage={() =>
                  inputValue.length < 2
                    ? "Shkruani të paktën 2 karaktere..."
                    : "Nuk u gjet asnjë produkt"
                }
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
                disabled={kaZbritje}
                onKeyDown={(e) => {
                  ndrroField(e, "rabati");
                }}
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
                onKeyDown={(e) => {
                  ndrroField(e, "vendosZbritjen");
                }}
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
          <Button className="Butoni" onClick={handleSubmit} id="vendosZbritjen">
            Vendosni Zbritjen <FontAwesomeIcon icon={faPlus} />
          </Button>
        </Modal.Footer>
      </Modal>
      <BarcodeScannerModal 
        show={showScanner} 
        onHide={() => setShowScanner(false)} 
        onScan={handleScanResult} 
      />
    </>
  );
}

export default ProduktiNeZbritje;
