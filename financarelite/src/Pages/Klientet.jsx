import { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import PageTitle from "../Components/PageTitle";
import ShtoKlientin from "../Components/ShtoKlientin";
import Tabela from "../Components/Tabela/Tabela";
import { getAll, remove, STORES } from "../lib/db";
import { useDialog } from "../Context/DialogContext";
import "./Styles/PremiumTheme.css";
import "./Styles/DizajniPergjithshem.css";

function toRow(c) {
  return {
    ID: c.id,
    Emri: c.emriBiznesit,
    Lloji: c.llojiPartnerit === "biznes" ? "Biznesor" : "Privat",
    "NUI / NF": [c.nui, c.nrf].filter(Boolean).join(" / ") || "-",
    Adresa: c.adresa || "-",
    Kontakti: [c.nrKontaktit, c.email].filter(Boolean).join(" - ") || "-",
  };
}

function Klientet() {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const dialog = useDialog();

  const load = () => getAll(STORES.clients).then(setClients);

  useEffect(() => {
    load();
  }, []);

  const onSaved = () => {
    setShowModal(false);
    setEditing(null);
    load();
  };

  const onEdit = (id) => {
    const client = clients.find((c) => c.id === id);
    setEditing(client || null);
    setShowModal(true);
  };

  const onDelete = async (id) => {
    if (!(await dialog.confirm("Ta fshij këtë klient?", { title: "Fshi Klientin" }))) return;
    await remove(STORES.clients, id);
    load();
  };

  return (
    <>
      <PageTitle title="Klientët" />
      <NavBar />
      <Tabela
        data={clients.map(toRow)}
        tableName="Klientët"
        kaButona
        funksionButonShto={() => {
          setEditing(null);
          setShowModal(true);
        }}
        funksionButonEdit={onEdit}
        funksionButonFshij={onDelete}
        mosShfaqID
      />

      <ShtoKlientin
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

export default Klientet;
