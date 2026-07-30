import { lazy, Suspense, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import "./Pages/Styles/PremiumTheme.css";
import "./Pages/Styles/DizajniPergjithshem.css";
import { readSharePayload } from "./lib/shareLink";
import PwaUpdater from "./Components/PwaUpdater";

// Split per route. Nearly every heavy dependency this app has belongs to one screen — the PDF
// renderer to the invoice views, pdf.js to the on-screen preview, the chart/analysis pages to
// themselves — and bundling them together meant the dashboard paid for all of it before showing
// a single number. Each page now arrives when it's opened.
const Dashboard = lazy(() => import("./Pages/Dashboard"));
const Statistika = lazy(() => import("./Pages/Statistika"));
const TeDhenatBiznesit = lazy(() => import("./Pages/TeDhenatBiznesit"));
const Klientet = lazy(() => import("./Pages/Klientet"));
const Produktet = lazy(() => import("./Pages/Produktet"));
const TeDhena = lazy(() => import("./Pages/TeDhena"));
const Cilesimet = lazy(() => import("./Pages/Cilesimet"));
const ListaFaturave = lazy(() => import("./Pages/Faturat/ListaFaturave"));
const KartelaAnalitike = lazy(() => import("./Pages/KartelaAnalitike"));
const KrijoFaturen = lazy(() => import("./Pages/Faturat/KrijoFaturen"));
const FaturaView = lazy(() => import("./Pages/Faturat/FaturaView"));
const SharedFatura = lazy(() => import("./Pages/Faturat/SharedFatura"));

function Loading({ mesazhi = "Duke ngarkuar..." }) {
  return <div className="containerDashboardP">{mesazhi}</div>;
}

function App() {
  // A `#i=...` hash means someone opened a QR/share link for one invoice — render it straight
  // away, read-only, with no IndexedDB dependency, so it works even with no local data at all.
  const [sharePayload] = useState(() => readSharePayload());

  if (sharePayload) {
    return (
      <>
        <Suspense fallback={<Loading mesazhi="Duke hapur faturën..." />}>
          <SharedFatura encoded={sharePayload} />
        </Suspense>
        <PwaUpdater />
        <Analytics />
      </>
    );
  }

  return (
    <>
      <Suspense fallback={<Loading />}>
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
      </Suspense>
      <PwaUpdater />
      <Analytics />
    </>
  );
}

export default App;
