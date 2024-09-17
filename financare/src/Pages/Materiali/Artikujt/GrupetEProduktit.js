import NavBar from "../../../Components/TeTjera/layout/NavBar";
import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import "../../Styles/DizajniPergjithshem.css";
import axios from "axios";
import Button from "react-bootstrap/Button";
import ShtoGrupetEProduktit from "../../../Components/Materiali/Artikujt/GrupetEProduktit/ShtoGrupetEProduktit";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faPenToSquare,
  faPlus,
  faClose,
} from "@fortawesome/free-solid-svg-icons";
import EditoGrupetEProduktit from "../../../Components/Materiali/Artikujt/GrupetEProduktit/EditoGrupetEProduktit";
import LargoGrupetEProduktit from "../../../Components/Materiali/Artikujt/GrupetEProduktit/LargoGrupetEProduktit";
import { TailSpin } from "react-loader-spinner";
import { MDBBtn, MDBTable, MDBTableBody, MDBTableHead } from "mdb-react-ui-kit";
import { Link } from "react-router-dom";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import Titulli from "../../../Components/TeTjera/Titulli";

function GrupetEProduktit(props) {
  const [njesiteMatese, setNjesiteMatese] = useState([]);
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
    const shfaqNjesiteMatese = async () => {
      try {
        setLoading(true);
        const GrupetEProduktit = await axios.get(
          "https://localhost:7285/api/GrupiProduktit/shfaqGrupetEProduktit",
          authentikimi
        );

        setNjesiteMatese(
          GrupetEProduktit.data.map((k) => ({
            ID: k.idGrupiProduktit,
            "Grupi i Produktit": k.grupiIProduktit,
            "Totali Produkteve": k.totaliProdukteve,
          }))
        );
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    shfaqNjesiteMatese();
  }, [perditeso]);

  const handleClose = () => {
    setShto(false);
  };
  const handleShow = () => setShto(true);

  const handleEdito = (id) => {
    setEdito(true);
    setId(id);
  };
  const handleEditoMbyll = () => setEdito(false);

  const handleFshij = (id) => {
    setFshij(true);
    setId(id);
  };
  const handleFshijMbyll = () => setFshij(false);

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher"]} />

      <Helmet>
        <title>Grupet E Produktit | FinanCare</title>
      </Helmet>
      <Titulli titulli="Grupet e Produktit" />
      <NavBar />

      <div className="containerDashboardP">
        {shto && (
          <ShtoGrupetEProduktit
            shfaq={handleShow}
            largo={handleClose}
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
          <EditoGrupetEProduktit
            largo={handleEditoMbyll}
            id={id}
            shfaqmesazhin={() => setShfaqMesazhin(true)}
            perditesoTeDhenat={() => setPerditeso(Date.now())}
            setTipiMesazhit={setTipiMesazhit}
            setPershkrimiMesazhit={setPershkrimiMesazhit}
          />
        )}
        {fshij && (
          <LargoGrupetEProduktit
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
                data={njesiteMatese}
                tableName="Lista e Grupeve te Produktit"
                kaButona={true}
                funksionButonShto={handleShow}
                funksionButonEdit={(e) => {
                  setId(e);
                  handleEdito(e);
                }}
                funksionButonFshij={(e) => {
                  setId(e);
                  handleFshij(e);
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

export default GrupetEProduktit;
