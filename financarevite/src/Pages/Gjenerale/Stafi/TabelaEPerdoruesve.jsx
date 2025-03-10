import NavBar from "../../../Components/TeTjera/layout/NavBar";
import { useEffect, useState } from "react";
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

function TabelaEPerdoruesve() {
  const [perdoruesit, setPerdoruesit] = useState([]);
  const [perditeso, setPerditeso] = useState("");
  const [shto, setShto] = useState(false);
  const [edito, setEdito] = useState(false);
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

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Burime Njerzore"]} />
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
