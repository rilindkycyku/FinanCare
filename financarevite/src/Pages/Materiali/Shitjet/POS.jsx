import { useEffect, useState } from "react";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faXmark,
  faPenToSquare,
  faDolly,
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import { Table, Form, Container, Row, Col, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import Titulli from "../../../Components/TeTjera/Titulli";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import jsPDF from "jspdf";
import NukEshteEOptimizuarPerMobile from "../../../Components/TeTjera/layout/NukEshteEOptimizuarPerMobile";

function POS(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
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

  const navigate = useNavigate();

  const getID = localStorage.getItem("id");
  const getToken = localStorage.getItem("token");
  const authentikimi = { headers: { Authorization: `Bearer ${getToken}` } };

  useEffect(() => {
    const vendosTeDhenatBiznesit = async () => {
      try {
        const teDhenat = await axios.get(
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`,
          authentikimi
        );
        setTeDhenatBiznesit(teDhenat.data);
      } catch (err) {
        console.error("Error fetching business details:", err);
      }
    };
    vendosTeDhenatBiznesit();
  }, [perditeso]);

  useEffect(() => {
    if (getID) {
      const vendosTeDhenat = async () => {
        try {
          const perdoruesi = await axios.get(
            `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
            authentikimi
          );
          const nrRendor = await axios.get(
            `${API_BASE_URL}/api/Faturat/ShfaqNumrinRendorFatures?stafiID=${perdoruesi.data.perdoruesi.userID}`,
            authentikimi
          );
          setNrFatures(nrRendor.data.nrFat);
          setIdRegjistrimit(nrRendor.data.idRegjistrimit);
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      };
      vendosTeDhenat();
    } else {
      navigate("/login");
    }
  }, [perditeso]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPerditesoFat(Date.now());
    }, 1000);
    return () => clearTimeout(timer);
  }, [perditeso]);

  useEffect(() => {
    const vendosTeDhenat = async () => {
      try {
        const teDhenatKalkulimit = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${idRegjistrimit}`,
          authentikimi
        );
        const teDhenatFatures = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${idRegjistrimit}`,
          authentikimi
        );
        setproduktetNeKalkulim(teDhenatKalkulimit.data);
        setIDPartneri(teDhenatFatures.data.regjistrimet.idPartneri);
        if (teDhenatFatures.data.regjistrimet.bonusKartela != null) {
          setKartelaBleresit(teDhenatFatures.data.regjistrimet.idBonusKartela);
          setTeDhenatKartelaBleresit(
            teDhenatFatures.data.regjistrimet.bonusKartela
          );
        } else {
          setKartelaBleresit(null);
          setTeDhenatKartelaBleresit(null);
        }
        if (teDhenatKalkulimit.data && teDhenatKalkulimit.data.length > 0) {
          setIDProduktiFunditShtuar(teDhenatKalkulimit.data[0].id);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    vendosTeDhenat();
  }, [perditesoFat, produktiID]);

  useEffect(() => {
    const calculateTotals = async () => {
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
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${idRegjistrimit}`,
          authentikimi
        );
        await axios.put(
          `${API_BASE_URL}/api/Faturat/perditesoFaturen?idKalulimit=${idRegjistrimit}`,
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
          authentikimi
        );
      } catch (error) {
        console.error("Error fetching or updating data:", error);
      }
    };
    calculateTotals();
  }, [produktetNeKalkulim, idRegjistrimit, perditesoFat, idPartneri]);

  const ndrroField = (e, tjetra) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(tjetra).focus();
    }
  };

  async function handleEdit(id, index) {
    await axios
      .get(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/getKalkulimi?idKalkulimit=${id}`,
        authentikimi
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
        document.getElementById("sasia").focus();
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
        authentikimi
      );
      setproduktiID(0);
      setSasia("");
      setQmimiSH(0);
      setOptionsBarkodiSelected(null);
      setEdito(false);
      setPerditesoFat(Date.now());
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
      (option) => option.value === produktiID
    );
    setOptionsBarkodiSelected(initialOptionsBarkodiSelected);
    document.getElementById("sasia").focus();
  }, [edito, produktiID]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`, authentikimi)
      .then((response) => {
        const fetchedOptionsBarkodi = response.data
          .filter((item) => item.qmimiProduktit > 0)
          .map((item) => ({
            value: item.produktiID,
            label:
              item.barkodi +
              " - " +
              item.emriProduktit +
              " - " +
              item.kodiProduktit,
            qmimiProduktit: item.qmimiProduktit,
            qmimiMeShumic: item.qmimiMeShumic,
            rabati: item.rabati,
            sasiaNeStok: item.sasiaNeStok,
            emriNjesiaMatese: item.emriNjesiaMatese,
          }));
        setOptionsBarkodi(fetchedOptionsBarkodi);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleChange = async (barkodi) => {
    setOptionsBarkodiSelected(barkodi);
    await axios
      .post(
        `${API_BASE_URL}/api/Faturat/ruajKalkulimin/teDhenat`,
        {
          idRegjistrimit: idRegjistrimit,
          idProduktit: barkodi.value,
          sasiaStokut: 1,
          qmimiShites: barkodi.qmimiProduktit,
          qmimiShitesMeShumic: barkodi.qmimiMeShumic,
          rabati1: barkodi.rabati,
          rabati2: rabati2,
        },
        authentikimi
      )
      .then((r) => {
        setIDProduktiFunditShtuar(r.data.id);
      });
    setproduktiID(0);
    setSasia("");
    setSasiaShumices(0);
    setNjesiaMatese(barkodi.emriNjesiaMatese);
    setSasiaAktualeNeStok(barkodi.sasiaNeStok);
    setQmimiSH(0);
    setQmimiSH2(0);
    setOptionsBarkodiSelected(null);
    setPerditesoFat(Date.now());
  };

  const handleKaloTekPagesa = (event) => {
    event.preventDefault();
    if (event.key === "Escape") {
      document.getElementById("shumaPageses").focus();
    }
    if (event.key === "F1") {
      if (IDProduktiFunditShtuar != null) {
        handleEdit(IDProduktiFunditShtuar);
      }
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

  async function generateInvoice(data) {
    const initialDoc = new jsPDF({ unit: "mm", format: [75, 1000] });
    const logoUrl = `${process.env.PUBLIC_URL}/img/web/${teDhenatBiznesit?.logo}`;
    const logoImage = await loadImage(logoUrl);
    initialDoc.addImage(logoImage, "PNG", 10, 5, 55, 15);
    let currentY = 25;

    function addShrinkText(doc, text, x, y, maxWidth) {
      let fontSize = 10;
      doc.setFont("Courier");
      doc.setFontSize(fontSize);
      while (doc.getTextWidth(text) > maxWidth && fontSize > 7) {
        fontSize -= 1;
        doc.setFontSize(fontSize);
      }
      doc.text(text, x, y, { align: "center" });
    }

    addShrinkText(
      initialDoc,
      teDhenatBiznesit?.emriIBiznesit,
      37.5,
      currentY,
      70
    );
    currentY += 5;
    addShrinkText(
      initialDoc,
      `Adresa: ${teDhenatBiznesit?.adresa}`,
      37.5,
      currentY,
      70
    );
    currentY += 5;
    addShrinkText(
      initialDoc,
      `Kontakti: ${teDhenatBiznesit?.nrKontaktit} - ${teDhenatBiznesit?.email}`,
      37.5,
      currentY,
      70
    );
    currentY += 5;
    addShrinkText(
      initialDoc,
      `NUI: ${teDhenatBiznesit?.nui}`,
      37.5,
      currentY,
      70
    );
    currentY += 5;
    addShrinkText(
      initialDoc,
      `TVSH: ${teDhenatBiznesit?.nrTVSH}`,
      38.5,
      currentY,
      70
    );
    currentY += 5;
    addShrinkText(
      initialDoc,
      `NRF: ${teDhenatBiznesit?.nf}`,
      37.5,
      currentY,
      70
    );
    currentY += 5;
    initialDoc.line(0, currentY, 75, currentY);
    currentY += 5;

    addShrinkText(initialDoc, "PARAGON", 37.5, currentY, 70);
    currentY += 5;
    addShrinkText(
      initialDoc,
      `Paragon #: ${data.invoiceNumber}`,
      26.5,
      currentY,
      70
    );
    currentY += 5;
    addShrinkText(initialDoc, `Data: ${data.date}`, 18, currentY, 70);
    currentY += 5;
    addShrinkText(
      initialDoc,
      `Shitësi: ${data.salesUsername}`,
      32.5,
      currentY,
      70
    );
    currentY += 5;
    initialDoc.line(0, currentY, 75, currentY);
    currentY += 5;

    currentY += 5;
    addShrinkText(initialDoc, "Produkti", 11, currentY, 30);
    addShrinkText(initialDoc, "TVSH (%)", 63, currentY, 20);
    currentY += 5;
    addShrinkText(initialDoc, "Çmimi", 11, currentY, 20);
    addShrinkText(initialDoc, "Sasia", 38, currentY, 20);
    addShrinkText(initialDoc, "Totali", 63, currentY, 20);
    currentY += 5;
    addShrinkText(
      initialDoc,
      "----------------------------------",
      37.5,
      currentY,
      70
    );
    currentY += 5;

    data.items.forEach((item) => {
      addShrinkText(doc, item.name, 38, currentY, 30);
      currentY += 5;
      addShrinkText(
        doc,
        `${parseFloat(item.vatPercentage).toFixed(2)} %`,
        63,
        currentY,
        20
      );
      currentY += 5;
      addShrinkText(
        doc,
        `${parseFloat(item.price).toFixed(2)} €`,
        11,
        currentY,
        20
      );
      addShrinkText(doc, `${item.quantity}`, 38, currentY, 20);
      addShrinkText(
        doc,
        `${parseFloat(item.total).toFixed(2)} €`,
        63,
        currentY,
        20
      );
      currentY += 5;
      addShrinkText(
        doc,
        "----------------------------------",
        37.5,
        currentY,
        70
      );
      currentY += 5;
    });
    initialDoc.line(0, currentY, 75, currentY);
    currentY += 5;

    addShrinkText(
      initialDoc,
      `Totali pa TVSH: ${data.totalWithoutVAT} €`,
      25.5,
      currentY,
      70
    );
    currentY += 5;
    addShrinkText(initialDoc, `TVSH: ${data.vat} €`, 14, currentY, 70);
    currentY += 5;
    addShrinkText(
      initialDoc,
      `Totali pa Rabat: ${parseFloat(
        parseFloat(data.totalWithoutVAT) +
          parseFloat(data.vat) +
          parseFloat(data.rabati)
      ).toFixed(2)} €`,
      26.5,
      currentY,
      70
    );
    currentY += 5;
    addShrinkText(initialDoc, `Rabati: ${data.rabati} €`, 16.5, currentY, 70);
    currentY += 5;
    addShrinkText(
      initialDoc,
      `Totali: ${parseFloat(
        parseFloat(data.totalWithoutVAT) + parseFloat(data.vat)
      ).toFixed(2)} €`,
      17.5,
      currentY,
      70
    );
    currentY += 10;
    addShrinkText(initialDoc, "Faleminderit për blerjen!", 37.5, currentY, 70);

    const finalHeight = currentY + 20;
    const doc = new jsPDF({ unit: "mm", format: [75, finalHeight] });
    doc.addImage(logoImage, "PNG", 10, 5, 55, 15);
    currentY = 25;

    addShrinkText(doc, teDhenatBiznesit?.emriIBiznesit, 37.5, currentY, 70);
    currentY += 5;
    addShrinkText(
      doc,
      `Adresa: ${teDhenatBiznesit?.adresa}`,
      37.5,
      currentY,
      70
    );
    currentY += 5;
    addShrinkText(
      doc,
      `Kontakti: ${teDhenatBiznesit?.nrKontaktit} - ${teDhenatBiznesit?.email}`,
      37.5,
      currentY,
      70
    );
    currentY += 5;
    addShrinkText(doc, `NUI: ${teDhenatBiznesit?.nui}`, 37.5, currentY, 70);
    currentY += 5;
    addShrinkText(doc, `TVSH: ${teDhenatBiznesit?.nrTVSH}`, 38.5, currentY, 70);
    currentY += 5;
    addShrinkText(doc, `NRF: ${teDhenatBiznesit?.nf}`, 37.5, currentY, 70);
    currentY += 5;
    doc.line(0, currentY, 75, currentY);
    currentY += 5;

    addShrinkText(doc, "PARAGON", 37.5, currentY, 70);
    currentY += 5;
    addShrinkText(doc, `Paragon #: ${data.invoiceNumber}`, 26.5, currentY, 70);
    currentY += 5;
    addShrinkText(doc, `Data: ${data.date}`, 18, currentY, 70);
    currentY += 5;
    addShrinkText(doc, `Shitësi: ${data.salesUsername}`, 32.5, currentY, 70);
    currentY += 5;
    doc.line(0, currentY, 75, currentY);
    currentY += 5;

    currentY += 5;
    addShrinkText(doc, "Produkti", 11, currentY, 30);
    addShrinkText(doc, "TVSH (%)", 63, currentY, 20);
    currentY += 5;
    addShrinkText(doc, "Çmimi", 11, currentY, 20);
    addShrinkText(doc, "Sasia", 38, currentY, 20);
    addShrinkText(doc, "Totali", 63, currentY, 20);
    currentY += 5;
    addShrinkText(
      doc,
      "----------------------------------",
      37.5,
      currentY,
      70
    );
    currentY += 5;

    data.items.forEach((item) => {
      addShrinkText(doc, item.name, 38, currentY, 30);
      currentY += 5;
      addShrinkText(
        doc,
        `${parseFloat(item.vatPercentage).toFixed(2)} %`,
        63,
        currentY,
        20
      );
      currentY += 5;
      addShrinkText(
        doc,
        `${parseFloat(item.price).toFixed(2)} €`,
        11,
        currentY,
        20
      );
      addShrinkText(doc, `${item.quantity}`, 38, currentY, 20);
      addShrinkText(
        doc,
        `${parseFloat(item.total).toFixed(2)} €`,
        63,
        currentY,
        20
      );
      currentY += 5;
      addShrinkText(
        doc,
        "----------------------------------",
        37.5,
        currentY,
        70
      );
      currentY += 5;
    });
    doc.line(0, currentY, 75, currentY);
    currentY += 5;

    addShrinkText(
      doc,
      `Totali pa TVSH: ${data.totalWithoutVAT} €`,
      25.5,
      currentY,
      70
    );
    currentY += 5;
    addShrinkText(doc, `TVSH: ${data.vat} €`, 14, currentY, 70);
    currentY += 5;
    addShrinkText(
      doc,
      `Totali pa Rabat: ${parseFloat(
        parseFloat(data.totalWithoutVAT) +
          parseFloat(data.vat) +
          parseFloat(data.rabati)
      ).toFixed(2)} €`,
      26.5,
      currentY,
      70
    );
    currentY += 5;
    addShrinkText(doc, `Rabati: ${data.rabati} €`, 16.5, currentY, 70);
    currentY += 5;
    addShrinkText(
      doc,
      `Totali: ${parseFloat(
        parseFloat(data.totalWithoutVAT) + parseFloat(data.vat)
      ).toFixed(2)} €`,
      17.5,
      currentY,
      70
    );
    currentY += 10;
    addShrinkText(doc, "Faleminderit për blerjen!", 37.5, currentY, 70);
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

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
    });
  }

  const mbyllFature = async (event) => {
    await axios
      .get(
        `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${idRegjistrimit}`,
        authentikimi
      )
      .then(async (r) => {
        if (r.data.regjistrimet.totaliPaTVSH <= 0) {
          setTipiMesazhit("danger");
          setPershkrimiMesazhit(
            "Kjo fature nuk mund te mbyllet me qmim 0 ose me te vogel! Ju lutem kontrolloni ate."
          );
          setShfaqMesazhin(true);
        } else {
          await axios
            .put(
              `${API_BASE_URL}/api/Faturat/perditesoFaturen?idKalulimit=${idRegjistrimit}`,
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
              authentikimi
            )
            .then(async () => {
              for (let produkti of produktetNeKalkulim) {
                await axios.put(
                  `${API_BASE_URL}/api/Faturat/ruajKalkulimin/asgjesoStokun/perditesoStokunQmimin?id=${produkti.idProduktit}`,
                  { sasiaNeStok: produkti.sasiaStokut },
                  authentikimi
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
                        r.data.regjistrimet.tvsh -
                        r.data.rabati
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
                  authentikimi
                );
              }
            });
        }
        document.getElementById("barkodiSelect-input").focus();
        const data = {
          invoiceNumber: r?.data?.regjistrimet?.nrFatures,
          date: currentDate,
          salesUsername:
            r?.data?.regjistrimet?.stafiID +
            " - " +
            r?.data?.regjistrimet?.username,
          items: [
            ...(r?.data?.totTVSH8?.map((item) => ({
              name: item.produkti?.emriProduktit || "Unknown Product",
              vatPercentage: 8,
              quantity: item.sasiaStokut || 1,
              price: item.qmimiShites.toFixed(2) || "0.00",
              total: (item.qmimiShites * item.sasiaStokut).toFixed(2) || "0.00",
            })) || []),
            ...(r?.data?.totTVSH18?.map((item) => ({
              name: item.produkti?.emriProduktit || "Unknown Product",
              vatPercentage: 18,
              quantity: item.sasiaStokut || 1,
              price: item.qmimiShites.toFixed(2) || "0.00",
              total: (item.qmimiShites * item.sasiaStokut).toFixed(2) || "0.00",
            })) || []),
          ],
          totalWithoutVAT: parseFloat(
            r?.data?.regjistrimet?.totaliPaTVSH
          ).toFixed(2),
          vat: parseFloat(r?.data?.regjistrimet?.tvsh).toFixed(2),
          rabati: parseFloat(r?.data?.rabati ?? 0).toFixed(2),
        };
        generateInvoice(data);
      });
  };

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      zIndex: 1050,
    }),
  };

  useEffect(() => {
    const tabelaDiv = document.querySelector(".tabelaDiv");
    if (tabelaDiv) {
      tabelaDiv.style.zoom = "80%";
    }
  }, []);

  async function VendosKartelenBleresit() {
    try {
      const kaKartele = await axios.get(
        `${API_BASE_URL}/api/Kartelat/shfaqKartelenSipasKodit?kodiKarteles=${kartelaBleresit}`,
        authentikimi
      );
      if (kaKartele != null) {
        setRabati2(kaKartele.data.rabati);
        setIDPartneri(kaKartele.data.partneriID);
        setTeDhenatKartelaBleresit(kaKartele.data);
        const r = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${idRegjistrimit}`,
          authentikimi
        );
        await axios.put(
          `${API_BASE_URL}/api/Faturat/perditesoFaturen?idKalulimit=${idRegjistrimit}`,
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
          authentikimi
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
            authentikimi
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
        authentikimi
      );
      if (kaKartele != null) {
        if (kaKartele.data.llojiKarteles == "Fshirje") {
          await axios.delete(
            `${API_BASE_URL}/api/Faturat/ruajKalkulimin/FshijTeDhenat?idTeDhenat=${fshijProdKalkID}`,
            authentikimi
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

  const [showNEEPM, setShowNEEPM] = useState(true);

  const handleCloseNEEPM = () => {
    setShowNEEPM(false);
  };

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Arkatar"]} />
      <Titulli titulli={"POS"} />
      <NavBar />
      <div className="containerDashboardP" style={{ width: "90%" }}>
        {showNEEPM && (
          <NukEshteEOptimizuarPerMobile
            title="Përdorni një Paisje tjeter!"
            message="Kjo faqe (POS) nuk është e optimizuar që të përdoret në pajisjet mobile. Ju lutemi, përdorni një kompjuter për të vazhduar."
            onClose={handleCloseNEEPM} // Call handleClose when modal is closed
          />
        )}

        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}
        {vendosKartelenBleresit && (
          <Modal
            show={vendosKartelenBleresit}
            onHide={() => setVendosKartelenBleresit(false)}>
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
                Anulo <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
              <Button variant="warning" onClick={VendosKartelenBleresit}>
                Vendos Kartelen <FontAwesomeIcon icon={faPlus} />
              </Button>
            </Modal.Footer>
          </Modal>
        )}
        {vendosKartelenFshirjeProduktit && (
          <Modal
            show={vendosKartelenFshirjeProduktit}
            onHide={() => setVendosKartelenFshirjeProduktit(false)}>
            <Modal.Header closeButton>
              <Modal.Title as="h6">Vendosni Kartelen</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Nr. Karteles</Form.Label>
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
                Anulo <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
              <Button
                variant="warning"
                onClick={VendosKartelenFshirjesProduktit}>
                Vendos Kartelen <FontAwesomeIcon icon={faPlus} />
              </Button>
            </Modal.Footer>
          </Modal>
        )}
        {loading ? (
          <div className="Loader">
            <TailSpin
              height="80"
              width="80"
              color="#009879"
              ariaLabel="tail-spin-loading"
              radius="1"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
            />
          </div>
        ) : (
          <>
            <h1 className="title">POS</h1>

            <Container fluid>
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Label>Nr. Fatures</Form.Label>
                    <Form.Control
                      id="nrFatures"
                      type="number"
                      placeholder={nrFatures}
                      value={nrFatures}
                      disabled
                    />
                  </Form.Group>
                  <Form.Group className="mt-1">
                    <Form.Label>Data</Form.Label>
                    <Form.Control
                      id="qmimiShites"
                      type="text"
                      value={currentDate}
                      disabled
                      className="mb-3"
                    />
                  </Form.Group>
                  <h5 className="mt-1">
                    <strong>Sasia ne Stok:</strong>{" "}
                    {parseFloat(sasiaAktualeNeStok).toFixed(4)} {njesiaMatese}
                  </h5>
                  <br />
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Lloji i Pageses</Form.Label>
                    <select
                      id="llojiIPageses"
                      placeholder="LlojiIPageses"
                      className="form-select"
                      value={llojiPageses ? llojiPageses : 0}
                      disabled={edito}
                      onChange={(e) => setLlojiPageses(e.target.value)}
                      onKeyDown={(e) => ndrroField(e, "statusiIPageses")}>
                      <option defaultValue value={0} key={0} disabled>
                        Zgjedhni Llojin e Pageses
                      </option>
                      <option key={1} value="Cash">
                        Cash
                      </option>
                      <option key={2} value="Banke">
                        Banke
                      </option>
                      {teDhenatKartelaBleresit != null && (
                        <option key={3} value="Borxh">
                          Borxh
                        </option>
                      )}
                    </select>
                  </Form.Group>
                  <Form.Group className="mt-1">
                    <Form.Label>Shuma Pageses</Form.Label>
                  </Form.Group>
                  <InputGroup className="mb-3">
                    <Form.Control
                      id="shumaPageses"
                      type="number"
                      placeholder={shumaPageses}
                      value={shumaPageses}
                      disabled={edito}
                      onChange={(e) => setShumaPageses(e.target.value)}
                      onKeyDown={handleMenaxhoTastetPagesa}
                    />
                    <InputGroup.Text>€</InputGroup.Text>
                  </InputGroup>
                  <h5 className="mt-1">
                    <strong>Kusuri:</strong>{" "}
                    {parseFloat(shumaPageses - qmimiTotal).toFixed(2)} €
                  </h5>
                  <br />
                </Col>
                <Col>
                  <h1 style={{ fontSize: "3.7em" }}>
                    {parseFloat(qmimiTotal).toFixed(2)} €
                  </h1>
                  {teDhenatKartelaBleresit != null && (
                    <>
                      <p style={{ fontSize: "1.8em" }}>
                        <strong>Klienti: </strong>
                        {teDhenatKartelaBleresit &&
                          teDhenatKartelaBleresit.partneri &&
                          teDhenatKartelaBleresit.partneri.emriBiznesit}
                      </p>
                      <p style={{ fontSize: "1.4em", marginTop: "-0.55em" }}>
                        <strong>Rabati: </strong>
                        {parseFloat(
                          teDhenatKartelaBleresit &&
                            teDhenatKartelaBleresit.rabati
                        ).toFixed(2)}{" "}
                        % -{" "}
                        {parseFloat(qmimiPaRabatBonus - qmimiTotal).toFixed(2)}{" "}
                        €
                      </p>
                      <p style={{ fontSize: "1.4em", marginTop: "-0.55em" }}>
                        <strong>Tot. Pa Rab.: </strong>
                        {parseFloat(qmimiPaRabatBonus).toFixed(2)} €
                      </p>
                    </>
                  )}
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group controlId="idDheEmri">
                    <Form.Label>Barkodi</Form.Label>
                    <Select
                      value={optionsBarkodiSelected}
                      onChange={handleChange}
                      options={optionsBarkodi}
                      id="barkodiSelect"
                      inputId="barkodiSelect-input"
                      isDisabled={edito}
                      onKeyDown={handleKaloTekPagesa}
                      styles={customStyles}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Sasia - {njesiaMatese}</Form.Label>
                    <Form.Control
                      id="sasia"
                      type="number"
                      placeholder={"0.00 " + njesiaMatese}
                      value={sasia}
                      onChange={(e) => kontrolloQmimin(e)}
                      onKeyDown={(e) => handleEdito(e)}
                      disabled={!edito}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Qmimi Shites €</Form.Label>
                    <Form.Control
                      id="qmimiShites"
                      type="number"
                      placeholder={"0.00 €"}
                      value={qmimiSH}
                      disabled
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Button
                    className="mt-4 Butoni"
                    onClick={() => navigate("/KthimiMallitTeShitur")}>
                    Kthimet <FontAwesomeIcon icon={faDolly} />
                  </Button>
                </Col>
              </Row>
              <h1 className="mt-2">Regjistrimi Pozicioneve te Paragonit</h1>

              <div
                className="tabelaDiv"
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                }}>
                <Table striped bordered hover>
                  <thead
                    style={{
                      position: "sticky",
                      top: "0",
                      backgroundColor: "#fff",
                      zIndex: 999,
                    }}>
                    <tr>
                      <th>Nr.</th>
                      <th>Barkodi</th>
                      <th>Emertimi</th>
                      <th>Njm</th>
                      <th>Sasia</th>
                      <th>Qmimi Shites</th>
                      <th>Shuma €</th>
                      <th>Funksione</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produktetNeKalkulim.slice().map((p, index) => {
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
                            (p.rabati3 / 100)
                      ).toFixed(3);
                      const ShumaToT = parseFloat(
                        qmimiMeTVSHRab * p.sasiaStokut
                      ).toFixed(3);
                      const originalIndex =
                        produktetNeKalkulim.length - 1 - index;
                      return (
                        p && (
                          <tr key={originalIndex}>
                            <td>{originalIndex + 1}</td>
                            <td>{p.barkodi}</td>
                            <td>{p.emriProduktit}</td>
                            <td>{p.emriNjesiaMatese}</td>
                            <td>{p.sasiaStokut}</td>
                            <td>{parseFloat(qmimiMeTVSHRab).toFixed(2)} €</td>
                            <td>{parseFloat(ShumaToT).toFixed(2)} €</td>
                            <td>
                              <div style={{ display: "flex", gap: "0.3em" }}>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  disabled={edito}
                                  onClick={() => {
                                    setVendosKartelenFshirjeProduktit(true);
                                    setFshijProduktKalkID(p.id);
                                  }}>
                                  <FontAwesomeIcon icon={faXmark} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="warning"
                                  disabled={edito}
                                  onClick={() => {
                                    setOptionsBarkodiSelected(p.idProduktit);
                                    handleEdit(p.id, index);
                                  }}>
                                  <FontAwesomeIcon icon={faPenToSquare} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      );
                    })}
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              </div>
              <footer
                style={{
                  position: "fixed",
                  width: "100%",
                  bottom: 0,
                  backgroundColor: "#fff",
                  zIndex: 1000,
                  fontWeight: "bold",
                  fontSize: "0.8em",
                }}>
                <p>
                  Me ESC kalohet tek Pagesa. F1 Editohet produkti i fundit. F4
                  Bonus Kartela. F5 Mbyllet Fatura.
                </p>
              </footer>
            </Container>
          </>
        )}
      </div>
    </>
  );
}

export default POS;
