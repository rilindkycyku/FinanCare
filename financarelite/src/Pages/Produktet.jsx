import { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import PageTitle from "../Components/PageTitle";
import ShtoProduktin from "../Components/ShtoProduktin";
import Tabela from "../Components/Tabela/Tabela";
import { getAll, remove, STORES } from "../lib/db";
import { useDialog } from "../Context/DialogContext";
import "./Styles/PremiumTheme.css";
import "./Styles/DizajniPergjithshem.css";

function hasPrice(p) {
  return p.qmimiShites !== "" && p.qmimiShites != null;
}

// Same idea as the invoice's item table: a column nothing fills in is a column worth leaving
// out. Businesses that don't use product codes, or that set every price on the invoice itself,
// get a list of what they actually track instead of one full of dashes.
function toRow(p, { showCodes, showPrices }) {
  return {
    ID: p.id,
    Emri: p.emriProduktit,
    ...(showCodes ? { "Barkodi / Kodi": [p.barkodi, p.kodiProduktit].filter(Boolean).join(" / ") || "-" } : {}),
    Njesia: p.emriNjesiaMatese || "-",
    "TVSH %": p.llojiTVSH,
    ...(showPrices ? { "Çmimi €": hasPrice(p) ? parseFloat(p.qmimiShites).toFixed(2) : "-" } : {}),
  };
}

function Produktet() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const dialog = useDialog();

  const load = () => getAll(STORES.products).then(setProducts);

  const columns = {
    showCodes: products.some((p) => p.barkodi || p.kodiProduktit),
    showPrices: products.some(hasPrice),
  };

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
        data={products.map((p) => toRow(p, columns))}
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

      <Footer />
    </>
  );
}

export default Produktet;
