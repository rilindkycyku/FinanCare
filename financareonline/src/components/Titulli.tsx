// src/components/Titulli.tsx → VERSIONI FINAL: ÇKYÇ VETËM NËSE KA USER TË VJETËR TË PAVLEFSHËM
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "@dr.pogodin/react-helmet";
import businessData from "../data/business.json";
import { runIntegrityCheck } from "./VerifikimiTeDhenave"; // rrugën tënde të saktë
import { toast } from "react-hot-toast";
import { ShieldAlert } from "lucide-react";

function Titulli({ titulli }: { titulli?: string }) {
  const location = useLocation();
  const navigate = useNavigate();

  const hasLoggedOut = useRef(false);

  const siteName = businessData?.business?.EmriIBiznesit?.trim() || "FinanCare";
  const fullTitle = titulli?.trim() ? `${titulli.trim()} | ${siteName}` : siteName;

  useEffect(() => {
    // Mos kontrollo fare nëse jemi në /login
    if (location.pathname === "/login") return;

    // LEXO USERIN NGA localStorage
    const savedUserJson = localStorage.getItem("user");
    const hasSavedUser = !!savedUserJson;

    // Nëse NUK ka user fare → nuk ka çfarë të kontrollojë → dil menjëherë
    if (!hasSavedUser) return;

    // Vetëm nëse ka user → ekzekuto kontrollin e integritetit
    const { didLogout } = runIntegrityCheck();

    // 1. LOGOUT – vetëm nëse ka pasur user dhe tani është i pavlefshëm
    if (didLogout && !hasLoggedOut.current) {
      hasLoggedOut.current = true;
      toast.error("Sesioni përfundoi – të dhënat tuaja u përditësuan nga administratori", {
        duration: 7000,
        icon: <ShieldAlert className="w-6 h-6 text-red-400" />,
      });
      navigate("/login", { replace: true });
      return;
    }
  }, [location.pathname, navigate]);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={`${titulli || "Faqja kryesore"} - ${siteName}`} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:site_name" content={siteName} />
    </Helmet>
  );
}

export default Titulli;