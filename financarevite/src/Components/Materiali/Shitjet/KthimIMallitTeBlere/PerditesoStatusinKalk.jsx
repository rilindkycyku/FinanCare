import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faCheck,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import { MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import KontrolloAksesinNeFunksione from "../../../TeTjera/KontrolliAksesit/KontrolloAksesinNeFunksione";

function PerditesoStatusinKalk(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [kalkulimet, setKalkulimet] = useState([]);
  const [kalkulimetEFiltruara, setKalkulimetEFiltruara] = useState([]);

  const [emriBiznesit, setEmriBiznesit] = useState("");
  const [nrFatures, setNrFatures] = useState("");
  const [nrKalkulimit, setNrKalkulimit] = useState("");
  const [dataFatures, setDataFatures] = useState("");
  const [llojiFatures, setLlojiFatures] = useState("");

  const [perditeso, setPerditeso] = useState("");
  const [produktet, setProduktet] = useState([]);
  const [hapKalkulimin, setHapKalkulimin] = useState(false);
  const [fshijKalkulimin, setFshijKalkulimin] = useState(false);

  const [statusiIFiltrimit, setStatusiIFiltrimit] = useState([]);

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
        console.log(err);
      }
    };

    vendosProduktet();
  }, [perditeso]);

  useEffect(() => {
    const shfaqKalkulimet = async () => {
      try {
        const kalkulimet = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimet`,
          authentikimi
        );
        const kthimet = kalkulimet.data.filter(
          (item) => item.llojiKalkulimit === "KMB"
        );
        setKalkulimet(kthimet);
      } catch (err) {
        console.log(err);
      }
    };

    shfaqKalkulimet();
  }, [perditeso, hapKalkulimin, fshijKalkulimin]);

  useEffect(() => {
    const shfaqKalkulimet = async () => {
      try {
        const kalkulimet = await axios.get(
          `${API_BASE_URL}/api/Faturat/shfaqRegjistrimetSipasStatusit?statusi=${statusiIFiltrimit}`,
          authentikimi
        );
        const kthimet = kalkulimet.data.filter(
          (item) => item.llojiKalkulimit === "KMB"
        );
        setKalkulimetEFiltruara(kthimet);
        console.log(kthimet)
      } catch (err) {
        console.log(err);
      }
    };

    shfaqKalkulimet();
  }, [hapKalkulimin, fshijKalkulimin, statusiIFiltrimit]);

  async function ndryshoStatusinKalkulimit() {
    try {
      await axios
        .put(
          `${API_BASE_URL}/api/Faturat/ruajKalkulimin/perditesoStatusinKalkulimit?id=${nrKalkulimit}&statusi=false`,
          {},
          authentikimi
        )
        .then(() => {
          filtroKalkulimet("hapKalkulimet");
          setHapKalkulimin(false);
        });

      await axios
        .get(
          `${API_BASE_URL}/api/Faturat/shfaqTeDhenatKalkulimit?idRegjistrimit=${nrKalkulimit}`,
          authentikimi
        )
        .then(async (teDhenat) => {
          for (let p of teDhenat.data) {
            await axios.get(
              `${API_BASE_URL}/api/Faturat/hapAsgjesiminKthimin/perditesoStokunQmimin?idProdukti=${p.idProduktit}&idTeDhenatKalkulimit=${p.id}&lloji=AS`,
              authentikimi
            );
          }
        });

      filtroKalkulimet("hapKalkulimet");
    } catch (error) {
      console.error(error);
    }
  }

  async function fshijKalkuliminFunksioni() {
    try {
      await axios
        .delete(
          `${API_BASE_URL}/api/Faturat/fshijKalkulimin?idKalkulimi=${nrKalkulimit}`,
          authentikimi
        )
        .then(() => {
          filtroKalkulimet("fshijKalkulimet");
        });

      setFshijKalkulimin(false);
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
    funksioni
  ) {
    setEmriBiznesit(emriBiznesit);
    setNrFatures(nrFatures);
    setNrKalkulimit(nrKalkulimit);
    setDataFatures(dataFatures);
    setLlojiFatures(llojiFatures);

    setPerditeso(Date.now());

    if (funksioni === "hapKalkulimin") {
      setHapKalkulimin(true);
    }

    if (funksioni === "fshijKalkulimin") {
      setFshijKalkulimin(true);
    }
  }

  function filtroKalkulimet(lloji) {
    setPerditeso(Date.now());

    if (lloji === "hapKalkulimet") {
      setStatusiIFiltrimit("true");
    }
    if (lloji === "fshijKalkulimet") {
      setStatusiIFiltrimit("false");
    }
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
            <Modal.Title as="h5">Konfirmo Hapjen e Kalkulimit</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <strong style={{ fontSize: "10pt" }}>
              A jeni te sigurt qe deshironi ta hapni kete kalkulim?
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
      {fshijKalkulimin && (
        <Modal
          show={fshijKalkulimin}
          style={{ marginTop: "7em" }}
          onHide={() => setFshijKalkulimin(false)}>
          <Modal.Header closeButton>
            <Modal.Title as="h5">Konfirmo Fshrijen e Kalkulimit</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <strong style={{ fontSize: "10pt" }}>
              A jeni te sigurt qe deshironi ta fshini kete kalkulim?
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
              onClick={() => setFshijKalkulimin(false)}>
              Anulo <FontAwesomeIcon icon={faXmark} />
            </Button>
            <Button
              size="sm"
              onClick={() => {
                fshijKalkuliminFunksioni();
                setPerditeso(Date.now());
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
          <Modal.Title>
            {kalkulimetEFiltruara.length === 0
              ? "Lista e Kalkulimeve"
              : statusiIFiltrimit === "true"
              ? "Lista e Kalkulimeve te Mbyllura"
              : "Lista e Kalkulimeve te Hapura"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button
            style={{ marginRight: "0.5em" }}
            variant="success"
            size="sm"
            onClick={() => {
              filtroKalkulimet("hapKalkulimet");
            }}>
            Hap Kalkulimet <FontAwesomeIcon icon={faPenToSquare} />
          </Button>
          <Button
            style={{ marginRight: "0.5em" }}
            variant="success"
            size="sm"
            onClick={() => {
              filtroKalkulimet("fshijKalkulimet");
            }}>
            Fshij Kalkulimet <FontAwesomeIcon icon={faPenToSquare} />
          </Button>
          <Button
            style={{ marginRight: "0.5em" }}
            variant="success"
            size="sm"
            onClick={() => {
              setKalkulimetEFiltruara([]);
            }}>
            Te gjitha Kalkulimet <FontAwesomeIcon icon={faPenToSquare} />
          </Button>
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
                  <th scope="col"> Funksione</th>
                )}
              </tr>
            </MDBTableHead>
            <MDBTableBody>
              {kalkulimetEFiltruara &&
                kalkulimetEFiltruara.map((k) => (
                  <tr key={k.idRegjistrimit}>
                    <td>{k.idRegjistrimit}</td>
                    <td>{k.nrFatures}</td>
                    <td>{k.emriBiznesit}</td>
                    <td>{k.totaliPaTVSH.toFixed(2)} €</td>
                    <td>{k.tvsh.toFixed(2)} €</td>
                    <td>
                      {new Date(k.dataRegjistrimit).toLocaleDateString(
                        "en-GB",
                        { dateStyle: "short" }
                      )}
                    </td>
                    <td>{k.llojiKalkulimit}</td>
                    <td>
                      {statusiIFiltrimit === "true" ? (
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
                              k.llojiKalkulimit,
                              "hapKalkulimin"
                            );
                          }}>
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </Button>
                      ) : (
                        <Button
                          style={{ marginRight: "0.5em" }}
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            detajetRiKonfrimitKalkulimit(
                              k.emriBiznesit,
                              k.nrFatures,
                              k.idRegjistrimit,
                              k.dataRegjistrimit,
                              k.llojiKalkulimit,
                              "fshijKalkulimin"
                            );
                          }}>
                          <FontAwesomeIcon icon={faXmark} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              {kalkulimetEFiltruara.length === 0 &&
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
                        { dateStyle: "short" }
                      )}
                    </td>
                    <td>{k.llojiKalkulimit}</td>
                    <td>{k.statusiKalkulimit === "true" ? "M" : "H"}</td>
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
