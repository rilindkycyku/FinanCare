import { useEffect, useState } from "react";
import axios from "axios";
import EditoProduktin from "./EditoProduktin";
import ShtoProduktin from "./ShtoProduktin";
import Mesazhi from "../../../../components/Mesazhi";
import { TailSpin } from "react-loader-spinner";
import LargoProduktin from "./LargoProduktin";
import EditoStokunQmimin from "./EditoStokunQmimin";
import Tabela from "../../../../components/Tabela/Tabela";

function TemplateTabela() {
  const [produktet, setProduktet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [edito, setEdito] = useState(false);
  const [editoStokunQmimin, setEditoStokunQmimin] = useState(false);
  const [id, setId] = useState(0);
  const [shto, setShto] = useState(false);
  const [shfaqMesazhin, setShfaqMesazhin] = useState(false);
  const [tipiMesazhit, setTipiMesazhit] = useState("");
  const [pershkrimiMesazhit, setPershkrimiMesazhit] = useState("");
  const [fshij, setFshij] = useState(false);
  const [produktIdToDelete, setProduktIdToDelete] = useState(null);

  const [perditeso, setPerditeso] = useState(Date.now());

  const getToken = localStorage.getItem("token");

  const authentikimi = {
    headers: {
      Authorization: `Bearer ${getToken}`,
    },
  };

  useEffect(() => {
    const fetchProduktet = async () => {
      try {
        const response = await axios.get(
          "https://localhost:7251/api/Produktet/Produkti/ShfaqProduktet",
          authentikimi
        );
        setProduktet(
          response.data.map((k) => ({
            ID: k.produktiId,
            "Emri i Produktit": k.emriProduktit,
            Pershkrimi: k.pershkrimi
              ? '<i class="fas fa-check" style="color: green"></i>'
              : '<i class="fas fa-times" style="color: red"></i>',
            "Foto Produktit":
              '<img width="50" alt="" src="' +
              process.env.PUBLIC_URL +
              "/img/produktet/" +
              k.fotoProduktit +
              '" />',
            Kompania: k.emriKompanis,
            Kategoria: k.llojiKategoris,
            "Lloji TVSH-s": k.llojiTVSH,
            "Sasia në Stok": k.sasiaNeStok,
            "Çmimi €": parseFloat(k.qmimiProduktit).toFixed(2),
          }))
        );

        console.log(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchProduktet();
  }, [perditeso]);

  const handleInputChange = (e) => {
    const value = e.target.value.toLowerCase();
    setInputValue(value);
    const filtered = produktet.filter((item) =>
      item.emriProduktit.toLowerCase().includes(value)
    );
    setProduktetEFiltruara(filtered);
  };

  const handleEdito = (id) => {
    setEdito(true);
    setId(id);
  };

  const handleEditoMbyll = () => {
    setEdito(false);
    setId(0);
  };

  const handleClose = () => {
    setShto(false);
  };

  const handleShow = () => setShto(true);

  const handleFshij = (produktId) => {
    setProduktIdToDelete(produktId);
    setFshij(true);
  };

  const handleEditoStokunQmimin = (id) => {
    setEditoStokunQmimin(true);
    setId(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `https://localhost:7251/api/Produktet/Produkti/LargoProduktin/${produktIdToDelete}`,
        authentikimi
      );
      setFshij(false);
      setProduktIdToDelete(null);
      setPerditeso(Date.now());
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleCloseLargoModal = () => {
    setFshij(false);
    setProduktIdToDelete(null);
  };

  return (
    <div>
      {edito && (
        <EditoProduktin
          id={id}
          largo={handleEditoMbyll}
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
      {shto && (
        <ShtoProduktin
          shfaq={handleShow}
          largo={handleClose}
          shfaqmesazhin={() => setShfaqMesazhin(true)}
          perditesoTeDhenat={() => setPerditeso(Date.now())}
          setTipiMesazhit={setTipiMesazhit}
          setPershkrimiMesazhit={setPershkrimiMesazhit}
        />
      )}
      {editoStokunQmimin && (
        <EditoStokunQmimin
          id={id}
          largo={() => setEditoStokunQmimin(false)}
          shfaqmesazhin={() => setShfaqMesazhin(true)}
          perditesoTeDhenat={() => setPerditeso(Date.now())}
          setTipiMesazhit={setTipiMesazhit}
          setPershkrimiMesazhit={setPershkrimiMesazhit}
        />
      )}

      {fshij && (
        <LargoProduktin
          id={produktIdToDelete}
          largo={handleCloseLargoModal}
          perditesoTeDhenat={() => setPerditeso(Date.now())}
          shfaqmesazhin={() => setShfaqMesazhin(true)}
          setTipiMesazhit={setTipiMesazhit}
          setPershkrimiMesazhit={setPershkrimiMesazhit}
          handleDeleteConfirm={handleDeleteConfirm}
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
          <Tabela
            data={produktet}
            tableName="Lista e Produkteve"
            kaButona
            funksionButonShto={() => handleShow()}
            funksionButonFshij={(e) => handleFshij(e)}
            funksionButonEdit={(e) => handleEdito(e)}
            funksioniEditoStokunQmimin={(e) => handleEditoStokunQmimin(e)}
          />
        </>
      )}
    </div>
  );
}

export default TemplateTabela;
