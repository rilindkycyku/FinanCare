import NavBar from "../../../Components/TeTjera/layout/NavBar";
import { useEffect, useState } from "react";
import "../../Styles/DizajniPergjithshem.css";
import axios from "axios";
import ProduktiNeZbritje from "../../../Components/Materiali/Artikujt/Zbritjet/ProduktiNeZbritje";
import { TailSpin } from "react-loader-spinner";
import Mesazhi from "../../../Components/TeTjera/layout/Mesazhi";
import FshijZbritjen from "../../../Components/Materiali/Artikujt/Zbritjet/FshijZbritjen";
import Tabela from "../../../Components/TeTjera/Tabela/Tabela";
import KontrolloAksesinNeFaqe from "../../../Components/TeTjera/KontrolliAksesit/KontrolloAksesinNeFaqe";

function ZbritjetEProduktit(props) {
  const [zbritjet, setZbritjet] = useState([]);
  const [perditeso, setPerditeso] = useState("");
  const [shtoZbritjen, setShtoZbritjen] = useState(false);
  const [mbyllFature, setMbyllFaturen] = useState(true);
  const [id, setId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [fshij, setFshij] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [teDhenatBiznesit, setTedhenatBiznesit] = useState([]);

  const [siteName, setSiteName] = useState("FinanCare");
  const [produktetQmimore, setProduktetQmimore] = useState([]);

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const shfaqZbritjet = async () => {
      try {
        setLoading(true);
        const zbritja = await axios.get(
          "https://localhost:7285/api/ZbritjaQmimitProduktit/shfaqZbritjet",
          authentikimi
        );

        console.log(zbritja.data);

        setZbritjet(
          zbritja.data.map((k, index) => ({
            ID: k.produktiID,
            "Nr. Zbritjes": index + 1,
            "Emri Produktit": k.emriProduktit,
            "Qmimi €": parseFloat(k.qmimiProduktit).toFixed(3),
            "Rabati %": parseFloat(k.rabati).toFixed(2),
            "Qmimi - Rab €": parseFloat(
              k.qmimiProduktit - (k.rabati / 100) * k.qmimiProduktit
            ).toFixed(3),
            "Rabati €": parseFloat((k.rabati / 100) * k.qmimiProduktit).toFixed(
              3
            ),
            "Data e Zbritjes": new Date(k.dataZbritjes).toISOString(),
            "Data e Skadimit": new Date(k.dataSkadimit).toISOString(),
          }))
        );
        setProduktetQmimore(
          zbritja.data.map((k, index) => ({
            name: k.emriProduktit,
            normalPrice: k.qmimiProduktit,
            salePrice: k.qmimiProduktit - (k.rabati / 100) * k.qmimiProduktit,
            barcode: k.barkodi,
            dataZbritjes: new Date(k.dataZbritjes).toLocaleDateString(
              "Gr-br",
              "short"
            ),
            dataSkadimit: new Date(k.dataSkadimit).toLocaleDateString(
              "Gr-br",
              "short"
            ),
          }))
        );
        setLoading(false);

        const teDhenat = await axios.get(
          "https://localhost:7285/api/TeDhenatBiznesit/ShfaqTeDhenat",
          authentikimi
        );
        setSiteName(teDhenat?.data?.emriIBiznesit);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    shfaqZbritjet();
  }, [perditeso]);

  useEffect(() => {
    const currentDate = new Date();
    // Resetting time to midnight to focus only on the date
    currentDate.setHours(0, 0, 0, 0);

    zbritjet.forEach((zbritja) => {
      // Convert "Data e Skadimit" to a Date object
      const dataSkadimit = new Date(zbritja["Data e Skadimit"]);
      dataSkadimit.setHours(0, 0, 0, 0); // Reset to midnight for date-only comparison

      // If the expiration date is earlier than the current date, remove the discount
      if (dataSkadimit.getTime() < currentDate.getTime()) {
        fshijZbritjen(zbritja.ID); // Assuming zbritja.ID is the correct product identifier
      }
    });
  }, [zbritjet]); // zbritjet is the only dependency

  const fshijZbritjen = (id) => {
    axios.delete(
      `https://localhost:7285/api/ZbritjaQmimitProduktit/fshijZbritjenProduktit?id=${id}`,
      authentikimi
    );
    setPerditeso(Date.now());
  };

  const handleFshij = (id) => {
    setFshij(true);
    setId(id);
  };
  const handleFshijMbyll = () => setFshij(false);

  useEffect(() => {
    const vendosTeDhenatBiznesit = async () => {
      try {
        const teDhenat = await axios.get(
          "https://localhost:7285/api/TeDhenatBiznesit/ShfaqTeDhenat",
          authentikimi
        );
        setSiteName(teDhenat?.data?.emriIBiznesit);
      } catch (err) {
        console.log(err);
      }
    };

    vendosTeDhenatBiznesit();
  }, [perditeso]);

  return (
    <>
      <KontrolloAksesinNeFaqe roletELejuara={["Menaxher", "Kalkulant"]} />
      <NavBar />
      <div className="containerDashboardP">
        {shfaqMesazhin && (
          <Mesazhi
            setShfaqMesazhin={setShfaqMesazhin}
            pershkrimi={pershkrimiMesazhit}
            tipi={tipiMesazhit}
          />
        )}
        {fshij && (
          <FshijZbritjen
            largo={handleFshijMbyll}
            fshijZbritjen={() => fshijZbritjen(id)}
            shfaqmesazhin={() => setShfaqMesazhin(true)}
            setTipiMesazhit={setTipiMesazhit}
            setPershkrimiMesazhit={setPershkrimiMesazhit}
            perditeso={() => setPerditeso(Date.now())}
          />
        )}
        {shtoZbritjen && (
          <ProduktiNeZbritje
            mbyllZbritjen={() => setShtoZbritjen(false)}
            shfaq={() => setShtoZbritjen(true)}
            setPerditeso={setPerditeso}
            setTipiMesazhit={setTipiMesazhit}
            setPershkrimiMesazhit={setPershkrimiMesazhit}
            shfaqmesazhin={() => setShfaqMesazhin(true)}
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
          mbyllFature && (
            <>
              <div className="mt-2">
                <Tabela
                  data={zbritjet}
                  tableName="Lista e Zbritjeve"
                  kaButona={true}
                  funksionButonShto={() => setShtoZbritjen(true)}
                  funksionButonFshij={(e) => {
                    setId(e);
                    handleFshij(e);
                  }}
                  startDateField="Data e Zbritjes"
                  endDateField="Data e Skadimit"
                  mosShfaqID={true}
                  butoniShtypZbritjet={true}
                  products={produktetQmimore}
                  storeName={siteName}
                />
              </div>
            </>
          )
        )}
      </div>
    </>
  );
}

export default ZbritjetEProduktit;
