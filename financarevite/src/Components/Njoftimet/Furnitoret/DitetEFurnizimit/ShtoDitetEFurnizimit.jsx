import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function ShtoDitenEFurnizimit(props) {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://localhost:7285";

  // Forma
  const [ditaFurnizimit, setDitaFurnizimit] = useState({
    idPartneri: "",
    ditaEFurnizimit: "",
  });

  const [furnitoret, setFurnitoret] = useState([]);
  const [fushatEZbrazura, setFushatEZbrazura] = useState(false);
  const [loading, setLoading] = useState(true);

  // Refs për navigim me Enter
  const furnitoriRef = useRef(null);
  const ditaRef = useRef(null);
  const saveButtonRef = useRef(null);

  // Ditët e javës
  const ditetEJaves = [
    { value: "E Hënë", label: "E Hënë" },
    { value: "E Martë", label: "E Martë" },
    { value: "E Mërkurë", label: "E Mërkurë" },
    { value: "E Enjte", label: "E Enjte" },
    { value: "E Premte", label: "E Premte" },
    { value: "E Shtunë", label: "E Shtunë" },
  ];

  const token = localStorage.getItem("token");
  const authentikimi = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Ngarko furnitorët (pa ID 1, 2, 3 – si te edito)
  useEffect(() => {
    const fetchFurnitoret = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/Partneri/shfaqPartneretFurntiore`,
          authentikimi
        );

        const idsTeHiqen = [1, 2, 3];
        const filtruar = res.data.filter(
          (f) => !idsTeHiqen.includes(f.idPartneri)
        );

        const formatted = filtruar.map((f) => ({
          value: f.idPartneri,
          label: `${f.emriBiznesit} ${
            f.shkurtesaPartnerit ? `(${f.shkurtesaPartnerit})` : ""
          }`.trim(),
        }));

        setFurnitoret(formatted);
      } catch (err) {
        console.error("Furnitorët nuk u ngarkuan:", err);
        setFurnitoret([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFurnitoret();
  }, []);

  // Handlers për react-select
  const handlePartnerChange = (selected) => {
    setDitaFurnizimit((prev) => ({
      ...prev,
      idPartneri: selected ? selected.value : "",
    }));
  };

  const handleDitaChange = (selected) => {
    setDitaFurnizimit((prev) => ({
      ...prev,
      ditaEFurnizimit: selected ? selected.value : "",
    }));
  };

  const selectedPartnerOption =
    furnitoret.find((opt) => opt.value === ditaFurnizimit.idPartneri) || null;

  const selectedDitaOption =
    ditetEJaves.find((d) => d.value === ditaFurnizimit.ditaEFurnizimit) || null;

  // Validim dhe ruajtje
  const handleSubmit = async () => {
    if (!ditaFurnizimit.idPartneri || !ditaFurnizimit.ditaEFurnizimit) {
      setFushatEZbrazura(true);
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/DitaFurnizimit/shtoDitenEFurnizimit`,
        {
          idDitaFurnizimit: 0, // backend e injoron zakonisht
          idPartneri: parseInt(ditaFurnizimit.idPartneri),
          ditaEFurnizimit: ditaFurnizimit.ditaEFurnizimit,
        },
        authentikimi
      );

      props.setTipiMesazhit("success");
      props.setPershkrimiMesazhit("Dita e furnizimit u shtua me sukses!");
      props.perditesoTeDhenat();
      props.shfaqmesazhin();
      props.largo();
    } catch (error) {
      console.error("Gabim gjatë shtimit:", error);
      props.setTipiMesazhit("danger");
      props.setPershkrimiMesazhit(
        "Ndodhi një gabim gjatë shtimit të ditës së furnizimit."
      );
      props.shfaqmesazhin();
    }
  };

  // Loading
  if (loading) {
    return (
      <Modal show={true} onHide={props.largo} centered>
        <Modal.Body className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Duke ngarkuar...</span>
          </div>
          <p className="mt-3">Duke ngarkuar furnitorët...</p>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant", "Pergjegjes i Porosive"]}
        largo={() => props.largo()}
        shfaqmesazhin={() => props.shfaqmesazhin()}
        perditesoTeDhenat={() => props.perditesoTeDhenat()}
        setTipiMesazhit={(e) => props.setTipiMesazhit(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit(e)}
      />

      {/* Modal për fusha të zbrazëta */}
      {fushatEZbrazura && (
        <Modal
          size="sm"
          show={fushatEZbrazura}
          onHide={() => setFushatEZbrazura(false)}>
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "red" }}>Kujdes!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <strong>Ju lutem plotësoni të gjitha fushat e detyrueshme!</strong>
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setFushatEZbrazura(false)}>
              Mbylle <FontAwesomeIcon icon={faXmark} />
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Modal kryesor */}
      <Modal
        className="modalEditShto"
        show={true}
        onHide={props.largo}
        backdrop="static"
        centered>
        <Modal.Header closeButton>
          <Modal.Title>Shto Ditën e Furnizimit</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            {/* Furnitori */}
            <Form.Group className="mb-3">
              <Form.Label>
                Furnitori <span style={{ color: "red" }}>*</span>
              </Form.Label>
              {/* Furnitori */}
              <Select
                ref={furnitoriRef}
                value={selectedPartnerOption}
                onChange={handlePartnerChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && selectedPartnerOption) {
                    e.preventDefault();
                    ditaRef.current?.focus();
                  }
                }}
                options={furnitoret}
                placeholder="Kërko dhe zgjidh furnitorin..."
                isClearable
                isSearchable
                noOptionsMessage={() => "Nuk u gjet furnitor"}
                className="react-select-container"
                classNamePrefix="react-select"
                autoFocus
                menuPortalTarget={document.body} // opsionale, për z-index
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            </Form.Group>

            {/* Dita e Furnizimit */}
            <Form.Group className="mb-3">
              <Form.Label>
                Dita e Furnizimit <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Select
                ref={ditaRef}
                value={selectedDitaOption}
                onChange={handleDitaChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && selectedDitaOption) {
                    e.preventDefault();
                    saveButtonRef.current?.focus();
                  }
                }}
                options={ditetEJaves}
                placeholder="Zgjidh ditën..."
                isSearchable={false}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={props.largo}>
            Anulo <FontAwesomeIcon icon={faXmark} />
          </Button>
          <Button
            ref={saveButtonRef}
            variant="primary"
            className="Butoni"
            onClick={handleSubmit}>
            Shto Ditën <FontAwesomeIcon icon={faPlus} />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ShtoDitenEFurnizimit;
