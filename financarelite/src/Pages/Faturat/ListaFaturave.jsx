import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../Components/NavBar";
import PageTitle from "../../Components/PageTitle";
import Tabela from "../../Components/Tabela/Tabela";
import { getAll, remove, STORES } from "../../lib/db";
import { calcInvoiceTotals } from "../../lib/invoiceCalc";
import { DOCUMENT_TYPES } from "../../lib/options";

function toRow(inv) {
  const totals = calcInvoiceTotals(inv.items, inv.transporti);
  const dokumenti = DOCUMENT_TYPES.find((d) => d.value === inv.llojiDokumentit) || DOCUMENT_TYPES[0];
  return {
    ID: inv.id,
    "Nr. Faturës": inv.nrFatures,
    Lloji: dokumenti.label,
    Klienti: inv.klienti?.emriBiznesit || "-",
    Data: inv.dataRegjistrimit,
    "Totali €": totals.totaliFinal.toFixed(2),
  };
}

function ListaFaturave() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);

  const load = () =>
    getAll(STORES.invoices).then((list) => setInvoices(list.sort((a, b) => (b.dataRegjistrimit || "").localeCompare(a.dataRegjistrimit || ""))));

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
      <Tabela
        data={invoices.map(toRow)}
        tableName="Faturat"
        kaButona
        funksionButonShto={() => navigate("/faturat/re")}
        funksionShfaqFature={(id) => navigate(`/faturat/${id}`)}
        funksionButonFshij={onDelete}
        dateField="Data"
        mosShfaqID
      />
    </>
  );
}

export default ListaFaturave;
