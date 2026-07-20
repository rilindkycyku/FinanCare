import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Button } from "react-bootstrap";
import { Plus, Eye, Trash2 } from "lucide-react";
import NavBar from "../../Components/NavBar";
import PageTitle from "../../Components/PageTitle";
import { getAll, remove, STORES } from "../../lib/db";
import { calcInvoiceTotals } from "../../lib/invoiceCalc";
import "../Styles/ListaFaturave.css";

function ListaFaturave() {
  const [invoices, setInvoices] = useState([]);

  const load = () => getAll(STORES.invoices).then((list) => setInvoices(list.sort((a, b) => (b.dataRegjistrimit || "").localeCompare(a.dataRegjistrimit || ""))));

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!confirm("Ta fshij këtë faturë?")) return;
    await remove(STORES.invoices, id);
    load();
  };

  return (
    <>
      <PageTitle title="Faturat" />
      <NavBar />
      <div className="containerDashboardP">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="titulliPerditeso mb-0">Faturat</h1>
          <Link to="/faturat/re">
            <Button className="btn-primary">
              <Plus size={16} className="me-1" /> Faturë e Re
            </Button>
          </Link>
        </div>

        {invoices.length === 0 ? (
          <p className="text-muted">Nuk ka fatura ende.</p>
        ) : (
          <Table responsive className="align-middle">
            <thead>
              <tr>
                <th>Nr. Faturës</th>
                <th>Klienti</th>
                <th>Data</th>
                <th>Totali €</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const totals = calcInvoiceTotals(inv.items, inv.transporti);
                return (
                  <tr key={inv.id}>
                    <td>{inv.nrFatures}</td>
                    <td>{inv.klienti?.emriBiznesit}</td>
                    <td>{inv.dataRegjistrimit ? new Date(inv.dataRegjistrimit).toLocaleDateString("en-GB") : "-"}</td>
                    <td>{totals.totaliFinal.toFixed(2)}</td>
                    <td className="text-end">
                      <Link to={`/faturat/${inv.id}`}>
                        <Button variant="outline-light" size="sm" className="me-2">
                          <Eye size={14} />
                        </Button>
                      </Link>
                      <Button variant="outline-danger" size="sm" onClick={() => onDelete(inv.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </div>
    </>
  );
}

export default ListaFaturave;
