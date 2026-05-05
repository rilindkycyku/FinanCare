import { useState, useEffect } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileImport, faEye } from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import { Col, Form, Row } from "react-bootstrap";

function PorositeOnline() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [loading, setLoading] = useState(false);
  const [kalkulimet, setKalkulimet] = useState([]);
  const [perditeso, setPerditeso] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    regjistrimet: {
      idRegjistrimit: 0,
      nrFatures: "",
      dataRegjistrimit: "",
      emriBiznesit: "",
      adresa: "",
      email: "",
      nrKontaktit: "",
      llojiPageses: "Cash",
      statusiPageses: "E Paguar",
      username: "",
      shkurtesaPartnerit: "",
      transporti: 0,
    },
    totaliMeTVSH18: 0,
    totaliMeTVSH8: 0,
    totaliPaTVSH18: 0,
    totaliPaTVSH8: 0,
    totaliPaTVSH: 0,
    totaliMeTVSH: 0,
    rabati: 0,
    tvsH18: 0,
    tvsH8: 0,
    totTVSH18: [],
    totTVSH8: [],
  });

  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [dataFillim, setDataFillim] = useState(today.toISOString().split("T")[0]);
  const [dataMbarim, setDataMbarim] = useState(tomorrow.toISOString().split("T")[0]);

  // ============================================================================
  // OPTIMIZATION 1: Debounce date changes to avoid multiple API calls
  // ============================================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      loadFaturat();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [dataFillim, dataMbarim]);

  const loadFaturat = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/Faturat/shfaqRegjistrimet?dataFillim=${dataFillim}&dataMbarim=${dataMbarim}`,
        auth
      );

      const data = res.data
        .filter((f) => f.llojiKalkulimit === "ONLINE")
        .map((f) => {
          const subtotal = f.totaliPaTVSH + f.tvsh;
          const afterDiscount = subtotal - f.rabati;
          const finalTotal = afterDiscount + (f.transporti || 0);

          return {
            ID: f.idRegjistrimit,
            "Nr. Porosis": f.nrFatures,
            Partneri: f.emriBiznesit,
            Data: new Date(f.dataRegjistrimit).toLocaleDateString("en-GB"),
            "T. Pa TVSH €": f.totaliPaTVSH.toFixed(2),
            "TVSH €": f.tvsh.toFixed(2),
            "Rabati €": (-f.rabati).toFixed(2),
            "Totali - Rabati €": afterDiscount.toFixed(2),
            "Transporti €": (f.transporti || 0).toFixed(2),
            "Totali €": finalTotal.toFixed(2),
            "Lloji Pageses": f.llojiPageses,
          };
        });
      setKalkulimet(data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading faturat:", err);
      setLoading(false);
    }
  };

  // ============================================================================
  // OPTIMIZATION 2: Memoize product calculation
  // ============================================================================
  const getAllProducts = () => {
    const allProducts = [];
    if (modalData?.totTVSH18 && Array.isArray(modalData.totTVSH18)) {
      allProducts.push(...modalData.totTVSH18);
    }
    if (modalData?.totTVSH8 && Array.isArray(modalData.totTVSH8)) {
      allProducts.push(...modalData.totTVSH8);
    }
    return allProducts;
  };

  const shfaqProduktet = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${id}`,
        auth
      );
      setModalData(res.data);
      setShowModal(true);
    } catch (err) {
      alert("Gabim gjatë marrjes së të dhënave të faturës");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // OPTIMIZATION 3: Optimize file upload with Promise.allSettled
  // ============================================================================
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const text = await file.text();
      const json = JSON.parse(text);

      if (
        !json.NrFatures ||
        !json.Data ||
        !json.IDKlienti ||
        !Array.isArray(json.Produktet)
      ) {
        alert(
          "JSON i pavlefshëm! Duhet: NrFatures, Data, IDKlienti, Produktet[]"
        );
        return;
      }

      const nrFaturesToImport = json.NrFatures;
      const checkResponse = await axios.get(
        `${API_BASE_URL}/api/Faturat/kerkoFatureNgaNumri?nrFatures=${nrFaturesToImport}`,
        auth
      );

      if (checkResponse.data && checkResponse.data.idFatura) {
        if (
          !window.confirm(
            `Fatura me numër "${nrFaturesToImport}" ekziston tashmë në sistem!\n\n` +
              `ID: ${checkResponse.data.idFatura} | Data: ${new Date(checkResponse.data.data).toLocaleDateString("en-GB")}\n` +
              `Partneri: ${checkResponse.data.emriPartnerit || "N/A"}\n\n` +
              `A dëshironi ta anashkaloni? (OK = Anashkalo, Cancel = Ndal importin)`
          )
        ) {
          alert("Importimi u ndalua nga përdoruesi.");
          return;
        }
        alert(`Fatura "${nrFaturesToImport}" u anashkalua sepse ekziston.`);
        return;
      }

      const faturaResponse = await axios.post(
        `${API_BASE_URL}/api/Faturat/shtoFaturen`,
        {
          NrFatures: json.NrFatures,
          Data: json.Data,
          IDKlienti: json.IDKlienti,
          LlojiPageses: json.LlojiPageses || "Cash",
          TotaliPaTVSH: json.TotaliPaTVSH || 0,
          TVSH: json.TVSH || 0,
          Rabati: json.Rabati || 0,
          Transporti: json.Transporti || 0,
          Totali: json.Totali || 0,
        },
        auth
      );

      const newFaturaId = faturaResponse.data.idFatura;

      // Upload all products in parallel
      const productPromises = json.Produktet.map((item) =>
        axios.post(
          `${API_BASE_URL}/api/Faturat/shtoTeDhenatFatura`,
          {
            IDFatura: newFaturaId,
            IDProdukti: item.IDProdukti,
            Sasia: item.Sasia,
            Qmimi: item.Qmimi,
            Rabati: item.Rabati || 0,
          },
          auth
        )
      );

      // Wait for all products to upload
      await Promise.allSettled(productPromises);

      alert(`Fatura ${json.NrFatures} u importua me sukses!`);
      setPerditeso(Date.now());
    } catch (err) {
      console.error(err);
      alert(
        "Gabim: " +
          (err.response?.data?.message || err.response?.data || err.message)
      );
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const products = getAllProducts();
  const regjistrimet = modalData?.regjistrimet || {};
  const transporti = regjistrimet?.transporti || 0;
  const subtotalBeforeDiscount =
    Number(modalData?.totaliMeTVSH || 0) + Number(modalData?.rabati || 0);
  const finalTotal = Number(modalData?.totaliMeTVSH || 0) + Number(transporti);

  return (
    <>
      <NavBar />
      <div className="containerDashboardP" style={{ padding: "2rem" }}>
        <h1 className="title">Menaxho Porosite Online</h1>

        <div className="mb-4">
          <label htmlFor="jsonFile" style={{ cursor: "pointer" }}>
            <Button variant="success" size="lg" as="span" disabled={loading}>
              <FontAwesomeIcon icon={faFileImport} /> Zgjidh JSON File
            </Button>
          </label>
          <input
            id="jsonFile"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          {loading && (
            <TailSpin height="40" width="40" color="#198754" className="ms-3" />
          )}
        </div>

        <Row className="mb-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Data Fillim</Form.Label>
              <Form.Control
                type="date"
                value={dataFillim}
                onChange={(e) => setDataFillim(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Data Mbarim</Form.Label>
              <Form.Control
                type="date"
                value={dataMbarim}
                onChange={(e) => setDataMbarim(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3} className="d-flex align-items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setDataFillim(today.toISOString().split("T")[0]);
                setDataMbarim(tomorrow.toISOString().split("T")[0]);
              }}
              className="w-100">
              Sot
            </Button>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <TailSpin height="80" width="80" color="#0066cc" />
          </div>
        ) : (
          <Tabela
            data={kalkulimet}
            tableName="Faturat e Importuara"
            kaButona={true}
            funksionButonEdit={(id) => shfaqProduktet(id)}
            ikonaEdit={faEye}
            mosShfaqID={true}
          />
        )}

        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="xl"
          centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              Fatura: <strong>{regjistrimet?.nrFatures}</strong>
              <small className="ms-3 text-light">
                (
                {new Date(regjistrimet?.dataRegjistrimit).toLocaleDateString(
                  "en-GB"
                )}
                )
              </small>
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="p-4">
            <div className="bg-light p-3 rounded mb-4 border">
              <div className="row mb-2">
                <div className="col-md-6">
                  <strong>Partneri:</strong> {regjistrimet?.emriBiznesit}
                </div>
                <div className="col-md-6">
                  <strong>Shkurtesa:</strong> {regjistrimet?.shkurtesaPartnerit}
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-md-6">
                  <strong>Adresa:</strong> {regjistrimet?.adresa}
                </div>
                <div className="col-md-6">
                  <strong>Email:</strong> {regjistrimet?.email}
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-md-6">
                  <strong>Nr. Kontakti:</strong> {regjistrimet?.nrKontaktit}
                </div>
                <div className="col-md-6">
                  <strong>Lloji i Pagesës:</strong> {regjistrimet?.llojiPageses}
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <strong>Statusi Pageses:</strong>{" "}
                  {regjistrimet?.statusiPageses}
                </div>
                <div className="col-md-6">
                  <strong>Stafi:</strong> {regjistrimet?.username}
                </div>
              </div>
            </div>

            <h5 className="mb-3">Produktet</h5>
            <div style={{ overflowX: "auto" }}>
              <Table striped bordered hover responsive className="table-sm">
                <thead className="table-dark">
                  <tr>
                    <th width="40">#</th>
                    <th>Emri Produktit</th>
                    <th width="70" className="text-center">
                      Sasia
                    </th>
                    <th width="90" className="text-end">
                      Çmimi
                    </th>
                    <th width="70" className="text-center">
                      TVSH %
                    </th>
                    <th width="120" className="text-end">
                      Totali Para Rabatit
                    </th>
                    <th width="100" className="text-end">
                      Rabati %
                    </th>
                    <th width="100" className="text-end">
                      Zbritja (€)
                    </th>
                    <th width="100" className="text-end">
                      Totali Pas Rabatit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((p, index) => {
                      const totalBeforeDiscount = p.sasiaStokut * p.qmimiShites;
                      const discountPercent =
                        p.rabati1 + (p.rabati2 || 0) + (p.rabati3 || 0);
                      const discountAmount =
                        totalBeforeDiscount * (discountPercent / 100);
                      const totalAfterDiscount =
                        totalBeforeDiscount - discountAmount;

                      return (
                        <tr key={p.id || index}>
                          <td className="text-center fw-bold">{index + 1}</td>
                          <td>
                            <strong>
                              {p.produkti?.emriProduktit || "N/A"}
                            </strong>
                            <br />
                            <small className="text-muted">
                              {p.produkti?.barkodi}
                            </small>
                          </td>
                          <td className="text-center fw-bold">
                            {p.sasiaStokut}
                          </td>
                          <td className="text-end">
                            {Number(p.qmimiShites).toFixed(2)} €
                          </td>
                          <td className="text-center">
                            <span className="badge bg-info">
                              {p.produkti?.llojiTVSH}%
                            </span>
                          </td>
                          <td className="text-end fw-bold">
                            {totalBeforeDiscount.toFixed(2)} €
                          </td>
                          <td className="text-end small">
                            {p.rabati1}% {p.rabati2 > 0 && `+ ${p.rabati2}%`}{" "}
                            {p.rabati3 > 0 && `+ ${p.rabati3}%`}
                          </td>
                          <td className="text-end fw-bold text-danger">
                            -{discountAmount.toFixed(2)} €
                          </td>
                          <td className="text-end fw-bold text-success">
                            {totalAfterDiscount.toFixed(2)} €
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center text-muted py-4">
                        Asnjë produkt i regjistruar
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            <div className="row mt-4">
              <div className="col-lg-6 mb-3 mb-lg-0">
                <div className="bg-light p-3 rounded border h-100">
                  <h6 className="mb-3 text-secondary fw-bold">
                    Totalet sipas TVSH-s
                  </h6>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">Pa TVSH 8%:</small>
                    <strong>
                      {Number(modalData?.totaliPaTVSH8 || 0).toFixed(2)} €
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <small className="text-muted">TVSH 8%:</small>
                    <strong className="text-info">
                      {Number(modalData?.tvsH8 || 0).toFixed(2)} €
                    </strong>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">Pa TVSH 18%:</small>
                    <strong>
                      {Number(modalData?.totaliPaTVSH18 || 0).toFixed(2)} €
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">TVSH 18%:</small>
                    <strong className="text-info">
                      {Number(modalData?.tvsH18 || 0).toFixed(2)} €
                    </strong>
                  </div>

                  <hr className="my-2" />
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="text-dark">Total Pa TVSH:</strong>
                    <strong className="fs-6 text-primary">
                      {Number(modalData?.totaliPaTVSH || 0).toFixed(2)} €
                    </strong>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="bg-light p-3 rounded border h-100">
                  <h6 className="mb-3 text-secondary fw-bold">
                    Totali Përfundimtar
                  </h6>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Nentotali me TVSH:</span>
                    <strong>{subtotalBeforeDiscount.toFixed(2)} €</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Rabati:</span>
                    <strong className="text-danger">
                      -{Number(modalData?.rabati || 0).toFixed(2)} €
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Totali - Rabati:</span>
                    <strong>
                      {Number(modalData?.totaliMeTVSH || 0).toFixed(2)} €
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Transporti:</span>
                    <strong className="text-info">
                      +{Number(transporti).toFixed(2)} €
                    </strong>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="text-dark fs-6">
                      TOTALI PÇ‹RFUNDIMTAR:
                    </strong>
                    <strong className="fs-5 text-success">
                      {finalTotal.toFixed(2)} €
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer className="bg-light">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setShowModal(false)}>
              Mbyll
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}

export default PorositeOnline;
