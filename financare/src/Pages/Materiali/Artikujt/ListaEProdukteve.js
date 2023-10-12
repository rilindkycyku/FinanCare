import NavBar from "../../../Components/TeTjera/layout/NavBar";
import { Helmet } from "react-helmet";
import React, { useState, useEffect } from "react";
import "../../Styles/ProductTables.css";
import Button from "react-bootstrap/Button";
import axios from "axios";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import ShtoProduktin from "../../../Components/Materiali/Artikujt/Produktet/ShtoProduktin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faPenToSquare, faPlus, faXmark, faCheck, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import EditoProduktin from "../../../Components/Materiali/Artikujt/Produktet/EditoProduktin";
import Modal from "react-bootstrap/Modal";
import { TailSpin } from 'react-loader-spinner';
import ZbritjetEProduktit from "./ZbritjetEProduktit";
import TabelaEKategorive from "./NjesiaMatese";
import TabelaEKompanive from "../../Gjenerale/Partneret/TabelaEPartnereve";
import { MDBBtn, MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import { Link } from "react-router-dom";

const ProductTables = () => {
  const [produkti, setProdukti] = useState([]);
  const [id, setId] = useState();
  const [perditeso, setPerditeso] = useState("");
  const [show, setShow] = useState(false);
  const [edito, setEdito] = useState(false);
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);
  const [mbyllZbritjen, setMbyllZbritjen] = useState(true);
  const [mbyllKompanit, setMbyllKompanit] = useState(true);
  const [mbyllKategorite, setMbyllKategorite] = useState(true);

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const shfaqProduktet = async () => {
      try {
        setLoading(true);
        const produkti = await axios.get(
          "https://localhost:7285/api/Produkti/Products", authentikimi
        );
        setProdukti(produkti.data);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    shfaqProduktet();
  }, [perditeso]);

  const handleClose = () => {
    setShow(false);
  };
  const handleShow = () => setShow(true);

  const handleEdito = (id) => {
    setEdito(true);
    setId(id);
  };

  const [showD, setShowD] = useState(false);

  const handleCloseD = () => setShowD(false);
  const handleShowD = (id) => {
    setId(id);
    setShowD(true);
  };

  const handleEditoMbyll = () => setEdito(false);

  async function handleDelete() {
    try {
      await axios.delete(`https://localhost:7285/api/Produkti/` + id, authentikimi);
      setTipiMesazhit("success");
      setPershkrimiMesazhit("Produkti u fshi me sukses!");
      setPerditeso(Date.now());
      setShfaqMesazhin(true);
      setShowD(false);
    } catch (err) {
      console.error(err);
      setTipiMesazhit("danger");
      setPershkrimiMesazhit("Ndodhi nje gabim gjate fshirjes se produkti!");
      setPerditeso(Date.now());
      setShfaqMesazhin(true);
    }
  }

  const handleMbyllZbritjen = () => {
    setMbyllZbritjen(true);
    setMbyllKompanit(true);
    setMbyllKategorite(true);
  }
  const handleMbyllKompanit = () => {
    setMbyllKompanit(true);
    setMbyllZbritjen(true);
    setMbyllKategorite(true);
  }
  const handleMbyllKategorite = () => {
    setMbyllKategorite(true);
    setMbyllZbritjen(true);
    setMbyllKompanit(true);
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | Tech Store</title>
      </Helmet>
      <NavBar />

      <div className="containerDashboardP">

        {(mbyllZbritjen == false && mbyllKategorite && mbyllKompanit) &&
          <ZbritjetEProduktit
            setMbyllZbritjen={handleMbyllZbritjen}
            setPerditeso={setPerditeso}
          />
        }
        {(mbyllZbritjen && mbyllKategorite == false && mbyllKompanit) &&
          <TabelaEKategorive
            setMbyllKategorite={handleMbyllKategorite}
            setPerditeso={setPerditeso}
          />
        }
        {(mbyllZbritjen && mbyllKategorite && mbyllKompanit == false) &&
          <TabelaEKompanive
            setMbyllKompanit={handleMbyllKompanit}
            setPerditeso={setPerditeso}
          />
        }
        {show && (
          <ShtoProduktin
            show={handleShow}
            hide={handleClose}
            shfaqmesazhin={() => setShfaqMesazhin(true)}
            perditesoTeDhenat={() => setPerditeso(Date.now())}
            setTipiMesazhit={setTipiMesazhit}
            setPershkrimiMesazhit={setPershkrimiMesazhit}
          />
        )}
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}
        {edito && (
          <EditoProduktin
            show={handleShow}
            hide={handleEditoMbyll}
            id={id}
            shfaqmesazhin={() => setShfaqMesazhin(true)}
            perditesoTeDhenat={() => setPerditeso(Date.now())}
            setTipiMesazhit={setTipiMesazhit}
            setPershkrimiMesazhit={setPershkrimiMesazhit}
          />
        )}
        <Modal show={showD} onHide={handleCloseD}>
          <Modal.Header closeButton>
            <Modal.Title style={{ color: "red" }}>Largo Produktin</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h6>A jeni te sigurt qe deshironi ta fshini kete produkt?</h6>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseD}>
              Anulo <FontAwesomeIcon icon={faXmark} />
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Largo Produktin <FontAwesomeIcon icon={faBan} />
            </Button>
          </Modal.Footer>
        </Modal>
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
        ) : (mbyllZbritjen && mbyllKategorite && mbyllKompanit) && <>
          <h1 className="title">Tabela e Produkteve</h1>
          <Button className="mb-3 Butoni" onClick={handleShow}>
            Shto Produktin <FontAwesomeIcon icon={faPlus} />
          </Button>
          <Link to="/ZbritjetEProduktit"><MDBBtn className="Butoni">Zbritjet e Produkteve <FontAwesomeIcon icon={faInfoCircle} /></MDBBtn></Link>
          <Link to="/TabelaEPartnereve"><MDBBtn className="Butoni">Partneret <FontAwesomeIcon icon={faInfoCircle} /></MDBBtn></Link>
          <Link to="/NjesiaMatese"><MDBBtn className="Butoni">Njesia Matese <FontAwesomeIcon icon={faInfoCircle} /></MDBBtn></Link>
          <MDBTable>
            <MDBTableHead>
              <tr>
                <th scope="col">Barkodi / Kodi Produktit</th>
                <th scope="col">Emri i Produktit</th>
                <th scope="col">Partneri</th>
                <th scope="col">Njesia Matese</th>
                <th scope="col">Grupi i Produktit</th>
                <th scope="col">Lloji TVSH %</th>
                <th scope="col">Qmimi i Produktit Me Pakic</th>
                <th scope="col">Qmimi i Produktit Me Shumic</th>
                <th scope="col">Sasia e Shumices</th>
                <th scope="col">Funksione</th>
              </tr>
            </MDBTableHead>

            <MDBTableBody>
              {produkti.map((p) => {
                return (
                  <tr key={p.produktiId}>
                    <td>{p.barkodi} / {p.kodiProduktit}</td>
                    <td>{p.emriProduktit}</td>
                    <td>{p.emriBiznesit}</td>
                    <td>{p.njesiaMatese1}</td>
                    <td>{p.grupiIProduktit}</td>
                    <td>{p.llojiTVSH}</td>
                    <td>{(p.qmimiProduktit).toFixed(2)} €</td>
                    <td>{(p.qmimiMeShumic).toFixed(2)} €</td>
                    <td>{p.sasiaShumices}</td>
                    <td>
                      <Button
                        style={{ marginRight: "0.5em" }}
                        variant="success"
                        onClick={() => handleEdito(p.produktiId)}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleShowD(p.produktiId)}
                      >
                        <FontAwesomeIcon icon={faBan} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </MDBTableBody>
          </MDBTable>
        </>
        }
      </div>
    </>
  );
};

export default ProductTables;
