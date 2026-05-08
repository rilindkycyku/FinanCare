import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { TailSpin } from "react-loader-spinner";
import {
  Table,
  Form,
  Row,
  Col,
  InputGroup,
  Tabs,
  Tab,
  Badge
} from "react-bootstrap";
import {
  Receipt,
  User,
  CreditCard,
  History,
  Package,
  PlusCircle,
  Hash,
  Calendar as CalendarIcon,
  Trash2 as Trash,
  Edit2 as Edit,
  MonitorSpeaker
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "../../Styles/POSLayout.css";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import Titulli from "../../../Components/TeTjera/Titulli";
import jsPDF from "jspdf";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import NukEshteEOptimizuarPerMobile from "../../../Components/TeTjera/layout/NukEshteEOptimizuarPerMobile";

function POS(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const BASE_URL = import.meta.env.VITE_BASE_URL || "";

  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [produktetNeKalkulim, setproduktetNeKalkulim] = useState([]);
  const [produktiID, setproduktiID] = useState(0);
  const [sasia, setSasia] = useState("1");
  const [njesiaMatese, setNjesiaMatese] = useState("Cope");
  const [sasiaAktualeNeStok, setSasiaAktualeNeStok] = useState(0);

  const [vendosKartelenBleresit, setVendosKartelenBleresit] = useState(false);
  const [kartelaBleresit, setKartelaBleresit] = useState(null);
  const [teDhenatKartelaBleresit, setTeDhenatKartelaBleresit] = useState(null);

  const [vendosKartelenFshirjeProduktit, setVendosKartelenFshirjeProduktit] =
    useState(false);
  const [kartelaFshirjes, setKartelaFshirjes] = useState(null);
  const [teDhenatKartelaFshirjes, setTeDhenatKartelaFshirjes] = useState(null);
  const [fshijProdKalkID, setFshijProduktKalkID] = useState(0);

  const [rabati1, setRabati1] = useState(0);
  const [rabati2, setRabati2] = useState(0);

  const [qmimiSH, setQmimiSH] = useState(0);
  const [qmimiSH2, setQmimiSH2] = useState(0);
  const [sasiaShumices, setSasiaShumices] = useState(0);
  const [idPartneri, setIDPartneri] = useState(1);

  const [nrFatures, setNrFatures] = useState(0);
  const [idRegjistrimit, setIdRegjistrimit] = useState(0);
  const [llojiPageses, setLlojiPageses] = useState("Cash");
  const [shumaPageses, setShumaPageses] = useState(0);
  const [qmimiTotal, setQmimiTotal] = useState(0);
  const [qmimiPaRabatBonus, setQmimiPaRabatBonus] = useState(0);
  const [totaliTVSH, setTotaliTVSH] = useState(0);
  const [kalkEditID, setKalkEditID] = useState(0);
  const [IDProduktiFunditShtuar, setIDProduktiFunditShtuar] = useState(null);

  const [perditesoFat, setPerditesoFat] = useState("");
  const [edito, setEdito] = useState(false);
  const [optionsBarkodi, setOptionsBarkodi] = useState([]);
  const [optionsBarkodiSelected, setOptionsBarkodiSelected] = useState(null);
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState(null);
  const [filterText, setFilterText] = useState("");

  // New states for multi-customer support
  const [activeInvoices, setActiveInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoicesData, setInvoicesData] = useState({});

  const navigate = useNavigate();

  const getID = localStorage.getItem("id");
  const getToken = localStorage.getItem("token");
  const authentikimi = { headers: { Authorization: `Bearer ${getToken}` } };

  // Function to add a new customer (new invoice)
  const addNewCustomer = async () => {
    if (activeInvoices.length >= 4) {
      setTipiMesazhit("danger");
      setPershkrimiMesazhit(
        "Nuk mund të shtoni më shumë se 4 klientë njëkohësisht!",
      );
      setShfaqMesazhin(true);
      return;
    }
    try {
      const perdoruesi = await axios.get(
        `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
        authentikimi,
      );
      const nrRendor = await axios.get(
        `${API_BASE_URL}/api/Faturat/ShfaqNumrinRendorFatures?stafiID=${perdoruesi.data.perdoruesi.userID}`,
        authentikimi,
      );
      const newInvoiceId = nrRendor.data.idRegjistrimit;
      setActiveInvoices((prev) => [...prev, newInvoiceId]);
      setInvoicesData((prev) => ({
        ...prev,
        [newInvoiceId]: {
          nrFatures: nrRendor.data.nrFat,
          produktetNeKalkulim: [],
          idPartneri: 1,
          kartelaBleresit: null,
          teDhenatKartelaBleresit: null,
          IDProduktiFunditShtuar: null,
          qmimiTotal: 0,
          totaliTVSH: 0,
          qmimiPaRabatBonus: 0,
        },
      }));
      setSelectedInvoice(newInvoiceId);

      setPerditeso(Date.now());
    } catch (err) {
      console.error("Error creating new invoice:", err);
      setTipiMesazhit("danger");
      setPershkrimiMesazhit(
        "Gabim gjatë krijimit të faturës për klientin e ri!",
      );
      setShfaqMesazhin(true);
    } finally {
      document.getElementById("barkodiSelect-input")?.focus();
    }
  };

  // Fetch business details
  useEffect(() => {
    const vendosTeDhenatBiznesit = async () => {
      try {
        const teDhenat = await axios.get(
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`,
          authentikimi,
        );
        setTeDhenatBiznesit(teDhenat.data);
      } catch (err) {
        console.error("Error fetching business details:", err);
      }
    };
    vendosTeDhenatBiznesit();
  }, [perditeso]);

  // Initialize first invoice or redirect to login
  useEffect(() => {
    if (getID) {
      const initializeInvoices = async () => {
        try {
          setLoading(true);
          const perdoruesi = await axios.get(
            `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
            authentikimi,
          );
          const stafiID = perdoruesi.data.perdoruesi.userID;
          // Fetch open invoices for the current stafiID
          const openInvoices = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqFaturatEHapura?stafiID=${stafiID}`,
            authentikimi,
          );
          console.log(openInvoices);
          if (openInvoices.data && openInvoices.data.length > 0) {
            const invoiceIds = openInvoices.data.map(
              (invoice) => invoice.idRegjistrimit,
            );
            const invoicesDataObj = {};
            for (const invoice of openInvoices.data) {
              const teDhenatKalkulimit = await axios.get(
                `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${invoice.idRegjistrimit}`,
                authentikimi,
              );
              invoicesDataObj[invoice.idRegjistrimit] = {
                nrFatures: invoice.nrFatures,
                produktetNeKalkulim: teDhenatKalkulimit.data || [],
                idPartneri: invoice.idPartneri || 1,
                kartelaBleresit: invoice.idBonusKartela || null,
                teDhenatKartelaBleresit: invoice.bonusKartela || null,
                IDProduktiFunditShtuar:
                  teDhenatKalkulimit.data && teDhenatKalkulimit.data.length > 0
                    ? teDhenatKalkulimit.data[0].id
                    : null,
                qmimiTotal: 0,
                totaliTVSH: 0,
                qmimiPaRabatBonus: 0,
              };
            }
            setActiveInvoices(invoiceIds);
            setInvoicesData(invoicesDataObj);
            setSelectedInvoice(invoiceIds[0]); // Select the first open invoice
          } else {
            // No open invoices found, set empty state
            setActiveInvoices([]);
            setInvoicesData({});
            setSelectedInvoice(null);
          }
        } catch (err) {
          console.error("Error initializing invoices:", err);
          setTipiMesazhit("danger");
          setPershkrimiMesazhit("Gabim gjatë ngarkimit të faturave të hapura!");
          setShfaqMesazhin(true);
        } finally {
          setLoading(false);
        }
      };
      initializeInvoices();
    } else {
      navigate("/login");
    }
  }, [getID]);

  // Fetch invoice data for selected invoice
  useEffect(() => {
    if (getID && selectedInvoice !== null && selectedInvoice !== undefined) {
      const vendosTeDhenat = async () => {
        try {
          const teDhenatKalkulimit = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${selectedInvoice}`,
            authentikimi,
          );
          const teDhenatFatures = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${selectedInvoice}`,
            authentikimi,
          );
          setproduktetNeKalkulim(teDhenatKalkulimit.data);
          setIDPartneri(teDhenatFatures.data.regjistrimet.idPartneri);
          if (teDhenatFatures.data.regjistrimet.bonusKartela != null) {
            setKartelaBleresit(
              teDhenatFatures.data.regjistrimet.idBonusKartela,
            );
            setTeDhenatKartelaBleresit(
              teDhenatFatures.data.regjistrimet.bonusKartela,
            );
          } else {
            setKartelaBleresit(null);
            setTeDhenatKartelaBleresit(null);
          }
          if (teDhenatKalkulimit.data && teDhenatKalkulimit.data.length > 0) {
            setIDProduktiFunditShtuar(teDhenatKalkulimit.data[0].id);
          }
          setNrFatures(teDhenatFatures.data.regjistrimet.nrFatures);
          setIdRegjistrimit(selectedInvoice);
        } catch (err) {
          console.error("Error fetching invoice data:", err);
          setTipiMesazhit("danger");
          setPershkrimiMesazhit(
            "Gabim gjatë ngarkimit të të dhënave të faturës!",
          );
          setShfaqMesazhin(true);
        } finally {
          // setLoading(false);
        }
      };
      vendosTeDhenat();
    }
  }, [perditesoFat, produktiID, selectedInvoice, getID]);

  // Calculate totals for selected invoice
  useEffect(() => {
    const calculateTotals = async () => {
      if (!selectedInvoice) return;
      let totalQmimiPaTVSH = 0;
      let totalTVSH = 0;
      let qmimiPaRabatBonus = 0;
      produktetNeKalkulim.forEach((produkti) => {
        const qmimiShitesPasRabatit =
          produkti.qmimiShites -
          produkti.qmimiShites * (produkti.rabati1 / 100) -
          (produkti.qmimiShites -
            produkti.qmimiShites * (produkti.rabati1 / 100)) *
          (produkti.rabati2 / 100) -
          (produkti.qmimiShites -
            produkti.qmimiShites * (produkti.rabati1 / 100) -
            (produkti.qmimiShites -
              produkti.qmimiShites * (produkti.rabati1 / 100)) *
            (produkti.rabati2 / 100)) *
          (produkti.rabati3 / 100);
        const qmimiShitesPaRabatBonus =
          produkti.qmimiShites -
          produkti.qmimiShites * (produkti.rabati1 / 100);
        const qmimiPaTVSH =
          qmimiShitesPasRabatit / (1 + produkti.llojiTVSH / 100);
        const qmimiTVSH = qmimiPaTVSH * (produkti.llojiTVSH / 100);
        totalQmimiPaTVSH += qmimiPaTVSH * produkti.sasiaStokut;
        totalTVSH += qmimiTVSH * produkti.sasiaStokut;
        qmimiPaRabatBonus += qmimiShitesPaRabatBonus * produkti.sasiaStokut;
      });
      setTotaliTVSH(totalTVSH);
      setQmimiTotal(totalQmimiPaTVSH + totalTVSH);
      setQmimiPaRabatBonus(qmimiPaRabatBonus);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${selectedInvoice}`,
          authentikimi,
        );
        await axios.put(
          `${API_BASE_URL}/api/Faturat/perditesoFaturen?idKalulimit=${selectedInvoice}`,
          {
            dataRegjistrimit: response.data.regjistrimet.dataRegjistrimit,
            stafiID: response.data.regjistrimet.stafiID,
            totaliPaTVSH: parseFloat(totalQmimiPaTVSH),
            tvsh: parseFloat(totalTVSH),
            idPartneri: response.data.regjistrimet.idPartneri,
            statusiPageses: response.data.statusiPageses,
            llojiPageses: response.data.regjistrimet.llojiPageses,
            llojiKalkulimit: response.data.regjistrimet.llojiKalkulimit,
            nrFatures: response.data.regjistrimet.nrFatures,
            statusiKalkulimit: response.data.regjistrimet.statusiKalkulimit,
            pershkrimShtese: response.data.regjistrimet.pershkrimShtese,
            rabati: parseFloat(response.data.rabati),
            nrRendorFatures: response.data.regjistrimet.nrRendorFatures,
            idBonusKartela: response.data.regjistrimet.idBonusKartela,
          },
          authentikimi,
        );
      } catch (error) {
        console.error("Error fetching or updating data:", error);
      }
    };
    calculateTotals();
  }, [produktetNeKalkulim, selectedInvoice, perditesoFat, idPartneri]);

  // Handle keyboard navigation between customers
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key >= "1" && event.key <= "9") {
        const index = parseInt(event.key) - 1;
        if (activeInvoices[index]) {
          setSelectedInvoice(activeInvoices[index]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeInvoices]);

  // Reset form when no invoices remain
  useEffect(() => {
    if (activeInvoices.length === 0 && !selectedInvoice) {
      setproduktetNeKalkulim([]);
      setIDPartneri(1);
      setKartelaBleresit(null);
      setTeDhenatKartelaBleresit(null);
      setIDProduktiFunditShtuar(null);
      setNrFatures(0);
      setIdRegjistrimit(0);
      setQmimiTotal(0);
      setTotaliTVSH(0);
      setQmimiPaRabatBonus(0);
    }
  }, [activeInvoices]);

  const ndrroField = (e, tjetra) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(tjetra)?.focus();
    }
  };

  async function handleEdit(id, index) {
    await axios
      .get(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/getKalkulimi?idKalkulimit=${id}`,
        authentikimi,
      )
      .then((p) => {
        setEdito(true);
        setproduktiID(p.data[0].idProduktit);
        setSasia(p.data[0].sasiaStokut);
        setSasiaShumices(p.data[0].sasiaShumices);
        setQmimiSH(p.data[0].qmimiProduktit);
        setQmimiSH2(p.data[0].qmimiShitesMeShumic);
        setRabati1(p.data[0].rabati1);
        setRabati2(p.data[0].rabati2);
        setKalkEditID(p.data[0].id);
        setNjesiaMatese(p.data[0].emriNjesiaMatese);
        setSasiaAktualeNeStok(p.data[0].sasiaNeStok);
        setTimeout(() => {
          const sasiaInput = document.getElementById("sasia");
          sasiaInput?.focus();
          sasiaInput?.select();
        }, 0);
      });
  }

  async function handleEdito(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      await axios.put(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${kalkEditID}`,
        {
          sasiaStokut: sasia,
          qmimiShites: qmimiSH,
          qmimiShitesMeShumic: qmimiSH2,
          rabati1: rabati1,
          rabati2: rabati2,
        },
        authentikimi,
      );
      setproduktiID(0);
      setSasia("");
      setQmimiSH(0);
      setOptionsBarkodiSelected(null);
      setEdito(false);
      setPerditesoFat(Date.now());
      setTimeout(() => {
        const barkodiInput = document.getElementById("barkodiSelect-input");
        barkodiInput?.focus();
        barkodiInput?.select();
      }, 0);
    }
  }

  function kontrolloQmimin(e) {
    setSasia(e?.target?.value || e);
    if (e?.target?.value >= sasiaShumices) {
      setQmimiSH(e?.target?.value?.qmimiShitesMeShumic || qmimiSH2);
    } else {
      setQmimiSH(e?.target?.value?.qmimiProduktit || qmimiSH);
    }
  }

  const currentDate = new Date().toLocaleDateString("en-GB", {
    dateStyle: "short",
  });

  useEffect(() => {
    const initialOptionsBarkodiSelected = optionsBarkodi.find(
      (option) => option.value === produktiID,
    );
    setOptionsBarkodiSelected(initialOptionsBarkodiSelected);
    document.getElementById("sasia")?.focus();
  }, [edito, produktiID]);

  const [produktetPerPOS, setProduktetPerPOS] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/Produkti/ProduktetPerPOS`, authentikimi)
      .then((response) => {
        setProduktetPerPOS(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    const rawData = Array.isArray(produktetPerPOS) ? produktetPerPOS : (produktetPerPOS?.$values || []);
    const fetchedOptionsBarkodi = rawData
      .filter((item) => item && item.qmimiProduktit > 0)
      .map((item) => ({
        value: item.produktiID,
        label: `${item.barkodi || ""} - ${item.emriProduktit || ""} - ${item.kodiProduktit || ""}`,
        qmimiProduktit: item.qmimiProduktit,
        qmimiMeShumic: item.qmimiMeShumic,
        rabati: item.rabati,
        sasiaNeStok: item.sasiaNeStok,
        emriNjesiaMatese: item.emriNjesiaMatese,
      }));

    setOptionsBarkodi(fetchedOptionsBarkodi);
  }, [produktetPerPOS]);

  const selectRef = useRef(null);

  const handleChange = async (selectedOption) => {
    if (!selectedOption || !selectedOption.value) {
      console.warn("No valid product selected on scan/add");
      return;
    }

    try {
      setOptionsBarkodiSelected(selectedOption);

      await axios.post(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/teDhenat`,
        {
          idRegjistrimit: selectedInvoice,
          idProduktit: selectedOption.value,
          sasiaStokut: 1,
          qmimiShites: selectedOption.qmimiProduktit,
          qmimiShitesMeShumic: selectedOption.qmimiMeShumic || 0,
          rabati1: selectedOption.rabati || 0,
          rabati2: rabati2,
        },
        authentikimi,
      );

      setIDProduktiFunditShtuar(/* from response if needed */);
      setPerditesoFat(Date.now());

      // Reset for next fast scan
      setInputValue("");
      setOptionsBarkodiSelected(null);

      // Refocus the select input
      setTimeout(() => {
        document.getElementById("barkodiSelect-input")?.focus();
      }, 80);
    } catch (err) {
      console.error("Add product failed:", err);
      // your error message code
    }
  };

  const handleKaloTekPagesa = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      document.getElementById("shumaPageses")?.focus();
      return;
    }

    if (event.key === "F1") {
      event.preventDefault();
      if (IDProduktiFunditShtuar !== null) {
        handleEdit(IDProduktiFunditShtuar);
      }
      return;
    }

    // For Enter â†’ we give react-select ~50-100ms to set the value
    if (event.key === "Enter") {
      // Do NOT preventDefault() here
      setTimeout(() => {
        if (optionsBarkodiSelected?.value) {
          handleChange(optionsBarkodiSelected);
          setInputValue(""); // clear for next scan
          selectRef.current?.focus(); // keep focus
        }
      }, 60); // 60ms is usually perfect for scanners
    }
  };

  const handleMenaxhoTastetPagesa = (event) => {
    if (event.key === "F4") {
      event.preventDefault();
      setVendosKartelenBleresit(true);
    }
    if (event.key === "F5") {
      event.preventDefault();
      mbyllFature();
    }
  };

  const handleMenaxhoTastetKartelaZbritjes = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      VendosKartelenBleresit();
    }
  };

  const handleMenaxhoTastetKartelaFshirjes = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      VendosKartelenFshirjesProduktit();
    }
  };

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
    });
  }

  async function generateInvoice(data) {
    const logoUrl = `${BASE_URL}/img/web/${teDhenatBiznesit?.logo}`;
    let logoImage = null;
    try {
      logoImage = await loadImage(logoUrl);
    } catch (e) {
      console.warn('Logo not found for receipt:', e);
    }

    function drawReceipt(doc, isMeasuring) {
      let y = 6;

      if (logoImage && !isMeasuring) {
        doc.addImage(logoImage, 'PNG', 22.5, y, 30, 12);
        y += 16;
      } else if (logoImage && isMeasuring) {
        y += 16;
      }

      const centerText = (txt, size, font = 'Helvetica', style = 'normal') => {
        if (!isMeasuring) {
          doc.setFont(font, style);
          doc.setFontSize(size);
          const block = doc.splitTextToSize(String(txt || ''), 65);
          doc.text(block, 37.5, y, { align: 'center' });
          y += (block.length * (size * 0.35)) + 1;
        } else {
          y += Math.max(1, Math.ceil(String(txt || '').length / 40)) * (size * 0.35) + 1;
        }
      };

      centerText(teDhenatBiznesit?.emriIBiznesit || 'FinanCare', 11, 'Helvetica', 'bold');
      centerText(`Adresa: ${teDhenatBiznesit?.adresa || ''}`, 8);
      centerText(`Tel: ${teDhenatBiznesit?.nrKontaktit || ''}`, 8);
      centerText(`NUI: ${teDhenatBiznesit?.nui || ''} / NRT: ${teDhenatBiznesit?.nrTVSH || ''}`, 8);
      centerText(`NRF: ${teDhenatBiznesit?.nf || ''}`, 8);
      y += 2;

      const drawSolidLine = () => {
        if (!isMeasuring) {
          doc.setLineWidth(0.3);
          doc.line(5, y, 70, y);
        }
      };

      const drawDashedLine = () => {
        if (!isMeasuring) {
          doc.setFont('Courier', 'normal');
          doc.setFontSize(10);
          doc.text('-'.repeat(32), 37.5, y, { align: 'center' });
        }
      };

      drawSolidLine();
      y += 5;

      centerText('P A R A G O N', 10, 'Helvetica', 'bold');
      y += 1;

      const rowMeta = (lbl, val) => {
        if (!isMeasuring) {
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8);
          doc.text(lbl, 5, y);
          doc.text(String(val), 70, y, { align: 'right' });
        }
        y += 4;
      };

      rowMeta('Fatura Nr:', data.invoiceNumber || '');
      rowMeta('Data:', data.date || '');
      rowMeta('Shitësi:', data.salesUsername || '');

      y += 1;
      drawSolidLine();
      y += 5;

      if (!isMeasuring) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('PRODUKTI', 5, y);
        doc.text('SASIA', 43, y, { align: 'right' });
        doc.text('ÇMIMI', 56, y, { align: 'right' });
        doc.text('SHUMA', 70, y, { align: 'right' });
      }
      y += 2.5;
      drawDashedLine();
      y += 4.5;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item) => {
          if (!isMeasuring) {
            let itemName = String(item?.name || "Produkti");
            let name = itemName.length > 20 ? itemName.substring(0, 18) + '..' : itemName;
            doc.setFont('Helvetica', 'normal');
            doc.text(name, 5, y);
            doc.text(String(item?.quantity || 1), 43, y, { align: 'right' });
            doc.text(`${parseFloat(item?.price || 0).toFixed(2)}`, 56, y, { align: 'right' });
            doc.setFont('Helvetica', 'bold');
            doc.text(`${parseFloat(item?.total || 0).toFixed(2)}`, 70, y, { align: 'right' });
          }
          y += 4.5;
        });
      }

      y += 1;
      drawSolidLine();
      y += 5;

      const rowTotal = (lbl, val, bold = false) => {
        if (!isMeasuring) {
          doc.setFont('Helvetica', bold ? 'bold' : 'normal');
          doc.setFontSize(8.5);
          doc.text(lbl, 35, y);
          doc.text(String(val), 70, y, { align: 'right' });
        }
        y += 4.5;
      }

      rowTotal('Totali pa TVSH:', `${parseFloat(data.totalWithoutVAT).toFixed(2)} €`);
      rowTotal('TVSH totale:', `${parseFloat(data.vat).toFixed(2)} €`);
      if (parseFloat(data.rabati) > 0) {
        if (!isMeasuring) doc.setTextColor(200, 50, 50);
        rowTotal('Rabati (-):', `${parseFloat(data.rabati).toFixed(2)} €`, true);
        if (!isMeasuring) doc.setTextColor(0, 0, 0);
      }

      y += 2;
      drawSolidLine();
      y += 7;

      const totalAmount = parseFloat(parseFloat(data.totalWithoutVAT) + parseFloat(data.vat)).toFixed(2);

      if (!isMeasuring) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('TOTALI:', 5, y);
        doc.text(`${totalAmount} €`, 70, y, { align: 'right' });
      }
      y += 8;

      rowMeta('Mënyra e Pagesës:', llojiPageses || 'Cash');

      y += 3;
      drawDashedLine();
      y += 7;

      if (!isMeasuring) {
        doc.setFont('Helvetica', 'bolditalic');
        doc.setFontSize(9);
        doc.text('Faleminderit për blerjen tuaj!', 37.5, y, { align: 'center' });
      }

      y += 12; // Bottom padding padding
      return y;
    }

    const dummyDoc = new jsPDF({ unit: 'mm', format: [75, 1000] });
    const finalHeight = drawReceipt(dummyDoc, true);

    const doc = new jsPDF({ unit: 'mm', format: [75, finalHeight] });
    drawReceipt(doc, false);

    // Create Blob for Telegram
    const pdfBlob = doc.output("blob");

    // Save locally
    doc.save(`Paragon #${data.invoiceNumber}.pdf`);

    setPerditeso(Date.now());
    setShumaPageses(0);
    setLlojiPageses("Cash");
    setOptionsBarkodiSelected(null);
    setIDPartneri(1);
    setTeDhenatKartelaBleresit(null);
    setIDProduktiFunditShtuar(null);
    setKartelaBleresit(null);
    setRabati2(0);
    setRabati1(0);
  }

  const mbyllFature = async () => {
    await axios
      .get(
        `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${selectedInvoice}`,
        authentikimi,
      )
      .then(async (r) => {
        if (r.data.regjistrimet.totaliPaTVSH <= 0) {
          setTipiMesazhit("danger");
          setPershkrimiMesazhit(
            "Kjo fature nuk mund te mbyllet me qmim 0 ose me te vogel! Ju lutem kontrolloni ate.",
          );
          setShfaqMesazhin(true);
        } else {
          await axios
            .put(
              `${API_BASE_URL}/api/Faturat/perditesoFaturen?idKalulimit=${selectedInvoice}`,
              {
                llojiPageses: llojiPageses,
                statusiKalkulimit: "true",
                idPartneri: r.data.regjistrimet.idPartneri,
                dataRegjistrimit: r.data.regjistrimet.dataRegjistrimit,
                stafiID: r.data.regjistrimet.stafiID,
                totaliPaTVSH: parseFloat(r.data.regjistrimet.totaliPaTVSH),
                tvsh: parseFloat(r.data.regjistrimet.tvsh),
                statusiPageses:
                  llojiPageses !== "Borxh" ? "E Paguar" : "Pa Paguar",
                llojiKalkulimit: r.data.regjistrimet.llojiKalkulimit,
                nrFatures: r.data.regjistrimet.nrFatures,
                pershkrimShtese: r.data.regjistrimet.pershkrimShtese,
                rabati: parseFloat(r.data.rabati),
                nrRendorFatures: r.data.regjistrimet.nrRendorFatures,
                idBonusKartela: r.data.regjistrimet.idBonusKartela,
              },
              authentikimi,
            )
            .then(async () => {
              addNewCustomer();
              for (let produkti of produktetNeKalkulim) {
                await axios.put(
                  `${API_BASE_URL}/api/Faturat/ruajKalkulimin/asgjesoStokun/perditesoStokunQmimin?id=${produkti.idProduktit}`,
                  { sasiaNeStok: produkti.sasiaStokut },
                  authentikimi,
                );
              }
              if (llojiPageses !== "Borxh" && idPartneri !== 1) {
                await axios.post(
                  `${API_BASE_URL}/api/Faturat/ruajKalkulimin`,
                  {
                    dataRegjistrimit: r.data.regjistrimet.dataRegjistrimit,
                    stafiID: r.data.regjistrimet.stafiID,
                    totaliPaTVSH: parseFloat(
                      r.data.regjistrimet.totaliPaTVSH +
                      r.data.regjistrimet.tvsh,
                    ),
                    tvsh: 0,
                    idPartneri: r.data.regjistrimet.idPartneri,
                    statusiPageses: "E Paguar",
                    llojiPageses: llojiPageses,
                    nrFatures: "PAGES-" + r.data.regjistrimet.nrFatures,
                    llojiKalkulimit: "PAGES",
                    pershkrimShtese:
                      r.data.regjistrimet.pershkrimShtese +
                      " Pagese per Faturen: " +
                      r.data.regjistrimet.nrFatures,
                    nrRendorFatures: r.data.regjistrimet.nrRendorFatures + 1,
                    idBonusKartela: null,
                    statusiKalkulimit: "true",
                  },
                  authentikimi,
                );
              }
              // Remove closed invoice and select next
              const updatedInvoices = activeInvoices.filter(
                (id) => id !== selectedInvoice,
              );
              setActiveInvoices(updatedInvoices);
              setSelectedInvoice(updatedInvoices[0] || null);
              setPerditeso(Date.now());

              document.getElementById("barkodiSelect-input")?.focus();
            });
          const data = {
            invoiceNumber: r?.data?.regjistrimet?.nrFatures,
            date: currentDate,
            salesUsername:
              r?.data?.regjistrimet?.stafiID +
              " - " +
              r?.data?.regjistrimet?.username,
            items: produktetNeKalkulim.map((p) => {
              const finalPrice = parseFloat(
                p.qmimiShites -
                p.qmimiShites * (p.rabati1 / 100) -
                (p.qmimiShites - p.qmimiShites * (p.rabati1 / 100)) * (p.rabati2 / 100) -
                (p.qmimiShites - p.qmimiShites * (p.rabati1 / 100) - (p.qmimiShites - p.qmimiShites * (p.rabati1 / 100)) * (p.rabati2 / 100)) * (p.rabati3 / 100)
              );
              return {
                idProduktit: p.idProduktit || 0,
                name: p.emriProduktit || "Produkti",
                vatPercentage: parseInt(p.llojiTvsh) || 18,
                quantity: p.sasiaStokut || 1,
                price: finalPrice.toFixed(2) || "0.00",
                rabatiStok: p.rabati1 || 0,
                total: (finalPrice * (p.sasiaStokut || 1)).toFixed(2) || "0.00",
              };
            }),
            totalWithoutVAT: parseFloat(
              r?.data?.regjistrimet?.totaliPaTVSH,
            ).toFixed(2),
            vat: parseFloat(r?.data?.regjistrimet?.tvsh).toFixed(2),
            rabati: parseFloat(r?.data?.rabati ?? 0).toFixed(2),
          };
          generateInvoice(data);
        }
      });
    document.getElementById("barkodiSelect-input").focus();
  };

  async function VendosKartelenBleresit() {
    try {
      const kaKartele = await axios.get(
        `${API_BASE_URL}/api/Kartelat/shfaqKartelenSipasKodit?kodiKarteles=${kartelaBleresit}`,
        authentikimi,
      );
      if (kaKartele != null) {
        setRabati2(kaKartele.data.rabati);
        setIDPartneri(kaKartele.data.partneriID);
        setTeDhenatKartelaBleresit(kaKartele.data);
        const r = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${selectedInvoice}`,
          authentikimi,
        );
        await axios.put(
          `${API_BASE_URL}/api/Faturat/perditesoFaturen?idKalulimit=${selectedInvoice}`,
          {
            llojiPageses: r.data.regjistrimet.llojiPageses,
            statusiKalkulimit: r.data.regjistrimet.statusiKalkulimit,
            idPartneri: kaKartele.data.partneriID,
            dataRegjistrimit: r.data.regjistrimet.dataRegjistrimit,
            stafiID: r.data.regjistrimet.stafiID,
            totaliPaTVSH: parseFloat(r.data.regjistrimet.totaliPaTVSH),
            tvsh: parseFloat(r.data.regjistrimet.tvsh),
            statusiPageses: r.data.statusiPageses,
            llojiKalkulimit: r.data.regjistrimet.llojiKalkulimit,
            nrFatures: r.data.regjistrimet.nrFatures,
            pershkrimShtese: r.data.regjistrimet.pershkrimShtese,
            rabati: parseFloat(r.data.rabati),
            nrRendorFatures: r.data.regjistrimet.nrRendorFatures,
            idBonusKartela: kaKartele.data.idKartela,
          },
          authentikimi,
        );
        for (let produkti of produktetNeKalkulim) {
          await axios.put(
            `${API_BASE_URL}/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${produkti.id}`,
            {
              sasiaStokut: produkti.sasiaStokut,
              qmimiShites: produkti.qmimiShites,
              qmimiShitesMeShumic: produkti.qmimiShitesMeShumic,
              rabati1: produkti?.rabati1 ?? 0,
              rabati2: kaKartele.data.rabati,
            },
            authentikimi,
          );
        }
        setKartelaBleresit(null);
        setVendosKartelenBleresit(false);
        setPerditesoFat(Date.now());
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        document.getElementById("barkodiSelect-input").focus();
        setVendosKartelenBleresit(false);
        setTipiMesazhit("danger");
        setPershkrimiMesazhit("Kartela nuk egziston!");
        setShfaqMesazhin(true);
      }
    }
  }

  async function VendosKartelenFshirjesProduktit() {
    try {
      const kaKartele = await axios.get(
        `${API_BASE_URL}/api/Kartelat/shfaqKartelenSipasKodit?kodiKarteles=${kartelaFshirjes}`,
        authentikimi,
      );
      if (kaKartele != null) {
        if (kaKartele.data.llojiKarteles == "Fshirje") {
          await axios.delete(
            `${API_BASE_URL}/api/Faturat/ruajKalkulimin/FshijTeDhenat?idTeDhenat=${fshijProdKalkID}`,
            authentikimi,
          );
          document.getElementById("barkodiSelect-input").focus();
          setVendosKartelenFshirjeProduktit(false);
          setKartelaFshirjes(null);
          setPerditesoFat(Date.now());
        } else {
          document.getElementById("barkodiSelect-input").focus();
          setVendosKartelenFshirjeProduktit(false);
          setKartelaFshirjes(null);
          setTipiMesazhit("danger");
          setPershkrimiMesazhit("Kartela nuk eshte valide per kete funksion!");
          setShfaqMesazhin(true);
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        document.getElementById("barkodiSelect-input").focus();
        setVendosKartelenBleresit(false);
        setTipiMesazhit("danger");
        setPershkrimiMesazhit("Kartela nuk egziston!");
        setShfaqMesazhin(true);
      }
    }
  }

  useEffect(() => {
    // POS Layout is now optimized via POSLayout.css to fit the screen
  }, []);

  const [showNEEPM, setShowNEEPM] = useState(true);

  const handleCloseNEEPM = () => {
    setShowNEEPM(false);
  };

  const [inputValue, setInputValue] = useState("");
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
    for (let i = 0; i < optionsBarkodi.length; i++) {
      const option = optionsBarkodi[i];
      if (option && option.label && option.label.toLowerCase().includes(lower)) {
        results.push(option);
        if (results.length >= 50) break;
      }
    }
    return results;
  }, [inputValue, optionsBarkodi]);

  return (
    <div className="pos-page-wrapper">
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Arkatar"]} />
      <Titulli titulli={"POS"} />

      <div className="pos-main-container">
        {showNEEPM && (
          <NukEshteEOptimizuarPerMobile
            title="Përdorni një Paisje tjeter!"
            message="Kjo faqe (POS) nuk është e optimizuar që të përdoret në pajisjet mobile. Ju lutemi, përdorni një kompjuter për të vazhduar."
            onClose={handleCloseNEEPM}
          />
        )}

        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}

        {/* Modal for Client Card (Logic preserved) */}
        {vendosKartelenBleresit && (
          <Modal
            show={vendosKartelenBleresit}
            onHide={() => setVendosKartelenBleresit(false)}
            centered
            className="pos-modal">
            <Modal.Header closeButton>
              <Modal.Title as="h6">Vendosni Kartelen</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Nr. Karteles</Form.Label>
                <Form.Control
                  id="nrKarteles"
                  type="text"
                  value={kartelaBleresit}
                  onChange={(e) => setKartelaBleresit(e.target.value)}
                  placeholder="Shkruani kartelen bleresit"
                  onKeyDown={handleMenaxhoTastetKartelaZbritjes}
                  autoFocus
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setVendosKartelenBleresit(false)}>
                Anulo
              </Button>
              <Button variant="warning" onClick={VendosKartelenBleresit}>
                Vendos Kartelen
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        {/* Modal for Deletion Card (Logic preserved) */}
        {vendosKartelenFshirjeProduktit && (
          <Modal
            show={vendosKartelenFshirjeProduktit}
            onHide={() => setVendosKartelenFshirjeProduktit(false)}
            centered
            className="pos-modal">
            <Modal.Header closeButton>
              <Modal.Title as="h6">Konfirmo Fshirjen</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Nr. Karteles Menaxheriale</Form.Label>
                <Form.Control
                  id="nrKarteles"
                  type="text"
                  value={kartelaFshirjes}
                  onChange={(e) => setKartelaFshirjes(e.target.value)}
                  placeholder="Shkruani kartelen per fshirjen e produktit"
                  autoFocus
                  onKeyDown={handleMenaxhoTastetKartelaFshirjes}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setVendosKartelenFshirjeProduktit(false)}>
                Anulo
              </Button>
              <Button
                variant="warning"
                onClick={VendosKartelenFshirjesProduktit}>
                Konfirmo
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        {loading ? (
          <div className="Loader d-flex align-items-center justify-content-center h-100">
            <TailSpin height="80" width="80" color="#6366f1" radius="1" visible={true} />
          </div>
        ) : (
          <>
            <div className="pos-header">
              <div className="pos-title-section">
                <div className="d-flex align-items-center gap-2">
                  <h2 className="pos-main-title">Pika e Shitjes (POS)</h2>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate("/")}
                    className="rounded-pill px-3 py-1 fw-600 d-flex align-items-center gap-1 border-0 bg-primary-subtle text-primary">
                    <History size={14} /> Dashboard
                  </Button>
                </div>

                <div className="invoice-tabs-custom ms-4">
                  {activeInvoices.length > 0 && (
                    <Tabs
                      activeKey={selectedInvoice || "none"}
                      onSelect={(key) => setSelectedInvoice(parseInt(key))}
                      className="border-0">
                      {activeInvoices.map((invoiceId, index) => (
                        <Tab
                          eventKey={invoiceId}
                          title={<span><User size={13} className="me-1" /> Klienti {index + 1}</span>}
                          key={invoiceId}
                        />
                      ))}
                    </Tabs>
                  )}
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={addNewCustomer}
                  className="rounded-circle d-flex align-items-center justify-content-center p-0"
                  style={{ width: '28px', height: '28px' }}>
                  <PlusCircle size={18} color="white" />
                </Button>
              </div>
              <div className="pos-header-info">
                <span className="pos-nr-chip"><Hash size={13} /> {nrFatures || '-'}</span>
                <span><CalendarIcon size={14} className="me-1" style={{ opacity: 0.6 }} /> {currentDate}</span>
              </div>
            </div>

            <div className="pos-content-grid">
              {activeInvoices.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="d-flex flex-column align-items-center justify-content-center bg-white rounded-4 shadow-sm h-100 grid-span-all"
                >
                  <div className="text-center p-5 empty-pos-state">
                    <MonitorSpeaker size={90} className="text-muted opacity-25 mb-4 pulse-slow" />
                    <h2 className="fw-bold text-dark mb-2">Terminali i Shitjes</h2>
                    <p className="text-muted mb-4 px-4">Hapni një faturë të re për të filluar me shtimin e produkteve dhe skanimin e barkodeve.</p>
                    <Button variant="primary" size="lg" className="px-5 py-3 rounded-pill fw-bold shadow hover-lift" onClick={addNewCustomer}>
                      <PlusCircle size={20} className="me-2" />
                      Fillo Porosinë e Re
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <>
                  <div className="pos-left-side">
                    <div className="pos-input-card">
                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="small fw-bold text-muted text-uppercase mb-1">Barkodi / Produkti</Form.Label>
                            <style>{`
                              .pos-input-card .pos-select__option--is-focused { background-color: rgba(16, 185, 129, 0.3) !important; color: white !important; cursor: pointer !important; }
                              .pos-input-card .pos-select__option--is-selected { background-color: #10b981 !important; color: white !important; }
                            `}</style>
                            <Select
                              id="barkodiSelect"
                              classNamePrefix="pos-select"
                              placeholder="Kërko produktin ose skano barkodin..."
                              isClearable
                              ref={selectRef}
                              inputId="barkodiSelect-input"
                              options={filteredOptions}
                              value={optionsBarkodiSelected}
                              onChange={(selected) => {
                                if (selected) {
                                  handleChange(selected);
                                }
                              }}
                              onInputChange={handleInputChange}
                              onKeyDown={handleKaloTekPagesa}
                              inputValue={inputValue}
                              filterOption={null}
                              noOptionsMessage={() =>
                                inputValue.length < 2
                                  ? "Shkruani të paktën 2 karaktere"
                                  : "Nuk u gjet produkt"
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label className="small fw-bold text-muted mb-1">Sasia - {njesiaMatese === "COPE" ? "Copë" : njesiaMatese}</Form.Label>
                            <Form.Control
                              id="sasia"
                              type="number"
                              placeholder="0.00"
                              value={sasia}
                              onChange={(e) => kontrolloQmimin(e)}
                              onKeyDown={(e) => handleEdito(e)}
                              disabled={!edito}
                              className={edito ? "border-warning bg-warning-subtle fw-bold" : "fw-bold"}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3} className="d-flex align-items-end gap-2">
                          <Form.Group className="flex-grow-1">
                            <Form.Label className="small fw-bold text-muted mb-1">Çmimi €</Form.Label>
                            <Form.Control
                              type="number"
                              value={qmimiSH}
                              disabled
                              className="bg-light fw-bold text-primary"
                            />
                          </Form.Group>
                          <Button
                            variant="light"
                            title="Historia e Kthimeve"
                            onClick={() => navigate("/KthimiMallitTeShitur")}
                            className="bg-white border-light shadow-sm btn-icon-round"
                            style={{ height: '38px', width: '38px' }}>
                            <History size={18} className="text-secondary" />
                          </Button>
                        </Col>
                      </Row>
                    </div>

                    <div className="pos-table-card">
                      <div className="pos-table-header flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <Receipt size={18} className="text-primary" />
                          <span>Produktet në Paragon</span>
                          <Badge bg="primary" className="rounded-pill px-2 pb-1 mx-1">{produktetNeKalkulim.length}</Badge>
                        </div>
                        <Form.Control
                          size="sm"
                          placeholder="Filtro produktet..."
                          className="pos-search-filter"
                          value={filterText}
                          onChange={(e) => setFilterText(e.target.value)}
                        />
                      </div>
                      <div className="pos-table-scroll">
                        <Table hover borderless>
                          <thead>
                            <tr>
                              <th style={{ width: '60px' }}>Nr.</th>
                              <th style={{ width: '120px' }}>Barkodi</th>
                              <th>Emërtimi</th>
                              <th style={{ width: '100px' }}>Sasia</th>
                              <th className="text-end" style={{ width: '110px' }}>Çmimi</th>
                              <th className="text-end" style={{ width: '130px' }}>Shuma</th>
                              <th className="text-center" style={{ width: '110px' }}>Veprime</th>
                            </tr>
                          </thead>
                          <tbody>
                            <AnimatePresence>
                              {produktetNeKalkulim.filter(p => p.emriProduktit.toLowerCase().includes(filterText.toLowerCase()) || p.barkodi.toLowerCase().includes(filterText.toLowerCase())).map((p, index) => {
                                const qmimiMeTVSHRab = parseFloat(
                                  p.qmimiShites -
                                  p.qmimiShites * (p.rabati1 / 100) -
                                  (p.qmimiShites - p.qmimiShites * (p.rabati1 / 100)) *
                                  (p.rabati2 / 100) -
                                  (p.qmimiShites -
                                    p.qmimiShites * (p.rabati1 / 100) -
                                    (p.qmimiShites -
                                      p.qmimiShites * (p.rabati1 / 100)) *
                                    (p.rabati2 / 100)) *
                                  (p.rabati3 / 100),
                                ).toFixed(3);
                                const ShumaToT = parseFloat(
                                  qmimiMeTVSHRab * p.sasiaStokut,
                                ).toFixed(3);
                                const originalIndex =
                                  produktetNeKalkulim.length - 1 - index;
                                return (
                                  p && (
                                    <motion.tr
                                      key={p.id || originalIndex}
                                      initial={{ opacity: 0, x: -20, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                                      animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(0, 0, 0, 0)' }}
                                      exit={{ opacity: 0, scale: 0.95, backgroundColor: 'rgba(248, 113, 113, 0.1)' }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <td className="text-muted small align-middle">#{originalIndex + 1}</td>
                                      <td className="font-monospace small align-middle">{p.barkodi}</td>
                                      <td className="fw-semibold align-middle truncate-cell" title={p.emriProduktit}>{p.emriProduktit}</td>
                                      <td className="align-middle"><Badge bg="light" text="dark" className="border px-2 py-1 qty-badge">{p.sasiaStokut} {p.emriNjesiaMatese === "COPE" ? "Copë" : p.emriNjesiaMatese}</Badge></td>
                                      <td className="text-end fw-bold align-middle">{parseFloat(qmimiMeTVSHRab).toFixed(2)} €</td>
                                      <td className="text-end fw-bold text-primary fs-6 align-middle">{parseFloat(ShumaToT).toFixed(2)} €</td>
                                      <td className="align-middle">
                                        <div className="d-flex justify-content-center gap-2">
                                          <Button
                                            size="sm"
                                            variant="light"
                                            className="btn-icon-round border text-danger shadow-sm bg-white"
                                            disabled={edito}
                                            onClick={() => {
                                              setVendosKartelenFshirjeProduktit(true);
                                              setFshijProduktKalkID(p.id);
                                            }}>
                                            <Trash size={15} />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="light"
                                            className="btn-icon-round border text-warning shadow-sm bg-white"
                                            disabled={edito}
                                            onClick={() => {
                                              setOptionsBarkodiSelected(p.idProduktit);
                                              handleEdit(p.id, index);
                                            }}>
                                            <Edit size={15} />
                                          </Button>
                                        </div>
                                      </td>
                                    </motion.tr>
                                  )
                                );
                              })}
                            </AnimatePresence>
                          </tbody>
                        </Table>
                      </div>
                    </div>

                    <div className="keyboard-shortcuts mt-0">
                      <span><kbd>ESC</kbd> Pagesa</span>
                      <span><kbd>F1</kbd> Edito Fundit</span>
                      <span><kbd>F4</kbd> Kartela</span>
                      <span><kbd>F5</kbd> Mbyll</span>
                      <span><kbd>Ctrl 1-9</kbd> Klientët</span>
                    </div>
                  </div>

                  <div className="pos-right-side">
                    <div className="pos-summary-card">
                      <div className="pos-total-display">
                        <span className="label">Totali për Pagesë</span>
                        <span className="amount">{(parseFloat(qmimiTotal) || 0).toFixed(2)} €</span>
                        <div className="amount-sub">
                          <span>Pa TVSH: {(parseFloat(qmimiTotal) - parseFloat(totaliTVSH) || 0).toFixed(2)} €</span>
                          <span>TVSH: {(parseFloat(totaliTVSH) || 0).toFixed(2)} €</span>
                        </div>
                      </div>

                      <div className="pos-payment-details">
                        <Row className="g-2">
                          <Col xs={12}>
                            <Form.Group>
                              <Form.Label className="small fw-bold text-muted text-uppercase mb-1">Mënyra e Pagesës</Form.Label>
                              <Form.Select
                                value={llojiPageses || ""}
                                disabled={edito}
                                onChange={(e) => setLlojiPageses(e.target.value)}
                                className="fw-bold">
                                <option value="Cash">Cash (Para të Gatshme)</option>
                                <option value="Banke">Bankë (Debit / Credit Kartela)</option>
                                {teDhenatKartelaBleresit != null && (
                                  <option value="Borxh">Borxh (Kredit)</option>
                                )}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>

                        <div className="mt-2">
                          <Form.Label className="small fw-bold text-muted text-uppercase mb-1">Shuma e Paguar</Form.Label>
                          <InputGroup>
                            <InputGroup.Text><CreditCard size={16} /></InputGroup.Text>
                            <Form.Control
                              id="shumaPageses"
                              type="number"
                              value={shumaPageses || ""}
                              placeholder="0.00"
                              disabled={edito}
                              onChange={(e) => setShumaPageses(e.target.value)}
                              onKeyDown={handleMenaxhoTastetPagesa}
                              className="fw-bold text-end"
                              style={{ fontSize: '1.2rem' }}
                            />
                            <InputGroup.Text>€</InputGroup.Text>
                          </InputGroup>
                        </div>

                        <div className="pos-info-row border-bottom border-light">
                          <span className="text-muted">Kusuri:</span>
                          <span className={`value fs-5 ${shumaPageses - qmimiTotal > 0 ? "text-success" : (shumaPageses - qmimiTotal < 0 ? "text-danger" : "")}`}>
                            {parseFloat(shumaPageses - qmimiTotal).toFixed(2)} €
                          </span>
                        </div>

                        <div className="pos-info-row">
                          <span className="text-muted"><Package size={16} className="me-1" /> Në Stok:</span>
                          <span className="value">
                            {parseFloat(sasiaAktualeNeStok).toFixed(2)} {njesiaMatese === "COPE" ? "Copë" : njesiaMatese}
                          </span>
                        </div>
                      </div>

                      {teDhenatKartelaBleresit != null && (
                        <div className="pos-client-card shadow-sm">
                          <span className="client-name">
                            <User size={14} className="me-1 text-primary" />
                            {teDhenatKartelaBleresit.partneri?.emriBiznesit}
                          </span>
                          <div className="discount-info d-flex flex-column gap-1 mt-1">
                            <div className="d-flex justify-content-between">
                              <span>Rabati:</span>
                              <span className="fw-bold text-success">{parseFloat(teDhenatKartelaBleresit.rabati).toFixed(2)}%</span>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span>Kursimi:</span>
                              <span className="fw-bold text-success">-{parseFloat(qmimiPaRabatBonus - qmimiTotal).toFixed(2)} €</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pos-actions">
                        <Button
                          className="w-100 btn-pay rounded-3 mb-0"
                          onClick={mbyllFature}
                          disabled={produktetNeKalkulim.length === 0}>
                          Mbyll Faturën (F5)
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default POS;
