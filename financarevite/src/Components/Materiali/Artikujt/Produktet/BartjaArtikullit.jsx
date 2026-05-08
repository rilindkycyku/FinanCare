import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Row, Col, Form } from "react-bootstrap";
import axios from "axios";
import Select from "react-select";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";
import { darkSelectStyles } from "@/utils/darkSelectStyles";


const BartjaArtikullit = (props) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const getToken = localStorage.getItem('token');
  const authentikimi = { headers: { Authorization: `Bearer ${getToken}` } };

  const [produktet, setProduktet] = useState([]);
  const [optionsBarkodi, setOptionsBarkodi] = useState([]);
  const [optionsBarkodiSelectedOld, setOptionsBarkodiSelectedOld] = useState(null);
  const [optionsBarkodiSelectedNew, setOptionsBarkodiSelectedNew] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [oldProdukti, setOldProdukti] = useState({
    emriProduktit: '',
    sasiaNeStok: '',
    qmimiMeShumic: '',
    qmimiShites: '',
    qmimiBlerjes: '',
  });

  const [newProdukti, setNewProdukti] = useState({
    emriProduktit: '',
    sasiaNeStok: '',
    qmimiMeShumic: '',
    qmimiShites: '',
    qmimiBlerjes: '',
  });

  const customStyles = {
    control: (base) => ({
      ...base,
      background: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      color: 'white'
    }),
    menu: (base) => ({
      ...base,
      background: '#1a1d21',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 1050
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      color: 'white'
    }),
    singleValue: (base) => ({
      ...base,
      color: 'white'
    })
  };

  // State and filtering for Old Product Select
  const [inputValueOld, setInputValueOld] = useState("");
  const handleInputChangeOld = (val, { action }) => { if (action === "input-change") setInputValueOld(val); else if (action === "set-value" || action === "menu-close") setInputValueOld(""); };

  const realFilteredOptionsOld = useMemo(() => {
    if (!inputValueOld || inputValueOld.length < 2) return [];
    const lower = inputValueOld.toLowerCase();
    const results = [];
    for (let i = 0; i < optionsBarkodi.length; i++) {
      if (optionsBarkodi[i].label.toLowerCase().includes(lower)) {
        results.push(optionsBarkodi[i]);
        if (results.length >= 50) break;
      }
    }
    return results;
  }, [inputValueOld, optionsBarkodi]);

  // State and filtering for New Product Select
  const [inputValueNew, setInputValueNew] = useState("");
  const handleInputChangeNew = (val, { action }) => { if (action === "input-change") setInputValueNew(val); else if (action === "set-value" || action === "menu-close") setInputValueNew(""); };

  const filteredOptionsBarkodiNew = useMemo(() => {
    if (!inputValueNew || inputValueNew.length < 2) return [];
    const lower = inputValueNew.toLowerCase();
    const results = [];
    for (let i = 0; i < optionsBarkodi.length; i++) {
      if (optionsBarkodi[i].value !== optionsBarkodiSelectedOld?.value && 
          optionsBarkodi[i].label.toLowerCase().includes(lower)) {
        results.push(optionsBarkodi[i]);
        if (results.length >= 50) break;
      }
    }
    return results;
  }, [inputValueNew, optionsBarkodi, optionsBarkodiSelectedOld]);

  useEffect(() => {
    const fetchProduktet = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Produkti/Products`,
          authentikimi
        );
        const produktet = response.data;
        setProduktet(produktet);
        const fetchedBarkodi = produktet.map((item) => ({
          value: item.produktiID,
          label: `${item.barkodi} - ${item.kodiProduktit}`,
          emriProduktit: item.emriProduktit,
          sasiaNeStok: item.sasiaNeStok?.toString() || '',
          qmimiMeShumic: item.qmimiMeShumic?.toString() || '',
          qmimiShites: item.qmimiProduktit?.toString() || '',
          qmimiBlerjes: item.qmimiBleres?.toString() || '',
        }));
        setOptionsBarkodi(fetchedBarkodi);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProduktet();
  }, []);

  const handleChangeOldProduct = (selected) => {
    setOptionsBarkodiSelectedOld(selected);
    if (selected) {
      setOldProdukti({
        emriProduktit: selected.emriProduktit,
        sasiaNeStok: selected.sasiaNeStok,
        qmimiMeShumic: selected.qmimiMeShumic,
        qmimiShites: selected.qmimiShites,
        qmimiBlerjes: selected.qmimiBlerjes,
      });
      // Clear new product selection if it matches the old product
      if (optionsBarkodiSelectedNew?.value === selected.value) {
        setOptionsBarkodiSelectedNew(null);
        setNewProdukti({
          emriProduktit: '',
          sasiaNeStok: '',
          qmimiMeShumic: '',
          qmimiShites: '',
          qmimiBlerjes: '',
        });
      }
    } else {
      setOldProdukti({
        emriProduktit: '',
        sasiaNeStok: '',
        qmimiMeShumic: '',
        qmimiShites: '',
        qmimiBlerjes: '',
      });
    }
  };

  const handleChangeNewProduct = (selected) => {
    setOptionsBarkodiSelectedNew(selected);
    if (selected) {
      setNewProdukti({
        emriProduktit: selected.emriProduktit,
        sasiaNeStok: selected.sasiaNeStok,
        qmimiMeShumic: selected.qmimiMeShumic,
        qmimiShites: selected.qmimiShites,
        qmimiBlerjes: selected.qmimiBlerjes,
      });
    } else {
      setNewProdukti({
        emriProduktit: '',
        sasiaNeStok: '',
        qmimiMeShumic: '',
        qmimiShites: '',
        qmimiBlerjes: '',
      });
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/Produkti/bartjaArtikullit?IDArtikulliVjeter=${optionsBarkodiSelectedOld.value}&IDArtikulliRi=${optionsBarkodiSelectedNew.value}`,
        {},
        authentikimi
      );
      setShowConfirmModal(false);
      props.setTipiMesazhit('success');
      props.setPershkrimiMesazhit('Artikulli u transferua me sukses!');
      props.perditesoTeDhenat();
      props.hide();
      props.shfaqmesazhin();
    } catch (err) {
      setShowConfirmModal(false);
      console.error('Error transferring product:', err);
      props.setTipiMesazhit('danger');
      props.setPershkrimiMesazhit('Gabim gjatë transferimit të artikullit!');
      props.shfaqmesazhin();
    }
  };

  const handleSubmit = () => {
    if (!optionsBarkodiSelectedOld || !optionsBarkodiSelectedNew) {
      props.setTipiMesazhit('danger');
      props.setPershkrimiMesazhit('Ju lutem zgjidhni të dy artikujt!');
      props.shfaqmesazhin();
      return;
    }
    setShowConfirmModal(true);
  };

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={['Menaxher', 'Kalkulant']}
        largo={() => props.largo()}
        shfaqmesazhin={() => props.shfaqmesazhin()}
        perditesoTeDhenat={() => props.perditesoTeDhenat()}
        setTipiMesazhit={(e) => props.setTipiMesazhit(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit(e)}
      />
      <Modal
        size="sm"
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        className="sp-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Konfirmo Transferimin</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <p className="text-warning mb-3 small">
            Çmimet dhe stoku i artikullit të vjetër do të barten te artikulli i ri. Artikulli i vjetër do të mbetet me 0.
          </p>
          <h6 className="text-white">A jeni të sigurt?</h6>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn-cancel"
            onClick={() => setShowConfirmModal(false)}
          >
            Anulo
          </Button>
          <Button
            variant="warning"
            className="px-4"
            onClick={handleConfirmSubmit}
          >
            Vazhdo
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        size="xl"
        className="sp-modal"
        show={props.show}
        onHide={props.hide}
      >
        <Modal.Header closeButton>
          <Modal.Title>Transfero Artikullin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="sp-form-container p-2">
            <Row className="g-0">
              <Col md="6" className="pe-md-4 border-end border-secondary border-opacity-25">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-danger bg-opacity-10 p-2 rounded-circle me-3">
                    <div className="text-danger small fw-bold">NGA</div>
                  </div>
                  <h6 className="text-white mb-0">Artikulli i Vjetër</h6>
                </div>

                <div className="sp-input-group mb-3">
                  <label className="sp-label">Zgjidh Burimin <span className="text-danger">*</span></label>
                  <div className="sp-select-container">
                    <Select
                      value={optionsBarkodiSelectedOld}
                      onChange={handleChangeOldProduct}
                      options={realFilteredOptionsOld}
                      placeholder="Kërko artikull (min. 2 shkronja)..."
                      styles={darkSelectStyles}
                      autoFocus
                      isClearable
                      onInputChange={handleInputChangeOld}
                      inputValue={inputValueOld}
                      noOptionsMessage={() => inputValueOld.length < 2 ? "Shkruani të paktën 2 karaktere" : "Nuk u gjet asnjë produkt"}
                    />
                  </div>
                </div>

                <Row className="g-3">
                  <Col xs={12}>
                    <div className="sp-input-group">
                      <label className="sp-label">Emri i Artikullit</label>
                      <Form.Control value={oldProdukti.emriProduktit} disabled className="sp-input opacity-75" />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="sp-input-group">
                      <label className="sp-label">Sasia Aktuale</label>
                      <Form.Control value={oldProdukti.sasiaNeStok} disabled className="sp-input opacity-75" />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="sp-input-group">
                      <label className="sp-label">Çmimi Blerjes</label>
                      <Form.Control value={oldProdukti.qmimiBlerjes} disabled className="sp-input opacity-75" />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="sp-input-group">
                      <label className="sp-label">Çmimi Pakicë</label>
                      <Form.Control value={oldProdukti.qmimiShites} disabled className="sp-input opacity-75" />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="sp-input-group">
                      <label className="sp-label">Çmimi Shumicë</label>
                      <Form.Control value={oldProdukti.qmimiMeShumic} disabled className="sp-input opacity-75" />
                    </div>
                  </Col>
                </Row>
              </Col>

              <Col md="6" className="ps-md-4 mt-4 mt-md-0">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                    <div className="text-success small fw-bold">TE</div>
                  </div>
                  <h6 className="text-white mb-0">Artikulli i Ri</h6>
                </div>

                <div className="sp-input-group mb-3">
                  <label className="sp-label">Zgjidh Destinacionin <span className="text-danger">*</span></label>
                  <div className="sp-select-container">
                    <Select
                      value={optionsBarkodiSelectedNew}
                      onChange={handleChangeNewProduct}
                      options={filteredOptionsBarkodiNew}
                      placeholder="Kërko artikull (min. 2 shkronja)..."
                      styles={darkSelectStyles}
                      isClearable
                      onInputChange={handleInputChangeNew}
                      inputValue={inputValueNew}
                      noOptionsMessage={() => inputValueNew.length < 2 ? "Shkruani të paktën 2 karaktere" : "Nuk u gjet asnjë produkt"}
                    />
                  </div>
                </div>

                <Row className="g-3">
                  <Col xs={12}>
                    <div className="sp-input-group">
                      <label className="sp-label">Emri i Artikullit</label>
                      <Form.Control value={newProdukti.emriProduktit} disabled className="sp-input opacity-75" />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="sp-input-group">
                      <label className="sp-label">Sasia Aktuale</label>
                      <Form.Control value={newProdukti.sasiaNeStok} disabled className="sp-input opacity-75" />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="sp-input-group">
                      <label className="sp-label">Çmimi Blerjes</label>
                      <Form.Control value={newProdukti.qmimiBlerjes} disabled className="sp-input opacity-75" />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="sp-input-group">
                      <label className="sp-label">Çmimi Pakicë</label>
                      <Form.Control value={newProdukti.qmimiShites} disabled className="sp-input opacity-75" />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="sp-input-group">
                      <label className="sp-label">Çmimi Shumicë</label>
                      <Form.Control value={newProdukti.qmimiMeShumic} disabled className="sp-input opacity-75" />
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-cancel" onClick={props.hide}>
            Anulo
          </Button>
          <Button
            className="btn-save px-4"
            onClick={handleSubmit}
          >
            Ekzekuto Transferimin
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default BartjaArtikullit;
