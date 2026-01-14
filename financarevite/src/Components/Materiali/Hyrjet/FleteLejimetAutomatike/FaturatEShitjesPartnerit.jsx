import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";
import TeDhenatKalkulimit from "./TeDhenatKalkulimit";

function PerditesoStatusinKalk(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [kalkulimet, setKalkulimet] = useState([]);
  const [kalkulimetEFiltruara, setKalkulimetEFiltruara] = useState([]);
  const [perditeso, setPerditeso] = useState("");
  const [produktet, setProduktet] = useState([]);
  const [hapKalkulimin, setHapKalkulimin] = useState(false);
  const [fshijKalkulimin, setFshijKalkulimin] = useState(false);
  const [statusiIFiltrimit, setStatusiIFiltrimit] = useState(true);
  const [shfaqTeDhenat, setShfaqTeDhenat] = useState(false);
  const [id, setId] = useState(0);
  const [error, setError] = useState(null); // Added for error handling

  const getToken = localStorage.getItem("token");
  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const vendosProduktet = async () => {
      try {
        const produktet = await axios.get(
          `${API_BASE_URL}/api/Produkti/Products`,
          authentikimi
        );
        setProduktet(produktet.data);
      } catch (err) {
        setError("Failed to fetch products. Please try again.");
        console.error(err);
      }
    };

    vendosProduktet();
  }, [perditeso]);

  useEffect(() => {
    const shfaqKalkulimet = async () => {
      try {
        const kalkulimi = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimet`,
          authentikimi
        );
        const kalkulimet = kalkulimi.data.filter(
          (item) => item.llojiKalkulimit === "FL"
        );
        setKalkulimet(kalkulimet);
      } catch (err) {
        setError("Failed to fetch invoices. Please try again.");
        console.error(err);
      }
    };

    shfaqKalkulimet();
  }, [perditeso, hapKalkulimin, fshijKalkulimin]);

  useEffect(() => {
    const shfaqKalkulimet = async () => {
      try {
        const kalkulimi = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetSipasStatusit?statusi=${statusiIFiltrimit}`,
          authentikimi
        );
        const kalkulimet = kalkulimi.data.filter(
          (item) =>
            item.llojiKalkulimit === "FAT" && item.idPartneri === props.pID
        );
        setKalkulimetEFiltruara(kalkulimet);
      } catch (err) {
        setError("Failed to fetch filtered invoices. Please try again.");
        console.error(err);
      }
    };

    shfaqKalkulimet();
  }, [hapKalkulimin, fshijKalkulimin, statusiIFiltrimit]);

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

      let produktetNeKalkulim = kalkulimi.data;

      for (const produkt of produktetNeKalkulim) {
        await axios
          .post(
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
          .then(async () => {
            setPerditeso(Date.now());
            props.perditeso();
            props.hide();
          });
      }

      setPerditeso(Date.now());
    } catch (err) {
      setError("Failed to fetch filtered invoices. Please try again.");
      console.error(err);
    }
  }

  return (
    <>
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
          <Modal.Title>Te Dhenat e Fatures</Modal.Title>
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
      <Modal
        size="lg"
        style={{ marginTop: "3em" }}
        show={props.show}
        onHide={props.hide}>
        <Modal.Header closeButton>
          <Modal.Title>Lista e Kalkulimeve</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="error-message">{error}</div>}
          <MDBTable small>
            <MDBTableHead>
              <tr>
                {kalkulimetEFiltruara.length > 0 && (
                  <th scope="col">Nr. Kalkulimit</th>
                )}
                {kalkulimetEFiltruara.length === 0 && <th scope="col">Nr.</th>}
                <th scope="col">Nr. Fatures</th>
                <th scope="col">Partneri</th>
                <th scope="col">Totali Pa TVSH €</th>
                <th scope="col">TVSH €</th>
                <th scope="col">Data e Fatures</th>
                <th scope="col">Lloji Fatures</th>
                {kalkulimetEFiltruara.length === 0 && (
                  <th scope="col">Statusi</th>
                )}
                {kalkulimetEFiltruara.length > 0 && (
                  <th scope="col">Funksione</th>
                )}
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
                          {
                            dateStyle: "short",
                          }
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
                      aria-label="View Invoice Details">
                      <FontAwesomeIcon icon={faCircleInfo} />
                    </Button>
                    <Button
                      style={{ marginRight: "0.5em" }}
                      variant="warning"
                      size="sm"
                      onClick={() =>
                        vendosProduktetPerFletkthim(k.idRegjistrimit)
                      }
                      aria-label="Edit Invoice">
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </Button>
                  </td>
                </tr>
              ))}
            </MDBTableBody>
          </MDBTable>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default PerditesoStatusinKalk;
