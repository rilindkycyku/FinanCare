import { useEffect, useState } from "react";
﻿import NavBar from "../../../Components/TeTjera/layout/NavBar";
import "../../Styles/TabelaEPerdoruesve.css";
import "../../Styles/DizajniPergjithshem.css";
import axios from "axios";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { TailSpin } from "react-loader-spinner";
import EditoPerdorues from "../../../Components/Gjenerale/Stafi/users/EditoPerdorues";
import Rolet from "./Rolet";
import ShtoPerdorues from "../../../Components/Gjenerale/Stafi/users/ShtoPerdorues";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan } from "@fortawesome/free-solid-svg-icons";

function TabelaEPerdoruesve() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  
  const [perdoruesit, setPerdoruesit] = useState([]);
  const [perditeso, setPerditeso] = useState("");
  const [shto, setShto] = useState(false);
  const [edito, setEdito] = useState(false);
  const [fshij, setFshij] = useState(false);
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [mbyllRolet, setMbyllRolet] = useState(true);
  const [id, setId] = useState(0);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    const shfaqPerdoruesit = async () => {
      try {
        setLoading(true);
        const perdoruesit = await axios.get(
          `${API_BASE_URL}/api/Perdoruesi/shfaqPerdoruesit`,
          authentikimi
        );
        setPerdoruesit(
          perdoruesit.data.map((k) => ({
            ID: k.perdoruesi.aspNetUserID,
            "Emri & Mbiemri": k.perdoruesi.emri + " " + k.perdoruesi.mbiemri,
            Email: k.perdoruesi.email,
            Username: k.perdoruesi.username,
            Aksesi: k.rolet.filter((item) => item !== "User").join(", "),
            Kartela: k.perdoruesi?.kartelat?.kodiKartela ?? " - ",
            "Eshte Aktiv": (k.perdoruesi?.teDhenatPerdoruesit?.eshtePuntorAktive == "true" && !k.isLockedOut) ? "Po" : "Jo",
          }))
        );

        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    shfaqPerdoruesit();
  }, [perditeso]);

  const handleEdito = (id) => {
    setEdito(true);
    setId(id);
  };
  const handleEditoMbyll = () => setEdito(false);

  const handleClose = () => {
    setShto(false);
  };
  const handleShow = () => setShto(true);

  const handleFshij = (id) => {
    setId(id);
    setFshij(true);
  };
  const handleFshijMbyll = () => setFshij(false);

  const handleSubmitFshij = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `${API_BASE_URL}/api/Perdoruesi/fshijPerdoruesin?idUserAspNet=${id}`,
        authentikimi
      );

      setTipiMesazhit("success");
      setPershkrimiMesazhit("Përdoruesi u fshi me sukses!");
      setShfaqMesazhin(true);

      setPerditeso(Date.now());
      setFshij(false);
    } catch (err) {
      console.log(err);
      setTipiMesazhit("danger");
      setPershkrimiMesazhit("Ndodhi një gabim gjatë fshirjes së përdoruesit!");
      setShfaqMesazhin(true);
      setFshij(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Burime Njerzore", "1 Euro Menaxher"]} />
      <NavBar />
      <div className="containerDashboardP">
        {mbyllRolet == false && (
          <Rolet
            setMbyllRolet={() => setMbyllRolet(true)}
            setPerditeso={() => setPerditeso(Date.now())}
          />
        )}
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}
        {shto && (
          <ShtoPerdorues
            largo={handleClose}
            id={id}
            shfaqmesazhin={() => setShfaqMesazhin(true)}
            perditesoTeDhenat={() => setPerditeso(Date.now())}
            setTipiMesazhit={setTipiMesazhit}
            setPershkrimiMesazhit={setPershkrimiMesazhit}
          />
        )}
        {edito && (
          <EditoPerdorues
            largo={handleEditoMbyll}
            id={id}
            shfaqmesazhin={() => setShfaqMesazhin(true)}
            perditesoTeDhenat={() => setPerditeso(Date.now())}
            setTipiMesazhit={setTipiMesazhit}
            setPershkrimiMesazhit={setPershkrimiMesazhit}
          />
        )}
        {fshij && (
          <Modal show={true} onHide={handleFshijMbyll} className="sp-modal">
            <Modal.Header closeButton>
              <Modal.Title className="text-white">Largo Përdoruesin</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center py-4">
              <div className="mb-3 text-danger">
                <FontAwesomeIcon icon={faBan} size="3x" />
              </div>
              <h5 className="text-white mb-3 fw-bold">Konfirmimi i Fshirjes</h5>
              <p className="text-white-50">
                A jeni të sigurt që dëshironi ta fshini këtë përdorues? <br />
                <span className="small opacity-75">Ky veprim do të kryejë soft-delete dhe do të çaktivizojë llogarinë.</span>
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button className="btn-cancel px-4" onClick={handleFshijMbyll}>
                Anulo
              </Button>
              <Button variant="danger" className="px-4 fw-bold shadow-sm" onClick={handleSubmitFshij}>
                Konfirmo Largimin
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
          mbyllRolet && (
            <>
              <div className="mt-2">
                <Tabela
                  data={perdoruesit}
                  tableName="Lista e Perdoruesve"
                  kaButona={true}
                  funksionButonShto={() => {
                    handleShow();
                  }}
                  funksionButonEdit={(e) => {
                    setId(e);
                    handleEdito(e);
                  }}
                  funksionButonFshij={(e) => {
                    handleFshij(e);
                  }}
                  mosShfaqID={true}
                />
              </div>
            </>
          )
        )}
      </div>
    </>
  );
}

export default TabelaEPerdoruesve;
