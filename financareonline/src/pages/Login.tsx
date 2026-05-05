import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Titulli from "../components/Titulli";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Zap } from "lucide-react";
import businessData from "../data/business.json";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await login(username, password);
    if (success) navigate("/");
    else setError("Username ose Password i gabuar!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 relative overflow-hidden">
      <Titulli titulli="Kyçja" />

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] -top-32 -right-32 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)" }}
        />
        <div
          className="absolute w-[400px] h-[400px] -bottom-24 -left-24 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md relative"
      >
        {/* Card */}
        <div className="glass-card rounded-3xl p-10 md:p-12">
          {/* Logo / Brand */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/25 mb-5 pulse-glow">
              <Zap size={24} className="text-brand-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Kyçuni</h2>
            <p className="text-slate-500 font-medium">
              Mirësevini në{" "}
              <span className="gradient-text font-black">{businessData.business.EmriIBiznesit}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-dark w-full pl-12 pr-5 py-4 rounded-2xl font-bold"
                  placeholder="Shkruani username..."
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark w-full pl-12 pr-5 py-4 rounded-2xl font-bold"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="badge-red rounded-xl py-3 px-4 text-sm font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="btn-primary w-full py-4.5 rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 mt-2"
              style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
            >
              Vazhdo <ArrowRight size={18} />
            </motion.button>
          </form>

          {/* Footer link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Nëse nuk keni llogari,{" "}
              <Link
                to="/signup"
                className="text-brand-400 font-black hover:text-brand-300 transition-colors underline underline-offset-4 decoration-brand-500/40"
              >
                Regjistrohu këtu
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-3/4 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.5), rgba(6,182,212,0.4), transparent)" }}
        />
      </motion.div>
    </div>
  );
}