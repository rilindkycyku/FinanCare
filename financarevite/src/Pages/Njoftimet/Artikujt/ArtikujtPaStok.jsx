import NavBar from "../../../Components/TeTjera/layout/NavBar";
import { useState, useEffect } from "react";
import "../../Styles/ProductTables.css";
import axios from "axios";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import { TailSpin } from "react-loader-spinner";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";

const ProductTables = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  const [produkti, setProdukti] = useState([]);
  const [id, setId] = useState();
  const [perditeso, setPerditeso] = useState("");
  const [show, setShow] = useState(false);
  const [edito, setEdito] = useState(false);
  const [fshij, setFshij] = useState(false);
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [loading, setLoading] = useState(false);

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
          `${API_BASE_URL}/api/Njoftimet/ShfaqProduktetPaStok`,
          authentikimi
        );
        console.log(produkti.data);
        setProdukti(
          produkti.data.map((k) => ({
            ID: k.produktiID,
            "Barkodi / Kodi Produktit": k.barkodi + " / " + k.kodiProduktit,
            "Emri i Produktit": k.emriProduktit,
            Partneri: k.emriBiznesit,
            "Grupi i Produktit": k.grupiIProduktit,
            "Sasia ne Stok": k.sasiaNeStok,
            "Njesia Matese": k.emriNjesiaMatese,
          }))
        );
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    shfaqProduktet();
  }, [perditeso]);

  return (
    <>
     <KontrolloAksesinNeFaqe
        roletELejuara={["Menaxher", "Puntor i Thjeshte", "Pergjegjes i Porosive"]}
      />
      <NavBar />

      <div className="containerDashboardP">
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
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
                data={produkti}
                tableName="Lista e Artikujve Pa Stok"
                kaButona={false}
                mosShfaqID={true}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ProductTables;
