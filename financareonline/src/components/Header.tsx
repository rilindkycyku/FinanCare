import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, LogOut, User, Menu, X, Home, Package} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import businessData from "../data/business.json";

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [location]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[rgba(3,7,18,0.92)] backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          {businessData.business.Logo && (
            <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/10 group-hover:ring-brand-500/50 transition-all duration-300">
              <img
                src={`/img/web/${businessData.business.Logo}`}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <span className="text-xl font-black tracking-tight text-white group-hover:gradient-text transition-all duration-300">
            {businessData.business.EmriIBiznesit}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" active={isActive("/")}><Home size={15} className="mr-1" />Ballina</NavLink>
          <NavLink to="/products" active={isActive("/products")}><Package size={15} className="mr-1" />Produktet</NavLink>

          <div className="w-px h-5 bg-white/10 mx-2" />

          {/* Cart */}
          <Link
            to="/checkout"
            className={`relative p-2.5 rounded-xl transition-all duration-300 ${
              isActive("/checkout")
                ? "bg-brand-500/20 text-brand-400"
                : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            <ShoppingCart size={20} />
            <AnimatePresence>
              {cart.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-brand-500 text-white text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border border-[#030712] min-w-[18px] px-1"
                >
                  {cart.length}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {user ? (
            <div className="flex items-center gap-1 ml-1">
              <Link
                to="/dashboard"
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  isActive("/dashboard")
                    ? "bg-brand-500/20 text-brand-400"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                }`}
                title="Dashboard"
              >
                <User size={20} />
              </Link>
              <button
                onClick={logout}
                className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                title="Dil"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-3 btn-primary px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest"
            >
              Identifikohu
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-[rgba(3,7,18,0.97)] backdrop-blur-2xl border-t border-white/[0.05]"
          >
            <div className="p-4 flex flex-col gap-1">
              <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)} active={isActive("/")}><Home size={18} />Ballina</MobileNavLink>
              <MobileNavLink to="/products" onClick={() => setMobileMenuOpen(false)} active={isActive("/products")}><Package size={18} />Produktet</MobileNavLink>
              <MobileNavLink to="/checkout" onClick={() => setMobileMenuOpen(false)} active={isActive("/checkout")}>
                <div className="relative">
                  <ShoppingCart size={18} />
                  {cart.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full">{cart.length}</span>
                  )}
                </div>
                Shporta
              </MobileNavLink>

              <div className="h-px bg-white/[0.07] my-2 mx-2" />

              {user ? (
                <>
                  <MobileNavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} active={isActive("/dashboard")}><User size={18} />Profili Im</MobileNavLink>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 p-4 rounded-xl text-red-400 font-bold hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={18} />
                    Dil nga llogaria
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary flex items-center justify-center p-4 rounded-xl mt-1"
                >
                  Identifikohu
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ to, children, active }: { to: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      to={to}
      className={`relative flex items-center px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
        active ? "text-brand-400" : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
      }`}
    >
      {children}
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute inset-0 bg-brand-500/10 rounded-xl border border-brand-500/20 -z-10"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}

function MobileNavLink({ to, children, onClick, active }: { to: string; children: React.ReactNode; onClick: () => void; active: boolean }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${
        active
          ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
          : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}
