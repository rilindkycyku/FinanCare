import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Fatura from "../../Components/Fatura/Fatura";
import PageTitle from "../../Components/PageTitle";
import { decodeInvoicePayload } from "../../lib/shareLink";
import { buildFaturaData } from "../../lib/invoiceView";

/** Renders an invoice decoded straight from a `#i=...` share-link payload — no IndexedDB lookup,
 * so this works on any device that opens the QR/link, even with no local FinanCareLite data. */
function SharedFatura({ encoded }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    decodeInvoicePayload(encoded).then((payload) => {
      if (cancelled) return;
      if (!payload) {
        setStatus("failed");
        return;
      }
      // `payload.inv` is the same raw invoice record shape (nested `klienti`) that IndexedDB
      // stores, so the exact same assembly function the owner's view uses applies here too —
      // this is what keeps the client/business fields lined up correctly on both views.
      setData(
        buildFaturaData({
          invoice: payload.inv || {},
          teDhenatBiznesit: payload.biz,
          banks: payload.banks,
          currencies: payload.currencies,
        })
      );
      setStatus("ready");
    });
    return () => {
      cancelled = true;
    };
  }, [encoded]);

  if (status === "loading") {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        Duke hapur faturën...
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: "100vh" }}>
        <PageTitle title="Fatura" />
        <p>Kjo lidhje faturë nuk është e vlefshme ose është dëmtuar.</p>
        <Link to="/">Hap FinanCareLite</Link>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Fatura e Ndarë" />
      <Fatura data={data} autoDownload readOnly />
    </>
  );
}

export default SharedFatura;
