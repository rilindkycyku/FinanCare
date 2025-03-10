import NavBar from "../../../Components/TeTjera/layout/NavBar";
import { useEffect, useState } from "react";
import "../../Styles/DizajniPergjithshem.css";
import axios from "axios";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { TailSpin } from "react-loader-spinner";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import ShtoLlogarin from "../../../Components/Gjenerale/TeDhenat/LlogaritBankareBiznesit/ShtoLlogarin";
import EditoLlogarin from "../../../Components/Gjenerale/TeDhenat/LlogaritBankareBiznesit/EditoLlogarin";
import LargoLlogarin from "../../../Components/Gjenerale/TeDhenat/LlogaritBankareBiznesit/LargoLlogarin";

function LlogaritBankareBiznesit(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
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
          `${API_BASE_URL}/api/TeDhenatBiznesit/ShfaqLlogaritEBiznesit`,
          authentikimi
        );

        setBankat(
          Bankat.data.map((k) => ({
            ID: k.idLlogariaBankare,
            "Emri Bankes": k.banka && k.banka.emriBankes,
            "Nr. Llogaris": k.numriLlogaris,
            "Adresa Bankes": k.adresaBankes,
            Valuta: k.valuta,
            "Lloji Llogaris": k.banka && k.banka.lokacioniBankes,
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
      <NavBar />

      <div className="containerDashboardP">
        {shto && (
          <ShtoLlogarin
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
          <EditoLlogarin
            largo={handleEditoMbyll}
            id={id}
            shfaqmesazhin={() => setShfaqMesazhin(true)}
            perditesoTeDhenat={() => setPerditeso(Date.now())}
            setTipiMesazhit={setTipiMesazhit}
            setPershkrimiMesazhit={setPershkrimiMesazhit}
          />
        )}
        {fshij && (
          <LargoLlogarin
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
                tableName="Llogarit Bankare te Biznesit"
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

export default LlogaritBankareBiznesit;
