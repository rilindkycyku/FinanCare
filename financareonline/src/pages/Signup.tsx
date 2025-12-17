import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Titulli from "../components/Titulli";
import SignupPDF from "../components/SignupPDF";
import { pdf } from "@react-pdf/renderer";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import toast from "react-hot-toast";

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

export default function Signup() {
  const [formData, setFormData] = useState({
    emriBiznesit: "",
    username: "",
    password: "",
    email: "",
    nrKontaktit: "",
    adresa: "",
    nui: "",
    nrf: "",
    tvsh: "",
  });
  const [showPassword, setShowPassword] = useState(false); // NEW STATE
  const togglePassword = () => setShowPassword(!showPassword);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendToTelegram = async () => {
    if (!BOT_TOKEN || !CHAT_ID) {
      setError("Konfigurimi i Telegram mungon!");
      return false;
    }

    try {
      const pdfStream = await pdf(<SignupPDF data={formData} />);
      const pdfBlob = await pdfStream.toBlob();

      // Hap PDF në tab të ri (për përdoruesin)
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");

      const caption = `
<b>Kërkesë e Re për Regjistrim</b>

<b>Biznesi:</b> <i>${formData.emriBiznesit}</i>
<b>Username:</b> <code>${formData.username}</code>
<b>Email:</b> <i>${formData.email || "-"}</i>
<b>Telefon:</b> <code>${formData.nrKontaktit}</code>
<b>Adresa:</b> ${formData.adresa}

<b>NUI:</b> <code>${formData.nui || "-"}</code> • <b>NRF:</b> <code>${
        formData.nrf || "-"
      }</code> • <b>TVSH:</b> <code>${formData.tvsh || "-"}</code>

Data: <b>${new Date().toLocaleDateString("sq-AL")}</b>
`.trim();

      const formDataTg = new FormData();
      formDataTg.append("chat_id", CHAT_ID);
      formDataTg.append(
        "document",
        pdfBlob,
        `KerkesePerRegjistim_${formData.emriBiznesit}.pdf`
      );
      formDataTg.append("caption", caption);
      formDataTg.append("parse_mode", "HTML");

      const res = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
        {
          method: "POST",
          body: formDataTg,
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.description || "Gabim nga Telegram");
      }

      return true;
    } catch (err: any) {
      console.error(err);
      setError("Gabim: " + err.message);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    if (
      !formData.emriBiznesit.trim() ||
      !formData.username.trim() ||
      !formData.password.trim() ||
      !formData.nrKontaktit.trim() ||
      !formData.adresa.trim()
    ) {
      setError("Fushat me yll (*) janë të detyrueshme!");
      setLoading(false);
      return;
    }

      const sent = await sendToTelegram();
      if (!sent) {
        setLoading(false);
        return;
      }

    // KY ËSHTË MOMENTI I RI – KRIJO PËRDORUES TË PËRKOHSHËM!
    const pendingUser = {
      IDPartneri: Date.now(), // ID e përkohshme
      EmriBiznesit: formData.emriBiznesit,
      Username: formData.username,
      Password: formData.password, // e ruajmë të enkriptuar më vonë, por për tani ok
      Email: formData.email || null,
      NrKontaktit: formData.nrKontaktit,
      Adresa: formData.adresa,
      NUI: formData.nui || null,
      NRF: formData.nrf || null,
      TVSH: formData.tvsh || null,
      IDKategoritEPartnerit: 0, // 0 = në pritje (ose 999)
      EmriKategoris: "Në Pritje të Miratimit",
      isPendingApproval: true, // KY ËSHTË ÇELËSI!
    };

    // Ruaj si përdorues aktiv (që të mund të kyçet menjëherë)
    localStorage.setItem("user", JSON.stringify(pendingUser));

    setSuccess(true);
    setLoading(false);

    toast.success(
  <div className="flex items-center gap-4">
    <div className="relative">
      <svg
        className="w-12 h-12 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75"></div>
    </div>
    <div>
      <p className="font-bold text-lg">Llogaria u krijua me sukses!</p>
      <p className="text-sm opacity-90">Tani mund të porositësh menjëherë</p>
    </div>
  </div>,
  {
    duration: 6000,
    style: {
      background: "linear-gradient(135deg, #10b981, #059669)",
      color: "white",
      borderRadius: "16px",
      padding: "18px 24px",
      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
      border: "none",
    },
    icon: null, // e heqim sepse e kemi vetë SVG-në
  }
);

    // Ridrejto te faqja kryesore pas 2 sekondash
    setTimeout(() => navigate("/"), 2000);
  };

  return (
    <>
      <Titulli titulli="Regjistrim" />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-3">
              Regjistro Biznesin Tënd
            </h1>
            <p className="text-lg text-gray-700">
              Plotëso të dhënat dhe kërkesa do të shqyrtohet brenda 48 orëve
            </p>
          </div>

          {success && (
            <div className="mb-8 p-6 bg-green-100 border-2 border-green-500 rounded-xl text-center text-green-800">
              <p className="text-2xl font-bold mb-2">
                Kërkesa u dërgua me sukses!
              </p>
              <p className="text-lg">
                Do të njoftoheni në email sapo llogaria të aktivizohet.
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-10">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {/* FUSHAT E DETYRUARA */}
                <div className="md:col-span-2">
                  <label className="block text-lg font-semibold text-gray-800 mb-2">
                    Emri i Biznesit <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="emriBiznesit"
                    value={formData.emriBiznesit}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition"
                    placeholder="Market ABC sh.p.k. | Filan Fisteku"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-2">
                    Username <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    placeholder="marketi_abc"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-2">
                    Fjalëkalimi <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 pr-14 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={togglePassword}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600 hover:text-blue-600 transition">
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-2">
                    Nr. Kontaktit <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="nrKontaktit"
                    value={formData.nrKontaktit}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    placeholder="+383 49 123 456"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    placeholder="info@biznesi.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-lg font-semibold text-gray-800 mb-2">
                    Adresa <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="adresa"
                    value={formData.adresa}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                    placeholder="Rr. Agim Ramadani, Prishtinë"
                  />
                </div>

                {/* FUSHAT OPSIONALE */}
                <div>
                  <label className="block text-gray-600 mb-2">NUI</label>
                  <input
                    type="text"
                    name="nui"
                    value={formData.nui}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-2">NRF / NF</label>
                  <input
                    type="text"
                    name="nrf"
                    value={formData.nrf}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-2">Numri TVSH</label>
                  <input
                    type="text"
                    name="tvsh"
                    value={formData.tvsh}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl"
                  />
                </div>

                {error && (
                  <div className="md:col-span-2 p-5 bg-red-100 border-2 border-red-500 text-red-800 rounded-xl text-center font-medium">
                    {error}
                  </div>
                )}

                <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={loading || success}
                    className={`flex-1 py-5 py-5 text-xl font-bold text-white rounded-xl transition transform hover:scale-105 ${
                      loading || success
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-green-700 shadow-lg hover:shadow-xl"
                    }`}>
                    {loading
                      ? "Duke dërguar..."
                      : success
                      ? "U Dërgua!"
                      : "Dërgo Kërkesën"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="px-8 py-5 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition">
                    Kthehu te Kyçja
                  </button>
                </div>
              </form>

              <p className="text-center text-sm text-gray-500 mt-10">
                <strong>Shënim:</strong> Pas dërgimit, do të hapet një dritare
                me PDF-në që u dërgua te administratori.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
