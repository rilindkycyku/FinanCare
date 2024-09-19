import NavBar from "../../../Components/TeTjera/layout/NavBar";
import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import "../../Styles/DizajniPergjithshem.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faPenToSquare,
  faPlus,
  faClose,
} from "@fortawesome/free-solid-svg-icons";
import EditoKompanin from "../../../Components/Gjenerale/Partneret/Partneri/EditoPartnerin";
import LargoKompanin from "../../../Components/Gjenerale/Partneret/Partneri/LargoPartnerin";
import { TailSpin } from "react-loader-spinner";
import { MDBBtn, MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import { Link } from "react-router-dom";
import ShtoPartnerin from "../../../Components/Gjenerale/Partneret/Partneri/ShtoPartnerin";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import { Row } from "react-bootstrap";
import Titulli from "../../../Components/TeTjera/Titulli";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";

function TabelaEKompanive(props) {
  const [partneret, setPartneret] = useState([]);
  const [perditeso, setPerditeso] = useState("");
  const [shto, setShto] = useState(false);
  const [edito, setEdito] = useState(false);
  const [fshij, setFshij] = useState(false);
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [id, setId] = useState(0);
  const [loading, setLoading] = useState(false);

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const shfaqPartneret = async () => {
      try {
        setLoading(true);
        const partneri = await axios.get(
          "https://localhost:7285/api/Partneri/shfaqPartneret",
          authentikimi
        );
        setPartneret(
          partneri.data
            .filter(
              (k) =>
                k.idPartneri !== 1 && k.idPartneri !== 2 && k.idPartneri !== 3
            ) // Per te mos shfaqur Bleresin Qytetar, Asgjesimin e Stokut dhe Kthim i Mallit te Shitur
            .map((k) => ({
              ID: k.idPartneri,
              "Emri i Partnerit": k.emriBiznesit,
              Shkurtesa: k.shkurtesaPartnerit,
              "NUI / NF / NRTVSH": k.nui + " / " + k.nrf + " / " + k.tvsh,
              "NR. Kontaktit": k.nrKontaktit,
              Email: k.email,
              Adresa:
                k.adresa && k.adresa.trim() !== "" ? k.adresa : "Nuk Ka Adrese",
              "Lloji Partnerit": k.llojiPartnerit,
            }))
        );
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    shfaqPartneret();
  }, [perditeso]);

  const handleEdito = (id) => {
    setId(id);
    setEdito(true);
  };
  const handleEditoMbyll = () => setEdito(false);

  const handleFshij = (id) => {
    setId(id);
    setFshij(true);
  };
  const handleFshijMbyll = () => setFshij(false);

  const handleClose = () => {
    setShto(false);
  };
  const handleShow = () => setShto(true);

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Kalkulant", "Komercialist"]} />
      <NavBar />

      <div className="containerDashboardP">
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}
        {shto && (
          <ShtoPartnerin
            largo={handleClose}
            id={id}
            shfaqmesazhin={() => setShfaqMesazhin(true)}
            perditesoTeDhenat={() => setPerditeso(Date.now())}
            setTipiMesazhit={setTipiMesazhit}
            setPershkrimiMesazhit={setPershkrimiMesazhit}
          />
        )}
        {edito && (
          <EditoKompanin
            largo={handleEditoMbyll}
            id={id}
            shfaqmesazhin={() => setShfaqMesazhin(true)}
            perditesoTeDhenat={() => setPerditeso(Date.now())}
            setTipiMesazhit={setTipiMesazhit}
            setPershkrimiMesazhit={setPershkrimiMesazhit}
          />
        )}
        {fshij && (
          <LargoKompanin
            largo={handleFshijMbyll}
            id={id}
            shfaqmesazhin={() => setShfaqMesazhin(true)}
            perditesoTeDhenat={() => setPerditeso(Date.now())}
            setTipiMesazhit={setTipiMesazhit}
            setPershkrimiMesazhit={setPershkrimiMesazhit}
          />
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
            <div className="mt-2">
              <Tabela
                data={partneret}
                tableName="Lista e Partnereve"
                kaButona={true}
                funksionButonShto={() => {
                  handleShow();
                }}
                funksionButonFshij={(e) => {
                  setId(e);
                  handleFshij(e);
                }}
                funksionButonEdit={(e) => {
                  setId(e);
                  handleEdito(e);
                }}
                mosShfaqID={true}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default TabelaEKompanive;
