import { useEffect, useMemo, useState, useRef } from "react";
﻿import "../../../../Pages/Styles/DizajniPergjithshem.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faArrowLeft,
  faCalculator,
} from "@fortawesome/free-solid-svg-icons";
import { TailSpin } from "react-loader-spinner";
import {
  Form,
  Container,
  Row,
  Col,
  Modal,
  Card,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { Camera } from "lucide-react";
import BarcodeScannerModal from "../../../TeTjera/BarcodeScannerModal";
import Tabela from "../../../TeTjera/Tabela/Tabela";
import PrintLabels from "../../../TeTjera/PrintLabels";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";
import { darkSelectStyles } from "@/utils/darkSelectStyles";

function RegjistroFaturen(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [perditeso, setPerditeso] = useState("");
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingKartela, setIsLoadingKartela] = useState(false);
  const [produktetNeKalkulim, setproduktetNeKalkulim] = useState([]);
  const [emriProduktit, setEmriProduktit] = useState("");
  const [produktiID, setproduktiID] = useState(0);
  const [produktet, setProduktet] = useState([]);
  const [sasia, setSasia] = useState("");
  const [qmimiBleres, setQmimiBleres] = useState("");
  const [qmimiShites, setQmimiShites] = useState("");
  const [qmimiShitesMeShumic, setQmimiShitesMeShumic] = useState("");
  const [njesiaMatese, setNjesiaMatese] = useState("Cope");
  const [sasiaNeStok, setSasiaNeStok] = useState(0);
  const [qmimiB, setQmimiB] = useState(0);
  const [qmimiSH, setQmimiSH] = useState(0);
  const [llojiTVSH, setLlojiTVSH] = useState(0);
  const [qmimiSH2, setQmimiSH2] = useState(0);
  const [idTeDhenatKalk, setIdTeDhenatKalk] = useState(0);
  const [edito, setEdito] = useState(false);
  const [konfirmoMbylljenFatures, setKonfirmoMbylljenFatures] = useState(false);
  const [konfirmoProduktin, setKonfirmoProduktin] = useState(false);
  const [teDhenat, setTeDhenat] = useState([]);
  const [teDhenatFatures, setTeDhenatFatures] = useState([]);
  const [siteName, setSiteName] = useState("FinanCare");
  const [produktetQmimore, setProduktetQmimore] = useState([]);
  const [kartelaMenaxherit, setKartelaMenaxherit] = useState("");
  const [vendosKartelenMenaxherit, setVendosKartelenMenaxherit] =
    useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [numriPerditesimeve, setNumriPerditesimeve] = useState("");
  const navigate = useNavigate();
  const getID = localStorage.getItem("id");
  const getToken = localStorage.getItem("token");
    const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

  useEffect(() => {
    if (getID) {
      const vendosTeDhenat = async () => {
        try {
          setLoading(true);
          const perdoruesi = await axios.get(
            `${API_BASE_URL}/api/Perdoruesi/shfaqSipasID?idUserAspNet=${getID}`,
            authentikimi
          );
          setTeDhenat(perdoruesi.data);
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
    if (props.idKalkulimitEdit != 0) {
      const vendosTeDhenat = async () => {
        try {
          setLoading(true);
          const teDhenatKalkulimit = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${props.idKalkulimitEdit}`,
            authentikimi
          );
          console.log(teDhenatKalkulimit.data);
          const teDhenatFatures = await axios.get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.idKalkulimitEdit}`,
            authentikimi
          );
          setproduktetNeKalkulim(
            teDhenatKalkulimit.data.map((k, index) => ({
              ID: k.id,
              "Nr. Rendor": index + 1,
              Barkodi: k.barkodi,
              "Emri Produktit": k.emriProduktit,
              "Numri Perditesimeve": parseInt(k.rabati2),
              "Sasia Aktuale ne Stok": parseFloat(k.sasiaAktualeNeStok).toFixed(
                2
              ),
              "Sasia ne Kalkulim": parseFloat(k.sasiaStokut).toFixed(2),
              "Diferenca Stokut": (
                parseFloat(k.sasiaStokut) - parseFloat(k.sasiaAktualeNeStok)
              ).toFixed(2),
              "Qmimi Bleres + TVSH €": parseFloat(k.qmimiBleres).toFixed(2),
              "Qmimi Shites me Pakic + TVSH €": parseFloat(
                k.qmimiShites
              ).toFixed(2),
              "Qmimi Shites me Shumic + TVSH €": parseFloat(
                k.qmimiShitesMeShumic
              ).toFixed(2),
              "Totali Bleres €": parseFloat(
                k.sasiaStokut * k.qmimiBleres
              ).toFixed(2),
              "Totali Shites €": parseFloat(
                k.sasiaStokut * k.qmimiShites
              ).toFixed(2),
            }))
          );
          setProduktetQmimore(
            teDhenatKalkulimit.data.map((k) => ({
              name: k.emriProduktit,
              price: k.qmimiShites,
              wholesalePrice: k.qmimiShitesMeShumic,
              barcode: k.barkodi,
            }))
          );
          setTeDhenatFatures(teDhenatFatures.data);
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      };
      vendosTeDhenat();
    }
  }, [perditeso, produktiID]);

  useEffect(() => {
    const vendosProduktet = async () => {
      try {
        const produktet = await axios.get(
          `${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`,
          authentikimi
        );
        setProduktet(produktet.data);
      } catch (err) {
        console.log(err);
      }
    };
    vendosProduktet();
  }, [perditeso]);

  useEffect(() => {
    const perditesoFaturen = async () => {
      try {
        await axios
          .get(
            `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.idKalkulimitEdit}`,
            authentikimi
          )
          .then(async (r) => {
            console.log(r.data);
            await axios.put(
              `${API_BASE_URL}/api/Faturat/perditesoFaturen?idKalulimit=${props.nrRendorKalkulimit}`,
              {
                dataRegjistrimit: r.data.regjistrimet.dataRegjistrimit,
                stafiID: r.data.regjistrimet.stafiID,
                totaliPaTVSH: parseFloat(r.data.totaliPaTVSH),
                tvsh: parseFloat(r.data.totaliMeTVSH - r.data.totaliPaTVSH),
                idPartneri: r.data.regjistrimet.idPartneri,
                statusiPageses: r.data.regjistrimet.statusiPageses,
                llojiPageses: r.data.regjistrimet.llojiPageses,
                llojiKalkulimit: r.data.regjistrimet.llojiKalkulimit,
                nrFatures: r.data.regjistrimet.nrFatures,
                statusiKalkulimit: r.data.regjistrimet.statusiKalkulimit,
                pershkrimShtese:
                  "Tot - TVSH: " +
                  parseFloat(r.data.totaliPaTVSH).toFixed(2) +
                  "€, TVSH: " +
                  parseFloat(r.data.totaliMeTVSH - r.data.totaliPaTVSH).toFixed(2) +
                  "€, Tot Fat: " +
                  parseFloat(r.data.totaliMeTVSH).toFixed(2) +
                  "€",
                rabati: r.data.regjistrimet.rabati,
                nrRendorFatures: r.data.regjistrimet.nrRendorFatures,
                idBonusKartela: r.data.regjistrimet.idBonusKartela,
              },
              authentikimi
            );
          });
      } catch (err) {
        console.log(err);
      }
    };
    perditesoFaturen();
  }, [perditeso]);

  const handleSubmit = async (event) => {
    if (sasia <= 0) {
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      const existingProduct = produktetNeKalkulim.find(
        (product) => product["Barkodi"] === optionsSelected?.item?.barkodi
      );
      if (existingProduct) {
        const sasiaNeKalkulim =
          parseFloat(existingProduct["Sasia ne Kalkulim"]) || 0;
        const sasiaNumerike = parseFloat(sasia) || 0;
        const sasiaStokut = parseFloat(
          (sasiaNeKalkulim + sasiaNumerike).toFixed(2)
        );
        await axios
          .put(
            `${API_BASE_URL}/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${existingProduct.ID}`,
            {
              sasiaStokut,
              QmimiBleres: existingProduct["Qmimi Bleres + TVSH €"],
              QmimiShites: existingProduct["Qmimi Shites me Pakic + TVSH €"],
              rabati2: existingProduct["Numri Perditesimeve"] + 1,
              QmimiShitesMeShumic:
                existingProduct["Qmimi Shites me Shumic + TVSH €"],
            },
            authentikimi
          )
          .then(() => {
            setPerditeso(Date.now());
          });
      } else {
        await axios
          .post(
            `${API_BASE_URL}/api/Faturat/ruajKalkulimin/teDhenat`,
            {
              idRegjistrimit: props.nrRendorKalkulimit,
              idProduktit: optionsSelected?.value,
              sasiaStokut: sasia,
              qmimiBleres: optionsSelected?.item.qmimiBleres,
              qmimiShites: optionsSelected?.item.qmimiProduktit,
              qmimiShitesMeShumic: optionsSelected?.item.qmimiMeShumic,
              rabati1: optionsSelected?.item.sasiaNeStok,
            },
            authentikimi
          )
          .then(() => {
            setPerditeso(Date.now());
          });
      }
      setproduktiID(0);
      setQmimiBleres("");
      setSasia("");
      setQmimiShites("");
      setQmimiShitesMeShumic("");
      setSasiaNeStok(0);
      setQmimiB(0);
      setQmimiSH(0);
      setQmimiSH2(0);
      setPerditeso(Date.now());
      document.getElementById("produktiSelect-input").focus();
    }
  };

  const ndrroField = (e, tjetra) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const el = document.getElementById(tjetra);
      if (el) { el.focus(); setTimeout(() => el.select(), 0); }
    }
  };

  async function handleMbyllFature() {
    setPendingAction("closeInvoice");
    setVendosKartelenMenaxherit(true);
  }

  async function VendosKartelenMenaxherit() {
    setIsLoadingKartela(true);
    try {
      const kaKartele = await axios.get(
        `${API_BASE_URL}/api/Kartelat/shfaqKartelenSipasKodit?kodiKarteles=${kartelaMenaxherit}`,
        authentikimi
      );
      if (kaKartele.data && kaKartele.data.llojiKarteles === "Fshirje") {
        if (pendingAction === "delete") {
          await axios.delete(
            `${API_BASE_URL}/api/Faturat/ruajKalkulimin/FshijTeDhenat?idTeDhenat=${pendingId}`,
            authentikimi
          );
        } else if (pendingAction === "edit") {
          await axios
            .get(
              `${API_BASE_URL}/api/Faturat/ruajKalkulimin/getKalkulimi?idKalkulimit=${pendingId}`,
              authentikimi
            )
            .then((p) => {
              console.log(p.data[0]);
              setPerditeso(Date.now());
              setEdito(true);
              setproduktiID(p.data[0].idProduktit);
              setEmriProduktit(p.data[0].emriProduktit);
              setSasia(p.data[0].sasiaStokut);
              setSasiaNeStok(p.data[0].sasiaNeStok);
              setQmimiBleres(p.data[0].qmimiBleres);
              setQmimiShites(p.data[0].qmimiShites);
              setQmimiShitesMeShumic(p.data[0].qmimiShitesMeShumic);
              setNumriPerditesimeve(p.data[0].rabati2);
              let produkti = options.filter(
                (e) => e.value == p.data[0].idProduktit
              );
              handleChange(produkti[0]);
              setTimeout(() => { document.getElementById("sasia")?.select(); }, 150);
            });
        } else if (pendingAction === "closeInvoice") {
          try {
            if (produktetNeKalkulim.length === 0) {
              props.setPerditeso();
              props.mbyllPerkohesisht();
            } else {
              const response = await axios.get(
                `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaID?id=${props.idKalkulimitEdit}`,
                authentikimi
              );
              const dataRegjistrimit =
                response.data.regjistrimet.dataRegjistrimit;
              console.log("dataRegjistrimit:", dataRegjistrimit);
              const year = new Date(dataRegjistrimit).getFullYear();
              const previousYear = year - 1;

              // Step 1: Calculate saldo for each partner using the current database
              const partneretResponse = await axios.get(
                `${API_BASE_URL}/api/Partneri/shfaqPartneret`,
                authentikimi
              );
              const partneret = partneretResponse.data;
              console.log(`Retrieved ${partneret.length} partners`);
              const saldot = [];
              for (const partneri of partneret) {
                try {
                  console.log(
                    `Processing partner ${partneri.emriBiznesit} (ID: ${partneri.idPartneri})`
                  );
                  const kartelaResponse = await axios.get(
                    `${API_BASE_URL}/api/Partneri/KartelaFinanciare?id=${partneri.idPartneri}`,
                    authentikimi
                  );
                  const kalkulimet = kartelaResponse.data.kalkulimet || [];
                  console.log(
                    `Retrieved ${kalkulimet.length} transactions for partner ${partneri.emriBiznesit}`
                  );
                  let saldo = 0;
                  kalkulimet.forEach((p, index) => {
                    const totaliPaTVSH = parseFloat(p.totaliPaTVSH) || 0;
                    const tvsh = parseFloat(p.tvsh) || 0;
                    const rabati = parseFloat(p.rabati) || 0;
                    const vlera = totaliPaTVSH + tvsh - rabati;
                    console.log(
                      `Transaction ${index + 1}: llojiKalkulimit=${p.llojiKalkulimit
                      }, ` +
                      `totaliPaTVSH=${totaliPaTVSH.toFixed(
                        2
                      )}, tvsh=${tvsh.toFixed(2)}, ` +
                      `rabati=${rabati.toFixed(2)}, vlera=${vlera.toFixed(2)}`
                    );
                    if (
                      ["HYRJE", "FAT", "AS", "PARAGON"].includes(
                        p.llojiKalkulimit
                      )
                    ) {
                      saldo += vlera;
                    } else if (
                      ["FL", "KMSH", "KMB", "PAGES"].includes(p.llojiKalkulimit)
                    ) {
                      vlera < 0 ? (saldo += vlera) : (saldo -= vlera);
                    }
                  });
                  console.log(
                    `Calculated saldo for ${partneri.emriBiznesit
                    }: ${saldo.toFixed(2)}€`
                  );
                  if (saldo !== 0) {
                    saldot.push({
                      idPartneri: partneri.idPartneri,
                      emriBiznesit: partneri.emriBiznesit,
                      saldo: saldo,
                    });
                  } else {
                    console.log(
                      `No SALDO invoice needed for ${partneri.emriBiznesit} (saldo is 0)`
                    );
                  }
                } catch (error) {
                  console.error(
                    `Error calculating saldo for partner ${partneri.emriBiznesit} (ID: ${partneri.idPartneri}):`,
                    error
                  );
                  if (error.response) {
                    console.error("Error response:", error.response.data);
                    console.error("Error status:", error.response.status);
                  }
                  setTipiMesazhit("danger");
                  setPershkrimiMesazhit(
                    `Ndodhi një gabim gjatë llogaritjes së saldove për partnerin ${partneri.emriBiznesit}: ${error.message}`
                  );
                  setShfaqMesazhin(true);
                }
              }

              // Step 2: Create the new database
              const newDatabaseName = `FinanCareDB${previousYear}`;
              const sourceDatabaseName = "FinanCareDB";
              console.log("Creating new database:", newDatabaseName);
              await axios.post(
                `${API_BASE_URL}/api/Database?newDatabaseName=${newDatabaseName}&sourceDatabaseName=${sourceDatabaseName}`,
                null,
                authentikimi
              );

              // Step 3: Create SALDO invoices in the new database
              for (const { idPartneri, emriBiznesit, saldo } of saldot) {
                try {
                  console.log(
                    `Creating SALDO invoice for ${emriBiznesit} in new database ${newDatabaseName}`
                  );
                  const invoiceData = {
                    dataRegjistrimit: new Date().toISOString(),
                    stafiID: teDhenat.perdoruesi.userID,
                    totaliPaTVSH: parseFloat(Math.abs(saldo)).toFixed(3),
                    tvsh: 0,
                    idPartneri: idPartneri,
                    statusiPageses: "Pa Paguar",
                    llojiPageses: "Borxh",
                    llojiKalkulimit: "SALDO",
                    nrFatures: `SALDO-${idPartneri}-${year}`,
                    statusiKalkulimit: "true",
                    pershkrimShtese: `Saldo për partnerin ${emriBiznesit}: ${saldo.toFixed(
                      2
                    )}€`,
                    rabati: 0,
                    nrRendorFatures: idPartneri,
                    idBonusKartela: null,
                  };
                  console.log(
                    "Invoice data:",
                    JSON.stringify(invoiceData, null, 2)
                  );
                  const response = await axios.post(
                    `${API_BASE_URL}/api/Faturat/ruajKalkulimin`,
                    invoiceData,
                    authentikimi
                  );
                  console.log(
                    `SALDO invoice created for ${emriBiznesit} in ${newDatabaseName}:`,
                    response.data
                  );
                } catch (error) {
                  console.error(
                    `Error creating SALDO invoice for ${emriBiznesit} (ID: ${idPartneri}) in ${newDatabaseName}:`,
                    error
                  );
                  if (error.response) {
                    console.error("Error response:", error.response.data);
                    console.error("Error status:", error.response.status);
                  }
                  setTipiMesazhit("danger");
                  setPershkrimiMesazhit(
                    `Ndodhi një gabim gjatë krijimit të faturës SALDO për partnerin ${emriBiznesit} në databazën e re: ${error.message}`
                  );
                  setShfaqMesazhin(true);
                }
              }

              // Step 4: Update product stock and prices
              for (let produkti of produktetNeKalkulim) {
                console.log(produkti);
                var prod = produktet.find(
                  (item) => item.emriProduktit == produkti["Emri Produktit"]
                );
                console.log(produktet);
                await axios.put(
                  `${API_BASE_URL}/api/Faturat/ruajKalkulimin/kalkulimifillestarvjetor/perditesoStokunQmimin?id=${prod?.produktiID}`,
                  {
                    qmimiBleres: produkti["Qmimi Bleres + TVSH €"],
                    qmimiProduktit: produkti["Qmimi Shites me Pakic + TVSH €"],
                    sasiaNeStok: produkti["Sasia ne Kalkulim"],
                    qmimiMeShumic: produkti["Qmimi Shites me Shumic + TVSH €"],
                    databaseName: newDatabaseName, // Optionally pass new database name if required
                  },
                  authentikimi
                );
              }
              for (let produkti of produktet) {
                const ekzistonNeKalkulim = produktetNeKalkulim.some(
                  (p) => p["Emri Produktit"] === produkti.emriProduktit
                );
                if (!ekzistonNeKalkulim) {
                  await axios.put(
                    `${API_BASE_URL}/api/Faturat/ruajKalkulimin/kalkulimifillestarvjetor/perditesoStokunQmimin?id=${produkti.produktiID}`,
                    {
                      qmimiBleres: 0,
                      qmimiProduktit: 0,
                      sasiaNeStok: 0,
                      qmimiMeShumic: 0,
                      databaseName: newDatabaseName, // Optionally pass new database name if required
                    },
                    authentikimi
                  );
                }
              }

              props.setPerditeso();
              props.mbyllKalkulimin();
            }
          } catch (error) {
            console.error("Error closing invoice:", error);
            setTipiMesazhit("danger");
            setPershkrimiMesazhit(
              "Ndodhi një gabim gjatë mbylljes së kalkulimit!"
            );
            setShfaqMesazhin(true);
          }
        }
        setVendosKartelenMenaxherit(false);
        setKartelaMenaxherit("");
        setPerditeso(Date.now());
      } else {
        setTipiMesazhit("danger");
        setPershkrimiMesazhit("Kartela nuk është valide për këtë funksion!");
        setShfaqMesazhin(true);
      }
    } catch (error) {
      console.error("Error in VendosKartelenMenaxherit:", error);
      setTipiMesazhit("danger");
      setPershkrimiMesazhit("Kartela nuk ekziston!");
      setShfaqMesazhin(true);
    } finally {
      setIsLoadingKartela(false);
    }
  }

  async function handleFshij(id) {
    setPendingAction("delete");
    setPendingId(id);
    setVendosKartelenMenaxherit(true);
  }

  async function handleEdit(id) {
    setPendingAction("edit");
    setPendingId(id);
    setVendosKartelenMenaxherit(true);
  }

  async function handleEdito(id) {
    if (sasia <= 0 || qmimiShites <= 0 || qmimiBleres <= 0) {
      setPershkrimiMesazhit("Ju lutem plotesoni te gjitha te dhenat!");
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
    } else {
      await axios
        .put(
          `${API_BASE_URL}/api/Faturat/ruajKalkulimin/PerditesoTeDhenat?id=${id}`,
          {
            qmimiBleres: qmimiBleres,
            qmimiShites: qmimiShites,
            sasiaStokut: sasia,
            qmimiShitesMeShumic: qmimiShitesMeShumic,
            rabati1: sasiaNeStok,
            rabati2: numriPerditesimeve + 1,
          },
          authentikimi
        )
        .then(() => {
          setPerditeso(Date.now());
          setproduktiID(0);
          setQmimiBleres("");
          setSasia("");
          setQmimiShites("");
          setQmimiShitesMeShumic("");
          setSasiaNeStok(0);
          setQmimiB(0);
          setQmimiSH(0);
          setQmimiSH2(0);
          setNumriPerditesimeve("");
          setOptionsSelected(null);
      setEdito(false);
        });
    }
  }

  function KthehuTekFaturat() {
    props.setPerditeso();
    props.mbyllPerkohesisht();
  }

  const [options, setOptions] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleScanResult = (scannedCode) => {
    setShowScanner(false);
    setInputValue(scannedCode);
    setTimeout(() => {
       const selectElement = document.getElementById("produktiSelect-input");
       if (selectElement) {
         selectElement.focus();
         const match = options.find(opt => opt.label && opt.label.includes(scannedCode));
         if (match) {
            handleChange(match);
         }
       }
    }, 400);
  };


  const [loadingProdukteve, setLoadingProdukteve] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (val, { action }) => {
    if (action === "input-change") {
      setInputValue(val);
    } else if (action === "set-value" || action === "menu-close") {
      setInputValue("");
    }
  };

  const filteredOptions = useMemo(() => {
    if (inputValue.length < 2) return [];
    const lower = inputValue.toLowerCase();
    return options
      .filter((o) => o.label.toLowerCase().includes(lower))
      .slice(0, 30);
  }, [inputValue, options]);
    useEffect(() => {
    setLoadingProdukteve(true);
    axios
      .get(`${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`, authentikimi)
      .then((response) => {
        const fetchedoptions = response.data.map((item) => ({
          value: item.produktiID,
          label:
            item.emriProduktit +
            " - " +
            item.barkodi +
            " - " +
            item.kodiProduktit,
          item: item,
        }));
        setOptions(fetchedoptions);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoadingProdukteve(false);
      });
  }, []);

  const selectRef = useRef(null);

  const handleKaloTekSasia = (event) => {
    if (event.key === "Enter") {
      const currentInput = document.getElementById("produktiSelect-input")?.value || "";
      if (filteredOptions.length === 0 && currentInput.trim().length > 0) {
        setTipiMesazhit("danger");
        setPershkrimiMesazhit(`Produkti me këtë barkod nuk u gjet! (${currentInput})`);
        setShfaqMesazhin(true);
        setInputValue(""); 
        setTimeout(() => selectRef.current?.focus(), 10);
      } else if (filteredOptions.length > 0) {
        event.preventDefault();
        handleChange(filteredOptions[0]);
      }
    }
  };

  const handleChange = async (partneri) => {
    if (partneri.item.qmimiProduktit <= 0) {
      setPershkrimiMesazhit(
        "<strong><h5>Ju lutem qe te se pari te caktoni qmimin e produktit! </h5><br>Produkti eshte me qmim <i>0.00€!</i> Si i tille nuk mund te futet ne kalkulim. </strong>"
      );
      setTipiMesazhit("danger");
      setShfaqMesazhin(true);
      document.getElementById("produktiSelect").focus();
    } else {
      setOptionsSelected(partneri);
      document.getElementById("sasia").focus();
      console.log(partneri);
    }
  };

  useEffect(() => {
    const vendosTeDhenatBiznesit = async () => {
      try {
        const teDhenat = await axios.get(
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqTeDhenat`,
          authentikimi
        );
        setSiteName(teDhenat?.data?.emriIBiznesit);
      } catch (err) {
        console.log(err);
      }
    };
    vendosTeDhenatBiznesit();
  }, [perditeso]);

  const handleMenaxhoTastetPagesa = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!edito) {
        handleSubmit();
      } else {
        handleEdito(idTeDhenatKalk);
      }
    }
  };

  const totaliPaTVSH = teDhenatFatures.regjistrimet && teDhenatFatures.regjistrimet.totaliPaTVSH;
  const tvsh = teDhenatFatures.regjistrimet && teDhenatFatures.regjistrimet.tvsh;
  const totaliFatures = teDhenatFatures.regjistrimet && (teDhenatFatures.regjistrimet.totaliPaTVSH + teDhenatFatures.regjistrimet.tvsh);

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant", "1 Euro Menaxher"]}
        largo={() => props.largo()}
        shfaqmesazhin={() => props.shfaqmesazhin()}
        perditesoTeDhenat={() => props.perditesoTeDhenat()}
        setTipiMesazhit={(e) => props.setTipiMesazhit(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit(e)}
      />
      <div className="containerDashboardP">
        <Modal
          show={vendosKartelenMenaxherit}
          onHide={() =>
            !isLoadingKartela && setVendosKartelenMenaxherit(false)
          }>
          <Modal.Header closeButton={!isLoadingKartela}>
            <Modal.Title>Vendosni Kartelen</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {isLoadingKartela ? (
              <div className="text-center">
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
                <p>Duke u procesuar te dhenat... Ju lutem Prisni.</p>
              </div>
            ) : (
              <input
                type="text"
                className="form-control"
                placeholder="Nr. Karteles se Menaxherit per Fshirje/Editim!"
                value={kartelaMenaxherit}
                onChange={(e) => setKartelaMenaxherit(e.target.value)}
                disabled={isLoadingKartela}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setVendosKartelenMenaxherit(false)}
              disabled={isLoadingKartela}>
              Anulo
            </Button>
            <Button
              variant="primary"
              onClick={VendosKartelenMenaxherit}
              disabled={isLoadingKartela}>
              Konfirmo
            </Button>
          </Modal.Footer>
        </Modal>
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}
        {konfirmoMbylljenFatures && (
          <Modal
            show={konfirmoMbylljenFatures}
            onHide={() => setKonfirmoMbylljenFatures(false)}>
            <Modal.Header closeButton>
              <Modal.Title as="h6">Konfirmo Mbylljen e Fatures</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <strong style={{ fontSize: "15pt" }}>
                A jeni te sigurt qe deshironi ta mbyllni Faturen?
                <br />
                <br />
                Perditesimi i kesaj fature nuk do te jete me i mundur!!!!
              </strong>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setKonfirmoMbylljenFatures(false)}>
                Edito Faturen <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
              <Button variant="warning" onClick={handleMbyllFature}>
                Konfirmo <FontAwesomeIcon icon={faPlus} />
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
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <div>
                <h1 className="title mb-1">Kalkulimi Fillestar Vjetor</h1>
                <div className="text-muted" style={{ fontSize: "10pt" }}>
                  Shtoni produktet dhe mbyllni faturën kur të jeni gati.
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <PrintLabels storeName={siteName} products={produktetQmimore} />
                <Button
                  variant="outline-secondary"
                  onClick={() => KthehuTekFaturat()}>
                  <FontAwesomeIcon icon={faArrowLeft} /> Kthehu mbrapa
                </Button>
              </div>
            </div>

            <Container fluid>
              <Row className="g-3">
                <Col lg={5} xl={4}>
                  <Card className="shadow-sm">
                    <Card.Header className="d-flex align-items-center justify-content-between">
                      <div className="fw-semibold">Shto / Edito Produkt</div>
                      {edito ? (
                        <Badge bg="warning" text="dark">
                          Editim
                        </Badge>
                      ) : (
                        <Badge bg="success">Shtim</Badge>
                      )}
                    </Card.Header>
                    <Card.Body>
                      <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="idDheEmri" className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <Form.Label className="fw-semibold mb-0">
                              Produkti
                            </Form.Label>
                            <button 
                              type="button"
                              onClick={() => setShowScanner(true)}
                              style={{ color: '#10b981', padding: '0', background: 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Camera size={14} /> Skano
                            </button>
                          </div>
                          <Select
                            ref={selectRef}
                            onKeyDown={handleKaloTekSasia}
                            value={optionsSelected}
                            onChange={handleChange}
                            options={filteredOptions}
                            id="produktiSelect"
                            inputId="produktiSelect-input"
                            isDisabled={edito || isLoadingKartela || loadingProdukteve}
                            isLoading={loadingProdukteve}
                            styles={darkSelectStyles}
                            placeholder={
                              loadingProdukteve
                                ? "Duke ngarkuar produktet..."
                                : "Kërko produkt (min. 2 shkronja)..."
                            }
                            onInputChange={handleInputChange}
                            inputValue={inputValue}
                            noOptionsMessage={() =>
                              loadingProdukteve
                                ? "Duke ngarkuar..."
                                : inputValue.length < 2
                                  ? "Shkruani të paktën 2 karaktere"
                                  : "Nuk u gjet asnjë produkt"
                            }
                          />
                        </Form.Group>

                        <Form.Group className="mb-2">
                          <Form.Label className="fw-semibold">
                            Sasia - {njesiaMatese}
                          </Form.Label>
                          <InputGroup>
                            <Form.Control
                              id="sasia"
                              type="number"
                              placeholder={"0.00 " + njesiaMatese}
                              value={sasia}
                              onChange={(e) => setSasia(e.target.value)}
                              onKeyDown={handleMenaxhoTastetPagesa}
                              disabled={isLoadingKartela}
                            />
                            <InputGroup.Text>{njesiaMatese}</InputGroup.Text>
                          </InputGroup>
                        </Form.Group>

                        {edito && (
                          <div className="text-danger fw-bold mb-2" style={{ fontSize: "9pt" }}>
                            KUJDES: Ndryshimi aplikohet për të gjithë sasinë në kalkulim
                          </div>
                        )}

                        <div className="d-flex gap-2 flex-wrap mt-3">
                          <Button
                            variant="success"
                            type="submit"
                            disabled={edito || isLoadingKartela}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSubmit();
                            }}>
                            Shto Produktin <FontAwesomeIcon icon={faPlus} />
                          </Button>
                          {edito && (
                            <Button
                              variant="warning"
                              onClick={() => handleEdito(idTeDhenatKalk)}
                              disabled={isLoadingKartela}>
                              Edito Produktin{" "}
                              <FontAwesomeIcon icon={faPenToSquare} />
                            </Button>
                          )}
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={7} xl={4}>
                  <Card className="shadow-sm h-100">
                    <Card.Header className="fw-semibold">
                      Produkti i zgjedhur
                    </Card.Header>
                    <Card.Body>
                      {!optionsSelected?.item ? (
                        <div className="text-muted">
                          Zgjidh një produkt për të parë detajet.
                        </div>
                      ) : (
                        <>
                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                            <div className="fw-semibold">
                              {optionsSelected.item.emriProduktit}
                            </div>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              {optionsSelected?.item?.kodiProduktit ? (
                                <Badge bg="info" text="dark">
                                  {optionsSelected.item.kodiProduktit}
                                </Badge>
                              ) : null}
                              <Badge bg="secondary">
                                {optionsSelected.item.barkodi}
                              </Badge>
                            </div>
                          </div>
                          <Row className="g-2">
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div className="text-muted" style={{ fontSize: "9pt" }}>
                                    Sasia aktuale në stok
                                  </div>
                                  <div className="fw-semibold">
                                    {optionsSelected?.item?.sasiaNeStok ?? 0}{" "}
                                    {optionsSelected?.item?.emriNjesiaMatese ?? "Copë"}
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div className="text-muted" style={{ fontSize: "9pt" }}>
                                    Blerje + TVSH
                                  </div>
                                  <div className="fw-semibold">
                                    {parseFloat(optionsSelected?.item?.qmimiBleres ?? 0).toFixed(2)} €
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div className="text-muted" style={{ fontSize: "9pt" }}>
                                    Pakic + TVSH
                                  </div>
                                  <div className="fw-semibold">
                                    {parseFloat(optionsSelected?.item?.qmimiProduktit ?? 0).toFixed(2)} €
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col sm={6}>
                              <Card className="border-0 bg-light">
                                <Card.Body className="py-2">
                                  <div className="text-muted" style={{ fontSize: "9pt" }}>
                                    Shumic + TVSH
                                  </div>
                                  <div className="fw-semibold">
                                    {parseFloat(optionsSelected?.item?.qmimiMeShumic ?? 0).toFixed(2)} €
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                          </Row>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                <Col xl={4}>
                  <Card className="shadow-sm h-100" style={{ position: "sticky", top: "1rem" }}>
                    <Card.Header className="fw-semibold">
                      Përmbledhje fature
                    </Card.Header>
                    <Card.Body>
                      <Row className="g-2">
                        <Col sm={6}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Nr. Kalkulimit
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures.regjistrimet?.idRegjistrimit ?? "-"}
                          </div>
                        </Col>
                        <Col sm={6}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Nr. Fat
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures.regjistrimet?.nrFatures ?? "-"}
                          </div>
                        </Col>
                        <Col sm={12}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Partneri
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures.regjistrimet?.emriBiznesit ?? "-"}
                          </div>
                        </Col>
                      </Row>

                      <hr />

                      <Row className="g-2">
                        <Col sm={4}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Pa TVSH
                          </div>
                          <div className="fw-semibold">
                            {parseFloat(totaliPaTVSH || 0).toFixed(2)} €
                          </div>
                        </Col>
                        <Col sm={4}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            TVSH
                          </div>
                          <div className="fw-semibold">
                            {parseFloat(tvsh || 0).toFixed(2)} €
                          </div>
                        </Col>
                        <Col sm={4}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Totali
                          </div>
                          <div className="fw-bold">
                            {parseFloat(totaliFatures || 0).toFixed(2)} €
                          </div>
                        </Col>
                        <Col sm={12}>
                          <div className="text-muted" style={{ fontSize: "9pt" }}>
                            Përshkrim
                          </div>
                          <div className="fw-semibold">
                            {teDhenatFatures.regjistrimet?.pershkrimShtese ?? "-"}
                          </div>
                        </Col>
                      </Row>

                      <div className="d-grid gap-2 mt-3">
                        <Button
                          variant="primary"
                          onClick={() => setKonfirmoMbylljenFatures(true)}
                          disabled={isLoadingKartela}>
                          Mbyll Faturen <FontAwesomeIcon icon={faPlus} />
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="shadow-sm mt-3">
                <Card.Header className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div className="fw-semibold">Tabela e Produkteve te Fatures</div>
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg="dark">
                      {produktetNeKalkulim.length} rreshta
                    </Badge>
                    <Badge bg="success">
                      Totali: {parseFloat(totaliFatures || 0).toFixed(2)} €
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Tabela
                    data={produktetNeKalkulim}
                    tableName="Tabela e Produkteve te Fatures"
                    kaButona={true}
                    funksionButonFshij={(e) => handleFshij(e)}
                    funksionButonEdit={(e) => {
                      handleEdit(e);
                      setIdTeDhenatKalk(e);
                    }}
                    mosShfaqKerkimin
                    mosShfaqID={true}
                      mosShfaqTitullin={true}
                      mosShfaqPaginimin={true}
                    shfaqEksporto
                  />
                </Card.Body>
              </Card>
            </Container>
          </>
        )}
        <BarcodeScannerModal 
        show={showScanner} 
        onHide={() => setShowScanner(false)} 
        onScan={handleScanResult} 
      />
      </div>
    </>
  );
}

export default RegjistroFaturen;
