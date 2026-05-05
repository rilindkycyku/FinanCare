import { useEffect, useState, useMemo } from "react";
import productsData from "../data/products.json";
import categoriesData from "../data/categories.json";
import ProductCard from "../components/ProductCard";
import { getDisplayPrice } from "../context/CartContext";
import type { Produkti } from "../types/index";
import Titulli from "../components/Titulli";
import { Search, Grid, List, PackageSearch, X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Products() {
  const [products, setProducts] = useState<Produkti[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const activeProducts = (productsData as any[]).filter(
      (p: any) => p.isDeleted !== "true" && p.isDeleted !== true
    );
    const enhancedProducts = activeProducts.map((product: any) => {
      const finalPrice = getDisplayPrice(product as Produkti);
      const discount = product.ZbritjaQmimitProduktit;
      let hasActiveDiscount = false;
      let discountPercentage = 0;
      if (discount && discount.Rabati > 0) {
        if (!discount.DataSkadimit || new Date() <= new Date(discount.DataSkadimit)) {
          hasActiveDiscount = true;
          discountPercentage = discount.Rabati;
        }
      }
      return { ...product, QmimiFinal: finalPrice, isDiscounted: hasActiveDiscount, discountPercentage };
    }) as Produkti[];
    setProducts(enhancedProducts);
    setCategories(categoriesData);
  }, []);

  const filtered = useMemo(() => {
    let result = products;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.EmriProduktit.toLowerCase().includes(term) ||
          p.Barkodi?.toLowerCase().includes(term)
      );
    }
    if (selectedCategory !== 0) {
      result = result.filter((p) => Number(p.IDGrupiProduktit) === selectedCategory);
    }
    return result;
  }, [products, selectedCategory, searchTerm]);

  return (
    <div className="pt-24 min-h-screen pb-24">
      <Titulli titulli="Produktet" />

      {/* Ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none opacity-[0.04] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,1) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
          <div>
            <p className="text-brand-400 text-xs font-black uppercase tracking-widest mb-2">Katalogu</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Produktet</h1>
            <p className="text-slate-500 font-medium mt-2">
              <span className="text-brand-400 font-black">{filtered.length}</span> artikuj të listuar
            </p>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] p-1 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                viewMode === "grid"
                  ? "bg-brand-500/20 text-brand-400 border border-brand-500/25"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                viewMode === "list"
                  ? "bg-brand-500/20 text-brand-400 border border-brand-500/25"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative mb-6"
        >
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Kërko sipas emrit ose barkodit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-dark w-full pl-14 pr-14 py-5 rounded-2xl text-lg font-bold"
          />
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/[0.07] hover:bg-white/[0.12] text-slate-400 hover:text-white rounded-lg transition-all"
              >
                <X size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-3 px-1">
            <SlidersHorizontal size={13} className="text-slate-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kategoritë</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            <FilterButton
              active={selectedCategory === 0}
              onClick={() => setSelectedCategory(0)}
              label="Të Gjitha"
            />
            {categories.map((cat) => (
              <FilterButton
                key={cat.IDGrupiProduktit}
                active={selectedCategory === Number(cat.IDGrupiProduktit)}
                onClick={() => setSelectedCategory(Number(cat.IDGrupiProduktit))}
                label={cat.GrupiIProduktit}
              />
            ))}
          </div>
        </motion.div>

        {/* Products grid / list */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card rounded-3xl flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-6">
                <PackageSearch size={32} className="text-slate-600" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Asgjë nuk u gjet</h3>
              <p className="text-slate-500 font-medium text-sm mb-8">Provoni të ndryshoni termin e kërkimit ose kategorinë</p>
              <button
                onClick={() => { setSelectedCategory(0); setSearchTerm(""); }}
                className="btn-primary px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest"
              >
                Pastro filtrat
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5"
                  : "flex flex-col gap-3"
              }
            >
              {filtered.map((product) => (
                <ProductCard key={product.ProduktiID} product={product} viewMode={viewMode} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all duration-300 border ${
        active
          ? "bg-brand-500/15 border-brand-500/35 text-brand-400"
          : "bg-white/[0.03] border-white/[0.07] text-slate-500 hover:bg-white/[0.07] hover:text-slate-300 hover:border-white/15"
      }`}
    >
      {label}
    </button>
  );
}