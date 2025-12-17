import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button, Form, Modal, Tabs, Tab } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faPenToSquare,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import { MDBRow, MDBCol, MDBInput, MDBTooltip } from "mdb-react-ui-kit";
import Select from "react-select";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function EditoProduktin(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [produkti, setProdukti] = useState({});

  const [kontrolloProduktin, setKontrolloProduktin] = useState(false);
  const [fushatEZbrazura, setFushatEZbrazura] = useState(false);

  // Select states
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

  const [produktet, setProduktet] = useState([]); // For duplicate check

  // Image upload
  const fileInputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([]);

  const customStyles = {
    menu: (provided) => ({ ...provided, zIndex: 1050 }),
  };

  const getToken = localStorage.getItem("token");
  const authentikimi = {
    headers: { Authorization: `Bearer ${getToken}` },
  };

  // Fetch dropdowns
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [grupe, partneret, njesi] = await Promise.all([
          axios.get(
            `${API_BASE_URL}/api/GrupiProduktit/shfaqGrupetEProduktit`,
            authentikimi
          ),
          axios.get(
            `${API_BASE_URL}/api/Partneri/shfaqPartneretFurntiore`,
            authentikimi
          ),
          axios.get(
            `${API_BASE_URL}/api/NjesiaMatese/shfaqNjesiteMatese`,
            authentikimi
          ),
        ]);

        setOptionsGrupiProduktit(
          grupe.data.map((g) => ({
            value: g.idGrupiProduktit,
            label: g.grupiIProduktit,
          }))
        );
        setOptionsPartneri(
          partneret.data
            .filter((p) => ![1, 2, 3].includes(p.idPartneri))
            .map((p) => ({ value: p.idPartneri, label: p.emriBiznesit }))
        );
        setOptionsNjesiaMatese(
          njesi.data.map((n) => ({
            value: n.idNjesiaMatese,
            label: n.njesiaMatese,
          }))
        );
        setOptionsLlojiTVSH([
          { label: "0%", value: 0 },
          { label: "8%", value: 8 },
          { label: "18%", value: 18 },
        ]);
      } catch (err) {
        console.error("Error loading dropdowns:", err);
      }
    };
    fetchDropdowns();
  }, []);

  // Load product
  useEffect(() => {
    const loadProduct = async () => {
      if (!props.id) return;
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/Produkti/ShfaqProduktinNgaID?id=${props.id}`,
          authentikimi
        );
        const data = res.data;
        setProdukti(data);

        setOptionsSelectedGrupiProduktit(
          optionsGrupiProduktit.find(
            (o) => o.value === data.idGrupiProduktit
          ) || null
        );
        setOptionsSelectedPartneri(
          optionsPartneri.find((o) => o.value === data.idPartneri) || null
        );
        setOptionsSelectedNjesiaMatese(
          optionsNjesiaMatese.find((o) => o.value === data.idNjesiaMatese) ||
            null
        );
        setOptionsSelectedLlojiTVSH(
          optionsLlojiTVSH.find((o) => o.value === data.llojiTVSH) || null
        );
      } catch (err) {
        console.error(err);
      }
    };
    if (optionsGrupiProduktit.length > 0) loadProduct();
  }, [
    props.id,
    optionsGrupiProduktit,
    optionsPartneri,
    optionsNjesiaMatese,
    optionsLlojiTVSH,
  ]);

  // Load all products for duplicate check
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/Produkti/Products`, authentikimi)
      .then((res) => setProduktet(res.data))
      .catch(console.log);
  }, []);

  const onChange = (e) => {
    setProdukti({ ...produkti, [e.target.name]: e.target.value });
  };

  // Focus navigation helper
  const ndrroField = (e, nextId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const next = document.getElementById(nextId);
      if (next) next.focus();
    }
  };

  // Handle all select changes with focus movement
  const handleChangeGrupiProduktit = (selected) => {
    setOptionsSelectedGrupiProduktit(selected);
    setProdukti((prev) => ({
      ...prev,
      idGrupiProduktit: selected ? selected.value : null,
    }));
    setTimeout(
      () => document.getElementById("partneriSelect-input")?.focus(),
      100
    );
  };

  const handleChangePartneri = (selected) => {
    setOptionsSelectedPartneri(selected);
    const id = selected ? selected.value : null;
    setProdukti((prev) => ({ ...prev, idPartneri: id }));

    if (id) {
      axios
        .get(
          `${API_BASE_URL}/api/Produkti/GetKodiProduktitPerRegjistrim?idPartneri=${id}`,
          authentikimi
        )
        .then((res) =>
          setProdukti((prev) => ({ ...prev, kodiProduktit: res.data }))
        );
    }

    setTimeout(
      () => document.getElementById("njesiaMateseSelect-input")?.focus(),
      100
    );
  };

  const handleChangeNjesiaMatese = (selected) => {
    setOptionsSelectedNjesiaMatese(selected);
    setProdukti((prev) => ({
      ...prev,
      idNjesiaMatese: selected ? selected.value : null,
    }));
    setTimeout(
      () => document.getElementById("llojiTVSHSelect-input")?.focus(),
      100
    );
  };

  const handleChangeLlojiTVSH = (selected) => {
    setOptionsSelectedLlojiTVSH(selected);
    setProdukti((prev) => ({
      ...prev,
      llojiTVSH: selected ? selected.value : null,
    }));
    setTimeout(() => document.getElementById("sasiaShumices")?.focus(), 100);
  };

  // Handle Online switch (save as string "true"/"false")
  const handleOnlineToggle = (e) => {
    const checked = e.target.checked;
    setProdukti((prev) => ({
      ...prev,
      perfshiNeOnline: checked ? "true" : "false",
    }));
  };

  const isOnline = produkti.perfshiNeOnline === "true";

  // Image handling
  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );
    setSelectedImages((prev) => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/Produkti/${props.id}`,
        produkti,
        authentikimi
      );
      props.setTipiMesazhit("success");
      props.setPershkrimiMesazhit("Produkti u përditësua me sukses!");
      props.perditesoTeDhenat();
      props.hide();
      props.shfaqmesazhin();
    } catch (error) {
      props.setTipiMesazhit("danger");
      props.setPershkrimiMesazhit("Gabim gjatë ruajtjes!");
      props.shfaqmesazhin();
      console.log(error);
    }
  };

  const handleKontrolli = () => {
    if (!produkti.emriProduktit?.trim()) {
      setFushatEZbrazura(true);
      return;
    }

    const duplicate = produktet.some(
      (p) => p.emriProduktit === produkti.emriProduktit && p.id !== props.id
    );
    if (duplicate) {
      setKontrolloProduktin(true);
    } else {
      handleSubmit();
    }
  };

  const handleMenaxhoTastetPagesa = (e) => {
    if (e.key === "Enter") {
      handleKontrolli();
    }
  };

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant"]}
        largo={props.largo}
        shfaqmesazhin={props.shfaqmesazhin}
        perditesoTeDhenat={props.perditesoTeDhenat}
        setTipiMesazhit={props.setTipiMesazhit}
        setPershkrimiMesazhit={props.setPershkrimiMesazhit}
      />

      {/* Warning Modals */}
      <Modal
        size="sm"
        show={fushatEZbrazura}
        onHide={() => setFushatEZbrazura(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "red" }}>Gabim</Modal.Title>
        </Modal.Header>
        <Modal.Body>Plotësoni të gjitha fushat e detyrueshme!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setFushatEZbrazura(false)}>
            Mbyll
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        size="sm"
        show={kontrolloProduktin}
        onHide={() => setKontrolloProduktin(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Konfirmim</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Ekziston një produkt me të njëjtin emër. Vazhdo?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setKontrolloProduktin(false)}>
            Anulo
          </Button>
          <Button variant="warning" onClick={handleSubmit}>
            Vazhdo
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Main Modal */}
      <Modal size="xl" show={props.show} onHide={props.hide}>
        <Modal.Header closeButton>
          <Modal.Title>Edito Produktin</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs defaultActiveKey="gjenerale" className="mb-4">
            {/* General Tab */}
            <Tab eventKey="gjenerale" title="Të Dhënat Gjenerale">
              <MDBRow className="g-4 align-items-end">
                {/* Row 1 */}
                <MDBCol md="6">
                  <MDBInput
                    label={
                      <>
                        Barkodi <span className="text-danger">*</span>
                      </>
                    }
                    name="barkodi"
                    value={produkti.barkodi || ""}
                    onChange={onChange}
                    onKeyDown={(e) => ndrroField(e, "emriProduktit")}
                    autoFocus
                    autoComplete="off"
                  />
                </MDBCol>
                <MDBCol md="6">
                  <MDBInput
                    label={
                      <>
                        Emri i Produktit <span className="text-danger">*</span>
                      </>
                    }
                    name="emriProduktit"
                    id="emriProduktit"
                    value={produkti.emriProduktit || ""}
                    onChange={onChange}
                    onKeyDown={(e) =>
                      ndrroField(e, "grupiProduktitSelect-input")
                    }
                    autoComplete="off"
                  />
                </MDBCol>

                {/* Row 2 */}
                <MDBCol md="4">
                  <Form.Label className="fw-bold text-center d-block mb-2">
                    Grupi i Produktit <span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    value={optionsSelectedGrupiProduktit}
                    onChange={handleChangeGrupiProduktit}
                    options={optionsGrupiProduktit}
                    inputId="grupiProduktitSelect-input"
                    styles={customStyles}
                    placeholder="Zgjidh..."
                  />
                </MDBCol>

                <MDBCol md="4">
                  <Form.Label className="fw-bold text-center d-block mb-2">
                    Partneri <span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    value={optionsSelectedPartneri}
                    onChange={handleChangePartneri}
                    options={optionsPartneri}
                    inputId="partneriSelect-input"
                    styles={customStyles}
                    placeholder="Zgjidh..."
                  />
                </MDBCol>

                <MDBCol md="4">
                  <Form.Label className="fw-bold text-center d-block mb-2">
                    Njësia Matëse <span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    value={optionsSelectedNjesiaMatese}
                    onChange={handleChangeNjesiaMatese}
                    options={optionsNjesiaMatese}
                    inputId="njesiaMateseSelect-input"
                    styles={customStyles}
                    placeholder="Zgjidh..."
                  />
                </MDBCol>

                {/* Row 3 */}
                <MDBCol md="4">
                  <Form.Label className="fw-bold text-center d-block mb-2">
                    TVSH % <span className="text-danger">*</span>
                  </Form.Label>
                  <Select
                    value={optionsSelectedLlojiTVSH}
                    onChange={handleChangeLlojiTVSH}
                    options={optionsLlojiTVSH}
                    inputId="llojiTVSHSelect-input"
                    styles={customStyles}
                    placeholder="Zgjidh..."
                  />
                </MDBCol>

                <MDBCol md="4">
                  <Form.Label className="fw-bold text-center d-block mb-2">
                    Sasia e Shumicës <span className="text-danger">*</span>
                  </Form.Label>
                  <MDBInput
                    name="sasiaShumices"
                    value={produkti.sasiaShumices || ""}
                    onChange={onChange}
                    onKeyDown={handleMenaxhoTastetPagesa}
                    autoComplete="off"
                    id="sasiaShumices"
                  />
                </MDBCol>

                <MDBCol md="4" id="kodiProduktit">
                  <Form.Label className="fw-bold text-center d-block mb-2">
                    Kodi Produktit <span className="text-danger">*</span>
                  </Form.Label>
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
                      disabled
                    />
                  </MDBTooltip>
                </MDBCol>
              </MDBRow>
            </Tab>

            {/* Online Tab */}
            <Tab
              eventKey="online"
              title={
                <>
                  <FontAwesomeIcon icon={faGlobe} className="me-2" />
                  Online
                </>
              }>
              <div className="p-4 bg-light rounded">
                <Form.Check
                  type="switch"
                  id="perfshiNeOnline"
                  label="Përfshi këtë produkt në dyqanin online (shfaqet në ueb)"
                  checked={isOnline}
                  onChange={handleOnlineToggle}
                  className="mb-4 fs-5 fw-medium"
                />

                {isOnline && (
                  <Form.Group>
                    <Form.Label className="fw-bold">
                      Fotot e Produktit për Online
                    </Form.Label>

                    <div
                      className="border rounded-3 p-5 text-center bg-white shadow-sm position-relative"
                      style={{
                        borderStyle: "dashed",
                        borderColor: "#ccc",
                        cursor: "pointer",
                        transition: "border-color 0.3s",
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = "#009879";
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.style.borderColor = "#ccc";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = "#ccc";
                        handleFiles(e.dataTransfer.files);
                      }}>
                      <i className="bi bi-camera fs-1 text-muted mb-3"></i>
                      <p className="text-muted mb-4">
                        Kliko këtu ose tërhiq fotot për të ngarkuar
                      </p>
                      <Button variant="success">
                        <i className="bi bi-upload me-2"></i>
                        Zgjidh dhe Ngarko Foto
                      </Button>
                      <small className="d-block text-muted mt-3">
                        Formate: JPG, PNG • Max 5MB • Rekomandohet 800x800px
                      </small>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) =>
                          e.target.files && handleFiles(e.target.files)
                        }
                      />
                    </div>

                    {(selectedImages.length > 0 || produkti.fotoProduktit) && (
                      <div className="mt-4">
                        <h6 className="fw-bold mb-3">Parapamja e Fotove</h6>
                        <div className="row g-3">
                          {produkti.fotoProduktit && (
                            <div className="col-md-3 col-sm-4 col-6">
                              <div className="position-relative">
                                <img
                                  src={`${API_BASE_URL}/images/products/${produkti.fotoProduktit}`}
                                  alt="Foto aktuale"
                                  className="img-thumbnail w-100"
                                  style={{
                                    height: "150px",
                                    objectFit: "cover",
                                  }}
                                />
                                <span className="badge bg-success position-absolute top-0 start-0 m-2">
                                  Aktuale
                                </span>
                              </div>
                            </div>
                          )}

                          {selectedImages.map((file, index) => (
                            <div
                              key={index}
                              className="col-md-3 col-sm-4 col-6">
                              <div className="position-relative">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Parapamje ${index + 1}`}
                                  className="img-thumbnail w-100"
                                  style={{
                                    height: "150px",
                                    objectFit: "cover",
                                  }}
                                />
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="position-absolute top-0 end-0 m-2"
                                  onClick={() => removeImage(index)}>
                                  <i className="bi bi-x"></i>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Form.Group>
                )}
              </div>
            </Tab>
          </Tabs>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={props.hide}>
            Anulo <FontAwesomeIcon icon={faXmark} className="ms-2" />
          </Button>
          <Button
            style={{ backgroundColor: "#009879", border: "none" }}
            onClick={handleKontrolli}>
            Ruaj Ndryshimet{" "}
            <FontAwesomeIcon icon={faPenToSquare} className="ms-2" />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditoProduktin;
