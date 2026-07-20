import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../../Components/NavBar";
import PageTitle from "../../Components/PageTitle";
import Fatura from "../../Components/Fatura/Fatura";
import ShareQrModal from "../../Components/ShareQrModal";
import { getOne, getBusinessDetails, getAll, STORES } from "../../lib/db";
import { buildFaturaData } from "../../lib/invoiceView";

function FaturaView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [teDhenatBiznesit, setTeDhenatBiznesit] = useState(null);
  const [banks, setBanks] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [showShare, setShowShare] = useState(false);
  const [loading, setLoading] = useState(true);

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
            data={buildFaturaData({ invoice, teDhenatBiznesit, banks, currencies })}
            onBack={() => navigate("/faturat")}
            onShare={() => setShowShare(true)}
          />
          <ShareQrModal
            show={showShare}
            onHide={() => setShowShare(false)}
            teDhenatBiznesit={teDhenatBiznesit}
            banks={banks}
            currencies={currencies}
            invoice={invoice}
          />
        </>
      )}
    </>
  );
}

export default FaturaView;
