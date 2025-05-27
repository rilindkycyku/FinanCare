import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { MDBCol, MDBInput, MDBRow } from "mdb-react-ui-kit";
import { Form } from "react-bootstrap";
import Select from "react-select";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";


const ShtoProduktin = (props) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const getToken = localStorage.getItem('token');
  const authentikimi = { headers: { Authorization: `Bearer ${getToken}` } };

  const [produktet, setProduktet] = useState([]);
  const [optionsBarkodi, setOptionsBarkodi] = useState([]);
  const [optionsBarkodiSelectedOld, setOptionsBarkodiSelectedOld] = useState(null);
  const [optionsBarkodiSelectedNew, setOptionsBarkodiSelectedNew] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [oldProdukti, setOldProduktit] = useState({
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
    menu: (provided) => ({
      ...provided,
      zIndex: 1050,
    }),
  };

  // Compute filtered options for New Product Select
  const filteredOptionsBarkodiNew = optionsBarkodi.filter(
    (option) => option.value !== optionsBarkodiSelectedOld?.value
  );

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
      setOldProduktit({
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
      >
        <Modal.Header closeButton>
          <Modal.Title as="h6">Konfirmo Transferimin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ fontSize: '10pt' }}>
            Çmimet dhe stoku i artikullit të vjetër do të vendosen në 0, dhe artikulli i ri do të
            përditësohet me të dhënat e artikullit të vjetër.
          </p>
          <strong style={{ fontSize: '10pt' }}>
            A jeni të sigurt që dëshironi të vazhdoni?
          </strong>
        </Modal.Body>
        <Modal.Footer>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Anulo <FontAwesomeIcon icon={faXmark} />
          </Button>
          <Button
            size="sm"
            variant="warning"
            onClick={handleConfirmSubmit}
          >
            Vazhdo
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        size="xl"
        className="modalEditShto"
        show={props.show}
        onHide={props.hide}
      >
        <Modal.Header closeButton>
          <Modal.Title>Transfero Artikullin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MDBRow className="g-3">
            <MDBCol
              md="6"
              style={{
                borderRight: '2px solid #ccc',
                paddingRight: '20px',
              }}
            >
              <h5>Artikulli i Vjetër (Artikulli nga i cili do merren të dhënat)</h5>
              <Form.Group controlId="oldProduktiSelect">
                <Form.Label>Zgjidh Artikullin e Vjetër</Form.Label>
                <Select
                  value={optionsBarkodiSelectedOld}
                  onChange={handleChangeOldProduct}
                  options={optionsBarkodi}
                  id="barkodiSelectOld"
                  inputId="barkodiSelectOld-input"
                  styles={customStyles}
                  autoFocus
                  isClearable
                />
              </Form.Group>
              <MDBInput
                value={oldProdukti.emriProduktit}
                name="emriProduktit"
                type="text"
                label="Emri"
                disabled
                className="mt-3"
              />
              <MDBInput
                value={oldProdukti.sasiaNeStok}
                name="sasiaNeStok"
                type="number"
                label="Sasia Aktuale në Stok"
                disabled
                className="mt-3"
              />
              <MDBInput
                value={oldProdukti.qmimiMeShumic}
                name="qmimiMeShumic"
                type="number"
                label="Qmimi Shumicë"
                disabled
                className="mt-3"
              />
              <MDBInput
                value={oldProdukti.qmimiShites}
                name="qmimiShites"
                type="number"
                label="Qmimi Pakicë"
                disabled
                className="mt-3"
              />
              <MDBInput
                value={oldProdukti.qmimiBlerjes}
                name="qmimiBlerjes"
                type="number"
                label="Qmimi Blerjes"
                disabled
                className="mt-3"
              />
            </MDBCol>
            <MDBCol md="6" style={{ paddingLeft: '20px' }}>
              <h5>Artikulli i Ri (Artikulli në të cilin do barten të dhënat)</h5>
              <Form.Group controlId="newProduktiSelect">
                <Form.Label>Zgjidh Artikullin e Ri</Form.Label>
                <Select
                  value={optionsBarkodiSelectedNew}
                  onChange={handleChangeNewProduct}
                  options={filteredOptionsBarkodiNew}
                  id="barkodiSelectNew"
                  inputId="barkodiSelectNew-input"
                  styles={customStyles}
                  isClearable
                />
              </Form.Group>
              <MDBInput
                value={newProdukti.emriProduktit}
                name="emriProduktit"
                type="text"
                label="Emri"
                disabled
                className="mt-3"
              />
              <MDBInput
                value={newProdukti.sasiaNeStok}
                name="sasiaNeStok"
                type="number"
                label="Sasia Aktuale në Stok"
                disabled
                className="mt-3"
              />
              <MDBInput
                value={newProdukti.qmimiMeShumic}
                name="qmimiMeShumic"
                type="number"
                label="Qmimi Shumicë"
                disabled
                className="mt-3"
              />
              <MDBInput
                value={newProdukti.qmimiShites}
                name="qmimiShites"
                type="number"
                label="Qmimi Pakicë"
                disabled
                className="mt-3"
              />
              <MDBInput
                value={newProdukti.qmimiBlerjes}
                name="qmimiBlerjes"
                type="number"
                label="Qmimi Blerjes"
                disabled
                className="mt-3"
              />
            </MDBCol>
          </MDBRow>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={props.hide}>
            Close <FontAwesomeIcon icon={faXmark} />
          </Button>
          <Button
            style={{ backgroundColor: '#009879', border: 'none' }}
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ShtoProduktin;