import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Form, Button, Table, Modal } from "react-bootstrap";
import ReactSelect from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarcode,
  faTrash,
  faPlus,
  faMinus,
  faPrint,
  faSpinner,
  faArrowLeft,
  faQrcode
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";

import BarcodeScannerModal from "../../../Components/TeTjera/BarcodeScannerModal";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import Titulli from "../../../Components/TeTjera/Titulli";
import PrintLabels from "../../../Components/TeTjera/PrintLabels";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { darkSelectStyles } from "../../../utils/darkSelectStyles";
import "../../Styles/PremiumTheme.css";
import "../../Styles/DizajniPergjithshem.css";

function Qmimore() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  
  const [idRegjistrimit, setIdRegjistrimit] = useState(null);
  const [queueItems, setQueueItems] = useState([]);
  const [options, setOptions] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [siteName, setSiteName] = useState("FinanCare");
  const [showScanner, setShowScanner] = useState(false);

  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [konfirmoPastrimin, setKonfirmoPastrimin] = useState(false);

  const selectRef = useRef(null);
  const getToken = localStorage.getItem("token");

  const authentikimi = useMemo(() => ({
    headers: { Authorization: `Bearer ${getToken}` }
  }), [getToken]);

  // 1. Initial Load: Register / get the single active header & fetch site info
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // Get or create active Qmimore calculation
        const res = await axios.get(
          `${API_BASE_URL}/api/Faturat/qmimore/getOrCreateActive`,
          authentikimi
        );
        const headerId = res.data.idRegjistrimit;
        setIdRegjistrimit(headerId);

        // Load items in queue
        await fetchQueueItems(headerId);

        // Fetch site name
        const bizRes = await axios.get(
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`,
          authentikimi
        );
        if (bizRes.data && bizRes.data.emriIBiznesit) {
          setSiteName(bizRes.data.emriIBiznesit);
        }
      } catch (err) {
        console.error("Dështoi inicializimi i Qmimore:", err);
        setTipiMesazhit("danger");
        setPershkrimiMesazhit("Gabim gjatë inicializimit të Qmimore!");
        setShfaqMesazhin(true);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [API_BASE_URL, authentikimi]);

  // 2. Fetch list of products to populate search dropdown
  useEffect(() => {
    let active = true;
    const fetchDropdownProducts = async () => {
      try {
        setLoadingProducts(true);
        const res = await axios.get(
          `${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`,
          authentikimi
        );

        if (!active) return;

        let rawData = res.data;
        if (rawData && rawData.$values) rawData = rawData.$values;
        if (rawData && rawData.data && Array.isArray(rawData.data)) rawData = rawData.data;
        if (!Array.isArray(rawData)) rawData = [];

        const formatted = rawData.map(item => {
          const id = item.produktiID || item.ProduktiID || 0;
          const barkodi = item.barkodi || item.Barkodi || "Pa barkod";
          const emri = item.emriProduktit || item.EmriProduktit || "Pa emër";

          return {
            value: id,
            label: `${barkodi} - ${emri}`,
            item: item
          };
        });

        setOptions(formatted);
      } catch (err) {
        console.error("Dështoi ngarkimi i listës së produkteve:", err);
      } finally {
        if (active) setLoadingProducts(false);
      }
    };

    fetchDropdownProducts();
    return () => { active = false; };
  }, [API_BASE_URL, authentikimi]);

  // 3. Focus select on mount or when loading finishes
  useEffect(() => {
    if (!loading && idRegjistrimit) {
      setTimeout(() => {
        document.getElementById("barkodiSelect-input")?.focus();
      }, 300);
    }
  }, [loading, idRegjistrimit]);

  // 4. Fetch calculation detail items helper
  const fetchQueueItems = async (headerId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${headerId}`,
        authentikimi
      );
      let items = res.data;
      if (items && items.$values) items = items.$values;
      setQueueItems(items || []);
    } catch (err) {
      console.error("Dështoi ngarkimi i listës nga baza e të dhënave:", err);
    }
  };

  // 5. Autocomplete & Barcode scan handling
  const handleInputChange = (val, { action }) => {
    if (action === "input-change") {
      setInputValue(val);
    } else if (action === "set-value" || action === "menu-close") {
      setInputValue("");
    }
  };

  const filteredOptions = useMemo(() => {
    if (!inputValue || inputValue.length < 2) return [];
    const lower = inputValue.toLowerCase();
    const results = [];
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      if (option && option.label && option.label.toLowerCase().includes(lower)) {
        results.push(option);
        if (results.length >= 50) break;
      }
    }
    return results;
  }, [inputValue, options]);

  const handleChange = async (selected) => {
    if (!selected) return;
    try {
      await axios.post(
        `${API_BASE_URL}/api/Faturat/qmimore/shtoProdukt?idRegjistrimit=${idRegjistrimit}&idProduktit=${selected.value}`,
        {},
        authentikimi
      );
      setInputValue("");
      setOptionsSelected(null);
      await fetchQueueItems(idRegjistrimit);
      
      // Auto focus back for continuous barcode scanning
      setTimeout(() => {
        document.getElementById("barkodiSelect-input")?.focus();
      }, 10);
    } catch (err) {
      console.error(err);
      setTipiMesazhit("danger");
      setPershkrimiMesazhit("Gabim gjatë shtimit të produktit!");
      setShfaqMesazhin(true);
    }
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      const currentInput = document.getElementById("barkodiSelect-input")?.value || "";
      if (currentInput.trim().length > 0) {
        let lookupBarcode = currentInput.trim();
        
        // PLU check (2xxxxxx...)
        if (lookupBarcode.startsWith("2") && lookupBarcode.length === 13) {
          const pluCode = lookupBarcode.substring(0, 7);
          const matched = options.find(opt => opt.label.includes(pluCode));
          if (matched) {
            lookupBarcode = pluCode;
          }
        }

        const matches = options.filter(opt =>
          opt.label.toLowerCase().includes(lookupBarcode.toLowerCase())
        );

        if (matches.length === 0) {
          setTipiMesazhit("danger");
          setPershkrimiMesazhit(`Produkti me këtë barkod nuk u gjet! (${currentInput})`);
          setShfaqMesazhin(true);
          setInputValue("");
          setTimeout(() => selectRef.current?.focus(), 10);
        } else {
          event.preventDefault();
          await handleChange(matches[0]);
        }
      }
    }
  };

  const handleScannerDecode = async (scannedText) => {
    setShowScanner(false);
    if (!scannedText) return;
    
    let lookupBarcode = scannedText.trim();
    
    // PLU check (2xxxxxx...)
    if (lookupBarcode.startsWith("2") && lookupBarcode.length === 13) {
      const pluCode = lookupBarcode.substring(0, 7);
      const matched = options.find(opt => opt.label.includes(pluCode));
      if (matched) {
        lookupBarcode = pluCode;
      }
    }

    const matches = options.filter(opt =>
      opt.label.toLowerCase().includes(lookupBarcode.toLowerCase())
    );

    if (matches.length === 0) {
      setTipiMesazhit("danger");
      setPershkrimiMesazhit(`Produkti me këtë barkod nuk u gjet! (${scannedText})`);
      setShfaqMesazhin(true);
    } else {
      await handleChange(matches[0]);
    }
  };

  // 6. Action Handlers (Increment, Decrement, Input Edit, Delete, Clear)
  const handleUpdateQuantity = async (item, newQty) => {
    if (newQty < 1) return;
    try {
      await axios.put(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${item.id}`,
        {
          sasiaStokut: newQty,
          qmimiShites: item.qmimiShites,
          qmimiShitesMeShumic: item.qmimiShitesMeShumic,
          qmimiBleres: item.qmimiBleres,
          rabati1: item.rabati1 ?? 0,
          rabati2: item.rabati2 ?? 0,
          rabati3: item.rabati3 ?? 0
        },
        authentikimi
      );
      await fetchQueueItems(idRegjistrimit);
    } catch (err) {
      console.error("Gabim gjatë përditësimit të sasisë:", err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/FshijTeDhenat?idTeDhenat=${itemId}`,
        authentikimi
      );
      await fetchQueueItems(idRegjistrimit);
    } catch (err) {
      console.error("Gabim gjatë fshirjes së artikullit:", err);
    }
  };

  const handleClearTable = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/Faturat/qmimore/pastroTabelen?idRegjistrimit=${idRegjistrimit}`,
        {},
        authentikimi
      );
      setQueueItems([]);
      setKonfirmoPastrimin(false);
      setTipiMesazhit("success");
      setPershkrimiMesazhit("Tabela u pastrua me sukses!");
      setShfaqMesazhin(true);
    } catch (err) {
      console.error("Gabim gjatë pastrimit të tabelës:", err);
      setTipiMesazhit("danger");
      setPershkrimiMesazhit("Dështoi pastrimi i tabelës!");
      setShfaqMesazhin(true);
    }
  };

  // 7. Map queue items to expanded format required by PrintLabels
  const productsToPrint = useMemo(() => {
    const list = [];
    queueItems.forEach(p => {
      const qty = parseInt(p.sasiaStokut) || 1;
      for (let i = 0; i < qty; i++) {
        list.push({
          name: p.emriProduktit,
          price: p.qmimiShites,
          wholesalePrice: p.qmimiShitesMeShumic,
          barcode: p.barkodi
        });
      }
    });
    return list;
  }, [queueItems]);

  return (
    <>
      <Titulli titulli="Qmimore (Shtyp Etiketat)" />
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Pergjegjes i Porosive", "Puntor i Thjeshte", "Kalkulant", "1 Euro Menaxher", "1 Euro Staff", "Arkatar", "Faturist"]} />
      <NavBar />

      <div className="containerDashboardP">
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}

        {konfirmoPastrimin && (
          <Modal
            show={konfirmoPastrimin}
            onHide={() => setKonfirmoPastrimin(false)}
            centered
            className="sp-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title>Konfirmo Pastrimin e Tabelës</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center py-4">
              <div className="mb-3 text-danger">
                <FontAwesomeIcon icon={faTrash} size="3x" />
              </div>
              <h5 className="text-white mb-2 fw-bold">A jeni të sigurt?</h5>
              <p className="text-white-50">
                Ky veprim do të fshijë të gjitha produktet nga lista e shtypjes në kohë reale. Ky veprim nuk mund të zhbëhet!
              </p>
            </Modal.Body>
            <Modal.Footer className="border-0 d-flex justify-content-center gap-2">
              <Button
                variant="secondary"
                className="btn-cancel px-4"
                onClick={() => setKonfirmoPastrimin(false)}
              >
                Anulo
              </Button>
              <Button
                variant="danger"
                className="btn-save px-4"
                onClick={handleClearTable}
              >
                Pastro Tabelën
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        {loading ? (
          <div className="Loader">
            <TailSpin
              height="80"
              width="80"
              color="#10b981"
              ariaLabel="tail-spin-loading"
              radius="1"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
            />
          </div>
        ) : (
          <>
            {/* Header section */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
              <div>
                <h1 className="title mb-1">Qmimore</h1>
                <div className="text-white-50 small opacity-75">
                  Skanoni produktet për të shtypur etiketat e çmimeve. Kjo radhë sinkronizohet në të gjitha PC-të në kohë reale.
                </div>
              </div>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <PrintLabels storeName={siteName} products={productsToPrint} />
                <Button
                  className="btn-cancel px-3"
                  variant="danger"
                  onClick={() => setKonfirmoPastrimin(true)}
                  disabled={queueItems.length === 0}
                >
                  <FontAwesomeIcon icon={faTrash} className="me-2" /> Pastro Tabelën
                </Button>
              </div>
            </div>

            {/* Scan section */}
            <Card className="sp-card mb-4">
              <Card.Body className="p-4">
                <Form.Group controlId="idDheEmri" className="mb-0">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="sp-label d-flex align-items-center gap-2 mb-0">
                      <FontAwesomeIcon icon={faBarcode} className="text-success" /> Skano Barkodin ose Kërko Produktin
                    </Form.Label>
                    <Button 
                      size="sm" 
                      variant="outline-success" 
                      className="d-flex align-items-center gap-2 rounded-3"
                      onClick={() => setShowScanner(true)}
                    >
                      <FontAwesomeIcon icon={faQrcode} /> Skano me Kamerë
                    </Button>
                  </div>
                  <ReactSelect
                    ref={selectRef}
                    onKeyDown={handleKeyDown}
                    value={optionsSelected}
                    onChange={handleChange}
                    options={filteredOptions}
                    id="barkodiSelect"
                    inputId="barkodiSelect-input"
                    isDisabled={loadingProducts}
                    isLoading={loadingProducts}
                    styles={darkSelectStyles}
                    onInputChange={handleInputChange}
                    inputValue={inputValue}
                    placeholder={
                      loadingProducts
                        ? "Duke ngarkuar produktet..."
                        : "Skanoni barkodin me scanner ose kërkoni me emër..."
                    }
                    noOptionsMessage={() =>
                      loadingProducts
                        ? "Duke ngarkuar..."
                        : inputValue.length < 2
                          ? "Shkruani të paktën 2 karaktere"
                          : "Nuk u gjet produkt"
                    }
                  />
                  <div className="text-white-50 mt-2 small opacity-75">
                    Këshillë: Kurseni kohë duke skanuar drejtpërdrejt barkodin. Fokusimi do të ruhet automatikisht.
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Table Queue section */}
            <div className="table-responsive sp-table-wrapper rounded-3">
              <Table hover className="align-middle mb-0 sp-table text-white">
                <thead className="table-dark-header">
                  <tr>
                    <th style={{ width: "80px" }}>Nr.</th>
                    <th>Barkodi</th>
                    <th>Emri i Produktit</th>
                    <th className="text-end">Çmimi (€)</th>
                    <th className="text-end">Çmimi Shumicë (€)</th>
                    <th className="text-center" style={{ width: "200px" }}>Kopje (Sasia)</th>
                    <th className="text-center" style={{ width: "120px" }}>Veprime</th>
                  </tr>
                </thead>
                <tbody>
                  {queueItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="text-white-50">{index + 1}</td>
                      <td className="fw-semibold text-info text-monospace">{item.barkodi}</td>
                      <td>{item.emriProduktit}</td>
                      <td className="text-end fw-bold text-success">
                        {parseFloat(item.qmimiShites || 0).toFixed(2)} €
                      </td>
                      <td className="text-end text-white-50">
                        {parseFloat(item.qmimiShitesMeShumic || 0).toFixed(2)} €
                      </td>
                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            className="px-2 py-0 border-0 text-white-50"
                            onClick={() => handleUpdateQuantity(item, parseInt(item.sasiaStokut) - 1)}
                            disabled={parseInt(item.sasiaStokut) <= 1}
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </Button>
                          <Form.Control
                            type="number"
                            className="text-center py-0 px-1 border-secondary bg-dark text-white rounded-2"
                            style={{ width: "90px", height: "30px", fontSize: "11pt" }}
                            value={item.sasiaStokut}
                            min={1}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              handleUpdateQuantity(item, val);
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            className="px-2 py-0 border-0 text-white-50"
                            onClick={() => handleUpdateQuantity(item, parseInt(item.sasiaStokut) + 1)}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </Button>
                        </div>
                      </td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="border-0 bg-transparent text-danger"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {queueItems.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-white-50">
                        <div className="mb-2">
                          <FontAwesomeIcon icon={faBarcode} size="2x" className="opacity-25 text-white" />
                        </div>
                        Tabela është e zbrazët. Skanoni ose kërkoni një produkt për ta shtuar në listën e shtypjes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </div>
      <BarcodeScannerModal 
        show={showScanner} 
        onHide={() => setShowScanner(false)} 
        onScan={handleScannerDecode} 
      />
    </>
  );
}

export default Qmimore;
