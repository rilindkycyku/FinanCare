import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import Select from "react-select";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";
import TeDhenatKalkulimit from "./TeDhenatKalkulimit";

function PerditesoStatusinKalk(props) {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://localhost:7285";
  const [kalkulimet, setKalkulimet] = useState([]);
  const [kalkulimetEFiltruara, setKalkulimetEFiltruara] = useState([]);
  const [perditeso, setPerditeso] = useState("");
  const [options, setOptions] = useState([]);
  const [optionsSelected, setOptionsSelected] = useState(null);
  const [partnerFilter, setPartnerFilter] = useState("");
  const [hapKalkulimin, setHapKalkulimin] = useState(false);
  const [fshijKalkulimin, setFshijKalkulimin] = useState(false);
  const [shfaqTeDhenat, setShfaqTeDhenat] = useState(false);
  const [id, setId] = useState(0);
  const [error, setError] = useState(null);
  const getToken = localStorage.getItem("token") || "";

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      zIndex: 1050,
    }),
  };

  // Fetch products for select
  useEffect(() => {
    const vendosProduktet = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Produkti/ProduktetPerKalkulim`,
          authentikimi
        );
        const fetchedOptions = response.data
          .filter((item) => item.qmimiProduktit > 0)
          .map((item) => ({
            value: item.produktiID,
            label: `${item.emriProduktit} - ${item.barkodi} - ${item.kodiProduktit}`,
            item: item,
          }));
        setOptions(fetchedOptions);
      } catch (err) {
        setError({
          message: "Dështoi marrja e produkteve. Ju lutem provoni përsëri.",
          details: err.response?.data?.message || err.message,
        });
        console.error("Product fetch error:", err);
      }
    };
    vendosProduktet();
  }, [perditeso]);

  // Fetch invoices based on selected product
  useEffect(() => {
    const shfaqKalkulimet = async () => {
      if (!optionsSelected?.value) {
        setKalkulimet([]);
        setKalkulimetEFiltruara([]);
        return;
      }
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetNgaProdukti?id=${optionsSelected.value}`,
          { ...authentikimi, timeout: 5000 }
        );
        const kalkulimet = Array.isArray(response.data?.regjistrimet)
          ? response.data.regjistrimet.filter(
              (item) => item.llojiKalkulimit === "FAT"
            )
          : [];
        setKalkulimet(kalkulimet);
        setKalkulimetEFiltruara(
          kalkulimet.filter((k) =>
            k.emriBiznesit?.toLowerCase().includes(partnerFilter.toLowerCase())
          )
        );
        if (kalkulimet.length === 0) {
          setError({
            message: "Nuk u gjetën fatura për produktin e zgjedhur.",
          });
        } else {
          setError(null);
        }
      } catch (err) {
        setError({
          message:
            "Dështoi marrja e faturave. Ju lutem kontrolloni lidhjen me serverin.",
          details: err.response?.data?.message || err.message,
          status: err.response?.status,
        });
        console.error("Invoice fetch error:", err);
      }
    };
    shfaqKalkulimet();
  }, [
    optionsSelected,
    hapKalkulimin,
    fshijKalkulimin,
    perditeso,
    partnerFilter,
  ]);

  const mbyllTeDhenat = () => {
    setShfaqTeDhenat(false);
  };

  const handleShfaqTeDhenat = (id) => {
    setId(id);
    setShfaqTeDhenat(true);
  };

  async function vendosProduktetPerFletkthim(id) {
    try {
      const kalkulimi = await axios.get(
        `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?IDRegjistrimit=${id}`,
        authentikimi
      );
      const produktetNeKalkulim = kalkulimi.data;
      for (const produkt of produktetNeKalkulim) {
        if (produkt.idProduktit == optionsSelected.value) {
          await axios.post(
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
          );
        }
      }
      setPerditeso(Date.now());
      props.perditeso();
      props.hide();
    } catch (err) {
      setError({
        message: "Dështoi përditësimi i të dhënave të faturës.",
        details: err.response?.data?.message || err.message,
      });
      console.error("Update invoice error:", err);
    }
  }

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
        <Modal.Body>
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
      <Modal size="lg" className="mt-12" show={props.show} onHide={props.hide}>
        <Modal.Header closeButton>
          <Modal.Title>Lista e Kalkulimeve</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <div className="text-red-500 mb-4">
              <p>{error.message}</p>
              {error.details && (
                <p className="text-sm">Detajet: {error.details}</p>
              )}
              {error.status && (
                <p className="text-sm">Statusi: {error.status}</p>
              )}
            </div>
          )}
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <label htmlFor="produktiSelect" className="form-label">
                Produkti
              </label>
              <Select
                value={optionsSelected}
                onChange={setOptionsSelected}
                options={options}
                id="produktiSelect"
                inputId="produktiSelect-input"
                isClearable
                placeholder="Zgjidh Produktin"
                styles={customStyles}
              />
            </div>
          </div>
          <MDBTable small>
            <MDBTableHead>
              <tr>
                <th scope="col">Nr. Kalkulimit</th>
                <th scope="col">Nr. Faturës</th>
                <th scope="col">Partneri</th>
                <th scope="col">Totali Pa TVSH €</th>
                <th scope="col">TVSH €</th>
                <th scope="col">Data e Faturës</th>
                <th scope="col">Lloji Faturës</th>
                <th scope="col">Funksione</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {kalkulimetEFiltruara?.map((k) => (
                <tr key={k.idRegjistrimit}>
                  <td>{k.idRegjistrimit}</td>
                  <td>{k.nrFatures}</td>
                  <td>{k.emriBiznesit}</td>
                  <td>{k.totaliPaTVSH?.toFixed(2) ?? "0.00"} €</td>
                  <td>{k.tvsh?.toFixed(2) ?? "0.00"} €</td>
                  <td>
                    {k.dataRegjistrimit
                      ? new Date(k.dataRegjistrimit).toLocaleDateString(
                          "en-GB",
                          { dateStyle: "short" }
                        )
                      : "N/A"}
                  </td>
                  <td>{k.llojiKalkulimit}</td>
                  <td>
                    <Button
                      style={{ marginRight: "0.5em" }}
                      variant="warning"
                      size="sm"
                      onClick={() => handleShfaqTeDhenat(k.idRegjistrimit)}
                      aria-label="Shiko Detajet e Faturës">
                      <FontAwesomeIcon icon={faCircleInfo} />
                    </Button>
                    <Button
                      style={{ marginRight: "0.5em" }}
                      variant="warning"
                      size="sm"
                      onClick={() =>
                        vendosProduktetPerFletkthim(k.idRegjistrimit)
                      }
                      aria-label="Përditëso Faturën">
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </Button>
                  </td>
                </tr>
              ))}
            </MDBTableBody>
          </MDBTable>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default PerditesoStatusinKalk;
