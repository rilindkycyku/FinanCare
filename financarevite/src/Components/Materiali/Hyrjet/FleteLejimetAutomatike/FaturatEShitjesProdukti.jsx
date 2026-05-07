import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Modal, Button, Row, Col, Form, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faPenToSquare, faSearch, faFileInvoice } from "@fortawesome/free-solid-svg-icons";
import { MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import Select from "react-select";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";
import TeDhenatKalkulimit from "./TeDhenatKalkulimit";
import { darkSelectStyles } from "@/utils/darkSelectStyles";

// Global variable to cache products in memory (RAM) instead of sessionStorage
// This persists data as long as the page is open, avoiding storage quotas
let globalCachedProducts = null;

function PerditesoStatusinKalk(props) {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://localhost:7285";

  // State variables
  const [kalkulimet, setKalkulimet] = useState([]);
  const [perditeso, setPerditeso] = useState("");
  const [optionsSelected, setOptionsSelected] = useState(null);
  const [shfaqTeDhenat, setShfaqTeDhenat] = useState(false);
  const [id, setId] = useState(0);
  const [error, setError] = useState(null);

  // Initialize products from global cache if available
  const [listaProdukteve, setListaProdukteve] = useState(globalCachedProducts || []);

  // If we have cached products, we are not loading. Otherwise we are.
  const [loadingProducts, setLoadingProducts] = useState(!globalCachedProducts);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Product list and search
  const [inputValue, setInputValue] = useState("");

  const getToken = localStorage.getItem("token") || "";

  const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

  const customStyles = useMemo(
    () => ({
      menu: (provided) => ({
        ...provided,
        zIndex: 1050,
      }),
      control: (base) => ({
        ...base,
        borderColor: '#dee2e6',
        borderRadius: '0.375rem',
        padding: '0.1rem',
        boxShadow: 'none',
        '&:hover': {
          borderColor: '#adb5bd',
        },
      }),
    }),
    [],
  );

  // Load products once on mount (or use cache)
  useEffect(() => {
    // If we already have data in the global variable, we don't need to fetch
    if (globalCachedProducts && globalCachedProducts.length > 0) {
      setListaProdukteve(globalCachedProducts);
      setLoadingProducts(false);
      return;
    }

    let isMounted = true;
    const vendosProduktet = async () => {
      // Only set loading if we don't have data (extra safety check)
      if (isMounted && !globalCachedProducts) setLoadingProducts(true);

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Produkti/ProduktetPerPOS`,
          authentikimi
        );
        if (!isMounted) return;

        // Save to global variable
        globalCachedProducts = response.data;

        setListaProdukteve(response.data);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError({
          message: "Dështoi marrja e produkteve. Ju lutem provoni përsëri.",
          details: err.response?.data?.message || err.message,
        });
        console.error("Product fetch error:", err);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };

    vendosProduktet();

    return () => {
      isMounted = false;
    };
  }, [API_BASE_URL, authentikimi]);

  // Filter products locally based on search input
  const handleInputChange = (val) => {
    setInputValue(val);
    return val;
  };

  const filteredOptions = useMemo(() => {
    // Optimization: Don't map/filter if input is too short or list is empty
    if (!listaProdukteve || listaProdukteve.length === 0) return [];
    if (!inputValue || inputValue.length < 2) return [];

    const lower = inputValue.toLowerCase();

    return listaProdukteve
      .filter((item) => {
        const label = `${item.emriProduktit} - ${item.barkodi} - ${item.kodiProduktit}`;
        return label.toLowerCase().includes(lower);
      })
      .slice(0, 50) // Limit to 50 items for performance
      .map((item) => ({
        value: item.produktiID,
        label: `${item.emriProduktit} - ${item.barkodi} - ${item.kodiProduktit}`,
        item: item,
      }));
  }, [inputValue, listaProdukteve]);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [dataFillim, setDataFillim] = useState(
    new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
  );
  const [dataMbarim, setDataMbarim] = useState(
    new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
  );

  // Fetch invoices with debounce
  useEffect(() => {
    // Skip if not visible
    if (!props.show) return;

    let isMounted = true;
    const timer = setTimeout(() => {
      const shfaqKalkulimet = async () => {
        if (!optionsSelected?.value) {
          if (isMounted) {
            setKalkulimet([]);
            setLoadingInvoices(false);
          }
          return;
        }

        if (isMounted) setLoadingInvoices(true);

        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaProdukti?id=${optionsSelected.value}&partneriID=${props.pID}&dataFillim=${dataFillim}&dataMbarim=${dataMbarim}`,
            authentikimi
          );

          if (!isMounted) return;

          console.log("Response data:", response.data);

          const kalkulimetFiltered = Array.isArray(response.data?.regjistrimet)
            ? response.data.regjistrimet.filter(
              (item) => item.llojiKalkulimit === "FAT" && item.idPartneri === props.pID
            )
            : [];

          setKalkulimet(kalkulimetFiltered);

          if (kalkulimetFiltered.length === 0) {
            setError({
              message: "Nuk u gjetën fatura për produktin e zgjedhur.",
            });
          } else {
            setError(null);
          }
        } catch (err) {
          if (!isMounted) return;

          if (err.response && err.response.status === 404) {
            setError({
              message: "Nuk u gjetën fatura për produktin e zgjedhur.",
            });
          } else {
            setError({
              message: "Dështoi marrja e faturave.",
              details: err.response?.data?.message || err.message,
              status: err.response?.status,
            });
          }
          console.error("Invoice fetch error:", err);
        } finally {
          if (isMounted) setLoadingInvoices(false);
        }
      };
      shfaqKalkulimet();
    }, 500); // Debounce 500ms

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    optionsSelected,
    perditeso,
    dataFillim,
    dataMbarim,
    API_BASE_URL,
    authentikimi,
    props.show,
    props.pID
  ]);

  const mbyllTeDhenat = () => {
    setShfaqTeDhenat(false);
  };

  const handleShfaqTeDhenat = (id) => {
    setId(id);
    setShfaqTeDhenat(true);
  };

  async function vendosProduktetPerFletkthim(id) {
    if (!optionsSelected?.value) return;

    try {
      setLoadingUpdate(true);
      const kalkulimi = await axios.get(
        `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?IDRegjistrimit=${id}`,
        authentikimi
      );
      const produktetNeKalkulim = kalkulimi.data;

      // Filter products that match the selected one
      const matchingProducts = produktetNeKalkulim.filter(
        (produkt) => produkt.idProduktit == optionsSelected.value
      );

      if (matchingProducts.length === 0) {
        setError({ message: "Produkti nuk u gjet në këtë faturë." });
        return;
      }

      await Promise.all(
        matchingProducts.map((produkt) =>
          axios.post(
            `${API_BASE_URL}/api/Faturat/ruajKalkulimin/teDhenat`,
            {
              idRegjistrimit: props.id,
              idProduktit: produkt.idProduktit,
              sasiaStokut: produkt.sasiaStokut,
              qmimiBleres: -produkt.qmimiBleres,
              qmimiShites: -produkt.qmimiShites,
              qmimiShitesMeShumic: -produkt.qmimiShitesMeShumic,
              rabati1: -produkt.rabati1,
              rabati2: -produkt.rabati2,
              rabati3: -produkt.rabati3,
            },
            authentikimi
          )
        )
      );

      setPerditeso(Date.now().toString());
      if (props.perditeso) props.perditeso();
      if (props.hide) props.hide();

    } catch (err) {
      setError({
        message: "Dështoi përditësimi i të dhënave të faturës.",
        details: err.response?.data?.message || err.message,
      });
      console.error("Update invoice error:", err);
    } finally {
      setLoadingUpdate(false);
    }
  }

  // Check if any operation is loading
  const isLoading = loadingProducts || loadingInvoices || loadingUpdate;

  return (
    <div className="container mx-auto p-4">
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant", "Faturist"]}
        largo={props.largo}
        shfaqmesazhin={props.shfaqmesazhin}
        perditesoTeDhenat={props.perditesoTeDhenat}
        setTipiMesazhit={props.setTipiMesazhit}
        setPershkrimiMesazhit={props.setPershkrimiMesazhit}
      />

      <Modal
        show={shfaqTeDhenat}
        onHide={mbyllTeDhenat}
        size="xl"
        centered
        scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Të Dhënat e Faturës</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <TeDhenatKalkulimit
            id={id}
            show={shfaqTeDhenat}
            onHide={mbyllTeDhenat}
            largo={props.largo}
            shfaqmesazhin={props.shfaqmesazhin}
            perditesoTeDhenat={props.perditesoTeDhenat}
            setTipiMesazhit={props.setTipiMesazhit}
            setPershkrimiMesazhit={props.setPershkrimiMesazhit}
          />
        </Modal.Body>
      </Modal>

      <Modal size="xl" className="mt-12" show={props.show} onHide={props.hide}>
        <Modal.Header closeButton className="border-bottom-0 pb-0">
          <Modal.Title className="fw-bold">Lista e Kalkulimeve</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light pt-2">
          {/* Error Message */}
          {error && (
            <div className={`alert ${error.message.includes("Nuk u gjetën") ? "alert-info" : "alert-danger"} d-flex align-items-center mb-4 shadow-sm border-0`}>
              <FontAwesomeIcon icon={error.message.includes("Nuk u gjetën") ? faCircleInfo : faCircleInfo} className="me-3 fs-4" />
              <div>
                <p className="mb-0 fw-medium">{error.message}</p>
                {error.details && (
                  <p className="text-sm mb-0 mt-1 opacity-75">Detajet: {error.details}</p>
                )}
              </div>
            </div>
          )}

          {/* Filters Card */}
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-body p-4">
              <Row className="g-3 align-items-end">
                <Col md={12}>
                  <label htmlFor="produktiSelect" className="form-label fw-bold text-secondary small text-uppercase">
                    <FontAwesomeIcon icon={faSearch} className="me-1" /> Zgjidh Produktin
                  </label>
                  <Select
                    value={optionsSelected}
                    onChange={setOptionsSelected}
                    options={filteredOptions}
                    id="produktiSelect"
                    inputId="produktiSelect-input"
                    isClearable
                    isDisabled={isLoading}
                    isLoading={loadingProducts}
                    className="basic-single"
                    classNamePrefix="select"
                    placeholder={loadingProducts ? "Duke ngarkuar..." : "Kërko sipas emrit ose barkodit..."}
                    noOptionsMessage={() =>
                      loadingProducts
                        ? "Duke ngarkuar..."
                        : inputValue.length < 2
                          ? "Shkruani të paktën 2 karaktere"
                          : "Nuk u gjet asnjë produkt"
                    }
                    styles={darkSelectStyles}
                    onInputChange={handleInputChange}
                    inputValue={inputValue}
                  />
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-secondary small text-uppercase">Data Fillim</Form.Label>
                    <Form.Control
                      type="date"
                      value={dataFillim}
                      onChange={(e) => setDataFillim(e.target.value)}
                      disabled={isLoading}
                      className="shadow-sm border-light"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-secondary small text-uppercase">Data Mbarim</Form.Label>
                    <Form.Control
                      type="date"
                      value={dataMbarim}
                      onChange={(e) => setDataMbarim(e.target.value)}
                      disabled={isLoading}
                      className="shadow-sm border-light"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setDataFillim(new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
                      setDataMbarim(new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000)).toISOString().split('T')[0]);
                    }}
                    disabled={isLoading}
                    className="w-100 shadow-sm fw-medium border-0"
                    style={{ height: '38px' }}>
                    Sot
                  </Button>
                </Col>
              </Row>
            </div>
          </div>

          {/* Loading Indicator */}
          {loadingInvoices && (
            <div className="text-center py-5 my-3">
              <Spinner animation="grow" variant="primary" className="mb-3" />
              <p className="text-muted fw-medium">Duke kërkuar faturat...</p>
            </div>
          )}

          {/* Results Table */}
          {!loadingInvoices && kalkulimet.length > 0 && (
            <div className="card shadow-sm border-0">
              <div className="card-body p-0 rounded overflow-hidden">
                <div className="table-responsive">
                  <MDBTable hover align="middle" className="mb-0">
                    <MDBTableHead >
                      <tr>
                        <th className="fw-bold text-secondary text-uppercase small" scope="col">Nr. Kalk</th>
                        <th className="fw-bold text-secondary text-uppercase small" scope="col">Nr. Fat</th>
                        <th className="fw-bold text-secondary text-uppercase small" scope="col">Partneri</th>
                        <th className="fw-bold text-secondary text-uppercase small text-end" scope="col">Pa TVSH</th>
                        <th className="fw-bold text-secondary text-uppercase small text-end" scope="col">TVSH</th>
                        <th className="fw-bold text-secondary text-uppercase small" scope="col">Data</th>
                        <th className="fw-bold text-secondary text-uppercase small" scope="col">Lloji</th>
                        <th className="fw-bold text-secondary text-uppercase small text-center" scope="col">Veprime</th>
                      </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                      {kalkulimet.map((k) => (
                        <tr key={k.idRegjistrimit}>
                          <td className="fw-medium text-muted">#{k.idRegjistrimit}</td>
                          <td className="fw-bold text-dark">{k.nrFatures}</td>
                          <td className="text-nowrap">{k.emriBiznesit}</td>
                          <td className="text-end font-monospace">{k.totaliPaTVSH?.toFixed(2) ?? "0.00"} €</td>
                          <td className="text-end font-monospace">{k.tvsh?.toFixed(2) ?? "0.00"} €</td>
                          <td className="text-nowrap">
                            {k.dataRegjistrimit
                              ? new Date(k.dataRegjistrimit).toLocaleDateString("en-GB", { dateStyle: "medium" })
                              : "N/A"}
                          </td>
                          <td><span className="badge bg-light text-dark border">{k.llojiKalkulimit}</span></td>
                          <td className="text-center text-nowrap">
                            <Button
                              variant="light"
                              size="sm"
                              className="me-2 text-primary border-0 bg-white shadow-sm"
                              onClick={() => handleShfaqTeDhenat(k.idRegjistrimit)}
                              disabled={loadingUpdate}
                              title="Shiko Detajet">
                              <FontAwesomeIcon icon={faCircleInfo} size="lg" />
                            </Button>
                            <Button
                              variant="light"
                              size="sm"
                              className="text-success border-0 bg-white shadow-sm"
                              onClick={() => vendosProduktetPerFletkthim(k.idRegjistrimit)}
                              disabled={loadingUpdate}
                              title="Përditëso Faturën">
                              {loadingUpdate ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </MDBTableBody>
                  </MDBTable>
                </div>
              </div>
              <div className="card-footer bg-white text-end text-muted small border-top-0">
                Gjetur {kalkulimet.length} rezultate
              </div>
            </div>
          )}

          {/* Empty State - No Results */}
          {!loadingInvoices && kalkulimet.length === 0 && optionsSelected && !error && (
            <div className="text-center py-5">
              <div className="bg-light rounded-circle d-inline-flex p-4 mb-3 text-muted">
                <FontAwesomeIcon icon={faFileInvoice} size="2x" opacity="0.5" />
              </div>
              <h5 className="fw-bold text-secondary">Nuk u gjet asnjë faturë</h5>
              <p className="text-muted mb-0">Provoni të ndryshoni datat ose zgjidhni një produkt tjetër.</p>
            </div>
          )}

          {/* Initial State - No Selection */}
          {!loadingInvoices && !optionsSelected && (
            <div className="text-center py-5">
              <div className="bg-white shadow-sm rounded-circle d-inline-flex p-4 mb-3 text-primary">
                <FontAwesomeIcon icon={faFileInvoice} size="3x" />
              </div>
              <h4 className="fw-bold text-dark">Llogaritja e Faturave</h4>
              <p className="text-muted mw-50 mx-auto" style={{ maxWidth: '400px' }}>
                Zgjidhni një produkt nga lista dhe filtroni sipas datave për të parë historikun e faturave.
              </p>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default PerditesoStatusinKalk;
