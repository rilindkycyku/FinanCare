import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button, Form, Modal, Tabs, Tab, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faGlobe
} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";
import "../../../../Pages/Styles/PremiumTheme.css";
import { Camera } from "lucide-react";
import BarcodeScannerModal from "../../../TeTjera/BarcodeScannerModal";

function EditoProduktin(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [produkti, setProdukti] = useState({});

  const [kontrolloProduktin, setKontrolloProduktin] = useState(false);
  const [fushatEZbrazura, setFushatEZbrazura] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

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

  const [removeCurrentPhoto, setRemoveCurrentPhoto] = useState(false);

    const getToken = localStorage.getItem("token");
  const authentikimi = {
    headers: { Authorization: `Bearer ${getToken}` },
  };

  useEffect(() => {
    if (!props.show) {
      setSelectedImages([]);
      setRemoveCurrentPhoto(false);
    }
  }, [props.show]);

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

  const handleScanResult = (scannedCode) => {
    setShowScanner(false);
    setProdukti({ ...produkti, barkodi: scannedCode });
    setTimeout(() => {
      document.getElementById("emriProduktit")?.focus();
    }, 400);
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
    let finalFotoName = produkti.fotoProduktit; // default: keep old

    try {
      // Case 1: User removed current photo and uploaded nothing â†’ use default
      if (removeCurrentPhoto && selectedImages.length === 0) {
        finalFotoName = "ProduktPaFoto.png";
      }
      // Case 2: User uploaded new photo(s) â†’ upload the FIRST one only
      else if (selectedImages.length > 0) {
        const formData = new FormData();
        formData.append("foto", selectedImages[0]); // Only first image

        const uploadRes = await axios.post(
          `${API_BASE_URL}/api/VendosFotot/EditoProduktin?fotoVjeterProduktit=${removeCurrentPhoto ? "" : produkti.fotoProduktit}`, // Your dedicated endpoint
          formData,
          {
            headers: {
              ...authentikimi.headers,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        finalFotoName = uploadRes.data; // Backend returns new filename
      }
      // Case 3: User removed current photo but didn't upload new â†’ default
      else if (removeCurrentPhoto) {
        finalFotoName = "ProduktPaFoto.png";
      }
      // Else: keep existing photo

      // Now update the product with the correct fotoProduktit
      const updatedProduct = {
        ...produkti,
        fotoProduktit: finalFotoName,
      };

      // Final PUT to update the product
      await axios.put(
        `${API_BASE_URL}/api/Produkti/${props.id}`,
        updatedProduct,
        authentikimi
      );

      props.setTipiMesazhit("success");
      props.setPershkrimiMesazhit("Produkti u përditësua me sukses!");
      props.perditesoTeDhenat();
      props.hide();
      props.shfaqmesazhin();
    } catch (error) {
      console.error("Error updating product:", error);
      props.setTipiMesazhit("danger");
      props.setPershkrimiMesazhit("Gabim gjatë ruajtjes së produktit!");
      props.shfaqmesazhin();
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
        roletELejuara={["Menaxher", "Kalkulant", "1 Euro Menaxher"]}
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
        onHide={() => setFushatEZbrazura(false)}
        className="sp-modal">
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">Ndodhi një gabim</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-3 text-danger">
            <FontAwesomeIcon icon={faXmark} size="3x" />
          </div>
          <p className="text-white">Plotësoni të gjitha fushat e detyrueshme!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn-cancel w-100"
            onClick={() => setFushatEZbrazura(false)}>
            Mbylle
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        size="sm"
        show={kontrolloProduktin}
        onHide={() => setKontrolloProduktin(false)}
        className="sp-modal">
        <Modal.Header closeButton>
          <Modal.Title>Konfirmo Ndryshimin</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <p className="text-warning mb-2">Ky produkt ekziston në sistem!</p>
          <p className="text-white small">A jeni të sigurt që dëshironi të vazhdoni?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn-cancel"
            onClick={() => setKontrolloProduktin(false)}>
            Anulo
          </Button>
          <Button
            variant="warning"
            className="px-4"
            onClick={() => handleSubmit()}>
            Vazhdo
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Main Modal */}
      <Modal size="xl" show={props.show} onHide={props.hide} className="sp-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            Edito Produktin
            <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 500, marginTop: '2px', letterSpacing: '0.05em' }}>
              ID: {props.id} • {produkti.barkodi}
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {isLoading || optionsGrupiProduktit.length === 0 ? (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
              <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Duke ngarkuar...</span>
              </div>
              <h5 className="text-muted fw-bold">Duke ngarkuar të dhënat...</h5>
            </div>
          ) : (
          <Tabs defaultActiveKey="gjenerale" className="sp-tabs mb-4">
            {/* General Tab */}
            <Tab eventKey="gjenerale" title="Të Dhënat Gjenerale">
              <div className="sp-form-container p-2">
                <Form>
                  <Row className="g-4 mb-3">
                    <Col md="6">
                      <div className="sp-input-group">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label className="sp-label mb-0">Barkodi <span className="text-danger">*</span></label>
                          <button 
                            type="button"
                            onClick={() => setShowScanner(true)}
                            style={{ color: '#818cf8', padding: '0', background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Camera size={14} /> Skano
                          </button>
                        </div>
                        <Form.Control
                          name="barkodi"
                          value={produkti.barkodi || ""}
                          onChange={onChange}
                          onKeyDown={(e) => ndrroField(e, "emriProduktit")}
                          autoFocus
                          autoComplete="off"
                          className="sp-input"
                          placeholder="Barkodi..."
                        />
                      </div>
                    </Col>
                    <Col md="6">
                      <div className="sp-input-group">
                        <label className="sp-label">Emri i Produktit <span className="text-danger">*</span></label>
                        <Form.Control
                          name="emriProduktit"
                          id="emriProduktit"
                          value={produkti.emriProduktit || ""}
                          onChange={onChange}
                          onKeyDown={(e) => ndrroField(e, "grupiProduktitSelect-input")}
                          autoComplete="off"
                          className="sp-input"
                          placeholder="Emri i produktit..."
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row className="g-4 mb-3">
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Grupi i Produktit <span className="text-danger">*</span></label>
                        <div className="sp-select-container">
                          <Select
                            value={optionsSelectedGrupiProduktit}
                            onChange={handleChangeGrupiProduktit}
                            options={optionsGrupiProduktit}
                            inputId="grupiProduktitSelect-input"
                            placeholder="Zgjidh grupin..."
                            className="sp-select-container"
                            classNamePrefix="sp-select"
                          />
                        </div>
                      </div>
                    </Col>

                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Partneri <span className="text-danger">*</span></label>
                        <div className="sp-select-container">
                          <Select
                            value={optionsSelectedPartneri}
                            onChange={handleChangePartneri}
                            options={optionsPartneri}
                            inputId="partneriSelect-input"
                            placeholder="Zgjidh partnerin..."
                            className="sp-select-container"
                            classNamePrefix="sp-select"
                          />
                        </div>
                      </div>
                    </Col>

                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Njësia Matëse <span className="text-danger">*</span></label>
                        <div className="sp-select-container">
                          <Select
                            value={optionsSelectedNjesiaMatese}
                            onChange={handleChangeNjesiaMatese}
                            options={optionsNjesiaMatese}
                            inputId="njesiaMateseSelect-input"
                            placeholder="Zgjidh njesinë..."
                            className="sp-select-container"
                            classNamePrefix="sp-select"
                          />
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Row className="g-4 align-items-end">
                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">TVSH % <span className="text-danger">*</span></label>
                        <div className="sp-select-container">
                          <Select
                            value={optionsSelectedLlojiTVSH}
                            onChange={handleChangeLlojiTVSH}
                            options={optionsLlojiTVSH}
                            inputId="llojiTVSHSelect-input"
                            placeholder="Norma e TVSH"
                            className="sp-select-container"
                            classNamePrefix="sp-select"
                          />
                        </div>
                      </div>
                    </Col>

                    <Col md="4">
                      <div className="sp-input-group">
                        <label className="sp-label">Sasia e Shumicës <span className="text-danger">*</span></label>
                        <Form.Control
                          name="sasiaShumices"
                          value={produkti.sasiaShumices || ""}
                          onChange={onChange}
                          onKeyDown={handleMenaxhoTastetPagesa}
                          autoComplete="off"
                          id="sasiaShumices"
                          className="sp-input"
                          type="number"
                        />
                      </div>
                    </Col>

                    <Col md="4">
                      <div className="sp-input-group opacity-75">
                        <label className="sp-label text-soft">Kodi Produktit</label>
                        <Form.Control
                          onChange={onChange}
                          value={produkti.kodiProduktit}
                          name="kodiProduktit"
                          type="text"
                          disabled
                          className="sp-input"
                        />
                      </div>
                    </Col>
                  </Row>
                </Form>
              </div>
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
              <div className="sp-online-container p-4">
                <div className="sp-switch-box mb-4">
                  <Form.Check
                    type="switch"
                    id="perfshiNeOnline"
                    label="Shfaq produktin në dyqanin online (E-commerce)"
                    checked={isOnline}
                    onChange={handleOnlineToggle}
                    className="sp-switch"
                  />
                  <p className="mt-2 text-soft small ps-5" style={{ opacity: 0.8 }}>
                    Kur aktivizohet, ky artikull do të jetë i dukshëm për klientët në faqen publike të shitjes.
                  </p>
                </div>

                {isOnline && (
                  <div className="sp-image-upload-section">
                    <label className="sp-label mb-3">Fotografia Kryesore</label>

                    <div
                      className="sp-upload-zone"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleFiles(e.dataTransfer.files);
                      }}>
                      <div className="upload-icon">
                        <i className="bi bi-cloud-arrow-up fs-1"></i>
                      </div>
                      <div className="upload-text">
                        <h6>Tërhiq dhe lësho fotografinë këtu</h6>
                        <p>ose kliko për të zgjedhur nga kompjuteri</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                      />
                    </div>

                    {(selectedImages.length > 0 || produkti.fotoProduktit) && (
                      <div className="sp-image-preview-grid mt-4">
                        <label className="sp-label mb-3 d-block">Parapamja</label>
                        <Row className="g-3">
                          {produkti.fotoProduktit && (
                            <Col xs="auto">
                              <div className="sp-preview-card current">
                                <img
                                  src={`${API_BASE_URL}/images/products/${produkti.fotoProduktit}`}
                                  alt="Foto aktuale"
                                />
                                <div className="preview-badge">Aktuale</div>
                              </div>
                            </Col>
                          )}

                          {selectedImages.map((file, index) => (
                            <Col key={index} xs="auto">
                              <div className="sp-preview-card new">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`E re ${index + 1}`}
                                />
                                <Button
                                  variant="danger"
                                  className="remove-btn"
                                  onClick={() => removeImage(index)}>
                                  <FontAwesomeIcon icon={faXmark} />
                                </Button>
                                <div className="preview-badge glow">E Re</div>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button className="btn-cancel" onClick={props.hide}>
            Anulo
          </Button>
          <Button
            className="btn-save px-4"
            onClick={handleKontrolli}>
            Ruaj Ndryshimet
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

export default EditoProduktin;
