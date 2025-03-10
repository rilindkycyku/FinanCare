import NavBar from "../../../Components/TeTjera/layout/NavBar";
import { useEffect, useState } from "react";
import "../../Styles/DizajniPergjithshem.css";
import axios from "axios";
import ShtoRolin from "../../../Components/Gjenerale/Stafi/users/Rolet/ShtoRolin";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import LargoRolin from "../../../Components/Gjenerale/Stafi/users/Rolet/LargoRolin";
import { TailSpin } from "react-loader-spinner";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";

function TabelaEKompanive(props) {
  const [rolet, setRolet] = useState([]);
  const [perditeso, setPerditeso] = useState("");
  const [shto, setShto] = useState(false);
  const [fshij, setFshij] = useState(false);
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [emriRolit, setEmriRolit] = useState(0);
  const [loading, setLoading] = useState(false);

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const vendosRolet = async () => {
      try {
        setLoading(true);
        const roli = await axios.get(
          `${API_BASE_URL}/api/Authenticate/shfaqRolet`,
          authentikimi
        );

        setRolet(
          roli.data
            .filter((roli) => roli.name != "User")
            .map((k) => ({
              ID: k.name,
              Roli: k.name,
              "Totali Perdorueseve ne kete Rol":
                k.totaliPerdoruesve !== null
                  ? k.totaliPerdoruesve
                  : "Nuk Ka asnje perdorues ne kete role",
            }))
        );
        console.log(roli.data)
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    vendosRolet();
  }, [perditeso]);

  const handleClose = () => {
    setShto(false);
  };
  const handleShow = () => setShto(true);

  const handleFshij = (emri) => {
    setFshij(true);
    setEmriRolit(emri);
  };
  const handleFshijMbyll = () => setFshij(false);

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher"]} />
      <NavBar />

      <div className="containerDashboardP">
        {shto && (
          <ShtoRolin
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
          <LargoRolin
            largo={handleFshijMbyll}
            emriRolit={emriRolit}
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
                data={rolet}
                tableName="Lista e Roleve ne Sistem"
                kaButona={true}
                funksionButonShto={() => handleShow()}
                funksionButonFshij={(e) => {
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

export default TabelaEKompanive;
