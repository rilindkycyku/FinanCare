import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faXmark } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function EditoDitetEFurnizimit(props) {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://localhost:7285";

  const [ditaFurnizimit, setDitaFurnizimit] = useState({
    idDitaFurnizimit: "",
    idPartneri: "",
    ditaEFurnizimit: "",
  });

  const [furnitoret, setFurnitoret] = useState([]);
  const [fushatEZbrazura, setFushatEZbrazura] = useState(false);
  const [loading, setLoading] = useState(true);

  // Refs për navigim me tastierë
  const ditaSelectRef = useRef(null);
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

  /* ==================== NGARKO TË DHËNAT ==================== */
  useEffect(() => {
    if (!props.id) return;

    const fetchDita = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/DitaFurnizimit/shfaqDitenEFurnizimitSipasIDs?id=${props.id}`,
          authentikimi
        );
        setDitaFurnizimit(res.data);
      } catch (err) {
        console.error("Gabim gjatë ngarkimit të ditës:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDita();
  }, [props.id]);

  // Ngarko furnitorët (pa ID 1, 2, 3)
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
      }
    };

    fetchFurnitoret();
  }, []);

  /* ==================== HANDLERS ==================== */
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

  const handleSubmit = async () => {
    if (!ditaFurnizimit.idPartneri || !ditaFurnizimit.ditaEFurnizimit) {
      setFushatEZbrazura(true);
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/api/DitaFurnizimit/perditesoDitenEFurnizimit?id=${ditaFurnizimit.idDitaFurnizimit}`,
        ditaFurnizimit,
        authentikimi
      );

      props.setTipiMesazhit("success");
      props.setPershkrimiMesazhit("Dita e furnizimit u ruajt me sukses!");
      props.perditesoTeDhenat();
      props.shfaqmesazhin();
      props.largo();
    } catch (error) {
      props.setTipiMesazhit("danger");
      props.setPershkrimiMesazhit("Gabim gjatë ruajtjes.");
      props.shfaqmesazhin();
    }
  };

  /* ==================== RENDER ==================== */
  if (loading) {
    return (
      <Modal show={true} onHide={props.largo} centered>
        <Modal.Body className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Duke ngarkuar...</span>
          </div>
          <p className="mt-3">Duke ngarkuar të dhënat...</p>
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
          <Modal.Title>Edito Ditën e Furnizimit</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            {/* ID */}
            <Form.Group className="mb-3">
              <Form.Label>ID</Form.Label>
              <Form.Control
                value={ditaFurnizimit.idDitaFurnizimit || ""}
                disabled
                className="bg-light"
              />
            </Form.Group>

            {/* Furnitori – Enter zgjedh opsionin, pastaj kalon te dita kur zgjedhja përfundon */}
            <Form.Group className="mb-3">
              <Form.Label>
                Furnitori <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Select
                value={selectedPartnerOption}
                onChange={(selected) => {
                  handlePartnerChange(selected);
                  // Pas zgjedhjes, fokuso te fusha tjetër
                  setTimeout(() => ditaSelectRef.current?.focus(), 0);
                }}
                options={furnitoret}
                placeholder="Kërko dhe zgjidh furnitorin..."
                isClearable
                isSearchable
                noOptionsMessage={() => "Nuk u gjet furnitor"}
                className="react-select-container"
                classNamePrefix="react-select"
                autoFocus
                // Hiq onKeyDown krejt – lejo default behavior të Enter-it
              />
            </Form.Group>

            {/* Dita e Furnizimit – Enter zgjedh ditën, pastaj ruajt */}
            <Form.Group className="mb-3">
              <Form.Label>
                Dita e Furnizimit <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Select
                ref={ditaSelectRef}
                value={selectedDitaOption}
                onChange={(selected) => {
                  handleDitaChange(selected);
                  // Pas zgjedhjes së ditës, fokuso butonin e ruajtjes
                  setTimeout(() => saveButtonRef.current?.focus(), 0);
                }}
                options={ditetEJaves}
                placeholder="Zgjidh ditën..."
                isSearchable={false}
                className="react-select-container"
                classNamePrefix="react-select"
                // Hiq onKeyDown – Enter-i do të zgjedhë ditën automatikisht
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
            Ruaj Ndryshimet <FontAwesomeIcon icon={faPenToSquare} />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditoDitetEFurnizimit;
