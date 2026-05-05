import Titulli from "../components/Titulli";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Building, LogOut, FileText, CreditCard,
  Store, Tag, Percent, Gift, Hash, ShieldCheck
} from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const emriBiznesit = user.EmriBiznesit || user.Username || "Partner";
  const rabatiNumerik = user.Rabati ?? 0;

  return (
    <div className="pt-24 min-h-screen pb-24 relative overflow-hidden">
      <Titulli titulli="Paneli Administrativ" />

      {/* Background ambient */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-[0.06]"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,1) 0%, transparent 70%)" }}
      />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none opacity-[0.05]"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,1) 0%, transparent 70%)" }}
      />

      <div className="max-w-5xl mx-auto px-6">

        {/* ── PROFILE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 md:p-10 mb-6 relative overflow-hidden"
        >
          {/* Decorative gradient line */}
          <div
            className="absolute top-0 inset-x-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.5), rgba(6,182,212,0.4), transparent)" }}
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-brand-400">
                  <Store size={32} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand-500 border-2 border-[#030712] flex items-center justify-center">
                  <ShieldCheck size={10} className="text-white" />
                </div>
              </div>
              <div>
                <span className="badge-emerald rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest mb-2 inline-flex items-center gap-1.5">
                  <ShieldCheck size={9} /> Llogari Aktive
                </span>
                <h1 className="text-2xl font-black text-white mt-1">{emriBiznesit}</h1>
                <p className="text-slate-500 font-medium text-sm">Informacionet e llogarisë tuaj të partnerit</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-3 px-6 py-3 btn-ghost rounded-xl font-black text-xs uppercase tracking-widest hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
            >
              <LogOut size={16} />
              Dil nga llogaria
            </button>
          </div>

          {/* Stats */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/[0.05]">
            <StatCard icon={<Percent size={18} />} label="Rabat i Aplikuar" value={`${rabatiNumerik}%`} color="brand" />
            <StatCard icon={<Gift size={18} />} label="Lloji i Kartelës" value={user.LlojiKarteles || "Standard"} color="cyan" />
          </div>
        </motion.div>

        {/* ── INFO GRID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-8 md:p-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 rounded-full" style={{ background: "linear-gradient(180deg, #10b981, #06b6d4)" }} />
            <h3 className="text-xl font-black text-white">Të Dhënat e Biznesit</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem icon={<User size={16} />} label="Username" value={user.Username} />
            <InfoItem icon={<Hash size={16} />} label="Shkurtesa" value={user.ShkurtesaPartnerit || "—"} />
            <InfoItem icon={<Building size={16} />} label="Adresa" value={user.Adresa} />
            <InfoItem icon={<Phone size={16} />} label="Telefon" value={user.NrKontaktit} />
            <InfoItem icon={<Mail size={16} />} label="Email" value={user.Email || "—"} />
            <InfoItem icon={<Tag size={16} />} label="Kodi i Kartelës" value={user.KodiKartela || "—"} />
            <InfoItem icon={<FileText size={16} />} label="NUI" value={user.NUI || "Pa vendosur"} />
            <InfoItem icon={<CreditCard size={16} />} label="NRF" value={user.NRF || "Pa vendosur"} />
            <InfoItem icon={<FileText size={16} />} label="TVSH" value={user.TVSH || "Pa vendosur"} />
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colorMap: any = {
    brand: "bg-brand-500/10 border-brand-500/20 text-brand-400",
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  };
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-black text-white">{value}</p>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: any) {
  return (
    <div className="flex gap-3 group p-4 rounded-xl hover:bg-white/[0.03] transition-all duration-300">
      <div className="w-9 h-9 bg-white/[0.04] border border-white/[0.07] rounded-xl flex items-center justify-center text-slate-600 group-hover:text-brand-400 group-hover:border-brand-500/25 group-hover:bg-brand-500/08 transition-all shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-white truncate">{value}</p>
      </div>
    </div>
  );
}