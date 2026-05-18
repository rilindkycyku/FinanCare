import { useEffect, useMemo, useState } from "react";
import NavBar from "../../../Components/TeTjera/layout/NavBar";
import "../../Styles/DizajniPergjithshem.css";
import axios from "axios";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { TailSpin } from "react-loader-spinner";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";
import ShtoAfatinESkadimit from "../../../Components/Njoftimet/Artikujt/AfatetESkadimit/ShtoAfatinESkadimit";
import LargoAfatinESkadimit from "../../../Components/Njoftimet/Artikujt/AfatetESkadimit/LargoAfatinESkadimit";

function TabelaEKategorive(props) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
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

    const authentikimi = useMemo(() => ({
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  }), [getToken]);

  useEffect(() => {
    const shfaqNjesiteMatese = async () => {
      try {
        setLoading(true);
        const njesiaMatese = await axios.get(
          `${API_BASE_URL}/api/Njoftimet/ShfaqAfatetESkadimit`,
          authentikimi
        );
        setNjesiteMatese(
          njesiaMatese.data.map((k) => ({
            ID: k.id,
            "Produkti": k.emriProduktit,
            "Data Skadimit": new Date(k.dataSkadimit).toLocaleDateString('en-GB'),
            "Personi Pergjegjes": k.emri + " " + k.mbiemri,
            "Data Regjistrimit": k.dataRegjistrimit ? new Date(k.dataRegjistrimit).toLocaleDateString('en-GB') : "N/A",
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
    setId(id);
    setEdito(true);
  };
  const handleEditoMbyll = () => setEdito(false);

  const handleFshij = (id) => {
    setId(id);
    setFshij(true);
  };
  const handleFshijMbyll = () => setFshij(false);

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Pergjegjes i Porosive", "Puntor i Thjeshte", "Komercialist", "Kalkulant", "1 Euro Menaxher", "1 Euro Staff"]} />
      <NavBar />

      <div className="containerDashboardP">
        {shto && (
          <ShtoAfatinESkadimit
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
        {fshij && (
          <LargoAfatinESkadimit
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
              color="#10b981"
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
                tableName="Lista e Afateve te Skadimit"
                kaButona={true}
                funksionButonShto={handleShow}
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

export default TabelaEKategorive;
