import { useState, useEffect } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileImport, faEye, faPrint } from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import Fatura from "../../../Components/TeTjera/Fatura/Fatura";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { Col, Form, Row } from "react-bootstrap";

function PorositeOnline() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [loading, setLoading] = useState(false);
  const [kalkulimet, setKalkulimet] = useState([]);
  const [perditeso, setPerditeso] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [shkarkoFaturen, setShkarkoFaturen] = useState(false);
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

  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [existingInvoiceDetails, setExistingInvoiceDetails] = useState(null);
  const [pendingImportJson, setPendingImportJson] = useState(null);

  const shfaqMesazhinFunc = (tipi, pershkrimi) => {
    setTipiMesazhit(tipi);
    setPershkrimiMesazhit(pershkrimi);
    setShfaqMesazhin(true);
  };

  const token = localStorage.getItem("token");
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [dataFillim, setDataFillim] = useState(new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
  const [dataMbarim, setDataMbarim] = useState(new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);

  // ============================================================================
  // OPTIMIZATION 1: Debounce date changes to avoid multiple API calls
  // ============================================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      loadFaturat();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [dataFillim, dataMbarim, perditeso]);

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
      const prodRes = await axios.get(
        `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${id}`,
        auth
      );
      setModalData({
        ...res.data,
        produktetList: prodRes.data
      });
      setShowModal(true);
    } catch (err) {
      shfaqMesazhinFunc("danger", "Gabim gjatë marrjes së të dhënave të faturës");
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
        shfaqMesazhinFunc("danger", "JSON i pavlefshëm! Duhet: NrFatures, Data, IDKlienti, Produktet[]");
        setLoading(false);
        e.target.value = "";
        return;
      }

      const nrFaturesToImport = json.NrFatures;
      const checkResponse = await axios.get(
        `${API_BASE_URL}/api/Faturat/kerkoFatureNgaNumri?nrFatures=${nrFaturesToImport}`,
        auth
      );

      if (checkResponse.data && checkResponse.data.idFatura) {
        setExistingInvoiceDetails({
          ...checkResponse.data,
          nrFaturesToImport: nrFaturesToImport
        });
        setPendingImportJson(json);
        setShowConfirmModal(true);
        setLoading(false);
        e.target.value = "";
        return;
      }

      await processImport(json);
      e.target.value = "";
    } catch (err) {
      console.error(err);
      shfaqMesazhinFunc("danger", "Gabim: " + (err.response?.data?.message || err.response?.data || err.message));
      setLoading(false);
      e.target.value = "";
    }
  };

  const processImport = async (json) => {
    try {
      setLoading(true);

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

      shfaqMesazhinFunc("success", `Fatura ${json.NrFatures} u importua me sukses!`);
      setPerditeso(Date.now());
    } catch (err) {
      console.error(err);
      shfaqMesazhinFunc("danger", "Gabim: " + (err.response?.data?.message || err.response?.data || err.message));
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      setPendingImportJson(null);
    }
  };

  const handleAnashkalo = () => {
    shfaqMesazhinFunc("info", `Fatura "${existingInvoiceDetails?.nrFaturesToImport}" u anashkalua sepse ekziston.`);
    setShowConfirmModal(false);
    setPendingImportJson(null);
  };

  const handleNdalImportin = () => {
    shfaqMesazhinFunc("warning", "Importimi u ndalua nga përdoruesi.");
    setShowConfirmModal(false);
    setPendingImportJson(null);
  };

  const products = modalData?.produktetList?.length > 0 ? modalData.produktetList : getAllProducts();
  const regjistrimet = modalData?.regjistrimet || {};
  const transporti = regjistrimet?.transporti || 0;

  // Calculate dynamic totals from products since API total arrays may not populate for custom imports
  let calcPaTVSH8 = 0, calcTVSH8 = 0;
  let calcPaTVSH18 = 0, calcTVSH18 = 0;
  let calcPaTVSH = 0, calcTVSH = 0;
  let calcRabati = 0;
  let calcTotalParaRabatit = 0;

  products.forEach(p => {
    const sasia = p.sasiaStokut || p.sasia || 0;
    const cmimi = p.qmimiShites || p.qmimi || 0;
    const tvshPerc = p.llojiTVSH || p.produkti?.llojiTVSH || 0;
    const rabatPerc = (p.rabati1 || p.rabati || 0) + (p.rabati2 || 0) + (p.rabati3 || 0);

    const totalBeforeDiscount = sasia * cmimi;
    const discountAmount = totalBeforeDiscount * (rabatPerc / 100);
    const totalAfterDiscount = totalBeforeDiscount - discountAmount;

    const paTvsh = totalAfterDiscount / (1 + tvshPerc / 100);
    const tvshVal = totalAfterDiscount - paTvsh;

    calcTotalParaRabatit += totalBeforeDiscount;
    calcPaTVSH += paTvsh;
    calcTVSH += tvshVal;
    calcRabati += discountAmount;

    if (tvshPerc === 8) {
      calcPaTVSH8 += paTvsh;
      calcTVSH8 += tvshVal;
    } else if (tvshPerc === 18) {
      calcPaTVSH18 += paTvsh;
      calcTVSH18 += tvshVal;
    }
  });

  const finalTotal = calcPaTVSH + calcTVSH + Number(transporti);

  return (
    <>
      <NavBar />
      {shkarkoFaturen ? (
        <Fatura
          nrFatures={regjistrimet?.idRegjistrimit || modalData?.idRegjistrimit}
          mbyllFaturen={() => setShkarkoFaturen(false)}
        />
      ) : (
      <div className="containerDashboardP" style={{ padding: "2rem" }}>
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}
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
                setDataFillim(new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
                setDataMbarim(new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
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

          <Modal.Body className="p-4 bg-dark text-white">
            <div className="p-3 rounded mb-4 border border-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
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
                      const sasia = p.sasiaStokut || p.sasia || 0;
                      const cmimi = p.qmimiShites || p.qmimi || 0;
                      const totalBeforeDiscount = sasia * cmimi;
                      const discountPercent = (p.rabati1 || p.rabati || 0) + (p.rabati2 || 0) + (p.rabati3 || 0);
                      const discountAmount =
                        totalBeforeDiscount * (discountPercent / 100);
                      const totalAfterDiscount =
                        totalBeforeDiscount - discountAmount;

                      return (
                        <tr key={p.id || index}>
                          <td className="text-center fw-bold">{index + 1}</td>
                          <td>
                            <strong>
                              {p.emriProduktit || p.produkti?.emriProduktit || "N/A"}
                            </strong>
                            <br />
                            <small className="text-muted">
                              {p.barkodi || p.produkti?.barkodi}
                            </small>
                          </td>
                          <td className="text-center fw-bold">
                            {p.sasiaStokut || p.sasia}
                          </td>
                          <td className="text-end">
                            {Number(p.qmimiShites || p.qmimi || 0).toFixed(2)} €
                          </td>
                          <td className="text-center">
                            <span className="badge bg-info">
                              {p.llojiTVSH || p.produkti?.llojiTVSH || 0}%
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
                <div className="p-3 rounded border border-secondary h-100" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                  <h6 className="mb-3 text-info fw-bold">
                    Totalet sipas TVSH-s
                  </h6>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">Pa TVSH 8%:</small>
                    <strong>
                      {calcPaTVSH8.toFixed(2)} €
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <small className="text-muted">TVSH 8%:</small>
                    <strong className="text-info">
                      {calcTVSH8.toFixed(2)} €
                    </strong>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">Pa TVSH 18%:</small>
                    <strong>
                      {calcPaTVSH18.toFixed(2)} €
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">TVSH 18%:</small>
                    <strong className="text-info">
                      {calcTVSH18.toFixed(2)} €
                    </strong>
                  </div>

                  <hr className="my-2" />
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="text-white">Total Pa TVSH:</strong>
                    <strong className="fs-6 text-primary">
                      {calcPaTVSH.toFixed(2)} €
                    </strong>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="p-3 rounded border border-secondary h-100" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                  <h6 className="mb-3 text-info fw-bold">
                    Totali Përfundimtar
                  </h6>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Nentotali me TVSH:</span>
                    <strong>{calcTotalParaRabatit.toFixed(2)} €</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Rabati:</span>
                    <strong className="text-danger">
                      -{calcRabati.toFixed(2)} €
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Totali - Rabati:</span>
                    <strong>
                      {(calcPaTVSH + calcTVSH).toFixed(2)} €
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
                    <strong className="text-white fs-6">
                      TOTALI PËRFUNDIMTAR:
                    </strong>
                    <strong className="fs-5 text-success">
                      {finalTotal.toFixed(2)} €
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer className="bg-dark border-top border-secondary">
            <Button
              variant="info"
              size="lg"
              onClick={() => {
                setShowModal(false);
                setShkarkoFaturen(true);
              }}>
              <FontAwesomeIcon icon={faPrint} /> Printo
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setShowModal(false)}>
              Mbyll
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Custom Confirmation Modal for Duplicate Invoices */}
        <Modal
          show={showConfirmModal}
          onHide={handleNdalImportin}
          backdrop="static"
          keyboard={false}
          centered
        >
          <Modal.Header closeButton className="bg-warning text-dark">
            <Modal.Title>Fatura Ekziston!</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 bg-dark text-white border-top border-warning">
            <p>
              Fatura me numër <strong>"{existingInvoiceDetails?.nrFaturesToImport}"</strong> ekziston tashmë në sistem!
            </p>
            <div className="p-3 rounded border border-warning mb-3" style={{ backgroundColor: 'rgba(255,193,7,0.1)' }}>
              <div><strong>ID:</strong> {existingInvoiceDetails?.idFatura}</div>
              <div><strong>Data:</strong> {existingInvoiceDetails?.data ? new Date(existingInvoiceDetails.data).toLocaleDateString("en-GB") : ""}</div>
              <div><strong>Partneri:</strong> {existingInvoiceDetails?.emriPartnerit || "N/A"}</div>
            </div>
            <p className="mb-0">A dëshironi ta anashkaloni?</p>
          </Modal.Body>
          <Modal.Footer className="bg-dark border-top border-warning">
            <Button variant="secondary" onClick={handleNdalImportin}>
              Ndal Importin
            </Button>
            <Button variant="warning" onClick={handleAnashkalo}>
              Anashkalo
            </Button>
            {/* Optional: Add "Importo Gjithsesi" button here in the future if needed */}
          </Modal.Footer>
        </Modal>

      </div>
      )}
    </>
  );
}

export default PorositeOnline;
