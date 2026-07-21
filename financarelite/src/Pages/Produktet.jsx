import { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import PageTitle from "../Components/PageTitle";
import ShtoProduktin from "../Components/ShtoProduktin";
import Tabela from "../Components/Tabela/Tabela";
import { getAll, remove, STORES } from "../lib/db";
import { useDialog } from "../Context/DialogContext";
import "./Styles/PremiumTheme.css";
import "./Styles/DizajniPergjithshem.css";

function toRow(p) {
  return {
    ID: p.id,
    Emri: p.emriProduktit,
    "Barkodi / Kodi": [p.barkodi, p.kodiProduktit].filter(Boolean).join(" / ") || "-",
    Njesia: p.emriNjesiaMatese || "-",
    "TVSH %": p.llojiTVSH,
    "Çmimi €": parseFloat(p.qmimiShites || 0).toFixed(2),
  };
}

function Produktet() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const dialog = useDialog();

  const load = () => getAll(STORES.products).then(setProducts);

  useEffect(() => {
    load();
  }, []);

  const onSaved = () => {
    setShowModal(false);
    setEditing(null);
    load();
  };

  const onEdit = (id) => {
    const product = products.find((p) => p.id === id);
    setEditing(product || null);
    setShowModal(true);
  };

  const onDelete = async (id) => {
    if (!(await dialog.confirm("Ta fshij këtë produkt?", { title: "Fshi Produktin" }))) return;
    await remove(STORES.products, id);
    load();
  };

  return (
    <>
      <PageTitle title="Produktet" />
      <NavBar />
      <Tabela
        data={products.map(toRow)}
        tableName="Produktet"
        kaButona
        funksionButonShto={() => {
          setEditing(null);
          setShowModal(true);
        }}
        funksionButonEdit={onEdit}
        funksionButonFshij={onDelete}
        mosShfaqID
      />

      <ShtoProduktin
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditing(null);
        }}
        onSaved={onSaved}
        initial={editing}
      />
    </>
  );
}

export default Produktet;
