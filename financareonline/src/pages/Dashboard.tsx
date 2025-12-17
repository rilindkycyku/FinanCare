// src/pages/Dashboard.tsx
import Titulli from "../components/Titulli";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Building,
  LogOut,
  FileText,
  CreditCard,
  Store,
  Tag,
  Percent,
  Gift,
  Hash,
} from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) return null;

  // Fallbacks të sigurta
  const emriBiznesit = user.EmriBiznesit || user.Username || "Partner";

  // Rabati: normalizo në 0 nëse është undefined
  const rabatiNumerik = user.Rabati ?? 0; // Kjo është çelësi!
  const rabatiTekst = rabatiNumerik > 0 ? `${rabatiNumerik}%` : "Pa rabat";
  const kaRabat = rabatiNumerik > 0;

  return (
    <>
      <Titulli titulli="Paneli Administrativ" />
      <div className="max-w-8xl mx-auto p-6 mt-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold">Paneli i Partnerit</h1>
                <p className="text-xl mt-2 opacity-90">
                  Mirë se erdhe,{" "}
                  <span className="font-bold">{emriBiznesit}!</span>
                </p>
                {kaRabat && (
                  <p className="text-lg mt-3 bg-white/20 inline-block px-4 py-2 rounded-lg">
                    <Percent className="inline mr-2" size={20} />
                    Ke rabat aktiv: <strong>{rabatiNumerik}%</strong>
                  </p>
                )}
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-3 bg-white/20 backdrop-blur px-6 py-3 rounded-xl hover:bg-white/30 transition"
              >
                <LogOut size={22} />
                <span className="font-medium">Dil nga Llogaria</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Emri i Biznesit & Username */}
            <InfoCard icon={Store} label="Emri i Biznesit" value={emriBiznesit} />
            <InfoCard icon={User} label="Username" value={user.Username || "-"} />
            <InfoCard icon={Hash} label="Shkurtësia" value={user.ShkurtesaPartnerit || "-"} />

            {/* Identifikues Fiskalë */}
            <InfoCard icon={FileText} label="NUI" value={user.NUI || "Nuk është vendosur"} />
            <InfoCard icon={CreditCard} label="NRF" value={user.NRF || "Nuk është vendosur"} />
            <InfoCard icon={FileText} label="TVSH" value={user.TVSH || "Nuk është vendosur"} />

            {/* Kontakt */}
            <InfoCard icon={Building} label="Adresa" value={user.Adresa || "Nuk është vendosur"} />
            <InfoCard icon={Phone} label="Telefon" value={user.NrKontaktit || "Nuk është vendosur"} />
            <InfoCard icon={Mail} label="Email" value={user.Email || "Nuk është vendosur"} />

            {/* Programi i Bonusit / Rabatit */}
            <InfoCard
              icon={Percent}
              label="Rabati Juaj"
              value={rabatiTekst}
              highlight={kaRabat}
            />
            <InfoCard
              icon={Gift}
              label="Lloji i Kartelës"
              value={user.LlojiKarteles || "Pa kartelë"}
              highlight={!!user.LlojiKarteles}
            />
            <InfoCard
              icon={Tag}
              label="Kodi i Kartelës"
              value={user.KodiKartela || "-"}
              highlight={!!user.KodiKartela}
            />
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 text-center text-gray-600 border-t">
            <p>Të gjitha të dhënat janë të sinkronizuara me sistemin qendror.</p>
            <p className="text-sm mt-2">
              Përditësimi i fundit: {new Date().toLocaleString("sq-AL")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// InfoCard me highlight për benefitet aktive
function InfoCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: any;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-6 border transition-all ${
        highlight
          ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 shadow-md"
          : "bg-gray-50 border-gray-200 hover:border-blue-300"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`p-3 rounded-lg ${
            highlight
              ? "bg-emerald-600 text-white"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          <Icon size={28} />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p
            className={`font-bold text-lg mt-1 ${
              highlight ? "text-emerald-800" : "text-gray-800"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}