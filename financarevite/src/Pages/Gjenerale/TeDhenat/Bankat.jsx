import NavBar from "../../../Components/TeTjera/layout/NavBar";
import { useEffect, useState } from "react";
import "../../Styles/DizajniPergjithshem.css";
import axios from "axios";
import ShtoBanken from "../../../Components/Gjenerale/TeDhenat/Bankat/ShtoBanken";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import EditoBanken from "../../../Components/Gjenerale/TeDhenat/Bankat/EditoBanken";
import LargoBanken from "../../../Components/Gjenerale/TeDhenat/Bankat/LargoBanken";
import { TailSpin } from "react-loader-spinner";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";

function Bankat(props) {
  const [bankat, setBankat] = useState([]);
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
    const shfaqbankat = async () => {
      try {
        setLoading(true);
        const Bankat = await axios.get(
          "https://localhost:7285/api/TeDhenatBiznesit/ShfaqBankat",
          authentikimi
        );

        setBankat(
          Bankat.data.map((k) => ({
            ID: k.bankaID,
            "Emri Bankes": k.emriBankes,
            "Lokacioni Bankes": k.lokacioniBankes,
          }))
        );
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    shfaqbankat();
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
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Financa", "Burime Njerzore"]} />
      <NavBar />

      <div className="containerDashboardP">
        {shto && (
          <ShtoBanken
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
          <EditoBanken
            largo={handleEditoMbyll}
            id={id}
            shfaqmesazhin={() => setShfaqMesazhin(true)}
            perditesoTeDhenat={() => setPerditeso(Date.now())}
            setTipiMesazhit={setTipiMesazhit}
            setPershkrimiMesazhit={setPershkrimiMesazhit}
          />
        )}
        {fshij && (
          <LargoBanken
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
                data={bankat}
                tableName="Lista e Bankave ne Sistem"
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

export default Bankat;
