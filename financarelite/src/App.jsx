import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./Pages/Styles/PremiumTheme.css";
import "./Pages/Styles/DizajniPergjithshem.css";
import Dashboard from "./Pages/Dashboard";
import Statistika from "./Pages/Statistika";
import TeDhenatBiznesit from "./Pages/TeDhenatBiznesit";
import Klientet from "./Pages/Klientet";
import Produktet from "./Pages/Produktet";
import TeDhena from "./Pages/TeDhena";
import Cilesimet from "./Pages/Cilesimet";
import ListaFaturave from "./Pages/Faturat/ListaFaturave";
import KartelaAnalitike from "./Pages/KartelaAnalitike";
import KrijoFaturen from "./Pages/Faturat/KrijoFaturen";
import FaturaView from "./Pages/Faturat/FaturaView";
import SharedFatura from "./Pages/Faturat/SharedFatura";
import { readSharePayload } from "./lib/shareLink";

function App() {
  // A `#i=...` hash means someone opened a QR/share link for one invoice — render it straight
  // away, read-only, with no IndexedDB dependency, so it works even with no local data at all.
  const [sharePayload] = useState(() => readSharePayload());

  if (sharePayload) {
    return <SharedFatura encoded={sharePayload} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/statistikat" element={<Statistika />} />
      <Route path="/te-dhenat-biznesit" element={<TeDhenatBiznesit />} />
      <Route path="/klientet" element={<Klientet />} />
      <Route path="/produktet" element={<Produktet />} />
      <Route path="/te-dhena" element={<TeDhena />} />
      <Route path="/cilesimet" element={<Cilesimet />} />
      <Route path="/faturat" element={<ListaFaturave />} />
      <Route path="/kartela-analitike" element={<KartelaAnalitike />} />
      <Route path="/faturat/re" element={<KrijoFaturen />} />
      <Route path="/faturat/:id/edit" element={<KrijoFaturen />} />
      <Route path="/faturat/:id" element={<FaturaView />} />
    </Routes>
  );
}

export default App;
