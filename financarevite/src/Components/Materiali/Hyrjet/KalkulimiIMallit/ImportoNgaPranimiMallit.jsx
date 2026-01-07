import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function ImportoNgaPranimiMallit(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [kalkulimet, setKalkulimet] = useState([]);

  const [emriBiznesit, setEmriBiznesit] = useState("");
  const [nrFatures, setNrFatures] = useState("");
  const [nrKalkulimit, setNrKalkulimit] = useState("");
  const [dataFatures, setDataFatures] = useState("");
  const [llojiFatures, setLlojiFatures] = useState("");

  const [perditeso, setPerditeso] = useState("");
  const [produktet, setProduktet] = useState([]);
  const [hapKalkulimin, setHapKalkulimin] = useState(false);
  const [fshijKalkulimin, setFshijKalkulimin] = useState(false);

  const [teDhenat, setTeDhenat] = useState([]);
  
  const getID = localStorage.getItem("id");
  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
      if (getID) {
        const vendosTeDhenat = async () => {
          try {
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
    const vendosProduktet = async () => {
      try {
        const produktet = await axios.get(
          `${API_BASE_URL}/api/Produkti/Products`,
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
    const shfaqKalkulimet = async () => {
      try {
        const kalkulimi = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimet`,
          authentikimi
        );
        const kalkulimet = kalkulimi.data.filter(
          (item) => item.llojiKalkulimit === "PRM"
        );
        setKalkulimet(kalkulimet);
      } catch (err) {
        console.log(err);
      }
    };

    shfaqKalkulimet();
  }, [perditeso]);

  async function ndryshoStatusinKalkulimit() {
    try {
      await axios
        .put(
          `${API_BASE_URL}/api/Faturat/BartNgaPranimiMallitKalkulim?id=${nrKalkulimit}&idPartneri=${teDhenat.perdoruesi.userID}`,
          {},
          authentikimi
        )
        .then(() => {
          setHapKalkulimin(false);
          setPerditeso(Date.now())
        });

    } catch (error) {
      console.error(error);
    }
  }

  function detajetRiKonfrimitKalkulimit(
    emriBiznesit,
    nrFatures,
    nrKalkulimit,
    dataFatures,
    llojiFatures,
  ) {
    setEmriBiznesit(emriBiznesit);
    setNrFatures(nrFatures);
    setNrKalkulimit(nrKalkulimit);
    setDataFatures(dataFatures);
    setLlojiFatures(llojiFatures);

    setHapKalkulimin(true);

    setPerditeso(Date.now());
  }

  return (
    <>
      <KontrolloAksesinNeFunksione
        roletELejuara={["Menaxher", "Kalkulant"]}
        largo={() => props.largo()}
        shfaqmesazhin={() => props.shfaqmesazhin()}
        perditesoTeDhenat={() => props.perditesoTeDhenat()}
        setTipiMesazhit={(e) => props.setTipiMesazhit(e)}
        setPershkrimiMesazhit={(e) => props.setPershkrimiMesazhit(e)}
      />
      {hapKalkulimin && (
        <Modal
          show={hapKalkulimin}
          style={{ marginTop: "7em" }}
          onHide={() => setHapKalkulimin(false)}>
          <Modal.Header closeButton>
            <Modal.Title as="h5">Konfirmo Kalkulimin</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <strong style={{ fontSize: "10pt" }}>
              A jeni te sigurt qe deshironi ta bartni kete kalkulim?
            </strong>
            <hr />
            <span style={{ fontSize: "10pt" }}>
              <strong>Nr. Kalkulimit:</strong> {nrKalkulimit}
            </span>
            <br />
            <span style={{ fontSize: "10pt" }}>
              <strong>Partneri:</strong> {emriBiznesit}
            </span>
            <br />
            <span style={{ fontSize: "10pt" }}>
              <strong>Nr. Fatures:</strong> {nrFatures}
            </span>
            <br />
            <span style={{ fontSize: "10pt" }}>
              <strong>Data Fatures: </strong>
              {new Date(dataFatures).toLocaleDateString("en-GB", {
                dateStyle: "short",
              })}
            </span>
            <br />
            <span style={{ fontSize: "10pt" }}>
              <strong>Lloji Fatures:</strong> {llojiFatures}
            </span>
          </Modal.Body>
          <Modal.Footer>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setHapKalkulimin(false)}>
              Anulo <FontAwesomeIcon icon={faXmark} />
            </Button>
            <Button
              size="sm"
              onClick={() => {
                ndryshoStatusinKalkulimit();
              }}>
              Konfirmo <FontAwesomeIcon icon={faCheck} />
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <Modal
        size="lg"
        style={{ marginTop: "3em" }}
        show={props.show}
        onHide={props.hide}>
        <Modal.Header closeButton>
          <Modal.Title>Lista e Kalkulimeve</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <MDBTable small>
            <MDBTableHead>
              <tr>
                {kalkulimet.length > 0 && <th scope="col">Nr. Kalkulimit</th>}
                {kalkulimet.length === 0 && <th scope="col">Nr.</th>}
                <th scope="col">Nr. Fatures</th>
                <th scope="col">Partneri</th>
                <th scope="col">Totali Pa TVSH €</th>
                <th scope="col">TVSH €</th>
                <th scope="col">Data e Fatures</th>
                <th scope="col"> Funksione</th>
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {kalkulimet &&
                kalkulimet.map((k) => (
                  <tr key={k.idRegjistrimit}>
                    <td>{k.idRegjistrimit}</td>
                    <td>{k.nrFatures}</td>
                    <td>{k.emriBiznesit}</td>
                    <td>{k.totaliPaTVSH.toFixed(2)} €</td>
                    <td>{k.tvsh.toFixed(2)} €</td>
                    <td>
                      {new Date(k.dataRegjistrimit).toLocaleDateString(
                        "en-GB",
                        {
                          dateStyle: "short",
                        }
                      )}
                    </td>
                    <td>
                      <Button
                        style={{ marginRight: "0.5em" }}
                        variant="warning"
                        size="sm"
                        onClick={() => {
                          detajetRiKonfrimitKalkulimit(
                            k.emriBiznesit,
                            k.nrFatures,
                            k.idRegjistrimit,
                            k.dataRegjistrimit,
                            k.llojiKalkulimit
                          );
                        }}>
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

export default ImportoNgaPranimiMallit;
