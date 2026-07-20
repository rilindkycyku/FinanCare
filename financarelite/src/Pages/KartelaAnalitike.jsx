import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Table } from "react-bootstrap";
import Select from "react-select";
import NavBar from "../Components/NavBar";
import PageTitle from "../Components/PageTitle";
import { getAll, STORES } from "../lib/db";
import { calcInvoiceTotals } from "../lib/invoiceCalc";
import { DOCUMENT_TYPES } from "../lib/options";
import { darkSelectStyles } from "../lib/darkSelectStyles";

/** A per-client invoice statement — every invoice issued to one client with a total.
 * FinanCareLite has no payments-received tracking, so unlike FinanCare's Kartela Financiare
 * (a real debit/credit ledger with a running balance) this is a simple statement: pick a
 * client, see what they've been invoiced. Invoices only carry a snapshot of the client's data
 * (no foreign key back to the client record), so matching is done by business name. */
function KartelaAnalitike() {
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");

  useEffect(() => {
    Promise.all([getAll(STORES.clients), getAll(STORES.invoices)]).then(([clientList, invoiceList]) => {
      setClients(clientList);
      setInvoices(invoiceList);
    });
  }, []);

  const clientOptions = useMemo(
    () => clients.map((c) => ({ value: c.id, label: c.emriBiznesit })),
    [clients]
  );
  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  const rows = useMemo(() => {
    if (!selectedClient) return [];
    const emri = (selectedClient.emriBiznesit || "").trim().toLowerCase();
    return invoices
      .filter((inv) => (inv.klienti?.emriBiznesit || "").trim().toLowerCase() === emri)
      .map((inv) => {
        const dokumenti = DOCUMENT_TYPES.find((d) => d.value === inv.llojiDokumentit) || DOCUMENT_TYPES[0];
        const totals = calcInvoiceTotals(inv.items, inv.transporti);
        return { inv, dokumenti, totali: totals.totaliFinal };
      })
      .sort((a, b) => (a.inv.dataRegjistrimit || "").localeCompare(b.inv.dataRegjistrimit || ""));
  }, [invoices, selectedClient]);

  const shuma = rows.reduce((sum, r) => sum + r.totali, 0);

  return (
    <>
      <PageTitle title="Kartela Analitike" />
      <NavBar />
      <div className="containerDashboardP">
        <h1 className="titulliPerditeso">Kartela Analitike</h1>
        <p className="text-muted mb-4">
          Zgjidhni një klient për të parë të gjitha faturat e lëshuara për të, me totalin përkatës.
        </p>

        <div style={{ maxWidth: 420 }} className="mb-4">
          <Select
            styles={darkSelectStyles}
            classNamePrefix="react-select"
            options={clientOptions}
            placeholder="— zgjidh klientin —"
            value={clientOptions.find((o) => o.value === selectedClientId) || null}
            onChange={(opt) => setSelectedClientId(opt?.value || "")}
          />
        </div>

        {selectedClient && (
          <>
            {rows.length === 0 ? (
              <p className="text-muted">Ky klient nuk ka ende asnjë faturë.</p>
            ) : (
              <Table responsive className="align-middle">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Nr. Faturës</th>
                    <th>Lloji</th>
                    <th>Totali €</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ inv, dokumenti, totali }) => (
                    <tr key={inv.id}>
                      <td>{new Date(inv.dataRegjistrimit).toLocaleDateString("en-GB")}</td>
                      <td>
                        <Link to={`/faturat/${inv.id}`}>{inv.nrFatures}</Link>
                      </td>
                      <td>{dokumenti.label}</td>
                      <td>{totali.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-end fw-bold">
                      Totali
                    </td>
                    <td className="fw-bold">{shuma.toFixed(2)} €</td>
                  </tr>
                </tfoot>
              </Table>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default KartelaAnalitike;
