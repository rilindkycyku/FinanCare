import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Dashboard from "./Pages/Dashboard";
import LogIn from "./Pages/LogIn";
import { useEffect } from "react";
import Aos from "aos";
import "aos/dist/aos.css";
import Statistika from "./Pages/Materiali/Shitjet/Statistika";
import TeDhenatEBiznesit from "./Pages/Gjenerale/TeDhenat/TeDhenatEBiznesit";
import ListaEProdukteve from "./Pages/Materiali/Artikujt/ListaEProdukteve";
import NjesiaMatese from "./Pages/Materiali/Artikujt/NjesiaMatese";
import TabelaEPartnereve from "./Pages/Gjenerale/Partneret/TabelaEPartnereve";
import ZbritjetEProduktit from "./Pages/Materiali/Artikujt/ZbritjetEProduktit";
import TabelaEPerdoruesve from "./Pages/Gjenerale/Stafi/TabelaEPerdoruesve";
import Rolet from "./Pages/Gjenerale/Stafi/Rolet";
import KalkulimiIMallit from "./Pages/Materiali/Hyrjet/KalkulimiIMallit";
import PerditesoTeDhenat from "./Pages/Gjenerale/TeDhenat/PerditesoTeDhenat";
import KthimiMallitTeShitur from "./Pages/Materiali/Hyrjet/KthimiMallitTeShitur";
import AsgjesimiIStokut from "./Pages/Materiali/Shitjet/AsgjesimIStokut";
import KthimIMallitTeBlere from "./Pages/Materiali/Shitjet/KthimIMallitTeBlere";
import Porosite from "./Pages/Materiali/Shitjet/Porosite";
import Ofertat from "./Pages/Materiali/Shitjet/Ofertat";
import FleteLejimet from "./Pages/Materiali/Hyrjet/FleteLejimet";
import KartelaEArtikullit from "./Pages/Materiali/Artikujt/KartelaEArtikullit";
import GrupetEProduktit from "./Pages/Materiali/Artikujt/GrupetEProduktit";
import Bankat from "./Pages/Gjenerale/TeDhenat/Bankat";
import POS from "./Pages/Materiali/Shitjet/POS";
import KartelaFinanciare from "./Pages/Gjenerale/Partneret/KartelaFinanciare";
import ShtoPagesat from "./Pages/Gjenerale/Partneret/ShtoPagesat";
import ListaShitjeveMeParagon from "./Pages/Materiali/Shitjet/ListaShitjeveMeParagon";
import LlogaritBankareBiznesit from "./Pages/Gjenerale/TeDhenat/LlogaritBankareBiznesit";
import NukKeniAkses from "./Components/TeTjera/ErrorPages/403";
import NukUGjet from "./Components/TeTjera/ErrorPages/404";
import ShikimiQmimeve from "./Pages/ShikimiQmimeve";
import Stoqet from "./Pages/Materiali/Artikujt/Stoqet";
import KalkulimiFillestarVjetor from "./Pages/Materiali/Hyrjet/KalkulimiFillestarVjetor";
import ArtikujtPaStok from "./Pages/Njoftimet/Artikujt/ArtikujtPaStok";
import AfatetESkadmit from "./Pages/Njoftimet/Artikujt/AfatetESkadmit";
import FleteLejimetAutomatike from "./Pages/Materiali/Hyrjet/FleteLejimetAutomatike";

function App() {
  useEffect(() => {
    Aos.init(
      {
        duration: 1350,
        once: true,
      },
      []
    );
  });

  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/Dashboard" element={<Dashboard key={Date.now()} />} />
        <Route path="/LogIn" element={<LogIn />} />
        <Route path="/Statistika" element={<Statistika />} />
        <Route path="/TeDhenatEBiznesit" element={<TeDhenatEBiznesit />} />
        <Route path="/Produktet" element={<ListaEProdukteve />} />
        <Route path="/NjesiaMatese" element={<NjesiaMatese />} />
        <Route path="/TabelaEPartnereve" element={<TabelaEPartnereve />} />
        <Route path="/ZbritjetEProduktit" element={<ZbritjetEProduktit />} />
        <Route path="/Stafi" element={<TabelaEPerdoruesve />} />
        <Route path="/Rolet" element={<Rolet />} />
        <Route path="/KalkulimiIMallit" element={<KalkulimiIMallit />} />
        <Route path="/PerditesoTeDhenat" element={<PerditesoTeDhenat />} />
        <Route
          path="/KthimiMallitTeShitur"
          element={<KthimiMallitTeShitur />}
        />
        <Route path="/AsgjesimiIStokut" element={<AsgjesimiIStokut />} />
        <Route path="/KthimIMallitTeBlere" element={<KthimIMallitTeBlere />} />
        <Route path="/Porosite" element={<Porosite />} />
        <Route path="/Ofertat" element={<Ofertat />} />
        <Route path="/FleteLejimet" element={<FleteLejimet />} />
        <Route path="/KartelaEArtikullit" element={<KartelaEArtikullit />} />
        <Route path="/GrupetEProduktit" element={<GrupetEProduktit />} />
        <Route path="/Bankat" element={<Bankat />} />
        <Route path="/POS" element={<POS />} />
        <Route path="/KartelaFinanciare" element={<KartelaFinanciare />} />
        <Route path="/ShtoPagesat" element={<ShtoPagesat />} />
        <Route
          path="/ListaShitjeveMeParagon"
          element={<ListaShitjeveMeParagon />}
        />
        <Route
          path="/LlogaritBankareBiznesit"
          element={<LlogaritBankareBiznesit />}
        />
        <Route path="/ShikimiQmimeve" element={<ShikimiQmimeve />} />
        <Route path="/Stoqet" element={<Stoqet />} />
        <Route path="/KalkulimiFillestarVjetor" element={<KalkulimiFillestarVjetor />} />
        <Route path="/ArtikujtPaStok" element={<ArtikujtPaStok />} />
        <Route path="/AfatetESkadmit" element={<AfatetESkadmit />} />
        <Route path="/FleteLejimetAutomatike" element={<FleteLejimetAutomatike/>} />

        <Route path="/403" element={<NukKeniAkses />} />
        <Route path="/404" element={<NukUGjet />} />
      </Routes>
    </div>
  );
}

export default App;
