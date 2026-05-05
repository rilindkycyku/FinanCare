import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Titulli from "../components/Titulli";
import SignupPDF from "../components/SignupPDF";
import { pdf } from "@react-pdf/renderer";
import { EyeIcon, EyeOffIcon, Building2, User, Phone, Mail, MapPin, Hash, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

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
  const [showPassword, setShowPassword] = useState(false);
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
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");

      const caption = `<b>Kërkesë e Re për Regjistrim</b>\n\n<b>Biznesi:</b> <i>${formData.emriBiznesit}</i>\n<b>Username:</b> <code>${formData.username}</code>\n<b>Telefon:</b> <code>${formData.nrKontaktit}</code>\n<b>Adresa:</b> ${formData.adresa}`.trim();

      const formDataTg = new FormData();
      formDataTg.append("chat_id", CHAT_ID);
      formDataTg.append("document", pdfBlob, `KerkesePerRegjistim_${formData.emriBiznesit}.pdf`);
      formDataTg.append("caption", caption);
      formDataTg.append("parse_mode", "HTML");

      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
        method: "POST",
        body: formDataTg,
      });
      return res.ok;
    } catch (err: any) {
      setError("Gabim: " + err.message);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!formData.emriBiznesit.trim() || !formData.username.trim() || !formData.password.trim() || !formData.nrKontaktit.trim() || !formData.adresa.trim()) {
      setError("Fushat me yll (*) janë të detyrueshme!");
      setLoading(false);
      return;
    }
    const sent = await sendToTelegram();
    if (!sent) { setLoading(false); return; }
    localStorage.setItem("user", JSON.stringify({ IDPartneri: Date.now(), ...formData, isPendingApproval: true }));
    setSuccess(true);
    setLoading(false);
    toast.success("Llogaria u krijua me sukses!");
    setTimeout(() => navigate("/"), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      <Titulli titulli="Regjistrim" />

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none opacity-10"
        style={{ background: "radial-gradient(ellipse, rgba(16,185,129,1) 0%, transparent 70%)" }}
      />

      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 badge-emerald rounded-full text-xs font-black uppercase tracking-widest mb-5">
            Bëhu Partner
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Regjistro <span className="gradient-text">Biznesin</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Plotëso të dhënat për të filluar bashkëpunimin tonë.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <SectionTitle title="Të dhënat Kryesore" step={1} />

              <div className="md:col-span-2">
                <InputField label="Emri i Biznesit" name="emriBiznesit" value={formData.emriBiznesit} onChange={handleChange} icon={<Building2 size={16} />} placeholder="Psh. Market ABC" required />
              </div>
              <InputField label="Username" name="username" value={formData.username} onChange={handleChange} icon={<User size={16} />} placeholder="marketi_abc" required />
              <div className="relative">
                <InputField label="Fjalëkalimi" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} icon={<EyeIcon size={16} />} placeholder="••••••••" required />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[42px] text-slate-500 hover:text-brand-400 transition-colors"
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>

              <SectionTitle title="Kontakt & Adresa" step={2} />

              <InputField label="Numri i Telefonit" name="nrKontaktit" value={formData.nrKontaktit} onChange={handleChange} icon={<Phone size={16} />} placeholder="+383 49 123 456" required />
              <InputField label="Email (Opsionale)" name="email" value={formData.email} onChange={handleChange} icon={<Mail size={16} />} placeholder="info@shembull.com" />

              <div className="md:col-span-2">
                <InputField label="Adresa Fizike" name="adresa" value={formData.adresa} onChange={handleChange} icon={<MapPin size={16} />} placeholder="Rr. Agim Ramadani, Prishtinë" required />
              </div>

              <SectionTitle title="Të dhënat Fiskale (Opsionale)" step={3} />

              <InputField label="NUI" name="nui" value={formData.nui} onChange={handleChange} icon={<Hash size={16} />} />
              <InputField label="NRF / NF" name="nrf" value={formData.nrf} onChange={handleChange} icon={<Hash size={16} />} />
              <InputField label="Numri TVSH" name="tvsh" value={formData.tvsh} onChange={handleChange} icon={<Hash size={16} />} />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 badge-red rounded-2xl text-sm font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading || success}
                className="flex-[2] btn-primary py-4.5 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
              >
                {loading ? "Duke u procesuar..." : success ? <><CheckCircle2 size={20} /> U Krye!</> : <>Regjistrohu <ArrowRight size={18} /></>}
              </motion.button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex-1 btn-ghost py-4.5 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} /> Anulo
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-slate-600 font-medium">
              Duke u regjistruar, ju pranoni Kushtet tona të Shërbimit.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function SectionTitle({ title, step }: { title: string; step: number }) {
  return (
    <div className="md:col-span-2 flex items-center gap-4 mt-4 first:mt-0">
      <div className="w-7 h-7 rounded-lg bg-brand-500/15 border border-brand-500/25 text-brand-400 flex items-center justify-center font-black text-xs shrink-0">
        {step}
      </div>
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{title}</h3>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

function InputField({ label, name, type = "text", value, onChange, icon, placeholder, required }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
        {label} {required && <span className="text-brand-400">*</span>}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-brand-400 transition-colors">
          {icon}
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="input-dark w-full pl-11 pr-4 py-3.5 rounded-xl font-bold placeholder:text-slate-700"
        />
      </div>
    </div>
  );
}
