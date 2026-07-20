import { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import { Plus, Pencil, Trash2 } from "lucide-react";
import NavBar from "../Components/NavBar";
import PageTitle from "../Components/PageTitle";
import ShtoProduktin from "../Components/ShtoProduktin";
import { getAll, remove, STORES } from "../lib/db";
import "./Styles/PremiumTheme.css";
import "./Styles/DizajniPergjithshem.css";

function Produktet() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => getAll(STORES.products).then(setProducts);

  useEffect(() => {
    load();
  }, []);

  const onSaved = () => {
    setShowModal(false);
    setEditing(null);
    load();
  };

  const onDelete = async (id) => {
    if (!confirm("Ta fshij këtë produkt?")) return;
    await remove(STORES.products, id);
    load();
  };

  return (
    <>
      <PageTitle title="Produktet" />
      <NavBar />
      <div className="containerDashboardP">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="titulliPerditeso mb-0">Produktet</h1>
          <Button
            className="btn-primary"
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
          >
            <Plus size={16} className="me-1" /> Shto Produkt
          </Button>
        </div>

        {products.length === 0 ? (
          <p className="text-muted">
            Nuk ka produkte ende. Mund t'i shtoni këtu për t'i ripërdorur në fatura, ose shtoni artikuj ad-hoc direkt
            gjatë krijimit të një fature.
          </p>
        ) : (
          <Table responsive className="align-middle">
            <thead>
              <tr>
                <th>Emri</th>
                <th>Barkodi / Kodi</th>
                <th>Njësia</th>
                <th>TVSH</th>
                <th>Çmimi €</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.emriProduktit}</td>
                  <td>
                    {p.barkodi} {p.kodiProduktit ? `/ ${p.kodiProduktit}` : ""}
                  </td>
                  <td>{p.emriNjesiaMatese}</td>
                  <td>{p.llojiTVSH}%</td>
                  <td>{parseFloat(p.qmimiShites || 0).toFixed(2)}</td>
                  <td className="text-end">
                    <Button
                      variant="outline-light"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setEditing(p);
                        setShowModal(true);
                      }}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => onDelete(p.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

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
