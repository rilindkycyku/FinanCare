import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../../Components/NavBar";
import PageTitle from "../../Components/PageTitle";
import Fatura from "../../Components/Fatura/Fatura";
import ShareQrModal from "../../Components/ShareQrModal";
import PagesaModal from "../../Components/PagesaModal";
import { getOne, getBusinessDetails, getAll, put, STORES } from "../../lib/db";
import { buildFaturaData } from "../../lib/invoiceView";
import { buildInvoiceShareQr } from "../../lib/invoiceQr";
import { QrTooLargeError } from "../../lib/qr";
import { useDialog } from "../../Context/DialogContext";

function FaturaView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState(null);
  const [banks, setBanks] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [shareQr, setShareQr] = useState({ status: "loading", link: null, dataUrl: null });
  const [showShare, setShowShare] = useState(false);
  const [showPagesaModal, setShowPagesaModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const dialog = useDialog();

  useEffect(() => {
    Promise.all([getOne(STORES.invoices, id), getBusinessDetails(), getAll(STORES.banks), getAll(STORES.currencies)]).then(
      ([inv, biz, bankList, currencyList]) => {
        setInvoice(inv || null);
        setTeDhenatBiznesit(biz || {});
        setBanks(bankList);
        setCurrencies(currencyList);
        setLoading(false);
      }
    );
  }, [id]);

  // Computed once the invoice is loaded — reused both to embed a QR directly on the invoice
  // (on-screen + PDF) and to power the "QR / Shpërndaj" modal, so both always match.
  useEffect(() => {
    if (!invoice) return;
    let cancelled = false;
    setShareQr({ status: "loading", link: null, dataUrl: null });
    buildInvoiceShareQr({ teDhenatBiznesit, banks, currencies, invoice })
      .then((qr) => {
        if (!cancelled) setShareQr({ status: "ready", ...qr });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Gabim gjatë krijimit të QR-së:", err);
        setShareQr({ status: err instanceof QrTooLargeError ? "tooLarge" : "failed", link: null, dataUrl: null });
      });
    return () => {
      cancelled = true;
    };
  }, [invoice, teDhenatBiznesit, banks, currencies]);

  const mbyllur = invoice ? invoice.mbyllur !== false : true;

  // Memoized so `Fatura` (and the PDF it builds for the on-screen preview) doesn't regenerate
  // every time unrelated state changes here (opening a modal, etc.) — only when the underlying
  // invoice/business/bank/currency data actually changes.
  const faturaData = useMemo(
    () => (invoice ? buildFaturaData({ invoice, teDhenatBiznesit, banks, currencies }) : null),
    [invoice, teDhenatBiznesit, banks, currencies]
  );

  const onToggleStatus = async () => {
    if (!invoice) return;
    const mesazhi = mbyllur
      ? "Ta hap këtë faturë për redaktim?"
      : "Ta mbyll këtë faturë? Nuk do të mund ta redaktoni derisa ta hapni sërish.";
    if (!(await dialog.confirm(mesazhi, { title: "Ndrysho Statusin" }))) return;
    const updated = { ...invoice, mbyllur: !mbyllur };
    await put(STORES.invoices, updated);
    setInvoice(updated);
  };

  return (
    <>
      <PageTitle title="Fatura" />
      <NavBar />
      {loading ? (
        <div className="containerDashboardP">Duke ngarkuar...</div>
      ) : !invoice ? (
        <div className="containerDashboardP">
          <p>Nuk u gjet kjo faturë.</p>
        </div>
      ) : (
        <>
          <Fatura
            data={faturaData}
            qrCodeDataUrl={shareQr.status === "ready" ? shareQr.dataUrl : undefined}
            onBack={() => navigate("/faturat")}
            onShare={() => setShowShare(true)}
            onAddPayment={invoice.klienti?.emriBiznesit ? () => setShowPagesaModal(true) : undefined}
            mbyllur={mbyllur}
            onToggleStatus={onToggleStatus}
            onEdit={!mbyllur ? () => navigate(`/faturat/${id}/edit`) : undefined}
          />
          <ShareQrModal
            show={showShare}
            onHide={() => setShowShare(false)}
            status={shareQr.status}
            link={shareQr.link}
            dataUrl={shareQr.dataUrl}
          />
          <PagesaModal
            show={showPagesaModal}
            onHide={() => setShowPagesaModal(false)}
            klienti={invoice.klienti}
            defaultPershkrimi={`Pagesë për ${invoice.nrFatures}`}
          />
        </>
      )}
    </>
  );
}

export default FaturaView;
