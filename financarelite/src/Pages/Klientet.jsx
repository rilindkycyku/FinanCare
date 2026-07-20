import { useEffect, useState } from "react";
import { Table, Button, Badge } from "react-bootstrap";
import { Plus, Pencil, Trash2 } from "lucide-react";
import NavBar from "../Components/NavBar";
import PageTitle from "../Components/PageTitle";
import ShtoKlientin from "../Components/ShtoKlientin";
import { getAll, remove, STORES } from "../lib/db";
import "./Styles/PremiumTheme.css";
import "./Styles/DizajniPergjithshem.css";

function Klientet() {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => getAll(STORES.clients).then(setClients);

  useEffect(() => {
    load();
  }, []);

  const onSaved = () => {
    setShowModal(false);
    setEditing(null);
    load();
  };

  const onEdit = (client) => {
    setEditing(client);
    setShowModal(true);
  };

  const onDelete = async (id) => {
    if (!confirm("Ta fshij këtë klient?")) return;
    await remove(STORES.clients, id);
    load();
  };

  return (
    <>
      <PageTitle title="Klientët" />
      <NavBar />
      <div className="containerDashboardP">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="titulliPerditeso mb-0">Klientët</h1>
          <Button
            className="btn-primary"
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
          >
            <Plus size={16} className="me-1" /> Shto Klient
          </Button>
        </div>

        {clients.length === 0 ? (
          <p className="text-muted">Nuk ka klientë ende. Shtoni të parin.</p>
        ) : (
          <Table responsive className="align-middle">
            <thead>
              <tr>
                <th>Emri</th>
                <th>Lloji</th>
                <th>NUI / NF</th>
                <th>Adresa</th>
                <th>Kontakti</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>{c.emriBiznesit}</td>
                  <td>
                    <Badge bg={c.llojiPartnerit === "biznes" ? "info" : "secondary"}>
                      {c.llojiPartnerit === "biznes" ? "Biznesor" : "Privat"}
                    </Badge>
                  </td>
                  <td>
                    {c.nui || "-"} {c.nrf ? `/ ${c.nrf}` : ""}
                  </td>
                  <td>{c.adresa}</td>
                  <td>
                    {c.nrKontaktit} {c.email ? `- ${c.email}` : ""}
                  </td>
                  <td className="text-end">
                    <Button variant="outline-light" size="sm" className="me-2" onClick={() => onEdit(c)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => onDelete(c.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <ShtoKlientin
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

export default Klientet;
