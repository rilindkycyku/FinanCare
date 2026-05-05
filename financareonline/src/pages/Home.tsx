import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import productsData from "../data/products.json";
import businessData from "../data/business.json";
import ProductCard from "../components/ProductCard";
import { getDisplayPrice } from "../context/CartContext";
import type { Produkti } from "../types";
import Titulli from "../components/Titulli";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Package, TrendingUp } from "lucide-react";

const isProductDiscountActive = (product: any): boolean => {
  const discount = product.ZbritjaQmimitProduktit;
  if (!discount || discount.Rabati <= 0) return false;
  if (discount.DataSkadimit) {
    const expiryDate = new Date(discount.DataSkadimit);
    if (new Date() > expiryDate) return false;
  }
  return true;
};

const features = [
  { icon: <Zap size={20} />, title: "Shpërndarje e shpejtë", desc: "Dërgesa brenda 24 orësh" },
  { icon: <ShieldCheck size={20} />, title: "Garancia cilësisë", desc: "Produkte të certifikuara" },
  { icon: <TrendingUp size={20} />, title: "Çmime partneriale", desc: "Rabate eksluzive B2B" },
  { icon: <Package size={20} />, title: "Katalog i gjerë", desc: "Mijëra produkte disponibël" },
];

export default function Home() {
  const [discountedProducts, setDiscountedProducts] = useState<Produkti[]>([]);
  const [newProducts, setNewProducts] = useState<Produkti[]>([]);

  useEffect(() => {
    const activeProducts = (productsData as any[]).filter((p: any) => p.isDeleted !== "true");
    const processed = activeProducts.map((p: any) => ({
      ...p,
      QmimiFinal: getDisplayPrice(p),
      isDiscounted: isProductDiscountActive(p),
      discountPercentage: isProductDiscountActive(p) ? Number(p.ZbritjaQmimitProduktit?.Rabati ?? 0) : 0,
    }));
    setDiscountedProducts(processed.filter(p => p.isDiscounted).slice(0, 12));
    setNewProducts(processed.sort((a: any, b: any) => b.ProduktiID - a.ProduktiID).slice(0, 12));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const } },
  };

  return (
    <div className="pt-16">
      <Titulli titulli="Ballina" />

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[600px] h-[600px] -top-40 -left-40 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)" }}
          />
          <div
            className="absolute w-[500px] h-[500px] top-1/2 -right-20 -translate-y-1/2 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)" }}
          />
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full badge-emerald text-xs font-black uppercase tracking-widest mb-8"
            >
              <Sparkles size={12} />
              <span>Mirësevini në {businessData.business.EmriIBiznesit}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black leading-[1.02] tracking-tighter mb-8 text-white"
            >
              Platforma juaj{" "}
              <span className="gradient-text">B2B</span>
              <br />
              <span className="text-white/60">e besuar.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-xl font-medium max-w-xl mb-12 leading-relaxed"
            >
              Zbuloni gamën tonë të gjerë të produkteve me çmimet më të volitshme, shpërndarje të shpejtë dhe partner të besueshëm.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/products"
                className="btn-primary inline-flex items-center justify-center gap-3 px-10 py-4.5 rounded-2xl text-sm animate-gradient"
                style={{ background: "linear-gradient(135deg, #10b981, #06b6d4, #10b981)", backgroundSize: "200% 200%" }}
              >
                Shiko Katalogun <ArrowRight size={18} />
              </Link>
              <Link
                to="/signup"
                className="btn-ghost inline-flex items-center justify-center gap-3 px-10 py-4.5 rounded-2xl text-sm font-black uppercase tracking-widest"
              >
                Bëhu Partner
              </Link>
            </motion.div>
          </div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20"
          >
            {features.map((f, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 hover:border-brand-500/20 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-3">
                  {f.icon}
                </div>
                <p className="font-black text-white text-sm mb-1">{f.title}</p>
                <p className="text-slate-500 text-xs">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SPECIAL OFFERS ── */}
      {discountedProducts.length > 0 && (
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeader title="Ofertat Speciale" subtitle="Zbritje ekskluzive — vetëm për partnerët" link="/products" badge="🔥 HOT" />
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {discountedProducts.map((product) => (
                <motion.div key={product.ProduktiID} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── NEW ARRIVALS ── */}
      <section className="py-24 relative">
        {/* Section glow */}
        <div
          className="absolute inset-x-0 top-0 h-px opacity-40"
          style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.5), rgba(6,182,212,0.5), transparent)" }}
        />
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader title="Produktet e Fundit" subtitle="Shtimet më të reja në katalog" link="/products" badge="✨ NEW" />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {newProducts.map((product) => (
              <motion.div key={product.ProduktiID} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative border-t border-white/[0.05] py-16">
        <div
          className="absolute inset-x-0 top-0 h-px opacity-60"
          style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.4), rgba(6,182,212,0.3), transparent)" }}
        />
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Link
            to="/"
            className="inline-block text-2xl font-black gradient-text mb-6"
          >
            {businessData.business.EmriIBiznesit}
          </Link>
          <div className="flex justify-center flex-wrap gap-8 mb-10">
            {[
              { to: "/", label: "Ballina" },
              { to: "/products", label: "Produktet" },
              { to: "/checkout", label: "Shporta" },
              { to: "/login", label: "Kyçu" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-slate-500 hover:text-brand-400 font-bold text-xs uppercase tracking-widest transition-colors duration-300"
              >
                {label}
              </Link>
            ))}
          </div>
          <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} {businessData.business.EmriIBiznesit} • Të gjitha të drejtat e rezervuara
          </p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ title, subtitle, link, badge }: { title: string; subtitle: string; link: string; badge: string }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-cyan text-[10px] font-black uppercase tracking-widest mb-3">
          {badge}
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{title}</h2>
        <p className="text-slate-500 font-medium mt-1">{subtitle}</p>
      </div>
      <Link
        to={link}
        className="flex items-center gap-2 text-brand-400 hover:text-brand-300 font-black text-xs uppercase tracking-widest transition-colors group"
      >
        Shiko të gjitha
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
      </Link>
    </div>
  );
}