import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../Components/NavBar";
import PageTitle from "../../Components/PageTitle";
import Tabela from "../../Components/Tabela/Tabela";
import { getAll, put, remove, STORES } from "../../lib/db";
import { calcInvoiceTotals } from "../../lib/invoiceCalc";
import { DEFAULT_DOCUMENT_TYPES } from "../../lib/options";
import { useDocumentTypes } from "../../lib/useConfigLists";
import { useDialog } from "../../Context/DialogContext";

// Missing `mbyllur` (invoices saved before this field existed) is treated as closed, so
// nothing that was already issued suddenly becomes silently editable.
function esteMbyllur(inv) {
  return inv.mbyllur !== false;
}

function toRow(inv, documentTypes) {
  const totals = calcInvoiceTotals(inv.items, inv.transporti);
  const dokumenti = documentTypes.find((d) => d.value === inv.llojiDokumentit) || documentTypes[0];
  return {
    ID: inv.id,
    "Nr. Faturës": inv.nrFatures,
    Lloji: dokumenti.label,
    Klienti: inv.klienti?.emriBiznesit || "-",
    Data: inv.dataRegjistrimit,
    "Totali €": totals.totaliFinal.toFixed(2),
    Statusi: esteMbyllur(inv) ? "I Mbyllur" : "I Hapur",
  };
}

function ListaFaturave() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const dialog = useDialog();
  const documentTypesLoaded = useDocumentTypes();
  const documentTypes = documentTypesLoaded.length > 0 ? documentTypesLoaded : DEFAULT_DOCUMENT_TYPES;

  const load = () =>
    getAll(STORES.invoices).then((list) => setInvoices(list.sort((a, b) => (b.dataRegjistrimit || "").localeCompare(a.dataRegjistrimit || ""))));

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!(await dialog.confirm("Ta fshij këtë faturë?", { title: "Fshi Faturën" }))) return;
    await remove(STORES.invoices, id);
    load();
  };

  const onEdit = async (id) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;
    if (esteMbyllur(inv)) {
      await dialog.alert("Kjo faturë është e mbyllur. Ndryshoni statusin në 'e hapur' për ta redaktuar.", {
        title: "Fatura e Mbyllur",
      });
      return;
    }
    navigate(`/faturat/${id}/edit`);
  };

  const onNdryshoStatusin = async (id) => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return;
    const mbyllurTani = esteMbyllur(inv);
    const mesazhi = mbyllurTani
      ? "Ta hap këtë faturë për redaktim?"
      : "Ta mbyll këtë faturë? Nuk do të mund ta redaktoni derisa ta hapni sërish.";
    if (!(await dialog.confirm(mesazhi, { title: "Ndrysho Statusin" }))) return;
    await put(STORES.invoices, { ...inv, mbyllur: !mbyllurTani });
    load();
  };

  return (
    <>
      <PageTitle title="Faturat" />
      <NavBar />
      <Tabela
        data={invoices.map((inv) => toRow(inv, documentTypes))}
        tableName="Faturat"
        kaButona
        funksionButonShto={() => navigate("/faturat/re")}
        funksionShfaqFature={(id) => navigate(`/faturat/${id}`)}
        funksionButonEdit={onEdit}
        funksionButonFshij={onDelete}
        funksionNdryshoStatusin={onNdryshoStatusin}
        funksionEshteEditimDisabled={(id) => esteMbyllur(invoices.find((i) => i.id === id) || {})}
        dateField="Data"
        filterField="Lloji"
        mosShfaqID
      />
    </>
  );
}

export default ListaFaturave;
